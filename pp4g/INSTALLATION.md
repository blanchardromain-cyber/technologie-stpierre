# Couteau Suisse 4G — nomade — guide d'installation

Version téléphone (Android) du Couteau Suisse du Prof Principal 4e. Une **PWA**
(pas d'application du Play Store) : elle s'installe depuis Chrome et fonctionne
ensuite hors connexion. Le PC reste l'atelier (construction des plans) ; le
téléphone sert à la **consultation et aux retouches d'appoint** (voir
`Prof Principal 4e/PLAN-APP-NOMADE.md` pour l'architecture complète).

## 1. Installer l'application

1. Sur le téléphone, ouvrir Chrome et aller sur :
   `https://blanchardromain-cyber.github.io/technologie-stpierre/pp4g/`
2. Menu Chrome (⋮, en haut à droite) → **Installer l'application** (ou
   « Ajouter à l'écran d'accueil »).
3. Une icône apparaît sur l'écran d'accueil — l'app s'ouvre en plein écran,
   sans barre d'adresse, comme une app normale.

À ce stade, l'app est vide : aucune donnée d'élève n'est présente (le code est
public, les données ne le sont jamais — voir Rappels RGPD).

## 2. Importer une classe

1. Sur le PC, déposer `eleves-4G.json` (dans `Prof Principal 4e/donnees/`,
   jamais versionné) dans le **Drive du collège** (dossier privé).
2. Sur le téléphone, ouvrir ce fichier depuis Drive → **Télécharger**.
3. Dans l'app, ouvrir **⚙️ Données** → sélectionner le fichier téléchargé →
   **Importer**. Un récapitulatif confirme le nombre d'élèves importés.
4. **Supprimer le fichier des Téléchargements du téléphone** une fois importé
   (il a fait son travail, pas de raison qu'il traîne).
5. Photos (optionnel, dès qu'elles existent — prévues vers le 15-20 septembre) :
   même écran, sélectionner plusieurs photos nommées `NOM Prénom.jpg` (comme
   dans `Prof Principal 4e/donnees/photos/` sur le PC).

Alternative sans Drive : câble USB ou Quick Share depuis le PC vers le
téléphone, puis même procédure d'import.

## 3. Sécurité (verrou PIN, optionnel)

Dans **⚙️ Données** → section « Sécurité » : définir un code à 4-6 chiffres.
Il sera redemandé à l'ouverture de l'app et après 5 minutes en arrière-plan.

**Ce n'est pas du chiffrement** — la vraie protection reste le verrouillage du
téléphone (code, empreinte…). Le PIN dissuade juste un accès rapide si le
téléphone est déverrouillé et prêté.

Consignes complémentaires :
- Ne pas utiliser la navigation privée pour ouvrir l'app (les données importées
  seraient effacées à la fermeture de l'onglet).
- Garder le téléphone verrouillé par code/biométrie — c'est la vraie barrière.

## 4. Mises à jour

Automatiques : à chaque évolution du Couteau Suisse (poussée sur GitHub), l'app
le détecte à l'ouverture suivante et affiche un bandeau « Nouvelle version
disponible — Recharger ». Un tap suffit. Rien à réinstaller.

## 5. Sauvegarde et changement de téléphone

Dans **⚙️ Données** → **Exporter une sauvegarde** : télécharge un fichier JSON
(élèves + plans + roulements — photos incluses si la case est cochée).

- **Assurance-vie** : si le téléphone efface ses données (Chrome vidé, app
  désinstallée), ce fichier permet de tout restaurer via **Importer**.
- **Changement de téléphone** : exporter sur l'ancien, réinstaller l'app sur
  le nouveau (§1), réimporter le fichier de sauvegarde.
- La **source canonique** des données reste toujours le PC
  (`Prof Principal 4e/donnees/eleves-4G.json`) — le téléphone n'est jamais la
  seule copie qui compte.

## 6. Ce que le téléphone sait faire (et ce qu'il ne fait pas)

| Sur le téléphone | Sur le PC (atelier) |
|---|---|
| Trombinoscope + mode révision | idem, plus impression |
| Plan de classe : consulter, échanger 2 élèves | Construire le plan (contraintes, génération), imprimer |
| Ménage : voir la semaine courante et le roulement, échanger/déplacer un élève | Générer un nouveau roulement |
| Liens vers Hub / PSC1 / Carnet (vue prof), Sheets, aide-mémoire | — |

Pour imprimer un plan ou un roulement : utiliser le PC (Chrome Android sait
imprimer en PDF, mais ce n'est pas l'usage prévu de la version nomade).

## Rappels RGPD / sécurité

- Le code de l'app est public (dépôt GitHub `technologie-stpierre`) mais ne
  contient **aucune donnée d'élève** : sans import, rien ne s'affiche.
- Les données importées vivent uniquement dans le stockage du navigateur de
  **ce téléphone** (IndexedDB) — jamais envoyées à un serveur.
- Les liens Hub/PSC1/Carnet ouvrent les modules déjà en ligne (protégés par
  code PROF) ; le registre des retenues ouvre l'appli Google Sheets du compte
  du collège.

## Dépannage rapide

- **L'app ne s'installe pas** : vérifier que Chrome (pas un autre navigateur)
  est utilisé, et que l'URL est bien en `https://`.
- **Aucune donnée après ouverture** : aller dans ⚙️ Données et importer (une
  installation neuve démarre toujours vide).
- **La bannière de mise à jour ne part pas** : taper sur « Recharger » ; si
  rien ne se passe, fermer complètement l'app puis la rouvrir.
- **Code PIN oublié** : sur le PC, ouvrir `eleves-4G.json` et le réimporter
  fonctionne quel que soit le PIN (l'import n'est pas verrouillé) — mais la
  consultation, elle, reste bloquée tant que le bon code n'est pas retrouvé.
  En dernier recours : effacer les données du site dans Chrome (Paramètres →
  Confidentialité → Données de sites → rechercher le site → Supprimer), puis
  réimporter une sauvegarde (§5).
