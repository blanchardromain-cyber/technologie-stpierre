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

  /* ── Banque de défis : de 6 à 8 items par notion, soit 2 à 3 variantes de défi de 2 items.
     Les textes viennent des fiches et corrigés A1 à A7 et de la synthèse S11 ; les indices
     renvoient à l'activité sans donner la réponse. Item « assoc » : `elements` (à gauche),
     `options` (à choisir pour chacun), `bonne` alignée sur `elements`. ── */
  function Q(id, type, consigne, consigneSimple, options, bonne, indice, renvoi, elements) {
    var it = { id: id, type: type, consigne: consigne, consigneSimple: consigneSimple, options: options, bonne: bonne, indice: indice, renvoi: renvoi };
    if (elements) it.elements = elements;
    return it;
  }
  var ETAPES = ["Analyse le besoin", "Définit les contraintes", "Établit le cahier des charges", "Conçoit l’objet"];
  var BESOIN = ["Besoin essentiel", "Besoin secondaire"];
  var ORIGINE = ["Exigence de l’utilisateur", "Règle ou norme officielle"];
  var VF = ["Vrai", "Faux"];
  var CE_NF = ["CE", "NF", "IP65"];
  var Q_BETE = ["À qui le produit rend-il service ?", "Sur quoi le produit agit-il ?", "Dans quel but le produit existe-t-il ?"];
  var FPFC = ["FP (fonction principale)", "FC (fonction contrainte)"];
  var COLONNES = ["une fonction", "un critère", "un niveau"];
  var CHAINES = ["Chaîne d’information", "Chaîne d’énergie", "Aucune des deux"];
  var ENERGIES = ["Énergie hydraulique", "Énergie mécanique", "Énergie électrique"];
  var CRITERES = ["La résistance aux efforts", "La capacité à être transformé", "La qualité esthétique", "Le respect de l’environnement", "Le prix"];
  var IND_BETE = "Essaie la réponse après chaque question, à voix haute : une seule phrase sonne juste. Revois la bête à cornes de l’activité 3.";
  var IND_IP = "Revois l’activité 4, partie 3 : les deux chiffres de l’indice IP ne protègent pas contre la même chose.";
  var IND_NORME = "Revois l’activité 4, partie 2 « Qu’est-ce qu’une norme ? ».";
  var IND_SYMB = "Revois la synthèse intermédiaire, partie 4 « Les normes » : l’un des deux symboles est européen, l’autre français.";
  var IND_ERREUR = "Relis la phrase morceau par morceau et compare-la au cahier des charges du robinet de l’activité 5.";
  var IND_PIEUVRE = "Compte les éléments du milieu extérieur que relie ce trait : deux, ou un seul ? Revois la pieuvre de l’activité 5.";
  var IND_CLASSE = "Revois l’activité 7, partie 3 « Je nomme et je classe ».";
  var QUESTIONS_FAST = ["Pourquoi ?", "Comment ?", "Quand ?", "Combien ?"];
  var BANQUE = {
    /* Carte 0 : la frise du concepteur (S11) */
    n0: [
      Q("n0_o1", "ordre", "Remets dans l’ordre les quatre étapes du travail du concepteur, de la première à la dernière.",
        "Range les 4 étapes du concepteur dans l’ordre. La première est déjà placée.", ETAPES, ETAPES,
        "Pense à l’ordre des activités 3 à 6 : chaque étape a eu son activité, dans l’ordre où tu les as faites.", "A3-A6"),
      Q("n0_c1", "choix", "Par quelle étape le concepteur commence-t-il ?", "Quelle est la première étape ?", ETAPES, ETAPES[0],
        "Revois l’activité 3 : c’est par elle que l’étude du robinet a commencé.", "A3"),
      Q("n0_c2", "choix", "Quelle étape vient juste avant « Conçoit l’objet » ?", "Quelle étape vient avant « Conçoit l’objet » ?", ETAPES, ETAPES[2],
        "Revois l’activité 5 : c’est l’étape juste avant le FAST de l’activité 6.", "A5"),
      Q("n0_c3", "choix", "Quelle étape vient juste après « Analyse le besoin » ?", "Quelle étape vient après « Analyse le besoin » ?", ETAPES, ETAPES[1],
        "Revois l’activité 4 : elle suit directement l’étude du besoin.", "A4"),
      Q("n0_a1", "assoc", "Associe chaque activité de la séquence à l’étape du concepteur qu’elle t’a fait vivre.",
        "Pour chaque activité, choisis son étape.", ETAPES, [ETAPES[0], ETAPES[1], ETAPES[3]],
        "Pour chaque activité, demande-toi ce que vous cherchiez : à quoi sert le robinet, ce qu’il doit respecter, ou comment il est fait. Revois les activités 3, 4 et 6.", "A3-A6",
        ["Activité 3 : la bête à cornes du robinet", "Activité 4 : les contraintes et l’indice IP", "Activité 6 : le FAST du robinet"]),
      Q("n0_c4", "choix", "Le robinet coule pendant qu’on se savonne les mains : le concepteur repère ce gaspillage. À quelle étape en est-il ?",
        "Le concepteur repère un gaspillage d’eau. À quelle étape est-il ?", ETAPES, ETAPES[0],
        "Revois l’activité 3 : c’est là qu’on a cherché à quel problème répond le robinet automatique.", "A3")
    ],
    /* Carte 1 : analyse du besoin (A1, A2, A3) */
    n1: [
      Q("n1_a1", "assoc", "Classe chaque besoin : essentiel ou secondaire ?", "Pour chaque besoin, choisis : essentiel ou secondaire.", BESOIN,
        [BESOIN[0], BESOIN[1], BESOIN[1]],
        "Pour chacun, demande-toi si l’on peut vivre sans. Revois l’activité 3 sur le besoin.", "A3",
        ["Se nourrir", "Le confort", "Le loisir"]),
      Q("n1_c1", "choix", "Au robinet, l’eau coule souvent pour rien (pendant le savonnage, robinet mal fermé…). Quel objet technique répond à ce besoin non satisfait ?",
        "L’eau coule pour rien au robinet. Quel objet répond à ce besoin ?",
        ["Un robinet automatique à détection", "Un château d’eau", "Une station de potabilisation", "Une facture d’eau détaillée"], "Un robinet automatique à détection",
        "Cherche l’objet que toute la suite de la séquence a étudié. Revois la fin de l’activité 2, « Vers une solution technique ».", "A2"),
      Q("n1_c2", "choix", "Dans un foyer, à quoi va la plus grande part de l’eau consommée ?", "Où va le plus d’eau dans une maison ?",
        ["L’hygiène corporelle", "Le linge", "La vaisselle", "La chasse d’eau"], "L’hygiène corporelle",
        "Revois l’activité 2, le tableau de répartition de la consommation : cherche le plus grand pourcentage.", "A2"),
      Q("n1_o1", "ordre", "Remets dans l’ordre le voyage de l’eau, du milieu naturel jusqu’à toi.",
        "Range les étapes du voyage de l’eau. La première est déjà placée.",
        ["Captage", "Potabilisation", "Stockage (château d’eau)", "Robinet"], ["Captage", "Potabilisation", "Stockage (château d’eau)", "Robinet"],
        "Revois l’activité 1 : suis le trajet d’une goutte depuis la nappe, la source ou le cours d’eau jusqu’au lavabo.", "A1"),
      Q("n1_c3", "choix", "Sur la facture d’eau de l’activité 2, à quoi correspondent les cellules orange ?", "Facture d’eau : que sont les cellules orange ?",
        ["À la redevance d’assainissement (les eaux usées)", "À l’abonnement", "À la TVA", "Au prix de l’eau potable"], "À la redevance d’assainissement (les eaux usées)",
        "Revois l’activité 2, question 2c : ces cellules ne concernent pas l’eau potable que tu reçois.", "A2"),
      Q("n1_c4", "choix", "Dans le voyage de l’eau, quel élément stocke l’eau et lui donne la pression ?", "Quel élément garde l’eau et lui donne la pression ?",
        ["Le château d’eau", "La nappe", "Le robinet", "La station de potabilisation"], "Le château d’eau",
        "Revois l’activité 1, question 4 : la fonction d’usage de cet élément y est demandée.", "A1"),
      Q("n1_c5", "choix", "Qu’est-ce qui pousse à créer un nouvel objet technique ?", "Pourquoi crée-t-on un nouvel objet ?",
        ["Un besoin non satisfait", "Une facture payée", "Une norme officielle", "Un matériau recyclable"], "Un besoin non satisfait",
        "Revois « Ce que je dois retenir » de l’activité 3, à la ligne « Besoin ».", "A3"),
      Q("n1_c6", "choix", "Lequel de ces besoins est un besoin essentiel ?", "Quel besoin est essentiel ?",
        ["Se nourrir", "Le confort", "Le loisir"], "Se nourrir",
        "Pour chacun, demande-toi si l’on peut vivre sans. Revois l’activité 3 sur le besoin.", "A3")
    ],
    /* Carte 2 : bête à cornes (rappel, A3 ; GPS de S11) */
    n2: [
      Q("n2_a1", "assoc", "Bête à cornes du robinet : associe chaque réponse à sa question.", "Pour chaque réponse, choisis sa question.", Q_BETE, Q_BETE,
        IND_BETE, "A3", ["Aux utilisateurs", "Sur l’eau", "Économiser l’eau en évitant le gaspillage"]),
      Q("n2_c1", "choix", "Bête à cornes du robinet : « Aux utilisateurs » répond à quelle question ?", "« Aux utilisateurs » : quelle question ?", Q_BETE, Q_BETE[0], IND_BETE, "A3"),
      Q("n2_c2", "choix", "Bête à cornes du robinet : « Sur l’eau » répond à quelle question ?", "« Sur l’eau » : quelle question ?", Q_BETE, Q_BETE[1], IND_BETE, "A3"),
      Q("n2_c3", "choix", "Bête à cornes du robinet : « Économiser l’eau en évitant le gaspillage » répond à quelle question ?", "« Économiser l’eau » : quelle question ?", Q_BETE, Q_BETE[2], IND_BETE, "A3"),
      Q("n2_c4", "choix", "Bête à cornes du GPS : la case « Permettre de déterminer avec précision une position géographique afin de se repérer » répond à quelle question ?",
        "GPS : « se repérer » répond à quelle question ?", Q_BETE, Q_BETE[2],
        "Cherche la case qui, pour le robinet, contenait « Économiser l’eau ». Revois la bête à cornes de l’activité 3.", "A3"),
      Q("n2_c5", "choix", "Dans la bête à cornes du robinet, que met-on dans la case « Sur quoi le produit agit-il ? »", "Sur quoi agit le robinet ?",
        ["Sur l’eau", "Sur le lavabo", "Sur la facture", "Sur les mains"], "Sur l’eau",
        "Revois la bête à cornes de l’activité 3 : la corne de droite.", "A3")
    ],
    /* Carte 3 : contraintes (A4) */
    n3: [
      Q("n3_a1", "assoc", "Pour chaque contrainte du robinet, qui la fixe : l’utilisateur, ou une règle ou norme officielle ?",
        "Pour chaque contrainte, choisis qui la fixe.", ORIGINE, [ORIGINE[1], ORIGINE[0], ORIGINE[0]],
        "Demande-toi qui impose chaque contrainte : l’acheteur du robinet, ou un texte officiel valable pour tous ? Revois l’activité 4, parties 1 et 2.", "A4",
        ["Assurer la sécurité électrique (très basse tension)", "Respecter un budget", "Être esthétique"]),
      Q("n3_a2", "assoc", "Pour chaque contrainte du robinet, qui la fixe : l’utilisateur, ou une règle ou norme officielle ?",
        "Pour chaque contrainte, choisis qui la fixe.", ORIGINE, [ORIGINE[1], ORIGINE[0]],
        "Demande-toi qui impose chaque contrainte : l’acheteur du robinet, ou un texte officiel valable pour tous ? Revois l’activité 4, parties 1 et 2.", "A4",
        ["Avoir un indice IP adapté aux projections d’eau", "Être facile à entretenir"]),
      Q("n3_c1", "choix", "Le robinet est placé près d’un point d’eau (projections fréquentes). Dans le tableau de l’indice IP, quel 2ᵉ chiffre minimum choisis-tu ?",
        "Près d’un point d’eau : quel 2ᵉ chiffre IP au minimum ?",
        ["1 : chutes verticales de gouttes d’eau", "3 : eau de pluie jusqu’à 60° de la verticale", "4 : projections d’eau de toutes directions", "7 : immersion temporaire"],
        "4 : projections d’eau de toutes directions",
        "Revois l’activité 4, le tableau de l’indice IP : dans la colonne du 2ᵉ chiffre, cherche la ligne qui décrit ce qui arrive près d’un lavabo.", "A4"),
      Q("n3_c2", "choix", "Dans un indice IP, que désigne le 2ᵉ chiffre ?", "IP : que dit le 2ᵉ chiffre ?",
        ["La protection contre les liquides", "La protection contre les corps solides", "La sécurité électrique", "Le prix du robinet"], "La protection contre les liquides", IND_IP, "A4"),
      Q("n3_c3", "choix", "Dans un indice IP, que désigne le 1ᵉʳ chiffre ?", "IP : que dit le 1ᵉʳ chiffre ?",
        ["La protection contre les corps solides", "La protection contre les liquides", "La sécurité électrique", "Le prix du robinet"], "La protection contre les corps solides", IND_IP, "A4"),
      Q("n3_c4", "choix", "Le robinet est installé dans un milieu humide. Quel indice IP lui convient ?", "Milieu humide : quel indice IP ?",
        ["IP65", "IP20", "IP31", "IP10"], "IP65",
        "Revois « Ce que je dois retenir » de l’activité 4 : en milieu humide, regarde surtout le 2ᵉ chiffre.", "A4"),
      Q("n3_c5", "choix", "« Respecter un budget » : qui fixe cette contrainte du robinet ?", "« Respecter un budget » : qui le fixe ?", ORIGINE, ORIGINE[0],
        "Demande-toi si un texte officiel l’impose à tous les robinets, ou si c’est le choix de celui qui l’achète. Revois l’activité 4, partie 1.", "A4"),
      Q("n3_c6", "choix", "« Assurer la sécurité électrique (très basse tension) » : qui fixe cette contrainte du robinet ?", "« Sécurité électrique » : qui la fixe ?", ORIGINE, ORIGINE[1],
        "Demande-toi si un texte officiel l’impose à tous les robinets, ou si c’est le choix de celui qui l’achète. Revois l’activité 4, parties 1 et 2.", "A4")
    ],
    /* Carte 4 : les normes (rappel, A4 ; symboles CE et NF de la synthèse intermédiaire) */
    n4: [
      Q("n4_v1", "choix", "Vrai ou faux ? Une norme est obligatoire : le concepteur du robinet doit la respecter.", "Vrai ou faux ? Le concepteur doit respecter une norme.", VF, "Vrai", IND_NORME, "A4"),
      Q("n4_v2", "choix", "Vrai ou faux ? Une norme est un simple conseil : le concepteur du robinet peut l’ignorer.", "Vrai ou faux ? Une norme est un simple conseil.", VF, "Faux", IND_NORME, "A4"),
      Q("n4_v3", "choix", "Vrai ou faux ? Une norme peut porter sur la sécurité, la qualité ou la compatibilité.", "Vrai ou faux ? Une norme peut porter sur la sécurité.", VF, "Vrai", IND_NORME, "A4"),
      Q("n4_v4", "choix", "Vrai ou faux ? L’indice IP du robinet vient d’une norme : le concepteur doit le respecter.", "Vrai ou faux ? L’indice IP vient d’une norme.", VF, "Vrai",
        "Revois le titre de l’activité 4 : « Contraintes et norme (indice IP) ».", "A4"),
      Q("n4_s1", "choix", "Le robinet est vendu dans l’Union européenne. Quel marquage montre qu’il respecte les règles européennes ?", "Quel marquage pour l’Europe ?", CE_NF, "CE", IND_SYMB, "SI"),
      Q("n4_s2", "choix", "Quelle marque montre qu’un produit respecte les normes françaises ?", "Quelle marque pour la France ?", CE_NF, "NF", IND_SYMB, "SI")
    ],
    /* Carte 5 : cahier des charges textuel (rappel, A5) — repérer l'erreur */
    n5: [
      /* l'erreur est tantôt au début, au milieu ou à la fin de la phrase */
      Q("n5_e1", "choix", "Une erreur s’est glissée dans cette phrase : « Le cahier des charges du robinet décrit les solutions techniques à choisir et les contraintes à respecter. » Quel groupe de mots est faux ?",
        "Trouve le groupe de mots faux.", ["Le cahier des charges du robinet décrit", "les solutions techniques à choisir", "et les contraintes à respecter"], "les solutions techniques à choisir",
        "Revois l’activité 5 : le cahier des charges dit ce qu’on exige du robinet, pas encore comment on le fabrique.", "A5"),
      Q("n5_e2", "choix", "Une erreur s’est glissée dans cette phrase : « Le concepteur du robinet consulte le cahier des charges seulement au début du projet. » Quel groupe de mots est faux ?",
        "Trouve le groupe de mots faux.", ["Le concepteur du robinet", "consulte le cahier des charges", "seulement au début du projet"], "seulement au début du projet",
        "Revois « Ce que je dois retenir » de l’activité 5 : le cahier des charges est le document que le concepteur doit respecter. Peut-il l’oublier en route ?", "A5"),
      Q("n5_e3", "choix", "Une erreur s’est glissée dans cette phrase : « Seul le client doit se référer au cahier des charges tout au long du projet. » Quel groupe de mots est faux ?",
        "Trouve le groupe de mots faux.", ["Seul le client", "doit se référer au cahier des charges", "tout au long du projet"], "Seul le client",
        "Revois « Ce que je dois retenir » de l’activité 5 : qui doit respecter ce document pendant tout le projet ?", "A5"),
      Q("n5_e4", "choix", "Une erreur s’est glissée dans cette phrase : « Le robinet doit respecter des performances impossibles à mesurer, tout en respectant les normes établies. » Quel groupe de mots est faux ?",
        "Trouve le groupe de mots faux.", ["Le robinet doit respecter", "des performances impossibles à mesurer", "tout en respectant les normes établies"], "des performances impossibles à mesurer",
        "Revois le tableau de l’activité 5 : « ≈ 2 L/min », « 0 à ≈ 15 cm »… ces niveaux se vérifient-ils ?", "A5"),
      Q("n5_e5", "choix", "Une erreur s’est glissée dans cette phrase : « Le FAST du robinet décrit les besoins à satisfaire et les contraintes à respecter. » Quel groupe de mots est faux ?",
        "Trouve le groupe de mots faux.", ["Le FAST du robinet", "décrit les besoins à satisfaire", "et les contraintes à respecter"], "Le FAST du robinet",
        "Revois les activités 5 et 6 : quel document dit ce qu’on exige du robinet, et lequel montre comment il est fait ?", "A5"),
      Q("n5_e6", "choix", "Une erreur s’est glissée dans cette phrase : « Dans le cahier des charges du robinet, débit ≈ 2 L/min est une solution technique. » Quel groupe de mots est faux ?",
        "Trouve le groupe de mots faux.", ["Dans le cahier des charges du robinet", "débit ≈ 2 L/min", "une solution technique"], "une solution technique",
        "Revois le tableau de l’activité 5 : dans quelle colonne trouve-t-on « ≈ 2 L/min » ?", "A5")
    ],
    /* Carte 6 : pieuvre (rappel, A5) */
    n6: [
      Q("n6_a1", "assoc", "Pieuvre du robinet : chaque fonction est-elle une FP ou une FC ?", "Pour chaque fonction, choisis FP ou FC.", FPFC, [FPFC[0], FPFC[1], FPFC[1]],
        IND_PIEUVRE, "A5", ["Permettre à l’utilisateur de se laver les mains avec de l’eau", "Détecter la présence des mains", "Résister à l’environnement humide"]),
      Q("n6_a2", "assoc", "Pieuvre du robinet : chaque fonction est-elle une FP ou une FC ?", "Pour chaque fonction, choisis FP ou FC.", FPFC, [FPFC[1], FPFC[0], FPFC[1]],
        IND_PIEUVRE, "A5", ["Se fixer sur le lavabo", "Permettre à l’utilisateur de se laver les mains avec de l’eau", "Respecter le budget"]),
      Q("n6_c1", "choix", "Dans une pieuvre, une fonction principale (FP) relie combien d’éléments du milieu extérieur ?", "Une FP relie combien d’éléments ?",
        ["Un seul", "Deux", "Aucun"], "Deux", "Revois la pieuvre de l’activité 5 : suis le trait « se laver les mains » ; combien d’éléments touche-t-il ?", "A5"),
      Q("n6_c2", "choix", "Dans une pieuvre, une fonction contrainte (FC) relie le robinet à combien d’éléments du milieu extérieur ?", "Une FC relie le robinet à combien d’éléments ?",
        ["Un seul", "Deux", "Aucun"], "Un seul", "Revois la pieuvre de l’activité 5 : suis le trait « Respecter le budget » ; combien d’éléments touche-t-il ?", "A5"),
      Q("n6_c3", "choix", "Laquelle de ces fonctions est la fonction principale (FP) du robinet ?", "Quelle est la FP du robinet ?",
        ["Permettre à l’utilisateur de se laver les mains avec de l’eau", "Détecter la présence des mains", "Être alimenté en énergie", "Respecter le budget"],
        "Permettre à l’utilisateur de se laver les mains avec de l’eau", "Cherche la raison pour laquelle le robinet a été créé. Revois la pieuvre de l’activité 5.", "A5"),
      Q("n6_c4", "choix", "« Être alimenté en énergie » : FP ou FC ?", "« Être alimenté en énergie » : FP ou FC ?", FPFC, FPFC[1], IND_PIEUVRE, "A5")
    ],
    /* Carte 7 : cahier des charges technique (rappel, A5) */
    n7: [
      Q("n7_a1", "assoc", "Tableau des fonctions du robinet : associe chaque fonction à son critère.", "Pour chaque fonction, choisis son critère.",
        ["Débit", "Distance", "Indice IP"], ["Débit", "Distance", "Indice IP"],
        "Pour chaque fonction, demande-toi ce qu’on mesure pour vérifier qu’elle est bien remplie. Revois le tableau de l’activité 5.", "A5",
        ["Distribuer de l’eau pour se laver les mains", "Détecter la présence des mains", "Résister à l’environnement humide"]),
      Q("n7_a2", "assoc", "Tableau des fonctions du robinet : associe chaque critère à son niveau.", "Pour chaque critère, choisis son niveau.",
        ["≈ 2 L/min", "0 à ≈ 15 cm", "IP65"], ["≈ 2 L/min", "0 à ≈ 15 cm", "IP65"],
        "Regarde les unités : des litres par minute, des centimètres… Revois le tableau de l’activité 5.", "A5", ["Débit", "Distance", "Indice IP"]),
      Q("n7_c1", "choix", "Pour la fonction « Détecter la présence des mains » (critère : distance), quel niveau ?", "Détecter les mains : quel niveau ?",
        ["0 à ≈ 15 cm", "≈ 2 L/min", "IP65"], "0 à ≈ 15 cm", "Revois le tableau de l’activité 5 : une distance se mesure avec quelle unité ?", "A5"),
      Q("n7_c2", "choix", "Quel critère permet de vérifier la fonction « Distribuer de l’eau pour se laver les mains » ?", "Distribuer l’eau : quel critère ?",
        ["Débit", "Distance", "Indice IP"], "Débit", "Revois le tableau de l’activité 5 : que mesure-t-on quand l’eau coule ?", "A5"),
      Q("n7_c3", "choix", "Dans le tableau des fonctions, « IP65 » est…", "« IP65 » est…", COLONNES, "un niveau",
        "Revois le tableau de l’activité 5 : repère la colonne où l’on a écrit « IP65 ».", "A5"),
      Q("n7_c4", "choix", "Dans le tableau des fonctions, « Débit » est…", "« Débit » est…", COLONNES, "un critère",
        "Revois le tableau de l’activité 5 : repère la colonne où l’on a écrit « Débit ».", "A5"),
      Q("n7_c5", "choix", "Dans le tableau des fonctions, par quoi commence l’écriture d’une fonction ?", "Une fonction commence par…",
        ["Par un verbe à l’infinitif", "Par une valeur chiffrée", "Par le nom d’une pièce"], "Par un verbe à l’infinitif",
        "Relis les fonctions de la pieuvre de l’activité 5 et regarde leur premier mot.", "A5")
    ],
    /* Carte 8 : conception de l'objet (FAST du robinet, activité 6) — validée par le professeur */
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
    ],
    /* Carte 9 : chaîne d'information (A7) */
    n9: [
      Q("n9_m1", "menu", "Dans la chaîne d’information du robinet, quel composant réalise « ACQUÉRIR » ?", "Quelle pièce du robinet est à l’étape ACQUÉRIR ?",
        ["Capteur infrarouge", "Carte électronique", "Voyant", "Électrovanne"], "Capteur infrarouge",
        "Revois l’activité 7, étape 1 de l’animation : qui remarque les mains en premier ?", "A7"),
      Q("n9_m2", "menu", "Dans la chaîne d’information du robinet, quel composant réalise « TRAITER » ?", "Quelle pièce du robinet est à l’étape TRAITER ?",
        ["Carte électronique", "Capteur infrarouge", "Voyant", "Micro-batterie"], "Carte électronique",
        "Revois l’activité 7, étape 2 de l’animation : qui reçoit l’information et décide ?", "A7"),
      Q("n9_m3", "menu", "Dans la chaîne d’information du robinet, quel composant réalise « COMMUNIQUER » ?", "Quelle pièce du robinet est à l’étape COMMUNIQUER ?",
        ["Voyant", "Carte électronique", "Capteur infrarouge", "Turbine / générateur"], "Voyant",
        "Revois l’activité 7, étape 3 de l’animation : quel élément s’adresse à l’utilisateur ?", "A7"),
      Q("n9_o1", "ordre", "Remets dans l’ordre les trois étapes de la méthode pour placer les composants d’une chaîne d’information.",
        "Range les 3 étapes de la méthode. La première est déjà placée.",
        ["Identifier le chemin parcouru par l'information dans l'objet", "Repérer la forme de l'information en entrée et en sortie de chaque composant", "Représenter la chaîne d'information du début (signal initial) à la fin (signal final)"],
        ["Identifier le chemin parcouru par l'information dans l'objet", "Repérer la forme de l'information en entrée et en sortie de chaque composant", "Représenter la chaîne d'information du début (signal initial) à la fin (signal final)"],
        "Pense à l’activité 7 : tu as d’abord observé l’animation, puis classé les éléments, et seulement ensuite complété le schéma-bloc.", "A7"),
      Q("n9_o2", "ordre", "Remets dans l’ordre les trois blocs de la chaîne d’information du robinet.", "Range les 3 blocs. Le premier est déjà placé.",
        ["ACQUÉRIR", "TRAITER", "COMMUNIQUER"], ["ACQUÉRIR", "TRAITER", "COMMUNIQUER"],
        "Revois l’activité 7, étapes 1 à 3 de l’animation : suis les cubes bleus de l’information.", "A7"),
      Q("n9_c1", "choix", "Quand le voyant du robinet s’allume, à qui s’adresse-t-il ?", "Le voyant s’allume pour qui ?",
        ["À l’utilisateur", "À la carte électronique", "À l’électrovanne"], "À l’utilisateur",
        "Revois l’activité 7, étape 3 de l’animation.", "A7"),
      Q("n9_c2", "choix", "La carte électronique reçoit l’information et décide d’ouvrir l’eau. Quel est son bloc dans la chaîne d’information ?", "La carte décide : quel bloc ?",
        ["TRAITER", "ACQUÉRIR", "COMMUNIQUER"], "TRAITER", IND_CLASSE, "A7")
    ],
    /* Carte 10 : chaîne d'énergie (A7) */
    n10: [
      Q("n10_m1", "menu", "Dans la chaîne d’énergie du robinet, quel composant réalise « ALIMENTER » ?", "Quelle pièce est à l’étape ALIMENTER ?",
        ["Tuyauterie", "Micro-batterie", "Électrovanne", "Fils électriques"], "Tuyauterie",
        "Revois l’activité 7, étape 4 de l’animation : par où l’énergie entre-t-elle dans le robinet ?", "A7"),
      Q("n10_m2", "menu", "Dans la chaîne d’énergie du robinet, quel composant réalise « DISTRIBUER » ?", "Quelle pièce est à l’étape DISTRIBUER ?",
        ["Électrovanne", "Tuyauterie", "Turbine / générateur", "Voyant"], "Électrovanne",
        "Revois l’activité 7, étape 4 de l’animation : quel élément s’ouvre pour laisser passer l’eau ?", "A7"),
      Q("n10_m3", "menu", "Dans la chaîne d’énergie du robinet, quel composant réalise « CONVERTIR » ?", "Quelle pièce est à l’étape CONVERTIR ?",
        ["Turbine / générateur", "Électrovanne", "Micro-batterie", "Fils électriques"], "Turbine / générateur",
        "Revois l’activité 7, étape 5 de l’animation : où l’énergie de l’eau change-t-elle de forme ?", "A7"),
      Q("n10_m4", "menu", "Dans la chaîne d’énergie du robinet, quel composant réalise « TRANSMETTRE » ?", "Quelle pièce est à l’étape TRANSMETTRE ?",
        ["Fils électriques", "Tuyauterie", "Capteur infrarouge", "Turbine / générateur"], "Fils électriques",
        "Revois l’activité 7, étape 6 de l’animation : par où l’énergie produite est-elle redistribuée ?", "A7"),
      Q("n10_f1", "menu", "Quelle forme d’énergie circule sur la flèche « ALIMENTER → DISTRIBUER », de la tuyauterie à l’électrovanne ?",
        "De la tuyauterie à l’électrovanne : quelle énergie ?", ENERGIES, ENERGIES[0],
        "Revois le schéma-bloc de l’activité 7 : à cet endroit, c’est encore de l’eau sous pression qui circule.", "A7"),
      Q("n10_f2", "menu", "Quelle forme d’énergie sort du bloc « CONVERTIR » (turbine / générateur) ?", "Que produit le générateur ?", ENERGIES, ENERGIES[2],
        "Revois l’activité 7, étape 5 de l’animation : que produit le générateur ?", "A7"),
      Q("n10_c1", "choix", "Un élève a écrit : « ALIMENTER = la micro-batterie ». Qu’en penses-tu ?", "« ALIMENTER = la micro-batterie » : juste ou faux ?",
        ["C’est faux : l’énergie entre avec l’eau sous pression, par la tuyauterie", "C’est juste : la micro-batterie est le bloc ALIMENTER", "C’est faux : ALIMENTER, c’est l’électrovanne"],
        "C’est faux : l’énergie entre avec l’eau sous pression, par la tuyauterie",
        "Revois l’activité 7, question 5a : d’où vient l’énergie du robinet ?", "A7"),
      Q("n10_o1", "ordre", "Remets dans l’ordre les quatre blocs de la chaîne d’énergie du robinet.", "Range les 4 blocs. Le premier est déjà placé.",
        ["ALIMENTER", "DISTRIBUER", "CONVERTIR", "TRANSMETTRE"], ["ALIMENTER", "DISTRIBUER", "CONVERTIR", "TRANSMETTRE"],
        "Revois l’activité 7, étapes 4 à 6 de l’animation : suis l’énergie depuis l’arrivée d’eau jusqu’aux fils.", "A7")
    ],
    /* Carte 11 : le fonctionnement d'un objet (A7) */
    n11: [
      Q("n11_a1", "assoc", "Dans le robinet, qui envoie l’ordre d’ouvrir l’eau, et qui le reçoit ?", "Qui envoie l’ordre ? Qui le reçoit ?",
        ["Carte électronique", "Électrovanne", "Capteur infrarouge", "Micro-batterie"], ["Carte électronique", "Électrovanne"],
        "Revois l’activité 7, étapes 2 et 4 de l’animation : suis les cubes bleus jusqu’au n° 6.", "A7",
        ["Envoie l’ordre d’ouvrir l’eau", "Reçoit l’ordre et laisse passer l’eau"]),
      Q("n11_c1", "choix", "Dans le robinet, qui envoie l’ordre d’ouvrir l’eau ?", "Qui envoie l’ordre ?",
        ["Carte électronique", "Capteur infrarouge", "Voyant", "Électrovanne"], "Carte électronique", "Revois l’activité 7, étape 2 de l’animation.", "A7"),
      Q("n11_c2", "choix", "Dans le robinet, qui reçoit l’ordre et ouvre le passage de l’eau ?", "Qui reçoit l’ordre ?",
        ["Électrovanne", "Tuyauterie", "Turbine / générateur", "Voyant"], "Électrovanne", "Revois l’activité 7, étape 4 de l’animation.", "A7"),
      Q("n11_c3", "choix", "L’ordre d’ouvrir l’eau va…", "L’ordre va…",
        ["de la chaîne d’information vers la chaîne d’énergie", "de la chaîne d’énergie vers la chaîne d’information", "de la micro-batterie vers le voyant"],
        "de la chaîne d’information vers la chaîne d’énergie",
        "Demande-toi à quelle chaîne appartient celui qui décide, puis celui qui agit sur l’eau. Revois l’activité 7, partie 3.", "A7"),
      Q("n11_c4", "choix", "À quelle chaîne appartient la carte électronique ?", "La carte électronique : quelle chaîne ?", CHAINES, CHAINES[0], IND_CLASSE, "A7"),
      Q("n11_c5", "choix", "À quelle chaîne appartient l’électrovanne ?", "L’électrovanne : quelle chaîne ?", CHAINES, CHAINES[1], IND_CLASSE, "A7"),
      Q("n11_c6", "choix", "Quel élément, rechargé par la chaîne d’énergie, alimente la chaîne d’information et l’électrovanne ?", "Quel élément est rechargé puis alimente les autres ?",
        ["Micro-batterie", "Tuyauterie", "Voyant", "Capteur infrarouge"], "Micro-batterie",
        "Revois l’activité 7, étape 6 de l’animation et la question 5b : la boucle de recharge.", "A7")
    ],
    /* Carte 12 : le choix des matériaux (A7 question 6, contraintes de A4) — sans calcul */
    n12: [
      Q("n12_a1", "assoc", "Chaque contrainte du robinet appelle un critère de choix du matériau. Associe-les.", "Pour chaque contrainte, choisis le critère.",
        CRITERES, ["Le prix", "La qualité esthétique", "Le respect de l’environnement"],
        "Revois l’activité 4 : ces trois phrases sont des contraintes du robinet. Cherche le critère qui répond à chacune.", "A4",
        ["Respecter un budget", "Être esthétique", "Limiter l’impact environnemental"]),
      Q("n12_a2", "assoc", "Ce que doit supporter la turbine : associe chaque besoin à un critère de choix du matériau.", "Pour chaque besoin, choisis le critère.",
        CRITERES, ["La résistance aux efforts", "La capacité à être transformé"],
        "Revois l’activité 7, question 6 : ce que subit la turbine. Pense aussi à la façon dont on lui donne sa forme.", "A7",
        ["La turbine tourne vite et reçoit la poussée de l’eau sous pression", "Il faut pouvoir donner à la turbine la forme voulue"]),
      Q("n12_c1", "choix", "La turbine tourne dans l’eau des milliers de fois par an et reçoit la poussée de l’eau sous pression. Quel critère de choix de son matériau compte en premier ?",
        "La turbine est poussée par l’eau. Quel critère compte ?", CRITERES.slice(0, 3).concat(["Le prix"]), "La résistance aux efforts",
        "Revois l’activité 7, question 6 : note ce que la turbine subit à chaque lavage de mains.", "A7"),
      Q("n12_c2", "choix", "Laquelle de ces phrases décrit ce que subit la turbine du robinet ?", "Que subit la turbine ?",
        ["Elle est en permanence dans l’eau (humidité, corrosion, calcaire)", "Elle est touchée par les mains à chaque lavage", "Elle reste au sec, loin de l’eau", "Elle est exposée au soleil toute la journée"],
        "Elle est en permanence dans l’eau (humidité, corrosion, calcaire)",
        "Revois l’activité 7, question 6, et l’étape 5 de l’animation : où se trouve la turbine ?", "A7"),
      Q("n12_c3", "choix", "On préfère un matériau recyclable, à faible énergie grise. Quel critère est-ce ?", "Matériau recyclable : quel critère ?",
        ["Le respect de l’environnement", "La qualité esthétique", "La résistance aux efforts", "Le prix"], "Le respect de l’environnement",
        "Revois l’activité 4 : parmi les contraintes du robinet, une parle de son impact.", "A4"),
      Q("n12_c4", "choix", "Une contrainte du robinet est de respecter un budget. Quel critère de choix du matériau y répond ?", "Respecter un budget : quel critère ?",
        ["Le prix", "La qualité esthétique", "La résistance aux efforts", "Le respect de l’environnement"], "Le prix",
        "Un budget, c’est une somme d’argent à ne pas dépasser. Revois l’activité 4.", "A4")
    ]
  };
  /* Items « contexte » : utiles (facture, voyage de l'eau, indice IP…) mais ils ne font pas
     travailler la notion du texte révélé. Tous les autres sont « cœur » ; chaque défi en
     contient au moins un (voir tirerDefi). */
  var CONTEXTE = ["n1_c2", "n1_o1", "n1_c3", "n1_c4", "n3_c1", "n3_c2", "n3_c3", "n3_c4", "n12_a1", "n12_c3", "n12_c4"];
  Object.keys(BANQUE).forEach(function (nid) {
    BANQUE[nid].forEach(function (it) { it.coeur = CONTEXTE.indexOf(it.id) < 0; });
  });

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
     bonne (choix, menu), 3 options dont toutes les réponses attendues (assoc) ou, pour un
     ordre, tous les éléments avec le premier pré-placé. Les lignes d'une association sont
     mélangées avec leur réponse : la paire reste juste. */
  function preparer(item, adapte, rnd) {
    var it = copie(item);
    if (it.type === "assoc") {
      var attendus = it.bonne.filter(function (x, i) { return it.bonne.indexOf(x) === i; });
      if (adapte && it.options.length > 3) {
        var pieges = melanger(it.options.filter(function (x) { return attendus.indexOf(x) < 0; }), rnd).slice(0, Math.max(0, 3 - attendus.length));
        it.options = melanger(attendus.concat(pieges), rnd);
      } else it.options = melanger(it.options, rnd);
      var rangs = melanger(it.elements.map(function (x, i) { return i; }), rnd);
      it.elements = rangs.map(function (i) { return item.elements[i]; });
      it.bonne = rangs.map(function (i) { return item.bonne[i]; });
    } else if (it.type === "ordre") {
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
     tant que la banque est assez grande.
     Notion avec des items « contexte » : chaque essai prend un item cœur différent (essai n →
     n-ième cœur), complété par les items contexte puis les cœurs restants ; la taille du défi
     est bornée pour que les 3 essais restent disjoints. */
  function tirerDefi(notionId, essai, graine, adapte) {
    var banque = BANQUE[notionId] || [];
    if (!banque.length) return [];
    var rnd = generateur(hachage(graine + "|" + notionId));
    var ordre = melanger(banque, rnd);
    var k = Math.max(2, Math.min(4, Math.floor(banque.length / 3)));
    k = Math.min(k, ordre.length);
    var e = Math.max(1, Math.floor(essai) || 1), items = [], i;
    var coeur = ordre.filter(function (it) { return it.coeur; }), autres = ordre.filter(function (it) { return !it.coeur; });
    if (autres.length && coeur.length) {
      var reste = autres.concat(coeur.slice(3));
      k = Math.max(2, Math.min(k, 1 + Math.floor(reste.length / 3)));
      items.push(coeur[(e - 1) % coeur.length]);
      for (i = 0; i < k - 1; i++) items.push(reste[((e - 1) * (k - 1) + i) % reste.length]);
    } else {
      for (i = 0; i < k; i++) items.push(ordre[((e - 1) * k + i) % ordre.length]);
    }
    var rndEssai = generateur(hachage(graine + "|" + notionId + "|" + e));
    return items.map(function (it) { return preparer(it, !!adapte, rndEssai); });
  }

  /* Association : juste si chaque élément a reçu sa réponse, paire par paire. La réponse est
     un objet { élément: choix } ou un tableau aligné sur les éléments tels qu'affichés. */
  function assocJuste(it, r) {
    if (!r || typeof r !== "object") return false;
    return it.elements.every(function (e, i) {
      return (Array.isArray(r) ? r[i] : r[e]) === it.bonne[i];
    });
  }
  function corriger(items, reponses) {
    reponses = reponses || {};
    var fautes = [], indice = "", renvoi = "";
    items.forEach(function (it) {
      var r = reponses[it.id];
      var bon = it.type === "assoc" ? assocJuste(it, r)
        : it.type === "tableur" ? !!r && it.cases.every(function (k) { return corrigerTableur(k, r[k], r).pts === 1; })
        : Array.isArray(it.bonne) ? memeListe(r, it.bonne) : r === it.bonne;
      if (!bon) { fautes.push(it.id); if (!indice) { indice = it.indice; renvoi = it.renvoi || ""; } }
    });
    return { juste: fautes.length === 0, fautes: fautes, indice: indice, renvoi: renvoi };
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

  /* Reprise depuis le classeur : `a` est-il STRICTEMENT plus avancé que `b` ?
     D'abord le nombre de cartes ouvertes, puis, à égalité, le total des tentatives
     (cartes, rejeux compris, et défis d'entraînement). À égalité complète : non. */
  function avancement(e) {
    var ouvertes = 0, essais = 0, k;
    var cartes = e && e.cartes || {}, mod = e && e.module || {};
    for (k in cartes) if (cartes.hasOwnProperty(k) && cartes[k]) { if (cartes[k].ouverte) ouvertes++; essais += cartes[k].essais || 0; }
    for (k in mod) if (mod.hasOwnProperty(k) && mod[k]) essais += mod[k].essais || 0;
    return [ouvertes, essais];
  }
  function plusAvance(a, b) {
    var x = avancement(a), y = avancement(b);
    return x[0] !== y[0] ? x[0] > y[0] : x[1] > y[1];
  }

  function cleEtat(idEleve) {
    var s = idEleve == null ? "" : String(idEleve).trim();
    return s ? "p11-syn_etat:" + s : null;
  }

  /* ══ Module « Cap sur l'évaluation n°2 » : entraînement facultatif, non noté ══
     Un défi par critère de la grille, sur d'autres systèmes que celui de l'évaluation :
     la trottinette électrique du diaporama de l'activité 7 (P1 à P3) et le boîtier du
     capteur infrarouge du robinet (Matériauthèque : P4, I1 à I3). Après chaque défi, l'élève
     lit « ce qui fait gagner les points » pour ce critère. Les items suivent le format de
     BANQUE ; un item « tableur » liste ses cases (`cases`), corrigées par corrigerTableur. */
  var ENERGIES_M = ["Énergie électrique", "Énergie mécanique", "Énergie hydraulique"];
  var CLASSEMENT = ["Indispensable", "Souhaitable", "Inutile"];
  var C_EAU = "Résister à l’eau et à l’humidité", C_ISOLANT = "Ne pas conduire l’électricité (isolant)",
      C_CHOCS = "Résister aux chocs (4/5 au moins)", C_RIGIDE = "Être rigide (3/5 au moins)",
      C_COUT = "Coûter très peu (€)", C_200 = "Résister à plus de 200 °C",
      C_AIMANT = "Ne pas être attiré par un aimant", C_CONDUIT = "Conduire l’électricité";
  var DEF_EG = "Toute l’énergie nécessaire pour extraire la matière, fabriquer la pièce, la transporter et la traiter en fin de vie (son utilisation n’est pas comptée)";
  /* Valeurs de la Matériauthèque (materiaux.json), affichées dans les défis I1 et I2 */
  var FICHES = {
    titre: "Fiches de la Matériauthèque (notes sur 5 : résistance à l’eau, rigidité, résistance aux chocs)",
    colonnes: ["Matériau", "Électricité", "Eau", "Rigidité", "Chocs", "Coût"],
    lignes: [
      ["ABS", "isolant", "3/5", "3/5", "4/5", "€"],
      ["PE-HD", "isolant", "5/5", "2/5", "4/5", "€"],
      ["POM", "isolant", "4/5", "4/5", "3/5", "€€"],
      ["PLA", "isolant", "2/5", "3/5", "2/5", "€"],
      ["Inox", "conducteur", "5/5", "5/5", "4/5", "€€€"]
    ]
  };
  var FICHES_EG = {
    titre: "Fiches de la Matériauthèque",
    colonnes: ["Matériau", "Masse volumique", "Énergie grise"],
    lignes: [["ABS", "1,04 g/cm³", "95 kJ/g"], ["Inox", "7,9 g/cm³", "60 kJ/g"]]
  };

  /* La feuille du défi I2 : volume fourni (🔒), données saisies, calculs par formule.
     `ref` : les deux cases de la formule attendue ; `op` : * (ordre libre) ou / (ordre imposé). */
  var TABLEUR = {
    colonnes: ["A", "B", "C"],
    entetes: { A: "", B: "Boîtier en ABS", C: "Boîtier en inox" },
    lignes: [
      { n: 2, libelle: "Volume de matière (cm³)", B: "B2", C: "C2" },
      { n: 3, libelle: "Masse volumique (g/cm³)", B: "B3", C: "C3" },
      { n: 4, libelle: "Masse du boîtier (g)", B: "B4", C: "C4" },
      { n: 5, libelle: "Énergie grise du matériau (kJ/g)", B: "B5", C: "C5" },
      { n: 6, libelle: "Énergie grise du boîtier (kJ)", B: "B6", C: "C6" },
      { n: 7, libelle: "L’inox demande … fois plus d’énergie grise que l’ABS", B: null, C: "C7" }
    ],
    cases: {
      B2: { fourni: true, valeur: 24 }, C2: { fourni: true, valeur: 24 },
      B3: { donnee: true, valeur: 1.04 }, C3: { donnee: true, valeur: 7.9 },
      B5: { donnee: true, valeur: 95 }, C5: { donnee: true, valeur: 60 },
      B4: { ref: ["B2", "B3"], op: "*" }, C4: { ref: ["C2", "C3"], op: "*" },
      B6: { ref: ["B4", "B5"], op: "*" }, C6: { ref: ["C4", "C5"], op: "*" },
      C7: { ref: ["C6", "B6"], op: "/" }
    }
  };
  (function calculer() {
    var c = TABLEUR.cases;
    ["B4", "C4", "B6", "C6", "C7"].forEach(function (k) {
      var a = c[c[k].ref[0]].valeur, b = c[c[k].ref[1]].valeur;
      c[k].valeur = c[k].op === "*" ? a * b : a / b;
    });
  })();
  var CASES_A_REMPLIR = ["B3", "C3", "B4", "C4", "B5", "C5", "B6", "C6", "C7"];   /* ordre de lecture */

  var MODULE = [
    { id: "m_p1", critere: "P1 · Compléter un diagramme FAST", titre: "Le FAST de la trottinette électrique",
      support: "La trottinette électrique du diaporama d’introduction de l’activité 7",
      situation: "« J’appuie sur la gâchette… elle avance ! » Quelle pièce de la trottinette réalise chaque fonction technique ?",
      items: [
        Q("m_p1_m1", "menu", "FAST de la trottinette électrique : quelle solution technique réalise la fonction « Recevoir l’ordre du conducteur » ?",
          "Quelle pièce reçoit l’ordre du doigt ?", ["Gâchette", "Roue", "Batterie", "Moteur électrique"], "Gâchette",
          "Relis le diaporama de l’activité 7 : sur quoi le doigt appuie-t-il pour que la trottinette avance ?", "A7"),
        Q("m_p1_c1", "choix", "Pour la fonction « Traiter l’information et commander le moteur », quelle réponse rapporte tous les points ?",
          "Quelle réponse est complète ?", ["Carte électronique", "Carte", "Électronique"], "Carte électronique",
          "Un seul mot ne suffit pas toujours : il faut le nom complet de la pièce. Revois le FAST du robinet de l’activité 6.", "A6"),
        Q("m_p1_m2", "menu", "FAST de la trottinette électrique : quelle solution technique réalise la fonction « Stocker l’énergie électrique » ?",
          "Quelle pièce garde l’énergie ?", ["Batterie", "Moteur électrique", "Gâchette", "Roue"], "Batterie",
          "Cherche la pièce qu’on recharge quand la trottinette ne roule plus. Revois la chaîne d’énergie de l’activité 7.", "A7"),
        Q("m_p1_m3", "menu", "FAST de la trottinette électrique : quelle solution technique réalise la fonction « Faire tourner la roue » ?",
          "Quelle pièce fait tourner la roue ?", ["Moteur électrique", "Batterie", "Gâchette", "Carte électronique"], "Moteur électrique",
          "Cherche la pièce qui change l’énergie électrique en mouvement. Revois la chaîne d’énergie de l’activité 7.", "A7")
      ],
      ceQuiFaitGagner: [
        "Une solution technique par fonction technique : la pièce qui réalise vraiment cette fonction.",
        "Le nom complet de la pièce : « carte » seule ou « capteur » seul ne rapporte que la moitié des points. On écrit « carte électronique », « capteur infrarouge ».",
        "Quand il faut deux pièces pour une fonction, on nomme les deux : pour le robinet, « turbine » seule est incomplète, on écrit « turbine + générateur »."
      ] },

    { id: "m_p2", critere: "P2 · Compléter les deux chaînes et nommer les énergies", titre: "Les deux chemins de la trottinette",
      support: "La trottinette électrique du diaporama d’introduction de l’activité 7",
      situation: "« L’ordre = INFORMATION, la force = ÉNERGIE. » Trace les deux chemins, de la gâchette jusqu’à la roue.",
      items: [
        Q("m_p2_a1", "assoc", "Chaîne d’information de la trottinette : associe chaque bloc à sa pièce.", "Pour chaque bloc, choisis la pièce.",
          ["Gâchette", "Carte électronique", "Batterie", "Roue"], ["Gâchette", "Carte électronique"],
          "Suis le chemin de l’ordre : qui le reçoit du doigt, puis qui décide ? Revois la chaîne d’information de l’activité 7.", "A7",
          ["ACQUÉRIR", "TRAITER"]),
        Q("m_p2_a2", "assoc", "Chaîne d’énergie de la trottinette : associe chaque bloc à sa pièce.", "Pour chaque bloc, choisis la pièce.",
          ["Batterie", "Moteur électrique", "Gâchette", "Roue"], ["Batterie", "Moteur électrique"],
          "Suis le chemin de la force : d’où part l’énergie, et où change-t-elle de forme ? Revois la chaîne d’énergie de l’activité 7.", "A7",
          ["ALIMENTER", "CONVERTIR"]),
        Q("m_p2_f1", "menu", "Trottinette : quelle forme d’énergie circule « de la batterie au moteur » ?", "De la batterie au moteur : quelle énergie ?",
          ENERGIES_M, "Énergie électrique",
          "Une batterie se recharge sur une prise : quelle énergie garde-t-elle ? Revois les formes d’énergie de l’activité 7.", "A7"),
        Q("m_p2_a3", "assoc", "À la sortie du bloc CONVERTIR, quelle forme d’énergie ? Compare la trottinette et le robinet.",
          "Pour chaque objet, quelle énergie sort de CONVERTIR ?", ENERGIES_M, ["Énergie mécanique", "Énergie électrique"],
          "Demande-toi ce que produit chaque bloc CONVERTIR : un mouvement, ou de l’électricité ? Revois l’activité 7, étape 5 de l’animation.", "A7",
          ["Trottinette : moteur électrique", "Robinet : turbine + générateur"])
      ],
      ceQuiFaitGagner: [
        "Chaque composant à sa place : chaque bloc juste rapporte des points, dans la chaîne d’information comme dans la chaîne d’énergie.",
        "Chaque flèche porte la forme d’énergie qui y circule vraiment. Dans le robinet : hydraulique avant la turbine (l’eau sous pression), électrique après.",
        "« Mécanique » à la sortie du bloc CONVERTIR du robinet ne rapporte rien : la turbine et le générateur forment un seul bloc, l’énergie mécanique reste à l’intérieur.",
        "Pour expliquer d’où vient l’énergie du robinet, chaque idée compte : l’eau sous pression fait tourner la turbine ; le générateur produit l’électricité ; la micro-batterie la stocke et alimente les composants."
      ] },

    { id: "m_p3", critere: "P3 · La chaîne d’énergie d’un objet qui se déplace", titre: "Trottinette ou robinet : d’où vient l’énergie ?",
      support: "La trottinette électrique (diaporama de l’activité 7), comparée au robinet automatique",
      situation: "« Qui donne la force ? » La trottinette roule dans la rue, le robinet reste fixé au lavabo.",
      items: [
        Q("m_p3_o1", "ordre", "Remets dans l’ordre les quatre blocs de la chaîne d’énergie de la trottinette, de la batterie jusqu’à la roue.",
          "Range les 4 blocs. Le premier est déjà placé.", ["ALIMENTER", "DISTRIBUER", "CONVERTIR", "TRANSMETTRE"], ["ALIMENTER", "DISTRIBUER", "CONVERTIR", "TRANSMETTRE"],
          "Le premier bloc fournit l’énergie, le dernier l’amène jusqu’à la roue. Revois la méthode de la chaîne d’énergie dans l’activité 7.", "A7"),
        Q("m_p3_a1", "assoc", "Quel composant réalise ALIMENTER dans chaque objet ?", "Pour chaque objet, qui réalise ALIMENTER ?",
          ["Batterie", "Tuyauterie (eau du réseau)", "Micro-batterie", "Prise électrique"], ["Batterie", "Tuyauterie (eau du réseau)"],
          "Pour chaque objet, cherche par où l’énergie entre. Attention : la micro-batterie du robinet garde l’énergie produite plus loin. Revois l’activité 7, question 5.", "A7",
          ["La trottinette électrique", "Le robinet automatique"]),
        Q("m_p3_c1", "choix", "Pourquoi la trottinette a-t-elle besoin d’une batterie, alors que le robinet n’en a pas besoin pour ALIMENTER ?",
          "Pourquoi la trottinette a-t-elle une batterie ?",
          ["Elle se déplace : elle emporte son énergie, stockée dans sa batterie", "Une batterie donne plus de force que l’eau du réseau",
            "La batterie sert à traiter l’ordre de la gâchette", "Le robinet n’a pas besoin d’énergie pour fonctionner"],
          "Elle se déplace : elle emporte son énergie, stockée dans sa batterie",
          "Pourrais-tu rouler en restant branché à une prise ou à un tuyau ? Revois l’activité 7.", "A7")
      ],
      ceQuiFaitGagner: [
        "Chaque composant dans le bon bloc : ALIMENTER, DISTRIBUER, CONVERTIR, TRANSMETTRE.",
        "L’explication rapporte des points avec deux idées : l’objet qui se déplace ne peut pas rester relié au réseau, il emporte son énergie stockée dans sa batterie ; l’objet fixe reçoit la sienne du réseau (le robinet : l’eau sous pression, par la tuyauterie).",
        "Piège fréquent : la micro-batterie du robinet n’est pas le bloc ALIMENTER. Elle stocke l’énergie produite par le générateur."
      ] },

    { id: "m_p4", critere: "P4 · Des exigences aux critères du matériau", titre: "Le boîtier du capteur infrarouge : ce qu’il subit",
      support: "Le boîtier du capteur infrarouge du robinet (Matériauthèque)",
      situation: "« Sous le bec du robinet, un petit boîtier protège le capteur infrarouge qui détecte les mains, et sa carte électronique. Quel matériau choisir pour ce boîtier ? » Fiche du vendeur : boîtier en plastique, 60 × 34 × 49 mm, indice IPX6.",
      items: [
        Q("m_p4_a1", "assoc", "Chaque ligne d’exigence impose un critère au matériau du boîtier. Associe-les.", "Pour chaque ligne, choisis le critère.",
          [C_EAU, C_ISOLANT, C_CONDUIT, C_200], [C_EAU, C_ISOLANT],
          "Pour chaque ligne, demande-toi ce qui abîmerait le boîtier ou la carte. Une carte électronique ne doit pas être mise en court-circuit. Revois la Matériauthèque (activité 8).", "A8",
          ["Il reçoit des éclaboussures d’eau.", "Il contient une carte électronique."]),
        Q("m_p4_a2", "assoc", "Chaque ligne d’exigence impose un critère au matériau du boîtier. Associe-les.", "Pour chaque ligne, choisis le critère.",
          [C_CHOCS, C_RIGIDE, C_AIMANT, C_200], [C_CHOCS, C_RIGIDE],
          "Pour chaque ligne, cherche ce qui arriverait au boîtier : se fendre, ou se déformer ? Revois la Matériauthèque (activité 8).", "A8",
          ["Il peut recevoir des petits coups (bagues, verres, brosses).", "Il doit garder sa forme autour du capteur."]),
        Q("m_p4_c1", "choix", "Une seule de ces phrases ne décrit pas le boîtier : elle n’impose aucun critère. Laquelle ?", "Quelle phrase est fausse pour le boîtier ?",
          ["Il baigne en permanence dans l’eau.", "Il reçoit des éclaboussures d’eau.", "Il peut recevoir des petits coups (bagues, verres, brosses).", "Il contient une carte électronique."],
          "Il baigne en permanence dans l’eau.",
          "Relis la présentation : où le boîtier est-il placé, et que subit-il vraiment ? Revois la Matériauthèque (activité 8).", "A8")
      ],
      ceQuiFaitGagner: [
        "Chaque ligne d’exigence avec le bon critère : pars de ce que subit la pièce, puis cherche le critère qui y répond.",
        "Méfie-toi des mots qui attirent : « électronique » n’appelle pas « conduire l’électricité », c’est l’inverse ; un boîtier qui conduit le courant mettrait la carte en court-circuit.",
        "Une proposition qui ne répond à aucune ligne (200 °C, aimant) est un piège : laisse-la de côté.",
        "Pour expliquer un critère, appuie-toi sur la ligne d’exigence qui l’impose, avec ses chiffres quand elle en donne."
      ] },

    { id: "m_i1", critere: "I1 · Choisir un matériau", titre: "Quel matériau pour le boîtier ?",
      support: "Le boîtier du capteur infrarouge (Matériauthèque, 10 000 boîtiers)",
      situation: "Le boîtier est fabriqué à 10 000 exemplaires. Lis les fiches, puis choisis son matériau comme dans la Matériauthèque.",
      donnees: FICHES,
      items: [
        Q("m_i1_a1", "assoc", "Pour le boîtier, chaque critère est-il indispensable, souhaitable ou inutile ?", "Pour chaque critère, choisis : indispensable, souhaitable ou inutile.",
          CLASSEMENT, ["Indispensable", "Indispensable", "Souhaitable", "Souhaitable", "Inutile"],
          "Indispensable : sans lui, le boîtier ne fait plus son travail. Souhaitable : il aide à départager. Inutile : le boîtier ne le subit pas. Revois l’activité 8.", "A8",
          [C_ISOLANT, C_EAU, C_CHOCS, C_COUT, C_200]),
        Q("m_i1_c1", "choix", "D’après les fiches, quel matériau choisis-tu pour le boîtier ?", "Quel matériau choisis-tu ?",
          ["ABS", "PE-HD", "POM", "PLA", "Inox"], "ABS",
          "Élimine d’abord avec les critères indispensables, puis départage avec les souhaitables. Revois « Ce que je dois retenir » de l’activité 8.", "A8"),
        Q("m_i1_a2", "assoc", "Deux matériaux sont éliminés : associe chacun à sa raison.", "Pour chaque matériau, choisis pourquoi il est éliminé.",
          ["Il conduit l’électricité.", "Il s’abîme dans l’eau (résistance à l’eau 2/5).", "Il est trop lourd.", "Il ne supporte pas 200 °C."],
          ["Il conduit l’électricité.", "Il s’abîme dans l’eau (résistance à l’eau 2/5)."],
          "Pour chaque matériau, cherche dans les fiches le critère indispensable qu’il ne respecte pas. Revois l’activité 8.", "A8",
          ["Inox", "PLA"]),
        Q("m_i1_c2", "choix", "Le PE-HD respecte lui aussi les critères indispensables. Pourquoi l’ABS passe-t-il devant ?", "Pourquoi l’ABS plutôt que le PE-HD ?",
          ["Le PE-HD est moins rigide (2/5) : un critère souhaitable départage", "Le PE-HD conduit l’électricité", "Le PE-HD coûte plus cher", "Le PE-HD s’abîme dans l’eau"],
          "Le PE-HD est moins rigide (2/5) : un critère souhaitable départage",
          "Compare les deux lignes des fiches, colonne par colonne. Revois l’activité 8.", "A8"),
        Q("m_i1_c3", "choix", "Le boîtier est fabriqué à 10 000 exemplaires. Quel procédé choisis-tu pour l’ABS ?", "10 000 boîtiers : quel procédé ?",
          ["Moulage par injection", "Impression 3D par dépôt de fil", "Thermoformage"], "Moulage par injection",
          "Regarde la taille de la série : un exemplaire d’essai, ou une grande série ? Revois l’étape « Je choisis le procédé » de la Matériauthèque (activité 8).", "A8"),
        Q("m_i1_c4", "choix", "Quelle phrase de justification rapporte tous les points ?", "Quelle phrase rapporte tous les points ?",
          ["J’ai choisi l’ABS parce qu’il est isolant, qu’il résiste à l’eau et aux chocs, et qu’il coûte très peu.",
            "J’ai choisi l’ABS parce qu’il résiste à l’eau.", "J’ai choisi l’ABS parce que c’est le meilleur matériau.", "J’ai choisi l’ABS parce qu’il est en plastique."],
          "J’ai choisi l’ABS parce qu’il est isolant, qu’il résiste à l’eau et aux chocs, et qu’il coûte très peu.",
          "Compte les arguments de chaque phrase : combien de critères du boîtier cite-t-elle ? Revois l’activité 8.", "A8")
      ],
      ceQuiFaitGagner: [
        "Classer chaque critère : indispensable (sans lui, la pièce ne fait plus son travail), souhaitable (il départage), inutile (la pièce ne le subit pas : c’est un piège).",
        "« Les critères indispensables éliminent, les critères souhaitables départagent. » (activité 8)",
        "Le choix : un matériau qui respecte tous les critères indispensables et se place le mieux sur les souhaitables.",
        "Chaque élimination compte avec sa raison : le matériau, et le critère qu’il ne respecte pas, chiffre à l’appui.",
        "« Un matériau ne va jamais sans son procédé : il faut pouvoir obtenir la forme, et en assez grand nombre. » (activité 8) Le procédé dépend du nombre de pièces à fabriquer.",
        "La phrase de justification : au moins deux arguments (deux critères) pour tous les points ; un seul argument n’en rapporte que la moitié."
      ] },

    { id: "m_i2", critere: "I2 · Calculer avec un tableur", titre: "L’énergie grise du boîtier, au tableur",
      support: "Le boîtier du capteur infrarouge : 24 cm³ de matière (paroi de 2 mm)",
      situation: "La fiche du vendeur cite aussi l’acier inoxydable. Compare l’énergie grise d’un boîtier en ABS et d’un boîtier en inox. Le volume de matière, 24 cm³, est déjà dans la feuille.",
      donnees: FICHES_EG,
      items: [
        { id: "m_i2_t", type: "tableur", cases: CASES_A_REMPLIR.slice(),
          consigne: "Complète la feuille : saisis les données des fiches (lignes 3 et 5), puis écris une formule dans chaque case de calcul (lignes 4, 6 et 7).",
          consigneSimple: "Écris les nombres des fiches dans les lignes 3 et 5. Écris une formule dans les lignes 4, 6 et 7.",
          indice: "La masse, c’est le volume × la masse volumique ; l’énergie grise du boîtier, c’est sa masse × l’énergie grise du matériau. Revois le mini-tableur de l’activité 8.",
          renvoi: "A8" },
        Q("m_i2_c1", "choix", "D’après ta feuille, combien de fois plus d’énergie grise le boîtier en inox demande-t-il ?", "L’inox demande combien de fois plus ?",
          ["Environ 5 fois plus", "Environ 8 fois plus", "Environ 2 fois moins"], "Environ 5 fois plus",
          "Lis la case C7 de ta feuille et arrondis-la à l’unité. Revois le mini-tableur de l’activité 8.", "A8")
      ],
      ceQuiFaitGagner: [
        "Les données : la virgule décimale. « 1,04 » est un nombre ; « 1.04 » n’en est pas un pour le tableur, la case ne rapporte rien.",
        "Les calculs : une formule qui commence par « = » et utilise les noms des cases (=B2*B3) rapporte tous les points ; =B3*B2 ou =PRODUIT(B2;B3) aussi.",
        "Des nombres recopiés dans la formule (=24*1,04) ne rapportent que la moitié : si une donnée change, le résultat reste faux.",
        "Un résultat tapé à la main, ou une formule sans « = », ne rapporte rien : le tableur ne calcule pas.",
        "Recopier une colonne : la formule de la colonne B devient celle de la colonne C (=B2*B3 devient =C2*C3).",
        "« Combien de fois plus » se calcule par une division, avec les noms des cases : la plus grande valeur divisée par la plus petite. La phrase « environ … fois plus » arrondit ce résultat."
      ] },

    { id: "m_i3", critere: "I3 · Énergie grise et cycle de vie", titre: "L’énergie grise du boîtier",
      support: "Le boîtier du capteur infrarouge (ABS et inox, Matériauthèque)",
      situation: "Le boîtier ne consomme presque rien quand il sert. Pourtant, il a déjà coûté de l’énergie avant d’arriver sous le robinet.",
      items: [
        Q("m_i3_c1", "choix", "Quelle est la bonne définition de l’énergie grise du boîtier ?", "Qu’est-ce que l’énergie grise ?",
          [DEF_EG, "L’énergie électrique que consomme le capteur pendant qu’il fonctionne", "L’énergie de l’eau qui fait tourner la turbine",
            "L’énergie qu’il faut pour recycler le boîtier, et elle seule"], DEF_EG,
          "Pense à toute la vie du boîtier, avant et après le moment où il sert. Revois « Ce que je dois retenir » de l’activité 8.", "A8"),
        Q("m_i3_a1", "assoc", "Pour l’énergie grise du boîtier, chaque étape est-elle comptée ?", "Pour chaque étape, choisis : comptée ou pas comptée.",
          ["Comptée", "Pas comptée"], ["Comptée", "Comptée", "Comptée", "Pas comptée", "Comptée"],
          "Relis la définition de l’énergie grise : une étape de la vie du boîtier est mise à part. Revois l’activité 8.", "A8",
          ["Extraire la matière", "Fabriquer le boîtier", "Transporter le boîtier", "Utiliser le robinet pendant des années", "Traiter le boîtier en fin de vie"]),
        Q("m_i3_c2", "choix", "Un camarade dit : « L’ABS se recycle, donc l’énergie grise du boîtier n’a plus d’importance. » Qu’en penses-tu ?",
          "« Il se recycle, donc ça ne compte plus » : juste ou faux ?",
          ["C’est faux : un matériau recyclable n’économise de l’énergie que s’il est vraiment recyclé", "C’est juste : recyclable veut dire qu’il sera recyclé",
            "C’est juste : l’énergie grise ne compte que la fin de vie"],
          "C’est faux : un matériau recyclable n’économise de l’énergie que s’il est vraiment recyclé",
          "Un boîtier jeté avec les ordures ménagères est-il recyclé ? Revois « Ce que je dois retenir » de l’activité 8.", "A8"),
        Q("m_i3_c3", "choix", "Par gramme, l’inox demande moins d’énergie grise que l’ABS (60 kJ/g contre 95 kJ/g). Pourquoi le boîtier en inox en demande-t-il pourtant plus ?",
          "Pourquoi le boîtier en inox demande-t-il plus d’énergie ?",
          ["Il est bien plus lourd : on compare pour la pièce, énergie grise × masse", "L’inox ne se recycle pas", "On compte aussi l’énergie de son utilisation", "L’inox conduit l’électricité"],
          "Il est bien plus lourd : on compare pour la pièce, énergie grise × masse",
          "Revois ta feuille de calcul : quelle ligne change le plus d’un boîtier à l’autre ? Revois l’activité 8.", "A8")
      ],
      ceQuiFaitGagner: [
        "La définition complète : « Énergie grise : toute l’énergie nécessaire pour extraire la matière, fabriquer la pièce, la transporter et la traiter en fin de vie (son utilisation n’est pas comptée). » (activité 8)",
        "Les étapes : chaque étape bien traitée rapporte, cochée si elle est comptée, laissée vide si c’est l’utilisation. Tout cocher ne marche pas : l’utilisation est le piège.",
        "« Recyclable ≠ recyclé : un matériau recyclable n’économise de l’énergie que s’il est vraiment recyclé (l’aluminium recyclé demande environ 10 fois moins d’énergie que l’aluminium neuf). » (activité 8)",
        "« On la compare pour la pièce : énergie grise du matériau × masse de la pièce. » (activité 8)"
      ] }
  ];
  MODULE.forEach(function (m) { m.items.forEach(function (it) { it.coeur = true; }); });

  /* Le module s'ouvre quand les 13 cartes sont ouvertes (même condition que la carte mémoire). */
  function moduleOuvert(etat) {
    return NOTIONS.every(function (n) { return etat.cartes[n.id] && etat.cartes[n.id].ouverte; });
  }
  /* Tous les items du défi, propositions mélangées (et réduites à 3 en mode adapté). */
  function tirerModule(id, essai, graine, adapte) {
    var m = MODULE.filter(function (x) { return x.id === id; })[0];
    if (!m) return [];
    var rnd = generateur(hachage(graine + "|" + id + "|" + (Math.floor(essai) || 1)));
    return m.items.map(function (it) { return it.type === "tableur" ? copie(it) : preparer(it, !!adapte, rnd); });
  }
  /* Une tentative du défi : essais cumulés, réussite gardée, résultat de la dernière tentative. */
  function appliquerModule(etat, id, juste) {
    var e = copie(etat), m = e.module[id] || { essais: 0, reussi: false, dernier: false };
    m.essais += 1; m.reussi = m.reussi || !!juste; m.dernier = !!juste;
    e.module[id] = m;
    return e;
  }
  function bilanModule(etat) {
    var ids = MODULE.map(function (m) { return m.id; }), mod = etat.module || {};
    return {
      reussis: ids.filter(function (id) { return mod[id] && mod[id].reussi; }),
      tentes: ids.filter(function (id) { return mod[id] && mod[id].essais > 0; }),
      total: ids.length
    };
  }

  /* ── Correction d'une case du tableur ──
     Donnée : la valeur de la fiche, virgule décimale (le point est refusé).
     Calcul : formule à références = 1 ; nombres recopiés (même en partie) = 0,5 ;
     résultat tapé, formule sans « = » ou mauvaises cases = 0. `feuille` (facultatif) : les
     saisies de l'élève, pour accepter des nombres recopiés de sa propre feuille. */
  function nombreFr(s) {
    return /^-?\d+(,\d+)?$/.test(s) ? parseFloat(s.replace(",", ".")) : NaN;
  }
  function proche(a, b) { return Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b)); }
  function corrigerTableur(cellule, saisie, feuille) {
    var c = TABLEUR.cases[cellule];
    if (!c || c.fourni) return { pts: 0, raison: "case inconnue ou déjà remplie" };
    var s = String(saisie == null ? "" : saisie).replace(/\s+/g, "");
    if (!s) return { pts: 0, raison: "case vide" };
    if (c.donnee) {
      if (/^-?\d+\.\d+$/.test(s)) return { pts: 0, raison: "virgule décimale : le tableur attend « " + String(c.valeur).replace(".", ",") + " », pas un point" };
      var v = nombreFr(s.replace(/^=/, ""));
      if (isNaN(v)) return { pts: 0, raison: "ce n’est pas un nombre" };
      return proche(v, c.valeur) ? { pts: 1, raison: "donnée juste" } : { pts: 0, raison: "ce n’est pas la valeur de la fiche" };
    }
    if (s.charAt(0) !== "=") {
      if (!isNaN(nombreFr(s)) || /^-?\d+\.\d+$/.test(s)) return { pts: 0, raison: "résultat tapé à la main : le tableur ne calcule rien" };
      return { pts: 0, raison: "il manque le « = » au début : sans lui, le tableur n’y voit que du texte" };
    }
    var corps = s.slice(1).toUpperCase(), a, b, op;
    while (/^\(.*\)$/.test(corps)) corps = corps.slice(1, -1);
    var p = /^PRODUIT\(([^;]+);([^;]+)\)$/.exec(corps);
    if (p) { a = p[1]; b = p[2]; op = "*"; }
    else {
      var o = /^([^*/]+)([*/])([^*/]+)$/.exec(corps);
      if (!o) {
        if (!isNaN(nombreFr(corps))) return { pts: 0, raison: "résultat tapé après le « = » : le tableur ne calcule rien" };
        if (/[X×]/.test(corps)) return { pts: 0, raison: "la multiplication s’écrit avec * dans un tableur" };
        return { pts: 0, raison: "formule non reconnue" };
      }
      a = o[1]; op = o[2]; b = o[3];
    }
    if (op !== c.op) return { pts: 0, raison: op === "*" ? "ici, il faut une division (/)" : "ici, il faut une multiplication (*)" };
    var refs = [a, b], att = c.ref;
    var estRef = function (x) { return /^[A-Z]\d+$/.test(x); };
    var memeOrdre = refs[0] === att[0] && refs[1] === att[1], inverse = refs[0] === att[1] && refs[1] === att[0];
    if (memeOrdre || (op === "*" && inverse)) return { pts: 1, raison: "formule avec les noms des cases" };
    if (op === "/" && inverse) return { pts: 0, raison: "rapport inversé : la plus grande valeur se divise par la plus petite" };
    /* nombres recopiés : chaque nombre doit valoir la case attendue (fiche ou feuille de l'élève) */
    function vaut(x, ref) {
      if (estRef(x)) return x === ref;
      if (/^\d+\.\d+$/.test(x)) return false;
      var n = nombreFr(x);
      if (isNaN(n)) return false;
      var lu = feuille && feuille[ref] != null ? nombreFr(String(feuille[ref]).replace(/\s+/g, "")) : NaN;
      return proche(n, TABLEUR.cases[ref].valeur) || (!isNaN(lu) && proche(n, lu));
    }
    var avecNombre = !estRef(refs[0]) || !estRef(refs[1]);
    var okNombres = (vaut(refs[0], att[0]) && vaut(refs[1], att[1])) || (op === "*" && vaut(refs[0], att[1]) && vaut(refs[1], att[0]));
    if (avecNombre && okNombres) return { pts: 0.5, raison: "nombres recopiés : le calcul est juste, mais il ne suit plus si une donnée change" };
    if (/\d\.\d/.test(corps)) return { pts: 0, raison: "virgule décimale : un nombre s’écrit avec une virgule dans le tableur" };
    return { pts: 0, raison: "ce ne sont pas les bonnes cases" };
  }

  var API = {
    MODULE: MODULE, TABLEUR: TABLEUR, moduleOuvert: moduleOuvert, tirerModule: tirerModule,
    appliquerModule: appliquerModule, bilanModule: bilanModule, corrigerTableur: corrigerTableur,
    NOTIONS: NOTIONS, BANQUE: BANQUE,
    tirerDefi: tirerDefi, corriger: corriger, appliquer: appliquer, essaiSuivant: essaiSuivant,
    etatVide: etatVide, versFields: versFields, depuisFields: depuisFields,
    memoire: memoire, cleEtat: cleEtat, plusAvance: plusAvance
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else racine.P11SYN = API;
})(typeof window !== "undefined" ? window : this);
