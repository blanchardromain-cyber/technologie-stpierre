// Apps Script — Atelier Algorigrammes v2
// À coller dans Extensions > Apps Script du Google Sheet
// puis déployer comme Application Web (Accès : Tout le monde)
//
// Colonnes du Sheet "Résultats" :
// Date | Classe | Élève1 Prénom | Élève1 Nom | Élève2 Prénom | Élève2 Nom
// | Exercice | Résultat | Essais algo | Résultat quiz | Tentatives quiz
// | Total essais | Temps (mm:ss)

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Résultats");
    if (!sheet) {
      sheet = ss.insertSheet("Résultats");
      sheet.appendRow([
        "Date", "Classe",
        "Élève 1 Prénom", "Élève 1 Nom",
        "Élève 2 Prénom", "Élève 2 Nom",
        "Exercice", "Résultat",
        "Essais algo", "Résultat quiz", "Tentatives quiz",
        "Total essais", "Temps (mm:ss)"
      ]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 13).setFontWeight("bold");
    }

    const p   = e.parameter;
    const now = new Date();
    const tz  = Session.getScriptTimeZone();

    // Libellés lisibles pour le résultat quiz
    const quizLabels = {
      'correct' : 'Correct',
      'revele'  : 'Révélée',
      ''        : '-'
    };

    sheet.appendRow([
      Utilities.formatDate(now, tz, "dd/MM/yyyy HH:mm:ss"),
      p.classe   || "",
      p.p1       || "",
      p.n1       || "",
      p.p2       || "",
      p.n2       || "",
      p.exo      || "",
      p.result   || "",
      isNaN(parseInt(p.attempts)) ? 0   : parseInt(p.attempts),
      quizLabels[p.quizResult] || p.quizResult || "-",
      isNaN(parseInt(p.quizAtt)) ? 0   : parseInt(p.quizAtt),
      isNaN(parseInt(p.total))   ? ""  : parseInt(p.total),
      p.timer    || ""
    ]);

    return ContentService
      .createTextOutput("OK")
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    return ContentService
      .createTextOutput("Erreur : " + err.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
