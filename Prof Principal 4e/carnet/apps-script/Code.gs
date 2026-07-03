/**
 * Carnet de bord 4G (suivi du règlement) — backend Apps Script.
 * Onglets : Codes (code|pseudo|role — mêmes codes que le Hub), Remarques, Config.
 * À chaque report d'élève : e-mail automatique au PP avec récapitulatif + total.
 * Alerte équipe : uniquement sur action volontaire du prof (bouton), jamais automatique.
 */

var F_CODES = "Codes";
var F_REMARQUES = "Remarques";
var F_CONFIG = "Config";
var SEUIL = 5;

/** À exécuter UNE FOIS à la main : crée les onglets. Renseigner ensuite Config. */
function initialiser() {
  var c = SpreadsheetApp.getActiveSpreadsheet();
  if (!c.getSheetByName(F_CODES)) c.insertSheet(F_CODES).appendRow(["code", "pseudo", "role"]);
  if (!c.getSheetByName(F_REMARQUES))
    c.insertSheet(F_REMARQUES).appendRow(["id", "ts", "pseudo", "date", "matiere", "categorie", "precision", "parents"]);
  if (!c.getSheetByName(F_CONFIG)) {
    var cfg = c.insertSheet(F_CONFIG);
    cfg.appendRow(["cle", "valeur"]);
    cfg.appendRow(["emailProf", "blanchard.romain@stpierre85.com"]);
    cfg.appendRow(["emailsEquipe", "adresse1@stpierre85.com, adresse2@stpierre85.com"]);
  }
}

function doPost(e) {
  var reponse;
  try {
    var d = JSON.parse(e.postData.contents);
    var u = trouverUtilisateur(d.code);
    if (d.action === "login") {
      reponse = u ? { ok: true, pseudo: u.pseudo, role: u.role } : { ok: false, erreur: "Code inconnu. Vérifie ta carte." };
    } else if (!u) {
      reponse = { ok: false, erreur: "Code invalide." };
    } else {
      var verrou = LockService.getScriptLock();
      verrou.waitLock(10000);
      try { reponse = traiter(d, u); } finally { verrou.releaseLock(); }
    }
  } catch (err) {
    reponse = { ok: false, erreur: "Requête invalide." };
  }
  return ContentService.createTextOutput(JSON.stringify(reponse)).setMimeType(ContentService.MimeType.JSON);
}

function trouverUtilisateur(code) {
  if (!code) return null;
  var lignes = feuille(F_CODES).getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++)
    if (String(lignes[i][0]).trim().toUpperCase() === String(code).trim().toUpperCase())
      return { code: lignes[i][0], pseudo: lignes[i][1], role: lignes[i][2] };
  return null;
}

function config(cle) {
  var lignes = feuille(F_CONFIG).getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++) if (lignes[i][0] === cle) return String(lignes[i][1]);
  return "";
}

function traiter(d, u) {
  switch (d.action) {
    case "liste": return lister(u);
    case "ajouter": return ajouter(d, u);
    case "alerter":
      if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
      return alerter(d.pseudo);
    default: return { ok: false, erreur: "Action inconnue." };
  }
}

function remarquesDe(pseudo) {
  return feuille(F_REMARQUES).getDataRange().getValues().slice(1)
    .filter(function (l) { return !pseudo || l[2] === pseudo; })
    .map(function (l) { return { id: l[0], ts: l[1], pseudo: l[2], date: l[3], matiere: l[4], categorie: l[5], precision: l[6], parents: l[7] }; });
}

function lister(u) {
  return { ok: true, remarques: remarquesDe(u.role === "prof" ? null : u.pseudo) };
}

function ajouter(d, u) {
  if (u.role !== "eleve") return { ok: false, erreur: "Report réservé aux élèves." };
  var precision = String(d.precision || "").slice(0, 140);
  feuille(F_REMARQUES).appendRow([
    Utilities.getUuid().slice(0, 8), Date.now(), u.pseudo,
    String(d.date || ""), String(d.matiere || ""), String(d.categorie || ""), precision, String(d.parents || "")
  ]);
  try { notifierProf(u.pseudo); } catch (err) { /* l'e-mail ne doit jamais bloquer le report */ }
  return { ok: true };
}

function recap(pseudo) {
  var toutes = remarquesDe(pseudo).sort(function (a, b) { return b.ts - a.ts; });
  var travail = toutes.filter(function (r) { return String(r.categorie).indexOf("Travail") === 0; }).length;
  var lignes = toutes.map(function (r) {
    return "- " + r.date + " · " + r.matiere + " · " + r.categorie + (r.precision ? " · " + r.precision : "") + " · parents : " + r.parents;
  }).join("\n");
  return { toutes: toutes, travail: travail, attitude: toutes.length - travail, texte: lignes };
}

function notifierProf(pseudo) {
  var r = recap(pseudo);
  var n = r.toutes.length;
  var sujet = "[Carnet 4G] " + pseudo + " — remarque n°" + n + (n >= SEUIL ? " ⚠️ SEUIL ATTEINT" : "");
  var corps = "Nouvelle remarque reportée par " + pseudo + " (total : " + n + " — travail : " + r.travail + ", attitude : " + r.attitude + ").\n\n" +
    "Historique complet :\n" + r.texte + "\n\n" +
    (n >= SEUIL ? "⚠️ " + SEUIL + " remarques atteintes : entretien à prévoir (retenue plus probable si dominante « attitude »).\n\n" : "") +
    "— Carnet de bord 4G (automatique)";
  MailApp.sendEmail(config("emailProf"), sujet, corps);
}

function alerter(pseudo) {
  var destinataires = config("emailsEquipe").split(",").map(function (s) { return s.trim(); }).filter(String);
  if (!destinataires.length) return { ok: false, erreur: "Aucune adresse dans Config > emailsEquipe." };
  var r = recap(pseudo);
  var sujet = "[Alerte PP 4G] Point de situation — " + pseudo + " (" + r.toutes.length + " remarques)";
  var corps = "Bonjour,\n\nEn tant que PP de la 4G, je vous partage un point de situation concernant " + pseudo + " :\n" +
    r.toutes.length + " remarques au carnet (travail : " + r.travail + ", attitude : " + r.attitude + ").\n\n" +
    "Détail :\n" + r.texte + "\n\n" +
    "Merci de me signaler tout élément complémentaire. Nous en parlerons en équipe si nécessaire.\n\n" +
    "R. Blanchard — PP 4G";
  MailApp.sendEmail(destinataires.join(","), sujet, corps, { cc: config("emailProf") });
  return { ok: true };
}

function feuille(nom) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nom); }
