# Carnet de bord 4G (suivi du règlement) — guide de déploiement

Même montage que le Hub et PSC1. **Mêmes codes élèves** (une seule carte par élève pour tout).

## Fonctionnement (validé)

- Le prof/personnel écrit la remarque dans le **carnet papier** (inchangé, les parents signent).
- L'élève **reporte lui-même** la remarque dans le module : date, matière, catégorie
  (Travail personnel / Attitude au collège — les colonnes du carnet), précision, signature parents.
- **À chaque report** : e-mail automatique au PP (détail + historique complet + total,
  ⚠️ dans l'objet dès le seuil de 5).
- À **5 remarques** : l'élève voit l'invitation à venir échanger ; le PP décide de la suite
  (retenue plus probable si dominante « attitude »).
- **Alerte équipe** : bouton par élève dans la vue prof → e-mail récapitulatif aux collègues
  + vie scolaire (adresses dans l'onglet Config). Envoi **uniquement sur clic volontaire du prof**.
- Plus besoin de viser les carnets papier un par un : le tableau de bord fait le suivi,
  le visa papier peut se faire par sondage.

## Déploiement

1. Google Sheet privé `Carnet 4G` → Apps Script → coller `apps-script/Code.gs` → exécuter `initialiser`.
2. Onglet **Codes** : coller `code · pseudo · role` depuis `../donnees/codes-eleves-4G.csv` (sans noms complets).
3. Onglet **Config** : vérifier `emailProf` et renseigner `emailsEquipe`
   (les adresses des profs de la 4G + viesco@ — voir `../donnees/eleves-4G.json`).
4. Déployer en application Web (exécuter en tant que : moi · accès : tout le monde) —
   **la première exécution demandera l'autorisation d'envoyer des e-mails** (MailApp) : accepter.
5. Coller l'URL dans `BACKEND_URL` de `index.html`, publier sur Pages (dépôt `hub-4g` ou dédié).

Mode démo tant que `BACKEND_URL` est vide : `DEMO1`, `DEMO2` (élèves), `PROF1` (prof).

## RGPD / cadre

- Données disciplinaires pseudonymisées côté Sheet (pseudo « Prénom N. » ; correspondance
  complète uniquement dans ton CSV local).
- E-mails limités au besoin d'en connaître (PP, puis équipe sur décision du PP).
- Le report par l'élève est déclaratif : le carnet papier signé reste la référence en cas d'écart.
- À présenter au chef d'établissement avec le Hub (même dossier de démonstration).
