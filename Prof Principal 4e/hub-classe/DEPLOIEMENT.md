# Hub de classe 4G — guide de déploiement

Même montage que les capsules 5e (GitHub Pages + Apps Script + Google Sheet).
Tant que `BACKEND_URL` est vide dans `index.html`, la page tourne en **MODE DÉMO**
(codes de test : `DEMO1`, `DEMO2` élèves · `PROF1` prof) — parfait pour la
**démonstration au chef d'établissement** avant mise en service réelle.

## 1. Le classeur Google (backend privé)

1. Créer un Google Sheet nommé `Hub 4G` dans le Drive (il reste **privé**, jamais partagé).
2. Extensions → Apps Script → coller le contenu de `apps-script/Code.gs`.
3. Exécuter une fois la fonction `initialiser` (crée les onglets Codes / Messages / Signalements).
4. Dans l'onglet **Codes**, coller les colonnes `code · pseudo · role` du fichier local
   `../donnees/codes-eleves-4G.csv` (⚠️ **sans** la colonne `nom_complet`, qui reste sur ton PC).
5. Déployer → Nouvelle application Web → Exécuter en tant que : **moi** · Accès : **tout le monde**.
6. Copier l'URL de déploiement (`https://script.google.com/macros/s/…/exec`).

## 2. La page (frontend public)

1. Dans `index.html`, coller l'URL dans `const BACKEND_URL = "…"` (le bandeau démo disparaît).
2. Créer un dépôt GitHub public dédié `hub-4g` (comme `reseau-5e`, `filius-5e`…),
   y déposer `index.html`, activer **Pages** (branche main, racine).
3. Tester avec ton code `PROF-…` (dans le CSV local) puis avec un code élève.

## 3. Mise en service

1. **Feu vert du chef d'établissement** (montrer le mode démo + l'architecture : pas de compte,
   pas de message privé, pseudonymes publics, modération PP, hébergement Pages).
2. Déposer le lien + QR code sur l'espace classe **EcoleDirecte**.
3. Distribuer les cartes individuelles : imprimer `../donnees/cartes-codes-4G.html` et découper.
4. Séance HVC « charte de communication » avant l'ouverture aux élèves.

## Rappels sécurité / RGPD

- Le dossier `donnees/` (codes ↔ noms complets) ne part **jamais** en ligne (gitignore).
- Le Sheet ne contient que `code · pseudo · role` — aucun nom de famille.
- Élève : voit les pseudonymes, ne peut ni supprimer ni écrire en privé.
- Prof (code `PROF-…`) : annonces, masquer/rétablir, signalements, tout voir.
- Filtre anti-insultes côté page **et** côté serveur ; taille des messages plafonnée.
- En cas de code élève compromis : changer la ligne dans l'onglet Codes, refaire une carte.
