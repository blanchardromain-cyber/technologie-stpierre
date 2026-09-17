/**
 * Hub de classe 4G — backend Apps Script. VERSION 2.8.
 * Onglets : Codes, Messages, Signalements + (v2) Infos, Divers.
 * Nouveautés v2 : horaires d'ouverture (blocage élèves hors plage), casier + référents
 * absence par élève, plan de classe publié (pseudonymisé).
 * Nouveauté v2.5 : emploi du temps de la classe — l'URL de l'agenda EcoleDirecte est réglée
 * par le prof (onglet Classe) ; si c'est un flux .ics, le serveur le lit et le décode ici
 * (le navigateur des élèves ne peut pas le faire : CORS). Résultat mis en cache 30 min.
 * Nouveauté v2.7 (performance) : cache de lecture des onglets Codes/Divers/Messages,
 * verrou global réservé aux écritures, et action « bootstrap » qui renvoie en un seul
 * aller-retour ce que le Hub demandait en cinq. Après mise à jour, exécuter une fois
 * viderCachesLecture() si un réglage semble figé.
 * Nouveauté v2.8 : charte d'utilisation de l'Entraide, co-construite avec les élèves,
 * signée par chacun (onglet Signatures). Sans signature de la version courante, un élève
 * voit la charte à la place du formulaire d'Entraide — le reste du Hub reste ouvert.
 * ⚠️ Le fuseau du projet Apps Script doit être « Europe/Paris » (Projet > Paramètres).
 * MISE À JOUR d'un déploiement existant : coller ce code, exécuter initialiser() une fois,
 * puis Déployer > Gérer les déploiements > ✏️ > Nouvelle version (l'URL ne change pas).
 */

var NOM_FEUILLE_CODES = "Codes";
var NOM_FEUILLE_MESSAGES = "Messages";
var NOM_FEUILLE_SIGNALEMENTS = "Signalements";
var NOM_FEUILLE_INFOS = "Infos";
var NOM_FEUILLE_DIVERS = "Divers";
var INSULTES_SUB = ["connard","connasse","conard","conasse","encule","enculer","enculette","putain","salopard","salope","enfoire","tapette","tarlouze","tantouze","tafiole","pouffiasse","petasse","grognasse","ducon","triso","trisomique","mongolien","niktamere","niquetamere","filsdepute","tagueule","fermelatagueule","ntm","fdp","bougnoule","bamboula","chinetoque","niakoue","negro","negre","youpin","bicot","batard","pedale","branleur","branler","couille","salaud"];
var INSULTES_MOT = ["con","cons","conne","connes","pute","putes","pd","pede","tg","naze","nase","debile","cretin","abruti","bouffon","tocard","cassos","guignol","gogol","mongol","gouine","merde","merdique","chiant","chieur","bite","zizi","zboub","teub","cul","clochard","raclure","ordure","boloss","bolos","thug"];

function normaliserTexte(t) {
  return String(t).toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[@4]/g, "a").replace(/0/g, "o").replace(/3/g, "e").replace(/[1!|]/g, "i").replace(/[5$]/g, "s").replace(/7/g, "t")
    .replace(/(.)\1{2,}/g, "$1")
    .replace(/[^a-z\s]/g, " ");
}

function contientInsulte(texte) {
  var norm = normaliserTexte(texte);
  var colle = norm.replace(/\s+/g, "");
  var tokens = norm.split(/\s+/).filter(String);
  var perso = lireDivers("motsPerso").split(",").map(function (w) { return normaliserTexte(w).replace(/\s+/g, ""); }).filter(String);
  var sub = INSULTES_SUB.concat(perso.filter(function (w) { return w.length >= 4; }));
  var mot = INSULTES_MOT.concat(perso.filter(function (w) { return w.length < 4; }));
  if (sub.some(function (w) { return colle.indexOf(w) !== -1; })) return true;
  return tokens.some(function (tok) {
    return mot.some(function (w) { return tok === w || tok === w + "s" || tok === w + "e" || tok === w + "es"; });
  });
}

/** À exécuter UNE FOIS à la main (ré-exécutable sans risque) : crée les onglets manquants. */
function initialiser() {
  var classeur = SpreadsheetApp.getActiveSpreadsheet();
  if (!classeur.getSheetByName(NOM_FEUILLE_CODES))
    classeur.insertSheet(NOM_FEUILLE_CODES).appendRow(["code", "pseudo", "role"]);
  if (!classeur.getSheetByName(NOM_FEUILLE_MESSAGES))
    classeur.insertSheet(NOM_FEUILLE_MESSAGES).appendRow(["id", "ts", "code", "pseudo", "role", "type", "parentId", "matiere", "texte", "resolu", "masque", "merciPar", "signale"]);
  if (!classeur.getSheetByName(NOM_FEUILLE_SIGNALEMENTS))
    classeur.insertSheet(NOM_FEUILLE_SIGNALEMENTS).appendRow(["ts", "codeAuteur", "idMessage", "extrait"]);
  if (!classeur.getSheetByName(NOM_FEUILLE_INFOS))
    classeur.insertSheet(NOM_FEUILLE_INFOS).appendRow(["pseudo", "casier", "referent1", "referent2", "maj"]);
  if (!classeur.getSheetByName(NOM_FEUILLE_SIGNATURES))
    classeur.insertSheet(NOM_FEUILLE_SIGNATURES).appendRow(["ts", "code", "pseudo", "version"]);
  if (!classeur.getSheetByName(NOM_FEUILLE_DIVERS)) {
    var d = classeur.insertSheet(NOM_FEUILLE_DIVERS);
    d.appendRow(["cle", "valeur"]);
    d.appendRow(["ouverture", "07:30"]);
    d.appendRow(["fermeture", "21:00"]);
    d.appendRow(["joursOuverts", "1,2,3,4,5,6,7"]);
    d.appendRow(["motsPerso", ""]);
    d.appendRow(["planClasse", ""]);
    d.appendRow(["planningMenage", ""]);
    d.appendRow(["edtUrl", ""]);
  }
  // Colonne des valeurs en TEXTE : empêche Sheets de convertir « 07:30 » en date (bug « samedi »).
  feuille(NOM_FEUILLE_DIVERS).getRange("B:B").setNumberFormat("@");
  if (!lireDivers("joursOuverts")) ecrireDivers("joursOuverts", "1,2,3,4,5,6,7"); // migration v2 -> v2.2
  if (!lireDivers("charteTexte")) ecrireDivers("charteTexte", CHARTE_DEFAUT);      // migration v2.7 -> v2.8
  if (!lireDivers("charteVersion")) ecrireDivers("charteVersion", "1");
  // ré-écrit les heures au propre si elles avaient été converties en date
  ecrireDivers("ouverture", lireHeure("ouverture") || "07:30");
  ecrireDivers("fermeture", lireHeure("fermeture") || "21:00");
}

function horairesActuels() {
  var d = diversTout();   // une seule lecture (au lieu de 4) et mise en cache
  return {
    ouverture: formatHeure(d.ouverture), fermeture: formatHeure(d.fermeture),
    jours: d.joursOuverts == null ? "" : String(d.joursOuverts),
    motsPerso: String(d.motsPerso == null ? "" : d.motsPerso).split(",").map(function (s) { return s.trim(); }).filter(String)
  };
}

/** "HH:mm" en gérant le cas où Sheets a stocké l'heure comme Date. */
function formatHeure(v) {
  if (v == null || v === "") return "";
  if (v instanceof Date) return ("0" + v.getHours()).slice(-2) + ":" + ("0" + v.getMinutes()).slice(-2);
  return String(v).slice(0, 5);
}

// ---------- v2.7 : cache de lecture (performance) ----------
// Avant : chaque requête relisait intégralement les onglets Codes et Divers
// (4 lectures rien que pour les horaires) — d'où la latence ressentie par les élèves.
// Désormais ces deux onglets, qui changent très rarement, sont mémorisés :
//   • memo   = mémoire de l'exécution en cours (0 lecture supplémentaire) ;
//   • cache  = CacheService partagé entre toutes les exécutions (60 s).
var CACHE_LECTURE_S = 60;      // Codes / Divers
var CACHE_MESSAGES_S = 5;      // Messages : absorbe les rafraîchissements simultanés
var memo = {};

function cacheScript() { return CacheService.getScriptCache(); }

function viderCachesLecture() {
  memo = {};
  cacheScript().removeAll(["hubCodes", "hubDivers", "hubMessages", "hubSignatures"]);
}

/** Toutes les clés de l'onglet Divers en un seul objet. */
function diversTout() {
  if (memo.divers) return memo.divers;
  var brut = cacheScript().get("hubDivers");
  if (brut) { try { return (memo.divers = JSON.parse(brut)); } catch (e) {} }
  var m = {}, f = feuille(NOM_FEUILLE_DIVERS);
  if (f) {
    var lignes = f.getDataRange().getValues();
    for (var i = 1; i < lignes.length; i++) if (lignes[i][0]) m[lignes[i][0]] = lignes[i][1];
  }
  var serialise = JSON.stringify(m);
  if (serialise.length < 90000) cacheScript().put("hubDivers", serialise, CACHE_LECTURE_S);
  return (memo.divers = m);
}

/** Onglet Codes mémorisé : [[code, pseudo, role], …] sans l'en-tête. */
function codesTout() {
  if (memo.codes) return memo.codes;
  var brut = cacheScript().get("hubCodes");
  if (brut) { try { return (memo.codes = JSON.parse(brut)); } catch (e) {} }
  var lignes = feuille(NOM_FEUILLE_CODES).getDataRange().getValues().slice(1)
    .filter(function (l) { return l[0]; })
    .map(function (l) { return [String(l[0]), String(l[1]), String(l[2])]; });
  var serialise = JSON.stringify(lignes);
  if (serialise.length < 90000) cacheScript().put("hubCodes", serialise, CACHE_LECTURE_S);
  return (memo.codes = lignes);
}

/** Lignes brutes de l'onglet Messages, mémorisées 5 s (les élèves rafraîchissent en même temps). */
function messagesTout() {
  if (memo.messages) return memo.messages;
  var brut = cacheScript().get("hubMessages");
  if (brut) { try { return (memo.messages = JSON.parse(brut)); } catch (e) {} }
  var lignes = feuille(NOM_FEUILLE_MESSAGES).getDataRange().getValues();
  var serialise = JSON.stringify(lignes);
  if (serialise.length < 90000) cacheScript().put("hubMessages", serialise, CACHE_MESSAGES_S);
  return (memo.messages = lignes);
}

function invaliderMessages() { memo.messages = null; cacheScript().remove("hubMessages"); }
function invaliderDivers() { memo.divers = null; cacheScript().remove("hubDivers"); }

// Actions en lecture seule : elles ne prennent PAS le verrou global.
// C'était la cause principale de la latence : 25 élèves qui rafraîchissent toutes
// les 4 s faisaient la queue derrière un LockService unique.
var ACTIONS_LECTURE = {
  liste: 1, infosMoi: 1, listeInfos: 1, lirePlan: 1, lireMenage: 1, lireEdt: 1, bootstrap: 1, lireCharte: 1
};

// ---------- v2.8 : charte d'utilisation de l'Entraide ----------
// Co-construite avec les élèves. Tant qu'un élève n'a pas signé la version courante,
// l'onglet Entraide lui affiche la charte au lieu du formulaire. Le reste du Hub
// (annonces, plan, ménage, EDT) n'est jamais bloqué par la charte.
// Format du texte : un article par ligne, « Titre | corps de l'article ».
var NOM_FEUILLE_SIGNATURES = "Signatures";
var CHARTE_DEFAUT = "Nous posons des questions claires.|On dit à quelle matière et à quel exercice on est, on écrit correctement, et on explique où on bloque. Une question soignée, c'est déjà du respect pour celui qui va répondre. Aucune question n'est bête ; une question bâclée, oui.\nNous restons dans le sujet du cours.|L'Entraide sert au travail scolaire. Ce n'est ni une messagerie, ni un espace de discussion libre.\nNous écrivons avec politesse.|Pas d'insulte, pas de grossièreté, pas de moquerie — même pour rire, même entre copains. Ce qui est écrit reste écrit et tout le monde le lit.\nNous ne visons personne.|On ne cite pas le nom d'un élève ou d'un adulte pour s'en plaindre ou s'en moquer. Viser quelqu'un, surtout de façon répétée, porte un nom : c'est du harcèlement, et ça n'a pas sa place ici.\nNous n'envoyons ni photo ni document personnel.|Une image peut montrer un nom, une écriture reconnaissable ou un visage. C'est le droit à l'image de chacun, et la modération automatique ne sait pas lire une image.\nNous signalons ce qui dépasse.|Signaler n'est pas dénoncer : c'est protéger la classe. Si un message met quelqu'un mal à l'aise, on clique sur « Signaler », même quand on n'est pas la personne visée. Le filtre bloque les gros mots, il ne bloque pas tout — le reste dépend de nous.";

function charteActuelle() {
  var d = diversTout();
  var texte = d.charteTexte == null ? "" : String(d.charteTexte);
  var version = parseInt(d.charteVersion, 10);
  return { texte: texte, version: isNaN(version) ? 1 : version };
}

/** Signatures mémorisées : { "CODE|version": date } */
function signaturesTout() {
  if (memo.signatures) return memo.signatures;
  var f = feuille(NOM_FEUILLE_SIGNATURES);
  var lignes = f ? f.getDataRange().getValues().slice(1) : [];
  return (memo.signatures = lignes.filter(function (l) { return l[1]; })
    .map(function (l) { return { ts: l[0], code: String(l[1]), pseudo: String(l[2]), version: parseInt(l[3], 10) || 1 }; }));
}

function aSigne(u, version) {
  var code = String(u.code).trim().toUpperCase();
  return signaturesTout().some(function (x) {
    return x.code.trim().toUpperCase() === code && x.version === version;
  });
}

function lireCharte(u) {
  var c = charteActuelle();
  var r = { ok: true, texte: c.texte, version: c.version, signee: u.role === "prof" ? true : aSigne(u, c.version) };
  if (u.role === "prof") r.signatures = signaturesTout()
    .filter(function (x) { return x.version === c.version; })
    .map(function (x) { return { pseudo: x.pseudo, ts: x.ts }; });
  return r;
}

function signerCharte(u) {
  if (u.role !== "eleve") return { ok: false, erreur: "Réservé aux élèves." };
  var c = charteActuelle();
  if (!c.texte) return { ok: false, erreur: "Aucune charte publiée pour le moment." };
  if (aSigne(u, c.version)) return { ok: true, deja: true, signee: true, version: c.version };
  var f = feuille(NOM_FEUILLE_SIGNATURES);
  if (!f) return { ok: false, erreur: "Onglet Signatures absent : exécute initialiser()." };
  f.appendRow([new Date(), u.code, u.pseudo, c.version]);
  memo.signatures = null;
  cacheScript().remove("hubSignatures");
  return { ok: true, signee: true, version: c.version };
}

/**
 * Publication par le prof. Par défaut la version est incrémentée : tous les élèves
 * doivent resigner. « correction » = true pour une simple faute d'orthographe,
 * la version ne bouge pas et les signatures restent valables.
 */
function publierCharte(d, u) {
  if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
  var texte = String(d.texte || "").slice(0, 8000);
  var c = charteActuelle();
  var nouvelle = d.correction ? c.version : c.version + 1;
  ecrireDivers("charteTexte", texte);
  ecrireDivers("charteVersion", String(nouvelle));
  return { ok: true, version: nouvelle, resignature: !d.correction };
}

function doPost(e) {
  var reponse;
  try {
    var d = JSON.parse(e.postData.contents);
    var utilisateur = trouverUtilisateur(d.code);
    var horaires = horairesActuels();
    if (utilisateur && utilisateur.role === "eleve" && horsPlage(horaires)) {
      reponse = { ok: false, ferme: true, erreur: messageFerme(horaires) };
    } else if (d.action === "login") {
      reponse = utilisateur ? { ok: true, pseudo: utilisateur.pseudo, role: utilisateur.role, horaires: horaires }
                            : { ok: false, erreur: "Code inconnu. Vérifie ta carte." };
    } else if (!utilisateur) {
      reponse = { ok: false, erreur: "Code invalide." };
    } else {
      reponse = traiter(d, utilisateur);
    }
  } catch (err) {
    reponse = { ok: false, erreur: "Erreur serveur : " + (err && err.message ? err.message : err) };
  }
  return ContentService.createTextOutput(JSON.stringify(reponse))
    .setMimeType(ContentService.MimeType.JSON);
}

function lireHeure(cle) { return formatHeure(diversTout()[cle]); }

function horsPlage(h) {
  // jour de la semaine (1 = lundi … 7 = dimanche)
  if (h.jours) {
    var jourIso = Utilities.formatDate(new Date(), "Europe/Paris", "u");
    if (h.jours.split(",").indexOf(jourIso) === -1) return true; // jour non ouvert
  }
  if (!h.ouverture || !h.fermeture) return false; // heures non configurées = toujours ouvert
  var maintenant = Utilities.formatDate(new Date(), "Europe/Paris", "HH:mm");
  return maintenant < h.ouverture || maintenant >= h.fermeture;
}

function messageFerme(h) {
  var noms = { "1": "lun", "2": "mar", "3": "mer", "4": "jeu", "5": "ven", "6": "sam", "7": "dim" };
  var jours = (h.jours || "1,2,3,4,5,6,7").split(",").map(function (j) { return noms[j] || j; }).join(", ");
  var plage = (h.ouverture && h.fermeture) ? " de " + h.ouverture + " à " + h.fermeture : "";
  return "Le Hub est fermé. Ouvert : " + jours + plage + ".";
}

function trouverUtilisateur(code) {
  if (!code) return null;
  var cherche = String(code).trim().toUpperCase();
  var lignes = codesTout();
  for (var i = 0; i < lignes.length; i++)
    if (lignes[i][0].trim().toUpperCase() === cherche)
      return { code: lignes[i][0], pseudo: lignes[i][1], role: lignes[i][2] };
  return null;
}

/** Pseudos des élèves (onglet Codes, mémorisé). */
function pseudosEleves() {
  return codesTout().filter(function (l) { return l[2] === "eleve"; }).map(function (l) { return l[1]; });
}

function lireDivers(cle) {
  var v = diversTout()[cle];
  return v == null ? "" : String(v);
}

function ecrireDivers(cle, valeur) {
  var f = feuille(NOM_FEUILLE_DIVERS);
  var lignes = f.getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++)
    if (lignes[i][0] === cle) { var cell = f.getRange(i + 1, 2); cell.setNumberFormat("@"); cell.setValue(valeur); invaliderDivers(); return; }
  f.appendRow([cle, valeur]);
  invaliderDivers();
}

function traiter(d, u) {
  // Lectures : pas de verrou (sinon tous les élèves font la queue) — v2.7
  if (ACTIONS_LECTURE[d.action]) return executer(d, u);
  var verrou = LockService.getScriptLock();
  verrou.waitLock(10000);
  try {
    return executer(d, u);
  } finally {
    verrou.releaseLock();
  }
}

function executer(d, u) {
  {
    switch (d.action) {
      case "bootstrap": return bootstrap(u);
      case "lireCharte": return lireCharte(u);
      case "signerCharte": return signerCharte(u);
      case "publierCharte": return publierCharte(d, u);
      case "liste": return listerMessages(u);
      case "poster": return poster(d, u);
      case "merci": return modifier(d.id, u, function (m) {
        var deja = String(m.merciPar || "").split(",").filter(String);
        if (deja.indexOf(u.code) === -1) deja.push(u.code);
        return { merciPar: deja.join(",") };
      });
      case "resoudre": return modifier(d.id, u, function (m) {
        if (m.pseudo !== u.pseudo && u.role !== "prof") return null;
        return { resolu: 1 };
      });
      case "masquer":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        return modifier(d.id, u, function () { return { masque: d.retablir ? 0 : 1 }; });
      case "signaler": return signaler(d, u);
      case "infosMoi": return infosMoi(u);
      case "majInfos": return majInfos(d, u);
      case "listeInfos":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        return { ok: true, infos: lireInfos(), horaires: horairesActuels(), edtUrl: lireDivers("edtUrl") };
      case "reglerHoraires":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        ecrireDivers("ouverture", String(d.ouverture || "").slice(0, 5));
        ecrireDivers("fermeture", String(d.fermeture || "").slice(0, 5));
        var jours = String(d.jours || "").split(",").filter(function (j) { return "1234567".indexOf(j) !== -1; }).join(",");
        ecrireDivers("joursOuverts", jours);
        return { ok: true };
      case "reglerMotsPerso":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        ecrireDivers("motsPerso", (d.motsPerso || []).join(",").slice(0, 2000));
        return { ok: true };
      case "publierPlan":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        ecrireDivers("planClasse", String(d.plan || "").slice(0, 30000));
        return { ok: true };
      case "lirePlan":
        return { ok: true, plan: lireDivers("planClasse") };
      case "ajouterRetenue":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        return ajouterRetenue(d);
      case "publierMenage":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        ecrireDivers("planningMenage", String(d.planning || "").slice(0, 30000));
        return { ok: true };
      case "lireMenage":
        return { ok: true, planning: lireDivers("planningMenage") };
      case "reglerEdt":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        return reglerEdt(d);
      case "lireEdt":
        return lireEdt(d);
      case "diagnostiquerEdt":
        if (u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
        return diagnostiquerEdt();
      default: return { ok: false, erreur: "Action inconnue." };
    }
  }
}

/**
 * v2.7 — un seul aller-retour au lieu de cinq.
 * Le Hub demandait successivement liste / infosMoi / lirePlan / lireMenage (+ EDT) :
 * chaque appel coûtait un aller-retour Apps Script complet. « bootstrap » renvoie tout
 * d'un coup à la connexion ; l'emploi du temps reste à part (lecture réseau plus lourde).
 */
function bootstrap(u) {
  var estProf = u.role === "prof";
  var r = {
    ok: true,
    messages: listerMessages(u).messages,
    plan: lireDivers("planClasse"),
    planning: lireDivers("planningMenage"),
    horaires: horairesActuels(),
    charte: lireCharte(u)
  };
  if (estProf) { r.infos = lireInfos(); r.edtUrl = lireDivers("edtUrl"); }
  else r.moi = infosMoi(u);
  return r;
}

// ---------- Report des retenues dans le registre partagé (générateur → Sheet) ----------
// Le registre est un AUTRE classeur (partagé équipe) : openById demandera une autorisation
// supplémentaire à la première exécution après mise à jour — l'accepter.
var REGISTRE_RETENUES_ID = "1lfF5yuwpLlmfDEDmeFx6NkJ7lK7o0Iln1m4aA5DnBJQ";

/**
 * À EXÉCUTER UNE FOIS À LA MAIN après avoir collé ce code (choisir « autoriserRegistre »
 * dans la liste des fonctions, puis ▷ Exécuter).
 * C'est CETTE fonction qui déclenche la demande d'autorisation d'accès au registre :
 * initialiser() ne touche pas au registre, donc elle ne la déclenche jamais.
 * Elle n'écrit rien — elle vérifie seulement l'accès et affiche les onglets trouvés.
 */
function autoriserRegistre() {
  var classeur = SpreadsheetApp.openById(REGISTRE_RETENUES_ID);
  var onglets = classeur.getSheets().map(function (f) { return f.getName(); });
  var cible = classeur.getSheetByName("Retenues");
  var message = "✅ Accès OK au classeur « " + classeur.getName() + " »." +
    "\nOnglets : " + onglets.join(", ") +
    (cible ? "\n✅ Onglet « Retenues » trouvé — en-têtes ligne 1 : " + cible.getRange(1, 1, 1, 8).getValues()[0].join(" | ")
           : "\n⚠️ Pas d'onglet nommé « Retenues » : les lignes iraient dans « " + onglets[0] + " ». Renomme-le.");
  Logger.log(message);
  return message;
}

function ajouterRetenue(d) {
  var lignes = (d.lignes || []).slice(0, 20);
  if (!lignes.length) return { ok: false, erreur: "Aucune ligne à reporter." };
  var classeur = SpreadsheetApp.openById(REGISTRE_RETENUES_ID);
  // Échec explicite plutôt qu'écriture silencieuse dans le premier onglet venu :
  // sinon les lignes atterrissent dans « Mode d'emploi » et paraissent perdues.
  var f = classeur.getSheetByName("Retenues");
  if (!f) return { ok: false, erreur: "Onglet « Retenues » introuvable dans le registre (onglets présents : " +
    classeur.getSheets().map(function (s) { return s.getName(); }).join(", ") + ")." };
  lignes.forEach(function (l) {
    // Colonnes : Date | Créneau | Élève | Motif | Matière | Professeur | Travail fourni | Notes
    f.appendRow([
      String(l.date || ""), String(l.creneau || ""), String(l.eleve || "").slice(0, 60),
      String(l.motif || "").slice(0, 200), String(l.matiere || "").slice(0, 40),
      String(l.prof || "").slice(0, 40), "", ""
    ]);
  });
  return { ok: true, nb: lignes.length };
}

// ---------- Infos élèves (casier + référents absence) ----------
function lireInfos() {
  var f = feuille(NOM_FEUILLE_INFOS);
  if (!f) return []; // onglet pas encore créé : ne pas planter
  return f.getDataRange().getValues().slice(1)
    .map(function (l) { return { pseudo: l[0], casier: l[1], referent1: l[2], referent2: l[3] }; });
}

function infosMoi(u) {
  var mienne = lireInfos().filter(function (x) { return x.pseudo === u.pseudo; })[0] || {};
  var eleves = pseudosEleves();
  return { ok: true, casier: mienne.casier || "", referent1: mienne.referent1 || "", referent2: mienne.referent2 || "", eleves: eleves };
}

function majInfos(d, u) {
  if (u.role !== "eleve") return { ok: false, erreur: "Réservé aux élèves." };
  var casier = String(d.casier || "").slice(0, 6);
  var r1 = String(d.referent1 || ""), r2 = String(d.referent2 || "");
  if (r1 || r2) {
    var pseudos = pseudosEleves();
    if (r1 && (pseudos.indexOf(r1) === -1 || r1 === u.pseudo)) return { ok: false, erreur: "Référent 1 invalide." };
    if (r2 && (pseudos.indexOf(r2) === -1 || r2 === u.pseudo || r2 === r1)) return { ok: false, erreur: "Référent 2 invalide." };
  }
  var f = feuille(NOM_FEUILLE_INFOS);
  var lignes = f.getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++) {
    if (lignes[i][0] === u.pseudo) {
      f.getRange(i + 1, 2, 1, 4).setValues([[casier, r1, r2, new Date()]]);
      return { ok: true };
    }
  }
  f.appendRow([u.pseudo, casier, r1, r2, new Date()]);
  return { ok: true };
}

// ---------- Messages (inchangé v1) ----------
function listerMessages(u) {
  var lignes = messagesTout();
  var estProf = u.role === "prof";
  var resultat = [];
  for (var i = 1; i < lignes.length; i++) {
    var l = lignes[i];
    if (!estProf && l[10]) continue;
    resultat.push({
      id: l[0], ts: l[1], pseudo: l[3], role: l[4], type: l[5], parentId: l[6],
      matiere: l[7], texte: l[8], resolu: l[9], masque: l[10],
      merci: String(l[11] || "").split(",").filter(String), signale: l[12] || 0
    });
  }
  return { ok: true, messages: resultat };
}

function poster(d, u) {
  // Charte : un élève qui n'a pas signé la version courante ne peut pas écrire
  // dans l'Entraide (les annonces du prof et le reste du Hub ne sont pas concernés).
  if (u.role === "eleve" && d.type !== "annonce") {
    var c = charteActuelle();
    if (c.texte && !aSigne(u, c.version))
      return { ok: false, erreur: "Il faut d'abord lire et signer la charte de l'Entraide." };
  }
  var texte = String(d.texte || "").trim().slice(0, 1200);
  if (!texte) return { ok: false, erreur: "Message vide." };
  if (contientInsulte(texte)) return { ok: false, erreur: "Message refusé : vocabulaire interdit." };
  if (d.type === "annonce" && u.role !== "prof") return { ok: false, erreur: "Réservé au professeur." };
  if (["annonce", "question", "reponse"].indexOf(d.type) === -1) return { ok: false, erreur: "Type inconnu." };
  feuille(NOM_FEUILLE_MESSAGES).appendRow([
    Utilities.getUuid().slice(0, 8), Date.now(), u.code, u.pseudo, u.role,
    d.type, d.parentId || "", d.matiere || "", texte, 0, 0, "", 0
  ]);
  invaliderMessages();
  return { ok: true };
}

function modifier(id, u, calcul) {
  var f = feuille(NOM_FEUILLE_MESSAGES);
  var lignes = f.getDataRange().getValues();   // lecture directe : on écrit par numéro de ligne
  var colonnes = { resolu: 10, masque: 11, merciPar: 12 };
  for (var i = 1; i < lignes.length; i++) {
    if (lignes[i][0] === id) {
      var m = { pseudo: lignes[i][3], merciPar: lignes[i][11] };
      var maj = calcul(m);
      if (!maj) return { ok: false, erreur: "Non autorisé." };
      for (var cle in maj) f.getRange(i + 1, colonnes[cle]).setValue(maj[cle]);
      invaliderMessages();
      return { ok: true };
    }
  }
  return { ok: false, erreur: "Message introuvable." };
}

function signaler(d, u) {
  var f = feuille(NOM_FEUILLE_MESSAGES);
  var lignes = f.getDataRange().getValues();
  for (var i = 1; i < lignes.length; i++) {
    if (lignes[i][0] === d.id) {
      f.getRange(i + 1, 13).setValue((lignes[i][12] || 0) + 1);
      feuille(NOM_FEUILLE_SIGNALEMENTS).appendRow([new Date(), u.code, d.id, String(lignes[i][8]).slice(0, 120)]);
      invaliderMessages();
      return { ok: true };
    }
  }
  return { ok: false, erreur: "Message introuvable." };
}

// ---------- Emploi du temps de la classe (agenda EcoleDirecte) ----------
// Deux cas d'URL :
//   • flux iCalendar (.ics / ical) : lu et décodé ici, les élèves voient la grille dans le Hub ;
//   • lien web classique : le Hub affiche simplement un bouton « Ouvrir l'emploi du temps ».
var EDT_CACHE_SECONDES = 1800;   // 30 min : l'emploi du temps ne bouge pas toutes les minutes
var EDT_JOURS_AVANT = 7;         // fenêtre renvoyée au Hub : semaine écoulée…
var EDT_JOURS_APRES = 28;        // …et 4 semaines à venir

function estFluxIcs(url) {
  var u = String(url).toLowerCase();
  return /\.ics(\?|#|$)/.test(u) || u.indexOf("ical") !== -1 || u.indexOf("format=ics") !== -1;
}

/** Identifiant d'agenda Google (repli : « …@group.calendar.google.com » ou l'adresse Gmail du prof). */
function estAgendaGoogle(v) {
  return /^[^\s@]+@([a-z0-9.\-]+\.)?(group\.calendar\.google\.com|gmail\.com|googlemail\.com)$/i.test(String(v || "").trim());
}

function reglerEdt(d) {
  var url = String(d.url || "").trim().slice(0, 500);
  if (url && !/^https?:\/\//i.test(url) && !estAgendaGoogle(url))
    return { ok: false, erreur: "Attendu : une adresse https:// (flux .ics ou lien web) ou un identifiant d'agenda Google (…@group.calendar.google.com)." };
  ecrireDivers("edtUrl", url);
  CacheService.getScriptCache().remove("edt");   // l'ancien agenda ne doit pas survivre au changement
  return { ok: true };
}

function lireEdt(d) {
  var url = lireDivers("edtUrl");
  var frais = !!(d && d.frais);                       // « 🔄 rafraîchir » : on ignore vraiment le cache
  if (!url) return { ok: true, url: "", mode: "vide", evenements: [] };

  var cache = CacheService.getScriptCache();
  if (frais) cache.remove("edt");
  else {
    var enCache = cache.get("edt");
    if (enCache) {
      var prec = JSON.parse(enCache);
      if (prec.url === url) return prec;
    }
  }

  // Repli agenda Google : lu directement par le script, sans HTTP ni CORS.
  if (estAgendaGoogle(url)) {
    var repGcal = lireAgendaGoogle(url);
    memoriserEdt(cache, repGcal);
    return repGcal;
  }

  if (!estFluxIcs(url)) return { ok: true, url: url, mode: "lien", evenements: [] };

  var reponse;
  try {
    var http = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: {                                       // certains serveurs refusent les robots sans en-têtes
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "text/calendar, text/plain, */*"
      }
    });
    var code = http.getResponseCode();
    if (code >= 400)
      return { ok: true, url: url, mode: "erreur", evenements: [],
               erreur: "L'agenda a répondu " + code + " (lien expiré ou privé ?)." };
    var texte = http.getContentText();
    if (texte.indexOf("BEGIN:VCALENDAR") === -1)
      return { ok: true, url: url, mode: "erreur", evenements: [],
               erreur: "Le lien ne renvoie pas un agenda iCalendar (réponse : " +
                       String(texte).slice(0, 120).replace(/\s+/g, " ") + "…)." };
    if (texte.indexOf("BEGIN:VEVENT") === -1)
      return { ok: true, url: url, mode: "icsVide", maj: Date.now(), evenements: [],
               erreur: "L'agenda est bien joignable mais il est VIDE : EcoleDirecte ne publie aucun cours dans ce flux." };
    reponse = { ok: true, url: url, mode: "ics", maj: Date.now(), evenements: analyserIcs(texte) };
  } catch (err) {
    return { ok: true, url: url, mode: "erreur", evenements: [],
             erreur: "Agenda injoignable : " + (err && err.message ? err.message : err) };
  }
  memoriserEdt(cache, reponse);
  return reponse;
}

function memoriserEdt(cache, reponse) {
  var serialise = JSON.stringify(reponse);
  if (serialise.length < 90000) cache.put("edt", serialise, EDT_CACHE_SECONDES);   // limite CacheService
}

/** Repli : l'emploi du temps vit dans un agenda Google (le prof y importe l'ics d'ED ou le saisit). */
function lireAgendaGoogle(id) {
  var agenda;
  try { agenda = CalendarApp.getCalendarById(String(id).trim()); }
  catch (err) {
    return { ok: true, url: "", mode: "erreur", evenements: [],
             erreur: "Agenda Google illisible : " + (err && err.message ? err.message : err) };
  }
  if (!agenda)
    return { ok: true, url: "", mode: "erreur", evenements: [],
             erreur: "Agenda Google introuvable (identifiant incorrect, ou agenda non partagé avec le compte qui exécute le script)." };

  var min = new Date(); min.setHours(0, 0, 0, 0); min.setDate(min.getDate() - EDT_JOURS_AVANT);
  var max = new Date(); max.setHours(23, 59, 59, 999); max.setDate(max.getDate() + EDT_JOURS_APRES);
  var seances = agenda.getEvents(min, max).map(function (ev) {
    var journee = ev.isAllDayEvent();
    var debut = ev.getStartTime(), fin = ev.getEndTime();
    return {
      jour: Utilities.formatDate(debut, fuseau(), "yyyy-MM-dd"),
      debut: journee ? "" : Utilities.formatDate(debut, fuseau(), "HH:mm"),
      fin: journee ? "" : Utilities.formatDate(fin, fuseau(), "HH:mm"),
      titre: String(ev.getTitle() || "Cours").slice(0, 120),
      salle: String(ev.getLocation() || "").slice(0, 60),
      journee: journee
    };
  });
  seances.sort(function (a, b) { return a.jour === b.jour ? a.debut.localeCompare(b.debut) : a.jour.localeCompare(b.jour); });
  if (!seances.length)
    return { ok: true, url: "", mode: "icsVide", maj: Date.now(), evenements: [],
             erreur: "L'agenda Google « " + agenda.getName() + " » ne contient aucun cours sur la période." };
  return { ok: true, url: "", mode: "ics", source: "google", maj: Date.now(), evenements: seances.slice(0, 400) };
}

/** Bouton « Tester l'agenda » (prof) : dit exactement ce que le serveur reçoit, sans cache. */
function diagnostiquerEdt() {
  var url = lireDivers("edtUrl");
  if (!url) return { ok: true, url: "", type: "vide", message: "Aucune adresse enregistrée." };
  if (estAgendaGoogle(url)) {
    var r = lireAgendaGoogle(url);
    return { ok: true, url: url, type: "google", nbEvenements: (r.evenements || []).length,
             message: r.erreur || ((r.evenements || []).length + " cours lus dans l'agenda Google.") };
  }
  if (!estFluxIcs(url)) return { ok: true, url: url, type: "lien", message: "Lien web simple : les élèves voient un bouton d'ouverture." };
  try {
    var http = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true, followRedirects: true,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
                 "Accept": "text/calendar, text/plain, */*" }
    });
    var texte = http.getContentText();
    var nb = (texte.match(/BEGIN:VEVENT/g) || []).length;
    return { ok: true, url: url, type: "ics", code: http.getResponseCode(), taille: texte.length,
             nbVevent: nb, extrait: texte.slice(0, 300),
             message: "HTTP " + http.getResponseCode() + " · " + texte.length + " caractères · " + nb + " événement(s) dans le flux." };
  } catch (err) {
    return { ok: true, url: url, type: "ics", message: "Flux injoignable : " + (err && err.message ? err.message : err) };
  }
}

/** Décode un fichier iCalendar en séances normalisées {jour, debut, fin, titre, salle, journee}. */
function analyserIcs(texte) {
  var lignes = String(texte).replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n"); // dépliage RFC 5545
  var bruts = [], courant = null;
  for (var i = 0; i < lignes.length; i++) {
    var ligne = lignes[i];
    if (ligne.indexOf("BEGIN:VEVENT") === 0) { courant = { exclus: [] }; continue; }
    if (ligne.indexOf("END:VEVENT") === 0) { if (courant && courant.debut) bruts.push(courant); courant = null; continue; }
    if (!courant) continue;
    var sep = ligne.indexOf(":");
    if (sep === -1) continue;
    var entete = ligne.slice(0, sep), valeur = ligne.slice(sep + 1);
    var cle = entete.split(";")[0].toUpperCase();
    if (cle === "DTSTART") { courant.debut = dateIcs(valeur); courant.journee = /VALUE=DATE(;|:|$)/i.test(entete) || valeur.length === 8; }
    else if (cle === "DTEND") courant.fin = dateIcs(valeur);
    else if (cle === "SUMMARY") courant.titre = detexteIcs(valeur);
    else if (cle === "LOCATION") courant.salle = detexteIcs(valeur);
    else if (cle === "RRULE") courant.rrule = valeur;
    else if (cle === "EXDATE") valeur.split(",").forEach(function (v) {
      var d = dateIcs(v); if (d) courant.exclus.push(Utilities.formatDate(d, fuseau(), "yyyy-MM-dd"));
    });
  }

  var min = new Date(); min.setHours(0, 0, 0, 0); min.setDate(min.getDate() - EDT_JOURS_AVANT);
  var max = new Date(); max.setHours(23, 59, 59, 999); max.setDate(max.getDate() + EDT_JOURS_APRES);

  var seances = [];
  bruts.forEach(function (ev) {
    var duree = (ev.fin && ev.debut) ? (ev.fin.getTime() - ev.debut.getTime()) : 3600000;
    developperIcs(ev, min, max).forEach(function (debut) {
      var jour = Utilities.formatDate(debut, fuseau(), "yyyy-MM-dd");
      if (ev.exclus.indexOf(jour) !== -1) return;
      var fin = new Date(debut.getTime() + duree);
      seances.push({
        jour: jour,
        debut: ev.journee ? "" : Utilities.formatDate(debut, fuseau(), "HH:mm"),
        fin: ev.journee ? "" : Utilities.formatDate(fin, fuseau(), "HH:mm"),
        titre: String(ev.titre || "Cours").slice(0, 120),
        salle: String(ev.salle || "").slice(0, 60),
        journee: !!ev.journee
      });
    });
  });
  seances.sort(function (a, b) { return a.jour === b.jour ? a.debut.localeCompare(b.debut) : a.jour.localeCompare(b.jour); });
  return seances.slice(0, 400);
}

/** Occurrences d'un VEVENT dans la fenêtre. Récurrences gérées : FREQ=DAILY/WEEKLY (+INTERVAL, BYDAY, COUNT, UNTIL). */
function developperIcs(ev, min, max) {
  if (!ev.rrule) return (ev.debut >= min && ev.debut <= max) ? [ev.debut] : [];
  var regles = {};
  ev.rrule.split(";").forEach(function (p) { var kv = p.split("="); regles[kv[0].toUpperCase()] = kv[1]; });
  var freq = String(regles.FREQ || "").toUpperCase();
  if (freq !== "WEEKLY" && freq !== "DAILY") return (ev.debut >= min && ev.debut <= max) ? [ev.debut] : [];
  var intervalle = parseInt(regles.INTERVAL || "1", 10) || 1;
  var jusqua = regles.UNTIL ? dateIcs(regles.UNTIL) : null;
  var total = regles.COUNT ? parseInt(regles.COUNT, 10) : 0;
  var codes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  var byday = regles.BYDAY ? regles.BYDAY.split(",").map(function (s) { return s.slice(-2).toUpperCase(); }) : null;

  var occurrences = [], compte = 0, curseur = new Date(ev.debut), depart = new Date(ev.debut);
  depart.setHours(0, 0, 0, 0);
  for (var garde = 0; garde < 800; garde++) {
    if (jusqua && curseur > jusqua) break;
    if (total && compte >= total) break;
    if (curseur > max) break;
    var jourZero = new Date(curseur); jourZero.setHours(0, 0, 0, 0);
    var ecart = Math.round((jourZero - depart) / 86400000);
    var retenu = freq === "DAILY"
      ? ecart % intervalle === 0
      : (Math.floor(ecart / 7) % intervalle === 0) && (byday ? byday.indexOf(codes[curseur.getDay()]) !== -1 : curseur.getDay() === ev.debut.getDay());
    if (retenu) {
      compte++;
      if (curseur >= min) occurrences.push(new Date(curseur));
    }
    curseur.setDate(curseur.getDate() + 1);
  }
  return occurrences;
}

/** « 20260901T080000Z », « 20260901T080000 » ou « 20260901 » -> Date. */
function dateIcs(valeur) {
  var m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(String(valeur).trim());
  if (!m) return null;
  var an = +m[1], mois = +m[2] - 1, jour = +m[3], h = +(m[4] || 0), mn = +(m[5] || 0), s = +(m[6] || 0);
  if (m[7]) return new Date(Date.UTC(an, mois, jour, h, mn, s));   // UTC explicite
  return new Date(an, mois, jour, h, mn, s);                        // heure locale (TZID ou flottante)
}

function detexteIcs(valeur) {
  return String(valeur).replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\").trim();
}

function fuseau() {
  return Session.getScriptTimeZone();
}

function feuille(nom) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nom);
}
