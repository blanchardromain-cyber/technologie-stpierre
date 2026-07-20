# Module Retenues 4G — mode d'emploi

Tiroir 🟦 (données disciplinaires — accès restreint équipe).
Décision D5 : **rien n'est envoyé automatiquement** — le PP relit et envoie lui-même.

**Le principe, en une phrase :** tu remplis un formulaire une fois, l'outil écrit les lignes
dans le registre partagé et prépare tes messages ; les collègues n'ont plus qu'à passer
« Travail fourni » à **OUI**.

---

## 1. Mise en place (une seule fois)

### 1.1 Le registre
Classeur partagé : `https://docs.google.com/spreadsheets/d/1lfF5yuwpLlmfDEDmeFx6NkJ7lK7o0Iln1m4aA5DnBJQ/edit`
Partagé **en écriture** aux enseignants de la 4G + vie scolaire. **Jamais de lien public.**

### 1.2 Les colonnes de l'onglet `Retenues` (ordre imposé)

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Date | Créneau | Élève | Motif | **Matière** | **Professeur** | **Travail fourni** | Notes PP |

> ⚠️ Si ton onglet a encore les anciennes colonnes, remplace la ligne 1 par celle-ci.
> **Une ligne = une matière sollicitée** (c'est ce qui permet à chaque collègue de pointer la sienne).

### 1.3 Le menu déroulant « Travail fourni » (colonne G)
Sélectionne **G2:G500** → menu **Données → Validation des données** → *Liste d'éléments* :
`OUI` , `NON` → Enregistrer.
Ajoute une mise en forme conditionnelle (vert si OUI, rouge si NON) pour lire d'un coup d'œil.

### 1.4 Autoriser l'écriture automatique (une fois)
Le report est réalisé par le **backend du Hub**, qui doit être autorisé à écrire dans ce classeur :
Sheet **Hub 4G** → Apps Script → coller le `Code.gs` à jour → exécuter **`initialiser`** →
accepter l'autorisation supplémentaire demandée (accès au registre) → **Déployer → Gérer les
déploiements → ✏️ → Nouvelle version**.

---

## 2. À chaque retenue (≈ 1 minute)

Ouvre l'outil **⚖️ Retenue** (portail PC ou Cockpit PP) :

1. **Élève**, **date**, **créneau** (Soir 1 h / Mercredi matin 4 h), **motif** (factuel, bref).
2. **Coche les matières sollicitées** — les professeurs concernés s'affichent.
   *Soir : 1-2 matières liées au motif. Mercredi : bouton « Tout cocher ».*
3. **⚙️ Générer les 3 messages**.
4. **📤 Reporter dans le registre** → une ligne par matière est écrite automatiquement
   (Date · Créneau · Élève · Motif · Matière · Professeur), colonne « Travail fourni » laissée vide.
   *Le code PROF t'est demandé la première fois, puis mémorisé.*
5. **✉️ Ouvrir dans Gmail** → le message est pré-adressé (profs cochés + vie scolaire) et
   pré-rempli. Tu relis, tu envoies.
6. **💬 Message parents** → copier, coller dans EcoleDirecte. *(ou 📞 la trame d'appel)*

## 3. Ce que font les collègues

Ils reçoivent le mail, ouvrent le lien du registre, trouvent **leur ligne déjà remplie**
et passent simplement **« Travail fourni » à OUI** après avoir déposé le travail dans ton casier.
Rien à saisir, rien à créer.

## 4. Ton suivi

Filtre le registre sur `Travail fourni` = vide → tu vois immédiatement qui n'a pas encore fourni,
la veille de la retenue. La colonne **Notes PP** te sert pour le suivi (appel passé, absence, report).

---

## Règles

- Motif **factuel et bref** : il est lu par toute l'équipe et écrit dans un classeur partagé.
- Destinataires limités aux personnels concernés (professeurs cochés + vie scolaire).
- Aucun envoi automatique : Gmail s'ouvre **pré-rempli**, tu gardes la main.
- Adresses e-mail de l'équipe : `../donnees/eleves-4G.json` (hors git).
- Historique : on n'efface pas les lignes (traçabilité conseil / dialogue familles).

## En cas de souci

| Symptôme | Cause probable | Solution |
|---|---|---|
| « backend Hub à mettre à jour » | `Code.gs` du Hub pas redéployé | §1.4 |
| « Réservé au professeur » | mauvais code PROF | code dans `donnees/codes-eleves-4G.csv` |
| Lignes écrites au mauvais endroit | onglet mal nommé | l'onglet doit s'appeler **`Retenues`** |
| Pas de professeurs proposés | données importées sans la liste des profs | réimporter le JSON complet |
