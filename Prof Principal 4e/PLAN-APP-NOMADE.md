# Plan — « Couteau Suisse PP 4e » en application nomade Android

> **Statut :** N0→N7 livrées et vérifiées (émulation navigateur) le 2026-07-09 ✅ — **reste : test sur le vrai téléphone du prof (voir §9)**. · **Version :** 2.0 · **Date :** 2026-07-09
> **Auteur du plan :** Claude (Fable 5) + R. Blanchard (PP 4e)
> **Usage :** document autoportant, exploitable par un autre modèle sans autre contexte. Lire aussi `PLAN-DIRECTEUR.md` (même dossier) avant toute modification de code.

---

## 0. Résumé exécutif (à lire en premier par le modèle exécutant)

Transformer le Couteau Suisse du Prof Principal 4e (aujourd'hui : portail local + outils HTML locaux + modules en ligne GitHub Pages/Apps Script) en **application installable sur le smartphone Android du professeur**, utilisable **hors connexion**, **sans jamais publier de donnée nominative**.

**Décision d'architecture recommandée : PWA (Progressive Web App)** hébergée sur le site GitHub Pages existant, avec **import des données nominatives directement sur le téléphone** (stockage navigateur local, IndexedDB). Pas d'APK, pas de Play Store, pas de compte développeur, mises à jour par simple `git push`.

**Le point dur n'est pas la PWA elle-même** (manifest + service worker = trivial). Les vrais chantiers sont :
1. le **transfert des données nominatives** PC → téléphone sans passer par GitHub (§4) ;
2. l'**adaptation tactile** des outils 🟥 qui utilisent du drag & drop souris (§5) ;
3. l'**adaptation des écrans** pensés pour un affichage large (plan de classe 30 postes sur un écran de 6 pouces) (§5).

---

## 1. Contexte existant (état au 2026-07-07)

### 1.1 Ce qui existe déjà et fonctionne

| Tiroir | Modules | État mobile actuel |
|---|---|---|
| 🟩 Public élèves | Hub de classe, PSC1, Carnet de bord, Espace élèves | **Déjà utilisables sur mobile** : en ligne (Pages + Apps Script), les élèves y accèdent au téléphone. La vue **prof** de ces modules marche aussi sur mobile (à auditer/polir, pas à refaire). |
| 🟦 Privé Drive | Registre retenues, tableau de bord suivi élèves, planning PSC1 | **Déjà utilisables** via l'appli Google Sheets Android (comptes du collège). Rien à coder, juste des raccourcis. |
| 🟥 Local RGPD | Plan de classe, équipes de ménage, trombinoscope | **Inutilisables sur mobile aujourd'hui** : fichiers HTML ouverts en `file://` sur le PC, données nominatives chargées par `<script src="donnees/eleves-4G.js">`, hors git (`.gitignore` exclut `Prof Principal 4e/donnees/`). C'est le cœur du chantier. |
| 🟪 Workflows Claude | Appréciations, CR, messages, HVC | Passent par l'appli **Claude mobile** ou restent sur PC. Hors périmètre code ; le portail nomade pointe vers les procédures. |

### 1.2 Contraintes non négociables (héritées du plan directeur)

- **C1 — RGPD structurel :** aucune donnée nominative ne part sur GitHub (dépôt public `technologie-stpierre`). Le principe « *un module vit là où ses données ont le droit d'être* » s'étend au téléphone : les données 🟥 vivent **dans le stockage local du navigateur du téléphone**, jamais sur un serveur.
- **C2 — Zéro infra nouvelle :** pas de serveur, pas d'API payante, pas de compte Play Store. La stack reste GitHub Pages + Apps Script + Drive.
- **C3 — Pas de refonte :** les outils 🟥 existants (PC) continuent de fonctionner à l'identique. La version nomade **réutilise** leur code, elle ne le remplace pas.
- **C4 — Maintenance par sessions Claude :** tout doit rester du HTML/CSS/JS vanilla, sans build (pas de framework, pas de bundler), pour que chaque évolution reste faisable en une session.
- **C5 — Android d'abord :** le téléphone du prof est sous Android (Chrome). iOS n'est pas un objectif (le noter, ne pas s'y adapter).

### 1.3 Faits techniques vérifiés (audit du 2026-07-07)

- `outils/plan-de-classe.html` et `outils/equipes-menage.html` utilisent des événements **souris/drag desktop** (7 occurrences `dragstart/mousedown/draggable/ondrop`) — le tactile n'est pas géré nativement par l'API HTML5 Drag&Drop sur Android.
- `equipes-menage.html` possède déjà un **échange « clic-clic »** (sélectionner puis cibler) : ce mode fonctionne tel quel au doigt — c'est le modèle d'interaction à généraliser.
- Les outils 🟥 utilisent `localStorage` (plans enregistrés par classe : clés `plan-de-classe-<CLASSE>`, `…-plans`) et `window.DONNEES_4G` / `window.CLASSES` injectés par `<script src>` — parce que `fetch()` est bloqué en `file://`. **En PWA (https), cette contrainte disparaît**, mais les fichiers de données n'étant pas sur Pages, il faut un mécanisme d'import (§4).
- L'impression du plan de classe repose sur des variables CSS `--k`/`--ey`/`--ex` en `@media print` (sans `transform`, bug Chrome contourné — ne pas y toucher).
- Le site Pages existant sert déjà `/Prof Principal 4e/<module>/` (chemins avec espaces : fonctionnent, mais **hostiles au scope d'un service worker** — voir §3.3).

---

## 2. Choix d'architecture — analyse des options

| Option | Installation | Mise à jour | Hors-ligne | Coût/complexité | RGPD | Verdict |
|---|---|---|---|---|---|---|
| **A. PWA** (manifest + service worker) | Chrome → « Installer l'application » (icône sur l'écran d'accueil, plein écran) | `git push` → auto | Oui (cache SW) | Très faible, zéro outil nouveau | Données en IndexedDB local, code public sans donnée — **identique au modèle actuel** | ✅ **Recommandé** |
| B. TWA / Bubblewrap (PWA empaquetée en APK) | APK à générer (Java/Android SDK), à signer, à sideloader | Recompiler ou via la PWA sous-jacente | Oui | Moyen : chaîne Android SDK à installer/maintenir | Idem A | ❌ N'apporte rien vs A ici (utile seulement pour le Play Store, non voulu) |
| C. Capacitor / Cordova (webview native) | APK sideloadé, « sources inconnues » à autoriser | Recompilation + retransfert manuel à chaque évolution | Oui | Élevé : Node + Android Studio + signature ; casse C4 (maintenance par sessions) | Bonne (stockage app) | ❌ Coût de maintenance disproportionné |
| D. Native Kotlin | Play Store ou APK | Recompilation | Oui | Très élevé, réécriture complète | Bonne | ❌ Casse C3 et C4 |

**Décision : Option A (PWA).** Justification résumée : c'est la seule option où *chaque évolution future du Couteau Suisse se déploie sur le téléphone sans aucune action* (le prof rouvre l'app, le service worker récupère la nouvelle version). Les options B/C/D réintroduisent une chaîne de build que personne ne maintiendra.

**Limite assumée de la PWA à documenter au prof :** les données vivent dans le profil Chrome du téléphone. Si le prof **efface les données de Chrome** ou désinstalle Chrome, les données importées et les plans enregistrés sont perdus (d'où : export de sauvegarde §4.4 + `navigator.storage.persist()` §3.4). Ce n'est pas pire que le PC (localStorage), et la source canonique reste `donnees/eleves-4G.json` sur le PC.

---

## 3. Architecture cible

### 3.1 Vue d'ensemble

```
Téléphone Android (Chrome)
└── PWA « Couteau Suisse 4G » (installée, plein écran, hors-ligne)
    ├── Accueil = portail nomade (4 tiroirs, code couleur conservé)
    ├── 🟥 Outils locaux adaptés tactile
    │     ├── Plan de classe (consultation + retouches simples)
    │     ├── Équipes de ménage (consultation + échanges clic-clic)
    │     └── Trombinoscope (l'outil « tueur » sur mobile : apprendre
    │         les prénoms dans le bus, faire l'appel visuel)
    │     └── données : IndexedDB (élèves, photos, plans) — importées, jamais téléchargées
    ├── 🟩 Liens vers Hub / PSC1 / Carnet (vue prof) — déjà en ligne
    ├── 🟦 Liens profonds vers les Google Sheets (s'ouvrent dans l'appli Sheets)
    └── 🟪 Aide-mémoire des workflows (— et lien vers l'appli Claude)
```

### 3.2 Principe de réutilisation du code (contrainte C3)

Ne **pas dupliquer** les outils. Refactorer chaque outil 🟥 en séparant :
- `outils/<outil>.html` — coquille PC actuelle (inchangée pour l'usage local `file://`) ;
- une **couche données** commune `outils/js/donnees.js` : expose `getEleves(classe)`, `getPhotos()`, `getPlans()`… qui lit **d'abord IndexedDB** (mobile/PWA), **sinon `window.DONNEES_4G`** (PC en `file://`). C'est le seul refactor invasif ; le faire en premier et vérifier la non-régression PC avant toute autre chose.
- la PWA charge les **mêmes** fichiers HTML (chemins relatifs), avec un `viewport` et une feuille `mobile.css` additionnelle chargée conditionnellement.

### 3.3 Emplacement et service worker

- Créer un dossier **sans espace ni accent** à la racine du dépôt : **`pp4g/`** (le scope d'un service worker et les URLs de cache sont beaucoup plus sûrs sans caractères à encoder ; `Prof Principal 4e/` reste l'atelier PC).
- Contenu : `pp4g/index.html` (portail nomade), `pp4g/manifest.webmanifest`, `pp4g/sw.js`, `pp4g/mobile.css`, `pp4g/js/…`, icônes (dérivées de `Logo 2026.png` : 192×192, 512×512, maskable).
- Les outils 🟥 adaptés sont **copiés-servis** depuis `pp4g/outils/` par un petit script de synchro **ou** — mieux, à trancher en début de chantier — déplacés dans `pp4g/outils/` avec des liens/raccourcis depuis l'ancien emplacement. Critère : zéro duplication de source (C3/C4). Recommandation : **déplacer** dans `pp4g/outils/` et faire pointer `PORTAIL.html` (PC) vers ces nouveaux chemins ; le mode `file://` continue de marcher car les outils restent auto-porteurs.
- **Service worker volontairement simple** (C4) : stratégie *cache-first avec revalidation en arrière-plan* (stale-while-revalidate) sur tout le scope `pp4g/`, un nom de cache versionné (`pp4g-v1`, incrémenté à chaque lot), bannière « Nouvelle version disponible — recharger » quand un nouveau SW est en attente. **Ne jamais mettre en cache** les URL Apps Script (🟩) ni Google (🟦).

### 3.4 Stockage sur le téléphone

- **IndexedDB**, base `pp4g`, magasins : `eleves` (par classe), `photos` (blobs, clé `NOM Prénom`), `plans` (plans de classe enregistrés), `menage` (roulements), `config` (URLs backends, options), `meta` (version des données, date d'import).
- Appeler `navigator.storage.persist()` au premier import et afficher le résultat (protège contre l'éviction automatique du stockage).
- Les `localStorage` existants des outils restent utilisés en PC ; sur mobile, la couche `donnees.js` redirige vers IndexedDB (une seule API vue par les outils).

### 3.5 Sécurité d'accès à l'app

- Le **code** de la PWA est public (comme tout le dépôt) mais **vide de données** : sans import, l'app n'affiche rien de nominatif. C'est la même posture que le site actuel.
- Ajouter un **verrou PIN local optionnel** (4-6 chiffres, haché SHA-256 dans `config`, demandé à l'ouverture et après 5 min d'arrière-plan). Ce n'est pas du chiffrement — le documenter honnêtement : la vraie protection est le verrouillage du téléphone. Option ultérieure (hors périmètre v1) : chiffrer les magasins IndexedDB avec une clé dérivée du PIN (WebCrypto AES-GCM).
- Consigne d'usage à écrire dans le guide : **ne pas utiliser la navigation privée** (stockage effacé), téléphone verrouillé par code/biométrie.

---

## 4. Transfert des données nominatives PC → téléphone (chantier n°1)

Trois mécanismes, du plus simple au plus confortable. **Implémenter 4.1 en v1 ; 4.2 et 4.3 sont des options.**

### 4.1 Import par fichier (v1, obligatoire)
- Écran « ⚙️ Données » dans le portail nomade : bouton **Importer** → `<input type="file">` acceptant :
  - `eleves-4G.json` (format canonique existant — le parseur doit accepter tel quel le fichier de `donnees/`) ;
  - CSV `Nom;Prénom;Sexe[;dys]` (même format que l'import déjà intégré au plan de classe PC) ;
  - un **zip de photos** (`NOM Prénom.jpg`, comme `donnees/photos/`) — décompression via une petite lib zip embarquée (une seule dépendance vendorisée, pas de CDN) ou, alternative sans lib, sélection multiple de fichiers images.
- **Acheminement du fichier jusqu'au téléphone** (à documenter dans le guide, pas à coder) : le déposer dans le **Drive du collège** (tiroir 🟦, déjà le lieu légitime des données nominatives) → l'ouvrir sur le téléphone → « Télécharger » → l'importer dans l'app → **le supprimer des téléchargements**. Alternative sans cloud : câble USB ou Quick Share depuis le PC.
- Après import : afficher un récapitulatif (« 26 élèves 4G, 14 F / 12 M, 3 dys, 24 photos — importé le … ») stocké dans `meta`.

### 4.2 Import par QR codes (option, confort)
- Le PC (outil local existant ou nouvelle page 🟥 `outils/export-qr.html`) affiche la liste élèves encodée en 1-3 QR codes successifs (~2 Ko/QR) ; l'app les scanne avec la caméra (`BarcodeDetector` est disponible sur Chrome Android). Zéro fichier qui traîne. **Ne convient pas aux photos** (volume).

### 4.3 Sauvegarde chiffrée sur Drive (option ultérieure, hors v1)
- Export depuis l'app d'un blob AES-GCM (clé dérivée d'une phrase de passe) déposé manuellement sur Drive ; ré-import symétrique. Utile le jour d'un changement de téléphone. À ne faire que si le besoin se confirme.

### 4.4 Export de sauvegarde (v1, obligatoire)
- Bouton **Exporter mes données** : fichier JSON (élèves + plans + roulements + config, photos exclues ou incluses au choix) téléchargé sur le téléphone, ré-importable via 4.1. C'est l'assurance-vie contre l'effacement de Chrome, et le canal de retour téléphone → PC (un plan retouché en salle des profs sur mobile peut être réimporté sur le PC).

---

## 5. Adaptation tactile et écrans (chantier n°2)

### 5.1 Règles générales
- `<meta name="viewport" content="width=device-width, initial-scale=1">` partout ; cibles tactiles ≥ 44 px ; pas de survol (`:hover`) porteur d'information.
- Remplacer l'API HTML5 Drag&Drop par le modèle **« toucher-toucher »** (sélectionner la source → toucher la cible), déjà éprouvé dans equipes-menage. Ne **pas** tenter un vrai drag tactile en v1 (Pointer Events + auto-scroll + long-press = complexité sans valeur pour des retouches ponctuelles).
- Philosophie d'usage à respecter dans les choix d'interface : **le PC reste l'atelier** (construction des plans, contraintes, impression), **le téléphone est la consultation + la retouche d'appoint** (échanger deux élèves, vérifier une équipe, réviser les prénoms). Ne pas viser la parité fonctionnelle complète en v1.

### 5.2 Par outil

| Outil | Mobile v1 (obligatoire) | Mobile v2 (plus tard) |
|---|---|---|
| **Trombinoscope** | Priorité n°1 — grille responsive 3-4/rangée, **mode révision** (masquer les noms, toucher pour révéler) : c'est le cas d'usage nomade par excellence | Mode « appel » (cocher présents/absents, purement local) |
| **Plan de classe** | Consultation : rendu du plan enregistré avec **pan & pinch-zoom** (le gabarit 30 postes est illisible entier sur 6") ; échange de deux élèves en toucher-toucher | Édition de contraintes, création de plan, publication Hub depuis le mobile |
| **Équipes de ménage** | Consultation du roulement (« quelle équipe cette semaine ? » — mettre en avant la semaine courante), échanges clic-clic (déjà compatibles) | Génération d'un nouveau roulement |
| **Portail nomade** | 4 tiroirs, liens 🟩 (vue prof), liens 🟦 (Sheets), chips d'état | Notifications locales (rappels conseils) — probablement inutile |

### 5.3 Impression / export sur Android
- Chrome Android sait « Imprimer → Enregistrer en PDF » : **tester** que les CSS `@media print` (`--k`/`--ey`/`--ex`) produisent un PDF correct depuis le téléphone. Si le rendu diverge (moteur d'impression Android différent), ne pas s'acharner : afficher un message « pour l'impression, utiliser le PC » (cohérent avec §5.1 — le téléphone n'est pas l'atelier).

---

## 6. Ce qui ne change pas (à ne PAS toucher)

- Les backends Apps Script (Hub, PSC1, Carnet) : **aucune modification**. La PWA se contente de liens.
- `PORTAIL.html`, les outils en usage PC `file://`, `donnees/` et son `.gitignore` : la source canonique reste le PC.
- Les workflows 🟪 (appréciations…) : restent des procédures Claude, le portail nomade n'en donne qu'un aide-mémoire.
- L'Espace élèves : les élèves ne sont pas concernés par cette app (elle est **prof uniquement**). Ne pas la référencer côté élèves.

---

## 7. Séquence de construction (pour le modèle exécutant)

Chaque étape se termine par une vérification navigateur (DevTools mode mobile pour les étapes 1-5, téléphone réel pour 6-7) et une mise à jour de `PLAN-DIRECTEUR.md` (§8, nouvelle étape numérotée) + de ce fichier (statut).

- **Étape N0 — Refactor couche données** ✅ **(2026-07-07)** : couche `outils/js/donnees.js` créée (`window.PP4G`), les 3 outils 🟥 branchés dessus. **Critère atteint : non-régression PC complète, vérifiée en navigateur (plan de classe 26 élèves / 30 postes + génération + photos + persistance après reload ; trombinoscope 26 vignettes ; ménage 6 équipes + roulement 30 semaines zone B), 0 erreur console sur les 3 outils.**
  - **Écart assumé vs plan initial (décision de §3.3, tranchée après lecture du code) :** les outils **n'ont PAS été déplacés** dans `pp4g/`, et `PORTAIL.html` est **inchangé**. Raison : les 3 outils chargent leurs données par un chemin relatif frère `<script src="../donnees/…">` vers le dossier **privé gitignoré** `Prof Principal 4e/donnees/`. Les déplacer dans `pp4g/outils/` casse ce chemin et forcerait un renvoi `../../Prof Principal 4e/donnees/` (fragile, avec espace, du public vers le privé — sans aucun sens sur Pages). L'hypothèse « outils auto-porteurs après déplacement » du §3.3 est donc **fausse en pratique**. Choix retenu : garder les outils en place (canoniques pour l'usage PC `file://`), poser la couche `donnees.js` **à côté d'eux** (`outils/js/`, include propre `js/donnees.js`, versionné car hors `donnees/`). Le déplacement/packaging vers `pp4g/` est reporté à **N1** (contexte PWA), où la donnée vient d'IndexedDB et le problème de chemin disparaît : N1 relocalisera l'arbre `outils/` entier (outils + `js/`) d'un bloc.
  - **Conception de `donnees.js` (seam minimal, non invasif) :** au lieu de réécrire chaque accès données, `PP4G` **peuple les mêmes globales** `window.CLASSES`/`window.DONNEES_4G` — depuis les data-scripts déjà chargés (PC) **ou** depuis IndexedDB (PWA, dormant tant que l'import N2 n'a pas eu lieu) — et expose `PP4G.photoUrl(nom, prenom)`. Les outils lisent leurs globales comme avant, gardés par `PP4G.ready().then(…)`. Sur PC : `source="globals"`, `photoUrl` renvoie exactement `../donnees/photos/…` (octet pour octet identique à l'ancien code — testé). **Aucune migration de clés localStorage nécessaire** (fichiers non déplacés, clés inchangées → plans enregistrés conservés par construction).
  - **Schéma IndexedDB posé par `donnees.js`** (point d'ouverture unique de la base `pp4g`, à réutiliser par l'import N2) : magasins `eleves` (keyPath `classe`), `photos` (clé `NOM Prénom`, valeur Blob), `config`, `meta`.
- **Étape N1 — Coquille PWA** ✅ **(2026-07-09)** : `pp4g/index.html`, `manifest.webmanifest`, `sw.js`. **Écart vs plan initial (cohérent avec N0) :** les outils n'ont pas été « relocalisés » mais **copiés** dans `pp4g/outils/` (avec `js/donnees.js`) — `Prof Principal 4e/outils/` reste la copie PC canonique inchangée, `PORTAIL.html` n'a pas été repointé (conforme au §6 « ce qui ne change pas »). Les 3 `<script src="../donnees/…">` retirés des copies pp4g (inutiles, 404 propre sinon). SW scope isolé à `pp4g/` (register("sw.js") sans header spécial — GitHub Pages ne permet pas Service-Worker-Allowed, donc pas de scope élargi tenté ; blast radius nul sur le reste du site). Icônes générées depuis `Logo 2026.png` (Python/Pillow, fond blanc, marge de sécurité 20 % pour le maskable). **Vérifié : manifest valide (3 icônes), SW actif, 10/10 fichiers précachés (200), offline garanti par construction (`cached || network` synchrone).**
- **Étape N2 — Import/export des données** ✅ : écran `pp4g/donnees.html`. `donnees.js` étendu avec l'API d'écriture (`importerClasse`, `importerPhoto`, `listerClasses`, `exporterTout`, `effacerTout`, `meta`/`config`) — **une seule source de vérité du schéma IndexedDB**, partagée par les 2 copies (PC dormante, PWA active). **Vérifié avec le vrai `eleves-4G.json` local** (jamais commité) : 26 élèves importés → visibles dans les 3 outils (`source: idb`) ; CSV + photos testés (synthétiques) ; export avec photos (base64) ; **idempotence export→suppression→réimport prouvée** (égalité JSON stricte avant/après).
- **Étape N3 — Trombinoscope mobile** ✅ : grille `repeat(auto-fill, minmax(78px,1fr))` (3 colonnes mesurées à 380 px), mode révision (tap = révèle un nom individuellement, masqué par défaut). **Vérifié à 380 px avec un jeu mixte photos/initiales (4/4) : positionnement, réactivité au tap, aucune fuite d'état entre vignettes.**
- **Étape N4 — Plan de classe mobile** ✅ : wrapper `#salleScroll` (overflow:auto, pas de restriction de zoom dans le viewport meta → pinch-zoom natif), `.zone` empilée en colonne sous 700 px, cibles tactiles ≥44px. **Décision : fonctionnalités « atelier » (générer, associer/séparer/devant, imprimer, publier) conservées** plutôt que retirées — risque de réécriture jugé disproportionné vs le gain UX, et sans risque data (storage isolé du PC). **Vérifié : échange tap-tap prouvé (2 élèves), persistance après reload confirmée (localStorage, même mécanisme qu'avant — pas besoin d'IndexedDB pour ce cas, la persistance réelle étant le critère, pas l'implémentation).**
- **Étape N5 — Ménage mobile + liens 🟩🟦🟪** ✅ : carte « Cette semaine » (calcul par date, ligne surlignée + scrollIntoView) ; **ajout d'un vrai gap tactile détecté en cours de route** — le déplacement simple (sans échange) n'existait qu'en drag&drop, jamais en tap ; ajouté un `onclick` sur le conteneur équipe (garde `.closest(".membre")`). Portail : 8 liens réels (Hub/PSC1/Carnet, Sheets retenues, guide suivi élèves, HVC, diaporama, Claude), tous `target="_blank" rel="noopener"`. **Vérifié : semaine courante correcte, tap-tap (échange) et tap-vide-équipe (déplacement, tailles 4↔5 confirmées) tous deux fonctionnels, hrefs corrects.**
- **Étape N6 — Vérification finale (émulation)** ✅ : **gap détecté et comblé en cours d'étape — le verrou PIN (§3.5) n'avait été construit par aucune étape N1-N5** alors que la checklist §9 l'exige. Ajouté : `PP4G.config` (magasin générique clé/valeur, réutilisable), `pp4g/js/verrou.js` (SHA-256 WebCrypto, session glissante 5 min via `sessionStorage`, opt-in), section Sécurité dans `donnees.html`, inclusion sur les 5 pages pp4g. **Vérifié de bout en bout : opt-in par défaut, verrouillage à l'ouverture, mauvais code rejeté, bon code accepté, pas de re-demande en navigation rapide, re-verrouillage après 6 min simulées, désactivation.** Mécanisme de mise à jour SW vérifié **sans forcer** (bannière apparue naturellement après bump de version, clic → `skipWaiting` → `controllerchange` → reload auto → ancien cache purgé). RGPD : confirmé mécaniquement qu'aucun fichier nominatif n'existe sous `pp4g/` (grep + `git status`). **Non-régression PC reconfirmée à chaque modification de `donnees.js` (3 fois).** **Limites assumées de l'émulation (nécessitent le vrai téléphone du prof) :** icône réelle sur l'écran d'accueil après « Installer l'application », geste tactile réel (vs `click()` simulé), ouverture effective des liens Sheets dans l'appli dédiée, rendu de l'impression PDF Android, et les photos réelles des élèves (pas encore disponibles — prévues mi-septembre, testé avec des images de substitution).
- **Étape N7 — Documentation** ✅ : `pp4g/INSTALLATION.md` (installation, import, sécurité, mises à jour, sauvegarde/changement de téléphone, tableau des fonctionnalités PC/mobile, RGPD, dépannage). `PORTAIL.html` (PC) mis à jour (bandeau « Version nomade » pointant vers l'URL Pages + les 2 guides). Mémoire Claude et ce document mis à jour.

**Volume estimé : 3-4 sessions de travail** (N0-N1 · N2 · N3-N5 · N6-N7), la plus risquée étant N0 (refactor avec non-régression PC).

---

## 8. Risques et parades

| Risque | Impact | Parade |
|---|---|---|
| Régression des outils PC lors du refactor N0 | Élevé (outils en production à la rentrée) | N0 isolé, testé seul ; migration des clés localStorage écrite et vérifiée ; ne fusionner N1+ qu'après validation |
| Effacement des données Chrome par le prof | Perte des données mobiles | `storage.persist()` + export de sauvegarde + source canonique toujours sur PC — à écrire en gros dans INSTALLATION.md |
| Chemins avec espaces/accents dans le scope SW | Cache/scope erratique | Dossier `pp4g/` sans espace (§3.3) |
| PDF mobile différent du PC | Frustration | Position assumée : impression = PC (§5.3), message clair dans l'app |
| Fichier nominatif oublié dans les Téléchargements du téléphone | Fuite locale | Étape « supprimer le fichier » dans le guide + l'app peut le rappeler après import |
| Le prof s'attend à éditer les contraintes sur mobile | Déception de périmètre | Le guide et l'accueil de l'app affichent le partage des rôles PC-atelier / mobile-consultation (§5.1) |
| Éviction du service worker / app « qui ne se met pas à jour » | Confusion | Cache versionné + bannière de rechargement (§3.3) |

---

## 9. Checklist de recette finale

Statut au 2026-07-09 après vérification par émulation navigateur (DevTools mobile,
serveur statique local, jamais de vraie donnée hors machine). **✅ ém.** = vérifié
par émulation ; **☐ tél.** = nécessite le vrai téléphone Android du prof (dernière
étape, non automatisable).

- [x] ✅ ém. — L'app s'installe : manifest valide (nom, icônes 192/512/maskable, `display: standalone`), SW installable et actif. ☐ tél. — confirmer l'icône réelle sur l'écran d'accueil après « Installer l'application ».
- [x] ✅ ém. — Mode avion : prouvé par construction (`cached || network` synchrone) + les 12 fichiers de l'app précachés avec statut 200 (index, donnees, 3 outils, donnees.js, verrou.js, manifest, 3 icônes). Testé aussi en tuant réellement le serveur HTTP (page restée fonctionnelle tant que le SW contrôlait la page).
- [x] ✅ ém. — Import `eleves-4G.json` (vrai fichier, jamais commité) : 26 élèves, récapitulatif exact. ☐ tél. — photos réelles (pas encore prises, prévues mi-septembre) ; testé avec des images de substitution.
- [x] ✅ — Aucun fichier nominatif dans le dépôt : vérifié mécaniquement (`git status` + recherche `.json`/`eleves` sous `pp4g/` = rien trouvé), `.gitignore` toujours en place.
- [x] ✅ ém. — Mode révision du trombinoscope : tap individuel prouvé (masqué par défaut, révélation ciblée, aucune fuite entre vignettes) à 380 px. ☐ tél. — confort réel « à une main ».
- [x] ✅ ém. — Échange de deux élèves sur le plan : persiste après reload (localStorage, même origine) — confirmé avec une paire d'élèves spécifique retrouvée identique après rechargement.
- [x] ✅ ém. — Semaine de ménage courante : carte + surlignage corrects (testé avec une date de départ ajustée pour retomber sur la semaine du test, calendrier zone B déjà vérifié en amont).
- [x] ✅ ém. — Liens 🟩🟦 : 8 hrefs corrects avec `target="_blank"` (mêmes URLs que la version PC en production). ☐ tél. — ouverture effective dans l'appli Sheets dépend de l'OS/apps installées.
- [x] ✅ ém. — PIN activable/désactivable, redemandé après arrière-plan > 5 min : **vérifié de bout en bout** (activation, verrouillage, mauvais code rejeté, bon code accepté, pas de re-demande en navigation rapide < 5 min, re-verrouillage après 6 min simulées via `visibilitychange`, désactivation).
- [x] ✅ ém. — Export → suppression → réimport : égalité JSON stricte prouvée (26 élèves avant = 26 élèves après, structure identique).
- [x] ✅ ém. — Mise à jour : bannière apparue **naturellement** (sans forcer) après un bump de version, clic → `skipWaiting` → `controllerchange` → reload automatique → ancien cache purgé (vérifié : un seul cache restant après coup).

**Reste uniquement du ressort du vrai téléphone (☐ tél. ci-dessus) :** icône d'installation, geste tactile réel, ouverture des liens dans les apps dédiées, rendu d'impression PDF Android (§5.3 — non testé, position assumée « imprimer = PC »), photos réelles des élèves.

---

## 10. Questions ouvertes — tranchées par l'exécution (2026-07-09)

- [x] Nom du dossier/app : `pp4g/` et « Couteau Suisse 4G » retenus tels quels. **Nuance à trancher plus tard avec le prof** : le nom commercial « Cockpit PP » a émergé dans les échanges (identité aéronautique, cf. mémoire) — un futur rebranding du dossier `pp4g/` en `cockpit/` (ou équivalent) est possible mais n'a **pas** été fait ici (hors périmètre de cette exécution).
- [x] Photos sur le téléphone : oui dès la v1 (mécanisme d'import prêt), conforme à la recommandation.
- [x] PIN : implémenté **opt-in** (pas de PIN par défaut), à activer manuellement dans ⚙️ Données — plus simple que « proposé à la fin du premier import » (pas de flux d'interruption ajouté à l'import), écart mineur assumé.
- [x] QR d'import (§4.2) : non fait, conforme à la recommandation « plus tard ».
