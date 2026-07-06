/**
 * Carnet de bord 4G (suivi du règlement) — backend Apps Script. VERSION 2.
 * Onglets : Codes, Remarques, Config + (v2) Rdv.
 * Nouveautés v2 : trimestres (T1/T2/T3, bornes dans Config), proposition de rendez-vous par
 * l'élève au seuil de 5 remarques du trimestre, validation du créneau par le prof.
 * MISE À JOUR d'un déploiement existant : coller ce code, exécuter initialiser() une fois,
 * puis Déployer > Gérer les déploiements > ✏️ > Nouvelle version (l'URL ne change pas).
 */

var F_CODES = "Codes";
var F_REMARQUES = "Remarques";
var F_CONFIG = "Config";
var F_RDV = "Rdv";
var SEUIL = 5;
var JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
var CRENEAUX = ["Récréation du matin (10h30)", "Temps du midi (13h30)", "Récréation de l'après-midi (14h45)"];

/** À exécuter UNE FOIS à la main (ré-exécutable sans risque) : crée les onglets manquants. */
function initialiser() {
  var c = SpreadsheetApp.getActiveSpreadsheet();
  if (!c.getSheetByName(F_CODES)) c.insertSheet(F_CODES).appendRow(["code", "pseudo", "role"]);
  if (!c.getSheetByName(F_REMARQUES))
    c.insertSheet(F_REMARQUES).appendRow(["id", "ts", "pseudo", "date", "matiere", "categorie", "precision", "parents"]);
  if (!c.getSheetByName(F_RDV))
    c.insertSheet(F_RDV).appendRow(["id", "ts", "pseudo", "trimestre", "jourPropose", "creneauPropose", "statut", "jourValide", "creneauValide"]);
  if (!c.getSheetByName(F_CONFIG)) {
    var cfg = c.insertSheet(F_CONFIG);
    cfg.appendRow(["cle", "valeur"]);
    cfg.appendRow(["emailProf", "blanchard.romain@stpierre85.com"]);
    cfg.appendRow(["emailsEquipe", "adresse1@stpierre85.com, adresse2@stpierre85.com"]);
  }
  if (!config("finT1")) feuille(F_CONFIG).appendRow(["finT1", "2026-11-30"]);
  if (!config("finT2")) feuille(F_CONFIG).appendRow(["finT2", "2027-03-10"]);
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
    reponse = { ok: false, erreur: "Erreur serveur : " + (err && err.message ? err.message : err) };
  }
  return ContentService.createTextOutput(JSON.stringify(reponse)).setMimeType(ContentService.MimeType.JSON);
}

// Sheets peut renvoyer une date en objet Date : on la reformate en "yyyy-MM-dd".
function jour(v) {
  if (v instanceof Date) return Utilities.formatDate(v, "Europe/Paris", "yyyy-MM-dd");
  return String(v).slice(0, 10);
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
  var f = feuille(F_CONFIG);
  if (!f) return "";
  var lignes = f.getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++) if (lignes[i][0] === cle) return String(lignes[i][1]);
  return "";
}

function trimestreDe(dateIso) {
  var d = String(dateIso).slice(0, 10);
  if (d <= config("finT1")) return "T1";
  if (d <= config("finT2")) return "T2";
  return "T3";
}

function traiter(d, u) {
  switch (d.action) {
    case "liste": return lister(u);
    case "ajouter": return ajouter(d, u);
    case "proposerRdv": return proposerRdv(d, u);
    case "validerRdv":
      if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
      return validerRdv(d);
    case "alerter":
      if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
      return alerter(d.pseudo);
    default: return { ok: false, erreur: "Action inconnue." };
  }
}

function remarquesDe(pseudo) {
  return feuille(F_REMARQUES).getDataRange().getValues().slice(1)
    .filter(function (l) { return !pseudo || l[2] === pseudo; })
    .map(function (l) { var jj = jour(l[3]); return { id: l[0], ts: l[1], pseudo: l[2], date: jj, matiere: l[4], categorie: l[5], precision: l[6], parents: l[7], trimestre: trimestreDe(jj) }; });
}

function rdvsDe(pseudo) {
  return feuille(F_RDV).getDataRange().getValues().slice(1)
    .filter(function (l) { return !pseudo || l[2] === pseudo; })
    .map(function (l) { return { id: l[0], ts: l[1], pseudo: l[2], trimestre: l[3], jourPropose: l[4], creneauPropose: l[5], statut: l[6], jourValide: l[7], creneauValide: l[8] }; });
}

function lister(u) {
  var filtre = u.role === "prof" ? null : u.pseudo;
  return { ok: true, remarques: remarquesDe(filtre), rdvs: rdvsDe(filtre),
    config: { finT1: config("finT1"), finT2: config("finT2") } };
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

function proposerRdv(d, u) {
  if (u.role !== "eleve") return { ok: false, erreur: "Réservé aux élèves." };
  if (JOURS.indexOf(d.jour) === -1 || CRENEAUX.indexOf(d.creneau) === -1) return { ok: false, erreur: "Choix invalide." };
  var trimestre = trimestreDe(Utilities.formatDate(new Date(), "Europe/Paris", "yyyy-MM-dd"));
  var n = remarquesDe(u.pseudo).filter(function (r) { return r.trimestre === trimestre; }).length;
  if (n < SEUIL) return { ok: false, erreur: "Le rendez-vous se propose à partir de " + SEUIL + " remarques du trimestre." };
  var deja = rdvsDe(u.pseudo).filter(function (r) { return r.trimestre === trimestre; });
  if (deja.length) return { ok: false, erreur: "Une demande existe déjà pour ce trimestre." };
  feuille(F_RDV).appendRow([Utilities.getUuid().slice(0, 8), Date.now(), u.pseudo, trimestre, d.jour, d.creneau, "propose", "", ""]);
  try {
    MailApp.sendEmail(config("emailProf"), "[Carnet 4G] " + u.pseudo + " propose un rendez-vous (" + trimestre + ")",
      u.pseudo + " a atteint " + n + " remarques (" + trimestre + ") et propose : " + d.jour + " — " + d.creneau +
      "\n\nValide (ou modifie) le créneau dans la vue prof du Carnet de bord.\n\n— Carnet de bord 4G (automatique)");
  } catch (err) { }
  return { ok: true };
}

function validerRdv(d) {
  if (JOURS.indexOf(d.jour) === -1 || CRENEAUX.indexOf(d.creneau) === -1) return { ok: false, erreur: "Choix invalide." };
  var f = feuille(F_RDV);
  var lignes = f.getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++) {
    if (lignes[i][0] === d.id) {
      f.getRange(i + 1, 7, 1, 3).setValues([["valide", d.jour, d.creneau]]);
      return { ok: true };
    }
  }
  return { ok: false, erreur: "Demande introuvable." };
}

function recap(pseudo) {
  var toutes = remarquesDe(pseudo).sort(function (a, b) { return b.ts - a.ts; });
  var travail = toutes.filter(function (r) { return String(r.categorie).indexOf("Travail") === 0; }).length;
  var lignes = toutes.map(function (r) {
    return "- " + r.trimestre + " · " + r.date + " · " + r.matiere + " · " + r.categorie + (r.precision ? " · " + r.precision : "") + " · parents : " + r.parents;
  }).join("\n");
  return { toutes: toutes, travail: travail, attitude: toutes.length - travail, texte: lignes };
}

function notifierProf(pseudo) {
  var r = recap(pseudo);
  var trimestre = trimestreDe(Utilities.formatDate(new Date(), "Europe/Paris", "yyyy-MM-dd"));
  var nTrim = r.toutes.filter(function (x) { return x.trimestre === trimestre; }).length;
  var sujet = "[Carnet 4G] " + pseudo + " — remarque n°" + nTrim + " du " + trimestre + (nTrim >= SEUIL ? " ⚠️ SEUIL ATTEINT" : "");
  var corps = "Nouvelle remarque reportée par " + pseudo + " (" + trimestre + " : " + nTrim + " — année : " + r.toutes.length +
    ", travail : " + r.travail + ", attitude : " + r.attitude + ").\n\n" +
    "Historique complet :\n" + r.texte + "\n\n" +
    (nTrim >= SEUIL ? "⚠️ " + SEUIL + " remarques ce trimestre : entretien à prévoir (l'élève peut maintenant proposer un créneau).\n\n" : "") +
    "— Carnet de bord 4G (automatique)";
  MailApp.sendEmail(config("emailProf"), sujet, corps);
}

function alerter(pseudo) {
  var destinataires = config("emailsEquipe").split(/[,;]/).map(function (s) { return s.trim(); })
    .filter(function (a) { return a && a.indexOf("@") !== -1 && a.indexOf("adresse1@") === -1 && a.indexOf("adresse2@") === -1; });
  if (!destinataires.length)
    return { ok: false, erreur: "Renseigne les vraies adresses de l'équipe dans l'onglet Config du Sheet (ligne emailsEquipe) — les exemples adresse1@/adresse2@ sont ignorés." };
  var r = recap(pseudo);
  var sujet = "[Alerte PP 4G] Point de situation — " + pseudo + " (" + r.toutes.length + " remarques)";
  var corps = "Bonjour,\n\nEn tant que PP de la 4G, je vous partage un point de situation concernant " + pseudo + " :\n" +
    r.toutes.length + " remarques au carnet (travail : " + r.travail + ", attitude : " + r.attitude + ").\n\n" +
    "Détail :\n" + r.texte + "\n\n" +
    "Merci de me signaler tout élément complémentaire. Nous en parlerons en équipe si nécessaire.\n\n" +
    "R. Blanchard — PP 4G";
  try {
    MailApp.sendEmail(destinataires.join(","), sujet, corps, { cc: config("emailProf") });
  } catch (err) {
    return { ok: false, erreur: "Envoi impossible (" + (err && err.message ? err.message : err) + "). Vérifie les adresses et l'autorisation d'envoi d'e-mails." };
  }
  return { ok: true, info: "Alerte envoyée à : " + destinataires.join(", ") };
}

function feuille(nom) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nom); }
