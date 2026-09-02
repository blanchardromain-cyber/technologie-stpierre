/*
 * Lecture d'une liste d'élèves — règle unique pour TOUS les imports (plan de classe PC,
 * plan de classe nomade, écran Données), quel que soit le format source : CSV, texte tabulé
 * issu d'un .xlsx (voir xlsx-leger.js) ou copier-coller.
 *
 * Le problème résolu : les listes exportées par la vie scolaire ne commencent pas à la
 * première ligne. Elles portent un titre (« LISTE ÉLÈVES »), une date, l'année scolaire,
 * l'effectif, le nom du professeur principal… puis une ligne d'en-tête, puis les élèves, et
 * parfois des lignes vides ou une annotation à la fin. Prises au premier degré, ces lignes
 * décoratives devenaient autant de faux élèves dans le plan de classe.
 *
 * Les trois règles appliquées à tout fichier :
 *   1. On cherche la ligne d'EN-TÊTE (« Nom et prénom », « Nom » + « Prénom », « Dys »,
 *      « Sexe »…). Si on la trouve, tout ce qui précède est ignoré et les colonnes sont
 *      repérées par leur intitulé — plus par leur position. Sinon on retombe sur l'ordre
 *      historique Nom ; Prénom ; Sexe ; Dys.
 *   2. Une ligne n'est retenue que si sa cellule « nom » ressemble à un nom d'élève : au
 *      moins deux lettres, et aucun des motifs d'annotation connus (titre, date, effectif,
 *      année scolaire, professeur, total…).
 *   3. Le nom et le prénom peuvent tenir dans une seule colonne (« MARTIN Jean », « LE
 *      GARREC GAUCHER Keridwenn », « MARTIN, Jean ») : on sépare sur la casse, les mots en
 *      majuscules formant le nom de famille.
 *
 * Source partagée mobile (pp4g/) + PC (Prof Principal 4e/, via ../../pp4g/js/liste-eleves.js).
 *
 * API : PP4G_LISTE.elevesDepuisTexte(texte) -> { eleves, colonnes, ignorees, lignesIgnorees }
 *         eleves          : [{ nom, prenom, sexe, tags }]
 *         colonnes        : ce qui a été reconnu — { entete, nomComplet, nom, prenom, sexe, dys }
 *         ignorees        : nombre de lignes non retenues (hors lignes vides)
 *         lignesIgnorees  : les 5 premières, pour pouvoir les montrer à l'utilisateur
 */
window.PP4G_LISTE = (function () {
  "use strict";

  // "Prénom " -> "prenom" : comparaison des intitulés sans accent ni casse ni espaces multiples.
  function normaliser(s) {
    return String(s == null ? "" : s)
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/\s+/g, " ").trim();
  }

  // Une case « cochée » d'une façon ou d'une autre (X, x, oui, 1, vrai, « dys »…),
  // sauf négation explicite. Une case vide n'est pas une coche.
  var NEGATIONS = ["0", "-", "–", "non", "n", "no", "faux", "false", "nan"];
  function estCoche(valeur) {
    var v = normaliser(valeur);
    return !!v && NEGATIONS.indexOf(v) === -1;
  }

  // Motifs d'annotation : titres de feuille, dates, effectifs, en-têtes administratifs.
  // Testés sur la cellule « nom » uniquement — une ligne d'élève n'y ressemble jamais.
  var ANNOTATIONS = [
    /^le\s+\d/,                         // "Le 28 août 2026 à 08 h 15"
    /^\d+[\s/.-]/,                      // "28/08/2026", "26 élèves"
    /^\d+$/,
    /liste/, /^classe\b/, /annee scolaire/, /^effectif/, /^total/, /^nombre/,
    /^eleves?$/, /^\d+\s*eleves?$/,
    /^(m|mme|mlle|mr)\.?\s/,            // "Mme TERENEZ Marina" (ligne professeur)
    /professeur/, /^prof\b/, /etablissement/, /^college/, /^lycee/,
    /^page\b/, /^edit(e|ion)/, /^imprim/, /^document/
  ];
  function estAnnotation(valeur) {
    var v = normaliser(valeur);
    if (!v) return true;
    if ((v.match(/[a-z]/g) || []).length < 2) return true;   // chiffres, dates, tirets seuls
    for (var i = 0; i < ANNOTATIONS.length; i++) if (ANNOTATIONS[i].test(v)) return true;
    return false;
  }

  // --- repérage de la ligne d'en-tête et des colonnes ---
  function lireEntete(cellules) {
    // Une vraie ligne d'en-tête ne contient jamais de nombre nu : c'est ce qui distingue
    // « Nom et prénom | Régime | Dys » d'une ligne d'effectif « 26 | élèves ».
    for (var n = 0; n < cellules.length; n++) {
      if (/^\d+([.,]\d+)?$/.test(normaliser(cellules[n]))) return null;
    }
    var col = { nomComplet: -1, nom: -1, prenom: -1, sexe: -1, dys: -1 };
    for (var i = 0; i < cellules.length; i++) {
      var v = normaliser(cellules[i]);
      if (!v) continue;
      // « prénom » contient « nom » : on teste donc le prénom seul EN PREMIER, sinon une
      // colonne « Prénom » serait prise pour une colonne « Nom et prénom ».
      if (/^prenom/.test(v)) col.prenom = i;
      else if (/nom/.test(v) && /prenom/.test(v)) col.nomComplet = i;
      else if (/^nom\b/.test(v) || v === "nom de famille" || v === "patronyme") col.nom = i;
      else if (/^(sexe|genre|f ?\/ ?g|fille ?\/ ?garcon)/.test(v)) col.sexe = i;
      else if (/^(dys|pap|pai|ppre|amenagement)/.test(v)) col.dys = i;
      else if (/^(eleves?|identite)$/.test(v) && col.nomComplet < 0 && col.nom < 0) col.nomComplet = i;
    }
    // en-tête valable seulement si une colonne de nom a été reconnue
    var valide = col.nomComplet >= 0 || col.nom >= 0;
    return valide ? col : null;
  }

  // "LE GARREC GAUCHER Keridwenn" -> { nom: "LE GARREC GAUCHER", prenom: "Keridwenn" }
  // Les mots entièrement en majuscules forment le nom, le reste le prénom. Sans majuscules
  // exploitables, on retombe sur « premier mot = nom, reste = prénom ».
  function separerNomPrenom(brut) {
    var texte = String(brut || "").replace(/\s+/g, " ").trim();
    if (!texte) return null;
    if (texte.indexOf(",") > -1) {                       // "MARTIN, Jean"
      var p = texte.split(",");
      return { nom: p[0].trim(), prenom: p.slice(1).join(" ").trim() };
    }
    var mots = texte.split(" ");
    var majuscules = [];
    for (var i = 0; i < mots.length; i++) {
      var lettres = mots[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z]/g, "");
      if (lettres && lettres === lettres.toUpperCase()) majuscules.push(mots[i]); else break;
    }
    if (majuscules.length && majuscules.length < mots.length) {
      return { nom: majuscules.join(" "), prenom: mots.slice(majuscules.length).join(" ") };
    }
    if (mots.length === 1) return { nom: mots[0], prenom: "" };
    return { nom: mots[0], prenom: mots.slice(1).join(" ") };   // tout en majuscules ou tout en minuscules
  }

  // Séparateur du fichier : celui qui revient le plus souvent sur l'ensemble des lignes
  // (et non sur la seule première ligne, qui peut être un titre isolé).
  function separateur(texte) {
    var candidats = ["\t", ";", ","];
    var meilleur = ";", score = -1;
    for (var i = 0; i < candidats.length; i++) {
      var n = (texte.split(candidats[i]).length - 1);
      if (n > score) { score = n; meilleur = candidats[i]; }
    }
    return score > 0 ? meilleur : ";";
  }

  function elevesDepuisTexte(texte) {
    var brut = String(texte || "").replace(/^﻿/, "");
    var sep = separateur(brut);
    var lignes = brut.split(/\r?\n/);
    var grille = [];
    for (var i = 0; i < lignes.length; i++) {
      var cellules = lignes[i].split(sep);
      for (var j = 0; j < cellules.length; j++) cellules[j] = cellules[j].trim();
      if (cellules.join("")) grille.push(cellules);        // lignes entièrement vides écartées
    }

    // Règle 1 : trouver l'en-tête. Tout ce qui le précède est décoratif.
    var col = null, debut = 0;
    for (var r = 0; r < grille.length; r++) {
      var trouve = lireEntete(grille[r]);
      if (trouve) { col = trouve; debut = r + 1; break; }
    }
    var avecEntete = !!col;
    if (!col) col = { nomComplet: -1, nom: 0, prenom: 1, sexe: 2, dys: 3 };  // ordre historique

    var eleves = [], ignorees = 0, lignesIgnorees = [];
    for (var k = debut; k < grille.length; k++) {
      var c = grille[k];
      var cellule = function (idx) { return idx >= 0 && c[idx] != null ? c[idx] : ""; };
      var nom = "", prenom = "";
      if (col.nomComplet >= 0) {
        var d = separerNomPrenom(cellule(col.nomComplet));
        if (d) { nom = d.nom; prenom = d.prenom; }
      } else {
        nom = cellule(col.nom);
        prenom = cellule(col.prenom);
        // Colonnes séparées annoncées mais prénom absent : le nom porte peut-être les deux.
        if (nom && !prenom) {
          var d2 = separerNomPrenom(nom);
          if (d2 && d2.prenom) { nom = d2.nom; prenom = d2.prenom; }
        }
      }

      // Règle 2 : la cellule de nom doit ressembler à un nom d'élève.
      if (!nom || estAnnotation(nom)) {
        ignorees++;
        if (lignesIgnorees.length < 5) lignesIgnorees.push(c.join(" ").replace(/\s+/g, " ").trim());
        continue;
      }

      var sexe = normaliser(cellule(col.sexe)).charAt(0) === "f" ? "F" : "M";
      var tags = estCoche(cellule(col.dys)) ? ["dys"] : [];
      eleves.push({ nom: nom.toUpperCase(), prenom: prenom, sexe: sexe, tags: tags });
    }

    return {
      eleves: eleves,
      colonnes: { entete: avecEntete, nomComplet: col.nomComplet, nom: col.nom,
                  prenom: col.prenom, sexe: col.sexe, dys: col.dys },
      ignorees: ignorees,
      lignesIgnorees: lignesIgnorees
    };
  }

  return {
    elevesDepuisTexte: elevesDepuisTexte,
    separerNomPrenom: separerNomPrenom,
    estCoche: estCoche,
    estAnnotation: estAnnotation
  };
})();
