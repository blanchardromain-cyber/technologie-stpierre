# Patch backend — verrou de consultation d'une copie rendue

À appliquer dans l'éditeur Apps Script du classeur des soumissions. Le fichier
`apps-script-backend.gs` du dépôt date du 19 mai : **votre version en production a
divergé** (elle connaît `appreciation`, `bareme`…). Ne la remplacez donc pas en bloc :
appliquez les sept modifications ci-dessous **par recherche d'ancre** (Ctrl+F dans
l'éditeur) : chacune est un morceau du diff, commenté. Un récapitulatif est en fin
de document.

## Ce que fait le patch

| Action | Qui | Effet |
|---|---|---|
| `POST {action:"lock"}` | page professeur | verrouille / déverrouille **n copies en un appel** ; seule écriture des colonnes `locked`, `lockedAt`, `lockedBy` |
| `POST` ordinaire (upsert) | tous | **préserve** le verrou en place ; sur une copie verrouillée, refuse l'envoi s'il ne porte pas `_parProf` (renvoi d'un élève) |
| `GET ?action=own&eid=…` | élève, iframes | ses seules copies ; une copie verrouillée revient **sans son contenu** (statut, note, barème, appréciation seulement) |
| `GET ?action=list` | professeur | inchangé tant que la propriété `PROF_KEY` n'existe pas ; ensuite exige `&key=` |
| `verrous_config` (GET / POST) | page professeur | liste des **capsules armées** : toute copie qui arrive sur une capsule armée **naît verrouillée**. L'écriture exige toujours `PROF_KEY` |

Le nouvel `index.html` fonctionne **avec l'ancien backend** (repli automatique sur
`list`) : l'ordre de déploiement ci-dessous n'a pas de fenêtre de panne.

## Ordre de déploiement

1. **Tester sur une copie** (recommandé, voir « Tester en local »).
2. **Backend de production** : appliquer les 7 modifications, enregistrer, puis
   *Déployer › Gérer les déploiements › ✏️ › Version : Nouvelle version › Déployer*
   (l'URL `/exec` ne change pas). Sans `PROF_KEY`, rien ne change pour personne.
3. **Mise en ligne d'`index.html`** (push, marqueur `build 2026-09-19a`).
4. **Au moins un jour plus tard** (caches des tablettes) : créer la propriété
   `PROF_KEY` — *Paramètres du projet (⚙️) › Propriétés du script › Ajouter* —
   avec une valeur longue et aléatoire. À la synchronisation suivante, la page
   professeur la demande une fois par poste et la garde dans ce navigateur.
   **L'armement d'une capsule (§7) n'est utilisable qu'à partir de cette étape** :
   avancez-la si vous voulez armer une capsule avant une évaluation.

**Retour arrière** : supprimer `PROF_KEY` rouvre `list` instantanément. Le reste se
défait en redéployant la version précédente (*Gérer les déploiements › Version*).

## Les sept modifications

### 1. `COLUMNS` — trois colonnes EN FIN de liste

Chercher `var COLUMNS = [`. Ajouter à la **fin** du tableau (après le dernier nom
existant, sans rien réordonner), puis déclarer `META_ELEVE` juste après le `];` :

```js
  // … derniers noms existants …,
  // VERROU — ajoutées EN FIN de liste. Doivent rester consécutives.
  'locked', 'lockedAt', 'lockedBy'
];

// VERROU — Champs renvoyés à l'élève pour une copie verrouillée (action "own").
var META_ELEVE = [
  'id', 'eid', 'ename', 'ename2', 'ecls', 'cap', 'caplbl', 'date', 'dateISO', 'status',
  'score', 'qcmTot', 'scoreDT', 'scorePR', 'scorePG', 'scoreBrut',
  'adjustedScore', 'adjustedPts', 'bareme', 'appreciation'
];
```

> Si votre production renvoie à l'élève d'autres champs de **correction** (pas de
> réponse), ajoutez-les à `META_ELEVE`. N'y mettez jamais `fields`, `open`, `vf`,
> `assoc` ni aucun champ de réponse.

### 2. `doPost` — action `lock`

Chercher `// === Handler suppression (action:"delete")` et coller **au-dessus** :

```js
    // === VERROU — Handler verrouillage (action:"lock") =====================
    if (body.action === 'lock') {
      var keys = Array.isArray(body.keys) ? body.keys : [];
      if (!keys.length) return _json({ ok: false, error: 'no_keys' });
      var voulu = body.locked === true;
      var quand = voulu ? String(body.at || new Date().toISOString()) : '';
      var par = voulu ? String(body.by || '').replace(/^([=+@])/, ' $1') : '';
      var cibles = {};
      keys.forEach(function (k) { if (k && k.eid && k.cap) cibles[String(k.eid) + '::' + String(k.cap)] = true; });
      var iE = COLUMNS.indexOf('eid'), iC = COLUMNS.indexOf('cap'), iL = COLUMNS.indexOf('locked');
      if (iL < 0 || COLUMNS.indexOf('lockedAt') !== iL + 1 || COLUMNS.indexOf('lockedBy') !== iL + 2) {
        return _json({ ok: false, error: 'colonnes_verrou_absentes' });
      }
      var verrouL = LockService.getScriptLock();
      verrouL.waitLock(20000);
      try {
        var shL = _getSheet();
        var lastL = shL.getLastRow();
        if (lastL < 2) return _json({ ok: true, updated: 0 });
        var dataL = shL.getRange(2, 1, lastL - 1, COLUMNS.length).getValues();
        var n = 0;
        for (var r = 0; r < dataL.length; r++) {
          if (!cibles[String(dataL[r][iE]) + '::' + String(dataL[r][iC])]) continue;
          dataL[r][iL] = voulu; dataL[r][iL + 1] = quand; dataL[r][iL + 2] = par;
          n++;
        }
        // Un seul appel au classeur : les 3 colonnes du verrou, toutes lignes.
        shL.getRange(2, iL + 1, dataL.length, 3)
           .setValues(dataL.map(function (l) { return [l[iL], l[iL + 1], l[iL + 2]]; }));
        return _json({ ok: true, updated: n });
      } finally {
        verrouL.releaseLock();
      }
    }
```

`locked` s'écrit en booléen `TRUE`/`FALSE` explicite : un déverrouillage doit
redescendre à l'élève, une cellule vide ne le ferait pas.

### 3. `doPost` — l'envoi ordinaire ne touche jamais au verrou

Dans le `COLUMNS.map(function (col) { … })` qui construit `row`, juste après le bloc
`if (col === 'fields_json') { … }`, ajouter :

```js
      // VERROU — jamais repris du payload : _upsert recopie la valeur déjà en place.
      if (col === 'locked' || col === 'lockedAt' || col === 'lockedBy') return '';
```

Puis remplacer la ligne `var wasNew = _upsert(sheet, sub.eid, sub.cap, row);` par :

```js
    // VERROU — sub._parProf : envoi fait depuis une session professeur (absent de
    // COLUMNS, donc jamais écrit). Sans lui, une copie verrouillée n'est pas remplacée.
    var wasNew = _upsert(sheet, sub.eid, sub.cap, row, sub._parProf === true);
    if (wasNew === 'locked') return _json({ ok: false, error: 'locked' });
```

Pourquoi `_parProf` et pas « refuser le statut *en attente* » : vous notez souvent
une copie **encore en attente** (note ajustée, appréciation) ; cet envoi part avec
`status: "pending"` et aurait été refusé en silence.

### 4. `_upsert` — préserver le verrou, refuser l'écrasement

Remplacer **toute** la fonction `_upsert` par :

```js
/* Renvoie true si nouvelle ligne (création), false si remplacement (update),
   'locked' si la copie est verrouillée et que l'envoi ne vient pas du professeur.
   VERROU — sous LockService, pour qu'un verrouillage simultané ne soit pas écrasé. */
function _upsert(sheet, eid, cap, row, parProf) {
  var verrou = LockService.getScriptLock();
  verrou.waitLock(20000);
  try {
    var last = sheet.getLastRow();
    if (last < 2) {
      sheet.appendRow(row);
      return true;
    }
    var data = sheet.getRange(2, 1, last - 1, COLUMNS.length).getValues();
    var eidCol = COLUMNS.indexOf('eid');
    var capCol = COLUMNS.indexOf('cap');
    var iL = COLUMNS.indexOf('locked');
    for (var i = 0; i < data.length; i++) {
      if (data[i][eidCol] === eid && data[i][capCol] === cap) {
        var verrouillee = data[i][iL] === true || String(data[i][iL]).toUpperCase() === 'TRUE';
        if (verrouillee && !parProf) return 'locked';
        ['locked', 'lockedAt', 'lockedBy'].forEach(function (c) {
          var k = COLUMNS.indexOf(c); row[k] = data[i][k];
        });
        sheet.getRange(i + 2, 1, 1, COLUMNS.length).setValues([row]);
        return false;
      }
    }
    sheet.appendRow(row);
    return true;
  } finally {
    verrou.releaseLock();
  }
}
```

> Si votre `_upsert` de production fait autre chose que la version du dépôt,
> gardez son code et ajoutez-y seulement : le `LockService`, le paramètre
> `parProf`, le `return 'locked'` et la recopie des trois colonnes avant `setValues`.

### 5. `doGet` — `list` fermée par clé, nouvelle action `own`

a) Déplacer le corps de `list` dans une fonction. Dans `if (p.action === 'list') {`,
**couper** tout ce qui suit la vérification du secret (de `var sheet = _getSheet();`
jusqu'au `return _json({ ok: true, subs: subs });` inclus) et le coller dans une
nouvelle fonction, **hors** de `doGet`, en remplaçant les deux `return _json(…)` :

```js
// VERROU — Corps de l'ancienne action "list", partagé par "list" et "own".
function _toutesLesSubs() {
    var sheet = _getSheet();
    var values = sheet.getDataRange().getValues();
    if (values.length < 2) return [];          // était : return _json({ ok: true, subs: [] });
    // … boucle de conversion ligne → objet, INCHANGÉE (re-hydratation comprise) …
    return subs;                                // était : return _json({ ok: true, subs: subs });
}
```

b) À la place du bloc coupé, dans `list`, après la vérification du secret :

```js
    // VERROU — Liste complète réservée au professeur dès que PROF_KEY existe.
    var cleProf = PropertiesService.getScriptProperties().getProperty('PROF_KEY');
    if (cleProf && p.key !== cleProf) {
      return _json({ ok: false, error: p.key ? 'bad_prof_key' : 'prof_key_required' });
    }
    return _json({ ok: true, subs: _toutesLesSubs() });
  }
```

c) Juste après la fermeture du bloc `list`, avant `return _json({ ok: false, error: 'unknown_action' });` :

```js
  // VERROU — Copies d'UN élève ; copie verrouillée = métadonnées sans le travail.
  if (p.action === 'own') {
    if (p.secret !== SHARED_SECRET) {
      return _json({ ok: false, error: 'bad_secret' });
    }
    if (!p.eid) return _json({ ok: false, error: 'eid_required' });
    var siennes = _toutesLesSubs().filter(function (o) { return String(o.eid) === String(p.eid); });
    return _json({ ok: true, subs: siennes.map(function (o) {
      var verrouille = o.locked === true || String(o.locked).toUpperCase() === 'TRUE';
      if (!verrouille) { delete o.lockedAt; delete o.lockedBy; return o; }
      var m = { locked: true };
      META_ELEVE.forEach(function (k) { if (o[k] !== undefined) m[k] = o[k]; });
      return m;
    }) });
  }
```

Garder `return _json({ ok: false, error: 'unknown_action' });` en dernière ligne de
`doGet` : c'est ce message qui déclenche le repli du site sur l'ancien protocole.

### 6. `_getSheet` — en-têtes des nouvelles colonnes

Dans `_getSheet`, juste avant le `return sheet;` final, ajouter `_assurerEntetes(sheet);`,
puis coller la fonction après `_getSheet` :

```js
// VERROU — Écrit en ligne 1 le nom des colonnes ajoutées (cellules vides seulement ;
// un en-tête existant n'est jamais modifié). Sans en-tête, "list" ignorerait la colonne.
function _assurerEntetes(sheet) {
  var n = COLUMNS.length;
  if (sheet.getMaxColumns() < n) sheet.insertColumnsAfter(sheet.getMaxColumns(), n - sheet.getMaxColumns());
  var h = sheet.getRange(1, 1, 1, n).getValues()[0], change = false;
  for (var j = 0; j < n; j++) {
    if (h[j] === '' || h[j] === null) { h[j] = COLUMNS[j]; change = true; }
  }
  if (change) sheet.getRange(1, 1, 1, n).setValues([h]);
}
```

**Contrôle après déploiement** : la ligne 1 du classeur doit montrer `locked`,
`lockedAt`, `lockedBy` dans les trois dernières colonnes de `COLUMNS`. Si une de ces
cellules portait déjà un autre nom, elle n'est pas écrasée et `lock` répondra
`colonnes_verrou_absentes` : le bilan de la page le signalera (0 verrouillée).

### 7. Armement d'une capsule (onglet « Verrous » de la page professeur)

Une capsule **armée** fait naître verrouillée toute copie qui arrive ensuite. La liste
est une propriété de script : aucune colonne du classeur n'est utilisée.

a) Coller ces trois fonctions **avant** `function _json(obj) {` :

```js
// VERROU — Capsules armées : toute copie qui ARRIVE sur l'une d'elles naît
// verrouillée. La liste est une propriété de script, aucune colonne n'est utilisée.
function _capsArmees() {
  try {
    var v = PropertiesService.getScriptProperties().getProperty('CAPSULES_ARMEES');
    var a = v ? JSON.parse(v) : [];
    return Array.isArray(a) ? a : [];
  } catch (e) { return []; }
}
function _cleProfOk(fournie) {
  var cle = PropertiesService.getScriptProperties().getProperty('PROF_KEY');
  return !cle || fournie === cle;
}
// Pose le verrou sur une ligne EN COURS DE CRÉATION si sa capsule est armée.
function _naissanceVerrouillee(row, cap) {
  if (_capsArmees().indexOf(String(cap)) < 0) return row;
  var iL = COLUMNS.indexOf('locked');
  if (iL < 0) return row;
  row[iL] = true;
  row[iL + 1] = new Date().toISOString();
  row[iL + 2] = 'Verrouillage automatique';
  return row;
}
```

b) Dans `_upsert` (§4), remplacer **les deux** `sheet.appendRow(row);` par :

```js
      sheet.appendRow(_naissanceVerrouillee(row, cap));
```

c) Dans `doPost`, **au-dessus** du handler `lock` ajouté au §2 :

```js
    // === VERROU — Capsules armées (action:"verrous_config") ===============
    if (body.action === 'verrous_config') {
      // Clé EXIGÉE pour écrire, même si PROF_KEY n'est pas encore posée : sinon le
      // secret public suffirait à désarmer une capsule avant l'évaluation.
      var cleA = PropertiesService.getScriptProperties().getProperty('PROF_KEY');
      if (!cleA) return _json({ ok: false, error: 'prof_key_required' });
      if (body.key !== cleA) return _json({ ok: false, error: 'bad_prof_key' });
      var capsA = Array.isArray(body.caps) ? body.caps.map(String) : [];
      PropertiesService.getScriptProperties().setProperty('CAPSULES_ARMEES', JSON.stringify(capsA));
      return _json({ ok: true, caps: capsA });
    }
```

d) Dans `doGet`, **au-dessus** du bloc `own` ajouté au §5c :

```js
  // VERROU — Capsules armées : lecture de la liste (réservée au professeur).
  if (p.action === 'verrous_config') {
    if (p.secret !== SHARED_SECRET) {
      return _json({ ok: false, error: 'bad_secret' });
    }
    if (!_cleProfOk(p.key)) {
      return _json({ ok: false, error: p.key ? 'bad_prof_key' : 'prof_key_required' });
    }
    return _json({ ok: true, caps: _capsArmees() });
  }
```

> **L'armement ne fonctionne qu'une fois `PROF_KEY` créée** (étape 4 du déploiement).
> C'est voulu : sans elle, le secret public suffirait à un élève pour désarmer une
> capsule avant l'évaluation. La page l'explique et n'envoie rien tant que la clé
> manque sur le poste.

Trois choses à savoir, que l'onglet rappelle :

- **armer n'est pas verrouiller** : les copies déjà rendues gardent leur état ;
- **désarmer ne déverrouille pas** les copies déjà verrouillées ;
- une copie envoyée **hors ligne** puis remontée après le désarmement naît ouverte.

## Tester en local sans toucher au classeur de production

La règle 4 reste entière : depuis `localhost`, `cloudSync` n'écrit **jamais** vers
l'URL de production. Pour tester :

1. *Fichier › Créer une copie* du classeur des soumissions (la copie emporte son script).
2. Dans le script de la copie : appliquer le patch, puis *Déployer › Nouveau déploiement ›
   Application Web, accès « Tout le monde »*. Noter l'URL `/exec` **de test**.
3. Servir le site en local, puis dans la console de `http://localhost:…` :
   `localStorage.setItem("apps_script_url_test", "https://script.google.com/macros/s/…/exec")`
   et recharger. La console affiche « Déploiement de TEST : … ». Lectures **et**
   écritures (page et iframes) vont alors vers la copie.
4. Fin des tests : `localStorage.removeItem("apps_script_url_test")`.

L'adresse de test n'est lue que sur une page servie en local, et seulement si elle
commence par `https://script.google.com/` et diffère de l'URL de production.

## Limites connues (à savoir, pas à corriger ici)

- Tant que `PROF_KEY` n'est pas posée, n'importe qui disposant du secret (public dans
  la page) peut encore lire `list`, donc tout le classeur. C'est la situation actuelle.
- Après `PROF_KEY`, `own` reste interrogeable pour n'importe quel identifiant d'élève :
  une copie **non verrouillée** peut être lue par qui connaît `prénom.nom`. Une copie
  verrouillée, jamais. Fermer cela exigerait une vraie authentification serveur.
- Le contenu reste lisible dans le navigateur où l'élève a travaillé (brouillon,
  copie locale) : choix « masquer, ne pas purger ». L'interface l'y rend inaccessible.
- Les capsules externes (réseau, Filius, maison) ne sont pas modifiées : leur renvoi
  d'une copie verrouillée est refusé par le serveur, sans message côté élève
  (envoi `no-cors`).

## Récapitulatif du diff (sur la version du dépôt)

```diff
@@ -28,5 +28,16 @@ var COLUMNS = [
   'cap', 'caplbl', 'score', 'qcmTot',
   'scoreDT', 'scorePR', 'scorePG',
-  'open', 'fields_json', 'status', 'id'
+  'open', 'fields_json', 'status', 'id',
+  'locked', 'lockedAt', 'lockedBy'
+];
+var META_ELEVE = [ … voir §1 … ];
@@ doPost : + action "lock" avant le handler delete (§2)
@@ doPost : row → '' pour locked/lockedAt/lockedBy ; _upsert(…, sub._parProf === true) ; refus 'locked' (§3)
@@ doGet  : list → contrôle PROF_KEY puis _toutesLesSubs() ; + action "own" (§5)
@@ +function _toutesLesSubs() — corps de l'ancien list, `return subs;` (§5)
@@ _getSheet : + _assurerEntetes(sheet) ; +function _assurerEntetes (§6)
@@ _upsert : réécrit avec LockService, parProf, préservation du verrou (§4)
```

Le fichier patché complet (version du dépôt + patch) a été produit et contrôlé
(équilibre des accolades, parenthèses et crochets) ; il sert de référence, pas de
copier-coller intégral, pour la raison donnée en tête de document.
