// Tests du module de correction de la capsule « Exercices réseau 5e » (reseau5e-exo).
// Lancer : node outils/test_exercices_reseau.js
"use strict";
const assert = require("assert");
const RXO = require("../Niveau 5/Organiser un réseau numérique/exercices_reseau_corr.js");

let ok = 0;
function t(nom, f) { f(); ok++; console.log("ok - " + nom); }

const JUSTE = {
  e1_borne: "5", e1_imprimante: "8", e1_scanner: "3", e1_commutateur: "1",
  e1_fixe: "6", e1_smartphone: "2", e1_tablette: "4", e1_portable: "7",
  e1_l16: "cable", e1_l45: "ondes",
  e2_d1: "2", e2_d2: "5", e2_d3: "4", e2_d4: "1", e2_d5: "6", e2_d6: "7", e2_d7: "3",
  e3_q1: "identifier", e3_q2: "comptes", e3_q3: "fichiers",
  e4_c1: "tablette,wifi,commutateur,routeur,internet", e4_l1: "ondes,cable,cable,cable",
  e4_c2: "portable,wifi,commutateur,imprimante", e4_l2: "ondes,cable,cable"
};

t("tout juste = 20/20, tout maîtrisé", () => {
  const r = RXO.corriger(JUSTE);
  assert.strictEqual(r.note, 20);
  assert.deepStrictEqual(r.pts, { ex1: 5, ex2: 5, ex3: 5, ex4: 5 });
  ["ex1", "ex2", "ex3", "ex4"].forEach(k => assert.strictEqual(r.niveaux[k], "maitrise"));
});

t("Ex. 4 q2 par Wi-Fi direct = plein", () => {
  const f = Object.assign({}, JUSTE, { e4_c2: "portable,wifi,imprimante", e4_l2: "ondes,ondes" });
  assert.strictEqual(RXO.corriger(f).pts.ex4, 5);
});

t("copie vide = 0", () => {
  const r = RXO.corriger({});
  assert.strictEqual(r.note, 0);
  assert.strictEqual(r.niveaux.ex1, "arevoir");
});

t("tout faux = 0", () => {
  const f = {
    e1_borne: "1", e1_imprimante: "2", e1_scanner: "4", e1_commutateur: "3",
    e1_fixe: "5", e1_smartphone: "6", e1_tablette: "8", e1_portable: "6",
    e1_l16: "ondes", e1_l45: "cable",
    e2_d1: "1", e2_d2: "2", e2_d3: "3", e2_d4: "4", e2_d5: "5", e2_d6: "6", e2_d7: "7",
    e3_q1: "allumer", e3_q2: "fichiers", e3_q3: "comptes",
    e4_c1: "tablette,imprimante", e4_l1: "cable", e4_c2: "portable,routeur", e4_l2: "cable"
  };
  assert.strictEqual(RXO.corriger(f).note, 0);
});

t("même réponse partout ≤ 5/20", () => {
  const f = {};
  RXO.ELEMENTS_EX1.forEach(e => f["e1_" + e.id] = "1");
  f.e1_l16 = f.e1_l45 = "cable";
  for (let i = 1; i <= 7; i++) f["e2_d" + i] = "1";
  ["e3_q1", "e3_q2", "e3_q3"].forEach(k => f[k] = RXO.OPTIONS_EX3[k][0].v);
  f.e4_c1 = "tablette,wifi"; f.e4_l1 = "cable"; f.e4_c2 = "portable,wifi"; f.e4_l2 = "cable";
  const n = RXO.corriger(f).note;
  console.log("   même réponse : " + n + "/20");
  assert.ok(n <= 5, n);
});

t("hasard : moyenne annoncée, ≤ 5/20", () => {
  let s = 0, N = 2000, seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const app = RXO.APPAREILS_EX4.map(a => a.id);
  for (let k = 0; k < N; k++) {
    const f = {};
    RXO.ELEMENTS_EX1.forEach(e => f["e1_" + e.id] = String(1 + Math.floor(rnd() * 8)));
    f.e1_l16 = pick(["cable", "ondes"]); f.e1_l45 = pick(["cable", "ondes"]);
    for (let i = 1; i <= 7; i++) f["e2_d" + i] = String(1 + Math.floor(rnd() * 7));
    ["e3_q1", "e3_q2", "e3_q3"].forEach(q => f[q] = pick(RXO.OPTIONS_EX3[q]).v);
    [["e4_c1", "e4_l1", "tablette"], ["e4_c2", "e4_l2", "portable"]].forEach(([c, l, d]) => {
      const n = 1 + Math.floor(rnd() * 4), ch = [d];
      for (let i = 0; i < n; i++) ch.push(pick(app.filter(x => ch.indexOf(x) < 0)));
      f[c] = ch.join(","); f[l] = ch.slice(1).map(() => pick(["cable", "ondes"])).join(",");
    });
    s += RXO.corriger(f).note;
  }
  const m = s / N;
  console.log("   hasard : " + m.toFixed(2) + "/20");
  assert.ok(m <= 5, m);
});

t("niveaux : 80 % maîtrisé, 50 % en cours", () => {
  const f = Object.assign({}, JUSTE, { e2_d1: "9" });            // 6/7 = 86 %
  assert.strictEqual(RXO.corriger(f).niveaux.ex2, "maitrise");
  const g = Object.assign({}, JUSTE, { e3_q1: "allumer" });      // 2/3 = 67 %
  assert.strictEqual(RXO.corriger(g).niveaux.ex3, "encours");
  const h = Object.assign({}, JUSTE, { e3_q1: "allumer", e3_q2: "x" }); // 1/3
  assert.strictEqual(RXO.corriger(h).niveaux.ex3, "arevoir");
});

t("items détaillés : un item faux est signalé", () => {
  const r = RXO.corriger(Object.assign({}, JUSTE, { e1_scanner: "6" }));
  assert.strictEqual(r.items.e1_scanner, 0);
  assert.strictEqual(r.items.e1_borne, 1);
});

t("Ex. 4 : appareil juste mais liaison fausse = point partiel", () => {
  const r = RXO.corriger(Object.assign({}, JUSTE, { e4_l1: "cable,cable,cable,cable" }));
  assert.ok(r.pts.ex4 > 4 && r.pts.ex4 < 5, r.pts.ex4);
});

t("note au demi-point", () => {
  const r = RXO.corriger(Object.assign({}, JUSTE, { e2_d1: "9" }));
  assert.strictEqual(r.note * 2, Math.round(r.note * 2));
});

t("Ex. 2 d6 (impression depuis n'importe quel ordinateur) : 7 ou 3 acceptés", () => {
  assert.strictEqual(RXO.corriger(Object.assign({}, JUSTE, { e2_d6: "3" })).items.e2_d6, 1);
  assert.strictEqual(RXO.corriger(Object.assign({}, JUSTE, { e2_d6: "7" })).items.e2_d6, 1);
  assert.strictEqual(RXO.corriger(Object.assign({}, JUSTE, { e2_d6: "6" })).items.e2_d6, 0);
  assert.strictEqual(RXO.corriger(Object.assign({}, JUSTE, { e2_d7: "7" })).items.e2_d7, 0); // numérisation : 3 seul
});

t("concordance : somme des points par exercice (arrondie au demi) = note de la page", () => {
  // Copie relevée par la relecture : 5,5 sur la page, 6 au tableau de bord.
  const f = Object.assign({}, JUSTE, {
    e1_borne: "1", e1_imprimante: "1", e1_scanner: "1", e1_commutateur: "1", e1_fixe: "1", e1_smartphone: "1", e1_tablette: "1", e1_portable: "1", e1_l16: "cable", e1_l45: "cable",
    e2_d1: "1", e2_d2: "1", e2_d3: "1", e2_d4: "1", e2_d5: "6", e2_d6: "1",
    e3_q1: "allumer", e3_q3: "comptes",
    e4_c1: "tablette,wifi,commutateur", e4_l1: "ondes,ondes", e4_c2: "portable,routeur", e4_l2: "cable"
  });
  const verifie = r => {
    const somme = Object.values(r.pts).reduce((a, b) => a + b, 0);
    assert.strictEqual(Math.round(Math.min(20, somme) * 2) / 2, r.note, JSON.stringify(r.pts) + " → " + r.note);
  };
  verifie(RXO.corriger(f));
  // Balayage : chaque combinaison de niveaux de réussite par exercice.
  for (let a = 0; a <= 10; a++) for (let b = 0; b <= 7; b++) for (let c = 0; c <= 3; c++) for (let d = 0; d <= 8; d++) {
    const g = Object.assign({}, JUSTE);
    RXO.ELEMENTS_EX1.concat(RXO.LIAISONS_EX1).slice(a).forEach(e => g["e1_" + e.id] = "x");
    RXO.DEFINITIONS_EX2.slice(b).forEach(e => g["e2_" + e.id] = "x");
    RXO.QUESTIONS_EX3.slice(c).forEach(q => g[q.id] = "x");
    const l = ["ondes", "cable", "cable", "cable"].map((s, i) => i < Math.floor(d / 2) ? s : "x");
    g.e4_l1 = l.join(",");
    verifie(RXO.corriger(g));
  }
});

console.log(ok + " tests réussis");
