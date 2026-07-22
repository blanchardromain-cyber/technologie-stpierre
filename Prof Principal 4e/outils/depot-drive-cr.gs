/*
 * Dépôt automatique des enregistrements de réunion dans Google Drive.
 * Back-end de l'outil « CR de réunion » (bouton ☁️ Déposer sur Drive).
 *
 * ── Installation (une seule fois) ────────────────────────────────────────────
 * 1. https://script.google.com  →  Nouveau projet.
 * 2. Colle TOUT ce fichier dans Code.gs (remplace le contenu par défaut).
 * 3. Change la valeur de JETON ci-dessous (garde-la secrète, la même sera saisie
 *    dans l'outil). Optionnel : renseigne DOSSIER_ID pour cibler un dossier précis.
 * 4. Déployer  →  Nouveau déploiement  →  type « Application Web » :
 *       - Exécuter en tant que : Moi
 *       - Qui a accès : Tout le monde
 *    Autorise l'accès à ton Drive quand Google le demande.
 * 5. Copie l'URL du déploiement (elle se termine par /exec).
 * 6. Dans l'outil CR de réunion → « ⚙️ Dépôt Drive auto » → colle l'URL et le JETON.
 *
 * ⚠️ Après toute modification du script : Déployer → Gérer les déploiements →
 *    modifier (icône crayon) → Nouvelle version. Sinon l'ancienne version tourne encore.
 *
 * Note de taille : un POST Apps Script porte mal les très gros fichiers (> ~40-50 Mo).
 * Enchaîne plutôt des séquences courtes (un entretien = une séquence) — c'est déjà le
 * fonctionnement de l'outil.
 */

// Dossier créé à la racine du Drive si DOSSIER_ID est vide.
const DOSSIER_NOM = "CR réunions — enregistrements";
// Dossier Drive cible (celui de la tuile « Enregistrements réunions » du Cockpit).
// Vide = crée/réutilise un dossier nommé DOSSIER_NOM à la racine.
const DOSSIER_ID = "1Yeyk50ApziRr6bOrGSW57py4lw86SDTx";
// Jeton partagé anti-abus : METS LA MÊME VALEUR DANS L'OUTIL. Change-le pour tout invalider.
const JETON = "change-moi-2026";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json_({ ok: false, erreur: "Requête vide" });
    const data = JSON.parse(e.postData.contents);
    if (data.jeton !== JETON) return json_({ ok: false, erreur: "Jeton invalide" });
    if (!data.base64) return json_({ ok: false, erreur: "Aucun contenu audio" });

    const octets = Utilities.base64Decode(data.base64);
    const blob = Utilities.newBlob(octets, data.mime || "application/octet-stream", nettoyerNom_(data.nom));
    const fichier = obtenirDossier_().createFile(blob);

    return json_({ ok: true, id: fichier.getId(), url: fichier.getUrl(), nom: fichier.getName() });
  } catch (err) {
    return json_({ ok: false, erreur: String(err) });
  }
}

// Permet un test rapide dans le navigateur (doit répondre {"ok":true,...}).
function doGet() {
  return json_({ ok: true, service: "depot-cr-reunion", dossier: obtenirDossier_().getName() });
}

// ⚙️ À LANCER UNE FOIS dans l'éditeur (menu déroulant des fonctions -> autoriser -> Exécuter).
// La fenêtre « Autorisation requise » apparaît : Autoriser -> choisir ton compte -> Avancé
// -> « Accéder à … (non sécurisé) » -> Autoriser l'accès à Google Drive. Sans cette étape,
// l'appel à DriveApp échoue (c'est la cause de l'erreur « getFolderById »).
function autoriser() {
  const d = obtenirDossier_();
  Logger.log("OK — dossier cible : " + d.getName() + " (" + d.getId() + ")");
}

function obtenirDossier_() {
  // 1) On tente le dossier précis (celui de la tuile). S'il est inaccessible par CE compte
  //    (autre propriétaire, ID erroné), on ne plante pas : on bascule sur un dossier par nom.
  if (DOSSIER_ID) {
    try { return DriveApp.getFolderById(DOSSIER_ID); }
    catch (e) { /* ID inaccessible : repli ci-dessous */ }
  }
  const it = DriveApp.getFoldersByName(DOSSIER_NOM);
  return it.hasNext() ? it.next() : DriveApp.createFolder(DOSSIER_NOM);
}

function nettoyerNom_(nom) {
  nom = (nom || "enregistrement").toString().replace(/[\\/:*?"<>|]+/g, "-");
  return nom || "enregistrement";
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
