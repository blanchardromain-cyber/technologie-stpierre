# Transmission de session — Couteau Suisse PP 4G

> **Date :** 2026-07-21 · **Usage :** à donner en début de nouvelle conversation
> (« lis `Prof Principal 4e/TRANSMISSION.md` ») pour reprendre sans tout réexpliquer.
> **Documents de référence à lire ensuite :** `PLAN-DIRECTEUR.md` (l'architecture et les
> 23 étapes) et `PLAN-APP-NOMADE.md` (l'app mobile Cockpit PP).

---

## 1. Le projet en 10 lignes

R. Blanchard, professeur de technologie, est **professeur principal de la 4G** (26 élèves,
collège St-Pierre, zone B). Il construit avec Claude un **« Couteau Suisse »** d'outils pour
absorber la charge administrative du rôle, mieux communiquer avec des élèves vus 1-2 h par
semaine, et prévenir les conflits liés aux groupes WhatsApp non régulés.

**Principe d'architecture fondateur :** *un module vit là où ses données ont le droit d'être.*
Quatre tiroirs, un code couleur, et le code couleur EST la discipline RGPD :

| | Tiroir | Où vivent les données | Exemples |
|---|---|---|---|
| 🟩 | Public élèves | GitHub Pages + Apps Script + Sheet, accès par **code élève personnel** | Hub de classe, PSC1, Carnet de bord |
| 🟦 | Privé Drive | Compte Google du prof, partagé équipe si besoin | Registre retenues, Sheet de suivi |
| 🟥 | Local RGPD | **100 % sur la machine**, jamais en ligne | Plan de classe, ménage, trombinoscope, retenue, CR |
| 🟪 | Workflows Claude | Procédures (pas des applis) | Appréciations, HVC, CR de réunion |

**Règle absolue :** aucune donnée nominative sur GitHub. Le dossier `Prof Principal 4e/donnees/`
est exclu par `.gitignore` (dépôt **public** `technologie-stpierre`).

---

## 2. Ce qui existe et tourne

### En ligne (déployé, servi par GitHub Pages)
- **Espace élèves** `…/Prof%20Principal%204e/eleves/` — page d'entrée unique (3 tuiles + QR code),
  c'est le **seul lien à mettre dans le Post-it EcoleDirecte**.
- **Hub de classe** — annonces, entraide modérée, plan de classe publié, planning ménage publié,
  onglet « Moi » (casier + référents absence), admin (jours/horaires d'ouverture, mots interdits).
- **PSC1** — inscriptions par binômes sur les mercredis, sans désinscription possible.
- **Carnet de bord** — report des remarques par l'élève, onglets T1/T2/T3, rendez-vous,
  vue prof avec **filtres et tri façon tableur**, alerte équipe par e-mail.

### Local PC (`Prof Principal 4e/`)
`PORTAIL.html` (point d'entrée, logo du collège) → `outils/plan-de-classe.html`,
`equipes-menage.html`, `trombinoscope.html`, `retenue.html`, `cr-reunion.html`.

> **`cr-reunion.html` — enregistrement audio + résumé IA (🟥 local).** L'outil « CR de réunion »
> enregistre désormais l'audio des entretiens en plus des notes. Barrière RGPD obligatoire :
> le bouton d'enregistrement reste **désactivé** tant que l'enseignant n'a pas coché l'attestation
> de consentement des participants (annonce à lire + mention RGPD dépliables). Multi-séquences
> (un entretien = une séquence nommée), enregistrées via `MediaRecorder` au format compressé natif
> du terminal (`.m4a`/`.webm`, ~1 Mo/min) et **stockées en IndexedDB `cr-reunion-audio`** (survivent
> à un rechargement). Chaque séquence : lecteur + `📤 Envoyer` (partage natif → Drive/mail, sans
> OAuth) + `💾 Enregistrer` + `🗑 Retirer de l'appareil`. Transcription en direct optionnelle
> (Web Speech `fr-FR`, si le navigateur le supporte — Chrome Android ; absente sur iOS Safari →
> l'audio sert d'archive, dictée possible au micro du clavier). La transcription alimente la zone
> `🎧 Transcription` et donc le prompt « résumé IA » (Claude).
>
> **Dépôt Drive automatique (facultatif, 🟦→ Drive du prof).** Bouton `☁️ Déposer sur Drive` par
> séquence + `⚙️ Dépôt Drive auto` pour la config (URL + jeton, stockés en `localStorage`).
> Back-end = Google Apps Script `Prof Principal 4e/outils/depot-drive-cr.gs` (déploiement Web App
> « exécuter en tant que moi / accès tout le monde », jeton partagé anti-abus). Le client POST le
> fichier en base64 avec un corps `text/plain` (défaut fetch d'une chaîne) → pas de préflight CORS
> avec Apps Script ; réponse JSON lisible (ACAO:* via redirection googleusercontent). Limite
> pratique ~40-50 Mo/POST → d'où le découpage en séquences. Sans config, le partage natif 📤 et le
> téléchargement 💾 restent les voies par défaut.
>
> **Deux copies à garder synchrones** (corps + `<script>` identiques) : `pp4g/outils/cr-reunion.html`
> (PWA) et `Prof Principal 4e/outils/cr-reunion.html` (PC) — seuls l'en-tête et le lien retour
> diffèrent. Bump du service worker à la clé (`pp4g/sw.js` → `pp4g-v20`).

### Mobile — « Cockpit PP » (`pp4g/`)
PWA installable (manifest + service worker, verrou PIN, import/export IndexedDB).
Elle **duplique** les outils 🟥 et **pointe** vers les modules en ligne.

### Hors dépôt
- `G:\Mon Drive\…\Appréciation synthèse PP\` — pipeline Python des appréciations
  (protocole `synthesepp://`, tuiles « Génération appréciations » et « Report Appréciations »).
- `Prof Principal 4e/donnees/` — données nominatives (élèves, profs+e-mails, codes, photos).

---

## 3. Ce qui a été fait dans cette conversation (étapes 19 → 23)

1. **Publication du planning ménage sur le Hub** (onglet 🧹), calquée sur le plan de classe —
   l'annonce ne convenait pas (message tronqué par la limite de taille).
2. **Carnet : filtres + tri façon tableur** dans la vue prof, et correction d'un bug de dates
   anglaises qui faussait aussi le classement par trimestre.
3. **Suppression multiple de classes** (cases à cocher) partout où l'on peut en importer :
   plan de classe PC + nomade, et écran ⚙️ Données de Cockpit PP (+ `PP4G.supprimerClasses`).
4. **Guide du tableau de bord simplifié** : l'onglet `Synthèse` se met **dans le classeur Carnet**
   (plus d'IMPORTRANGE, plus d'autorisation).
5. **Deux nouvelles tuiles devenues de vrais outils** : ⚖️ Retenue (générateur des 3 messages +
   report automatique dans le registre) et 📝 CR de réunion (notes horodatées → prompt Claude →
   mail EcoleDirecte d'accompagnement).
6. **Quiz de rentrée refondu** (`suivi-eleves/QUIZ-RENTREE.md`) + **fiche élève dynamique**.
7. **Auto-relance du déploiement Pages** (`.github/workflows/relance-deploiement-pages.yml`).

---

## 4. ⚠️ En attente — à faire par le prof

| # | Action | Où | Pourquoi |
|---|---|---|---|
| 1 | **Exécuter `autoriserRegistre`** dans Apps Script du Hub, accepter l'autorisation, puis **redéployer une nouvelle version** | Sheet Hub 4G | **Bloquant** : sans ça le report des retenues échoue silencieusement (constaté le 21/07). `initialiser` ne déclenche PAS cette autorisation. |
| 2 | Mettre les en-têtes du registre au format **A→H** (`Date · Créneau · Élève · Motif · Matière · Professeur · Travail fourni · Notes PP`) + validation OUI/NON en colonne G | Registre retenues | Le report écrit une ligne par matière |
| 3 | Redéployer le backend **Carnet** + renseigner `emailsEquipe` (vraies adresses) dans l'onglet Config | Sheet Carnet 4G | Active l'alerte équipe |
| 4 | Créer le **Google Form** du quiz + la fiche élève | Sheet de suivi | Voir `QUIZ-RENTREE.md` |
| 5 | **Photos des élèves** dans `donnees/photos/` (`NOM Prénom.jpg`) | PC | Prévu mi-septembre |
| 6 | **Feu vert du chef d'établissement** avant usage élèves réel | — | Volet 🟩 |
| 7 | Aligner le format d'export carnet ↔ pipeline appréciations | G: + Sheet | Le pipeline attend `Nom\|Prénom\|Oublis\|Observations\|Mots signés` |
| 8 | Test de Cockpit PP sur le **vrai téléphone** | Android | Seul reliquat du plan nomade |

---

## 5. Pièges rencontrés — à ne pas refaire

- **Apps Script : coller le code ne suffit pas.** Il faut *Déployer → Gérer les déploiements → ✏️
  → **Nouvelle version***. Sinon l'URL `/exec` sert toujours l'ancien code. Cause n°1 des
  « ça ne marche pas ».
- **Autorisation inter-classeur** : elle n'est demandée que si l'on **exécute** une fonction qui y
  accède (d'où `autoriserRegistre`).
- **Google Sheets convertit silencieusement** « 07:30 » et « 2026-07-06 » en objets Date →
  au retour on obtient du texte anglais (« Sat Dec 30 1899… », « Mon Jul 06 »). Cela a cassé
  successivement les horaires du Hub, les dates PSC1 et le classement par trimestre du Carnet.
  **Réflexe : ne jamais lire une date/heure d'un Sheet sans normaliser** (`new Date(v)` d'abord,
  puis reformater ; forcer les cellules en texte à l'écriture).
- **GitHub Pages échoue régulièrement à l'étape « déploiement »** (le build passe) — c'est
  transitoire. Désormais relancé automatiquement par le workflow.
- **Le cache navigateur** masque les mises à jour : toujours **Ctrl+F5** après un déploiement.
- **EcoleDirecte : aucune écriture possible.** Pas d'API pour publier une appréciation ni pour
  notifier ; le post-it n'accepte qu'un lien statique. Le bouton « Copier » du module
  appréciations ne fait que du presse-papiers, c'est le maximum atteignable.
- **Deux dépôts fantômes** (`hub-4g`, `psc1-4g`) créés au premier déploiement servaient de
  vieilles versions → transformés en **redirections** vers les versions canoniques.

---

## 6. Règles de travail à respecter

- **Les 3 outils 🟥 existent en 2 copies** (`Prof Principal 4e/outils/` = PC, `pp4g/outils/` =
  Cockpit restylé) ainsi que `js/donnees.js`. **Toute modification doit être répercutée sur les
  deux.** La copie Cockpit ne doit **jamais** référencer `../donnees/` (404 en ligne) et garde son
  thème (`cockpit.css`, lien retour). Un script de génération existe dans le scratchpad de session.
- **Ne jamais écraser `pp4g/`** avec la version PC : le chantier nomade a ses propres évolutions.
- **Incrémenter `CACHE_VERSION` dans `pp4g/sw.js`** à chaque ajout/modification de fichier sous
  `pp4g/` (actuellement `pp4g-v17`), et l'ajouter au `PRECACHE`.
- **Décision D5 :** aucun e-mail n'est envoyé automatiquement — Gmail s'ouvre **pré-rempli**.
- **Appréciations :** la base reste **les appréciations des professeurs dans EcoleDirecte**.
  Le carnet de bord et le tableau de bord n'interviennent qu'en **complément**, pour la tonalité,
  et uniquement via des **compteurs** (jamais de verbatim).
- **Vérifier dans le navigateur** avant d'annoncer que ça marche (`preview_start` + le serveur
  `site-techno` sur le port 5500), et **committer** (le prof pousse ou demande à Claude).

---

## 7. Repères techniques

- Dépôt : `technologie-stpierre` (**public**) · site : `https://blanchardromain-cyber.github.io/technologie-stpierre/`
- Code PROF (Hub/PSC1/Carnet/publication) : dans `donnees/codes-eleves-4G.csv`
- Backends Apps Script : un par module (Hub, PSC1, Carnet), URLs `/exec` dans les `index.html`
- Registre retenues : `1lfF5yuwpLlmfDEDmeFx6NkJ7lK7o0Iln1m4aA5DnBJQ`
- Sheet de suivi élèves : `1FH_gq0Q1ngRCZk8kxcrAO5C57hAUitqvgMKdmHnMYnE`
- Python local : `C:\Users\blanchard.romain\AppData\Local\Programs\Python\Python312\python.exe`
  (le `python` du PATH est cassé — WAPT)
- Calendrier zone B 2026-2027 intégré dans l'outil ménage et le programme HVC
