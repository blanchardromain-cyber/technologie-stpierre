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

Aucun mot de passe ne s'écrit à la main dans `index.html` (règle 8 de CLAUDE.md).
Dans le dossier du site, lance :

```bash
python outils/coffre.py ajouter --id claire.moreau --prenom Claire --nom MOREAU --enseignant --classes 5B,5C
```

(Sur ton poste, remplace `python` par le chemin de Python 3.12 :
`C:\Users\blanchard.romain\AppData\Local\Programs\Python\Python312\python.exe`.)

Le script demande ton mot de passe professeur (il ouvre le coffre), ajoute la ligne
dans `var ENSEIGNANTS = [` et affiche **une fois** le mot de passe généré, à
transmettre au collègue. Tu le retrouves ensuite dans l'onglet **Configuration**.

| Champ écrit | À quoi ça sert |
|---|---|
| `id` | l'identifiant de connexion, en `prenom.nom` sans accent |
| `p` / `n` | prénom et nom affichés |
| `h` | l'empreinte du mot de passe, jamais le mot de passe lui-même |
| `classes` | son périmètre, écrit comme dans les copies : `"5B"`, `"4A"`… |

Le collègue se connecte par l'onglet **Élève** de la page d'accueil, avec cet
identifiant. Il arrive sur les capsules ; le bouton **« 📊 Suivi de mes classes »**
ouvre son tableau de suivi, et **« ← Retour aux capsules »** le ramène.

Pour retirer un accès, supprime sa ligne.

## Comptes ouverts

| Collègue | Identifiant | Classes |
|---|---|---|
| Régis LUCAS | `regis.lucas` | 5B · 5C · 5D · 5E · 5F |
| Mélanie BÉNÉTEAU (stagiaire, tutorat) | `melanie.beneteau` | aucune (consultation des capsules) |

Les mots de passe ne sont écrits nulle part en clair : tu les retrouves dans l'onglet
**Configuration**, une fois connecté.

## Donner sa clé à un collègue

Depuis le 7 octobre 2026, la liste des copies est fermée par le script Google. Chaque
collègue qui a des classes reçoit **sa propre clé**, qui n'ouvre que ses classes :

1. Choisis une clé d'au moins 12 caractères (une phrase de passe suffit). Ne l'écris
   ni dans le dépôt, ni dans un message : remets-la de vive voix ou sur papier.
2. Apps Script › Paramètres du projet › Propriétés du script › **Ajouter** :
   - propriété : `COLLEGUE_` suivi de son identifiant (ex. `COLLEGUE_regis.lucas`) ;
   - valeur : `{"cle":"LA-CLÉ","classes":["5B","5C","5D","5E","5F"]}`.
3. À sa prochaine connexion, le site lui demande la clé, une fois par navigateur.

Ce sont les classes de la propriété qui comptent, pas celles d'`index.html` : garde
les deux identiques. Pour retirer l'accès, supprime la propriété. Un collègue sans
classe (consultation seule) n'a pas besoin de clé.

## Une limite à connaître

Le site est un **fichier statique** : `index.html` est téléchargé en entier par le
navigateur. Depuis le 30 septembre 2026, il ne contient plus aucun mot de passe ni
code d'accès en clair, seulement des empreintes et un coffre chiffré.

Mais la vérification se fait dans le navigateur. Une personne à l'aise avec la
console peut encore la contourner, et la clé du script Google reste publique. Ces
restrictions **organisent le travail** ; elles ne sont pas encore une barrière
technique. Depuis le 7 octobre 2026, le script Google vérifie **qui lit** la liste
des copies (clé du professeur, clé de chaque collègue) ; vérifier **qui écrit** reste
l'étape 3 du chantier sécurité.
