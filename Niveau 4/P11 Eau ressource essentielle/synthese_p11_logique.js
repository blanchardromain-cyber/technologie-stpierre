/* Capsule « La synthèse se gagne » (P11, 4e) : logique pure, sans interface.
   Chaque carte-notion de la synthèse s'ouvre après un court défi. Ce module tire les
   défis, les corrige, tient l'état de l'élève et le met en forme pour le classeur.
   Chargé par la page élève (window.P11SYN) et par les tests (node outils/test_synthese_p11.js).
   Travail formatif : les réponses sont lisibles ici, c'est voulu. */
(function (racine) {
  "use strict";

  /* ── Les 13 notions de la synthèse (titres exacts de S11), dans l'ordre ── */
  function N(id, titre, partie, jalon, type, activites, lienRappel) {
    var n = { id: id, titre: titre, partie: partie, jalon: jalon, type: type, activites: activites };
    if (lienRappel) n.lienRappel = lienRappel;
    return n;
  }
  var NOTIONS = [
    N("n0",  "Les étapes de conception d'un objet technique",   "I",  1, "complete", []),
    N("n1",  "Analyse du besoin",                               "I",  1, "complete", ["A1", "A2", "A3"]),
    N("n2",  "Bête à cornes",                                   "I",  1, "rappel",   ["A3"], "#sec1"),
    N("n3",  "Contraintes",                                     "I",  2, "complete", ["A4"]),
    N("n4",  "Les normes",                                      "I",  2, "rappel",   ["A4"], "#sec4"),
    N("n5",  "Cahier des charges (Textuel)",                    "I",  3, "rappel",   ["A5"], "#sec3"),
    N("n6",  "Pieuvre",                                         "I",  3, "rappel",   ["A5"], "#sec2"),
    N("n7",  "Cahier des Charges Technique ou Fonctionnel",     "I",  3, "rappel",   ["A5"], "#sec3"),
    N("n8",  "Conception de l'objet",                           "I",  4, "complete", ["A6"]),
    N("n9",  "Chaîne d'information",                            "II", 5, "complete", ["A7"]),
    N("n10", "Chaîne d'énergie",                                "II", 5, "complete", ["A7"]),
    N("n11", "Le fonctionnement d'un objet",                    "II", 5, "complete", ["A7"]),
    N("n12", "Le choix des matériaux",                          "II", 5, "complete", ["A7"])
  ];

  /* ── Banque de défis. En tâche 1, seule n8 (FAST du robinet, activité 6) est remplie. ── */
  var QUESTIONS_FAST = ["Pourquoi ?", "Comment ?", "Quand ?", "Combien ?"];
  var BANQUE = {
    n8: [
      { id: "n8_m1", type: "menu",
        consigne: "Dans le FAST du robinet, quelle solution technique réalise la fonction « Détecter la présence des mains » ?",
        consigneSimple: "Quelle pièce du robinet détecte les mains ?",
        options: ["Capteur infrarouge", "Carte électronique (microcontrôleur)", "Électrovanne", "Voyant"],
        bonne: "Capteur infrarouge",
        indice: "Cherche la pièce qui « voit » les mains approcher, sans les toucher.", renvoi: "A6" },
      { id: "n8_m2", type: "menu",
        consigne: "Dans le FAST du robinet, quelle solution technique réalise la fonction « Ouvrir / fermer l'arrivée d'eau » ?",
        consigneSimple: "Quelle pièce du robinet laisse passer ou arrête l'eau ?",
        options: ["Turbine + générateur", "Tuyauterie", "Électrovanne", "Capteur infrarouge"],
        bonne: "Électrovanne",
        indice: "C'est une vanne, mais commandée par l'électricité plutôt que par une poignée.", renvoi: "A6" },
      { id: "n8_o1", type: "ordre",
        consigne: "Classe les quatre fonctions techniques du robinet dans l'ordre où elles se déroulent quand on tend les mains (lecture verticale, « Quand ? »), pas par importance.",
        consigneSimple: "Mets les quatre fonctions dans l'ordre où elles se passent quand on tend les mains. La première est déjà placée.",
        options: ["Détecter la présence des mains", "Traiter l'information et commander", "Ouvrir / fermer l'arrivée d'eau", "Produire l'énergie électrique (sans pile)"],
        bonne: ["Détecter la présence des mains", "Traiter l'information et commander", "Ouvrir / fermer l'arrivée d'eau", "Produire l'énergie électrique (sans pile)"],
        indice: "Demande-toi ce qui doit arriver avant quoi : on détecte, puis on décide, puis l'eau coule. L'électricité se produit pendant que l'eau passe.", renvoi: "A6" },
      { id: "n8_c1", type: "choix",
        consigne: "On lit un diagramme FAST de droite à gauche. À quelle question cette lecture répond-elle ?",
        consigneSimple: "Lire le FAST de droite à gauche : quelle question ?",
        options: QUESTIONS_FAST, bonne: "Pourquoi ?",
        indice: "Quand on part d'une solution pour remonter vers la fonction d'usage, on cherche la raison d'être de la pièce.", renvoi: "A6" },
      { id: "n8_c2", type: "choix",
        consigne: "On lit un diagramme FAST de gauche à droite. À quelle question cette lecture répond-elle ?",
        consigneSimple: "Lire le FAST de gauche à droite : quelle question ?",
        options: QUESTIONS_FAST, bonne: "Comment ?",
        indice: "Partir de la fonction d'usage et avancer vers les solutions, c'est chercher de quelle façon la fonction est réalisée.", renvoi: "A6" },
      { id: "n8_c3", type: "choix",
        consigne: "Dans un diagramme FAST, les fonctions placées les unes sous les autres sont simultanées ou complémentaires. À quelle question répond cette lecture verticale ?",
        consigneSimple: "Lire le FAST de haut en bas : quelle question ?",
        options: QUESTIONS_FAST, bonne: "Quand ?",
        indice: "Des fonctions qui se font en même temps ou l'une avec l'autre : la question porte sur le moment.", renvoi: "A6" }
    ]
  };

  /* ── Tirage déterministe : hachage de la graine, puis petit générateur ── */
  function hachage(s) {
    var h = 2166136261;
    s = String(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function generateur(graine) {
    var a = graine >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function melanger(tab, rnd) {
    var r = tab.slice();
    for (var i = r.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1)), x = r[i]; r[i] = r[j]; r[j] = x;
    }
    return r;
  }
  function copie(o) { return JSON.parse(JSON.stringify(o)); }
  function memeListe(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  /* Prépare un item pour l'élève : options mélangées ; en mode adapté, 3 options dont la
     bonne (choix, menu, assoc) ou, pour un ordre, tous les éléments avec le premier pré-placé. */
  function preparer(item, adapte, rnd) {
    var it = copie(item);
    if (it.type === "ordre") {
      if (adapte) {
        it.options = [it.bonne[0]].concat(melanger(it.bonne.slice(1), rnd));
        it.fixe = 0;
      } else {
        var o = melanger(it.options, rnd);
        if (memeListe(o, it.bonne)) o.push(o.shift());
        it.options = o;
      }
    } else if (adapte && typeof it.bonne === "string" && it.options.length > 3) {
      var autres = melanger(it.options.filter(function (x) { return x !== it.bonne; }), rnd).slice(0, 2);
      it.options = melanger(autres.concat([it.bonne]), rnd);
    } else {
      it.options = melanger(it.options, rnd);
    }
    return it;
  }

  /* tirerDefi : la banque est battue une seule fois par graine (indépendamment de l'essai) ;
     l'essai n prend la tranche n suivante, donc aucun item ne revient d'un essai à l'autre
     tant que la banque est assez grande. */
  function tirerDefi(notionId, essai, graine, adapte) {
    var banque = BANQUE[notionId] || [];
    if (!banque.length) return [];
    var rnd = generateur(hachage(graine + "|" + notionId));
    var ordre = melanger(banque, rnd);
    var k = Math.max(2, Math.min(4, Math.floor(banque.length / 3)));
    k = Math.min(k, ordre.length);
    var e = Math.max(1, Math.floor(essai) || 1), items = [];
    for (var i = 0; i < k; i++) items.push(ordre[((e - 1) * k + i) % ordre.length]);
    var rndEssai = generateur(hachage(graine + "|" + notionId + "|" + e));
    return items.map(function (it) { return preparer(it, !!adapte, rndEssai); });
  }

  function corriger(items, reponses) {
    reponses = reponses || {};
    var fautes = [], indice = "";
    items.forEach(function (it) {
      var r = reponses[it.id], bon = Array.isArray(it.bonne) ? memeListe(r, it.bonne) : r === it.bonne;
      if (!bon) { fautes.push(it.id); if (!indice) indice = it.indice; }
    });
    return { juste: fautes.length === 0, fautes: fautes, indice: indice };
  }

  /* ── État de l'élève ── */
  var RANG = { a_revoir: 1, en_cours: 2, acquis: 3 };
  function etatVide() { return { v: 1, cartes: {}, module: {}, adapte: false, debut: null }; }
  function carteVide() { return { niv: null, dernier: null, essais: 0, ouverte: false, serie: 0 }; }

  /* appliquer : une tentative terminée (tout le défi corrigé). `serie` compte les tentatives
     de la série en cours ; elle repart à 0 quand la carte s'ouvre (réussite ou 3e échec).
     `essais` cumule toutes les tentatives, rejeux compris ; `niv` garde le meilleur niveau. */
  function appliquer(etat, notionId, juste) {
    var e = copie(etat), c = e.cartes[notionId] ? e.cartes[notionId] : carteVide();
    c.essais += 1; c.serie += 1;
    var niveau = null;
    if (juste) niveau = c.serie === 1 ? "acquis" : "en_cours";
    else if (c.serie >= 3) niveau = "a_revoir";
    if (niveau) {
      c.dernier = niveau; c.ouverte = true; c.serie = 0;
      if (!c.niv || RANG[niveau] > RANG[c.niv]) c.niv = niveau;
    }
    e.cartes[notionId] = c;
    return e;
  }
  /* Numéro de l'essai à tirer pour la prochaine tentative (1 à 3). */
  function essaiSuivant(etat, notionId) {
    var c = etat.cartes[notionId];
    return (c ? c.serie : 0) + 1;
  }

  /* ── Passage au classeur : champs en chaînes, jamais de = + @ en tête ── */
  function versFields(etat, maintenant) {
    var niv = {}, dernier = {}, essais = {}, ouvertes = [], series = {};
    Object.keys(etat.cartes).forEach(function (id) {
      var c = etat.cartes[id];
      if (c.niv) niv[id] = c.niv;
      if (c.dernier) dernier[id] = c.dernier;
      essais[id] = c.essais;
      if (c.ouverte) ouvertes.push(id);
      if (c.serie) series[id] = c.serie;
    });
    /* durée en minutes entières, arrondie au-dessus : une session courte donne « 1 », pas « 0 » */
    var minutes = etat.debut ? Math.max(0, Math.ceil(((maintenant == null ? Date.now() : maintenant) - etat.debut) / 60000)) : 0;
    return {
      _niv: JSON.stringify(niv),
      _dernier: JSON.stringify(dernier),
      _essais: JSON.stringify(essais),
      duree: String(minutes),
      adapte: etat.adapte ? "oui" : "non",
      _module: JSON.stringify({ v: etat.v, module: etat.module, ouvertes: ouvertes, series: series, debut: etat.debut })
    };
  }
  function lireJSON(s, defaut) {
    try { var v = JSON.parse(s); return v && typeof v === "object" ? v : defaut; } catch (x) { return defaut; }
  }
  function depuisFields(f) {
    var e = etatVide();
    if (!f || typeof f !== "object") return e;
    var niv = lireJSON(f._niv, {}), dernier = lireJSON(f._dernier, {}), essais = lireJSON(f._essais, {});
    var m = lireJSON(f._module, {}), ouvertes = Array.isArray(m.ouvertes) ? m.ouvertes : [], series = m.series || {};
    var ids = {};
    [niv, dernier, essais, series].forEach(function (o) { Object.keys(o).forEach(function (k) { ids[k] = 1; }); });
    ouvertes.forEach(function (k) { ids[k] = 1; });
    Object.keys(ids).forEach(function (id) {
      e.cartes[id] = {
        niv: niv[id] || null, dernier: dernier[id] || null, essais: essais[id] || 0,
        ouverte: ouvertes.indexOf(id) >= 0, serie: series[id] || 0
      };
    });
    e.module = m.module && typeof m.module === "object" ? m.module : {};
    e.adapte = f.adapte === "oui";
    e.debut = typeof m.debut === "number" ? m.debut : null;
    return e;
  }

  /* Bilan de mémorisation : un niveau par notion et les notions à retravailler (niveau en_cours
     ou a_revoir), avec l'activité où revoir (ou « toutes » pour la notion d'ensemble). */
  function memoire(etat) {
    var niveaux = {}, aRetravailler = [];
    NOTIONS.forEach(function (n) {
      var c = etat.cartes[n.id], niv = c && c.niv ? c.niv : null;
      niveaux[n.id] = niv;
      if (niv === "a_revoir" || niv === "en_cours")
        aRetravailler.push({ id: n.id, titre: n.titre, renvoi: n.activites.length ? n.activites.join(", ") : "toutes les activités" });
    });
    return { niveaux: niveaux, aRetravailler: aRetravailler };
  }

  function cleEtat(idEleve) {
    var s = idEleve == null ? "" : String(idEleve).trim();
    return s ? "p11-syn_etat:" + s : null;
  }

  var API = {
    NOTIONS: NOTIONS, BANQUE: BANQUE,
    tirerDefi: tirerDefi, corriger: corriger, appliquer: appliquer, essaiSuivant: essaiSuivant,
    etatVide: etatVide, versFields: versFields, depuisFields: depuisFields,
    memoire: memoire, cleEtat: cleEtat
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else racine.P11SYN = API;
})(typeof window !== "undefined" ? window : this);
