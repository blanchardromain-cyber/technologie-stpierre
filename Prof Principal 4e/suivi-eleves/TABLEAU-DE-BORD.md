# Tableau de bord 4G — suivi élèves & synthèse conseil

Tiroir 🟦 (privé Drive). Objectif : voir d'un coup d'œil, **par élève**, le cumul des remarques
du Carnet de bord (travail / attitude, par trimestre) pour préparer les conseils.

## ⚠️ Place dans la préparation de l'appréciation (à garder en tête)

Ce tableau est un **complément**. Il **ne remplace pas** l'analyse de **l'ensemble des appréciations
des professeurs saisies dans EcoleDirecte**, qui reste la base. Il apporte des **faits datés** qui
affinent la *tonalité* — rien de plus.

---

# Méthode recommandée : un onglet DANS le classeur Carnet 4G

C'est de loin le plus simple : **pas d'IMPORTRANGE, pas d'autorisation, pas d'identifiant à copier.**
Les formules lisent directement l'onglet `Remarques` du même classeur.

### Étape 1 — créer l'onglet
1. Ouvre ton classeur **Carnet 4G** (celui avec les onglets `Codes`, `Remarques`, `Rdv`, `Config`).
2. En bas, clique le **+** pour ajouter une feuille. Double-clique son nom → appelle-la **`Synthèse`**.

### Étape 2 — les en-têtes (ligne 1)
Clique en **A1** et tape ces 7 intitulés, un par colonne (A à G) :

| A1 | B1 | C1 | D1 | E1 | F1 | G1 |
|---|---|---|---|---|---|---|
| Élève | Total | Travail | Attitude | T1 | T2 | T3 |

### Étape 3 — la liste des élèves (une seule formule)
Clique en **A2**, tape ceci, puis **Entrée** :

```
=UNIQUE(FILTER(Remarques!C2:C;Remarques!C2:C<>""))
```

La liste des élèves ayant au moins une remarque se remplit toute seule, et se complétera
automatiquement à l'avenir.

### Étape 4 — les compteurs
Clique en **B2** et tape la 1re formule, puis **C2**, **D2**… (une par colonne) :

```
=COUNTIF(Remarques!$C:$C;$A2)
```
```
=COUNTIFS(Remarques!$C:$C;$A2;Remarques!$F:$F;"Travail personnel")
```
```
=COUNTIFS(Remarques!$C:$C;$A2;Remarques!$F:$F;"Attitude au collège")
```
```
=COUNTIFS(Remarques!$C:$C;$A2;Remarques!$D:$D;">="&DATE(2026;9;1);Remarques!$D:$D;"<="&DATE(2026;11;20))
```
```
=COUNTIFS(Remarques!$C:$C;$A2;Remarques!$D:$D;">"&DATE(2026;11;20);Remarques!$D:$D;"<="&DATE(2027;2;19))
```
```
=COUNTIFS(Remarques!$C:$C;$A2;Remarques!$D:$D;">"&DATE(2027;2;19))
```

### Étape 5 — étendre vers le bas
Sélectionne **B2:G2**, puis **attrape le petit carré bleu** en bas à droite de la sélection et
**tire vers le bas jusqu'à la ligne 35** (marge pour toute la classe). C'est tout.

### Étape 6 (optionnel) — repérer les seuils
Sélectionne **E2:G35** → menu **Format → Mise en forme conditionnelle** →
« Supérieur ou égal à » **5** → fond rouge. Les élèves au seuil d'entretien sautent aux yeux.

---

## Les 3 pièges qui font échouer les formules

1. **`#NAME?`** → tu as collé depuis un document et les guillemets sont devenus « courbes ».
   **Solution : retape les guillemets `"` directement dans Sheets**, ou tape la formule à la main.
2. **Erreur d'analyse / `#ERROR!`** → séparateur. Ici les formules utilisent le **point-virgule `;`**
   (classeur en français). Si ton classeur est en anglais, remplace **tous les `;` par des `,`**.
3. **Les colonnes T1/T2/T3 renvoient 0** → la colonne `Remarques!D` contient du texte et non des
   dates. Sélectionne la colonne D → **Format → Nombre → Date**. Sinon, utilise la variante texte :
   `=COUNTIFS(Remarques!$C:$C;$A2;Remarques!$D:$D;">=2026-09-01";Remarques!$D:$D;"<=2026-11-20")`

> Repère des colonnes de l'onglet `Remarques` (ne pas les déplacer) :
> **A** id · **B** ts · **C** élève · **D** date · **E** matière · **F** catégorie · **G** précision · **H** parents

---

# Variante : un classeur séparé (si tu y tiens)

Utile seulement si tu veux **aussi** croiser les retenues (qui vivent dans un autre classeur).
Dans ton classeur « Tableau de bord », crée un onglet `Import_Carnet`, et en **A1** :

```
=IMPORTRANGE("COLLE_ICI_L_URL_DU_CARNET_4G";"Remarques!A:H")
```

Remplace `COLLE_ICI_L_URL_DU_CARNET_4G` par l'URL complète du classeur Carnet (barre d'adresse),
guillemets compris. Une bulle **`#REF!`** apparaît → clique dessus → **Autoriser l'accès**.
Idem pour les retenues, dans un onglet `Import_Retenues` :

```
=IMPORTRANGE("https://docs.google.com/spreadsheets/d/1lfF5yuwpLlmfDEDmeFx6NkJ7lK7o0Iln1m4aA5DnBJQ/edit";"Retenues!A:H")
```

Puis les formules de l'étape 4 en remplaçant `Remarques!` par `Import_Carnet!`.

---

## Utilisation avant un conseil

1. Ouvre l'onglet **Synthèse** : évolution travail/attitude par trimestre, par élève.
2. Rédige tes appréciations **d'abord** à partir des appréciations des collègues (EcoleDirecte).
3. Optionnel : décris-moi cet onglet quand on lance « Appréciations Tx » — je m'en sers
   **en complément** pour ajuster la tonalité, jamais comme source unique.

## RGPD

Classeur **privé**, jamais partagé. L'onglet ne contient que des **pseudonymes** (« Prénom N. ») ;
la correspondance avec les noms complets reste dans ton fichier local `donnees/`.
Rien de nouveau n'est stocké : l'onglet ne fait que **compter** des données déjà existantes.
