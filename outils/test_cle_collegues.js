/* Test hors Google de la clé par collègue (spec 2026-10-07-cle-collegues) : le VRAI
   apps-script-backend.gs tourne dans un faux Google ; plus bas, le VRAI cloudSync
   d'index.html, un navigateur par scénario. fetch est branché sur le faux déploiement
   et refuse toute autre adresse : rien ne part vers la production (règle 4).
   Les clés sont factices.

   Lancer (Node de Playwright, pas de Node dans le PATH du poste) :
     …\Python312\Lib\site-packages\playwright\driver\node.exe outils/test_cle_collegues.js
*/
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var RACINE = path.join(__dirname, "..");
var SOURCE_GS = fs.readFileSync(path.join(RACINE, "apps-script-backend.gs"), "utf8");
var SOURCE_HTML = fs.readFileSync(path.join(RACINE, "index.html"), "utf8");
var URL_FAUSSE = "https://script.google.com/macros/s/FAUX-DEPLOIEMENT/exec";
var HORS_CONTRAT = [];
var CLE_PROF = "cle-prof-de-test-0001", CLE_REGIS = "cle-regis-de-test-0002";
var REGIS = JSON.stringify({ cle: CLE_REGIS, classes: ["5B", "5C", "5D", "5E", "5F"] });

// ---------------------------------------------------------------- faux Google
function fauxGoogle(props) {
  var g = [];
  var largeur = function () { return g.reduce(function (m, l) { return Math.max(m, l.length); }, 0); };
  function cell(r, c) { var v = (g[r] || [])[c]; return v === undefined || v === null ? "" : v; }
  function plage(r0, c0, nr, nc) {
    return {
      getValues: function () {
        var out = [];
        for (var r = 0; r < nr; r++) { var l = []; for (var c = 0; c < nc; c++) l.push(cell(r0 + r, c0 + c)); out.push(l); }
        return out;
      },
      setValues: function (v) {
        for (var r = 0; r < nr; r++) {
          while (g.length <= r0 + r) g.push([]);
          for (var c = 0; c < nc; c++) g[r0 + r][c0 + c] = v[r][c];
        }
      }
    };
  }
  var feuille = {
    getLastRow: function () { return g.length; },
    getMaxColumns: function () { return largeur(); },
    getLastColumn: function () { return largeur(); },
    insertColumnsAfter: function () {},
    getRange: function (r, c, nr, nc) { return plage(r - 1, c - 1, nr || 1, nc || 1); },
    getDataRange: function () { return plage(0, 0, g.length, largeur()); },
    appendRow: function (row) { g.push(row.slice()); },
    deleteRow: function (r) { g.splice(r - 1, 1); },
    setFrozenRows: function () {}
  };
  props = props || {};
  var journal = [];
  var ctx = {
    SpreadsheetApp: { getActiveSpreadsheet: function () { return { getSheetByName: function () { return feuille; }, insertSheet: function () { return feuille; } }; } },
    LockService: { getScriptLock: function () { return { waitLock: function () {}, releaseLock: function () {} }; } },
    PropertiesService: { getScriptProperties: function () { return {
      getProperty: function (k) { return props.hasOwnProperty(k) ? props[k] : null; },
      getProperties: function () { var c = {}; for (var k in props) c[k] = props[k]; return c; },
      setProperty: function (k, v) { props[k] = String(v); } }; } },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: function (t) { return { texte: t, setMimeType: function () { return this; } }; } },
    MailApp: { sendEmail: function () {} },
    Utilities: { formatDate: function () { return ""; } },
    Session: { getScriptTimeZone: function () { return "Europe/Paris"; } },
    console: { log: function (m) { journal.push(String(m)); } }, JSON: JSON, Date: Date
  };
  vm.createContext(ctx);
  vm.runInContext(SOURCE_GS, ctx, { filename: "apps-script-backend.gs" });
  var B = {
    SECRET: ctx.SHARED_SECRET, props: props, journal: journal,
    post: function (corps) { return JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(corps) } }).texte); },
    get: function (p) { return JSON.parse(ctx.doGet({ parameter: p }).texte); }
  };
  B.fetch = function (url, opts) {
    if (String(url).indexOf(URL_FAUSSE) !== 0) {
      HORS_CONTRAT.push(String(url));
      return Promise.reject(new Error("adresse hors du faux déploiement : " + url));
    }
    var rep;
    if (opts && opts.method === "POST") rep = B.post(JSON.parse(opts.body));
    else { var p = {}; new URL(url).searchParams.forEach(function (v, k) { p[k] = v; }); rep = B.get(p); }
    return Promise.resolve({ json: function () { return Promise.resolve(JSON.parse(JSON.stringify(rep))); } });
  };
  return B;
}

var echecs = 0, total = 0;
function ok(cond, msg) { total++; if (!cond) echecs++; console.log((cond ? "  ok    " : "  ÉCHEC ") + msg); }

var N = 0;
function copie(eid, ecls, cap, extra) {
  var s = { id: ++N, eid: eid, ename: eid, ecls: ecls, cap: cap || "eval2-5e", caplbl: "x", score: 0, qcmTot: 20,
    date: "07/10/2026", dateISO: "2026-10-07T08:00:00.000Z", status: "pending", fields: { q1: "r" } };
  for (var k in extra) s[k] = extra[k];
  return s;
}
function classeur(props) {
  var B = fauxGoogle(props);
  [copie("a.cinqc", "5C"), copie("b.cinqf", "5F"), copie("c.cinqa", "5A"), copie("d.quatrea", "4A"),
   copie("e.espace", " 5c ")].forEach(function (s) { B.post({ secret: B.SECRET, sub: s }); });
  return B;
}
function eids(rep) { return (rep.subs || []).map(function (s) { return s.eid; }).sort().join(","); }
function lister(B, cle) {
  var p = { action: "list", secret: B.SECRET };
  if (cle !== undefined) p.key = cle;
  return B.get(p);
}

(async function () {
  var B, r;

  console.log("1. Serveur — action list");
  B = classeur({ PROF_KEY: CLE_PROF, "COLLEGUE_regis.lucas": REGIS });
  r = lister(B, CLE_PROF);
  ok(r.ok && eids(r) === "a.cinqc,b.cinqf,c.cinqa,d.quatrea,e.espace", "clé professeur : toutes les copies (inchangé)");
  r = lister(B, CLE_REGIS);
  ok(r.ok && eids(r) === "a.cinqc,b.cinqf,e.espace", "clé de Régis : 5C, 5F et « 5c » avec espaces, rien d'autre");
  r = lister(B, "cle-inconnue-de-test-9999");
  ok(!r.ok && r.error === "bad_prof_key", "clé inconnue : bad_prof_key (inchangé)");
  r = lister(B);
  ok(!r.ok && r.error === "prof_key_required", "sans clé : prof_key_required (inchangé)");

  console.log("2. Serveur — entrées de collègue invalides ignorées");
  B = classeur({ PROF_KEY: CLE_PROF, "COLLEGUE_court": JSON.stringify({ cle: "court", classes: ["5A"] }) });
  ok(lister(B, "court").error === "bad_prof_key", "clé de moins de 12 caractères refusée");
  ok(B.journal.some(function (m) { return m.indexOf("COLLEGUE_court") >= 0; }), "… et signalée au journal");
  B = classeur({ PROF_KEY: CLE_PROF, "COLLEGUE_vide": JSON.stringify({ cle: "cle-vide-de-test-0003", classes: [] }) });
  ok(lister(B, "cle-vide-de-test-0003").error === "bad_prof_key", "entrée sans classes refusée");
  B = classeur({ PROF_KEY: CLE_PROF, "COLLEGUE_casse": "{pas du json" });
  ok(lister(B, CLE_PROF).ok, "propriété illisible : la clé professeur marche toujours");
  ok(lister(B, "{pas du json").error === "bad_prof_key", "propriété illisible : rien n'est ouvert");

  console.log("3. Serveur — sans PROF_KEY (inchangé)");
  B = classeur({ "COLLEGUE_regis.lucas": REGIS });
  ok(eids(lister(B)).split(",").length === 5, "liste ouverte sans clé, comme aujourd'hui");

  /* __SCENARIOS_PAGE__ (Task 2) */

  console.log("9. Règle 4");
  ok(HORS_CONTRAT.length === 0, "aucune requête hors du faux déploiement");

  console.log("\n" + (total - echecs) + "/" + total + " contrôles passent" + (echecs ? " — " + echecs + " ÉCHEC(S)" : ""));
  process.exit(echecs ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(2); });
