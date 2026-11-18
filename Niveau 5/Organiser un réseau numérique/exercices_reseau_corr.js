/* Capsule « Exercices : le fonctionnement d'un réseau informatique » (5e, cap reseau5e-exo).
   Source unique des réponses attendues et du calcul de la note : chargée par la page
   élève (exercices_reseau_eleve.html) ET par index.html (EVALUATIONS["reseau5e-exo"]).
   Travail formatif : les réponses sont lisibles ici, c'est voulu (décision du 18/11/2026). */
(function (racine) {
  "use strict";

  /* ── Exercice 1 : schéma 1, éléments → numéro ; supports de liaison ── */
  var ELEMENTS_EX1 = [
    { id: "borne",       label: "Borne Wi-Fi",         rep: "5", indice: "Elle émet des ondes : cherche l'appareil d'où partent les arcs." },
    { id: "imprimante",  label: "Imprimante",          rep: "8", indice: "Cherche l'appareil d'où sort une feuille de papier." },
    { id: "scanner",     label: "Scanner",             rep: "3", indice: "Il a un couvercle qu'on soulève pour poser le document." },
    { id: "commutateur", label: "Commutateur",         rep: "1", indice: "C'est le boîtier où arrivent tous les câbles." },
    { id: "fixe",        label: "Ordinateur fixe",     rep: "6", indice: "Une tour, un écran, un clavier : il est relié par câble." },
    { id: "smartphone",  label: "Smartphone",          rep: "2", indice: "Le plus petit écran du schéma." },
    { id: "tablette",    label: "Tablette",            rep: "4", indice: "Un écran tactile, sans clavier, plus grand qu'un téléphone." },
    { id: "portable",    label: "Ordinateur portable", rep: "7", indice: "Un écran et un clavier pliés ensemble, sans fil." }
  ];
  var LIAISONS_EX1 = [
    { id: "l16", label: "Support de liaison entre les matériels 1 et 6", rep: "cable", indice: "Regarde le trait qui relie 1 et 6 : est-ce un trait continu ou des arcs ?" },
    { id: "l45", label: "Support de liaison entre les matériels 4 et 5", rep: "ondes", indice: "Entre 4 et 5, vois-tu un trait continu ou des arcs ?" }
  ];

  /* ── Exercice 2 : schéma 4, définitions → n° 1 à 7 ── */
  var DEFINITIONS_EX2 = [
    { id: "d1", label: "Permet de relier les moyens informatiques entre eux", rep: "2", indice: "C'est le boîtier central où arrivent tous les câbles." },
    { id: "d2", label: "Permet l'accès au réseau sans utiliser de fil de câblage", rep: "5", indice: "Cherche l'appareil qui émet des ondes." },
    { id: "d3", label: "Contient les logiciels et stocke les données des ordinateurs du réseau pédagogique", rep: "4", indice: "C'est un ordinateur spécial, au service des autres." },
    { id: "d4", label: "Permet le transfert des données vers un autre réseau", rep: "1", indice: "Cet appareil fait le lien avec Internet." },
    { id: "d5", label: "Permet l'impression d'un document issu exclusivement de l'ordinateur du CDI", rep: "6", indice: "Une imprimante reliée à un seul ordinateur, pas au commutateur." },
    { id: "d6", label: "Permet l'impression d'un document issu de n'importe quel ordinateur du réseau", rep: "7", indice: "Une imprimante reliée au commutateur." },
    { id: "d7", label: "Permet la numérisation d'un document", rep: "3", indice: "Numériser = transformer une feuille en fichier." }
  ];
  var NUMEROS_EX2 = [
    { v: "1", label: "1" }, { v: "2", label: "2" }, { v: "3", label: "3" }, { v: "4", label: "4" },
    { v: "5", label: "5" }, { v: "6", label: "6" }, { v: "7", label: "7" }
  ];

  /* ── Exercice 3 : Éva et Mattéo (schéma 3) ── */
  var OPTIONS_EX3 = {
    e3_q1: [
      { v: "allumer",    label: "Allumer l'ordinateur et ouvrir directement le dossier « Perso »" },
      { v: "identifier", label: "Se connecter avec leur identifiant et leur mot de passe personnels" },
      { v: "wifi",       label: "Se connecter au point d'accès Wi-Fi du collège" },
      { v: "cle",        label: "Brancher une clé USB contenant leurs fichiers" }
    ],
    e3_q2: [
      { v: "fichiers",   label: "Le serveur de fichiers" },
      { v: "comptes",    label: "Le serveur de comptes" },
      { v: "imprimante", label: "L'imprimante" },
      { v: "routeur",    label: "Le routeur" }
    ],
    e3_q3: [
      { v: "comptes",    label: "Le serveur de comptes" },
      { v: "imprimante", label: "L'imprimante" },
      { v: "fichiers",   label: "Le serveur de fichiers" },
      { v: "routeur",    label: "Le routeur" }
    ]
  };
  var QUESTIONS_EX3 = [
    { id: "e3_q1", label: "Que doivent faire Éva et Mattéo pour retrouver leur environnement personnel (lecteur perso) sur l'ordinateur de la salle de technologie ?", rep: "identifier", indice: "Le réseau doit savoir QUI est devant l'ordinateur." },
    { id: "e3_q2", label: "Avec quel serveur entrent-ils en communication pour utiliser le réseau ?", rep: "comptes", indice: "Ce serveur vérifie l'identifiant et le mot de passe." },
    { id: "e3_q3", label: "Mattéo enregistre son travail dans « Perso ». Dans quel serveur son fichier est-il enregistré ?", rep: "fichiers", indice: "Ce serveur garde les documents de chacun." }
  ];

  /* ── Exercice 4 : schéma 2, cheminement de l'information ── */
  /* x, y : centre de l'appareil en % de l'image (400 × 405). */
  var APPAREILS_EX4 = [
    { id: "tablette",    label: "Tablette",            x: 15, y: 14 },
    { id: "routeur",     label: "Routeur",             x: 54, y: 15 },
    { id: "internet",    label: "Internet",            x: 84, y: 15 },
    { id: "portable",    label: "Portable sans fil",   x: 31, y: 45 },
    { id: "wifi",        label: "Point d'accès Wi-Fi", x: 70, y: 45 },
    { id: "commutateur", label: "Commutateur",         x: 16, y: 77 },
    { id: "imprimante",  label: "Imprimante",          x: 50, y: 78 },
    { id: "ordinateur",  label: "Ordinateur",          x: 82, y: 77 }
  ];
  var CHEMINS_EX4 = {
    q1: { depart: "tablette", couleur: "vert",
          attendus: [{ c: ["tablette", "wifi", "commutateur", "routeur", "internet"], l: ["ondes", "cable", "cable", "cable"] }],
          indice: "La tablette n'a pas de câble. Pour sortir vers Internet, l'information passe par l'appareil qui relie le réseau du collège à un autre réseau." },
    q2: { depart: "portable", couleur: "bleu",
          attendus: [{ c: ["portable", "wifi", "commutateur", "imprimante"], l: ["ondes", "cable", "cable"] },
                     { c: ["portable", "wifi", "imprimante"], l: ["ondes", "ondes"] }],
          indice: "Le portable est sans fil. L'imprimante n'a pas besoin d'Internet : l'information reste dans le réseau du collège." }
  };

  function liste(s) { return String(s || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean); }

  /* Fraction juste d'un chemin, comparé au chemin attendu le plus proche.
     Un appareil compte s'il est au bon rang ; une liaison, si ses deux extrémités
     sont au bon rang et le support juste. Un chemin trop long est pénalisé. */
  function noterChemin(cStr, lStr, q) {
    var c = liste(cStr), l = liste(lStr), meilleur = { frac: 0, app: [], lia: [] };
    CHEMINS_EX4[q].attendus.forEach(function (a) {
      var n = a.c.length - 1, ok = 0, app = [], lia = [];
      for (var i = 1; i <= n; i++) {
        var bonApp = c[i] === a.c[i];
        app.push(bonApp ? 1 : 0); if (bonApp) ok++;
        var bonLia = c[i - 1] === a.c[i - 1] && bonApp && l[i - 1] === a.l[i - 1];
        lia.push(bonLia ? 1 : 0); if (bonLia) ok++;
      }
      var denom = Math.max(2 * n, 2 * Math.max(0, c.length - 1));
      var frac = denom ? ok / denom : 0;
      if (frac > meilleur.frac || !meilleur.app.length) meilleur = { frac: frac, app: app, lia: lia, attendu: a };
    });
    return meilleur;
  }

  function niveau(frac) { return frac >= 0.8 ? "maitrise" : frac >= 0.5 ? "encours" : "arevoir"; }

  /* corriger(fields) → { items, pts:{ex1..ex4} (sur 5), note (/20, demi-point), niveaux, chemins } */
  function corriger(f) {
    f = f || {};
    var items = {}, frac = {};
    var n1 = 0;
    ELEMENTS_EX1.forEach(function (e) { var k = "e1_" + e.id; items[k] = String(f[k] || "") === e.rep ? 1 : 0; n1 += items[k]; });
    LIAISONS_EX1.forEach(function (e) { var k = "e1_" + e.id; items[k] = String(f[k] || "") === e.rep ? 1 : 0; n1 += items[k]; });
    frac.ex1 = n1 / (ELEMENTS_EX1.length + LIAISONS_EX1.length);

    var n2 = 0;
    DEFINITIONS_EX2.forEach(function (e) { var k = "e2_" + e.id; items[k] = String(f[k] || "") === e.rep ? 1 : 0; n2 += items[k]; });
    frac.ex2 = n2 / DEFINITIONS_EX2.length;

    var n3 = 0;
    QUESTIONS_EX3.forEach(function (q) { items[q.id] = String(f[q.id] || "") === q.rep ? 1 : 0; n3 += items[q.id]; });
    frac.ex3 = n3 / QUESTIONS_EX3.length;

    var ch1 = noterChemin(f.e4_c1, f.e4_l1, "q1"), ch2 = noterChemin(f.e4_c2, f.e4_l2, "q2");
    items.e4_q1 = ch1.frac === 1 ? 1 : 0; items.e4_q2 = ch2.frac === 1 ? 1 : 0;
    frac.ex4 = (ch1.frac + ch2.frac) / 2;

    var pts = {}, niveaux = {}, total = 0;
    ["ex1", "ex2", "ex3", "ex4"].forEach(function (k) {
      /* Points exacts (non arrondis) : noteEvaluation() d'index.html les additionne puis
         arrondit au demi-point ; arrondis ici au centième, la somme divergeait de la note. */
      pts[k] = frac[k] * 5;
      niveaux[k] = niveau(frac[k]);
      total += frac[k] * 5;
    });
    return { items: items, pts: pts, note: Math.round(total * 2) / 2, niveaux: niveaux, chemins: { q1: ch1, q2: ch2 } };
  }

  var NIVEAUX = {
    maitrise: { mot: "Maîtrisé",  picto: "✅" },
    encours:  { mot: "En cours",  picto: "🟠" },
    arevoir:  { mot: "À revoir",  picto: "🔁" }
  };
  var SITUATIONS = {
    ex1: { titre: "Architecture d'un réseau local", revoir: "partie 2 « Matériels et supports de transmission »" },
    ex2: { titre: "Rôle des constituants du réseau du collège", revoir: "parties 2 et 5 (commutateur, point d'accès, routeur)" },
    ex3: { titre: "Utilisation du réseau local du collège", revoir: "partie 3 « Le rôle du serveur »" },
    ex4: { titre: "Cheminement de l'information", revoir: "parties 4 et 5 (diagnostic, accès à Internet)" }
  };

  /* Appréciation unique (écran élève, modal professeur, impression). */
  function appreciation(r) {
    var mention = r.note >= 16 ? "Très bon travail" : r.note >= 12 ? "Bon travail" : r.note >= 8 ? "Travail à consolider" : "Des notions à reprendre";
    var faibles = ["ex1", "ex2", "ex3", "ex4"].filter(function (k) { return r.niveaux[k] === "arevoir"; })
      .map(function (k) { return SITUATIONS[k].titre.toLowerCase(); });
    var tout = ["ex1", "ex2", "ex3", "ex4"].every(function (k) { return r.niveaux[k] === "maitrise"; });
    return mention + " — " + String(r.note).replace(".", ",") + "/20. "
      + (faibles.length ? "À revoir : " + faibles.join(", ") + "."
         : tout ? "Toutes les situations sont maîtrisées." : "Aucune situation à revoir entièrement : continue sur ta lancée.");
  }

  var RXO = {
    ELEMENTS_EX1: ELEMENTS_EX1, LIAISONS_EX1: LIAISONS_EX1, DEFINITIONS_EX2: DEFINITIONS_EX2,
    NUMEROS_EX2: NUMEROS_EX2, OPTIONS_EX3: OPTIONS_EX3, QUESTIONS_EX3: QUESTIONS_EX3,
    APPAREILS_EX4: APPAREILS_EX4, CHEMINS_EX4: CHEMINS_EX4, NIVEAUX: NIVEAUX, SITUATIONS: SITUATIONS,
    corriger: corriger, noterChemin: noterChemin, appreciation: appreciation
  };
  if (typeof module !== "undefined" && module.exports) module.exports = RXO;
  racine.RXO = RXO;
})(typeof window !== "undefined" ? window : this);
