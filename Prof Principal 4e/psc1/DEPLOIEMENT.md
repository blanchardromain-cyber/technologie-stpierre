# PSC1 4G — guide de déploiement

Même montage que le Hub (`../hub-classe/DEPLOIEMENT.md`), en plus court :

1. **Classeur** : créer un Google Sheet privé `PSC1 4G` → Apps Script → coller
   `apps-script/Code.gs` → exécuter `initialiser` → coller dans l'onglet **Codes**
   les colonnes `code · pseudo · role` de `../donnees/codes-eleves-4G.csv`
   (**mêmes codes que le Hub** : une seule carte par élève).
2. **Déployer** : application Web · exécuter en tant que : moi · accès : tout le monde
   → copier l'URL dans `BACKEND_URL` de `index.html`.
3. **Publier** : déposer `index.html` dans un dépôt Pages (soit un dépôt dédié `psc1-4g`,
   soit un sous-dossier du dépôt `hub-4g`).
4. **Ouvrir les dates** : se connecter avec le code `PROF-…` → « Ajouter une date »
   (mercredis, capacité 2 par défaut, modulable). Les dates se dévoilent au fil de l'année (D4).

Mode démo tant que `BACKEND_URL` est vide : codes `DEMO1/DEMO2/DEMO3` (élèves), `PROF1` (prof).

## Partage avec la responsable de niveau (synchronisation automatique)

Objectif : la responsable voit les inscriptions **en continu**, sans accéder au classeur
maître (qui contient les codes). Le partage du nouveau Sheet reste **manuel**, comme convenu.

1. Créer dans ton Drive un Sheet **« PSC1 4G — suivi »** (indépendant).
2. En cellule **A1** de la première feuille, coller (en remplaçant l'URL par celle de TON
   classeur maître PSC1) :
   `=IMPORTRANGE("https://docs.google.com/spreadsheets/d/ID_DU_CLASSEUR_PSC1"; "Inscriptions!A:F")`
3. Cliquer sur **Autoriser l'accès** (demandé une seule fois).
4. Optionnel — les dates aussi, en feuille 2 : `=IMPORTRANGE("…"; "Sessions!A:D")`.
5. **Partager ce Sheet-là** (lecture seule) avec la responsable de niveau — et elle seule.

Toute nouvelle inscription apparaît automatiquement (délai Google : quelques secondes à
quelques minutes). Aucun code élève ne transite : l'onglet Codes n'est pas importé.

## Règles embarquées (décision D4)
- Un élève (ou son binôme) **s'inscrit une seule fois** dans l'année ; double inscription bloquée côté serveur.
- **Aucune désinscription élève** — seul le prof peut retirer un binôme (bouton « retirer »).
- Confirmation explicite avant validation (« définitif, vous êtes d'accord tous les deux ? »).
- Les codes personnels des autres élèves ne sont jamais exposés (choix du binôme par pseudonyme).
- Une date fermée disparaît pour les élèves mais conserve ses inscrits.
