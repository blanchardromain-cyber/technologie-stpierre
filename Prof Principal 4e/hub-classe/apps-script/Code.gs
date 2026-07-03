/**
 * Hub de classe 4G — backend Apps Script.
 * Lié à un Google Sheet privé (onglets : Codes, Messages, Signalements).
 * Déploiement : Web App, « Exécuter en tant que : moi », « Accès : tout le monde ».
 * Le classeur n'est JAMAIS partagé : seul ce script y accède.
 */

var NOM_FEUILLE_CODES = "Codes";
var NOM_FEUILLE_MESSAGES = "Messages";
var NOM_FEUILLE_SIGNALEMENTS = "Signalements";
var MOTS_BLOQUES = ["connard","connasse","pute","salope","enculé","fdp","ntm","batard","bâtard","pd","tapette","niquer","nique"];

/** À exécuter UNE FOIS à la main après création du classeur : crée les onglets. */
function initialiser() {
  var classeur = SpreadsheetApp.getActiveSpreadsheet();
  if (!classeur.getSheetByName(NOM_FEUILLE_CODES))
    classeur.insertSheet(NOM_FEUILLE_CODES).appendRow(["code", "pseudo", "role"]);
  if (!classeur.getSheetByName(NOM_FEUILLE_MESSAGES))
    classeur.insertSheet(NOM_FEUILLE_MESSAGES).appendRow(["id", "ts", "code", "pseudo", "role", "type", "parentId", "matiere", "texte", "resolu", "masque", "merciPar", "signale"]);
  if (!classeur.getSheetByName(NOM_FEUILLE_SIGNALEMENTS))
    classeur.insertSheet(NOM_FEUILLE_SIGNALEMENTS).appendRow(["ts", "codeAuteur", "idMessage", "extrait"]);
}

function doPost(e) {
  var reponse;
  try {
    var d = JSON.parse(e.postData.contents);
    var utilisateur = trouverUtilisateur(d.code);
    if (d.action === "login") {
      reponse = utilisateur ? { ok: true, pseudo: utilisateur.pseudo, role: utilisateur.role }
                            : { ok: false, erreur: "Code inconnu. Vérifie ta carte." };
    } else if (!utilisateur) {
      reponse = { ok: false, erreur: "Code invalide." };
    } else {
      reponse = traiter(d, utilisateur);
    }
  } catch (err) {
    reponse = { ok: false, erreur: "Requête invalide." };
  }
  return ContentService.createTextOutput(JSON.stringify(reponse))
    .setMimeType(ContentService.MimeType.JSON);
}

function trouverUtilisateur(code) {
  if (!code) return null;
  var lignes = feuille(NOM_FEUILLE_CODES).getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++)
    if (String(lignes[i][0]).trim().toUpperCase() === String(code).trim().toUpperCase())
      return { code: lignes[i][0], pseudo: lignes[i][1], role: lignes[i][2] };
  return null;
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
      default: return { ok: false, erreur: "Action inconnue." };
    }
  } finally {
    verrou.releaseLock();
  }
}

function listerMessages(u) {
  var lignes = feuille(NOM_FEUILLE_MESSAGES).getDataRange().getValues();
  var estProf = u.role === "prof";
  var resultat = [];
  for (var i = 1; i < lignes.length; i++) {
    var l = lignes[i];
    if (!estProf && l[10]) continue; // masqué → invisible pour les élèves
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

function contientInsulte(texte) {
  var t = " " + texte.toLowerCase().replace(/[.,!?;:'"()\n]/g, " ") + " ";
  return MOTS_BLOQUES.some(function (m) { return t.indexOf(" " + m + " ") !== -1; });
}

function feuille(nom) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nom);
}
