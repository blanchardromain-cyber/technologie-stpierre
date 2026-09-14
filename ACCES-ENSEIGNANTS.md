# Ouvrir un accès à un collègue

Un collègue peut suivre et corriger le travail de **ses** classes sans devenir
administrateur du site, et sans qu'on lui communique les codes des capsules.

## Ce qu'il peut faire

- Ouvrir **toutes les capsules** — activités, synthèses, évaluations, corrigés —
  **sans saisir de code** : son compte fait clé.
- Consulter le **suivi de ses classes** : les copies envoyées, leur statut.
- **Corriger les évaluations** : la copie arrive pré-corrigée, il ajuste les points,
  rédige l'appréciation et valide. Sa note part dans la même feuille Google que les
  tiennes : tu la vois de ton côté.

## Ce qu'il ne peut pas faire

- Voir l'onglet **« Codes accès »** ni changer un code.
- Voir l'onglet **« Configuration »** ni les mots de passe des élèves.
- **Exporter** l'ensemble des copies en CSV.
- **Supprimer** une copie.
- Voir les copies des classes **qui ne sont pas les siennes** : elles n'apparaissent
  ni dans le suivi, ni dans les statistiques, ni dans la liste « Sans soumission ».

## Créer un compte

Dans `index.html`, cherche `var ENSEIGNANTS = [` et ajoute une ligne :

```js
{ id:"claire.moreau", p:"Claire", n:"MOREAU", pwd:"un-mot-de-passe", classes:["5B","5C"] },
```

| Champ | À quoi ça sert |
|---|---|
| `id` | l'identifiant de connexion, en `prenom.nom` sans accent |
| `p` / `n` | prénom et nom affichés |
| `pwd` | le mot de passe à lui transmettre |
| `classes` | son périmètre, écrit comme dans les copies : `"5B"`, `"4A"`… |

Le collègue se connecte par l'onglet **Élève** de la page d'accueil, avec cet
identifiant. Il arrive sur les capsules ; le bouton **« 📊 Suivi de mes classes »**
ouvre son tableau de suivi, et **« ← Retour aux capsules »** le ramène.

Pour retirer un accès, supprime sa ligne.

## Une limite à connaître

Le site est un **fichier statique** : `index.html` est téléchargé en entier par le
navigateur, et son code source contient en clair les codes des capsules, les mots de
passe des élèves et celui du professeur.

Ces restrictions **organisent le travail** ; elles ne constituent pas une barrière
technique. Un collègue qui ouvrirait le code source de la page verrait ces
informations, exactement comme le pourrait un élève aujourd'hui.

Pour une vraie barrière, il faudrait servir codes, mots de passe et corrigés depuis
le script Google après vérification du rôle, au lieu de les écrire dans la page.
C'est un chantier séparé.
