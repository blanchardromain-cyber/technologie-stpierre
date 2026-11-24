// Tests du module de logique de la capsule « La synthèse se gagne » (P11, 4e).
// Lancer : node outils/test_synthese_p11.js
"use strict";
const assert = require("assert");
const S = require("../Niveau 4/P11 Eau ressource essentielle/synthese_p11_logique.js");

let ok = 0;
function t(nom, f) { f(); ok++; console.log("ok - " + nom); }

const graines = Array.from({ length: 50 }, (_, i) => "g" + i);
const reponsesJustes = items => { const r = {}; items.forEach(i => { r[i.id] = i.bonne; }); return r; };

t("13 notions n0 à n12, dans l'ordre", () => {
  assert.strictEqual(S.NOTIONS.length, 13);
  S.NOTIONS.forEach((n, i) => assert.strictEqual(n.id, "n" + i));
  assert.strictEqual(S.NOTIONS[8].titre, "Conception de l'objet");
  assert.strictEqual(S.NOTIONS[2].lienRappel, "#sec1");
  assert.strictEqual(S.NOTIONS[12].partie, "II");
});

t("banque n8 : items complets, renvoi A6, aucun mot interdit", () => {
  const b = S.BANQUE.n8;
  assert.ok(b.length >= 3);
  b.forEach(i => {
    assert.ok(i.id && i.consigne && i.consigneSimple && i.indice, i.id);
    assert.strictEqual(i.renvoi, "A6");
    if (i.type !== "ordre") assert.ok(i.options.indexOf(i.bonne) >= 0, i.id);
    assert.ok(!/RS-1|robot|coque/i.test(JSON.stringify(i)), i.id);
  });
  assert.deepStrictEqual(["choix", "menu", "ordre"].filter(k => b.some(i => i.type === k)), ["choix", "menu", "ordre"]);
});

t("juste au 1er essai → acquis", () => {
  const e = S.appliquer(S.etatVide(), "n8", true);
  assert.strictEqual(e.cartes.n8.niv, "acquis");
  assert.strictEqual(e.cartes.n8.ouverte, true);
});

t("faux puis juste → en_cours", () => {
  let e = S.appliquer(S.etatVide(), "n8", false);
  assert.strictEqual(e.cartes.n8.ouverte, false);
  e = S.appliquer(e, "n8", true);
  assert.strictEqual(e.cartes.n8.niv, "en_cours");
  assert.strictEqual(e.cartes.n8.ouverte, true);
});

t("3 échecs → a_revoir et ouverte", () => {
  let e = S.etatVide();
  for (let i = 0; i < 3; i++) e = S.appliquer(e, "n8", false);
  assert.strictEqual(e.cartes.n8.niv, "a_revoir");
  assert.strictEqual(e.cartes.n8.ouverte, true);
});

t("appliquer est pur", () => {
  const e0 = S.etatVide(), copie = JSON.stringify(e0);
  S.appliquer(e0, "n8", true);
  assert.strictEqual(JSON.stringify(e0), copie);
});

t("rejouer après a_revoir, juste → niv acquis, dernier acquis, essais = 4", () => {
  let e = S.etatVide();
  for (let i = 0; i < 3; i++) e = S.appliquer(e, "n8", false);
  e = S.appliquer(e, "n8", true);
  assert.strictEqual(e.cartes.n8.niv, "acquis");
  assert.strictEqual(e.cartes.n8.dernier, "acquis");
  assert.strictEqual(e.cartes.n8.essais, 4);
  assert.strictEqual(e.cartes.n8.ouverte, true);
});

t("rejouer après acquis, faux 3 fois → niv reste acquis, dernier a_revoir", () => {
  let e = S.appliquer(S.etatVide(), "n8", true);
  for (let i = 0; i < 3; i++) e = S.appliquer(e, "n8", false);
  assert.strictEqual(e.cartes.n8.niv, "acquis");
  assert.strictEqual(e.cartes.n8.dernier, "a_revoir");
  assert.strictEqual(e.cartes.n8.essais, 4);
});

t("tirerDefi : 2 à 4 items, déterministe", () => {
  graines.forEach(g => [1, 2, 3].forEach(essai => {
    const d = S.tirerDefi("n8", essai, g, false);
    assert.ok(d.length >= 2 && d.length <= 4, g);
    assert.deepStrictEqual(d, S.tirerDefi("n8", essai, g, false));
  }));
});

t("essai 2 ne reprend aucun item de l'essai 1 (n8, même graine)", () => {
  graines.forEach(g => {
    const a = S.tirerDefi("n8", 1, g, false).map(i => i.id);
    const b = S.tirerDefi("n8", 2, g, false).map(i => i.id);
    const c = S.tirerDefi("n8", 3, g, false).map(i => i.id);
    assert.ok(!b.some(x => a.indexOf(x) >= 0), g + " 1/2");
    assert.ok(!c.some(x => a.indexOf(x) >= 0 || b.indexOf(x) >= 0), g + " 3");
  });
});

t("mode adapté : 3 options, la bonne y est (choix et menu, g0 à g49)", () => {
  graines.forEach(g => [1, 2, 3].forEach(essai => {
    S.tirerDefi("n8", essai, g, true).forEach(i => {
      if (i.type === "ordre") return;
      assert.strictEqual(i.options.length, 3, g + " " + i.id);
      assert.ok(i.options.indexOf(i.bonne) >= 0, g + " " + i.id);
    });
  }));
});

t("mode adapté, ordre : tous les éléments, le premier est pré-placé (fixe 0)", () => {
  let vus = 0;
  graines.forEach(g => [1, 2, 3].forEach(essai => {
    S.tirerDefi("n8", essai, g, true).forEach(i => {
      if (i.type !== "ordre") return;
      vus++;
      assert.strictEqual(i.options.length, i.bonne.length);
      assert.strictEqual(i.fixe, 0);
      assert.strictEqual(i.options[0], i.bonne[0]);
      assert.deepStrictEqual(i.options.slice().sort(), i.bonne.slice().sort());
    });
  }));
  assert.ok(vus > 0);
});

t("mode normal : pas de fixe, options de l'ordre mélangées mais complètes", () => {
  graines.forEach(g => S.tirerDefi("n8", 1, g, false).concat(S.tirerDefi("n8", 2, g, false)).forEach(i => {
    assert.strictEqual(i.fixe, undefined);
    if (i.type === "ordre") {
      assert.deepStrictEqual(i.options.slice().sort(), i.bonne.slice().sort());
      assert.notDeepStrictEqual(i.options, i.bonne);
    } else assert.ok(i.options.length >= 3);
  }));
});

t("tirerDefi ne modifie pas la banque", () => {
  const avant = JSON.stringify(S.BANQUE);
  graines.forEach(g => S.tirerDefi("n8", 1, g, true));
  assert.strictEqual(JSON.stringify(S.BANQUE), avant);
});

t("corriger : tout juste, puis une faute avec indice ciblé", () => {
  const d = S.tirerDefi("n8", 1, "g3", false);
  const juste = S.corriger(d, reponsesJustes(d));
  assert.strictEqual(juste.juste, true);
  assert.deepStrictEqual(juste.fautes, []);
  const rep = reponsesJustes(d);
  rep[d[0].id] = d[0].type === "ordre" ? d[0].options.slice().reverse().concat([]).slice() : "zzz";
  if (d[0].type === "ordre" && JSON.stringify(rep[d[0].id]) === JSON.stringify(d[0].bonne)) rep[d[0].id] = [];
  const faux = S.corriger(d, rep);
  assert.strictEqual(faux.juste, false);
  assert.deepStrictEqual(faux.fautes, [d[0].id]);
  assert.strictEqual(faux.indice, d[0].indice);
});

t("corriger : réponse manquante = faute", () => {
  const d = S.tirerDefi("n8", 1, "g1", false);
  const r = S.corriger(d, {});
  assert.strictEqual(r.juste, false);
  assert.strictEqual(r.fautes.length, d.length);
});

t("corriger : un ordre n'est juste que dans l'ordre exact", () => {
  const o = S.BANQUE.n8.find(i => i.type === "ordre");
  assert.strictEqual(S.corriger([o], { [o.id]: o.bonne.slice() }).juste, true);
  const inv = o.bonne.slice(); inv.push(inv.shift());
  assert.strictEqual(S.corriger([o], { [o.id]: inv }).juste, false);
});

t("versFields puis depuisFields = état identique", () => {
  let e = S.etatVide();
  e = S.appliquer(e, "n8", true);
  e = S.appliquer(e, "n1", false);           // série en cours, pas encore ouverte
  e = S.appliquer(e, "n9", false); e = S.appliquer(e, "n9", false); e = S.appliquer(e, "n9", false);
  e.module = { n8: { essai: 2 } };
  e.adapte = true;
  e.debut = 1700000000000;
  assert.deepStrictEqual(S.depuisFields(S.versFields(e, 1700000090000)), e);
  assert.deepStrictEqual(S.depuisFields(S.versFields(S.etatVide())), S.etatVide());
});

t("versFields : champs attendus, tout en chaînes", () => {
  const f = S.versFields(S.appliquer(S.etatVide(), "n8", true), 5000);
  assert.deepStrictEqual(Object.keys(f).sort(), ["_dernier", "_essais", "_module", "_niv", "adapte", "duree"]);
  Object.keys(f).forEach(k => assert.strictEqual(typeof f[k], "string", k));
  assert.deepStrictEqual(JSON.parse(f._niv), { n8: "acquis" });
});

t("aucune valeur de versFields ne commence par = + @", () => {
  const etats = [S.etatVide(), S.appliquer(S.etatVide(), "n8", false), S.appliquer(S.etatVide(), "n2", true)];
  etats[2].debut = 1; etats[2].adapte = true;
  etats.forEach(e => Object.values(S.versFields(e)).forEach(v => assert.ok(!/^[=+@]/.test(v), v)));
});

t("depuisFields tolère l'absent et le corrompu", () => {
  assert.deepStrictEqual(S.depuisFields(undefined), S.etatVide());
  assert.deepStrictEqual(S.depuisFields({ _niv: "{pas du json" }), S.etatVide());
});

t("memoire : niveaux et notions à retravailler", () => {
  let e = S.appliquer(S.etatVide(), "n8", true);
  for (let i = 0; i < 3; i++) e = S.appliquer(e, "n3", false);
  e = S.appliquer(S.appliquer(e, "n4", false), "n4", true);
  const m = S.memoire(e);
  assert.strictEqual(Object.keys(m.niveaux).length, 13);
  assert.strictEqual(m.niveaux.n8, "acquis");
  assert.strictEqual(m.niveaux.n3, "a_revoir");
  assert.strictEqual(m.niveaux.n0, null);
  assert.deepStrictEqual(m.aRetravailler.map(x => x.id), ["n3", "n4"]);
  assert.strictEqual(m.aRetravailler[0].titre, "Contraintes");
  assert.ok(m.aRetravailler[0].renvoi);
});

t("cleEtat : distincte par élève, null sans identifiant", () => {
  assert.notStrictEqual(S.cleEtat("a"), S.cleEtat("b"));
  assert.strictEqual(S.cleEtat("a"), "p11-syn_etat:a");
  assert.strictEqual(S.cleEtat(""), null);
  assert.strictEqual(S.cleEtat(undefined), null);
  assert.strictEqual(S.cleEtat(null), null);
});

console.log(ok + " tests réussis");
