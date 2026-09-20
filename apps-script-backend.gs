/**
 * Backend Apps Script — Site Techno R. Blanchard
 * ----------------------------------------------------------------
 * Reçoit les soumissions des élèves (POST) et les sert au prof (GET).
 * Stockage : feuille Google Sheets attachée à ce script.
 *
 * Déploiement : voir DEPLOIEMENT-APPS-SCRIPT.md
 * ----------------------------------------------------------------
 */

// === Configuration ============================================
// Ce secret DOIT correspondre à SYNC_SECRET dans index.html.
// Il filtre les requêtes (anti-bot basique, pas du chiffrement).
var SHARED_SECRET = 'TECHNO-RB-2026-12MAI';

// Nom de la feuille où sont écrites les soumissions
var SHEET_NAME = 'Submissions';

// === Notifications mail ========================================
// Email par défaut du prof + activation par défaut.
// Modifiable depuis le modal Prof > onglet Config (stocké dans PropertiesService).
var DEFAULT_NOTIF_EMAIL = 'blanchard.romain@stpierre85.com';
var DEFAULT_NOTIF_ENABLED = true;

// Colonnes (ordre figé — ne pas changer sans migrer l'existant)
var COLUMNS = [
  'dateISO', 'date', 'eid', 'ename', 'ename2', 'ecls',
  'cap', 'caplbl', 'score', 'qcmTot',
  'scoreDT', 'scorePR', 'scorePG',
  'open', 'fields_json', 'status', 'id',
  // VERROU — ajoutees EN FIN de liste. Doivent rester consecutives.
  'locked', 'lockedAt', 'lockedBy'
];

// VERROU — Champs renvoyes a l'eleve pour une copie verrouillee (action "own").
var META_ELEVE = [
  'id', 'eid', 'ename', 'ename2', 'ecls', 'cap', 'caplbl', 'date', 'dateISO', 'status',
  'score', 'qcmTot', 'scoreDT', 'scorePR', 'scorePG', 'scoreBrut',
  'adjustedScore', 'adjustedPts', 'bareme', 'appreciation'
];

// ================================================================
// doPost — l'élève soumet son travail
// ================================================================
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    if (body.secret !== SHARED_SECRET) {
      return _json({ ok: false, error: 'bad_secret' });
    }
    // === Handler config notifications (action:"notif_settings") ===========
    // Le prof modifie ses préférences d'alerte mail depuis l'UI.
    // Stockage dans PropertiesService (persistant entre déploiements).
    if (body.action === 'notif_settings') {
      var props = PropertiesService.getScriptProperties();
      if (body.settings) {
        if (body.settings.enabled !== undefined) {
          props.setProperty('NOTIF_ENABLED', body.settings.enabled ? '1' : '0');
        }
        if (body.settings.email !== undefined && body.settings.email !== null) {
          props.setProperty('NOTIF_EMAIL', String(body.settings.email).trim());
        }
      }
      return _json({
        ok: true,
        settings: {
          enabled: _getNotifEnabled(),
          email: _getNotifEmail()
        }
      });
    }

    // === VERROU — Capsules armees (action:"verrous_config") ===============
    // Une capsule armee fait naitre verrouillee toute copie qui arrive ensuite.
    // Cle EXIGEE pour ecrire, meme si PROF_KEY n'est pas encore posee : sinon le
    // secret public suffirait a desarmer une capsule avant l'evaluation.
    if (body.action === 'verrous_config') {
      var cleA = PropertiesService.getScriptProperties().getProperty('PROF_KEY');
      if (!cleA) return _json({ ok: false, error: 'prof_key_required' });
      if (body.key !== cleA) return _json({ ok: false, error: 'bad_prof_key' });
      var capsA = Array.isArray(body.caps) ? body.caps.map(String) : [];
      PropertiesService.getScriptProperties().setProperty('CAPSULES_ARMEES', JSON.stringify(capsA));
      return _json({ ok: true, caps: capsA });
    }

    // === VERROU — Handler verrouillage (action:"lock") =====================
    if (body.action === 'lock') {
      var keys = Array.isArray(body.keys) ? body.keys : [];
      if (!keys.length) return _json({ ok: false, error: 'no_keys' });
      var voulu = body.locked === true;
      var quand = voulu ? String(body.at || new Date().toISOString()) : '';
      var par = voulu ? String(body.by || '').replace(/^([=+@])/, ' $1') : '';
      var cibles = {};
      keys.forEach(function (k) { if (k && k.eid && k.cap) cibles[String(k.eid) + '::' + String(k.cap)] = true; });
      var iE = COLUMNS.indexOf('eid'), iC = COLUMNS.indexOf('cap'), iL = COLUMNS.indexOf('locked');
      if (iL < 0 || COLUMNS.indexOf('lockedAt') !== iL + 1 || COLUMNS.indexOf('lockedBy') !== iL + 2) {
        return _json({ ok: false, error: 'colonnes_verrou_absentes' });
      }
      var verrouL = LockService.getScriptLock();
      verrouL.waitLock(20000);
      try {
        var shL = _getSheet();
        var lastL = shL.getLastRow();
        if (lastL < 2) return _json({ ok: true, updated: 0 });
        var dataL = shL.getRange(2, 1, lastL - 1, COLUMNS.length).getValues();
        var n = 0;
        for (var r = 0; r < dataL.length; r++) {
          if (!cibles[String(dataL[r][iE]) + '::' + String(dataL[r][iC])]) continue;
          dataL[r][iL] = voulu; dataL[r][iL + 1] = quand; dataL[r][iL + 2] = par;
          n++;
        }
        // Un seul appel au classeur : les 3 colonnes du verrou, toutes lignes.
        shL.getRange(2, iL + 1, dataL.length, 3)
           .setValues(dataL.map(function (l) { return [l[iL], l[iL + 1], l[iL + 2]]; }));
        return _json({ ok: true, updated: n });
      } finally {
        verrouL.releaseLock();
      }
    }

    // === Handler suppression (action:"delete") ============================
    // Le prof a cliqué sur 🗑️ — on supprime la ligne du Sheet correspondant
    // à l'id de soumission (ou au couple eid+cap en fallback).
    if (body.action === 'delete') {
      var sheetDel = _getSheet();
      var valuesDel = sheetDel.getDataRange().getValues();
      if (valuesDel.length < 2) return _json({ ok: true, action: 'deleted', removed: 0 });
      var headerDel = valuesDel[0];
      var idCol  = headerDel.indexOf('id');
      var eidCol = headerDel.indexOf('eid');
      var capCol = headerDel.indexOf('cap');
      var removed = 0;
      // Parcours de bas en haut : permet de deleteRow sans décaler les indices restants
      for (var r = valuesDel.length - 1; r >= 1; r--) {
        var rowId  = String(valuesDel[r][idCol]);
        var rowEid = String(valuesDel[r][eidCol]);
        var rowCap = String(valuesDel[r][capCol]);
        if ((body.id && rowId === String(body.id)) ||
            (body.eid && body.cap && rowEid === String(body.eid) && rowCap === String(body.cap))) {
          sheetDel.deleteRow(r + 1); // +1 car les indices Sheets sont 1-based
          removed++;
        }
      }
      return _json({ ok: true, action: 'deleted', removed: removed });
    }
    var sub = body.sub;
    if (!sub || !sub.cap || !sub.eid) {
      return _json({ ok: false, error: 'invalid_payload' });
    }
    var sheet = _getSheet();
    var row = COLUMNS.map(function (col) {
      if (col === 'fields_json') {
        return sub.fields ? JSON.stringify(sub.fields) : '';
      }
      // VERROU — jamais repris du payload : _upsert recopie la valeur deja en place.
      if (col === 'locked' || col === 'lockedAt' || col === 'lockedBy') return '';
      var v = sub[col];
      return (v === undefined || v === null) ? '' : v;
    });
    // Upsert : si même eid+cap existe déjà, on remplace la ligne
    // VERROU — sub._parProf : envoi fait depuis une session professeur (absent de
    // COLUMNS, donc jamais ecrit). Sans lui, une copie verrouillee n'est pas remplacee.
    var wasNew = _upsert(sheet, sub.eid, sub.cap, row, sub._parProf === true);
    if (wasNew === 'locked') return _json({ ok: false, error: 'locked' });
    /* Notification mail au prof pour les nouvelles soumissions élèves uniquement
       (on n'envoie pas de mail lors d'un simple changement de statut prof) */
    if (wasNew && sub.status === 'pending') {
      try { _notifyProf(sub); } catch (mailErr) {
        // ne bloque pas la soumission en cas d'échec mail
      }
    }
    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

// ================================================================
// doGet — le prof récupère la liste, ou ping
// ================================================================
function doGet(e) {
  var p = e.parameter || {};
  if (p.action === 'ping') {
    return _json({ ok: true, pong: new Date().toISOString() });
  }
  if (p.action === 'notif_settings') {
    /* Lecture des préférences notification — accessible avec le secret */
    if (p.secret !== SHARED_SECRET) {
      return _json({ ok: false, error: 'bad_secret' });
    }
    return _json({
      ok: true,
      settings: {
        enabled: _getNotifEnabled(),
        email: _getNotifEmail()
      }
    });
  }
  if (p.action === 'list') {
    if (p.secret !== SHARED_SECRET) {
      return _json({ ok: false, error: 'bad_secret' });
    }
    // VERROU — Liste complete reservee au professeur des que PROF_KEY existe.
    var cleProf = PropertiesService.getScriptProperties().getProperty('PROF_KEY');
    if (cleProf && p.key !== cleProf) {
      return _json({ ok: false, error: p.key ? 'bad_prof_key' : 'prof_key_required' });
    }
    return _json({ ok: true, subs: _toutesLesSubs() });
  }

  // VERROU — Capsules armees : lecture de la liste (reservee au professeur).
  if (p.action === 'verrous_config') {
    if (p.secret !== SHARED_SECRET) {
      return _json({ ok: false, error: 'bad_secret' });
    }
    if (!_cleProfOk(p.key)) {
      return _json({ ok: false, error: p.key ? 'bad_prof_key' : 'prof_key_required' });
    }
    return _json({ ok: true, caps: _capsArmees() });
  }

  // VERROU — Copies d'UN eleve ; copie verrouillee = metadonnees sans le travail.
  if (p.action === 'own') {
    if (p.secret !== SHARED_SECRET) {
      return _json({ ok: false, error: 'bad_secret' });
    }
    if (!p.eid) return _json({ ok: false, error: 'eid_required' });
    var siennes = _toutesLesSubs().filter(function (o) { return String(o.eid) === String(p.eid); });
    return _json({ ok: true, subs: siennes.map(function (o) {
      var verrouille = o.locked === true || String(o.locked).toUpperCase() === 'TRUE';
      if (!verrouille) { delete o.lockedAt; delete o.lockedBy; return o; }
      var m = { locked: true };
      META_ELEVE.forEach(function (k) { if (o[k] !== undefined) m[k] = o[k]; });
      return m;
    }) });
  }

  return _json({ ok: false, error: 'unknown_action' });
}

// VERROU — Corps de l'ancienne action "list", partage par "list" et "own".
function _toutesLesSubs() {
  var sheet = _getSheet();
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var subs = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[i][j];
    }
    // Re-hydrate fields
    if (obj.fields_json) {
      try { obj.fields = JSON.parse(obj.fields_json); } catch (er) { obj.fields = {}; }
    }
    delete obj.fields_json;
    subs.push(obj);
  }
  return subs;
}

// ================================================================
// Helpers internes
// ================================================================
function _getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
  }
  _assurerEntetes(sheet);
  return sheet;
}

// VERROU — Ecrit en ligne 1 le nom des colonnes ajoutees (cellules vides seulement ;
// un en-tete existant n'est jamais modifie). Sans en-tete, "list" ignorerait la colonne.
function _assurerEntetes(sheet) {
  var n = COLUMNS.length;
  if (sheet.getMaxColumns() < n) sheet.insertColumnsAfter(sheet.getMaxColumns(), n - sheet.getMaxColumns());
  var h = sheet.getRange(1, 1, 1, n).getValues()[0], change = false;
  for (var j = 0; j < n; j++) {
    if (h[j] === '' || h[j] === null) { h[j] = COLUMNS[j]; change = true; }
  }
  if (change) sheet.getRange(1, 1, 1, n).setValues([h]);
}

/* Renvoie true si nouvelle ligne (creation), false si remplacement (update),
   'locked' si la copie est verrouillee et que l'envoi ne vient pas du professeur.
   VERROU — sous LockService, pour qu'un verrouillage simultane ne soit pas ecrase. */
function _upsert(sheet, eid, cap, row, parProf) {
  var verrou = LockService.getScriptLock();
  verrou.waitLock(20000);
  try {
    var last = sheet.getLastRow();
    if (last < 2) {
      sheet.appendRow(_naissanceVerrouillee(row, cap));
      return true;
    }
    var data = sheet.getRange(2, 1, last - 1, COLUMNS.length).getValues();
    var eidCol = COLUMNS.indexOf('eid');
    var capCol = COLUMNS.indexOf('cap');
    var iL = COLUMNS.indexOf('locked');
    for (var i = 0; i < data.length; i++) {
      if (data[i][eidCol] === eid && data[i][capCol] === cap) {
        var verrouillee = data[i][iL] === true || String(data[i][iL]).toUpperCase() === 'TRUE';
        if (verrouillee && !parProf) return 'locked';
        ['locked', 'lockedAt', 'lockedBy'].forEach(function (c) {
          var k = COLUMNS.indexOf(c); row[k] = data[i][k];
        });
        sheet.getRange(i + 2, 1, 1, COLUMNS.length).setValues([row]);
        return false;
      }
    }
    sheet.appendRow(_naissanceVerrouillee(row, cap));
    return true;
  } finally {
    verrou.releaseLock();
  }
}
// VERROU — Capsules armées : toute copie qui ARRIVE sur l'une d'elles naît
// verrouillée. La liste est une propriété de script, aucune colonne n'est utilisée.
function _capsArmees() {
  try {
    var v = PropertiesService.getScriptProperties().getProperty('CAPSULES_ARMEES');
    var a = v ? JSON.parse(v) : [];
    return Array.isArray(a) ? a : [];
  } catch (e) { return []; }
}
function _cleProfOk(fournie) {
  var cle = PropertiesService.getScriptProperties().getProperty('PROF_KEY');
  return !cle || fournie === cle;
}
// Pose le verrou sur une ligne EN COURS DE CRÉATION si sa capsule est armée.
function _naissanceVerrouillee(row, cap) {
  if (_capsArmees().indexOf(String(cap)) < 0) return row;
  var iL = COLUMNS.indexOf('locked');
  if (iL < 0) return row;
  row[iL] = true;
  row[iL + 1] = new Date().toISOString();
  row[iL + 2] = 'Verrouillage automatique';
  return row;
}
function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ================================================================
// Notifications mail — helpers
// ================================================================
function _getNotifEnabled() {
  var v = PropertiesService.getScriptProperties().getProperty('NOTIF_ENABLED');
  if (v === null || v === undefined) return DEFAULT_NOTIF_ENABLED;
  return v === '1';
}
function _getNotifEmail() {
  var v = PropertiesService.getScriptProperties().getProperty('NOTIF_EMAIL');
  return (v && v.length > 0) ? v : DEFAULT_NOTIF_EMAIL;
}
function _notifyProf(sub) {
  if (!_getNotifEnabled()) return;
  var to = _getNotifEmail();
  if (!to) return;
  var lbl = sub.caplbl || sub.cap || '';
  var dateFr = '';
  try {
    var d = sub.dateISO ? new Date(sub.dateISO) : new Date();
    dateFr = Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  } catch (e) { dateFr = sub.date || ''; }
  var subject = '[Techno Saint-Pierre] Nouvelle soumission : ' + (sub.ename || sub.eid) + ' — ' + lbl;
  var fieldsCount = 0;
  if (sub.fields) {
    for (var k in sub.fields) {
      if (Object.prototype.hasOwnProperty.call(sub.fields, k) && String(sub.fields[k]||'').trim() !== '') fieldsCount++;
    }
  }
  var body = ''
    + 'Bonjour,\n\n'
    + 'Un élève vient de soumettre un travail :\n\n'
    + '  • Élève : ' + (sub.ename || sub.eid) + '\n'
    + '  • Classe : ' + (sub.ecls || '—') + '\n'
    + '  • Capsule : ' + lbl + '\n'
    + '  • Date : ' + dateFr + '\n'
    + (fieldsCount > 0 ? '  • Champs remplis : ' + fieldsCount + '\n' : '')
    + (sub.score !== undefined && sub.qcmTot ? '  • Score : ' + sub.score + ' / ' + sub.qcmTot + '\n' : '')
    + '\nOuvre le tableau de bord pour corriger :\n'
    + 'https://romainblanchard.github.io/site-techno/  (rubrique Prof)\n\n'
    + '— Notification automatique du Site Techno R.Blanchard';
  MailApp.sendEmail({
    to: to,
    subject: subject,
    body: body,
    name: 'Site Techno R.Blanchard'
  });
}
function testNotif() {
  _notifyProf({
    eid: 'test.eleve',
    ename: 'Test Élève',
    ecls: '4A',
    cap: 'p12-ex1',
    caplbl: 'P12 — Exercice n°1 (Distributeur de croquettes)',
    date: new Date().toLocaleDateString('fr-FR'),
    dateISO: new Date().toISOString(),
    status: 'pending',
    fields: {'ex1-a1':'test', 'ex1-a2':'test'}
  });
}
