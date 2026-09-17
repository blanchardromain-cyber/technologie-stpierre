# Conventions du site Technologie — Collège Saint-Pierre

Site élève à capsule unique : presque tout vit dans `index.html`, une application
d'une seule page. Ces règles viennent de pannes réelles, pas de préférences de
style : elles cassent en silence quand on les oublie.

## 1. Un corrigé ne montre pas la préparation de séance

Les élèves accèdent aux corrigés après l'évaluation, avec le code d'accès. Ils n'y
ont rien à lire de ce qui sert à préparer le cours.

**Sont réservés au professeur** — à envelopper dans un `<div class="prof-only">` :

- le paragraphe d'introduction qui parle de *repères de correction* ;
- la partie **Organisation** (modalité, durée, support, code élève) ;
- la partie **Notes techniques** (chemins de fichiers, backend, formats) ;
- la partie **Aménagements pour les élèves à besoins particuliers** — elle range
  les élèves par trouble (« Pour qui : dyslexie, TDAH »), un élève n'a pas à lire
  cela dans son corrigé ;
- toute mention de l'outillage interne. Le mot « (auto-corrigé) » a été retiré
  partout : c'est du jargon de développement, il n'apprend rien à personne.

`.prof-only` est masqué par défaut et révélé par la classe `est-prof` posée sur
`<body>`, que `majClasseProf()` met à jour. **Les comptes enseignants collègues en
font partie** : ils préparent leurs séances comme le compte administrateur.

L'impression d'un corrigé recopie le contenu dans une fenêtre neuve, avec sa
propre feuille de style : le masquage CSS n'y suffit pas. Toute fonction
d'impression de corrigé doit passer par **`_corpsCorrigePourImpression(id)`**, qui
retire les blocs réservés du clone quand l'utilisateur n'est pas professeur.

`verifierCorriges()` liste dans la console, au démarrage d'une session
professeur, les corrigés où un bloc réservé aurait été laissé visible. Une règle
écrite finit par s'oublier ; ce contrôle, non.

## 2. La correction automatique tolère les fautes d'orthographe

`evalMot(reponse, motsAttendus)` renvoie **1** (mot attendu bien écrit), **0,5**
(phonétiquement juste mais mal orthographié) ou **0**. C'est le point d'extension
unique : une capsule évaluée multiplie ses points par `evalMot(...)` au lieu de
tester `evalContient(...)`, et hérite de la règle sans code supplémentaire.

Côté P11, `_p11match` suit la même logique avec une convention de clés
différente : **mot entier** pour le point plein (pluriel toléré), et une clé
terminée par `*` pour accepter un radical (`econom*` accepte « économiser »).
Sans cette exigence du mot entier, « acquérirent » décrochait le point plein
puisqu'il contient « acquerir » — justement la faute à demi-compter.

Le modal affiche les points obtenus à côté du symbole (`≈ 0,5 pt`) : la pastille
seule laissait un doute sur ce qui était réellement compté.

## 3. Google Sheets interprète ce qu'on lui écrit

Le backend Apps Script écrit les valeurs telles quelles. **Toute cellule
commençant par `=`, `+` ou `@` devient une formule** : un résumé démarrant par
`=== PARTIE A ===` revenait en `#ERROR!` et le travail devenait illisible côté
professeur. Les séparateurs s'écrivent `---`, et `sanitizeForSheet()` neutralise
le premier caractère avant tout envoi.

Corollaire : une branche de rendu côté professeur s'active sur `sub.cap` seul,
**jamais** sur `sub.cap && sub.fields`. Une donnée partielle ne doit pas faire
basculer sur l'affichage générique, inexploitable pour un exercice.

## 4. Une page servie en local n'écrit pas dans le classeur de production

Le backend fait un *upsert* sur `(eid + cap)`. Une soumission de test faite depuis
un serveur local, sous le nom d'un élève réel, **remplace sa vraie copie** — sans
aucun signal, l'envoi se faisant en `no-cors`. `cloudSync.send` et
`cloudSync.delete` refusent d'écrire depuis `localhost`, `127.0.0.1`, `::1` ou un
fichier local. La lecture reste permise.

## 5. Le corrigé du professeur redescend jusqu'à l'élève

Le travail ne doit pas circuler dans un seul sens. Une fois la copie validée,
l'élève voit **sa note sur le barème choisi et l'appréciation** : bandeau en tête
de capsule, carte « Mes travaux », et encadré en tête de son export PDF. La
synchronisation rapatrie aussi `bareme`, `score` et `qcmTot` — sans le barème,
l'élève lisait « 27/20 ».

Une appréciation automatique déjà enregistrée reste régénérable
(`apprEstAutomatique()`), sinon elle se fige sur l'ancienne note pendant que les
points continuent de bouger. Un texte rédigé par le professeur est préservé, et
un avertissement signale l'écart s'il mentionne une autre note.

## 6. Ajouter une capsule évaluée

Une capsule se câble à une vingtaine d'endroits d'`index.html` (CSS, pages,
entrée `SEQUENCES_DEF`, `goPage`, badge, `clickAction`, déverrouillage, colonne
score, `openModal`, impression, `capTitles`, export CSV, filtre `fcap`, widget
statistiques, bloc JS, brouillon, auto-save, modules dys). **La liste ne se
reconstitue pas de mémoire** : on l'extrait mécaniquement d'une capsule sœur
(`grep -n "p11-ex1"`), et on applique les modifications par un script qui échoue
si une ancre manque. Un oubli silencieux coûte bien plus cher qu'un script qui
refuse de s'exécuter.

L'impression d'une copie passe par `ficheTitre` / `ficheScoreTexte` /
`ficheReponsesHTML` / `ficheEvalProfHTML` / `ficheCopieHTML` : déclarer la
capsule à ce seul endroit la rend imprimable partout, à l'unité comme en lot.

## 7. Divers

- Les notes s'affichent avec la **virgule décimale française** (`p11x1Fmt`).
- Le marqueur `build AAAA-MM-JJx`, à côté de « Soumissions » dans la page
  professeur, s'incrémente à chaque mise en ligne : il permet de repérer une page
  encore servie depuis le cache du navigateur.
- Les statuts s'affichent en français (`FICHE_STATUTS`), jamais `validated`.
- Aménagements dys : `assets/js/confort-lecture.js` et
  `assets/js/lecture-immersive.js`, portée limitée à la page concernée. Les
  sélecteurs de lecture doivent couvrir les `div` de consigne, et les boutons
  micro porter `data-nolecture` pour que la synthèse vocale ne prononce pas
  l'emoji.
