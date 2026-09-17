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

## 4. Emploi du temps de la classe (onglet 📅 EDT) — mise en service le **mardi 1er septembre 2026**

L'onglet est déjà en place mais **programmé** : `const EDT_ACTIVATION = "2026-09-01"` dans `index.html`.
Avant cette date, seuls les profs le voient (bandeau « onglet programmé ») ; le 1er septembre il
apparaît automatiquement pour les élèves, sans rien modifier.

**Le jour J, une seule manipulation :**

1. Dans **EcoleDirecte**, ouvrir l'agenda de la 4G → *Exporter / S'abonner à l'agenda* → copier l'adresse.
2. Dans le Hub, se connecter avec le code `PROF-…` → onglet **📋 Classe** → carte
   **📅 Emploi du temps de la classe** → coller l'adresse → **Enregistrer**.
3. Vérifier avec **Voir l'onglet EDT** (puis avec un code élève).

**Deux types d'adresse acceptés :**

| Adresse fournie par EcoleDirecte | Ce que voient les élèves |
| --- | --- |
| flux **iCalendar** (`.ics`, « ical », `format=ics`) | la **grille des cours** dans le Hub (jour par jour, salle, cours en cours surligné) |
| **lien web** classique | un bouton « Ouvrir l'emploi du temps » (ED demandera leur connexion) |

**Prérequis backend** (sinon l'onglet affiche « backend à mettre à jour ») :

- recoller `apps-script/Code.gs`, exécuter `initialiser()`, puis « Gérer les déploiements → Nouvelle version » ;
- **Projet Apps Script → Paramètres → fuseau horaire = `Europe/Paris`** (sinon les heures de cours sont décalées) ;
- le flux `.ics` est lu **par le serveur** (le navigateur des élèves ne le peut pas : CORS) et mis en cache 30 min —
  une modification d'emploi du temps peut donc mettre jusqu'à une demi-heure à apparaître (le lien
  « 🔄 rafraîchir » de l'onglet ne contourne pas ce cache, il relit la réponse du serveur).
- si l'adresse `.ics` d'ED contient un jeton personnel, elle reste **dans le Sheet privé** : les élèves ne la voient
  jamais, seule la grille décodée leur est envoyée. Un lien web simple, lui, est affiché tel quel.

Repli si le backend n'est pas à jour le jour J : renseigner `const EDT_LIEN_SECOURS = "https://…"`
dans `index.html` (lien web vers l'agenda) — l'onglet affichera au moins le bouton d'ouverture.

## Rappels sécurité / RGPD

- Le dossier `donnees/` (codes ↔ noms complets) ne part **jamais** en ligne (gitignore).
- Le Sheet ne contient que `code · pseudo · role` — aucun nom de famille.
- Élève : voit les pseudonymes, ne peut ni supprimer ni écrire en privé.
- Prof (code `PROF-…`) : annonces, masquer/rétablir, signalements, tout voir.
- Filtre anti-insultes côté page **et** côté serveur ; taille des messages plafonnée.
- En cas de code élève compromis : changer la ligne dans l'onglet Codes, refaire une carte.

## 5. Diagnostic du 3 septembre 2026 — pourquoi l'onglet EDT reste vide

**Le Hub n'est pas en cause, le flux EcoleDirecte est vide.** Vérification faite directement
sur l'adresse enregistrée (`api.ecoledirecte.com/v3/ical/W/431/…​.ics`) :

```
HTTP 200 · content-type: text/calendar · 77 octets

BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//www.ecoledirecte.com
END:VCALENDAR
```

Le fichier est un iCalendar valide qui **ne contient aucun VEVENT** : zéro cours. Le Hub le lit
correctement et n'a donc rien à afficher. Ce n'est ni un problème de CORS, ni le cache de 30 min,
ni le déploiement Apps Script (`access-control-allow-origin: *` est même présent, et la même
réponse vide arrive avec ou sans paramètres de dates).

À vérifier côté EcoleDirecte : l'export « S'abonner à l'agenda » d'une classe exporte l'**agenda**
(événements saisis à la main), pas la grille des cours. Il faut soit trouver l'export du véritable
emploi du temps dans l'espace professeur, soit passer par le repli ci-dessous.

### Corrections apportées au Hub (v2.7)

- **`Code.gs`** : en-têtes navigateur sur l'appel du flux ; détection explicite d'un flux valide
  mais vide (`mode: "icsVide"`) au lieu d'un onglet muet ; « 🔄 rafraîchir » court-circuite
  vraiment le cache serveur (`frais: true`) ; nouvelle action **`diagnostiquerEdt`** ; support
  d'un **agenda Google** comme source (`lireAgendaGoogle`).
- **`index.html`** : message clair « Emploi du temps pas encore publié » ; bouton
  **🔎 Tester l'agenda** dans l'onglet 📋 Classe (affiche code HTTP, taille, nombre d'événements
  et début de la réponse) ; le champ accepte désormais un identifiant d'agenda Google.

Après recollage du `Code.gs` : `initialiser()` puis **Gérer les déploiements → Nouvelle version**.

### Repli : un agenda Google comme source vivante

Il donne un emploi du temps **évolutif** toute l'année, sans dépendre du flux d'ED.

1. `calendar.google.com` → créer un agenda **« 4G — Emploi du temps »** (avec le compte Google
   qui exécute l'Apps Script, sinon le partager avec lui en « Voir tous les détails »).
2. L'alimenter, au choix :
   - **si ED publie un jour un vrai flux de cours** : *Autres agendas → + → À partir de l'URL*
     (Google resynchronise seul, délai propre à Google pouvant aller jusqu'à ~24 h) ;
   - **sinon** : saisir la grille une fois avec des **événements récurrents** (ex. « Technologie,
     mardi 8h–9h, hebdo jusqu'au 3 juillet »), salle dans le champ *Lieu*. Toute modification
     en cours d'année (changement de salle, cours annulé, prof absent) apparaît dans le Hub
     en 30 min maximum — et tout de suite avec « 🔄 rafraîchir ».
3. Paramètres de l'agenda → **Intégrer l'agenda** → copier l'**ID** (`…@group.calendar.google.com`).
4. Hub → code `PROF-…` → onglet **📋 Classe** → *Emploi du temps de la classe* → coller l'ID →
   **Enregistrer** → **🔎 Tester l'agenda** doit répondre « N cours lus dans l'agenda Google ».

### Repli minimal (2 minutes, sans rien installer)

Coller dans le même champ le **lien web** de l'emploi du temps ED : les élèves voient un bouton
« Ouvrir l'emploi du temps » et se connectent avec leur compte ED. Toujours à jour, mais hors du Hub.
