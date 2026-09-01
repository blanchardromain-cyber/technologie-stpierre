# PSC1 4G — guide de déploiement

Même montage que le Hub (`../hub-classe/DEPLOIEMENT.md`), en plus court :

1. **Classeur** : créer un Google Sheet privé `PSC1 4G` → Apps Script → coller
   `apps-script/Code.gs` → exécuter `initialiser` PUIS `initialiserSessions13`
   (crée d'un coup les 13 sessions numérotées 1 à 13, capacité 2 élèves/session,
   toutes ouvertes) → coller dans l'onglet **Codes** les colonnes `code · pseudo · role`
   de `../donnees/codes-eleves-4G.csv` (**mêmes codes que le Hub** : une seule carte par élève).
2. **Déployer** : application Web · exécuter en tant que : moi · accès : tout le monde
   → copier l'URL dans `BACKEND_URL` de `index.html`.
3. **Publier** : déposer `index.html` dans un dépôt Pages (soit un dépôt dédié `psc1-4g`,
   soit un sous-dossier du dépôt `hub-4g`).
4. **Séance de rentrée** : les 13 sessions sont déjà ouvertes — chaque binôme choisit sa
   session pendant les 3h. Le zoneProf permet d'ajouter une session en plus si besoin
   (numéro + capacité), et de fermer une session (cache aux élèves, garde les inscrits).

Mode démo tant que `BACKEND_URL` est vide : codes `DEMO1/DEMO2/DEMO3` (élèves), `PROF1` (prof).

## Répartition des 25 élèves sur 13 sessions

Capacité par défaut = 2 élèves (1 binôme) par session : 13 sessions × 2 = 26 places pour
25 élèves — largement suffisant, avec 1 place de marge (ou passe la capacité d'une session
à 3 pour un trinôme si un élève reste seul, via le champ « Capacité » du zoneProf).

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
