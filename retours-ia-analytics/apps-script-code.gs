/**
 * ============================================================================
 *  BACKEND Google Apps Script — Capsule "Retours d'expérience IA" (v2)
 * ============================================================================
 *
 *  NOUVEAUTÉS v2 :
 *    - Repère les colonnes PAR LEUR NOM (vos lignes déjà saisies restent valides ;
 *      les colonnes manquantes sont ajoutées automatiquement à droite).
 *    - Nouveaux champs : niveau, contexte, vigilance, lien.
 *    - Upload de capture d'écran : l'image (base64) est enregistrée dans un dossier
 *      Google Drive dédié, et seul son lien est stocké dans le Sheet.
 *
 *  ----------------------------------------------------------------------------
 *  MISE À JOUR vers v3 (analytics visites)
 *  ----------------------------------------------------------------------------
 *  1. Ouvrez votre projet : Sheet > Extensions > Apps Script.
 *  2. Remplacez TOUT le code par ce fichier.
 *  3. IMPORTANT — autoriser l'accès à Drive : dans l'éditeur, sélectionnez la
 *     fonction "autoriserAcces" dans la liste déroulante puis cliquez ▶ Exécuter.
 *     Acceptez les autorisations demandées (Sheets + Drive).
 *  4. Déployer > Gérer les déploiements > (votre déploiement) > ✏️ Modifier
 *     > Version : "Nouvelle version" > Déployer.
 *     ➜ L'URL /exec NE CHANGE PAS : rien à modifier dans index.html.
 *
 *  Colonnes finales du Sheet (créées/complétées automatiquement) :
 *    timestamp | prenom_initiale | matiere | outil | usage | avis
 *              | niveau | contexte | vigilance | lien | capture
 *
 *  NOUVEAUTÉS v3 :
 *    - Onglet "Stats visites" créé automatiquement dans le Sheet.
 *    - Chaque visite de page est enregistrée silencieusement.
 *    - Panneau admin accessible via ?admin dans l'URL du site.
 * ============================================================================
 */

const SHEET_NAME = 'Feuille 1';   // adapter au nom de votre onglet si besoin
const HEADERS = ['timestamp','prenom_initiale','matiere','outil','usage','avis',
                 'niveau','contexte','vigilance','lien','capture','utiles'];

// Dossier Drive "Stockage images pratiques profs" (partagé "Tout le monde avec le lien").
// Les images déposées héritent du partage public de ce dossier.
const DRIVE_FOLDER_ID = '1ULOfwPgkahboBCTeARcBotyZgxasuH8W';

// Onglet de suivi des visites (créé automatiquement).
const STATS_SHEET_NAME = 'Stats visites';

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

/* Construit {nomColonne: indice 1-based} et ajoute les en-têtes manquants à droite. */
function headerMap_(sh) {
  const lastCol = Math.max(sh.getLastColumn(), 1);
  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h).trim());
  const map = {};
  headers.forEach((h, i) => { if (h) map[h] = i + 1; });
  HEADERS.forEach(name => {
    if (!map[name]) {
      const col = headers.length + 1;
      sh.getRange(1, col).setValue(name);
      headers.push(name);
      map[name] = col;
    }
  });
  return map;
}

/* ---- Lecture : témoignages ou stats visites selon le paramètre ?action ---- */
function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.action === 'stats') return getStats_();

  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return json_([]);
  const headers = values[0].map(h => String(h).trim());
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0] && !row[1]) continue; // ligne vide
    const obj = {};
    headers.forEach((h, c) => { if (h) obj[h] = row[c]; });
    out.push(obj);
  }
  return json_(out);
}

/* ---- Écriture : ajoute un témoignage ---- */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sh = getSheet_();
    const map = headerMap_(sh);

    // --- Action "Utile" : incrémente le compteur de la ligne ciblée ---
    if (data.action === 'like') {
      return json_(incrementUtile_(sh, map, String(data.id || '')));
    }

    // --- Action "track" : enregistre une visite de page ---
    if (data.action === 'track') {
      return trackPageView_(String(data.view || ''), String(data.session || ''));
    }

    let captureUrl = '';
    if (data.capture_base64) {
      captureUrl = saveCapture_(data.capture_base64,
                                data.capture_mime || 'image/jpeg',
                                data.capture_name || 'capture.jpg');
    }

    const valueByName = {
      timestamp:       data.timestamp || new Date().toISOString(),
      prenom_initiale: String(data.prenom_initiale || '').slice(0, 40),
      matiere:         String(data.matiere || ''),
      outil:           String(data.outil || '').slice(0, 60),
      usage:           String(data.usage || '').slice(0, 300),
      avis:            String(data.avis || ''),
      niveau:          String(data.niveau || ''),
      contexte:        String(data.contexte || ''),
      vigilance:       String(data.vigilance || '').slice(0, 200),
      lien:            cleanUrl_(data.lien),
      capture:         captureUrl
    };

    const lastCol = sh.getLastColumn();
    const rowArr = new Array(lastCol).fill('');
    Object.keys(valueByName).forEach(name => {
      const col = map[name];
      if (col) rowArr[col - 1] = valueByName[name];
    });
    sh.appendRow(rowArr);

    return json_({ ok: true, capture: captureUrl });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* ---- Capture : décode le base64, enregistre dans Drive, renvoie un lien d'image ---- */
function saveCapture_(b64, mime, name) {
  const bytes = Utilities.base64Decode(b64);
  const blob = Utilities.newBlob(bytes, mime, name);
  const folder = getCaptureFolder_();
  const file = folder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) { /* domaine pouvant restreindre le partage public */ }
  // URL d'aperçu fiable pour intégration <img> :
  return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1200';
}

function getCaptureFolder_() {
  return DriveApp.getFolderById(DRIVE_FOLDER_ID);
}

/* ---- Incrémente la colonne "utiles" de la ligne dont timestamp == id ---- */
function incrementUtile_(sh, map, id) {
  const tsCol = map['timestamp'], uCol = map['utiles'];
  const last = sh.getLastRow();
  if (last < 2) return { ok: false, error: 'empty' };
  const stamps = sh.getRange(2, tsCol, last - 1, 1).getValues();
  for (let i = 0; i < stamps.length; i++) {
    let cell = stamps[i][0];
    if (cell instanceof Date) cell = cell.toISOString();
    if (String(cell) === id) {
      const row = i + 2;
      const cur = Number(sh.getRange(row, uCol).getValue()) || 0;
      sh.getRange(row, uCol).setValue(cur + 1);
      return { ok: true, utiles: cur + 1 };
    }
  }
  return { ok: false, error: 'not_found' };
}

function cleanUrl_(u) {
  u = String(u || '').trim();
  return /^https?:\/\//i.test(u) ? u.slice(0, 300) : '';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
                       .setMimeType(ContentService.MimeType.JSON);
}

/* ---- Enregistre une visite de page dans l'onglet "Stats visites" ---- */
function trackPageView_(view, session) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(STATS_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(STATS_SHEET_NAME);
    sh.appendRow(['timestamp', 'vue', 'session']);
    sh.setFrozenRows(1);
  }
  sh.appendRow([new Date().toISOString(), view, session]);
  return json_({ ok: true });
}

/* ---- Renvoie les stats agrégées des visites ---- */
function getStats_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(STATS_SHEET_NAME);
  if (!sh || sh.getLastRow() < 2) return json_({ total: 0, sessions: 0, vues: {} });
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
  const vues = {}, sessions = new Set();
  rows.forEach(([, vue, session]) => {
    if (vue) vues[String(vue)] = (vues[String(vue)] || 0) + 1;
    if (session) sessions.add(String(session));
  });
  const total = Object.values(vues).reduce((a, b) => a + b, 0);
  return json_({ total, sessions: sessions.size, vues });
}

/* ---- À exécuter UNE FOIS depuis l'éditeur pour accorder les autorisations ---- */
function autoriserAcces() {
  getCaptureFolder_();                              // déclenche l'autorisation Drive
  SpreadsheetApp.getActiveSpreadsheet().getName();  // déclenche l'autorisation Sheets
}
