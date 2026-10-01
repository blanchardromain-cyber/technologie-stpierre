/* Test hors Google de la synchronisation entre deux postes du professeur : une note
   ou un statut posés sur un poste doivent apparaître sur l'autre, et un clic ✅ / ❌
   ne doit pas effacer au classeur une note posée ailleurs.

   Le VRAI backend (apps-script-backend.gs) tourne dans un faux Google ; deux postes
   professeur exécutent le VRAI cloudSync, getSubs et updSub d'index.html, chacun avec
   SON localStorage (un stockage partagé masquerait la perte). fetch est branché sur le
   faux backend et refuse toute autre adresse : rien ne part vers la production (règle 4).

   Lancer (Node de Playwright, pas de Node dans le PATH du poste) :
     …\Python312\Lib\site-packages\playwright\driver\node.exe outils/test_fusion_prof.js
*/
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var RACINE = path.join(__dirname, "..");
var SOURCE_GS = fs.readFileSync(path.join(RACINE, "apps-script-backend.gs"), "utf8");
var SOURCE_HTML = fs.readFileSync(path.join(RACINE, "index.html"), "utf8");
var URL_FAUSSE = "https://script.google.com/macros/s/FAUX-DEPLOIEMENT/exec";
var HORS_CONTRAT = [];     // toute adresse autre que le faux déploiement, tous scénarios

// ---------------------------------------------------------------- horloge commune
var horloge = { t: Date.parse("2026-10-01T08:00:00.000Z") };
function avancer(min) { horloge.t += min * 60000; }
class FauxDate extends Date {
  constructor() { if (arguments.length) super(...arguments); else super(horloge.t); }
  static now() { return horloge.t; }
}

// ---------------------------------------------------------------- faux Google
function fauxGoogle() {
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
          for (var c = 0; c < nc; c++) {
            if (v[r][c] !== null && typeof v[r][c] === "object") throw new Error("setValues : objet en cellule");
            g[r0 + r][c0 + c] = v[r][c];
          }
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
  var props = {};
  var ctx = {
    SpreadsheetApp: { getActiveSpreadsheet: function () { return { getSheetByName: function () { return feuille; }, insertSheet: function () { return feuille; } }; } },
    LockService: { getScriptLock: function () { return { waitLock: function () {}, releaseLock: function () {} }; } },
    PropertiesService: { getScriptProperties: function () { return {
      getProperty: function (k) { return props.hasOwnProperty(k) ? props[k] : null; },
      setProperty: function (k, v) { props[k] = String(v); } }; } },
    ContentService: { MimeType: { JSON: "json" }, createTextOutput: function (t) { return { texte: t, setMimeType: function () { return this; } }; } },
    MailApp: { sendEmail: function () {} },
    Utilities: { formatDate: function () { return ""; } },
    Session: { getScriptTimeZone: function () { return "Europe/Paris"; } },
    console: { log: function () {} }, JSON: JSON, Date: FauxDate
  };
  vm.createContext(ctx);
  vm.runInContext(SOURCE_GS, ctx, { filename: "apps-script-backend.gs" });
  var B = {
    SECRET: ctx.SHARED_SECRET,
    reseau: true,          // false : coupure réseau, les envois restent en file
    post: function (corps) { return JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(corps) } }).texte); },
    get: function (p) { return JSON.parse(ctx.doGet({ parameter: p }).texte); },
    copie: function (cap) {
      return (B.get({ action: "list", secret: B.SECRET }).subs || []).filter(function (s) { return s.cap === cap; })[0] || {};
    }
  };
  B.fetch = function (url, opts) {
    if (String(url).indexOf(URL_FAUSSE) !== 0) {
      HORS_CONTRAT.push(String(url));
      return Promise.reject(new Error("adresse hors du faux déploiement : " + url));
    }
    if (!B.reseau) return Promise.reject(new Error("réseau coupé"));
    var rep;
    if (opts && opts.method === "POST") rep = B.post(JSON.parse(opts.body));
    else {
      var p = {};
      new URL(url).searchParams.forEach(function (v, k) { p[k] = v; });
      rep = B.get(p);
    }
    return Promise.resolve({ json: function () { return Promise.resolve(JSON.parse(JSON.stringify(rep))); } });
  };
  return B;
}

// ------------------------------------------- vrai code d'index.html, par poste
function extraireFonction(nom) {
  var i = SOURCE_HTML.indexOf("function " + nom + "(");
  if (i < 0) throw new Error("index.html : fonction " + nom + " introuvable");
  var j = SOURCE_HTML.indexOf("{", i), prof = 0;
  for (var k = j; k < SOURCE_HTML.length; k++) {
    if (SOURCE_HTML[k] === "{") prof++;
    else if (SOURCE_HTML[k] === "}" && --prof === 0) return SOURCE_HTML.slice(i, k + 1);
  }
  throw new Error("index.html : fin de " + nom + " introuvable");
}
function extraireCloudSync() {
  var i = SOURCE_HTML.indexOf("var cloudSync = (function () {");
  var j = SOURCE_HTML.indexOf("\n})();", i);          // fin en début de ligne (les IIFE internes sont indentées)
  if (i < 0 || j < 0) throw new Error("index.html : bloc cloudSync introuvable");
  return SOURCE_HTML.slice(i, j + 6);
}
var CODE_POSTE = [extraireCloudSync()].concat(["getSubs", "estSessionProf", "updSub"].map(extraireFonction)).join("\n");

function poste(B) {
  var stock = {};
  var ctx = {
    JSON: JSON, Date: FauxDate, URL: URL, console: { warn: function () {}, log: function () {} },
    location: { hostname: "site-techno.github.io" },
    localStorage: {
      getItem: function (k) { return stock.hasOwnProperty(k) ? stock[k] : null; },
      setItem: function (k, v) { stock[k] = String(v); },
      removeItem: function (k) { delete stock[k]; }
    },
    APPS_SCRIPT_URL: URL_FAUSSE, SYNC_SECRET: B.SECRET,
    isProf: true, isCollegue: false, fetch: B.fetch,
    signalerCleProf: function () {}, toast: function () {}, renderStats: function () {}, renderSubs: function () {},
    reporterNoteSiEvaluee: function () {}
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(CODE_POSTE, ctx, { filename: "index.html (extraits)" });
  return {
    sync: function () { return new Promise(function (ok) { ctx.cloudSync.pull(function (r) { ok(r); }); }); },
    envoyer: function (sub) {
      var s = ctx.getSubs().filter(function (x) { return x.id !== sub.id; }).concat([sub]);
      stock.subs = JSON.stringify(s);
      return new Promise(function (ok) { ctx.cloudSync.send(sub, ok); });
    },
    clic: function (cap, st) {
      var s = this.copie(cap);
      ctx.updSub(s.id, st);
      return new Promise(function (ok) { setTimeout(ok, 0); });   // laisse partir le POST
    },
    copie: function (cap) { return ctx.getSubs().filter(function (s) { return s.cap === cap; })[0]; },
    poser: function (subs) { stock.subs = JSON.stringify(subs); },
    file: function () { return JSON.parse(stock.subs_offline_queue || "[]"); }
  };
}

// ---------------------------------------------------------------- scénarios
var echecs = 0, total = 0;
function ok(cond, msg) { total++; if (!cond) echecs++; console.log((cond ? "  ok    " : "  ÉCHEC ") + msg); }

var PTS = { A: 4, B: 3.5, C: 7 };
function copieEleve(cap, extra) {
  var s = { id: 111, eid: "test.eleve", ename: "Test Eleve", ecls: "4A", cap: cap, caplbl: cap,
    score: 0, qcmTot: 20, date: "01/10/2026", dateISO: "2026-10-01T08:00:00.000Z", status: "pending",
    fields: { q1: "réponse" } };
  for (var k in extra) s[k] = extra[k];
  return s;
}
function notee(s, extra) {
  var c = JSON.parse(JSON.stringify(s));
  c.adjustedPts = PTS; c.adjustedScore = 14.5; c.bareme = 20; c.scoreBrut = 14.5;
  c.appreciation = "Bon travail, justifie davantage la partie C."; c.status = "validated";
  for (var k in extra) c[k] = extra[k];
  return c;
}
function eleveEnvoie(B, s) { return B.post({ secret: B.SECRET, sub: s }); }

(async function () {
  var B, A, P;

  console.log("1. Note posée sur le poste B, après validation sur le poste A");
  B = fauxGoogle(); A = poste(B); P = poste(B);
  eleveEnvoie(B, copieEleve("eval2-5e"));
  await A.sync(); await A.clic("eval2-5e", "validated");
  avancer(1); await P.sync(); await P.envoyer(notee(P.copie("eval2-5e")));
  avancer(5); await A.sync();
  var c = A.copie("eval2-5e");
  ok(c.adjustedScore === 14.5 && c.bareme === 20 && c.appreciation, "le poste A affiche la note posée sur B");
  ok(JSON.stringify(c.adjustedPts) === JSON.stringify(PTS), "… avec le détail des points");

  console.log("2. Clic ✅ sur un poste resté avec une note vide (« » reçu pendant l'incident)");
  B = fauxGoogle(); A = poste(B); P = poste(B);
  eleveEnvoie(B, copieEleve("eval2-5e"));
  A.poser([copieEleve("eval2-5e", { adjustedScore: "", appreciation: "", status: "rejected" })]);
  await P.sync(); await P.envoyer(notee(P.copie("eval2-5e")));
  avancer(5); await A.clic("eval2-5e", "validated");          // sans resynchroniser
  c = B.copie("eval2-5e");
  ok(c.status === "validated", "le statut du clic arrive au classeur");
  ok(c.adjustedScore === 14.5 && c.appreciation && c.bareme === 20, "la note posée sur B reste au classeur");
  ok(A.copie("eval2-5e").adjustedScore === "", "le clic ne touche pas la copie locale au-delà du statut");

  console.log("3. L'élève refait une copie « à revoir »");
  B = fauxGoogle(); A = poste(B);
  eleveEnvoie(B, copieEleve("eval2-5e"));
  await A.sync(); await A.clic("eval2-5e", "rejected");
  avancer(30);
  eleveEnvoie(B, copieEleve("eval2-5e", { id: 222, dateISO: new FauxDate().toISOString(), fields: { q1: "nouvelle réponse" } }));
  avancer(5); await A.sync();
  c = A.copie("eval2-5e");
  ok(c && c.status === "pending" && c.fields.q1 === "nouvelle réponse", "le poste A voit le nouveau travail, en attente");

  console.log("4. Statut changé sur un autre poste");
  B = fauxGoogle(); A = poste(B); P = poste(B);
  eleveEnvoie(B, copieEleve("eval2-5e"));
  await A.sync(); await A.clic("eval2-5e", "validated");
  avancer(5); await P.sync(); await P.clic("eval2-5e", "rejected");
  avancer(5); await A.sync();
  ok(A.copie("eval2-5e").status === "rejected", "le poste A voit « à revoir »");

  console.log("5. Modification locale pas encore arrivée au classeur");
  B = fauxGoogle(); A = poste(B); P = poste(B);
  eleveEnvoie(B, copieEleve("eval2-5e"));
  await A.sync(); await P.sync();
  B.reseau = false; await A.envoyer(notee(A.copie("eval2-5e"), { adjustedScore: 16 })); B.reseau = true;
  await P.envoyer(notee(P.copie("eval2-5e")));
  avancer(5); await A.sync();
  ok(A.file().length === 1, "la note de A attend dans la file");
  ok(A.copie("eval2-5e").adjustedScore === 16, "la relecture ne l'écrase pas");

  console.log("6. Envoi tout juste parti de ce poste (relecture partie trop tôt)");
  B = fauxGoogle(); A = poste(B); P = poste(B);
  eleveEnvoie(B, copieEleve("eval2-5e"));
  await A.sync(); await P.sync();
  await A.envoyer(notee(A.copie("eval2-5e"), { adjustedScore: 16 }));
  await P.envoyer(notee(P.copie("eval2-5e")));                  // écrit entre-temps
  avancer(1); await A.sync();
  ok(A.copie("eval2-5e").adjustedScore === 16, "moins de 2 min après l'envoi : la version de ce poste prime");
  avancer(5); await A.sync();
  ok(A.copie("eval2-5e").adjustedScore === 14.5, "passé 2 min : le classeur fait foi");

  console.log("7. Note d'avant le patch, connue de ce seul poste");
  B = fauxGoogle(); A = poste(B);
  eleveEnvoie(B, copieEleve("eval2-5e", { status: "validated" }));
  A.poser([notee(copieEleve("eval2-5e"), { adjustedScore: 12, appreciation: "Note locale" })]);
  avancer(5); await A.sync();
  c = A.copie("eval2-5e");
  ok(c.adjustedScore === 12 && c.appreciation === "Note locale" && c.bareme === 20, "le classeur sans note ne l'efface pas");

  console.log("8. Non-régression");
  B = fauxGoogle(); A = poste(B);
  eleveEnvoie(B, copieEleve("eval2-5e"));
  await A.sync(); await A.clic("eval2-5e", "validated");
  B.post({ secret: B.SECRET, action: "lock", keys: [{ eid: "test.eleve", cap: "eval2-5e" }], locked: true, by: "prof" });
  avancer(5); await A.sync();
  ok(A.copie("eval2-5e").locked === true, "un verrou posé ailleurs apparaît");
  A.poser([copieEleve("eval2-5e"), copieEleve("p11-ex1", { id: 333, dateISO: "2026-09-01T08:00:00.000Z" })]);
  avancer(5); await A.sync();
  ok(!A.copie("p11-ex1"), "une copie supprimée du classeur disparaît du poste");
  B = fauxGoogle(); A = poste(B);
  eleveEnvoie(B, copieEleve("eval2-5e"));
  A.poser([copieEleve("eval2-5e", { dateISO: "2026-10-01T09:00:00.000Z", fields: { q1: "plus récente" } })]);
  await A.sync();
  ok(A.copie("eval2-5e").fields.q1 === "plus récente", "une copie locale plus récente que le classeur est gardée");

  console.log("9. Règle 4");
  ok(HORS_CONTRAT.length === 0, "aucune requête hors du faux déploiement");

  console.log("\n" + (total - echecs) + "/" + total + " contrôles passent" + (echecs ? " — " + echecs + " ÉCHEC(S)" : ""));
  process.exit(echecs ? 1 : 0);
})().catch(function (e) { console.error(e); process.exit(2); });
