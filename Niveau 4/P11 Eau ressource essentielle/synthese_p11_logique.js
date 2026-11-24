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
      var bon = it.type === "assoc" ? assocJuste(it, r) : Array.isArray(it.bonne) ? memeListe(r, it.bonne) : r === it.bonne;
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
