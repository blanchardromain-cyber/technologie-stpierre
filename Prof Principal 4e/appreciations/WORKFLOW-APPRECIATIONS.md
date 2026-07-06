# Appréciations générales PP — workflow 3 trimestres (4G)

Tiroir 🟪 (rédaction avec Claude) + 🟥 (les exports et brouillons restent dans `../donnees/appreciations/`, hors git).
Règle dure : **≤ 400 caractères** par appréciation, garantie par comptage script (jamais « à l'œil »).

## Une fois : le profil de style

Le fichier [PROFIL-STYLE.md](PROFIL-STYLE.md) définit ta plume (registre, formules, règles de tonalité).
Il est pré-rempli avec des choix par défaut raisonnables : **relis-le et corrige-le une fois** —
ensuite chaque trimestre repart de ce profil, et tes 26 appréciations restent homogènes.

## À chaque trimestre (~30 min au lieu de 2-3 h)

1. **Exporter** depuis EcoleDirecte la vue conseil de classe / bulletins de la 4G
   (PDF, Excel ou CSV — peu importe, Claude lit les trois).
2. **Déposer** le fichier dans `../donnees/appreciations/T1/` (ou T2, T3).
3. **Dire à Claude** : « Appréciations T1 » (ou T2/T3).
4. Claude déroule alors :
   - lecture de l'export + contrôle (« 26 élèves, N matières détectées ») ;
   - à partir du **T2** : lecture aussi du trimestre précédent → formulation de la **progression**
     (« confirme les progrès du T1 », « le fléchissement se poursuit »…) ;
   - *optionnel* : si tu fournis l'onglet Synthèse du **Tableau de bord 4G** (`../suivi-eleves/`),
     je m'en sers **en complément** pour ajuster la tonalité — jamais comme source des faits, qui
     restent les appréciations des professeurs dans EcoleDirecte ;
   - rédaction d'une synthèse par élève selon le profil de style :
     signal dominant + point fort + axe de progrès + tonalité ;
   - **comptage par script** de chaque texte, réécriture automatique de tout dépassement ;
   - contrôles : cohérence note/texte, aucun élève manquant ou interverti, aucun fait inventé ;
   - restitution en tableau `Élève | Appréciation | nb car.` prêt à copier-coller dans EcoleDirecte.
5. **Toi** : relecture, ajustements (dis à Claude « adoucis Untel », « sois plus ferme avec Untel »),
   copier-coller dans EcoleDirecte. C'est toi qui valides chaque texte — Claude propose, tu signes.

## Calendrier (rappels)

| Trimestre | Export à déposer | Conseil (indicatif) |
|---|---|---|
| T1 | fin novembre | début décembre |
| T2 | fin février | début mars |
| T3 | fin mai | début juin |

Option : demander à Claude de programmer un rappel automatique une semaine avant chaque conseil.

## Règles RGPD

- Les exports EcoleDirecte restent dans `../donnees/` (hors git, jamais publiés).
- La rédaction se fait avec les **prénoms seuls** dès que possible.
- Aucune automatisation d'EcoleDirecte (pas de connexion scriptée) : **un export manuel** par trimestre, c'est tout.
