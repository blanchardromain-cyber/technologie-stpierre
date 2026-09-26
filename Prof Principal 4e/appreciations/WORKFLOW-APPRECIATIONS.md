# Appréciations générales PP — workflow 3 trimestres (4G)

Tiroir 🟪 (rédaction avec l'IA) + 🟥 (données nominatives en local, hors git).
Règle dure : le champ EcoleDirecte accepte **400 caractères** ; le pipeline vise **≤ 380**
(marge de relecture), garanti par comptage script (jamais « à l'œil »).

Deux chemins : le **module Synthèse du Cockpit** (chemin principal, depuis septembre 2026) et,
en secours, la **rédaction avec Claude à partir d'un export manuel**.

## Chemin principal : module Synthèse du Cockpit (3 tuiles du Portail)

Programme local `synthese_pp.py`, dans le Drive :
`4 - Prof Principal et Administratif/Appréciations/Appréciation synthèse PP/`.
Réglages pédagogiques (longueur, consignes, tonalité, fournisseur IA) : `config.yaml`, sans code.
Une fois par PC : double-clic sur `installer-protocole-syntheses.reg`.

1. **« Génération appréciations »** : connexion à EcoleDirecte (lecture seule), extraction des
   appréciations de toutes les matières, anonymisation (E01, E02…), rédaction par l'IA, contrôle
   de longueur avec réécriture des dépassements, puis ouverture du Word de relecture.
2. **Toi** : relecture du Word. C'est toi qui valides chaque texte — l'IA propose, tu signes.
3. Report dans EcoleDirecte, au choix :
   - **« Report Appréciations »** : page locale, une carte par élève, texte modifiable,
     bouton « Copier » puis collage dans EcoleDirecte ;
   - **« Report direct EcoleDirecte »** : écriture automatique du seul champ appréciation PP
     de chaque élève. Étape 1 = **simulation** (rien n'est écrit) ; étape 2 = écriture réelle,
     uniquement après avoir tapé **oui**. Les appréciations des autres professeurs ne sont
     jamais touchées.

## Secours : rédaction avec Claude à partir d'un export manuel

À utiliser si la connexion à EcoleDirecte échoue. Le fichier [PROFIL-STYLE.md](PROFIL-STYLE.md)
définit la plume (registre, formules, tonalité) : à relire et corriger une fois.

1. **Exporter** depuis EcoleDirecte la vue conseil de classe / bulletins de la 4G
   (PDF, Excel ou CSV — peu importe, Claude lit les trois).
2. **Déposer** le fichier dans `../donnees/appreciations/T1/` (ou T2, T3).
3. **Dire à Claude** : « Appréciations T1 » (ou T2/T3).
4. Claude déroule alors :
   - lecture de l'export + contrôle (« 26 élèves, N matières détectées ») ;
   - à partir du **T2** : lecture aussi du trimestre précédent → formulation de la **progression**
     (« confirme les progrès du T1 », « le fléchissement se poursuit »…) ;
   - *optionnel* : l'onglet Synthèse du **Tableau de bord 4G** (`../suivi-eleves/`) sert
     **en complément** pour ajuster la tonalité — jamais comme source des faits, qui
     restent les appréciations des professeurs dans EcoleDirecte ;
   - rédaction d'une synthèse par élève selon le profil de style :
     signal dominant + point fort + axe de progrès + tonalité ;
   - **comptage par script** de chaque texte, réécriture automatique de tout dépassement ;
   - contrôles : cohérence note/texte, aucun élève manquant ou interverti, aucun fait inventé ;
   - restitution en tableau `Élève | Appréciation | nb car.` prêt à copier-coller dans EcoleDirecte.
5. **Toi** : relecture, ajustements (« adoucis Untel », « sois plus ferme avec Untel »),
   copier-coller dans EcoleDirecte.

## Calendrier (rappels)

| Trimestre | Génération | Conseil (indicatif) |
|---|---|---|
| T1 | fin novembre | début décembre |
| T2 | fin février | début mars |
| T3 | fin mai | début juin |

Option : demander à Claude de programmer un rappel automatique une semaine avant chaque conseil.

## Règles RGPD

- La connexion à EcoleDirecte est scriptée, **en local uniquement** : identifiants dans les
  variables d'environnement Windows (niveau Utilisateur), jamais écrits ni journalisés.
- Seules des données **anonymisées** (E01, E02…) partent vers l'IA ; les prénoms des collègues
  cités dans les appréciations sont nettoyés avant envoi. Le prénom de l'élève n'est réinjecté
  qu'en local, après génération.
- Table de correspondance, fichiers de travail et exports restent sur le PC ou le Drive
  (`travail/`, `../donnees/`), hors git, jamais publiés.
- Toute écriture dans EcoleDirecte passe par une simulation puis une confirmation explicite.
