# P1 — Évaluation n°3 (5ème) — corrigé et barème

Séquence 1, cycle 4. Sujet élève : `evaluation3_eleve.html`
(capsule **P1 — Évaluation n°3**, code d'accès : voir le panneau professeur).

**Notée sur 10 points**, deux exercices, travail individuel.

> **Avant la séance : poser le code et armer la capsule.** La capsule est publiée
> verrouillée par un code que personne ne connaît : le poser avec
> `coffre.py code --id eval3-5e` (il s'affiche ensuite dans le panneau « Codes d'accès »).
> Puis onglet *Verrous* → « P1 5e — Évaluation n°3 » → **Armer** : toute copie rendue
> naît verrouillée.

> **La copie arrive pré-corrigée dans le tableau de bord.** Le modal affiche la copie
> annotée, une proposition de note et un panneau d'ajustement par exercice. Rien n'est
> enregistré tant que tu n'as pas cliqué sur **« Enregistrer la note »**.

---

## Ce que la machine corrige, et ce qu'elle ne corrige pas

| | Fiabilité |
|---|---|
| **1.3** et **exercice 2** — cases à cocher | **Certaine.** Comparaison exacte. |
| **1.1, 1.2, 1.4** — réponses rédigées | **Indicative.** Repérage de mots-clés, avec tolérance orthographique (demi-point). |

Une réponse au hasard rapporte des points sur les tableaux à deux colonnes (c'est le
barème du sujet) : « Modélisation » partout donne 2,5/4 à l'exercice 2, « Croquis »
partout 1,5/4, « Norme » partout 1/2 en 1.3.

---

## Exercice 1 — Identifier les normes parmi les contraintes (6 pts)

**1.1 Qu'est-ce qu'une norme ? (1 pt)** — *Un ensemble de **règles à respecter**, fixé
par un **organisme officiel** (AFNOR, ISO, Union européenne) : dimensions, sécurité,
qualité…* Repérage : 0,5 pour « règle / à respecter », 0,5 pour « organisme officiel /
commune à tous ».

**1.2 À quoi sert une norme ? (1 pt)** — deux utilités **différentes**, 0,5 chacune :
garantir la sécurité, rendre les produits compatibles (le même chargeur pour tous),
assurer la qualité, protéger l'environnement, faciliter l'usage, faciliter les échanges
entre pays, l'accessibilité, des mesures communes. La même utilité donnée deux fois
rapporte 0,5 en tout.

**1.3 La conception d'un ERP (2 pts)** — 0,5 par ligne.

| | Contrainte | Norme |
|---|:---:|:---:|
| Le nombre d'issues de secours | | **X** |
| Le choix de l'esthétique des matériaux | **X** | |
| Le nombre de salles | **X** | |
| Le choix de matériaux résistants au feu | | **X** |

**1.4 Objectif de la norme USB-C sur l'environnement (2 pts)** — *Réduire les
**déchets** électroniques (1 pt) : les appareils neufs sont vendus sans chargeur, chacun
**réutilise son ancien chargeur**, le même pour plusieurs appareils (1 pt).*
Une réponse trop générale (« protéger la planète ») est signalée à 0.

## Exercice 2 — Représenter le réel (4 pts)

0,5 par ligne.

| | Croquis | Modélisation |
|---|:---:|:---:|
| Représentation A (studio en 3D) | | **X** |
| Représentation B (studio dessiné au crayon) | **X** | |
| Simuler ou tester le fonctionnement | | **X** |
| Réalisée à main levée | **X** | |
| Montre précisément l'objet technique | | **X** |
| Sur ordinateur, à taille réelle, en 3D | | **X** |
| Imprimer des plans pour fabriquer les pièces | | **X** |
| Donne l'allure générale de l'objet | **X** | |

---

## Aménagements pour les élèves à besoins particuliers

- **Lecture immersive** : lit l'énoncé, le texte sur l'USB-C et chaque ligne des tableaux.
- **Confort de lecture** : police, taille, interlignage.
- **Dictée** : bouton 🎤 sur chaque champ rédigé, y compris les deux utilités de 1.2.
- **Tableaux** : une case ronde par ligne, la ligne répondue se colore ; les deux
  représentations sont affichées en grand dans le tableau même.

## Notes techniques

- Capsule `eval3-5e`, grille `EVALUATIONS["eval3-5e"]` dans `index.html`
  (sections `norme`, `repr`) ; test : `node outils/test_eval3_5e.js`.
- Illustrations : `ressources/eval3_modelisation.svg`, `eval3_croquis.svg` (le même
  studio, en modélisation et en croquis), `eval3_erp.svg`, `eval3_usbc.svg`.
- Champs envoyés : `e1-def`, `e1-u1`, `e1-u2`, `e1-env` (texte) ; `e1-erp1…4`
  (`contrainte` / `norme`) ; `e2-r1…8` (`croquis` / `modelisation`).
