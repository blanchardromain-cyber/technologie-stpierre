/* Test hors Google du backend Apps Script (apps-script-backend.gs) : la note posée
   par le professeur doit atteindre le classeur et redescendre à l'élève (règle 5).

   Le VRAI fichier .gs est chargé dans un faux Google (classeur en mémoire,
   LockService, PropertiesService…) ; la réponse « own » passe ensuite par la VRAIE
   fusion élève d'index.html (checkStudentStatusChanges, estCorrigee). Aucun accès
   réseau : rien ne part vers la production (règle 4).

   Lancer (Node de Playwright, pas de Node dans le PATH du poste) :
     …\Python312\Lib\site-packages\playwright\driver\node.exe outils/test_backend_note.js
*/
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var RACINE = path.join(__dirname, "..");
var SOURCE_GS = fs.readFileSync(path.join(RACINE, "apps-script-backend.gs"), "utf8");
var SOURCE_HTML = fs.readFileSync(path.join(RACINE, "index.html"), "utf8");

// En-têtes réels du classeur de production, relevés le 2026-10-01.
var ENTETES_PROD = ["dateISO", "date", "eid", "ename", "ename2", "ecls", "cap", "caplbl", "score", "qcmTot",
  "scoreDT", "scorePR", "scorePG", "open", "fields_json", "status", "id", "locked", "lockedAt", "lockedBy"];

// ---------------------------------------------------------------- faux Google
function fauxGoogle(lignes) {
  var g = lignes.map(function (l) { return l.slice(); });
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
        if (v.length !== nr || v.some(function (l) { return l.length !== nc; })) throw new Error("setValues : dimensions");
        for (var r = 0; r < nr; r++) {
          while (g.length <= r0 + r) g.push([]);
          for (var c = 0; c < nc; c++) {
            var x = v[r][c];
            if (x !== null && typeof x === "object") throw new Error("setValues : objet en cellule (" + JSON.stringify(x) + ")");
            g[r0 + r][c0 + c] = x;
          }
        }
      }
    };
  }
  var feuille = {
    getLastRow: function () { return g.length; },
    getMaxColumns: function () { return largeur(); },
    getLastColumn: function () { return largeur(); },
    insertColumnsAfter: function () { /* largeur implicite */ },
    getRange: function (r, c, nr, nc) { return plage(r - 1, c - 1, nr || 1, nc || 1); },
    getDataRange: function () { return plage(0, 0, g.length, largeur()); },
    appendRow: function (row) {
      row.forEach(function (x) { if (x !== null && typeof x === "object") throw new Error("appendRow : objet en cellule"); });
      g.push(row.slice());
    },
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
    MailApp: { sendEmail: function () { ctx.mails++; } },
    Utilities: { formatDate: function () { return ""; } },
    Session: { getScriptTimeZone: function () { return "Europe/Paris"; } },
    console: { log: function (m) { ctx.journal.push(String(m)); } }, journal: [], JSON: JSON, mails: 0
  };
  vm.createContext(ctx);
  vm.runInContext(SOURCE_GS, ctx, { filename: "apps-script-backend.gs" });
  var SECRET = ctx.SHARED_SECRET;
  return {
    grille: g, props: props, mails: function () { return ctx.mails; },
    post: function (corps) {
      corps.secret = SECRET;
      return JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(corps) } }).texte);
    },
    get: function (p) { p.secret = SECRET; return JSON.parse(ctx.doGet({ parameter: p }).texte); },
    COLUMNS: ctx.COLUMNS, SECRET: SECRET,
    diagnostic: function () {
      if (typeof ctx.diagnosticColonnes !== "function") return { ecarts: [null], journal: "" };   // backend d'avant le patch
      var e = ctx.diagnosticColonnes(); return { ecarts: e, journal: ctx.journal.join("\n") }; }
  };
}

// ------------------------------------------- vraie fusion élève d'index.html
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
function eleveFusionne(reponseOwn, localAvant) {
  var stock = { subs: JSON.stringify(localAvant || []) };
  var ctx = {
    user: { id: "test.eleve" }, isProf: false, JSON: JSON,
    localStorage: { getItem: function (k) { return stock.hasOwnProperty(k) ? stock[k] : null; }, setItem: function (k, v) { stock[k] = String(v); } },
    cloudSync: { hasUrl: function () { return true; }, fetchOwn: function (eid, cb) { cb(reponseOwn.subs); } },
    renderDash: function () {}, updMyStatus: function () {}, toastQ: function () {}
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(["getSubs", "estCorrigee", "copiesOrphelines", "checkStudentStatusChanges"].map(extraireFonction).join("\n"), ctx);
  ctx.checkStudentStatusChanges();
  var subs = ctx.getSubs();
  return { subs: subs, corrigee: function (cap) {
    var s = subs.filter(function (x) { return x.cap === cap; })[0];
    return ctx.estCorrigee(s) ? s : null;
  } };
}

// ---------------------------------------------------------------- scénarios
var echecs = 0, total = 0;
function ok(cond, msg) { total++; if (!cond) echecs++; console.log((cond ? "  ok    " : "  ÉCHEC ") + msg); }
function egal(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function une(rep, cap) { return (rep.subs || []).filter(function (s) { return s.cap === cap; })[0] || {}; }

var PTS = { A: 4, B: 3.5, C: 7 };
function copieEleve(cap, extra) {
  var s = { id: 111, eid: "test.eleve", ename: "Test Eleve", ecls: "4A", cap: cap, caplbl: cap,
    score: 0, qcmTot: 20, date: "01/10/2026", dateISO: "2026-10-01T08:00:00.000Z", status: "pending",
    fields: { q1: "réponse" } };
  for (var k in extra) s[k] = extra[k];
  return s;
}
function noteProf(s, extra) {
  var c = JSON.parse(JSON.stringify(s));
  c.adjustedPts = PTS; c.adjustedScore = 14.5; c.bareme = 20; c.scoreBrut = 14.5;
  c.appreciation = "Bon travail, justifie davantage la partie C."; c.status = "validated"; c._parProf = true;
  for (var k in extra) c[k] = extra[k];
  return c;
}

// Classeur de départ = la production : 20 colonnes, une copie déjà validée SANS note.
var vieille = ENTETES_PROD.map(function (h) {
  return { dateISO: "2026-09-28T08:00:00.000Z", eid: "test.eleve", cap: "p11-ex1", status: "validated",
    score: 19.5, qcmTot: 20, fields_json: "{\"a\":\"1\"}", id: 99, locked: false }[h];
}).map(function (v) { return v === undefined ? "" : v; });
var B = fauxGoogle([ENTETES_PROD, vieille]);

console.log("1. Le professeur enregistre une note (eval2-5e)");
ok(B.post({ sub: copieEleve("eval2-5e") }).ok, "copie de l'élève reçue");
ok(B.post({ sub: noteProf(copieEleve("eval2-5e")) }).ok, "note du professeur reçue");
var own = B.get({ action: "own", eid: "test.eleve" }), c = une(own, "eval2-5e");
ok(c.appreciation === "Bon travail, justifie davantage la partie C.", "own renvoie l'appréciation");
ok(c.adjustedScore === 14.5 && c.bareme === 20 && c.scoreBrut === 14.5, "own renvoie adjustedScore, bareme, scoreBrut");
ok(egal(c.adjustedPts, PTS), "own renvoie adjustedPts en OBJET (réhydraté)");
ok(!("adjustedPts_json" in c) && !("fields_json" in c), "aucune colonne _json brute ne sort");
var lst = une(B.get({ action: "list" }), "eval2-5e");
ok(lst.appreciation && egal(lst.adjustedPts, PTS), "list (autre poste du professeur) reçoit aussi la note");

console.log("2. Fusion élève réelle (index.html) sur un AUTRE poste");
var el = eleveFusionne(own, [copieEleve("eval2-5e")]);
var vue = el.corrigee("eval2-5e");
ok(!!vue, "estCorrigee() vrai : le bandeau de note s'affiche");
ok(vue && vue.bareme === 20 && vue.appreciation && egal(vue.adjustedPts, PTS), "l'élève a note, barème, appréciation, détail des points");

console.log("3. Colonnes et verrou");
var h = B.grille[0];
ok(egal(h.slice(0, 20), ENTETES_PROD), "les 20 en-têtes existants sont intacts");
ok(h.indexOf("locked") + 1 === h.indexOf("lockedAt") && h.indexOf("lockedAt") + 1 === h.indexOf("lockedBy"), "locked / lockedAt / lockedBy restent consécutives");
ok(h.indexOf("appreciation") > h.indexOf("lockedBy"), "les nouvelles colonnes sont après lockedBy : " + h.slice(20).join(", "));
ok(egal(h, B.COLUMNS), "ligne 1 = COLUMNS");
ok(B.post({ action: "lock", keys: [{ eid: "test.eleve", cap: "eval2-5e" }], locked: true, by: "prof" }).updated === 1, "lock verrouille la copie");
c = une(B.get({ action: "own", eid: "test.eleve" }), "eval2-5e");
ok(c.locked === true && !c.fields && !c.open, "copie verrouillée : pas de contenu");
ok(c.adjustedScore === 14.5 && c.appreciation && egal(c.adjustedPts, PTS), "copie verrouillée : la note redescend (META_ELEVE)");
ok(eleveFusionne({ subs: [c] }, [copieEleve("eval2-5e")]).corrigee("eval2-5e"), "fusion élève d'une copie verrouillée : note visible");
var r = B.post({ sub: copieEleve("eval2-5e", { fields: { q1: "triche" } }) });
ok(r.ok === false && r.error === "locked", "renvoi élève sur copie verrouillée refusé");
c = une(B.get({ action: "list" }), "eval2-5e");
ok(c.appreciation && c.fields.q1 === "réponse", "… la note et le travail sont intacts");
B.post({ action: "lock", keys: [{ eid: "test.eleve", cap: "eval2-5e" }], locked: false });

console.log("4. Envoi professeur sans les clés de note (second poste pas encore à jour)");
var sansNote = copieEleve("eval2-5e", { status: "rejected", _parProf: true });
ok(B.post({ sub: sansNote }).ok, "statut « à revoir » envoyé sans note");
c = une(B.get({ action: "list" }), "eval2-5e");
ok(c.status === "rejected", "le statut change");
ok(c.appreciation && c.adjustedScore === 14.5 && egal(c.adjustedPts, PTS) && c.bareme === 20, "la note déjà posée est préservée");
ok(B.post({ sub: copieEleve("eval2-5e", { _parProf: true, appreciation: "", status: "validated" }) }).ok, "le professeur envoie une appréciation vide");
c = une(B.get({ action: "list" }), "eval2-5e");
ok(c.appreciation === undefined && c.adjustedScore === 14.5, "un vide EXPLICITE efface ; une clé absente préserve");

console.log("5. Renvoi de l'élève (copie non verrouillée) = nouveau travail");
ok(B.post({ sub: copieEleve("eval2-5e", { fields: { q1: "nouvelle réponse" } }) }).ok, "renvoi accepté");
c = une(B.get({ action: "list" }), "eval2-5e");
ok(c.status === "pending" && c.fields.q1 === "nouvelle réponse", "nouveau travail, statut en attente");
ok(c.adjustedScore === undefined && c.appreciation === undefined && c.bareme === undefined && c.adjustedPts === undefined, "l'ancienne note est effacée");
ok(!eleveFusionne({ subs: [c] }, []).corrigee("eval2-5e"), "l'élève ne voit plus d'ancienne note");

console.log("6. Copie P11 : bareme et scoreBrut envoyés par l'élève");
ok(B.post({ sub: copieEleve("p11-ex2", { bareme: 20, scoreBrut: 17 }) }).ok, "soumission P11 reçue");
c = une(B.get({ action: "own", eid: "test.eleve" }), "p11-ex2");
ok(c.bareme === 20 && c.scoreBrut === 17, "bareme et scoreBrut gardés");

console.log("7. Ligne antérieure au patch (p11-ex1, 20 cellules)");
c = une(B.get({ action: "own", eid: "test.eleve" }), "p11-ex1");
ok(c.status === "validated" && c.fields && c.fields.a === "1", "toujours lisible");
ok(c.adjustedPts === undefined && c.adjustedScore === undefined, "colonnes neuves vides, sans erreur");
B.grille[2][B.COLUMNS.indexOf("adjustedPts_json")] = "{pas du json";
c = une(B.get({ action: "own", eid: "test.eleve" }), "p11-ex1");
ok(c.status === "validated" && c.adjustedPts === undefined, "adjustedPts_json illisible : ignoré, la lecture continue");

console.log("7b. Contrat inchangé pour la page (incident du 2026-10-01 : tableau professeur vide)");
/* Après le premier déploiement, les copies NON notées revenaient avec adjustedScore: "" ;
   la page (« !== undefined ») les croyait notées et p11x1Fmt("") plantait renderSubs. */
var CLES_AVANT = ENTETES_PROD.filter(function (k) { return k !== "fields_json"; }).concat(["fields"]);
var E = fauxGoogle([ENTETES_PROD]);
E.post({ sub: copieEleve("p11-ex1", { fields: { q1: "x" } }) });
E.post({ sub: copieEleve("p11-ex2") });
E.post({ sub: noteProf(copieEleve("eval2-5e")) });
var parCap = {};
E.get({ action: "list" }).subs.forEach(function (s) { parCap[s.cap] = s; });
var enTrop = Object.keys(parCap["p11-ex2"]).filter(function (k) { return CLES_AVANT.indexOf(k) < 0; });
ok(enTrop.length === 0, "copie non notée : aucune clé de plus qu'avant le patch" + (enTrop.length ? " (en trop : " + enTrop.join(", ") + ")" : ""));
var vm2 = vm.createContext({});
vm.runInContext(extraireFonction("p11x1Fmt"), vm2);
var plante = [];
Object.keys(parCap).forEach(function (cap) {
  var s = parCap[cap];
  ["adjustedScore", "bareme", "scoreBrut", "appreciation", "adjustedPts"].forEach(function (k) {
    if (s[k] === "") plante.push(cap + "." + k + " vide");
  });
  if (s.adjustedScore !== undefined) {   // la branche de renderSubs
    try { vm2.n = s.adjustedScore; vm.runInContext("p11x1Fmt(n)", vm2); } catch (e) { plante.push(cap + " : " + e.message); }
  }
});
ok(plante.length === 0, "vrai p11x1Fmt d'index.html sur chaque copie servie : pas de plantage" + (plante.length ? " — " + plante.join(" ; ") : ""));

console.log("8. Notification mail : seulement pour une copie nouvelle");
var C2 = fauxGoogle([ENTETES_PROD]);
C2.post({ sub: copieEleve("eval2-5e") });
C2.post({ sub: noteProf(copieEleve("eval2-5e")) });
ok(C2.mails() === 1, "un seul mail (la note du professeur n'en déclenche pas)");

console.log("8b. diagnosticColonnes() et secret partagé");
var dg = fauxGoogle([ENTETES_PROD]).diagnostic();
ok(dg.ecarts.length === 0 && /OK : 25 colonnes/.test(dg.journal), "classeur de production complété : « OK : 25 colonnes »");
var occupe = ENTETES_PROD.concat(["commentaire"]);
dg = fauxGoogle([occupe]).diagnostic();
ok(dg.ecarts.length === 1 && /col 21 : attendu appreciation, lu commentaire/.test(dg.journal), "colonne 21 déjà prise : l'écart est nommé");
var mSec = /var SYNC_SECRET = "([^"]+)"/.exec(SOURCE_HTML);
ok(!!mSec && mSec[1] === fauxGoogle([ENTETES_PROD]).SECRET, "SHARED_SECRET (.gs) = SYNC_SECRET (index.html) — valeur non affichée");

console.log("9. Rattrapage : le bloc de PATCH-BACKEND-NOTE.md, exécuté tel quel");
var DOC = fs.readFileSync(path.join(RACINE, "PATCH-BACKEND-NOTE.md"), "utf8");
var mDoc = /<!-- rattrapage[^\n]*\n```js\n([\s\S]*?)\n```/.exec(DOC);
ok(!!mDoc, "bloc de rattrapage trouvé dans le document");
var D = fauxGoogle([ENTETES_PROD]);
["X", "Y", "Z"].forEach(function (cap) { D.post({ sub: copieEleve(cap) }); });
D.post({ sub: noteProf(copieEleve("Z")) });                                      // Z : déjà notée au classeur
D.post({ sub: copieEleve("Y", { dateISO: "2026-10-02T09:00:00.000Z", fields: { q1: "plus récent" } }) }); // Y : renvoyée depuis
var localProf = ["X", "Y", "Z"].map(function (cap) { var s = noteProf(copieEleve(cap)); delete s._parProf; return s; });
function lancerRattrapage(envoyer) {
  var ctx = {
    APPS_SCRIPT_URL: "https://faux.invalid/exec", SYNC_SECRET: "x", console: { table: function () {}, warn: console.warn },
    localStorage: { getItem: function () { return null; } },
    getSubs: function () { return JSON.parse(JSON.stringify(localProf)); },
    fetch: function (url) {
      var p = {}; url.split("?")[1].split("&").forEach(function (kv) { var a = kv.split("="); p[a[0]] = decodeURIComponent(a[1]); });
      var rep = D.get(p);
      return Promise.resolve({ json: function () { return Promise.resolve(rep); } });
    },
    cloudSync: { send: function (s) { s._parProf = true; D.post({ sub: s }); } }   // comme send() en session professeur
  };
  vm.createContext(ctx);
  var code = mDoc[1].replace(/\}\)\(false\);\s*$/, "})(" + envoyer + ");");
  return vm.runInContext(code, ctx);
}
lancerRattrapage(false).then(function (msg) {
  ok(msg === "1 copie(s) à renvoyer", "premier passage : « " + msg + " », rien d'envoyé");
  ok(une(D.get({ action: "list" }), "X").adjustedScore === undefined, "… X toujours sans note au classeur");
  return lancerRattrapage(true);
}).then(function (msg) {
  var l = D.get({ action: "list" });
  ok(une(l, "X").adjustedScore === 14.5 && egal(une(l, "X").adjustedPts, PTS), "X rattrapée : note et points au classeur");
  ok(une(l, "Y").fields.q1 === "plus récent" && une(l, "Y").adjustedScore === undefined, "Y renvoyée par l'élève depuis : PAS écrasée par l'ancienne version");
  ok(une(l, "Z").adjustedScore === 14.5, "Z déjà notée : inchangée");
  fin();
}).catch(function (e) { ok(false, "rattrapage : " + e); fin(); });

function fin() {
console.log("\n" + (total - echecs) + "/" + total + " contrôles réussis");
process.exit(echecs ? 1 : 0);
}
