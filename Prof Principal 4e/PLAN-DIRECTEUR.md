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
  - *Groupes* : équipes de ménage (4-5 élèves : balayage, poubelles/tri, tableau…), groupes de projet.
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
  - Impression : échelle en CSS pur (fiable quel que soit le chemin d'impression) + **étirement vertical de l'espacement des rangées** à l'impression seulement (texte non déformé) → pleine largeur et quasi pleine hauteur A4 paysage.
  - **Multi-classes** : catalogue `donnees/classes.js` (`window.CLASSES`), sélecteur de classe (visible dès 2 classes), stockage séparé par classe (`plan-de-classe-<CLASSE>` / `…-plans`). Pour ajouter une classe de techno : fournir la liste (xlsx comme la 4G) → Claude l'ajoute au catalogue. Vérifié (bascule, isolation des données, non-régression 4G).
- **Étapes suivantes** — déploiement Hub + PSC1 + Carnet par le prof (guides fournis, feu vert chef à obtenir) · **photos élèves : vers le 15-20 septembre** (`donnees/photos/NOM Prénom.jpg`) · **listes des autres classes de techno** (à fournir, format 4G) · supports HVC suivants à la demande.

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
