# P1 — Évaluation n°2 (5ème) — corrigé et barème

Séquence 1, cycle 4. Sujet élève : `evaluation2_eleve.html`
(capsule **P1 — Évaluation n°2**, code d'accès **EVAL2BAT**).

**Notée sur 10 points**, trois exercices, travail individuel.

> **Avant la séance : armer la capsule.** Onglet *Verrous* de la page professeur →
> « P1 5e — Évaluation n°2 » → **Armer**. Toute copie rendue naît alors verrouillée :
> l'élève ne peut plus la rouvrir ni la renvoyer. Désarmer après la séance si besoin.

> **La copie arrive pré-corrigée dans le tableau de bord.** Ouvre la soumission de
> l'élève : le modal affiche la copie annotée, une proposition de note et un panneau
> d'ajustement exercice par exercice. Rien n'est enregistré tant que tu n'as pas cliqué
> sur **« Enregistrer la note »**.

---

## Ce que la machine corrige, et ce qu'elle ne corrige pas

| | Fiabilité |
|---|---|
| **Exercice 3** — cases à cocher | **Certaine.** Comparaison exacte. |
| **Exercice 2** — choix du lit | **Certaine** pour le choix ; **indicative** pour la justification. |
| **Exercice 1** — réponses rédigées | **Indicative.** Repérage de mots-clés, avec tolérance orthographique (demi-point). |

La proposition est une aide à la correction, pas une note : chaque exercice se règle
au quart de point dans le panneau d'ajustement.

---

## Exercice 1 — Identifier les contraintes d'un cahier des charges (5 pts)

**1.1 Qu'est-ce qu'une contrainte ? (2 pts)** — *Une demande ou une condition
**imposée** par le client, l'entreprise, la collectivité ou la réglementation. Elle
**limite les choix du concepteur**.*
Repérage automatique : 1 pt pour l'idée d'une condition imposée / à respecter,
1 pt pour « qui l'impose » ou « limite les choix ».

**1.2 Tableau (3 pts)** — trois types **différents**, chacun avec un exemple.
0,5 pt pour un type reconnu, 0,5 pt pour un exemple cohérent avec ce type.

| Type de contrainte | Exemple concret |
|---|---|
| Technique | la solidité |
| Réglementaire | les normes |
| Environnementale | l'impact sur l'environnement, matériaux recyclables |
| Sécuritaire | la protection des biens et des personnes |
| Esthétique | la forme, la couleur |
| Économique | le budget |
| Temporelle | le délai |

La copie annotée signale : un type mal orthographié (demi-point), un type donné deux
fois (ligne à 0), un exemple qui relève d'un autre type (« esthétique → le prix »).

## Exercice 2 — Valider une solution technique de mobilier (2 pts)

**Lit d) — mezzanine avec bureau intégré** (1 pt).
**Justification (1 pt)** — *il permet de dormir (lit), de travailler (bureau) et de
ranger (étagères) dans un espace réduit.*
Repérage automatique : 0,25 pt par idée (dormir, travailler, ranger, gagner de la
place). Si l'élève a choisi un autre lit, la justification est plafonnée à 0,5 pt.

## Exercice 3 — Choisir un matériau isolant performant (3 pts)

**3.1 Les quatre plus isolants (2 pts)** — 0,5 pt par bon matériau coché. La page
empêche de cocher plus de quatre cases.

| Produit | λ | |
|---|:---:|:---:|
| Laine de verre | 0,030 | **X** |
| Polystyrène | 0,030 | **X** |
| XPS | 0,029 | **X** |
| Polyuréthane | 0,021 | **X** |

**3.2 Meilleur compromis (1 pt)** — **Laine de verre** : 120 mm et 11,16 €/m², à la
fois la moins épaisse (avec le polystyrène) et la moins chère des quatre.
Le polyuréthane est plus fin (100 mm) mais trois fois plus cher.

---

## Aménagements pour les élèves à besoins particuliers

- **Lecture immersive** : lit l'énoncé à voix haute, légendes des lits comprises
  (elles sont en texte, et non plus dans l'image).
- **Confort de lecture** : police, taille, interlignage.
- **Dictée** : bouton 🎤 sur chaque champ, y compris les six cases du tableau 1.2.
- **Tableau 3.2** : les matériaux cochés en 3.1 y sont repérés (« coché en 3.1 ») —
  l'élève n'a pas à croiser deux tableaux de mémoire. Les valeurs numériques sont en
  police à chiffres alignés, sans zéro barré.
- **Exercice 2** : grandes cartes cliquables, le choix est visible d'un coup d'œil.

## Notes techniques

- Capsule `eval2-5e`, grille `EVALUATIONS["eval2-5e"]` dans `index.html`
  (sections `cc`, `mob`, `iso`).
- Images : `ressources/eval2_lit_a.png` à `eval2_lit_d.png`, découpées dans
  `Evaluation 2/Image 1.png`.
- Champs envoyés : `e1-def`, `e1-t1…3`, `e1-x1…3`, `e2-lit`, `e2-just`,
  `e3-1` (liste des matériaux cochés, séparés par des virgules), `e3-2`.
