# Tableau de bord 4G — suivi élèves & synthèse conseil

Tiroir 🟦 (privé Drive). Objectif : **consolider en un seul endroit** ce que tes outils
produisent déjà (Carnet de bord, Retenues), pour préparer les conseils sans tout ressaisir.

## ⚠️ Place dans la préparation de l'appréciation (à garder en tête)

Ce tableau est un **complément** pour formuler l'appréciation générale du PP. Il **ne remplace pas**
l'analyse de **l'ensemble des appréciations des professeurs saisies dans EcoleDirecte**, qui reste
la base. Le tableau apporte des **faits datés** (remarques travail/attitude, retenues) qui affinent
la *tonalité* — rien de plus.

## Mise en place (~10 min, une fois)

1. Dans ton Drive : **Nouveau → Google Sheets**, nomme-le **« Tableau de bord 4G »** (privé, non partagé).
2. Crée 3 onglets d'import + 1 onglet de synthèse (détails ci-dessous). À la 1re formule IMPORTRANGE,
   Google affiche `#REF!` → clique dessus → **Autoriser l'accès** (une fois par classeur source).

### Onglet « Import_Carnet »
En A1 (remplace l'URL par celle de **ton** classeur Carnet 4G) :
```
=IMPORTRANGE("https://docs.google.com/spreadsheets/d/ID_DU_CARNET_4G"; "Remarques!A:H")
```

### Onglet « Import_Retenues »
En A1 (URL déjà connue — ton registre) :
```
=IMPORTRANGE("https://docs.google.com/spreadsheets/d/1lfF5yuwpLlmfDEDmeFx6NkJ7lK7o0Iln1m4aA5DnBJQ"; "Retenues!A:H")
```

### Onglet « Synthèse » (le cœur)
- **Colonne A** : la liste des élèves (pseudos « Prénom N. »). Colle-la depuis
  `../donnees/codes-eleves-4G.csv` (colonne `pseudo`), ou en B1 d'un coin : `=UNIQUE(Import_Carnet!C2:C)`.
- Puis, à partir de la ligne 2, ces formules (bornes de trimestre = celles du Carnet :
  T1 jusqu'au 30/11/2026, T2 jusqu'au 10/03/2027) :

| Colonne | Formule (à tirer vers le bas) |
|---|---|
| Remarques T1 | `=COUNTIFS(Import_Carnet!C:C;$A2;Import_Carnet!D:D;">="&DATE(2026,9,1);Import_Carnet!D:D;"<="&DATE(2026,11,30))` |
| Remarques T2 | `=COUNTIFS(Import_Carnet!C:C;$A2;Import_Carnet!D:D;">"&DATE(2026,11,30);Import_Carnet!D:D;"<="&DATE(2027,3,10))` |
| Remarques T3 | `=COUNTIFS(Import_Carnet!C:C;$A2;Import_Carnet!D:D;">"&DATE(2027,3,10))` |
| dont Attitude (année) | `=COUNTIFS(Import_Carnet!C:C;$A2;Import_Carnet!F:F;"Attitude au collège")` |
| dont Travail (année) | `=COUNTIFS(Import_Carnet!C:C;$A2;Import_Carnet!F:F;"Travail personnel")` |
| **Observations PP** | *(colonne libre, tu écris à la main)* |

> Astuce mise en forme conditionnelle : surligne en rouge les cellules « Remarques Tx » ≥ 5
  (le seuil d'entretien) pour repérer d'un coup d'œil.

## Utilisation avant un conseil

1. Ouvre l'onglet **Synthèse** : tu as, par élève, l'évolution travail/attitude sur les 3 trimestres
   + tes observations.
2. Tu rédiges tes appréciations **d'abord** à partir des appréciations des collègues (EcoleDirecte).
3. Optionnel : tu me déposes une copie de cet onglet (ou tu me le décris) quand on lance
   « Appréciations Tx » — je m'en sers **en complément** pour ajuster la tonalité, jamais comme source unique.

## RGPD

- Classeur **privé**, jamais partagé. Les onglets Import ne contiennent que des **pseudonymes**
  (« Prénom N. ») ; la correspondance avec les noms complets reste dans ton fichier local `donnees/`.
- Rien de nouveau n'est stocké : le tableau ne fait que **refléter** des données déjà existantes.
