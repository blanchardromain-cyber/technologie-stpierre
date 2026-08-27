# Quiz de rentrée 4G — questionnaire + fiche élève dynamique

Remplace la « Fiche de renseignements personnels 4° » (version 2023).
Objectif : **te faire gagner du temps** (tu vois les élèves 1-2 fois/semaine) et **nourrir
l'orientation** (Parcours Avenir), sans redemander ce qu'EcoleDirecte sait déjà.

---

## 1. Ce que je change par rapport à la version 2023, et pourquoi

| Version 2023 | Décision | Raison |
|---|---|---|
| NOM, prénom, date de naissance, **adresse**, **4 numéros de téléphone**, professions des parents, e-mail parents, nom du responsable légal | ❌ **Supprimé** | Ces données sont **déjà dans EcoleDirecte**, à jour et fiables. Les recollecter dans un Sheet = doublon, risque d'erreur et **exposition RGPD inutile** (coordonnées de mineurs et de familles hors du logiciel officiel). En cas de besoin : ED. |
| « Possèdes-tu un téléphone / un compte réseau social ? » (OUI/NON) | 🔄 **Reformulé** | En 4e la réponse est ≈ 100 % oui : sans intérêt. Remplacé par des questions **utiles à la séance HVC harcèlement/numérique** : usages, ressenti, régulation. |
| Redoublement / saut de classe | ❌ **Supprimé** | Dans le dossier scolaire. Le redemander à l'élève est inutile et parfois stigmatisant. |
| Frères et sœurs | 🔄 **Optionnel** et reformulé (« place dans la fratrie ») | Utile pour comprendre le contexte, mais jamais obligatoire. |
| Loisirs, temps de devoirs | ✅ **Gardé**, structuré | C'était le plus utile — mais en texte libre, inexploitable. Passé en **cases + échelle** pour être filtrable. |
| Projet fin de 4e / orientation fin de 3e / métier / diplômes | ✅ **Gardé et enrichi** | Cœur du Parcours Avenir. Ajout du **degré de certitude** et des **besoins d'information**. |
| 23 affirmations en vrac | 🔄 **Réduit à 8 échelles** | 23 items = abandon en cours de route. 8 échelles ciblées (méthode, confiance, oral, concentration…) suffisent et se comparent d'un trimestre à l'autre. |
| — | ➕ **Ajouté** : besoins d'aide, ce qui aide à apprendre, un message libre au PP | Détecte tôt les difficultés que tu ne verrais pas en 1 h de cours/semaine. |

**Deux principes :** *ne jamais redemander ce qu'ED possède* · *toute question doit servir à une
décision concrète* (un placement, une séance HVC, un entretien, une appréciation).

---

## 2. Le questionnaire

> ⚙️ **Tu ne le crées pas à la main.** Le script `apps-script/1-CreerQuiz.gs` le fabrique
> entièrement (sections, listes, grilles, limites « 3 max », réglages du domaine, classeur de
> réponses). Le contenu ci-dessous est la référence : si tu veux changer une question, modifie
> le script puis relance-le — c'est plus rapide que de cliquer dans Forms. Voir §7.


**Titre :** `4G — Faisons connaissance (rentrée 2026)`
**Description :** *« Ce questionnaire m'aide à mieux te connaître pour t'accompagner cette année.
Il n'y a pas de bonne ou de mauvaise réponse, et il ne sera pas noté. Seul M. Blanchard le lit.
Compte environ 10 minutes. »*

**Réglages** (⚙️ dans Forms) — ⚠️ *les élèves de 4G n'ont pas de compte Google du collège* :
❌ **Collecter les adresses e-mail** · ❌ **Limiter à 1 réponse** · ❌ *pas de quiz/notation*.

> Ces deux premiers réglages **exigent une connexion Google** : les laisser cochés empêcherait
> purement et simplement les élèves d'envoyer le formulaire. L'identification repose donc
> uniquement sur la liste déroulante des 26 noms (question 1).
>
> Contrepartie assumée : **un élève peut répondre deux fois.** C'est traité, pas subi — la fiche
> élève affiche toujours la réponse **la plus récente** et signale « la plus récente sur 2 », et
> l'onglet `Bilan` passe la ligne en ⚠️ ambre. Les indicateurs comptent des **élèves distincts**,
> jamais des envois. En cas de doublon volontaire, supprime la ligne périmée dans `Reponses`.

### Section 1 — Qui es-tu ?
1. **Nom et prénom** · *Liste déroulante* avec les 26 élèves — **obligatoire**
   *(liste déroulante et non texte libre : zéro faute de frappe, donc les formules de la fiche marchent toujours)*
2. **Prénom d'usage (si différent de ton prénom officiel)** · Texte court · facultatif
3. **Ta place dans la fratrie** · Choix : `Enfant unique` / `Aîné(e)` / `Du milieu` / `Cadet(te)` · facultatif

### Section 2 — Ta vie en dehors du collège
4. **Tes activités régulières** · Cases à cocher · facultatif
   `Sport en club` · `Sport libre` · `Musique / danse / théâtre` · `Arts plastiques / dessin` ·
   `Jeux vidéo` · `Lecture` · `Association / bénévolat` · `Job / aide familiale` · `Aucune pour l'instant`
5. **Combien d'heures par semaine, au total ?** · Choix : `moins de 2 h` / `2 à 4 h` / `4 à 8 h` / `plus de 8 h`
6. **À quelle heure te couches-tu en semaine ?** · Choix : `avant 21 h` / `21 h-22 h` / `22 h-23 h` / `après 23 h`
   *(indicateur de fatigue très parlant en 4e — utile en conseil)*

### Section 3 — Ton travail scolaire
7. **Temps de travail personnel par jour** · Choix : `moins de 15 min` / `15-30 min` / `30 min-1 h` / `plus d'1 h`
8. **Où travailles-tu le plus souvent ?** · Choix : `chambre` / `pièce commune` / `étude au collège` / `ça dépend`
9. **Es-tu aidé(e) à la maison si tu bloques ?** · Choix : `oui, régulièrement` / `parfois` / `rarement` / `jamais`
10. **Ce qui t'aide le plus à comprendre** · Cases · max 3
    `Les explications orales` · `Écrire / recopier` · `Les schémas et images` · `Faire des exercices` ·
    `Expliquer à quelqu'un` · `Les vidéos` · `Travailler à plusieurs` · `Le calme total`
11. **Échelles 1 → 5** (1 = pas du tout, 5 = tout à fait) · *grille à une seule page*
    - Je sais m'organiser dans mon travail
    - J'arrive à me concentrer en classe
    - Je comprends ce qu'on attend de moi
    - J'ose poser une question quand je ne comprends pas
    - Je me sens à l'aise pour parler devant la classe
    - J'ai confiance en mes capacités
    - Je me sens bien dans la classe
    - Je viens au collège avec plaisir
12. **L'an dernier (en 5e), mes matières les plus faciles** · Cases (liste des matières) · max 3
13. **Cette année en 4e, les matières où je pense avoir le plus besoin d'aide** · Cases (mêmes matières) · max 3
    *(les deux temporalités sont dissociées volontairement : en septembre, « cette année » est
    ambigu. Le constat ne peut être que rétrospectif — c'est la seule expérience dont l'élève
    dispose ; le besoin, lui, est prospectif et c'est celui qui sert à monter les binômes.)*

### Section 4 — Ton avenir (Parcours Avenir)
14. **Après la 3e, tu penses plutôt à…** · Choix :
    `Seconde générale et technologique` / `Seconde professionnelle` / `CAP` / `Apprentissage` / `Je ne sais pas encore`
15. **À quel point es-tu sûr(e) de ce choix ?** · Échelle 1 → 5
16. **Un métier ou un domaine qui t'attire ?** · Texte court · facultatif
17. **Pourquoi celui-là ?** · Paragraphe · facultatif
18. **Sais-tu quelles études il faut faire pour y arriver ?** · Choix : `Oui, précisément` / `Vaguement` / `Pas du tout`
19. **Sur quoi aimerais-tu être informé(e) cette année ?** · Cases
    `Les métiers` · `Les filières après la 3e` · `Le stage de 3e` · `Les portes ouvertes` ·
    `Comment mieux m'organiser` · `Autre chose (je le dis en dessous)`

### Section 5 — Ce que tu veux me dire
20. **Y a-t-il quelque chose que je devrais savoir pour bien t'accompagner ?** · Paragraphe · facultatif
    *(santé, aménagement, situation familiale, timidité… — « tu écris seulement si tu veux »)*
21. **Un objectif personnel pour cette année** · Texte court · facultatif

---

## 3. Passation
Séance **HVC n°3 (semaine du 21/09) — « Méthodologie »**, en salle informatique ou sur téléphone
via le **Hub** (annonce avec le lien). 10 minutes. Les absents le font sur le temps de la semaine
suivante — vérifie la complétude avec la formule §4.6.

---

## 4. La fiche d'exploitation (le classeur de réponses)

Le script `apps-script/2-Exploitation.gs` construit **trois onglets** par-dessus l'onglet brut
`Reponses` — qu'il ne modifie jamais. Tout est formule : les onglets se mettent à jour tout seuls
à chaque nouvelle réponse.

### 4.1 `Fiche élève` — un menu déroulant, tout s'affiche
Aucun onglet par élève à maintenir. Tu choisis un nom en **B2**, et la fiche entière suit :
prénom d'usage, fratrie, activités, rythme de vie, méthode de travail, matières, avenir, message
libre. Les 8 échelles sont affichées **en jauge** (`████░`) avec un dégradé rouge → ambre → vert,
et la moyenne de l'élève est comparée à celle de la classe.

En bas, un bloc **⚠️ Signaux à regarder** s'allume tout seul : confiance ≤ 2, mal-être en classe,
oral difficile, coucher après 23 h, jamais aidé à la maison, moins de 15 min de travail, aucun
projet d'orientation, message libre écrit. S'il n'y a rien, le bandeau affiche
« ✅ aucun signal particulier » — c'est l'information la plus rapide à lire du classeur.

### 4.2 `Vue de classe` — les tendances, pour préparer les séances
Un bandeau d'indicateurs (réponses reçues, taux, confiance moyenne, élèves sans projet, couchés
tard), puis les tableaux de fréquence **avec 4 graphiques** : les 8 échelles, les intentions
d'orientation, l'heure du coucher, les matières où l'on demande de l'aide. Les blocs
« ce qui aide à comprendre » et « besoins d'information » alimentent directement le **plan de
classe** et les **séances HVC Parcours Avenir**.

### 4.3 `Bilan` — qui doit encore répondre
Les 26 élèves, ✅ / ❌, la date de réception, et une colonne « 💬 a écrit un message libre ».
Le menu **🎓 Quiz 4G → Qui n'a pas répondu ?** te donne la liste à relancer en une boîte de
dialogue.

### 4.4 Le pont avec le carnet de bord
Un onglet masqué `Ref` fait la correspondance **nom complet (quiz) ⇄ pseudonyme « Prénom N. »
(carnet)**. La fiche élève récupère ainsi les compteurs de l'onglet `Synthèse` du carnet (voir
`TABLEAU-DE-BORD.md`) sans que tu aies à harmoniser quoi que ce soit. Si l'onglet `Synthèse`
n'existe pas encore, les deux lignes affichent simplement « — ».

### 4.5 « Il n'a pas pris ma modification en compte » → menu 🎓 Quiz 4G → Diagnostic
Avant toute autre hypothèse, lance le **Diagnostic des colonnes**. Il affiche la ligne d'en-têtes
réelle de `Reponses`, colonne par colonne, puis la colonne retenue pour chaque question — et, si
une question n'est pas retrouvée, **le fragment de texte qu'il cherchait**. C'est la seule source
de vérité ; le reste est de la supposition.

Deux malentendus fréquents que ce diagnostic dissipe :

- **« La colonne Adresse e-mail est toujours là. »** Normal. Décocher la collecte des e-mails
  n'efface pas la colonne d'un classeur déjà relié : Google cesse simplement de la remplir. Le
  script ne touche jamais à `Reponses`, il ignore la colonne. Supprime-la à la main si elle te
  gêne — rien ne cassera, tout est repéré par libellé.
- **« J'ai renommé mes questions dans Forms, l'affichage n'a pas bougé. »** Normal aussi : les
  libellés affichés dans les trois onglets construits sont **écrits en dur dans le script**, pas
  repris du formulaire (les intitulés réels font 60-70 caractères et déborderaient des cellules).
  Pour les changer, édite les appels à `champ_()` et `sousBandeau_()` dans `2-Exploitation.gs`,
  puis relance `construireFiche()`.

### 4.6 Deux règles d'usage
- **N'écris rien à la main dans ces trois onglets** : ils sont supprimés et reconstruits à chaque
  exécution de `construireFiche()`.
- **Relance `construireFiche()` si tu modifies le formulaire.** Les colonnes sont retrouvées par
  le *libellé* des questions, jamais par leur position — l'ordre peut donc changer sans rien
  casser, mais un renommage impose de relancer (et d'aligner la constante `Q` du script).

---

## 5. Exploitation concrète

| Donnée | Ce que tu en fais |
|---|---|
| Ce qui aide à comprendre, besoin de calme | **Plan de classe** : placement, binômes de tutorat |
| Matières où l'élève a besoin d'aide | Repérer les binômes d'**entraide** (Hub) |
| Orientation + certitude + besoins d'info | Contenu des **séances HVC 12, 15 et 20** (Parcours Avenir) |
| Échelles confiance / oral / bien-être | Attention particulière ; comparaison si tu reposes le quiz en juin |
| Message libre | À lire **le soir même** : c'est là que se disent les choses importantes |
| Objectif personnel | À reprendre en entretien et en **appréciation** (touche personnelle, en complément) |

## 6. RGPD

- Aucune coordonnée (adresse, téléphone, e-mail des parents) : **elles restent dans EcoleDirecte**.
- Classeur **privé**, jamais partagé. Ne pas diffuser les réponses individuelles à l'équipe ;
  ne partager que des **tendances de classe** si besoin.
- Questions sensibles (§5) **facultatives**, avec la mention « tu écris seulement si tu veux ».
- Le questionnaire n'est **pas noté** et le dire dans la consigne : la sincérité en dépend.

---

## 7. Déploiement (une seule fois, ~5 minutes)

Les deux scripts sont dans `suivi-eleves/apps-script/`.

**Étape 1 — créer le formulaire et le classeur**
1. [script.google.com](https://script.google.com) → **Nouveau projet**, nomme-le « Quiz rentrée 4G »
2. Colle tout `1-CreerQuiz.gs` dans `Code.gs`
3. Fonction `creerQuiz` → **Exécuter** (première fois : *Avancé → Autoriser*)
4. Le **journal d'exécution** affiche 3 liens

**Étape 2 — brancher les DEUX portails**

⚠️ Les liens vivent à **deux endroits**, et c'est structurel : le portail PC lit
`donnees/config-portail.js`, mais le Cockpit nomade est servi par GitHub Pages depuis une autre
origine — il n'a **pas accès au dossier `donnees/`** (exclu de git) et code donc ses URLs **en
dur**.

| Où | Fichier | Comment |
|---|---|---|
| PC | `donnees/config-portail.js` | clés `quizForm`, `quizReponses`, `quizEdition` → les chips passent de *à configurer* à *en ligne* |
| Téléphone | `pp4g/index.html`, tuile « Privé Drive » | URLs écrites en dur dans les deux rangées « Quiz » |

**Si tu recrées un jour le formulaire** (les URLs changent), pense aux deux. Et après toute
modification de `pp4g/`, **incrémente `CACHE_VERSION` dans `pp4g/sw.js`** — sinon le téléphone
continue de servir l'ancienne page depuis son cache. La modification n'atteint le téléphone
qu'**après un push** (le nomade est servi par GitHub Pages, pas depuis ce PC).

**Étape 3 — mettre en page le classeur**
1. Ouvre le classeur créé (lien `quizReponses`)
2. **Extensions → Apps Script**, colle tout `2-Exploitation.gs` dans `Code.gs`
3. Exécute `construireFiche()`
4. Recharge le classeur : le menu **🎓 Quiz 4G** apparaît

**Étape 4 — vérifier avant la séance**
Réponds toi-même au formulaire une fois, puis relance `construireFiche()` : tu vois immédiatement
si les colonnes sont bien retrouvées. Supprime ensuite ta ligne de test dans `Reponses`.

> ⚠️ Si le script s'arrête sur « Colonne introuvable pour … », c'est qu'un intitulé de question a
> été modifié dans Forms. Aligne la constante `Q` de `2-Exploitation.gs` sur l'intitulé réel, et
> relance.

**En cas d'arrivée / départ d'élève :** mets à jour la liste `ELEVES` **dans les deux scripts**
(elle sert à la liste déroulante du formulaire *et* au suivi de complétude), puis relance
`creerQuiz()` n'est pas nécessaire — il suffit de corriger la liste déroulante dans Forms et de
relancer `construireFiche()`.
