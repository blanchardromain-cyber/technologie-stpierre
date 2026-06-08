/**
 * Apps Script — Atelier Algorigrammes P12 · Activité 3
 * =====================================================
 * Une ligne par élève (clé = Classe + Prénom + Nom).
 * Chaque beacon met à jour la ligne existante au lieu d'en créer une nouvelle.
 *
 * Structure des colonnes :
 * A  Date première connexion   (dd/MM/yyyy HH:mm)
 * B  Dernière MAJ               (HH:mm:ss)
 * C  Classe
 * D  Prénom
 * E  Nom
 * F  Binôme (Prénom2 Nom2)
 * G  Ex1 – Télévision
 * H  Ex2 – Radar
 * I  Ex3 – Escalator
 * J  Ex4 – Escalator éco
 * K  Ex5 – Distance
 * L  Ex6 – Métro
 * M  Ex7 – Distributeur
 * N  Ex8 – Écluse
 * O  Bonus – Croquettes
 * P  Score (X/9)
 * Q  Temps total
 * R  [clé de recherche — masquer cette colonne]
 */

var HEADERS = [
  "Date", "Dernière MAJ", "Classe", "Prénom", "Nom", "Binôme",
  "Ex1 TV", "Ex2 Radar", "Ex3 Escalator", "Ex4 Escalator éco",
  "Ex5 Distance", "Ex6 Métro", "Ex7 Distributeur", "Ex8 Écluse",
  "Bonus Croquettes",
  "Score", "Temps", "🔑 Clé"
];

// Mapping exo → index colonne 0-based dans le tableau de données
var EXO_COL = { "1":6, "2":7, "3":8, "4":9, "5":10, "6":11, "7":12, "8":13, "B":14 };

var COL_DATE     = 0;
var COL_MAJ      = 1;
var COL_CLASSE   = 2;
var COL_PRENOM   = 3;
var COL_NOM      = 4;
var COL_BINOME   = 5;
// Ex cols : 6–14
var COL_SCORE    = 15;
var COL_TEMPS    = 16;
var COL_KEY      = 17;

function doGet(e) {
  try {
    var p       = e.parameter;
    var classe  = (p.classe  || "").trim();
    var prenom  = (p.p1      || "").trim();
    var nom     = (p.n1      || "").trim();
    var prenom2 = (p.p2      || "").trim();
    var nom2    = (p.n2      || "").trim();
    var exo     = (p.exo     || "").trim();
    var result  = (p.result  || "").trim();
    var attempts= parseInt(p.attempts || "0", 10);
    var timer   = (p.timer   || "").trim();

    if (!classe || !prenom || !nom) {
      return ContentService.createTextOutput("skip: missing identity");
    }

    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Résultats");
    if (!sheet) sheet = ss.insertSheet("Résultats");

    // Initialiser les en-têtes si la feuille est vide
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      // Masquer la colonne clé (dernière)
      sheet.hideColumns(COL_KEY + 1);
    }

    var tz      = "Europe/Paris";
    var now     = new Date();
    var dateStr = Utilities.formatDate(now, tz, "dd/MM/yyyy HH:mm");
    var timeStr = Utilities.formatDate(now, tz, "HH:mm:ss");

    // Clé unique par élève (sans date → toujours une seule ligne par élève)
    var rowKey  = classe + "|" + prenom + "|" + nom;

    // ── Recherche de la ligne existante ──────────────────────────────
    var lastRow = sheet.getLastRow();
    var rowIdx  = -1;  // 1-based, -1 = non trouvé

    if (lastRow > 1) {
      var keyData = sheet.getRange(2, COL_KEY + 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < keyData.length; i++) {
        if (keyData[i][0] === rowKey) {
          rowIdx = i + 2;  // +1 pour 1-based, +1 pour ligne d'en-tête
          break;
        }
      }
    }

    // ── Création de la ligne si elle n'existe pas ─────────────────────
    if (rowIdx === -1) {
      var newRow        = new Array(HEADERS.length).fill("");
      newRow[COL_DATE]  = dateStr;
      newRow[COL_MAJ]   = timeStr;
      newRow[COL_CLASSE]= classe;
      newRow[COL_PRENOM]= prenom;
      newRow[COL_NOM]   = nom;
      newRow[COL_BINOME]= (prenom2 && nom2) ? prenom2 + " " + nom2 : "";
      newRow[COL_SCORE] = "0/9";
      newRow[COL_KEY]   = rowKey;
      sheet.appendRow(newRow);
      rowIdx = sheet.getLastRow();
    } else {
      // Mettre à jour le binôme si renseigné maintenant
      if (prenom2 && nom2) {
        sheet.getRange(rowIdx, COL_BINOME + 1)
             .setValue(prenom2 + " " + nom2);
      }
    }

    // ── Mise à jour de l'heure de dernière activité ───────────────────
    sheet.getRange(rowIdx, COL_MAJ + 1).setValue(timeStr);

    // ── Mise à jour de la colonne exercice ────────────────────────────
    var exoColIdx = EXO_COL[exo];  // 0-based

    if (exoColIdx !== undefined) {
      var cellRange  = sheet.getRange(rowIdx, exoColIdx + 1);
      var currentVal = cellRange.getValue();

      var newVal = currentVal;  // par défaut : ne pas toucher

      if (result === "reussite") {
        newVal = "✓";

      } else if (result === "echec") {
        // N'écrase pas une réussite déjà enregistrée
        if (currentVal !== "✓") {
          newVal = "✗ (" + attempts + " essai" + (attempts > 1 ? "s" : "") + ")";
        }

      } else if (result === "quiz_revele") {
        // Le quiz a été révélé sans trouver → note informative si pas encore résolu
        if (currentVal === "" || currentVal === undefined) {
          newVal = "quiz révélé";
        }

      }
      // quiz_ok : événement intermédiaire, pas de mise à jour de la cellule exercice

      if (newVal !== currentVal) {
        cellRange.setValue(newVal);
      }
    }

    // ── Recalcul du score ─────────────────────────────────────────────
    var exCols  = sheet.getRange(rowIdx, EXO_COL["1"] + 1, 1, 9).getValues()[0];
    var solved  = exCols.filter(function(v){ return v === "✓"; }).length;
    sheet.getRange(rowIdx, COL_SCORE + 1).setValue(solved + "/9");

    // ── Mise à jour du temps ──────────────────────────────────────────
    if (timer) {
      sheet.getRange(rowIdx, COL_TEMPS + 1).setValue(timer);
    }

    return ContentService.createTextOutput("ok");

  } catch (err) {
    // Ne pas planter silencieusement — logguer
    console.error(err);
    return ContentService.createTextOutput("error: " + err.toString());
  }
}

/**
 * Utilitaire : formate la feuille après déploiement
 * (largeurs de colonnes, couleur d'en-tête, masquage colonne clé)
 * Appeler manuellement depuis l'éditeur Apps Script une seule fois.
 */
function formatSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Résultats");
  if (!sheet) return;

  // Largeurs
  sheet.setColumnWidth(1, 130);   // Date
  sheet.setColumnWidth(2, 80);    // MAJ
  sheet.setColumnWidth(3, 60);    // Classe
  sheet.setColumnWidth(4, 90);    // Prénom
  sheet.setColumnWidth(5, 110);   // Nom
  sheet.setColumnWidth(6, 120);   // Binôme
  for (var c = 7; c <= 15; c++) sheet.setColumnWidth(c, 100); // Ex
  sheet.setColumnWidth(16, 70);   // Score
  sheet.setColumnWidth(17, 70);   // Temps
  // colonne 18 (Clé) masquée via hideColumns ci-dessous

  // En-tête coloré
  sheet.getRange(1, 1, 1, HEADERS.length)
       .setBackground("#4338CA")
       .setFontColor("#ffffff")
       .setFontWeight("bold");

  // Masquer colonne clé
  sheet.hideColumns(18);

  SpreadsheetApp.flush();
}
