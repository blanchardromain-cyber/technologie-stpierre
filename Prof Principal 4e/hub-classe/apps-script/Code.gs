/**
 * Hub de classe 4G — backend Apps Script. VERSION 2.
 * Onglets : Codes, Messages, Signalements + (v2) Infos, Divers.
 * Nouveautés v2 : horaires d'ouverture (blocage élèves hors plage), casier + référents
 * absence par élève, plan de classe publié (pseudonymisé).
 * MISE À JOUR d'un déploiement existant : coller ce code, exécuter initialiser() une fois,
 * puis Déployer > Gérer les déploiements > ✏️ > Nouvelle version (l'URL ne change pas).
 */

var NOM_FEUILLE_CODES = "Codes";
var NOM_FEUILLE_MESSAGES = "Messages";
var NOM_FEUILLE_SIGNALEMENTS = "Signalements";
var NOM_FEUILLE_INFOS = "Infos";
var NOM_FEUILLE_DIVERS = "Divers";
var INSULTES_SUB = ["connard","connasse","conard","conasse","encule","enculer","enculette","putain","salopard","salope","enfoire","tapette","tarlouze","tantouze","tafiole","pouffiasse","petasse","grognasse","ducon","triso","trisomique","mongolien","niktamere","niquetamere","filsdepute","tagueule","fermelatagueule","ntm","fdp","bougnoule","bamboula","chinetoque","niakoue","negro","negre","youpin","bicot","batard","pedale","branleur","branler","couille","salaud"];
var INSULTES_MOT = ["con","cons","conne","connes","pute","putes","pd","pede","tg","naze","nase","debile","cretin","abruti","bouffon","tocard","cassos","guignol","gogol","mongol","gouine","merde","merdique","chiant","chieur","bite","zizi","zboub","teub","cul","clochard","raclure","ordure","boloss","bolos","thug"];

function normaliserTexte(t) {
  return String(t).toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[@4]/g, "a").replace(/0/g, "o").replace(/3/g, "e").replace(/[1!|]/g, "i").replace(/[5$]/g, "s").replace(/7/g, "t")
    .replace(/(.)\1{2,}/g, "$1")
    .replace(/[^a-z\s]/g, " ");
}

function contientInsulte(texte) {
  var norm = normaliserTexte(texte);
  var colle = norm.replace(/\s+/g, "");
  var tokens = norm.split(/\s+/).filter(String);
  var perso = lireDivers("motsPerso").split(",").map(function (w) { return normaliserTexte(w).replace(/\s+/g, ""); }).filter(String);
  var sub = INSULTES_SUB.concat(perso.filter(function (w) { return w.length >= 4; }));
  var mot = INSULTES_MOT.concat(perso.filter(function (w) { return w.length < 4; }));
  if (sub.some(function (w) { return colle.indexOf(w) !== -1; })) return true;
  return tokens.some(function (tok) {
    return mot.some(function (w) { return tok === w || tok === w + "s" || tok === w + "e" || tok === w + "es"; });
  });
}

/** À exécuter UNE FOIS à la main (ré-exécutable sans risque) : crée les onglets manquants. */
function initialiser() {
  var classeur = SpreadsheetApp.getActiveSpreadsheet();
  if (!classeur.getSheetByName(NOM_FEUILLE_CODES))
    classeur.insertSheet(NOM_FEUILLE_CODES).appendRow(["code", "pseudo", "role"]);
  if (!classeur.getSheetByName(NOM_FEUILLE_MESSAGES))
    classeur.insertSheet(NOM_FEUILLE_MESSAGES).appendRow(["id", "ts", "code", "pseudo", "role", "type", "parentId", "matiere", "texte", "resolu", "masque", "merciPar", "signale"]);
  if (!classeur.getSheetByName(NOM_FEUILLE_SIGNALEMENTS))
    classeur.insertSheet(NOM_FEUILLE_SIGNALEMENTS).appendRow(["ts", "codeAuteur", "idMessage", "extrait"]);
  if (!classeur.getSheetByName(NOM_FEUILLE_INFOS))
    classeur.insertSheet(NOM_FEUILLE_INFOS).appendRow(["pseudo", "casier", "referent1", "referent2", "maj"]);
  if (!classeur.getSheetByName(NOM_FEUILLE_DIVERS)) {
    var d = classeur.insertSheet(NOM_FEUILLE_DIVERS);
    d.appendRow(["cle", "valeur"]);
    d.appendRow(["ouverture", "07:30"]);
    d.appendRow(["fermeture", "21:00"]);
    d.appendRow(["joursOuverts", "1,2,3,4,5,6,7"]);
    d.appendRow(["motsPerso", ""]);
    d.appendRow(["planClasse", ""]);
    d.appendRow(["planningMenage", ""]);
  }
  // Colonne des valeurs en TEXTE : empêche Sheets de convertir « 07:30 » en date (bug « samedi »).
  feuille(NOM_FEUILLE_DIVERS).getRange("B:B").setNumberFormat("@");
  if (!lireDivers("joursOuverts")) ecrireDivers("joursOuverts", "1,2,3,4,5,6,7"); // migration v2 -> v2.2
  // ré-écrit les heures au propre si elles avaient été converties en date
  ecrireDivers("ouverture", lireHeure("ouverture") || "07:30");
  ecrireDivers("fermeture", lireHeure("fermeture") || "21:00");
}

function horairesActuels() {
  return {
    ouverture: lireHeure("ouverture"), fermeture: lireHeure("fermeture"), jours: lireDivers("joursOuverts"),
    motsPerso: lireDivers("motsPerso").split(",").map(function (s) { return s.trim(); }).filter(String)
  };
}

function doPost(e) {
  var reponse;
  try {
    var d = JSON.parse(e.postData.contents);
    var utilisateur = trouverUtilisateur(d.code);
    var horaires = horairesActuels();
    if (utilisateur && utilisateur.role === "eleve" && horsPlage(horaires)) {
      reponse = { ok: false, ferme: true, erreur: messageFerme(horaires) };
    } else if (d.action === "login") {
      reponse = utilisateur ? { ok: true, pseudo: utilisateur.pseudo, role: utilisateur.role, horaires: horaires }
                            : { ok: false, erreur: "Code inconnu. Vérifie ta carte." };
    } else if (!utilisateur) {
      reponse = { ok: false, erreur: "Code invalide." };
    } else {
      reponse = traiter(d, utilisateur);
    }
  } catch (err) {
    reponse = { ok: false, erreur: "Erreur serveur : " + (err && err.message ? err.message : err) };
  }
  return ContentService.createTextOutput(JSON.stringify(reponse))
    .setMimeType(ContentService.MimeType.JSON);
}

// Lit une heure "HH:mm" en gérant le cas où Sheets l'a stockée comme Date.
function lireHeure(cle) {
  var f = feuille(NOM_FEUILLE_DIVERS);
  if (!f) return "";
  var lignes = f.getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++) {
    if (lignes[i][0] === cle) {
      var v = lignes[i][1];
      if (v instanceof Date) return ("0" + v.getHours()).slice(-2) + ":" + ("0" + v.getMinutes()).slice(-2);
      return String(v).slice(0, 5);
    }
  }
  return "";
}

function horsPlage(h) {
  // jour de la semaine (1 = lundi … 7 = dimanche)
  if (h.jours) {
    var jourIso = Utilities.formatDate(new Date(), "Europe/Paris", "u");
    if (h.jours.split(",").indexOf(jourIso) === -1) return true; // jour non ouvert
  }
  if (!h.ouverture || !h.fermeture) return false; // heures non configurées = toujours ouvert
  var maintenant = Utilities.formatDate(new Date(), "Europe/Paris", "HH:mm");
  return maintenant < h.ouverture || maintenant >= h.fermeture;
}

function messageFerme(h) {
  var noms = { "1": "lun", "2": "mar", "3": "mer", "4": "jeu", "5": "ven", "6": "sam", "7": "dim" };
  var jours = (h.jours || "1,2,3,4,5,6,7").split(",").map(function (j) { return noms[j] || j; }).join(", ");
  var plage = (h.ouverture && h.fermeture) ? " de " + h.ouverture + " à " + h.fermeture : "";
  return "Le Hub est fermé. Ouvert : " + jours + plage + ".";
}

function trouverUtilisateur(code) {
  if (!code) return null;
  var lignes = feuille(NOM_FEUILLE_CODES).getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++)
    if (String(lignes[i][0]).trim().toUpperCase() === String(code).trim().toUpperCase())
      return { code: lignes[i][0], pseudo: lignes[i][1], role: lignes[i][2] };
  return null;
}

function lireDivers(cle) {
  var f = feuille(NOM_FEUILLE_DIVERS);
  if (!f) return "";
  var lignes = f.getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++) if (lignes[i][0] === cle) return String(lignes[i][1]);
  return "";
}

function ecrireDivers(cle, valeur) {
  var f = feuille(NOM_FEUILLE_DIVERS);
  var lignes = f.getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++)
    if (lignes[i][0] === cle) { var cell = f.getRange(i + 1, 2); cell.setNumberFormat("@"); cell.setValue(valeur); return; }
  f.appendRow([cle, valeur]);
}

function traiter(d, u) {
  var verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    switch (d.action) {
      case "liste": return listerMessages(u);
      case "poster": return poster(d, u);
      case "merci": return modifier(d.id, u, function (m) {
        var deja = String(m.merciPar || "").split(",").filter(String);
        if (deja.indexOf(u.code) === -1) deja.push(u.code);
        return { merciPar: deja.join(",") };
      });
      case "resoudre": return modifier(d.id, u, function (m) {
        if (m.pseudo !== u.pseudo && u.role !== "prof") return null;
        return { resolu: 1 };
      });
      case "masquer":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        return modifier(d.id, u, function () { return { masque: d.retablir ? 0 : 1 }; });
      case "signaler": return signaler(d, u);
      case "infosMoi": return infosMoi(u);
      case "majInfos": return majInfos(d, u);
      case "listeInfos":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        return { ok: true, infos: lireInfos(), horaires: horairesActuels() };
      case "reglerHoraires":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        ecrireDivers("ouverture", String(d.ouverture || "").slice(0, 5));
        ecrireDivers("fermeture", String(d.fermeture || "").slice(0, 5));
        var jours = String(d.jours || "").split(",").filter(function (j) { return "1234567".indexOf(j) !== -1; }).join(",");
        ecrireDivers("joursOuverts", jours);
        return { ok: true };
      case "reglerMotsPerso":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        ecrireDivers("motsPerso", (d.motsPerso || []).join(",").slice(0, 2000));
        return { ok: true };
      case "publierPlan":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        ecrireDivers("planClasse", String(d.plan || "").slice(0, 30000));
        return { ok: true };
      case "lirePlan":
        return { ok: true, plan: lireDivers("planClasse") };
      case "ajouterRetenue":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        return ajouterRetenue(d);
      case "publierMenage":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        ecrireDivers("planningMenage", String(d.planning || "").slice(0, 30000));
        return { ok: true };
      case "lireMenage":
        return { ok: true, planning: lireDivers("planningMenage") };
      default: return { ok: false, erreur: "Action inconnue." };
    }
  } finally {
    verrou.releaseLock();
  }
}

// ---------- Report des retenues dans le registre partagé (générateur → Sheet) ----------
// Le registre est un AUTRE classeur (partagé équipe) : openById demandera une autorisation
// supplémentaire à la première exécution après mise à jour — l'accepter.
var REGISTRE_RETENUES_ID = "1lfF5yuwpLlmfDEDmeFx6NkJ7lK7o0Iln1m4aA5DnBJQ";

function ajouterRetenue(d) {
  var lignes = (d.lignes || []).slice(0, 20);
  if (!lignes.length) return { ok: false, erreur: "Aucune ligne à reporter." };
  var classeur = SpreadsheetApp.openById(REGISTRE_RETENUES_ID);
  var f = classeur.getSheetByName("Retenues") || classeur.getSheets()[0];
  lignes.forEach(function (l) {
    // Colonnes : Date | Créneau | Élève | Motif | Matière | Professeur | Travail fourni | Notes
    f.appendRow([
      String(l.date || ""), String(l.creneau || ""), String(l.eleve || "").slice(0, 60),
      String(l.motif || "").slice(0, 200), String(l.matiere || "").slice(0, 40),
      String(l.prof || "").slice(0, 40), "", ""
    ]);
  });
  return { ok: true, nb: lignes.length };
}

// ---------- Infos élèves (casier + référents absence) ----------
function lireInfos() {
  var f = feuille(NOM_FEUILLE_INFOS);
  if (!f) return []; // onglet pas encore créé : ne pas planter
  return f.getDataRange().getValues().slice(1)
    .map(function (l) { return { pseudo: l[0], casier: l[1], referent1: l[2], referent2: l[3] }; });
}

function infosMoi(u) {
  var mienne = lireInfos().filter(function (x) { return x.pseudo === u.pseudo; })[0] || {};
  var eleves = feuille(NOM_FEUILLE_CODES).getDataRange().getValues().slice(1)
    .filter(function (l) { return l[2] === "eleve"; }).map(function (l) { return l[1]; });
  return { ok: true, casier: mienne.casier || "", referent1: mienne.referent1 || "", referent2: mienne.referent2 || "", eleves: eleves };
}

function majInfos(d, u) {
  if (u.role !== "eleve") return { ok: false, erreur: "Réservé aux élèves." };
  var casier = String(d.casier || "").slice(0, 6);
  var r1 = String(d.referent1 || ""), r2 = String(d.referent2 || "");
  if (r1 || r2) {
    var pseudos = feuille(NOM_FEUILLE_CODES).getDataRange().getValues().slice(1)
      .filter(function (l) { return l[2] === "eleve"; }).map(function (l) { return l[1]; });
    if (r1 && (pseudos.indexOf(r1) === -1 || r1 === u.pseudo)) return { ok: false, erreur: "Référent 1 invalide." };
    if (r2 && (pseudos.indexOf(r2) === -1 || r2 === u.pseudo || r2 === r1)) return { ok: false, erreur: "Référent 2 invalide." };
  }
  var f = feuille(NOM_FEUILLE_INFOS);
  var lignes = f.getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++) {
    if (lignes[i][0] === u.pseudo) {
      f.getRange(i + 1, 2, 1, 4).setValues([[casier, r1, r2, new Date()]]);
      return { ok: true };
    }
  }
  f.appendRow([u.pseudo, casier, r1, r2, new Date()]);
  return { ok: true };
}

// ---------- Messages (inchangé v1) ----------
function listerMessages(u) {
  var lignes = feuille(NOM_FEUILLE_MESSAGES).getDataRange().getValues();
  var estProf = u.role === "prof";
  var resultat = [];
  for (var i = 1; i < lignes.length; i++) {
    var l = lignes[i];
    if (!estProf && l[10]) continue;
    resultat.push({
      id: l[0], ts: l[1], pseudo: l[3], role: l[4], type: l[5], parentId: l[6],
      matiere: l[7], texte: l[8], resolu: l[9], masque: l[10],
      merci: String(l[11] || "").split(",").filter(String), signale: l[12] || 0
    });
  }
  return { ok: true, messages: resultat };
}

function poster(d, u) {
  var texte = String(d.texte || "").trim().slice(0, 1200);
  if (!texte) return { ok: false, erreur: "Message vide." };
  if (contientInsulte(texte)) return { ok: false, erreur: "Message refusé : vocabulaire interdit." };
  if (d.type === "annonce" && u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
  if (["annonce", "question", "reponse"].indexOf(d.type) === -1) return { ok: false, erreur: "Type inconnu." };
  feuille(NOM_FEUILLE_MESSAGES).appendRow([
    Utilities.getUuid().slice(0, 8), Date.now(), u.code, u.pseudo, u.role,
    d.type, d.parentId || "", d.matiere || "", texte, 0, 0, "", 0
  ]);
  return { ok: true };
}

function modifier(id, u, calcul) {
  var f = feuille(NOM_FEUILLE_MESSAGES);
  var lignes = f.getDataRange().getValues();
  var colonnes = { resolu: 10, masque: 11, merciPar: 12 };
  for (var i = 1; i < lignes.length; i++) {
    if (lignes[i][0] === id) {
      var m = { pseudo: lignes[i][3], merciPar: lignes[i][11] };
      var maj = calcul(m);
      if (!maj) return { ok: false, erreur: "Non autorisé." };
      for (var cle in maj) f.getRange(i + 1, colonnes[cle]).setValue(maj[cle]);
      return { ok: true };
    }
  }
  return { ok: false, erreur: "Message introuvable." };
}

function signaler(d, u) {
  var f = feuille(NOM_FEUILLE_MESSAGES);
  var lignes = f.getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++) {
    if (lignes[i][0] === d.id) {
      f.getRange(i + 1, 13).setValue((lignes[i][12] || 0) + 1);
      feuille(NOM_FEUILLE_SIGNALEMENTS).appendRow([new Date(), u.code, d.id, String(lignes[i][8]).slice(0, 120)]);
      return { ok: true };
    }
  }
  return { ok: false, erreur: "Message introuvable." };
}

function feuille(nom) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nom);
}
