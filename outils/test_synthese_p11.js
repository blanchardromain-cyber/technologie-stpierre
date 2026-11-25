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
  assert.deepStrictEqual(Object.keys(f).sort(), ["_adapteUtilise", "_dernier", "_essais", "_module", "_niv", "adapte", "duree"]);
  Object.keys(f).forEach(k => assert.strictEqual(typeof f[k], "string", k));
  assert.deepStrictEqual(JSON.parse(f._niv), { n8: "acquis" });
});

t("duree en minutes entières, arrondies au-dessus, depuis le temps actif (pas depuis le début)", () => {
  const e = S.etatVide(); e.debut = 1000;
  assert.strictEqual(S.versFields(e, 1000 + 5400 * 1000).duree, "0", "le temps écoulé depuis le début ne compte plus");
  const d = sec => { const x = S.etatVide(); x.actifMs = sec * 1000; return S.versFields(x).duree; };
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

/* ── Correctif 1 de la tâche 3 ── */
t("n5 : le groupe de mots faux n'est pas toujours au même endroit de la phrase (au moins 3 positions)", () => {
  const positions = new Set();
  S.BANQUE.n5.forEach(i => {
    const phrase = /«\s*(.+?)\s*»/.exec(i.consigne)[1];
    let depuis = 0;
    i.options.forEach(o => { const p = phrase.indexOf(o, depuis); assert.ok(p >= depuis, i.id + " : « " + o + " » pas dans l'ordre de la phrase"); depuis = p + o.length; });
    positions.add(i.options.indexOf(i.bonne));
  });
  assert.ok(positions.size >= 3, "positions : " + Array.from(positions).join(","));
});

t("chaque item est marqué cœur ou contexte ; une notion avec contexte a au moins 3 items cœur", () => {
  S.NOTIONS.forEach(n => {
    const b = S.BANQUE[n.id];
    b.forEach(i => assert.strictEqual(typeof i.coeur, "boolean", i.id));
    if (b.some(i => !i.coeur)) assert.ok(b.filter(i => i.coeur).length >= 3, n.id);
  });
  ["n1", "n3", "n12"].forEach(id => assert.ok(S.BANQUE[id].some(i => !i.coeur), id + " : pas de contexte"));
});

t("chaque défi tiré contient au moins un item cœur (toutes notions, g0 à g49, essais 1 à 3, standard et adapté)", () => {
  S.NOTIONS.forEach(n => graines.forEach(g => [false, true].forEach(ad => [1, 2, 3].forEach(essai => {
    const d = S.tirerDefi(n.id, essai, g, ad);
    assert.ok(d.some(i => i.coeur), n.id + " " + g + " essai " + essai + " : aucun item cœur");
  }))));
});

/* ── Tâche 5 : module « Cap sur l'évaluation n°2 » (entraînement) ── */
const MODULE_IDS = ["m_p1", "m_p2", "m_p3", "m_p4", "m_i1", "m_i2", "m_i3"];
const modItems = () => S.MODULE.reduce((a, m) => a.concat(m.items.map(i => [m.id, i])), []);
const toutOuvert = () => { let e = S.etatVide(); S.NOTIONS.forEach(n => { e = S.appliquer(e, n.id, true); }); return e; };

t("MODULE : 7 défis m_p1 … m_i3, chacun avec critere, ceQuiFaitGagner, items", () => {
  assert.deepStrictEqual(S.MODULE.map(m => m.id), MODULE_IDS);
  S.MODULE.forEach(m => {
    assert.ok(typeof m.critere === "string" && m.critere.length > 5, m.id + " : critere");
    assert.ok(Array.isArray(m.ceQuiFaitGagner) && m.ceQuiFaitGagner.length >= 2, m.id + " : ceQuiFaitGagner");
    assert.ok(m.titre && m.support && m.situation, m.id);
    assert.ok(m.items.length >= 1 && m.items.length <= 6, m.id + " : items");
  });
});

t("aucun texte de MODULE ne contient « RS-1 », « robot », « coque »", () => {
  assert.ok(!/RS-1|robot|coque/i.test(JSON.stringify(S.MODULE)), JSON.stringify(S.MODULE).match(/.{30}(RS-1|robot|coque).{30}/i));
});

t("module verrouillé tant qu'une carte reste fermée, ouvert quand les 13 le sont", () => {
  assert.strictEqual(S.moduleOuvert(S.etatVide()), false);
  let e = S.etatVide();
  S.NOTIONS.slice(0, 12).forEach(n => { e = S.appliquer(e, n.id, true); });
  assert.strictEqual(S.moduleOuvert(e), false, "12 cartes");
  let f = e; for (let i = 0; i < 2; i++) f = S.appliquer(f, "n12", false);
  assert.strictEqual(S.moduleOuvert(f), false, "n12 : deux échecs, pas encore ouverte");
  f = S.appliquer(f, "n12", false);
  assert.strictEqual(S.moduleOuvert(f), true, "n12 ouverte « à revoir » après 3 échecs");
  assert.strictEqual(S.moduleOuvert(toutOuvert()), true);
});

t("items du module : id préfixé, consignes, indice sans la réponse, renvoi, réponses cohérentes", () => {
  const ids = {};
  modItems().forEach(([mid, i]) => {
    assert.ok(i.id.indexOf(mid + "_") === 0 && !ids[i.id], i.id); ids[i.id] = 1;
    assert.ok(i.consigne && i.consigneSimple && i.indice && i.renvoi, i.id);
    assert.ok(/activité|Matériauthèque|diaporama/.test(i.indice), i.id + " : indice sans renvoi");
    if (i.type === "choix" || i.type === "menu") {
      assert.ok(i.options.indexOf(i.bonne) >= 0, i.id);
      assert.ok(norm(i.indice).indexOf(norm(i.bonne)) < 0, i.id + " : l'indice contient la réponse");
    } else if (i.type === "assoc") {
      assert.strictEqual(i.elements.length, i.bonne.length, i.id);
      i.bonne.forEach(b => assert.ok(i.options.indexOf(b) >= 0, i.id + " : " + b));
      assert.ok(new Set(i.bonne).size >= 2, i.id + " : une même réponse partout serait juste");
    } else if (i.type === "ordre") {
      assert.deepStrictEqual(i.options.slice().sort(), i.bonne.slice().sort(), i.id);
    } else assert.strictEqual(i.type, "tableur", i.id);
    if (i.options) assert.strictEqual(new Set(i.options).size, i.options.length, i.id);
  });
});

t("tirerModule : déterministe, mode adapté à 3 options dont la bonne, toutes les réponses d'une assoc gardées", () => {
  MODULE_IDS.forEach(mid => graines.forEach(g => [1, 2].forEach(essai => {
    const d = S.tirerModule(mid, essai, g, true);
    assert.deepStrictEqual(d, S.tirerModule(mid, essai, g, true));
    const m = S.MODULE.find(x => x.id === mid);
    assert.deepStrictEqual(d.map(i => i.id), m.items.map(i => i.id));
    d.forEach(i => {
      const b = m.items.find(x => x.id === i.id);
      if (i.type === "choix" || i.type === "menu") { assert.strictEqual(i.options.length, Math.min(3, b.options.length), i.id); assert.ok(i.options.indexOf(i.bonne) >= 0); }
      if (i.type === "assoc") new Set(b.bonne).forEach(a => assert.ok(i.options.indexOf(a) >= 0, i.id));
      if (i.type === "ordre") assert.strictEqual(i.options[0], i.bonne[0]);
    });
  })));
});

t("défis à choix : « tout juste » réussit, « tout faux » et « même réponse partout » échouent", () => {
  S.MODULE.filter(m => m.items.every(i => i.type !== "tableur")).forEach(m => graines.slice(0, 10).forEach(g => {
    const d = S.tirerModule(m.id, 1, g, false);
    assert.strictEqual(S.corriger(d, reponsesJustes(d)).juste, true, m.id + " juste");
    const faux = {};
    d.forEach(i => {
      if (i.type === "assoc") { const r = {}; i.elements.forEach((e, k) => { r[e] = i.options.find(o => o !== i.bonne[k]); }); faux[i.id] = r; }
      else if (i.type === "ordre") faux[i.id] = i.bonne.slice().reverse();
      else faux[i.id] = i.options.find(o => o !== i.bonne);
    });
    const rf = S.corriger(d, faux);
    assert.strictEqual(rf.juste, false, m.id + " tout faux");
    assert.strictEqual(rf.fautes.length, d.length, m.id + " tout faux : chaque item compte faux");
    d.filter(i => i.type === "assoc").forEach(i => i.options.forEach(o => {
      const r = {}; i.elements.forEach(e => { r[e] = o; });
      assert.strictEqual(S.corriger([i], { [i.id]: r }).juste, false, i.id + " : « " + o + " » partout");
    }));
  }));
});

t("corrigerTableur : références = 1, nombres recopiés = 0,5, résultat tapé ou sans « = » = 0", () => {
  assert.strictEqual(S.corrigerTableur("B4", "=B2*B3").pts, 1);
  assert.strictEqual(S.corrigerTableur("B4", "=B3*B2").pts, 1);
  assert.strictEqual(S.corrigerTableur("B4", "= b2 * b3").pts, 1);
  assert.strictEqual(S.corrigerTableur("B4", "=PRODUIT(B2;B3)").pts, 1);
  assert.strictEqual(S.corrigerTableur("B4", "=produit(b3; b2)").pts, 1);
  const n = S.corrigerTableur("B4", "=24*1,04");
  assert.strictEqual(n.pts, 0.5); assert.ok(/recopi/.test(n.raison), n.raison);
  assert.strictEqual(S.corrigerTableur("B4", "=B2*1,04").pts, 0.5);
  const tape = S.corrigerTableur("B4", "24,96");
  assert.strictEqual(tape.pts, 0); assert.ok(/tapé/.test(tape.raison), tape.raison);
  const sans = S.corrigerTableur("B4", "B2*B3");
  assert.strictEqual(sans.pts, 0); assert.ok(/=/.test(sans.raison), sans.raison);
  assert.strictEqual(S.corrigerTableur("B4", "=B2*B5").pts, 0);
  assert.strictEqual(S.corrigerTableur("B4", "=24,96").pts, 0);
  assert.strictEqual(S.corrigerTableur("B4", "").pts, 0);
  assert.strictEqual(S.corrigerTableur("B6", "=B4*B5").pts, 1);
  assert.strictEqual(S.corrigerTableur("C4", "=C2*C3").pts, 1);
  assert.strictEqual(S.corrigerTableur("C4", "=B2*B3").pts, 0, "colonne recopiée sans changer les cases");
  assert.strictEqual(S.corrigerTableur("C6", "=C4*C5").pts, 1);
  assert.strictEqual(S.corrigerTableur("C7", "=C6/B6").pts, 1);
  assert.strictEqual(S.corrigerTableur("C7", "=B6/C6").pts, 0, "rapport inversé");
  assert.strictEqual(S.corrigerTableur("C7", "=11376/2371,2").pts, 0.5);
});

t("corrigerTableur : données à la virgule décimale ; le point est refusé avec sa raison", () => {
  assert.strictEqual(S.corrigerTableur("B3", "1,04").pts, 1);
  const pt = S.corrigerTableur("B3", "1.04");
  assert.strictEqual(pt.pts, 0); assert.ok(/virgule décimale/.test(pt.raison), pt.raison);
  assert.strictEqual(S.corrigerTableur("C3", "7,9").pts, 1);
  assert.strictEqual(S.corrigerTableur("C3", "7.9").pts, 0);
  assert.strictEqual(S.corrigerTableur("B5", "95").pts, 1);
  assert.strictEqual(S.corrigerTableur("C5", "60").pts, 1);
  assert.strictEqual(S.corrigerTableur("B3", "1,4").pts, 0);
  ["B2", "C2"].forEach(c => assert.ok(S.TABLEUR.cases[c].fourni, c + " : volume fourni 🔒"));
});

t("tableur : valeurs lues dans la Matériauthèque (ABS, inox) et volume de 24 cm³", () => {
  const T = S.TABLEUR.cases;
  assert.strictEqual(T.B2.valeur, 24); assert.strictEqual(T.C2.valeur, 24);
  const fs = require("fs"), chemin = require("path").join(__dirname, "../../materiautheque/data/materiaux.json");
  if (!fs.existsSync(chemin)) { console.log("  (materiaux.json absent : contrôle des valeurs sauté)"); return; }
  const M = JSON.parse(fs.readFileSync(chemin, "utf8")), mat = id => M.find(x => x.id === id);
  assert.strictEqual(T.B3.valeur, mat("abs").masseVolumique); assert.strictEqual(T.B5.valeur, mat("abs").energieGrise);
  assert.strictEqual(T.C3.valeur, mat("inox").masseVolumique); assert.strictEqual(T.C5.valeur, mat("inox").energieGrise);
});

t("corriger, item tableur : juste seulement si toutes les cases ont tous les points", () => {
  const it = S.MODULE.find(m => m.id === "m_i2").items.find(i => i.type === "tableur");
  const bon = { B3: "1,04", C3: "7,9", B5: "95", C5: "60", B4: "=B2*B3", C4: "=C2*C3", B6: "=B4*B5", C6: "=C4*C5", C7: "=C6/B6" };
  assert.deepStrictEqual(Object.keys(bon).sort(), it.cases.slice().sort());
  assert.strictEqual(S.corriger([it], { [it.id]: bon }).juste, true);
  assert.strictEqual(S.corriger([it], { [it.id]: Object.assign({}, bon, { B4: "=24*1,04" }) }).juste, false);
  assert.strictEqual(S.corriger([it], { [it.id]: Object.assign({}, bon, { B3: "1.04" }) }).juste, false);
  assert.strictEqual(S.corriger([it], { [it.id]: {} }).juste, false);
});

t("appliquerModule : essais cumulés, réussite gardée, pur ; aller-retour par versFields", () => {
  const e0 = toutOuvert(), copie = JSON.stringify(e0);
  let e = S.appliquerModule(e0, "m_i2", false);
  assert.strictEqual(JSON.stringify(e0), copie);
  assert.deepStrictEqual(e.module.m_i2, { essais: 1, reussi: false, dernier: false });
  e = S.appliquerModule(e, "m_i2", true);
  e = S.appliquerModule(e, "m_i2", false);
  assert.deepStrictEqual(e.module.m_i2, { essais: 3, reussi: true, dernier: false });
  e.debut = 1700000000000;
  assert.deepStrictEqual(S.depuisFields(S.versFields(e, 1700000060000)).module, e.module);
  assert.deepStrictEqual(S.bilanModule(e), { reussis: ["m_i2"], tentes: ["m_i2"], total: 7 });
});

t("plusAvance : cartes ouvertes d'abord, puis tentatives cumulées ; égalité = non", () => {
  const vide = S.etatVide();
  const un = S.appliquer(vide, "n8", true);                       // 1 ouverte, 1 essai
  const deuxEssais = S.appliquer(S.appliquer(vide, "n3", false), "n3", false); // 0 ouverte, 2 essais
  assert.ok(S.plusAvance(un, vide));
  assert.ok(!S.plusAvance(vide, un));
  assert.ok(S.plusAvance(un, deuxEssais), "une carte ouverte l'emporte sur plus d'essais");
  assert.ok(S.plusAvance(deuxEssais, vide));
  assert.ok(!S.plusAvance(un, JSON.parse(JSON.stringify(un))), "égalité : on garde le local");
  const plusMod = S.appliquerModule(un, "m_i2", false);
  assert.ok(S.plusAvance(plusMod, un), "les défis d'entraînement comptent comme tentatives");
  assert.ok(S.plusAvance(S.depuisFields(S.versFields(plusMod, 0)), un), "après passage par fields");
  assert.ok(!S.plusAvance(null, vide) && S.plusAvance(un, null));
});

/* ── Vague de correctifs après la revue finale ── */
const modItem = id => S.MODULE.reduce((a, m) => a.concat(m.items), []).find(i => i.id === id);

t("I4 : m_i1_a1 fait classer « Être rigide (3/5 au moins) » en Souhaitable", () => {
  const it = modItem("m_i1_a1"), k = it.elements.indexOf("Être rigide (3/5 au moins)");
  assert.ok(k >= 0, "critère de rigidité absent");
  assert.strictEqual(it.bonne[k], "Souhaitable");
});

t("I4 : m_i1_a1 suit la Matériauthèque (boitier-capteur : seuils et classement de référence)", () => {
  const fs = require("fs"), path = require("path"), dir = path.join(__dirname, "../../materiautheque/data");
  if (!fs.existsSync(path.join(dir, "composants.json"))) { console.log("  (composants.json absent : contrôle sauté)"); return; }
  const C = JSON.parse(fs.readFileSync(path.join(dir, "criteres.json"), "utf8"));
  const B = JSON.parse(fs.readFileSync(path.join(dir, "composants.json"), "utf8")).find(x => x.id === "boitier-capteur");
  const ref = B.reference["4"], mots = { indispensable: "Indispensable", souhaitable: "Souhaitable", sans: "Inutile" };
  const apo = s => s.replace(/'/g, "’");
  const it = modItem("m_i1_a1");
  B.criteres.filter(c => ["isolant", "eau", "rigide", "chocs", "cout", "chaleur200"].indexOf(c.ref) >= 0).forEach(c => {
    const def = C.find(x => x.id === c.ref);
    const texte = apo(((c.carte && c.carte["4"]) || def.carte["4"]).replace("{s}", c.seuil != null ? c.seuil : def.regle.valeur));
    const k = it.elements.indexOf(texte);
    assert.ok(k >= 0, "m_i1_a1 sans « " + texte + " »");
    assert.strictEqual(it.bonne[k], mots[ref[c.ref]], texte);
  });
});

t("I1 : durée = temps de travail actif (pauses plafonnées à 5 min), aller-retour", () => {
  const T0 = 1700000000000, MIN = 60000;
  let e = S.noterActivite(S.etatVide(), T0);
  assert.strictEqual(S.versFields(e).duree, "0", "une seule action");
  e = S.noterActivite(e, T0 + 3 * MIN);
  assert.strictEqual(S.versFields(e).duree, "3", "deux actions à 3 min d'écart");
  const semaine = S.noterActivite(S.noterActivite(S.etatVide(), T0), T0 + 7 * 24 * 60 * MIN);
  assert.strictEqual(S.versFields(semaine).duree, "5", "deux actions à une semaine d'écart : plafonné");
  const e2 = S.noterActivite(e, T0 + 3 * MIN + 30000);
  assert.strictEqual(S.versFields(e2).duree, "4", "arrondi au-dessus (3 min 30 s → 4)");
  assert.deepStrictEqual(S.depuisFields(S.versFields(e2)), e2, "aller-retour");
  assert.strictEqual(S.versFields(S.depuisFields(S.versFields(e2))).duree, "4");
  const avant = JSON.stringify(e); S.noterActivite(e, T0 + 9 * MIN);
  assert.strictEqual(JSON.stringify(e), avant, "noterActivite est pure");
});

t("I1 : copie ancienne (sans temps actif) : la durée envoyée est gardée", () => {
  const f = { _niv: "{}", _dernier: "{}", _essais: "{}", duree: "12", adapte: "non", _module: JSON.stringify({ v: 1, module: {}, ouvertes: [], series: {}, debut: 5 }) };
  assert.strictEqual(S.versFields(S.depuisFields(f)).duree, "12");
});

t("M2 : _adapteUtilise envoyé ; absent d'une copie ancienne ≠ « non »", () => {
  let e = S.etatVide();
  assert.strictEqual(S.versFields(e)._adapteUtilise, "non");
  e.adapteUtilise = true; e.adapte = false;
  const f = S.versFields(e);
  assert.strictEqual(f._adapteUtilise, "oui"); assert.strictEqual(f.adapte, "non");
  assert.strictEqual(S.depuisFields(f).adapteUtilise, true);
  const ancien = Object.assign({}, f); delete ancien._adapteUtilise;
  assert.strictEqual(S.depuisFields(ancien).adapteUtilise, null, "copie ancienne, mode non actif : inconnu");
  assert.strictEqual(S.depuisFields(Object.assign({}, ancien, { adapte: "oui" })).adapteUtilise, true, "copie ancienne, mode actif : utilisé");
  assert.ok(!("_adapteUtilise" in S.versFields(S.depuisFields(ancien))), "inconnu : la clé n'est pas inventée");
});

t("M3 : la bonne réponse n'est pas toujours la plus longue (module, hors m_p1_c1 et m_i1_c4)", () => {
  const plusLongue = i => i.options.every(o => o === i.bonne || o.length < i.bonne.length);
  const choix = modItems().map(x => x[1]).filter(i => (i.type === "choix" || i.type === "menu") && ["m_p1_c1", "m_i1_c4"].indexOf(i.id) < 0);
  ["m_p3_c1", "m_i1_c2", "m_i3_c1", "m_i3_c2", "m_i3_c3"].forEach(id => assert.ok(!plusLongue(modItem(id)), id + " : la bonne réponse est la plus longue"));
  const n = choix.filter(plusLongue).length;
  assert.ok(n <= choix.length / 2, n + "/" + choix.length + " items où la bonne réponse est la plus longue");
});

t("tableur : références absolues $ et parenthèses redondantes acceptées ; formule inconnue nommée", () => {
  assert.strictEqual(S.corrigerTableur("B4", "=$B$2*$B$3").pts, 1);
  assert.strictEqual(S.corrigerTableur("B4", "=$B2*B$3").pts, 1);
  assert.strictEqual(S.corrigerTableur("B4", "=(B2)*(B3)").pts, 1);
  assert.strictEqual(S.corrigerTableur("B4", "=(B2*B3)").pts, 1);
  assert.strictEqual(S.corrigerTableur("B4", "=((B2)*B3)").pts, 1);
  assert.strictEqual(S.corrigerTableur("C7", "=($C$6)/(B6)").pts, 1);
  assert.strictEqual(S.corrigerTableur("B4", "=PRODUIT($B$2;(B3))").pts, 1);
  assert.strictEqual(S.corrigerTableur("B4", "=(24)*(1,04)").pts, 0.5);
  ["=B2*B3+1", "=(B2*B3", "=B2)*(B3", "=SOMME(B2;B3)", "=B2*B3*2"].forEach(s => {
    const r = S.corrigerTableur("B4", s);
    assert.strictEqual(r.pts, 0, s); assert.strictEqual(r.raison, "formule non reconnue", s + " : " + r.raison);
  });
  assert.strictEqual(S.corrigerTableur("B4", "=B2*B5").raison, "ce ne sont pas les bonnes cases");
});

t("m_i3_a1 : l'étape d'utilisation parle du boîtier", () => {
  const it = modItem("m_i3_a1");
  assert.ok(it.elements.indexOf("Utiliser le boîtier sous le robinet pendant des années") >= 0);
  assert.ok(it.elements.indexOf("Utiliser le robinet pendant des années") < 0);
});

t("I5 : l'item tableur porte les deux rappels (virgule décimale, formule), formulés comme l'évaluation n°2", () => {
  const it = modItem("m_i2_t");
  assert.deepStrictEqual(it.rappels, [
    "Un nombre décimal s’écrit avec une virgule : 1,04.",
    "Une formule commence par = et utilise les références des cellules (B2, B3…)."
  ]);
  /* tirerModule les garde, en mode standard comme en mode adapté */
  [false, true].forEach(ad => assert.deepStrictEqual(S.tirerModule("m_i2", 1, "g0", ad).find(i => i.id === "m_i2_t").rappels, it.rappels));
});

console.log(ok + " tests réussis");
