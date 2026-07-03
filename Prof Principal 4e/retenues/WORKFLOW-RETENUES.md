# Module Retenues 4G — workflow

Tiroir 🟦 (données disciplinaires — accès restreint équipe) + 🟪 (rédaction avec Claude).
Décision D5 du plan directeur : **e-mails toujours en brouillon** (le PP relit et envoie),
suivi « travail fourni » dans un **Sheet partagé équipe**.

## Mise en place (une fois)

1. Importer `../donnees/registre-retenues-4G.xlsx` dans Drive (**ouvrir avec Google Sheets**
   puis « Enregistrer au format Google Sheets »).
2. Le partager **uniquement** aux enseignants de la 4G + vie scolaire (adresses dans
   `../donnees/eleves-4G.json`), en écriture. **Pas de lien public.**
3. Copier l'URL du Sheet → la coller dans la variable `LIEN_REGISTRE` ci-dessous (à la main).

`LIEN_REGISTRE = https://docs.google.com/spreadsheets/d/1lfF5yuwpLlmfDEDmeFx6NkJ7lK7o0Iln1m4aA5DnBJQ/edit`

## À chaque retenue (2 minutes)

Dire à Claude, par exemple :

> Retenue : [Prénom Nom], mercredi 15/09 matin, motif « refus de travail répété en français ».

Claude fait alors :
1. **Brouillon Gmail** aux profs de la classe + vie scolaire (modèle A) — *jamais envoyé
   directement : tu relis, tu cliques Envoyer*.
2. **Message parents** prêt à coller dans EcoleDirecte (modèle B) — ou script d'appel (modèle C)
   si tu préfères téléphoner.
3. Te rappelle d'ajouter la ligne au registre (10 secondes, menus déroulants).

## Modèle A — e-mail collègues (brouillon Gmail)

> **Objet :** Retenue [Prénom NOM] (4G) — [date] · [créneau]
>
> Bonjour,
>
> [Prénom NOM] (4G) est retenu(e) le **[date]**, créneau **[Soir 17h-18h / Mercredi 8h30-12h30]**.
> Motif : [motif].
>
> Merci de déposer du travail pour ce créneau dans le registre (colonne « Travail fourni »),
> au plus tard la veille : [LIEN_REGISTRE]
>
> Cordialement,
> R. Blanchard — PP 4G

## Modèle B — message parents (EcoleDirecte)

> Madame, Monsieur,
>
> Je vous informe que [Prénom] est retenu(e) le **[date]** de **[horaires]** pour le motif
> suivant : [motif].
> Cette retenue est consacrée à du travail scolaire fourni par les enseignants.
> Merci de prendre vos dispositions pour le retour de [Prénom] à l'issue de la retenue.
> Je reste à votre disposition pour en parler.
>
> Cordialement,
> R. Blanchard — professeur principal de 4G

## Modèle C — script d'appel téléphonique parents

1. Se présenter : PP de 4G. Vérifier qu'on parle bien au responsable légal.
2. Énoncer les faits (factuel, sans jugement) : « [Prénom] a [faits datés]. »
3. Annoncer la mesure : retenue le [date], [horaires], avec travail scolaire.
4. Question logistique : le retour à la maison ce jour-là est-il possible ?
5. Ouvrir le dialogue : « De votre côté, avez-vous remarqué quelque chose ? »
6. Conclure : objectif commun, point de suivi si besoin. → Noter l'appel dans le registre (Notes PP).

## Règles

- Motif **factuel et bref** dans les e-mails (données disciplinaires → destinataires limités).
- Le registre n'est jamais public ; les élèves n'y ont pas accès.
- Adresses e-mail de l'équipe : `../donnees/eleves-4G.json` (hors git). Vie scolaire : à ajouter.
- Historique : une ligne par retenue, on ne supprime rien (traçabilité pour conseil/dialogue familles).
