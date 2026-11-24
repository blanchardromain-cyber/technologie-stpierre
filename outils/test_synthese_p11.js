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

t("duree en minutes entières, arrondies au-dessus", () => {
  const e = S.etatVide(); e.debut = 1000;
  const d = sec => S.versFields(e, 1000 + sec * 1000).duree;
  assert.strictEqual(d(5400), "90");
  assert.strictEqual(d(61), "2");
  assert.strictEqual(d(1), "1");
  assert.strictEqual(d(60), "1");
  assert.strictEqual(d(0), "0");
  assert.strictEqual(S.versFields(S.etatVide(), 5000).duree, "0");
});

t("essaiSuivant : 1 au départ, avance dans la série, repart à 1 après ouverture", () => {
  let e = S.etatVide();
  assert.strictEqual(S.essaiSuivant(e, "n8"), 1);
  e = S.appliquer(e, "n8", false);
  assert.strictEqual(S.essaiSuivant(e, "n8"), 2);
  e = S.appliquer(e, "n8", false);
  assert.strictEqual(S.essaiSuivant(e, "n8"), 3);
  e = S.appliquer(e, "n8", false);
  assert.strictEqual(S.essaiSuivant(e, "n8"), 1);
  assert.strictEqual(S.essaiSuivant(e, "n9"), 1);
  e = S.appliquer(S.appliquer(e, "n8", false), "n8", true);
  assert.strictEqual(S.essaiSuivant(e, "n8"), 1);
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

/* ── Tâche 3 : les 13 cartes ── */
const tousItems = () => S.NOTIONS.reduce((a, n) => a.concat((S.BANQUE[n.id] || []).map(i => [n.id, i])), []);
const norm = s => String(s).toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();

t("chaque notion : défis de 2 à 4 items, essais 1, 2, 3 sans item commun (g0 à g49)", () => {
  S.NOTIONS.forEach(n => {
    assert.ok((S.BANQUE[n.id] || []).length >= 4, n.id + " : banque trop courte");
    graines.forEach(g => [false, true].forEach(ad => {
      const vus = [];
      [1, 2, 3].forEach(essai => {
        const d = S.tirerDefi(n.id, essai, g, ad);
        assert.ok(d.length >= 2 && d.length <= 4, n.id + " " + g + " essai " + essai + " : " + d.length + " items");
        d.forEach(i => { assert.ok(vus.indexOf(i.id) < 0, n.id + " " + g + " : " + i.id + " revient"); vus.push(i.id); });
      });
    }));
  });
});

t("chaque item : id unique préfixé par sa notion, consigne, consigneSimple, indice, renvoi", () => {
  const ids = {};
  tousItems().forEach(([nid, i]) => {
    assert.ok(i.id && i.id.indexOf(nid + "_") === 0, i.id);
    assert.ok(!ids[i.id], "doublon " + i.id); ids[i.id] = 1;
    assert.ok(i.consigne && i.consigneSimple, i.id);
    assert.ok(typeof i.indice === "string" && i.indice.length > 10, i.id + " : indice");
    assert.ok(/^(A[1-7](-A[1-7])?|SI)$/.test(i.renvoi), i.id + " : renvoi " + i.renvoi);
    assert.ok(["choix", "menu", "ordre", "assoc"].indexOf(i.type) >= 0, i.id);
  });
});

t("aucun texte de BANQUE ne contient « RS-1 », « coque », « robot »", () => {
  assert.ok(!/RS-1|coque|robot/i.test(JSON.stringify(S.BANQUE)));
});

t("la carte n8 garde son ordre vertical « Quand ? »", () => {
  const o = S.BANQUE.n8.find(i => i.type === "ordre");
  assert.ok(/« Quand \? »/.test(o.consigne) && /pas par importance/.test(o.consigne));
  assert.deepStrictEqual(o.bonne, ["Détecter la présence des mains", "Traiter l'information et commander", "Ouvrir / fermer l'arrivée d'eau", "Produire l'énergie électrique (sans pile)"]);
});

t("réponses cohérentes : bonne dans les options, assoc alignée, ordre complet", () => {
  tousItems().forEach(([, i]) => {
    if (i.type === "choix" || i.type === "menu") {
      assert.strictEqual(typeof i.bonne, "string", i.id);
      assert.ok(i.options.indexOf(i.bonne) >= 0, i.id);
      assert.ok(i.options.length >= 2, i.id);
    } else if (i.type === "assoc") {
      assert.ok(Array.isArray(i.elements) && i.elements.length >= 2 && i.elements.length === i.bonne.length, i.id);
      i.bonne.forEach(b => assert.ok(i.options.indexOf(b) >= 0, i.id + " : " + b));
    } else {
      assert.deepStrictEqual(i.options.slice().sort(), i.bonne.slice().sort(), i.id);
    }
    assert.strictEqual(new Set(i.options).size, i.options.length, i.id + " : option en double");
  });
});

t("mode adapté, toutes notions : choix et menu à min(3, n) options dont la bonne ; ordre au premier pré-placé", () => {
  S.NOTIONS.forEach(n => graines.forEach(g => [1, 2, 3].forEach(essai => {
    S.tirerDefi(n.id, essai, g, true).forEach(i => {
      const b = S.BANQUE[n.id].find(x => x.id === i.id);
      if (i.type === "choix" || i.type === "menu") {
        assert.strictEqual(i.options.length, Math.min(3, b.options.length), i.id);
        assert.ok(i.options.indexOf(i.bonne) >= 0, i.id);
      } else if (i.type === "ordre") {
        assert.strictEqual(i.fixe, 0, i.id);
        assert.strictEqual(i.options[0], i.bonne[0], i.id);
      }
    });
  })));
});

t("mode adapté, assoc : toutes les réponses attendues restent, 3 options quand c'est possible", () => {
  let vus = 0;
  S.NOTIONS.forEach(n => graines.forEach(g => [1, 2, 3].forEach(essai => {
    S.tirerDefi(n.id, essai, g, true).forEach(i => {
      if (i.type !== "assoc") return;
      vus++;
      const b = S.BANQUE[n.id].find(x => x.id === i.id), attendus = Array.from(new Set(b.bonne));
      attendus.forEach(a => assert.ok(i.options.indexOf(a) >= 0, i.id + " : " + a));
      assert.strictEqual(i.options.length, b.options.length > 3 ? Math.max(3, attendus.length) : b.options.length, i.id);
      i.elements.forEach((e, k) => assert.strictEqual(i.bonne[k], b.bonne[b.elements.indexOf(e)], i.id + " : paire déplacée"));
    });
  })));
  assert.ok(vus > 0);
});

t("corriger, assoc : comparaison par paire, quel que soit l'ordre d'affichage", () => {
  const b = tousItems().map(x => x[1]).find(i => i.type === "assoc" && new Set(i.bonne).size > 1);
  const melange = Object.assign({}, b, { elements: b.elements.slice().reverse(), bonne: b.bonne.slice().reverse() });
  const parObjet = {}; b.elements.forEach((e, k) => { parObjet[e] = b.bonne[k]; });
  assert.strictEqual(S.corriger([melange], { [b.id]: parObjet }).juste, true, "objet élément → réponse");
  assert.strictEqual(S.corriger([melange], { [b.id]: melange.bonne.slice() }).juste, true, "tableau aligné sur l'affichage");
  assert.strictEqual(S.corriger([melange], { [b.id]: b.bonne.slice() }).juste, false, "tableau dans l'ordre de la banque, pas de l'affichage");
  const faux = Object.assign({}, parObjet); const k0 = b.elements[0], k1 = b.elements.find(e => parObjet[e] !== parObjet[k0]);
  faux[k0] = parObjet[k1]; faux[k1] = parObjet[k0];
  assert.strictEqual(S.corriger([melange], { [b.id]: faux }).juste, false, "paires échangées");
  const incomplet = Object.assign({}, parObjet); delete incomplet[k0];
  assert.strictEqual(S.corriger([melange], { [b.id]: incomplet }).juste, false, "paire manquante");
});

t("corriger : le renvoi est celui du premier item faux", () => {
  const items = [S.BANQUE.n3[0], S.BANQUE.n10[0]];
  const r = S.corriger(items, { [items[0].id]: items[0].bonne });
  assert.strictEqual(r.renvoi, items[1].renvoi);
  assert.strictEqual(r.indice, items[1].indice);
  assert.strictEqual(S.corriger([], {}).renvoi, "");
});

t("indices : jamais la bonne réponse (choix, menu) ; un renvoi à une activité ou à la synthèse (hors n8 déjà validée)", () => {
  tousItems().forEach(([nid, i]) => {
    if (i.type === "choix" || i.type === "menu")
      assert.ok(norm(i.indice).indexOf(norm(i.bonne)) < 0, i.id + " : l'indice contient la réponse");
    if (nid !== "n8") assert.ok(/activité|synthèse/.test(i.indice), i.id + " : indice sans renvoi");
  });
});

console.log(ok + " tests réussis");
