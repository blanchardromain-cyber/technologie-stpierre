/**
 * QUIZ DE RENTRÉE 4G — création automatique du Google Form.
 * Cockpit PP / Prof Principal 4e — voir suivi-eleves/QUIZ-RENTREE.md
 *
 * MODE D'EMPLOI (une seule fois, ~2 minutes)
 *   1. script.google.com > Nouveau projet > nomme-le « Quiz rentrée 4G »
 *   2. Colle TOUT ce fichier dans Code.gs (remplace le contenu existant)
 *   3. Menu déroulant des fonctions > choisis creerQuiz > Exécuter
 *      (première fois : Google demande l'autorisation — Avancé > Autoriser)
 *   4. Le journal d'exécution affiche les 3 liens à recopier dans
 *      donnees/config-portail.js  (quizForm / quizReponses / quizEdition)
 *
 * Ce script crée LE FORMULAIRE + LE CLASSEUR DE RÉPONSES. La mise en page du
 * classeur est faite par le second script (2-Exploitation.gs), à coller dans
 * le classeur ainsi créé.
 *
 * RGPD : aucune coordonnée n'est demandée (adresse, téléphone, e-mail parents
 * restent dans EcoleDirecte). Le classeur reste privé.
 */

// ─────────────────────────────────────────────────────────────────────────────
// PARAMÈTRES
// ─────────────────────────────────────────────────────────────────────────────

var TITRE_FORM = "4G — Faisons connaissance (rentrée 2026)";
var NOM_CLASSEUR = "4G — Quiz de rentrée (réponses + fiches)";
var NOM_ONGLET_REPONSES = "Reponses"; // sans accent : plus simple dans les formules

/**
 * Les élèves de 4G n'ont PAS de compte Google du collège (juillet 2026).
 * Conséquence : ni « collecter les e-mails », ni « limiter à 1 réponse », ni
 * « connexion obligatoire » — ces trois réglages exigent un compte, et les
 * laisser actifs empêcherait purement et simplement l'envoi du formulaire.
 * L'identification repose donc uniquement sur la liste déroulante des noms.
 * Passe à true le jour où le collège ouvre des comptes élèves.
 */
var ELEVES_ONT_UN_COMPTE_GOOGLE = false;

var DESCRIPTION_FORM =
  "Ce questionnaire m'aide à mieux te connaître pour t'accompagner cette année.\n" +
  "Il n'y a pas de bonne ou de mauvaise réponse, et il ne sera pas noté.\n" +
  "Seul M. Blanchard le lit. Compte environ 10 minutes.";

/** Les 26 élèves, tels qu'ils apparaîtront dans la liste déroulante.
 *  Source : donnees/eleves-4G.js — à mettre à jour en cas d'arrivée/départ. */
var ELEVES = [
  "Léni ALLEMAND", "Maël BILLAUD", "Louis BLOCH", "Noa BOISSEAU",
  "Juliette BOUGARD", "Amandine CAPRETTI", "Anaëlle DAHERON", "Lucas FORT",
  "Louis GABORIEAU", "Lila GATELIER", "Coraline GERBAUD", "Clara GERMAIN",
  "Aaron GNAFOUA BOUANCHEAU", "Adèle GUERIN",
  "Mahydine JOETS", "Albin LAMOTHE", "Emy LEFEBVRE CHENU", "Léa MANDIN",
  "Lola MERCIER", "Chloé PANCHOUT", "Maëlya PASQUIER LAMBERT",
  "Ninon PICHEREAU", "Zora PIFFETEAU", "Uriel SELLIER", "Lucien TIGER"
];

var MATIERES = [
  "Français", "Mathématiques", "Histoire-Géo-EMC", "Anglais", "LV2 (Espagnol / Allemand)",
  "SVT", "Physique-Chimie", "Technologie", "Arts plastiques", "Éducation musicale", "EPS"
];

var ECHELLES = [
  "Je sais m'organiser dans mon travail",
  "J'arrive à me concentrer en classe",
  "Je comprends ce qu'on attend de moi",
  "J'ose poser une question quand je ne comprends pas",
  "Je me sens à l'aise pour parler devant la classe",
  "J'ai confiance en mes capacités",
  "Je me sens bien dans la classe",
  "Je viens au collège avec plaisir"
];

/**
 * Intitulés EXACTS des questions.
 * ⚠️ 2-Exploitation.gs retrouve les colonnes du classeur en cherchant ces
 * fragments dans la ligne d'en-têtes. Si tu renommes une question ici,
 * renomme le fragment correspondant là-bas (constante Q).
 */
var T = {
  eleve:      "Qui es-tu ?",
  surnom:     "Prénom d'usage (si différent de ton prénom officiel)",
  fratrie:    "Ta place dans la fratrie",
  activites:  "Tes activités régulières",
  heuresAct:  "Au total, combien d'heures par semaine consacres-tu à ces activités ?",
  coucher:    "À quelle heure te couches-tu en semaine ?",
  travailJ:   "Combien de temps travailles-tu chez toi, par jour ?",
  lieu:       "Où travailles-tu le plus souvent ?",
  aide:       "Es-tu aidé(e) à la maison si tu bloques ?",
  comprendre: "Ce qui t'aide le plus à comprendre",
  grille:     "Es-tu d'accord ?",
  // Temporalités dissociées : le constat ne peut être que rétrospectif (c'est la
  // seule expérience dont l'élève dispose en septembre), le besoin est prospectif
  // (c'est lui qui sert à monter les binômes d'entraide). « Cette année » seul
  // était ambigu à la rentrée. Les fragments cherchés par 2-Exploitation.gs
  // (« les plus faciles », « besoin d'aide ») sont préservés.
  faciles:    "L'an dernier (en 5e), mes matières les plus faciles",
  besoin:     "Cette année en 4e, les matières où je pense avoir le plus besoin d'aide",
  apres3e:    "Après la 3e, tu penses plutôt à…",
  certitude:  "À quel point es-tu sûr(e) de ce choix ?",
  mfrPrepa:   "Connais-tu les classes de 3e Prépa-Métiers ou de 3e en MFR (Maison Familiale Rurale) ?",
  metier:     "Un métier ou un domaine qui t'attire ?",
  pourquoi:   "Pourquoi celui-là ?",
  etudes:     "Sais-tu quelles études il faut faire pour y arriver ?",
  infos:      "Sur quoi aimerais-tu être informé(e) cette année ?",
  message:    "Y a-t-il quelque chose que je devrais savoir pour bien t'accompagner ?",
  objectif:   "Un objectif personnel pour cette année",
  // Ajoutee a la main dans le formulaire apres la creation initiale (aout 2026) :
  // reintegree ici pour que le script reste la source de verite du quiz.
  mfrPrepa:   "Connais-tu les classes de 3e Prépa-Métiers ou de 3e en MFR (Maison Familiale Rurale) ?  Ce sont des parcours qui existent en plus de la 3e classique au collège — je peux t'expliquer si tu veux."
};

// ─────────────────────────────────────────────────────────────────────────────
// CRÉATION DU FORMULAIRE
// ─────────────────────────────────────────────────────────────────────────────

function creerQuiz() {
  var form = FormApp.create(TITRE_FORM);
  form.setTitle(TITRE_FORM)
      .setDescription(DESCRIPTION_FORM)
      .setProgressBar(true)
      .setAllowResponseEdits(true)      // l'élève peut se corriger après coup
      .setShowLinkToRespondAgain(false)
      .setConfirmationMessage("Merci ! C'est enregistré. À bientôt en cours. — M. Blanchard");

  // Réglages « compte du collège ». Ces API évoluent : on tente la version
  // récente, on retombe sur l'ancienne, et on n'échoue jamais pour ça
  // (le formulaire reste utilisable, il suffit de cocher à la main dans ⚙️).
  reglagesDomaine_(form);

  // ── Section 1 ──────────────────────────────────────────────────────────────
  form.addSectionHeaderItem()
      .setTitle("1 · Qui es-tu ?")
      .setHelpText("Trois questions pour ne pas te confondre avec quelqu'un d'autre.");

  form.addListItem()
      .setTitle(T.eleve)
      .setHelpText("Choisis-toi dans la liste (c'est plus fiable que de taper ton nom).")
      .setChoiceValues(ELEVES)
      .setRequired(true);

  form.addTextItem()
      .setTitle(T.surnom)
      .setHelpText("Diminutif, autre prénom… Laisse vide si ton prénom officiel te va très bien.")
      .setRequired(false);

  form.addMultipleChoiceItem()
      .setTitle(T.fratrie)
      .setChoiceValues(["Enfant unique", "Aîné(e)", "Du milieu", "Cadet(te)"])
      .setRequired(false);

  // ── Section 2 ──────────────────────────────────────────────────────────────
  form.addPageBreakItem().setTitle("2 · Ta vie en dehors du collège");

  form.addCheckboxItem()
      .setTitle(T.activites)
      .setHelpText("Coche tout ce qui correspond.")
      .setChoiceValues([
        "Sport en club", "Sport libre", "Musique / danse / théâtre",
        "Arts plastiques / dessin", "Jeux vidéo", "Lecture",
        "Association / bénévolat", "Job / aide familiale", "Aucune pour l'instant"
      ])
      .setRequired(false);

  form.addMultipleChoiceItem()
      .setTitle(T.heuresAct)
      .setChoiceValues(["moins de 2 h", "2 à 4 h", "4 à 8 h", "plus de 8 h"])
      .setRequired(false);

  form.addMultipleChoiceItem()
      .setTitle(T.coucher)
      .setHelpText("Réponds honnêtement : ça ne sera reproché à personne.")
      .setChoiceValues(["avant 21 h", "21 h - 22 h", "22 h - 23 h", "après 23 h"])
      .setRequired(false);

  // ── Section 3 ──────────────────────────────────────────────────────────────
  form.addPageBreakItem().setTitle("3 · Ton travail scolaire");

  form.addMultipleChoiceItem()
      .setTitle(T.travailJ)
      .setChoiceValues(["moins de 15 min", "15 - 30 min", "30 min - 1 h", "plus d'1 h"])
      .setRequired(false);

  form.addMultipleChoiceItem()
      .setTitle(T.lieu)
      .setChoiceValues(["Ma chambre", "Une pièce commune", "L'étude au collège", "Ça dépend"])
      .setRequired(false);

  form.addMultipleChoiceItem()
      .setTitle(T.aide)
      .setChoiceValues(["Oui, régulièrement", "Parfois", "Rarement", "Jamais"])
      .setRequired(false);

  form.addCheckboxItem()
      .setTitle(T.comprendre)
      .setHelpText("3 réponses au maximum — celles qui marchent vraiment pour toi.")
      .setChoiceValues([
        "Les explications orales", "Écrire / recopier", "Les schémas et les images",
        "Faire des exercices", "Expliquer à quelqu'un", "Les vidéos",
        "Travailler à plusieurs", "Le calme total"
      ])
      .setValidation(FormApp.createCheckboxValidation()
        .requireSelectAtMost(3).setHelpText("3 réponses maximum.").build())
      .setRequired(false);

  form.addGridItem()
      .setTitle(T.grille)
      .setHelpText("1 = pas du tout d'accord · 5 = tout à fait d'accord")
      .setRows(ECHELLES)
      .setColumns(["1", "2", "3", "4", "5"])
      .setRequired(false);

  form.addCheckboxItem()
      .setTitle(T.faciles)
      .setHelpText("3 matières au maximum — celles où tu t'en sortais le mieux en 5e.")
      .setChoiceValues(MATIERES)
      .setValidation(FormApp.createCheckboxValidation()
        .requireSelectAtMost(3).setHelpText("3 matières maximum.").build())
      .setRequired(false);

  form.addCheckboxItem()
      .setTitle(T.besoin)
      .setHelpText("3 matières au maximum, pour l'année qui commence. Ce n'est pas un aveu de faiblesse : c'est ce qui me permet d'organiser l'entraide.")
      .setChoiceValues(MATIERES)
      .setValidation(FormApp.createCheckboxValidation()
        .requireSelectAtMost(3).setHelpText("3 matières maximum.").build())
      .setRequired(false);

  // ── Section 4 ──────────────────────────────────────────────────────────────
  form.addPageBreakItem()
      .setTitle("4 · Ton avenir")
      .setHelpText("On en est au tout début : « je ne sais pas encore » est une vraie réponse.");

  form.addMultipleChoiceItem()
      .setTitle(T.apres3e)
      .setChoiceValues([
        "Seconde générale et technologique", "Seconde professionnelle",
        "CAP", "Apprentissage", "Je ne sais pas encore"
      ])
      .setRequired(false);

  form.addScaleItem()
      .setTitle(T.certitude)
      .setBounds(1, 5)
      .setLabels("pas sûr(e) du tout", "totalement sûr(e)")
      .setRequired(false);

  form.addMultipleChoiceItem()
      .setTitle(T.mfrPrepa)
      .setHelpText("Ce sont des parcours qui existent en plus de la 3e classique au collège — je peux t'expliquer si tu veux.")
      .setChoiceValues([
        "Oui, et ça m'intéresserait", "Oui, mais ça ne m'intéresse pas",
        "Non, je ne connaissais pas", "Je ne sais pas encore"
      ])
      .setRequired(false);

  form.addTextItem().setTitle(T.metier).setRequired(false);
  form.addParagraphTextItem().setTitle(T.pourquoi).setRequired(false);

  form.addMultipleChoiceItem()
      .setTitle(T.etudes)
      .setChoiceValues(["Oui, précisément", "Vaguement", "Pas du tout"])
      .setRequired(false);

  form.addCheckboxItem()
      .setTitle(T.infos)
      .setHelpText("Ça décide du contenu de nos heures de vie de classe.")
      .setChoiceValues([
        "Les métiers", "Les filières après la 3e", "Le stage de 3e",
        "Les portes ouvertes", "Comment mieux m'organiser",
        "Les parcours 3e Prépa-Métiers / 3e en MFR",
        "Autre chose (je le dis en dessous)"
      ])
      .setRequired(false);

  // ── Section 5 ──────────────────────────────────────────────────────────────
  form.addPageBreakItem()
      .setTitle("5 · Ce que tu veux me dire")
      .setHelpText("Ces deux questions sont facultatives : tu écris seulement si tu veux.");

  form.addParagraphTextItem()
      .setTitle(T.message)
      .setHelpText("Santé, aménagement, situation à la maison, timidité… Tu écris seulement si tu veux, et ça reste entre nous.")
      .setRequired(false);

  form.addTextItem()
      .setTitle(T.objectif)
      .setHelpText("Une seule phrase. On la relira ensemble en juin.")
      .setRequired(false);

  form.addMultipleChoiceItem()
      .setTitle(T.mfrPrepa)
      .setChoiceValues([
        "Oui, et ça m'intéresserait", "Oui, mais ça ne m'intéresse pas",
        "Non, je ne connaissais pas", "Je ne sais pas encore"
      ])
      .setRequired(false);

  // ── Classeur de réponses ───────────────────────────────────────────────────
  var classeur = SpreadsheetApp.create(NOM_CLASSEUR);
  var avant = classeur.getSheets().map(function (f) { return f.getName(); });
  form.setDestination(FormApp.DestinationType.SPREADSHEET, classeur.getId());
  SpreadsheetApp.flush();

  classeur = SpreadsheetApp.openById(classeur.getId()); // recharger pour voir le nouvel onglet
  renommerOngletReponses_(classeur, avant);

  var liens = {
    quizForm:    form.getPublishedUrl(),
    quizEdition: form.getEditUrl(),
    quizReponses: classeur.getUrl()
  };

  Logger.log(
    "\n════════════════════════════════════════════════════════════\n" +
    " QUIZ 4G CRÉÉ ✅\n" +
    "════════════════════════════════════════════════════════════\n" +
    " À coller dans  donnees/config-portail.js  :\n\n" +
    '  quizForm: "' + liens.quizForm + '",\n' +
    '  quizReponses: "' + liens.quizReponses + '",\n' +
    '  quizEdition: "' + liens.quizEdition + '"\n\n' +
    "────────────────────────────────────────────────────────────\n" +
    " ÉTAPE SUIVANTE : ouvre le classeur ci-dessus,\n" +
    " Extensions > Apps Script, colle 2-Exploitation.gs,\n" +
    " puis exécute construireFiche().\n" +
    "════════════════════════════════════════════════════════════"
  );
  return liens;
}

/** Réglages liés au compte Google — tolérants aux évolutions de l'API. */
function reglagesDomaine_(form) {
  if (!ELEVES_ONT_UN_COMPTE_GOOGLE) {
    // Formulaire ouvert : aucune connexion demandée, sinon les élèves sont bloqués.
    try {
      if (FormApp.EmailCollectionType) form.setEmailCollectionType(FormApp.EmailCollectionType.DO_NOT_COLLECT);
      else form.setCollectEmail(false);
      form.setRequireLogin(false);
      form.setLimitOneResponsePerUser(false);
    } catch (e) {
      Logger.log("⚠️ Vérifie dans ⚙️ que « Collecter les e-mails » ET « Limiter à 1 réponse » " +
                 "sont bien DÉCOCHÉS — sans compte Google, l'élève ne pourrait pas envoyer. (" + e + ")");
    }
    return;
  }
  try {
    if (FormApp.EmailCollectionType) form.setEmailCollectionType(FormApp.EmailCollectionType.VERIFIED);
    else form.setCollectEmail(true);
  } catch (e) {
    try { form.setCollectEmail(true); } catch (e2) {
      Logger.log("⚠️ Collecte des e-mails à cocher à la main dans ⚙️ (" + e2 + ")");
    }
  }
  try {
    form.setRequireLogin(true);
    form.setLimitOneResponsePerUser(true);
  } catch (e) {
    Logger.log("⚠️ « Limiter à 1 réponse » à cocher à la main dans ⚙️ (" + e + ")");
  }
}

/** Renomme en « Reponses » l'onglet que Forms vient de créer. */
function renommerOngletReponses_(classeur, nomsAvant) {
  var nouvelle = null;
  classeur.getSheets().forEach(function (f) {
    if (nomsAvant.indexOf(f.getName()) === -1) nouvelle = f;
  });
  if (!nouvelle) {
    // Repli : l'onglet des réponses est celui dont A1 vaut « Horodateur ».
    classeur.getSheets().forEach(function (f) {
      if (String(f.getRange("A1").getValue()).indexOf("Horodat") === 0) nouvelle = f;
    });
  }
  if (!nouvelle) throw new Error("Onglet de réponses introuvable : renomme-le « " + NOM_ONGLET_REPONSES + " » à la main.");
  nouvelle.setName(NOM_ONGLET_REPONSES);

  // L'onglet vide « Feuille 1 » créé avec le classeur ne sert à rien.
  // On liste d'abord, on supprime ensuite (ne jamais muter la liste qu'on parcourt).
  var aSupprimer = classeur.getSheets().filter(function (f) {
    return f.getName() !== NOM_ONGLET_REPONSES && f.getLastRow() === 0;
  });
  aSupprimer.forEach(function (f) {
    if (classeur.getSheets().length > 1) classeur.deleteSheet(f);
  });
}
