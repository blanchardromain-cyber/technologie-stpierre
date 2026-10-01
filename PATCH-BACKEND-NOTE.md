# Patch backend — la note du professeur atteint le classeur

À appliquer dans l'éditeur Apps Script du classeur des soumissions, **par recherche
d'ancre** (Ctrl+F), comme `PATCH-BACKEND-VERROU.md`. Six modifications. Le fichier
`apps-script-backend.gs` du dépôt porte déjà le patch et sert de référence.

## Le défaut

Le serveur n'écrit que les clés listées dans `COLUMNS`. Le classeur n'a **aucune**
colonne `appreciation`, `bareme`, `adjustedScore`, `adjustedPts` ni `scoreBrut` : ligne 1
relevée le 1er octobre 2026, elle s'arrête à `lockedBy`. Tout ce que la page
professeur envoie en notant (`saveEvalAdj`, `saveP11Ex2Adj`…) est donc abandonné en
silence, puisque l'envoi part en `no-cors` et que personne ne lit la réponse.

Preuve en lecture seule : la copie `p11-ex1` du compte de test revient de l'action `own`
au statut *validée*, mais sans note ni appréciation.

Conséquences :
- **Règle 5 cassée.** L'élève ne voit sa note que s'il travaille dans le navigateur où
  vous avez noté, parce que les deux sessions partagent le même `localStorage`. Sur sa
  tablette ou chez lui, rien ne redescend.
- **Un autre poste du professeur** reçoit le statut « validée », sans la note.
- Le barème et le score brut envoyés par l'élève avec une copie P11 sont perdus eux aussi.
- Une partie des notes survit malgré tout, parce que P11 ex2 et le devoir commun la
  recopient aussi dans `score` / `qcmTot`. Les évaluations notées par `saveEvalAdj`,
  elles, perdent tout sauf le statut.

## Ce que fait le patch

| Envoi | Effet sur les 5 colonnes de correction |
|---|---|
| Professeur (`_parProf`), clé présente | écrite (une valeur vide **efface**) |
| Professeur, clé **absente** de l'envoi | **valeur en place gardée** : un second poste qui ne connaît pas encore la note ne l'efface pas |
| Élève, copie ouverte | ligne remplacée en entier : un renvoi est un nouveau travail, statut « en attente », l'ancienne note disparaît |
| Élève, copie verrouillée | refusé, comme avant (`locked`) |

`adjustedPts` est un objet : il est stocké en JSON dans la colonne `adjustedPts_json` et
réhydraté à la lecture, comme `fields_json`. Les lectures `list` et `own` renvoient donc
`adjustedPts` sous forme d'objet, ce qu'attendent `index.html` et les pages en iframe
(évaluations P11 et bâtiment). `META_ELEVE` contenait déjà ces cinq champs : une copie
verrouillée fera aussi redescendre la note.

**Aucun changement d'`index.html`** : la page envoie et lit déjà ces champs.

## Ordre de déploiement

1. **Appliquer les 6 modifications**, enregistrer, puis *Déployer › Gérer les déploiements ›
   ✏️ › Version : Nouvelle version › Déployer* (l'URL `/exec` ne change pas).
2. **Contrôle** : dans l'éditeur, choisir `diagnosticColonnes` puis *Exécuter* (§6). Le
   journal d'exécution doit afficher `OK : 25 colonnes conformes a COLUMNS`. Les cinq
   dernières colonnes de la ligne 1 sont alors `appreciation`, `bareme`, `adjustedScore`,
   `adjustedPts_json`, `scoreBrut`. Notez ensuite une copie de votre compte de test : sa
   ligne doit porter la note.
3. **Rattrapage** (facultatif, voir plus bas) : renvoyer les notes déjà posées, depuis le
   poste où vous les avez posées.

**Retour arrière** : redéployer la version précédente (*Gérer les déploiements › Version*).
Les cinq colonnes restent dans le classeur ; l'ancienne version les ignore.

## Les six modifications

Les modifications 1 à 5 corrigent le défaut ; la 6 ajoute un contrôle.

### 1. `COLUMNS` — cinq colonnes EN FIN de liste, après le verrou

Chercher `var COLUMNS = [`. Sa dernière ligne est `'locked', 'lockedAt', 'lockedBy'`
(la même suite de mots revient plus bas dans `_upsert`, qui se traite au §4). Remplacer
cette ligne et le `];` qui suit par :

```js
  'locked', 'lockedAt', 'lockedBy',
  // NOTE — correction du professeur, ajoutee EN FIN (apres le verrou, sans le scinder).
  // adjustedPts est un objet : stocke en JSON dans adjustedPts_json, comme fields_json.
  'appreciation', 'bareme', 'adjustedScore', 'adjustedPts_json', 'scoreBrut'
];

// NOTE — Cles de correction du payload. Un envoi du professeur qui n'en porte pas une
// garde la valeur en place (poste pas encore a jour) ; un renvoi d'eleve les remplace.
var NOTE_PROF = ['appreciation', 'bareme', 'adjustedScore', 'adjustedPts', 'scoreBrut'];
```

Ne rien insérer **entre** `locked`, `lockedAt` et `lockedBy` : l'action `lock` exige ces
trois colonnes consécutives (sinon `colonnes_verrou_absentes`).

### 2. `doPost` — sérialiser `adjustedPts`, repérer les clés absentes

Dans le `COLUMNS.map(function (col) { … })` qui construit `row`, chercher
`if (col === 'locked' || col === 'lockedAt' || col === 'lockedBy') return '';` et coller
**juste en dessous** :

```js
      // NOTE — l'objet des points ajustes voyage en JSON, comme fields.
      if (col === 'adjustedPts_json') {
        return sub.adjustedPts ? JSON.stringify(sub.adjustedPts) : '';
      }
```

Puis, juste **après** le `});` qui ferme ce `COLUMNS.map`, coller :

```js
    // NOTE — colonnes de correction absentes d'un envoi du professeur : _upsert les recopie.
    var garder = sub._parProf !== true ? [] : NOTE_PROF.filter(function (k) {
      return !(k in sub);
    }).map(function (k) { return k === 'adjustedPts' ? 'adjustedPts_json' : k; });
```

### 3. `doPost` — passer la liste à `_upsert`

Chercher `var wasNew = _upsert(sheet, sub.eid, sub.cap, row, sub._parProf === true);` et
remplacer par :

```js
    var wasNew = _upsert(sheet, sub.eid, sub.cap, row, sub._parProf === true, garder);
```

### 4. `_upsert` — recopier les colonnes gardées

Chercher `function _upsert(sheet, eid, cap, row, parProf) {` et remplacer par :

```js
function _upsert(sheet, eid, cap, row, parProf, garder) {
```

Dans la même fonction, chercher `['locked', 'lockedAt', 'lockedBy'].forEach(function (c) {`
et remplacer par :

```js
        // NOTE — + les colonnes de correction que l'envoi du professeur ne porte pas.
        ['locked', 'lockedAt', 'lockedBy'].concat(garder || []).forEach(function (c) {
```

### 5. `_toutesLesSubs` — réhydrater `adjustedPts`

Chercher `delete obj.fields_json;` et coller **juste en dessous** :

```js
    // NOTE — Re-hydrate adjustedPts (illisible : ignore, la copie reste lisible)
    if (obj.adjustedPts_json) {
      try { obj.adjustedPts = JSON.parse(obj.adjustedPts_json); } catch (er) {}
    }
    delete obj.adjustedPts_json;
    // NOTE — correction vide = cle ABSENTE, comme avant ces colonnes : la page teste
    // « adjustedScore !== undefined » ; un "" la faisait planter (p11x1Fmt("")).
    NOTE_PROF.forEach(function (k) { if (obj[k] === '') delete obj[k]; });
```

> **Incident du 1er octobre 2026** — la première version déployée de ce patch n'avait
> pas la dernière ligne. Une copie non notée revenait alors avec `adjustedScore: ""`. La
> page professeur, qui teste « `!== undefined` », la croyait notée : `p11x1Fmt("")`
> plantait et le tableau des soumissions restait vide, avec des compteurs justes. Une
> correction vide doit rester **absente** de la copie, comme avant l'ajout des colonnes.
> Le contrôle 7b du test le vérifie avec le vrai `p11x1Fmt` d'`index.html`.

### 6. `diagnosticColonnes` — contrôle des en-têtes depuis l'éditeur

Coller cette fonction **au-dessus** du commentaire `/* Renvoie true si nouvelle ligne` qui
précède `_upsert` :

```js
// NOTE — A lancer depuis l'editeur (Executer › diagnosticColonnes), resultat dans le
// journal d'execution : en-tetes reels de la ligne 1 compares a COLUMNS. Ecrit les
// en-tetes manquants (comme tout appel), ne modifie aucune donnee.
function diagnosticColonnes() {
  var sheet = _getSheet();
  var h = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var ecarts = [];
  COLUMNS.forEach(function (c, j) { if (h[j] !== c) ecarts.push('col ' + (j + 1) + ' : attendu ' + c + ', lu ' + h[j]); });
  for (var j = COLUMNS.length; j < h.length; j++) ecarts.push('col ' + (j + 1) + ' en trop : ' + h[j]);
  console.log('Ligne 1 : ' + h.join(' | '));
  console.log(ecarts.length ? 'ECARTS :\n' + ecarts.join('\n') : 'OK : ' + COLUMNS.length + ' colonnes conformes a COLUMNS');
  return ecarts;
}
```

Un écart signalé veut dire qu'une cellule de la ligne 1 portait déjà un autre nom.
`_assurerEntetes` ne l'écrase jamais, et la colonne attendue n'est alors pas lue sous le
bon nom. Renommer l'en-tête à la main, ou me transmettre le journal.

## Rattrapage des notes déjà posées

Les notes posées avant le patch n'existent que dans le navigateur où vous avez noté. Pour
les envoyer au classeur, **après le déploiement**, ouvrez le site **sur ce poste**,
connectez-vous en professeur, ouvrez la console (F12) et collez :

<!-- rattrapage : ce bloc est exécuté par outils/test_backend_note.js -->
```js
(async function (ENVOYER) {
  var cle = localStorage.getItem("prof_api_key");
  var url = APPS_SCRIPT_URL + "?action=list&secret=" + encodeURIComponent(SYNC_SECRET) +
            (cle ? "&key=" + encodeURIComponent(cle) : "");
  var rep = await (await fetch(url)).json();
  if (!rep.ok) { console.warn("Lecture refusée :", rep.error); return; }
  var serveur = {};
  rep.subs.forEach(function (s) { serveur[s.eid + "::" + s.cap] = s; });
  // Seulement : notée ici, sans note au classeur, et MÊME travail (même dateISO) —
  // une copie renvoyée depuis par l'élève n'est pas écrasée par votre ancienne version.
  var aRenvoyer = getSubs().filter(function (s) {
    var d = serveur[s.eid + "::" + s.cap];
    return s.adjustedScore !== undefined && s.adjustedScore !== "" && !!d &&
      (d.adjustedScore === undefined || d.adjustedScore === "") &&
      Math.abs(new Date(d.dateISO) - new Date(s.dateISO)) < 1000;
  });
  console.table(aRenvoyer.map(function (s) {
    return { eleve: s.ename, capsule: s.cap, note: s.adjustedScore + "/" + (s.bareme || "?") };
  }));
  if (ENVOYER) aRenvoyer.forEach(function (s) { cloudSync.send(s); });
  return aRenvoyer.length + (ENVOYER ? " copie(s) renvoyée(s)" : " copie(s) à renvoyer");
})(false);
```

Ce premier passage **n'envoie rien** : il affiche la liste des copies concernées. Si elle
est juste, recollez le bloc en remplaçant la dernière ligne par `})(true);`. Faites-le
sur chaque poste où vous avez noté. Une copie déjà rattrapée ailleurs n'apparaît plus,
puisque le classeur a alors sa note.

## Test hors Google

`outils/test_backend_note.js` charge le **vrai** `apps-script-backend.gs` dans un faux
Google (classeur en mémoire, initialisé avec les 20 en-têtes réels), puis passe la
réponse `own` à la **vraie** fusion élève d'`index.html` (`checkStudentStatusChanges`,
`estCorrigee`). Il exécute aussi le bloc de rattrapage ci-dessus, tel qu'il est écrit
dans ce document. Aucun accès réseau.

```
…\Python312\Lib\site-packages\playwright\driver\node.exe outils/test_backend_note.js
```

Il vérifie aussi `diagnosticColonnes()`, et que le secret du `.gs` est égal à
`SYNC_SECRET` d'`index.html`, sans afficher sa valeur.

Sur le backend d'avant le patch, 27 contrôles sur 45 passent : les échecs sont les
symptômes décrits plus haut (rattrapage compris, faute de colonne où écrire) et
l'absence du diagnostic. La première version déployée, sans la ligne de l'incident,
plante sur le contrôle 7b (38/45). La version actuelle passe les 45.

## Limites connues

- Le faux classeur garde les valeurs telles quelles. Le vrai interprète certaines
  chaînes : `date` revient déjà converti en date, ce qui ne gêne rien. Une appréciation
  réduite à une fraction comme « 3/4 » pourrait devenir une date ; une phrase, non.
- **Côté page professeur — corrigé le 1er octobre 2026 (build 2026-10-01c).** Jusque-là,
  une copie déjà tranchée sur un poste y gardait sa version locale entière : une note posée
  sur un autre poste n'apparaissait jamais, et un clic ✅ depuis un poste resté avec une
  note vide l'effaçait au classeur. Désormais, à la synchronisation (`cloudSync.pull`) :
  1. si l'élève a renvoyé son travail depuis (`dateISO` plus récente au classeur), la copie
     du classeur remplace tout — le travail refait après « à revoir » réapparaît ;
  2. une copie locale plus récente, encore en file d'attente, ou envoyée depuis ce poste il
     y a moins de 2 minutes, garde sa version ;
  3. sinon, le classeur fait foi pour le statut et les cinq champs de correction, **sauf
     valeur absente** : une note connue de ce seul poste (posée avant le patch) reste.

  Et ✅ / ❌ (`updSub`) n'envoient plus que le statut : le classeur garde la note en place.
  `outils/test_fusion_prof.js` le vérifie avec deux postes simulés (16 contrôles ; le code
  d'avant en échoue 6). Ce qui reste possible :
  - deux postes qui **enregistrent une note** sur la même copie à quelques minutes d'écart,
    le second sans s'être resynchronisé : le dernier enregistrement l'emporte ;
  - effacer une appréciation sur un poste n'efface pas celle des autres postes, qui
    gardent leur valeur locale (règle 3) ;
  - une note enregistrée hors ligne sur l'ancienne copie repart à la reconnexion, même si
    l'élève a renvoyé son travail entre-temps (inchangé) ;
  - la règle 1 suppose que le classeur rend `dateISO` tel quel (seul `date` est connu pour
    revenir converti, voir plus haut) ; à vérifier sur une copie du compte de test.
- Le secret de synchronisation étant public, rien n'empêche techniquement d'écrire une
  fausse note avec un envoi forgé. C'est la limite déjà connue (vérification serveur,
  étape 3 de la sécurité).
