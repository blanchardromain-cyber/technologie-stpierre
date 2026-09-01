/**
 * PSC1 4G — backend Apps Script (inscriptions binômes, sessions numérotées le jour de la rentrée).
 * Onglets : Codes (code|pseudo|role — mêmes codes que le Hub), Sessions, Inscriptions.
 * Règles : inscription possible, DÉSINSCRIPTION IMPOSSIBLE (sauf prof).
 * Les codes des élèves ne sont JAMAIS renvoyés au navigateur (binôme choisi par pseudo).
 * Anti-collision : chaque inscription passe par un verrou serveur (LockService) —
 * deux binômes ne peuvent jamais valider la même session en même temps.
 */

var F_CODES = "Codes";
var F_SESSIONS = "Sessions";
var F_INSCRIPTIONS = "Inscriptions";

/** À exécuter UNE FOIS à la main : crée les onglets. */
function initialiser() {
  var c = SpreadsheetApp.getActiveSpreadsheet();
  if (!c.getSheetByName(F_CODES)) c.insertSheet(F_CODES).appendRow(["code", "pseudo", "role"]);
  if (!c.getSheetByName(F_SESSIONS)) c.insertSheet(F_SESSIONS).appendRow(["id", "numero", "capacite", "ouverte"]);
  if (!c.getSheetByName(F_INSCRIPTIONS)) c.insertSheet(F_INSCRIPTIONS).appendRow(["id", "ts", "sessionId", "pseudo1", "pseudo2", "parQui"]);
}

/**
 * À exécuter UNE FOIS à la main (après initialiser) : crée les 13 sessions
 * numérotées 1 à 13, capacité 2 élèves (1 binôme) chacune, toutes ouvertes.
 * Sans effet si des sessions existent déjà (ne duplique pas).
 */
function initialiserSessions13() {
  var f = feuille(F_SESSIONS);
  if (f.getLastRow() > 1) return; // déjà initialisé
  for (var n = 1; n <= 13; n++) {
    f.appendRow([Utilities.getUuid().slice(0, 8), n, 2, 1]);
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

function traiter(d, u) {
  switch (d.action) {
    case "etat": return etat(u);
    case "inscrire": return inscrire(d, u);
    case "ajouterSession":
      if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
      feuille(F_SESSIONS).appendRow([Utilities.getUuid().slice(0, 8), +d.numero, Math.max(2, +d.capacite || 2), 1]);
      return { ok: true };
    case "basculerSession":
      if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
      return basculer(d.sessionId);
    case "retirer":
      if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
      return retirer(d.inscriptionId);
    default: return { ok: false, erreur: "Action inconnue." };
  }
}

function etat(u) {
  var sessions = lire(F_SESSIONS).map(function (l) { return { id: l[0], numero: +l[1], capacite: l[2], ouverte: l[3] }; });
  var inscriptions = lire(F_INSCRIPTIONS).map(function (l) { return { id: l[0], ts: l[1], sessionId: l[2], pseudo1: l[3], pseudo2: l[4], parQui: l[5] }; });
  var eleves = lire(F_CODES).filter(function (l) { return l[2] === "eleve"; }).map(function (l) { return l[1]; });
  return { ok: true, sessions: sessions, inscriptions: inscriptions, eleves: eleves };
}

function inscrire(d, u) {
  if (u.role !== "eleve") return { ok: false, erreur: "Inscription réservée aux élèves." };
  var s = lire(F_SESSIONS).filter(function (l) { return l[0] === d.sessionId; })[0];
  if (!s || !s[3]) return { ok: false, erreur: "Session fermée." };
  var inscriptions = lire(F_INSCRIPTIONS);
  var prises = inscriptions.filter(function (l) { return l[2] === d.sessionId; }).length * 2;
  if (prises + 2 > s[2]) return { ok: false, erreur: "Plus de place sur cette date." };
  var dejaInscrits = [];
  inscriptions.forEach(function (l) { dejaInscrits.push(l[3], l[4]); });
  if (dejaInscrits.indexOf(u.pseudo) !== -1) return { ok: false, erreur: "Tu es déjà inscrit(e)." };
  if (dejaInscrits.indexOf(d.binome) !== -1) return { ok: false, erreur: d.binome + " est déjà inscrit(e)." };
  if (d.binome === u.pseudo) return { ok: false, erreur: "Choisis un(e) camarade, pas toi-même." };
  var pseudosValides = lire(F_CODES).filter(function (l) { return l[2] === "eleve"; }).map(function (l) { return l[1]; });
  if (pseudosValides.indexOf(d.binome) === -1) return { ok: false, erreur: "Binôme inconnu." };
  feuille(F_INSCRIPTIONS).appendRow([Utilities.getUuid().slice(0, 8), Date.now(), d.sessionId, u.pseudo, d.binome, u.pseudo]);
  return { ok: true };
}

function basculer(id) {
  var f = feuille(F_SESSIONS);
  var lignes = f.getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++)
    if (lignes[i][0] === id) { f.getRange(i + 1, 4).setValue(lignes[i][3] ? 0 : 1); return { ok: true }; }
  return { ok: false, erreur: "Session introuvable." };
}

function retirer(id) {
  var f = feuille(F_INSCRIPTIONS);
  var lignes = f.getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++)
    if (lignes[i][0] === id) { f.deleteRow(i + 1); return { ok: true }; }
  return { ok: false, erreur: "Inscription introuvable." };
}

function lire(nom) { return feuille(nom).getDataRange().getValues().slice(1); }
function feuille(nom) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nom); }
