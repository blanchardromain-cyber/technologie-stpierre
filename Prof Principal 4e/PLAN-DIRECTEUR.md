# Plan directeur — « Le Couteau Suisse du Prof Principal 4e »

> **Statut :** fondation posée (liste 4G injectée) — construction du module Plan de classe · **Version :** 1.1 · **Date :** 2026-07-03
> **Auteur :** R. Blanchard (PP 4e) + Claude
> **Nature :** document de référence *et* contexte réinjectable entre sessions.

---

## 0. Comment réutiliser ce document

- **En début de session**, réinjecte ce fichier (ou dis à Claude « recharge le PLAN-DIRECTEUR 4e ») pour reprendre exactement où on en est, sans tout réexpliquer.
- Un **pointeur mémoire** existe côté Claude (`projet-superstructure-pp-4e`) : il rappelle l'existence et l'emplacement de ce document.
- **Rien n'est construit tant que la liste des élèves n'est pas fournie** (rentrée). Ce document se met à jour au fil des décisions (incrémente la version).

---

## 1. Contexte & objectif

Prof principal d'une classe de **4e** (~28-29 élèves max). Le rôle est chronophage et administratif ; les élèves ne sont vus qu'1-2×/semaine ; l'heure de vie de classe (HVC) est comptée 30 min/sem (~18 h/an, payée 10 h). Canal officiel de l'établissement = **EcoleDirecte**, jugé peu pratique.

**Objectif :** une **superstructure évolutive** (« couteau suisse ») qui regroupe des outils pour (a) gagner du temps sur l'administratif, (b) mieux communiquer avec les élèves, (c) prévenir les conflits liés à la communication entre élèves (WhatsApp non régulés).

**Principe directeur :** *un module vit là où ses données ont le droit d'être.* La couleur d'un module indique où vivent ses données → discipline RGPD rendue visible.

---

## 2. Architecture — 4 tiroirs + portail

Le **portail** est une page d'accueil unique (lanceur) qui liste les modules avec leur pastille de couleur.

| Couleur | Tiroir | Où vivent les données | Techno |
|---|---|---|---|
| 🟩 | **Public (élèves)** | GitHub Pages + Apps Script + Google Sheet | accès *code élève personnel* |
| 🟦 | **Privé Drive (toi / équipe)** | Apps Script Web App + classeur maître 4e | derrière login Google |
| 🟥 | **Local RGPD** | HTML 100 % local, navigateur | rien ne sort de la machine |
| 🟪 | **Workflows Claude** | procédures toi + Claude (pas des apps) | prénoms seuls |

---

## 3. Modules

### 🟩 Public (élèves) — Pages + Apps Script + Sheet · code élève personnel
- **Hub de classe** : infos descendantes (agenda, devoirs, échéances, docs à rendre) **+ mur d'entraide modéré**
  - Mur d'entraide : fil questions/réponses par matière ; plusieurs élèves peuvent répondre ; réponse du prof marquée « réponse du prof » (fait autorité) ; bouton « ça m'a aidé 👍 » ; badge **Résolu ✅** ; **aucun message privé** ; bouton **signalement** ; filtre anti-insultes.
  - **Modération** : post-modération + bouton d'arrêt (basculable en pré-modération sur périodes chaudes). Tableau de modération côté prof affichant le **vrai nom** (via clé locale pseudo→nom).
- **Boîte à signalement / médiation** (peut être un étage du Hub) — détection précoce des conflits/harcèlement, alignée pHARe.
- **Inscriptions PSC1** : les élèves **choisissent leur binôme** (affinité / transport) et **s'inscrivent** sur les mercredis (8h30-16h00). **Inscription possible, désinscription impossible** (seul le prof corrige). Dates ouvertes progressivement → alimente le **Planning PSC1** (🟦). Hypothèse : 2 élèves/session, réparti sur l'année, modulable.

### 🟦 Privé Drive (toi / équipe) — Apps Script Web App + classeur maître 4e
- **Retour des documents** : pointage qui a rendu quoi + liste de relance auto + taux de retour.
- **Suivi élèves** (général).
- **Synthèse conseil de classe** : agrégation des remontées avant conseil.
- **Suivi incidents / absences** : élève relais / binôme absence.
- **Gestion des retenues** (données disciplinaires, accès restreint) — registre : *élève · motif · date · contact parents fait ? · créneau (soir 1 h / mercredi matin 4 h) · travail fourni ?*.
  - **Notification collègues** → e-mail court (nom, prénom, classe, motif, créneau) **préparé en brouillon Gmail** (le prof relit et envoie ; jamais d'envoi automatique de données disciplinaires). Destinataires = profs + vie scolaire fournis par le prof.
  - **Suivi « travail fourni »** → **Google Sheet partagé-équipe** où chaque collègue coche ✅. L'e-mail contient le lien vers ce tableau.
- **Planning PSC1** : validation des créneaux issus des inscriptions 🟩.
- **Planning équipes de ménage** : roulement sur l'année.

### 🟥 Local RGPD — HTML 100 % local (jamais en ligne)
- **Moteur d'affectation (partagé)** — cœur réutilisable, 3 modes :
  - *Placement* : **plan de classe** — gabarit **techno (30 postes en escalier, 2 blocs, rangées de 3 + postes avancés isolés)** + gabarits **rangées de 1 et de 2** (salles banalisées).
  - *Binômes* : élève relais, tutorat.
  - *Groupes* : équipes de ménage (3 à 5 élèves : balayage, poubelles/tri, tableau…), groupes de projet.
  - Contraintes : dures (X devant / près du tableau — dys, PAP, vue ; séparer X et Y ; près du bureau) + souples (tutorat fort/faible, alphabétique, mixité). Sorties : plan visuel, glisser-déposer, export PNG/PDF.
- **Trombinoscope** : aide-mémoire prénoms (droit à l'image → local).
- **Brouillons d'appréciations**.

### 🟪 Workflows Claude (toi + moi — procédures)
- **Rédaction des appréciations de conseil** — voir §5 (≤ 400 caractères, par trimestre, progression).
- **CR réunion parents** (à partir de tes notes).
- **Messages & scripts** : parents (retenue, relance docs, absences) via EcoleDirecte ou **script d'appel téléphonique** ; **demande de travail aux collègues** pour l'heure de retenue.
- **Programme HVC annuel** : ~18 séances clés en main (climat de classe, harcèlement/numérique responsable, orientation 4e→3e / Parcours Avenir, méthodo, charte de communication de classe co-construite).

---

## 4. Fondations partagées (le socle évolutif)

1. **Une seule liste d'élèves** — prénom + nom + tags de contrainte. Fournie à la rentrée. **Forme minimale** (souvent prénom + initiale suffit à l'affichage ; nominatif complet reste en 🟥/🟦). Pas d'adresses ni d'infos PAP transmises à Claude. Capacité ~28-29.
2. **Un classeur maître 4e** (Drive).
3. **Le moteur d'affectation** (réutilisé par plan de classe / ménage / relais / tutorat).
4. **Le portail** — lanceur unique, code couleur = où vivent les données.

**Évolutivité :** un nouveau besoin = un nouveau module déposé dans le bon tiroir et relié au portail. Jamais de refonte.

---

## 5. Workflow « Appréciations de conseil » (détail)

- **1 seul agent (Claude)** — choix assumé : une seule plume = homogénéité de ton sur les ~29 élèves. Pas de parallélisation (fragmenterait le style).
- **IA :** oui = Claude. **API :** non en mode interactif (aucune clé/infra). **Local :** la donnée peut rester locale/collée ; la rédaction se fait côté Claude ; **prénoms seuls**.
- **Phases :** (0) profil de style réutilisable + règles + plafond 400 car. → (1) ingestion export EcoleDirecte (PDF/xlsx/csv, Drive ou local) → (2) synthèse par élève → (3) contrôle qualité : **comptage de caractères par script** (pas à l'œil) + réécriture si > 400, cohérence, zéro fait inventé → (4) restitution `Élève | Appréciation | nb car.` copiable dans EcoleDirecte → (5, option) progression si export du trimestre précédent fourni.
- **Contrainte 400 caractères :** règle dure garantie par le comptage script + réécriture (≈ 60-65 mots ; hiérarchiser, pas tronquer).
- **Accès aux appréciations des collègues :** **pas d'automatisation d'EcoleDirecte** (pas de connecteur, données de mineurs, fragile/risqué). EcoleDirecte agrège déjà tout → **un seul export** déposé dans Drive par le PP. Déclenchable par un **rappel programmé** (cron) avant chaque conseil — **pas un loop**.
  - ⚠️ **Révision 2026-07-18** (validée par le prof) : décision remplacée par le module **« Cockpit PP — Synthèse »** : pipeline Python **100 % local** qui interroge directement l'API EcoleDirecte (lecture seule, identifiants en variables d'environnement, anonymisation avant tout appel IA). Emplacement : `G:\Mon Drive\4 - Prof Principal et Administratif\Appréciations\Appréciation synthèse PP\`. L'export manuel + workflow Claude ci-dessus reste le **mode de repli**.

---

## 6. Règles transverses

- **Sécurité Hub :** code élève personnel (upgradable vers mot de passe plus tard, si vraiment nécessaire).
- **RGPD :** sensible → 🟥 local ; disciplinaire → 🟦 accès restreint ; Claude → prénoms seuls ; pas d'aspiration automatisée d'EcoleDirecte.
- **Actions sortantes (e-mails) :** toujours en **brouillon**, jamais d'envoi automatique.
- **Feu vert chef d'établissement** requis pour le volet 🟩 face élèves (facilité par le design « propre » : sans compte, sans donnée personnelle publique, sans messagerie privée, modéré).

---

## 7. Décisions actées

| # | Décision |
|---|---|
| D1 | Entraide = **mur modéré public**, pas de tchat privé temps réel. |
| D2 | Plan de classe = **2 familles de gabarits** (techno + classiques), contraintes saisies une fois, **100 % local**. |
| D3 | Hub = **code élève personnel** (pseudonymisation, clé pseudo→nom locale). |
| D4 | PSC1 = **inscription en ligne**, binôme auto-choisi, **désinscription impossible** ; dates ouvertes progressivement. |
| D5 | Retenues = e-mail **brouillon Gmail** aux collègues + **Sheet partagé** pour cocher « travail fourni ». |
| D6 | Appréciations = **1 agent**, mode interactif (pas d'API), **≤ 400 car.** garanti par script, progression inter-trimestres. |
| D7 | PSC1 / ménage / relais réutilisent le **moteur d'affectation** ; PSC1 est en plus un module d'**inscription** 🟩. |
| D8 | Rentrée : placement **alphabétique les 2 premières semaines** (mode dédié du plan de classe), contraintes dys actives dès le départ. |

---

## 8. Séquence de construction

- **Étape 0** — figer ce plan directeur ✅ · définir le **format de la liste élèves** ✅
- **Étape 1** — injecter la **liste des élèves** ✅ (2026-07-03, classe **4G**, 26 élèves : 14 F / 12 M, dont 3 dys — détail nominatif **uniquement** dans `donnees/eleves-4G.json`, hors git · profs + e-mails injectés)
- **Étape 2** ✅ — **Plan de classe** (`outils/plan-de-classe.html`, 🟥 local) : salle techno 30 postes + rangées 1/2, alpha/aléatoire, dys devant, séparations, impression. Vérifié en navigateur. Tableau côté postes 1-8 **confirmé**.
- **Étape 3** ✅ (code) — **Hub de classe** (`hub-classe/` : `index.html` + `apps-script/Code.gs` + `DEPLOIEMENT.md`). Mode démo par défaut (codes DEMO1/DEMO2/PROF1). Vérifié en navigateur : connexion par code, annonces prof, questions/réponses, 👍, résolu (auteur ou prof seulement), filtre anti-insultes, signalement, modération (masquer/rétablir). **Reste à faire par le prof** : déployer (Sheet + Apps Script + dépôt `hub-4g`) selon `DEPLOIEMENT.md`, après feu vert chef d'établissement. Codes personnels générés dans `donnees/codes-eleves-4G.csv` + cartes imprimables `donnees/cartes-codes-4G.html`.
- **Étape 4** ✅ (code) — **Retenues** (`retenues/WORKFLOW-RETENUES.md` + registre `donnees/registre-retenues-4G.xlsx` : 3 onglets, listes déroulantes élèves/créneaux/statuts). Connecteur Gmail vérifié (brouillon de test créé). Adresse vie scolaire repérée (viesco@) et ajoutée à la fondation — à confirmer. **Reste à faire par le prof** : importer le registre dans Drive en Google Sheets, le partager à l'équipe, coller le lien dans le workflow.
- **Étape 5** ✅ (code) — **Inscriptions PSC1** (`psc1/` : index.html + Code.gs + DEPLOIEMENT.md). Mêmes codes personnels que le Hub. Vérifié en navigateur : inscription binôme définitive avec confirmation, dates fermées invisibles élèves, double inscription bloquée serveur, capacité, vue prof (ajouter/ouvrir/fermer des dates, retirer un binôme), codes des autres élèves jamais exposés. **Reste à faire par le prof** : déployer (Sheet `PSC1 4G` + Apps Script + Pages) selon `psc1/DEPLOIEMENT.md`, puis ouvrir les premières dates.
- **Étape 6** ✅ — **Équipes de ménage** (`outils/equipes-menage.html`, 🟥 local) : équipes de 4-5 mixtes équilibrées, échange clic-clic, roulement annuel daté (1re semaine + nb de semaines), impression. Vérifié en navigateur. Le registre Retenues est importé dans Drive (lien dans `retenues/WORKFLOW-RETENUES.md`) — ⚠️ partage à restreindre (« Limité » + adresses équipe), signalé au prof le 2026-07-03.
- **Étape 7** ✅ — **Portail** (`PORTAIL.html`, local, logo collège) : 4 tiroirs code couleur, 11 modules, chips d'état automatiques. Les URLs vivent dans `donnees/config-portail.js` (hors git) — Hub/PSC1 passent de « démo locale » à « en ligne » dès que leurs URLs y sont collées. Registre retenues déjà branché (partage restreint aux comptes du collège ✅).
- **Étape 8** ✅ — **Appréciations 3 trimestres** (`appreciations/` : WORKFLOW + PROFIL-STYLE à relire une fois par le prof). Dossiers d'export `donnees/appreciations/T1-T2-T3` créés (hors git). Déclencheur : dire « Appréciations T1 » à Claude après dépôt de l'export EcoleDirecte.
- **Étape 9** ✅ (2026-07-03) — **v2 des outils locaux + module Carnet** :
  - **Plan de classe v2** : associer (côte à côte), « placer devant » (au-delà des dys), binômes mixtes F-G, photos miniatures (`donnees/photos/NOM Prénom.jpg`), plans enregistrés nommés (charger/supprimer), impression pleine page paysage avec date de génération et d'impression. Vérifié 8/8.
  - **Équipes ménage v2** : calendrier officiel **zone B 2026-2027** intégré (8 semaines de vacances écartées) + jours fériés (Armistice, Pâques, pont Ascension, Pentecôte — case « écarter les semaines fériées » cochée par défaut), couleur par équipe reprise dans le planning, glisser-déposer (interversion sur un élève, déplacement sur une équipe), bouton « copier le planning » pour le Hub. Vérifié.
  - **Trombinoscope** (`outils/trombinoscope.html`, 🟥) : conforme feuille modèle (paysage, 10/rangée, NOM Prénom, ratio 3:4, initiales si photo absente). Vérifié.
  - **Carnet de bord / suivi du règlement** (`carnet/` : index.html + Code.gs + DEPLOIEMENT.md, 🟩) : l'élève reporte ses remarques (date, matière, **Travail personnel / Attitude au collège** — colonnes du carnet papier, précision, parents signé) ; **e-mail automatique au PP** à chaque report (historique + total, ⚠️ à 5) ; jauge n/5 côté élève ; vue prof (synthèse, seuil rouge, journal) ; **bouton « Alerter l'équipe »** (e-mail récap aux collègues + vie scolaire, sur action volontaire uniquement, adresses dans l'onglet Config). Mêmes codes que le Hub. Vérifié 8/8. Substitut au visa systématique des carnets papier.
- **Étape 10** ✅ (2026-07-03) — **Programme HVC annuel** (`hvc/PROGRAMME-HVC.md`) : ~18 séances de 30 min réparties sur les 5 périodes, calées sur le calendrier zone B (respirations sur les semaines à férié et avant vacances), chaque thème adossé à un outil du Couteau Suisse. **Séance 1 projetable** (`hvc/seance-01-rentree.html`, 7 diapositives : accueil, année de 4e, codes personnels, Hub, carnet de bord, annonce charte). Les supports suivants se génèrent à la demande (« Séance HVC n°X »).
- **Étape 11** ✅ (2026-07-03) — **Plan de classe multi-classes + impression optimisée** :
  - Impression : **sans `transform`** (Chrome ré-ajustait la page et annulait l'agrandissement — bug constaté sur impression réelle). Toutes les dimensions (cases, polices, photos, positions, barre tableau) passent par des variables CSS `--k` (échelle) et `--ey` (étirement des inter-rangs) activées par `@media print` uniquement. Mesuré : boîte 1050×690 pile, places sur 96-97 % de la largeur et 92 % de la hauteur, écran inchangé.
  - **Multi-classes** : catalogue `donnees/classes.js` (`window.CLASSES`), sélecteur de classe (visible dès 2 classes), stockage séparé par classe (`plan-de-classe-<CLASSE>` / `…-plans`). Pour ajouter une classe de techno : fournir la liste (xlsx comme la 4G) → Claude l'ajoute au catalogue. Vérifié (bascule, isolation des données, non-régression 4G).
- **Étape 12** ✅ (2026-07-03) — **Mise en production + entrée élèves** :
  - Hub, PSC1 et Carnet **déployés par le prof** (backends Apps Script branchés, servis par le site Pages sous `/Prof Principal 4e/<module>/`). Portail : chips « en ligne ».
  - **Profil de style appréciations validé (v1.1)** : workflow opérationnel — déposer l'export EcoleDirecte dans `donnees/appreciations/T1` puis dire « Appréciations T1 ».
  - **Espace élèves** (`eleves/index.html`) : page d'entrée unique sans login (3 tuiles Hub/PSC1/Carnet, liens relatifs valides en local et en ligne) + **QR code** (`eleves/qr-espace-eleves.png`) + **affiche imprimable** (`eleves/affiche-espace-eleves.html`). Post-it EcoleDirecte = UN seul lien vers cette page (les images à zones cliquables multiples ne sont pas possibles dans l'éditeur ED).
- **Étape 13** ✅ (2026-07-05) — **Lot d'évolutions v2.1** (6 sections) :
  - *Plan de classe* : impression avec photos pleine page (étirement horizontal `--ex` pour le cas limité par la hauteur) · **import de classes intégré** (bouton ➕, CSV `Nom;Prénom;Sexe[;dys]` ou JSON, stockage navigateur, suppression possible) · **bouton 📤 Publier sur le Hub** (plan pseudonymisé prénom+initiale, code PROF requis, backend `hubBackend` dans `config-portail.js`).
  - *Ménage* : **vue d'impression compacte une page** (carte par équipe couleur : membres + dates de service), l'écran garde le tableau détaillé.
  - *Hub v2* : onglets **🪑 Plan** (plan publié, tous), **👤 Moi** (casier + consigne, **référents absence** : 1 obligatoire + 1 facultatif, validés serveur), **📋 Classe** (prof : tableau casiers/référents + **horaires d'ouverture configurables**, blocage élèves côté serveur hors plage, écran « Hub fermé »). Mode démo testable via `?demo`.
  - *Carnet v2* : **onglets T1/T2/T3** (bornes dans Config : finT1=2026-11-30, finT2=2027-03-10 — à ajuster ; seuil de 5 **par trimestre**, historique conservé) · **rendez-vous** : à 5 remarques l'élève propose jour (lun-ven) + créneau (récré matin 10h30 / midi 13h30 / récré aprèm 14h45) → mail au prof → validation (créneau modifiable) → **confirmation visible côté élève**.
  - *Retenues* : modèle A distingue 1h soir / 4h mercredi + tableau matières/profs pré-rempli ; **cases à cocher dans Gmail = impossible** (limite documentée), le pointage OUI/NON reste dans le registre partagé.
  - *PSC1* : synchronisation continue vers un Sheet « suivi » séparé via **IMPORTRANGE** (aucun code exporté), partage manuel à la responsable de niveau (procédure dans DEPLOIEMENT.md).
  - ⚠️ **Backends Hub et Carnet à mettre à jour par le prof** : recoller les Code.gs v2, exécuter `initialiser()`, puis « Gérer les déploiements → Nouvelle version » (l'URL ne change pas). Les nouvelles fonctions affichent « backend à mettre à jour » tant que ce n'est pas fait.
- **Étape 14** ✅ (2026-07-05) — **Corrections v2.2** :
  - *Hub — bug « ouverture samedi/dimanche »* : cause = Sheets convertissait « 07:30 » en objet **Date** (« Sat Dec 30 1899… »), cassant la comparaison horaire et affichant « samedi ». Corrigé : colonne Divers forcée en texte (`setNumberFormat("@")`), lecture des heures Date-safe (`lireHeure`), ré-écriture propre dans `initialiser()`.
  - *Hub — choix des jours* : onglet Classe, **7 cases à cocher Lun→Dim** + plage horaire ; stocké dans `joursOuverts` (« 1..7 »), blocage serveur par jour ET par heure ; défaut = tous les jours. Message « Hub fermé » listant les jours ouverts.
  - *Navigation* : **bouton 🏠 Accueil** ajouté dans Hub, PSC1 et Carnet → renvoie à l'**Espace élèves** (`../eleves/`, la page qui liste les 3 outils — meilleur pivot que le Hub seul pour circuler entre outils).
  - *PSC1 — bug « Invalid Date »* : même cause (dates renvoyées comme objet Date). Corrigé côté page (`dateFr` prend `slice(0,10)`, robuste ISO/Date) **et** côté backend (`etat()` reformate en `yyyy-MM-dd`). PSC1 gagne aussi le mode `?demo`.
  - ⚠️ **Backend Hub à redéployer** (jours + fix heures) : coller Code.gs, exécuter `initialiser()`, nouvelle version. Backend PSC1 : redéploiement **optionnel** (le fix page suffit à l'affichage).
- **Réponse EcoleDirecte (notification d'annonce)** : impossible d'automatiser une notif temps réel *dans* ED (ni API, ni push ; le post-it n'accepte qu'un lien statique). Contournement : le post-it pointe vers l'Espace élèves / le Hub, toujours à jour.
- **Étape 15** ✅ (2026-07-05) — **Carnet : alerte équipe qui échouait (« Requête invalide »)** :
  - Cause probable = envoi e-mail vers les adresses d'exemple `adresse1@/adresse2@` encore en place dans Config > emailsEquipe (ou autorisation d'envoi). Le message générique masquait la vraie cause.
  - Backend rendu **bavard** : `doPost` renvoie désormais « Erreur serveur : <message> » ; `alerter()` rejette les adresses d'exemple avec un message explicite et **entoure l'envoi d'un try/catch** qui remonte la vraie erreur + confirme les destinataires.
  - Bug date d'affichage (`2026-07-05T22:00:00.000Z` en brut) = même conversion Sheets→Date ; corrigé backend (`jour()` dans `remarquesDe`) **et** page (normalisation `slice(0,10)` à la réception, marche sans redéploiement).
  - ⚠️ **Action prof** : mettre les vraies adresses de l'équipe dans Config > emailsEquipe, redéployer le backend Carnet (nouvelle version), et vérifier que l'autorisation d'envoi d'e-mails a bien été accordée.
- **Étape 16** ✅ (2026-07-05) — **Corrections v2.3** :
  - *PSC1 dates en anglais (« Fri Jul 24 »)* : le backend renvoyait la date en **texte anglais** ; `dateFr` la découpait puis échouait et affichait le brut. Corrigé par `versDate()` qui essaie `new Date(valeur)` d'abord (gère ISO, « AAAA-MM-JJ » et texte anglais), + tri par valeur de date. **Marche sans redéploiement backend.**
  - *Hub — réglages jours/horaires « ne s'affichent pas »* : quand le backend renvoyait une erreur (onglets Infos/Divers absents car `initialiser()` non exécutée), tout l'onglet Classe affichait « Fonction indisponible ». Désormais les **réglages s'affichent toujours** (avec un avertissement si le backend n'est pas à jour) ; backend Hub rendu défensif (`lireInfos` ne plante plus si l'onglet manque) et bavard (vraie erreur au lieu de « Requête invalide »).
  - ⚠️ Pour que l'**enregistrement** des jours/horaires fonctionne : exécuter `initialiser()` sur le Sheet Hub + redéployer une nouvelle version.
- **Étape 17** ✅ (2026-07-06) — **Hub : entraide plus réactive + filtre renforcé** :
  - *Filtre de langage* : l'ancienne liste (13 mots) était trop faible. Nouveau filtre à **2 niveaux** (mots longs en sous-chaîne, mots courts en mot entier + pluriels) avec **normalisation** (accents, l33t « c0nnard/conn@rd », répétitions « puuute »). Testé : insultes/variantes bloquées, **0 faux positif** (dispute, réputation, député, seconde, concombre…). En plus, **liste paramétrable par le prof** (onglet Classe → « mots interdits supplémentaires », stockée dans Divers > `motsPerso`, chargée à la connexion). Filtre appliqué côté page **et** serveur.
  - *Réactivité* : **affichage optimiste** (son propre message/annonce/réponse s'affiche instantanément) + **rafraîchissement auto toutes les 4 s** sur annonces/entraide/modération, avec garde `saisieEnCours()` qui **ne rafraîchit pas si un élève est en train d'écrire** (sinon sa saisie serait effacée) et garde anti-chevauchement. (1 s écarté : ~26 élèves × 1 req/s saturerait Apps Script ; 4 s + optimiste = ressenti instantané.)
  - ⚠️ Backend Hub à redéployer pour le filtre serveur + la liste paramétrable (le filtre côté page marche déjà sans redéploiement).
- **Étape 18** ✅ (2026-07-06) — **Nouvelles rubriques + auto-relance CI** :
  - **Auto-relance déploiement Pages** : `.github/workflows/relance-deploiement-pages.yml` relance automatiquement (≤ 3 fois) le job de déploiement Pages en cas d'échec transitoire (via `workflow_run` + `gh run rerun --failed`). Plus de relance manuelle. Si jamais l'événement ne se déclenche pas pour le workflow interne GitHub → bascule vers un déploiement maison.
  - **🟦 Suivi élèves / synthèse conseil** : `suivi-eleves/TABLEAU-DE-BORD.md` — guide d'un Google Sheet privé qui agrège par **IMPORTRANGE** le Carnet + les Retenues (une ligne/élève, compteurs remarques travail/attitude par trimestre + colonne « Observations PP »). **Nuance actée** : c'est un **complément** pour l'appréciation, il **ne remplace pas** l'analyse des appréciations des professeurs dans EcoleDirecte (ajouté aussi dans WORKFLOW-APPRECIATIONS).
  - **🟪 Diaporama réunion de rentrée (parents)** : `reunion-parents/diaporama-rentree.html` — projetable (10 diapos : accueil, année de 4e, équipe pédagogique chargée depuis `donnees/` sans e-mails, rôle PP, outils + QR, carnet, calendrier zone B, orientation, contacts, questions). Vérifié.
  - Portail mis à jour (les deux rubriques passent en « prêt »).
- **Étape 19** ✅ (2026-07-07) — **App nomade Android : N0 (couche données)** — 1re brique du chantier PWA décrit dans `Prof Principal 4e/PLAN-APP-NOMADE.md`. Création de `outils/js/donnees.js` (`window.PP4G`) : décide la source des données élèves/photos une seule fois pour les 3 outils 🟥 — globales `window.CLASSES`/`window.DONNEES_4G` sur PC (`file://`), IndexedDB base `pp4g` sur mobile/PWA (dormant jusqu'à l'import N2). Les 3 outils (plan de classe, ménage, trombinoscope) branchés via `PP4G.ready()` + `PP4G.photoUrl()`. **Écart assumé vs plan : outils NON déplacés vers `pp4g/` et `PORTAIL.html` inchangé** — leur chemin données `../donnees/` (dossier privé gitignoré) casserait au déplacement ; `donnees.js` posé à côté d'eux (`outils/js/`, versionné), packaging vers `pp4g/` reporté à N1. Non-régression PC **vérifiée en navigateur** (26 élèves/30 postes/photos/persistance ; 26 vignettes ; 6 équipes + roulement 30 sem. zone B ; 0 erreur console). Aucune migration de clés localStorage (fichiers en place → plans conservés).
- **Étape 20** ✅ (2026-07-09) — **App nomade Android : N1→N7 (chantier complet)** — suite et fin du chantier PWA `PLAN-APP-NOMADE.md` (N0 = étape 19). Livré : coquille PWA `pp4g/` (manifest + service worker scope isolé, icônes générées depuis `Logo 2026.png`) ; écran ⚙️ Données (import JSON/CSV/photos, export/sauvegarde, `donnees.js` étendu en API d'écriture IndexedDB partagée PC/PWA) ; trombinoscope mobile (grille responsive + mode révision tap) ; plan de classe mobile (pan/zoom natif, échange tap-tap, panneaux « atelier » conservés) ; ménage mobile (carte « semaine courante », déplacement tap vers une équipe ajouté — gap tactile détecté et comblé) ; portail nomade avec les 8 liens réels 🟩🟦🟪 ; **verrou PIN** (SHA-256, session glissante 5 min) — gap détecté en cours de N6 (aucune étape n'avait construit ce que le plan §3.5 prévoyait), ajouté avec son propre magasin IndexedDB `config` ; guide `pp4g/INSTALLATION.md` ; bandeau « Version nomade » ajouté à `PORTAIL.html`. **Non-régression PC reconfirmée à 3 reprises** (à chaque modification du fichier partagé `donnees.js`) — toujours verte. Mécanisme de mise à jour du service worker vérifié en conditions réelles (bannière apparue sans intervention forcée). **Reste explicitement hors de portée d'une session Claude : le test sur le vrai téléphone Android du prof** (checklist détaillée dans `PLAN-APP-NOMADE.md` §9 — icône d'installation, gestes tactiles réels, ouverture des liens dans les apps dédiées, impression PDF Android, photos réelles des élèves).
- **Étape 19** ✅ (2026-07-09) — **Publication du planning ménage sur le Hub** (comme le plan de classe) :
  - L'annonce ne convenait pas (planning trop long → tronqué par la limite de taille des messages). Nouvelle stratégie validée : bouton **📤 Publier sur le Hub** dans `outils/equipes-menage.html` (remplace « Copier le planning ») → onglet **🧹 Ménage** du Hub, rendu **identique à la vue compacte imprimée** (une carte par équipe : couleur, membres prénom+initiale, dates de service + rappel des tâches). Pseudonymisé, code PROF requis (mémorisé, partagé avec le plan de classe via `pdc-code-prof`). Visible des élèves.
  - Backend Hub : actions `publierMenage`/`lireMenage` + clé Divers `planningMenage`. Démo `?demo` OK. Vérifié en navigateur (publication + rendu prof & élève).
  - Intégration au refactor **PP4G** (`outils/js/donnees.js`, chantier app nomade/PWA) respectée : l'outil ménage charge via `PP4G.ready()`, la publication utilise `window.DONNEES_4G`.
  - ⚠️ Backend Hub à redéployer pour que la publication fonctionne en réel (les onglets Plan/Ménage lisent le backend).
- **Étape 20** ✅ (2026-07-09) — **Carnet : filtres/tri façon tableur + dates FR** :
  - Vue prof, Journal : **filtres** (élève, matière, catégorie Travail/Attitude, recherche texte sur le motif) + **en-têtes de colonnes triables** (Élève/Date/Matière/Catégorie, clic pour asc/desc) + compteur de lignes.
  - **Bug dates anglaises corrigé** (« Mon Jul 06 ») : `isoDe()` robuste (ISO / AAAA-MM-JJ / texte anglais) utilisé pour l'affichage (`dateCourte` → JJ/MM/AAAA) ET pour `trimestreDe` ; le **trimestre est recalculé côté page** à partir de la date normalisée (les remarques ne tombent plus toutes en T3). Vérifié.
  - **Propagation Cockpit PP** : le Carnet est un module EN LIGNE (URL unique) → la modif apparaît automatiquement dans Cockpit PP au déploiement. En revanche les outils 🟥 (plan de classe, ménage, trombinoscope) sont **dupliqués** dans `pp4g/outils/` (version restylée Cockpit PP, chantier parallèle) → sync manuelle, copies qui divergent. Ne pas écraser `pp4g/`.
- **Étape 21** ✅ (2026-07-09) — **Suppression multiple de classes (PC + nomade, à l'identique)** : partout où l'on peut importer une classe, on peut désormais en supprimer plusieurs d'un coup, au même endroit.
  - `donnees.js` : nouvelle API **`PP4G.supprimerClasses(noms)`** (magasin IndexedDB `eleves`) — **les 2 copies resynchronisées à l'identique** (PC + `pp4g/`).
  - **Plan de classe** (PC **et** nomade) : le 🗑 « classe active » devient **🗑 Supprimer…** → panneau à cases à cocher juste sous « Importer » (+ « Tout cocher », confirmation listant les classes, fermeture auto). Le bouton apparaît dès qu'au moins une classe importée existe. Stockage : `localStorage` (classes importées par l'outil).
  - **⚙️ Données (Cockpit PP)** : nouvelle section « Classes importées » sous l'import — liste à cocher, « Tout cocher », **🗑 Supprimer la sélection** (IndexedDB), récapitulatif, rafraîchie après import et suppression.
  - Vérifié en navigateur : PC (3 classes → suppression de 2, tout cocher/décocher, nettoyage) · nomade plan de classe (2 classes → 0) · ⚙️ Données (3 classes en base → suppression sélective de 2, base à jour), 0 erreur console.
  - Note : les photos (clés `NOM Prénom`) ne sont pas liées à une classe et ne sont donc pas supprimées — elles seront écrasées au prochain import.
- **Étape 22** ✅ (2026-07-20) — **Les 2 dernières tuiles Cockpit deviennent de vrais outils (PC + nomade)** :
  - **`outils/retenue.html` — générateur de retenue** (🟥 local) : élève + date + créneau (soir 1 h / mercredi 4 h) + motif + matières sollicitées (cases, profs affichés) → génère les 3 messages du workflow D5 : e-mail collègues (destinataires auto = profs cochés + viesco, tableau matières, lien registre, bouton **Ouvrir dans Gmail pré-rempli** + Copier), message parents EcoleDirecte (Copier), trame d'appel téléphonique. Rien d'envoyé automatiquement.
  - **`outils/cr-reunion.html` — prise de notes de réunion** (🟥 local) : type/date/participants + 4 zones (points, décisions, à faire, libre) avec **horodatage** ⏱, brouillon auto-enregistré, **« Copier le prompt pour Claude »** (notes structurées + consigne CR factuel → coller dans Claude PC/mobile), export .txt. Alimente le workflow 🟪 « CR réunion parents » (et plus tard la variante transcription audio).
  - Copies Cockpit habillées (cockpit.css, lien retour, sans référence à `donnees/`), `sw.js` v17 (précache + 2 pages). Tuiles mises à jour dans les 2 portails. Vérifié en navigateur (PC : 26 élèves, 12 matières, destinataires exacts, 3 messages ; nomade : thème + source idb + 0 erreur).
  - **Tuile « Suivi élèves / conseil »** : pointe désormais vers le **Google Sheet de suivi du prof** (`1FH_gq0Q…`), LED verte, dans les 2 portails.
  - **Vérification du lien Synthèse ↔ Génération appréciations (pipeline `synthesepp://`, sur G:)** : le lien EST câblé et conforme aux règles — étape `carnet` du pipeline = compteurs seuls (jamais de verbatim), cités uniquement si significatifs, étape ignorée sans erreur si pas d'export ; la base reste les appréciations des professeurs. **⚠️ À faire au T1 : aligner le format** — le pipeline attend `Nom|Prénom|Oublis matériel|Observations comportement|Mots signés`, alors que l'onglet Synthèse produit `Élève(pseudo)|Total|Travail|Attitude|T1|T2|T3`.
- **Étape 23** ✅ (2026-07-20) — **Retenues auto-reportées · mail ED du CR · quiz de rentrée refondu** :
  - **Retenue → registre** : bouton **📤 Reporter dans le registre** ; le backend Hub (action `ajouterRetenue`, `SpreadsheetApp.openById`) écrit **une ligne par matière sollicitée** (Date · Créneau · Élève · Motif · Matière · Professeur), « Travail fourni » laissée vide. Les collègues n'ont plus qu'à passer la colonne G à **OUI** (menu déroulant). Mail collègues reformulé en conséquence. **Nouveau mode d'emploi** complet dans `retenues/WORKFLOW-RETENUES.md` (colonnes A-H imposées, validation OUI/NON, autorisation d'écriture inter-classeur, dépannage).
  - **CR réunion → EcoleDirecte** : bouton **✉️ Générer le message** produit le mail d'accompagnement à coller dans ED (objet daté, civilité adaptée famille/équipe, rappel « joindre le CR » retiré à la copie). Vérifié sur les 2 cas.
  - **Quiz de rentrée refondu** : `suivi-eleves/QUIZ-RENTREE.md` — questionnaire 2026 (21 questions, 5 sections) + **fiche élève dynamique** (menu déroulant + FILTER, bloc alertes, croisement carnet, suivi de complétude, vue de classe). Principe posé : **ne jamais redemander ce qu'EcoleDirecte possède** (coordonnées/téléphones/professions supprimés = RGPD), toute question doit servir à une décision (placement, HVC, entretien, appréciation). Tuile ajoutée aux 2 portails.
  - ⚠️ **Backend Hub à redéployer** (action `ajouterRetenue` + **nouvelle autorisation** d'accès au classeur registre à accepter).
- **Étape 24** ✅ (2026-07-21) — **Correctif autorisation registre + fichier de transmission** :
  - *Symptôme :* rien ne s'écrivait dans le registre et **aucune autorisation n'était demandée**.
    *Cause :* `initialiser()` ne touche pas au registre → Apps Script n'avait aucune raison de
    demander le scope inter-classeur ; l'appel `openById` échouait ensuite silencieusement.
  - *Correctif :* nouvelle fonction **`autoriserRegistre()`** à exécuter une fois dans l'éditeur —
    elle déclenche l'autorisation **et** vérifie l'accès (nom du classeur, liste des onglets,
    présence de « Retenues », en-têtes ligne 1). §1.4 du workflow réécrit en conséquence.
    Côté outil : l'échec du report affiche désormais une **alerte** qui renvoie explicitement vers
    `autoriserRegistre` (vérifié en simulant un refus de permission).
  - **`TRANSMISSION.md`** créé (racine `Prof Principal 4e/`) : reprise de session complète —
    projet, existant, travaux de la conversation, 8 actions en attente, pièges rencontrés,
    règles de travail (2 copies 🟥, `CACHE_VERSION`, D5, priorité des appréciations), repères techniques.
- **Étape 25** ✅ (2026-08-25) — **Hub : onglet 📅 EDT (emploi du temps de la classe), programmé au 1er septembre** :
  - Nouvel onglet **📅 EDT** dans le Hub, alimenté par l'**agenda EcoleDirecte de la 4G**. L'adresse se règle
    dans l'onglet **📋 Classe** (prof) → « Emploi du temps de la classe » ; elle est stockée dans Divers > `edtUrl`.
  - Deux cas gérés : **flux `.ics`** → le backend le télécharge, le décode (dépliage RFC 5545, `RRULE`
    hebdo/quotidienne, `EXDATE`, journées entières, dates UTC ou TZID) et le Hub affiche la **grille jour par jour**
    (bandeau de jours défilant, cours en cours surligné) ; **lien web simple** → bouton « Ouvrir l'emploi du temps ».
    Le décodage est fait **côté serveur** car le navigateur des élèves ne peut pas lire un `.ics` d'un autre domaine (CORS).
    Résultat mis en cache **30 min**, fenêtre J-7 → J+28.
  - **Programmation** : `EDT_ACTIVATION = "2026-09-01"` dans `index.html` — l'onglet est **invisible pour les élèves**
    avant cette date (le prof le voit dès maintenant, avec un bandeau « onglet programmé », pour préparer le réglage).
    Aucune autre action que le collage de l'URL n'est nécessaire le jour J.
  - ⚠️ Backend Hub à redéployer (actions `reglerEdt`/`lireEdt`) + **fuseau du projet Apps Script = Europe/Paris**.
    Sans redéploiement, l'onglet retombe sur le lien de secours `EDT_LIEN_SECOURS` s'il est renseigné.
  - Vérifié en navigateur (mode démo, 390 px) : onglet caché côté élève avant le 1er septembre, visible après,
    grille + navigation entre jours, mode « lien simple », carte de réglage prof, 0 erreur console.
    Décodeur `.ics` testé à part (récurrence hebdo, EXDATE, journée entière, UTC).
- **Étape 26** ✅ (2026-07-21) — **Dates officielles de l'année intégrées** :
  - **Arrêt des notes / bornes de trimestre** (fournies par le prof) : T1 **20/11/2026**, T2 **19/02/2027**, T3 **11/06/2027** (au lieu de 30/11 et 10/03 provisoires). Mis à jour : Carnet backend (`finT1`/`finT2` + ajout `finT3`) et frontend (défauts + démo), `TABLEAU-DE-BORD.md` (bornes COUNTIFS T1/T2/T3), `PROGRAMME-HVC.md` (séances « préparer/retour conseil » recalées — le conseil T2 tombe **après** les vacances d'hiver, ~09/03).
    ⚠️ **Si le Carnet est déjà déployé** : corriger à la main les cellules `finT1`/`finT2` de l'onglet Config (l'`initialiser` ne réécrit pas une valeur existante), puis redéployer.
  - **Réunion de rentrée parents : lundi 14 septembre 2026 à 18 h 30** — ajoutée à la diapo d'accueil du diaporama et notée au programme HVC. **Diaporama finalisé** : calendrier avec les vraies dates d'arrêt des notes + conseils + remise des bulletins (vérifié, 10 diapos, équipe chargée).
- **À construire plus tard** — **CR de réunion à partir d'un enregistrement audio** (2A) : faisable = audio → transcription (dictée téléphone / Google Recorder / dictée Word, *hors Claude*) → Claude en fait le CR Word. **Prérequis RGPD : informer et recueillir le consentement des participants avant tout enregistrement.**
- **Étapes suivantes** — **mardi 1er septembre : coller l'adresse de l'agenda EcoleDirecte de la 4G** dans le Hub (onglet 📋 Classe) · redéployer les backends Hub et Carnet (+ `initialiser()`) · renseigner Config emailsEquipe (Carnet) · feu vert chef avant usage élèves réel · **photos élèves : vers le 15-20 septembre** · listes des autres classes de techno (importables) · CR réunion audio (plus tard).

### Fondation de données (posée le 2026-07-03)
- `Prof Principal 4e/donnees/eleves-4G.json` — source canonique (élèves + tags + profs + e-mails).
- `Prof Principal 4e/donnees/eleves-4G.js` — même contenu en `window.DONNEES_4G` pour chargement `file://` par les outils 🟥 (`<script src>` fonctionne en local là où `fetch` est bloqué).
- **`.gitignore` à la racine exclut `Prof Principal 4e/donnees/`** : le nominatif ne part JAMAIS sur GitHub (dépôt `technologie-stpierre` avec remote public). Le code des outils, lui, est versionnable.
- Régénérer le `.js` après modification du `.json` (script python : voir historique, ou demander à Claude).

---

## 9. À traiter / questions ouvertes

- [ ] Feu vert chef d'établissement pour le volet 🟩.
- [ ] Confirmer l'ordre des étapes 3+.
- [ ] E-mail du prof d'Arts plastiques (VACANT 2) — à la rentrée.
- [ ] Confirmer : Anglais (= VACANT 1) et l'orthographe d'un nom d'enseignant EPS (corrigé d'après l'adresse e-mail — détail dans `donnees/`).
- [ ] Ajustements de la liste à la marge à la rentrée (quelques noms élèves/profs).
- [ ] Contraintes « X et Y à séparer » — plus tard, au fil des observations.
- [x] Adresse vie scolaire confirmée par le prof (2026-07-03), enregistrée dans `donnees/`.
- [ ] **Extensions futures du Hub (validées dans le principe, pas maintenant)** : agent IA de modération (lecture du Sheet par Claude, à la demande ou sur rappel programmé : messages douteux, questions sans réponse, signaux faibles) · chatbot d'entraide type « Chatbot Code » / « Chatbot Systèmes » déjà en place sur le site.
