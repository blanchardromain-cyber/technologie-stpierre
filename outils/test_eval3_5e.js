/* Test hors navigateur de la correction automatique de l'évaluation n°3 (5e).
   Exécute la VRAIE grille EVALUATIONS["eval3-5e"] et le vrai evalMot d'index.html
   sur des copies de référence : tout juste, tout faux, réponse unique partout,
   réponses d'élèves typiques (fautes d'orthographe, réponses trop générales).

   Lancer : node outils/test_eval3_5e.js
*/
"use strict";
var fs = require("fs"), path = require("path"), vm = require("vm");
var HTML = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

/* Extrait un bloc équilibré en accolades à partir d'une ancre. */
function bloc(ancre) {
  var i = HTML.indexOf(ancre);
  if (i < 0) throw new Error("ancre introuvable : " + ancre);
  var j = HTML.indexOf("{", i), prof = 0;
  for (var k = j; k < HTML.length; k++) {
    if (HTML[k] === "{") prof++;
    else if (HTML[k] === "}" && --prof === 0) return HTML.slice(i, k + 1);
  }
  throw new Error("bloc non fermé : " + ancre);
}
var code = ["function fmtPts", "function evalNorm", "function evalMot", "function _p11norm", "function _p11phon", "function _p11lev"]
  .map(bloc).join("\n") + "\nvar G = {" + bloc('"eval3-5e": {') + "};";
var ctx = {};
vm.createContext(ctx);
vm.runInContext(code + "\nthis.G = G; this.evalMot = evalMot;", ctx);
var G = ctx.G["eval3-5e"];

var echecs = 0;
function ok(cond, msg) { console.log((cond ? "  ok    " : "  ÉCHEC ") + msg); if (!cond) echecs++; }
function note(f) { var r = G.corriger(f); return { n: r.points.norme, r: r.points.repr, t: r.points.norme + r.points.repr, d: r.detail }; }

var JUSTE = {
  "e1-def": "Une norme est une règle à respecter fixée par un organisme officiel comme l'AFNOR.",
  "e1-u1": "à garantir la sécurité des personnes",
  "e1-u2": "à rendre les appareils compatibles entre eux",
  "e1-erp1": "norme", "e1-erp2": "contrainte", "e1-erp3": "contrainte", "e1-erp4": "norme",
  "e1-env": "Réduire les déchets car on réutilise son ancien chargeur.",
  "e2-r1": "modelisation", "e2-r2": "croquis", "e2-r3": "modelisation", "e2-r4": "croquis",
  "e2-r5": "modelisation", "e2-r6": "modelisation", "e2-r7": "modelisation", "e2-r8": "croquis"
};
function avec(mod) { var c = JSON.parse(JSON.stringify(JUSTE)); for (var k in mod) c[k] = mod[k]; return c; }

console.log("1. Copies de référence");
var j = note(JUSTE);
ok(j.t === 10, "tout juste : 10/10 (obtenu " + j.t + ")");
ok(note({}).t === 0, "copie vide : 0");
var faux = { "e1-def": "je sais pas", "e1-u1": "rien", "e1-u2": "bof", "e1-env": "c'est joli",
             "e1-erp1": "contrainte", "e1-erp2": "norme", "e1-erp3": "norme", "e1-erp4": "contrainte" };
["r1", "r3", "r5", "r6", "r7"].forEach(function (k) { faux["e2-" + k] = "croquis"; });
["r2", "r4", "r8"].forEach(function (k) { faux["e2-" + k] = "modelisation"; });
ok(note(faux).t === 0, "tout faux : 0 (obtenu " + note(faux).t + ")");
/* La tolérance phonétique rapproche les mots courts : « pas » passait pour « pays »,
   « joli » pour « jeter ». Des réponses hors sujet ne doivent rien rapporter. */
["je sais pas", "c'est joli", "j'ai oublié", "aucune idée", "c'est pour les gens", "parce que", "oui", "non",
 "la maison", "c'est bien", "pour faire", "je ne sais pas trop", "c'est une chose", "le téléphone", "ça sert à rien",
 "pour que ce soit beau", "pour les élèves", "c'est cool"]
  .forEach(function (h) {
    var t = note({ "e1-def": h, "e1-u1": h, "e1-env": h }).t;
    ok(t === 0, "hors sujet « " + h + " » : 0" + (t ? " (obtenu " + t + ")" : ""));
  });
var toutModel = {}, toutCroquis = {}, toutNorme = {};
for (var r = 1; r <= 8; r++) { toutModel["e2-r" + r] = "modelisation"; toutCroquis["e2-r" + r] = "croquis"; }
for (var e = 1; e <= 4; e++) toutNorme["e1-erp" + e] = "norme";
console.log("  info  réponse unique « Modélisation » partout : " + note(toutModel).r + "/4 ; « Croquis » : "
            + note(toutCroquis).r + "/4 ; « Norme » partout en 1.3 : " + note(toutNorme).n + "/2 (barème du sujet)");
ok(note(toutModel).r === 2.5 && note(toutCroquis).r === 1.5, "réponse unique : 2,5 et 1,5 sur 4, ni plus");

console.log("2. Réponses rédigées");
ok(note(avec({ "e1-def": "une norme c'est une regle obligatoire" })).d[0].pts === 0.5, "1.1 sans organisme : 0,5");
ok(note(avec({ "e1-def": "c'est un truc pour l'isolant" })).d[0].pts === 0, "1.1 « isolant » ne passe pas pour « ISO »");
ok(note(avec({ "e1-def": "une règle a respecté décidée par l'Europe" })).d[0].pts === 1, "1.1 « respecté » mal accordé : radical accepté");
var u = note(avec({ "e1-u2": "pour la sécurité aussi" })).d;
ok(u[1].pts === 0.5 && u[2].pts === 0 && /même utilité/.test(u[2].remarque), "1.2 deux fois la sécurité : seconde ligne à 0, signalée");
ok(note(avec({ "e1-u1": "à protéger l'environnement", "e1-u2": "à faciliter la vie des consommateurs" })).d[2].pts === 0.5,
   "1.2 « faciliter la vie » (repris du texte) reconnu");
ok(note(avec({ "e1-u1": "a garantir la sékurité" })).d[1].pts === 0.25, "1.2 « sékurité » : demi-point");
var env = note(avec({ "e1-env": "protéger la planète" })).d.filter(function (x) { return /^1\.4/.test(x.label); })[0];
ok(env.pts === 0 && /trop générale/.test(env.remarque), "1.4 « protéger la planète » : 0, signalée trop générale");
env = note(avec({ "e1-env": "moins de déchets" })).d.filter(function (x) { return /^1\.4/.test(x.label); })[0];
ok(env.pts === 1, "1.4 déchets seulement : 1/2");
env = note(avec({ "e1-env": "Les appareils sont vendus sans chargeur donc il y a moins de déchés" })).d
  .filter(function (x) { return /^1\.4/.test(x.label); })[0];
ok(env.pts === 2, "1.4 « déchés » (radical « deche ») + sans chargeur : 2/2 (obtenu " + env.pts + ")");

console.log("3. Appréciation");
ok(/maîtrisées/.test(G.appreciation({ norme: j.n, repr: j.r }, 10)), "10/10 : notions maîtrisées");
ok(/croquis et modélisation/.test(G.appreciation({ norme: 6, repr: 1 }, 7)), "exercice 2 faible : signalé");

console.log(echecs ? ("\n" + echecs + " échec(s)") : "\nTout est vert.");
process.exit(echecs ? 1 : 0);
