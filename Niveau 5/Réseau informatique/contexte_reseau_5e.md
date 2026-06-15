# Contexte — Séance manipulation réseau 5ème

## Enseignant

Romain — Professeur de Technologie, Collège Saint-Pierre, Les Essarts (85) RUPN (Référent Usages Pédagogiques du Numérique)

---

## Objectif de la séance

Dernière séance de l'année sur la **Séquence 1 : organisation, structure et fonctionnement d'un réseau informatique** (niveau 5ème, Cycle 4).  
Complément pratique orienté **manipulation** pour confirmer les observations de l'Activité 1 théorique et approfondir le fonctionnement.

---

## Contraintes techniques

- Classe de **5ème** (Cycle 4\)  
- **30 minutes** (dernier cours)  
- PC sous **Windows 11** avec accès Internet  
- **PowerShell** accessible aux élèves  
- **Pas d'installation possible** (pas Cisco Packet Tracer, etc.)  
- Outils natifs Windows uniquement : `ipconfig`, `ping`, `tracert`  
- 1 ou 2 **switchs physiques** visibles dans la salle  
- Format retenu : **travail en binôme en salle de technologie** — les élèves manipulent eux-mêmes PowerShell (1 tape / 1 observe, rôles alternés) et complètent la fiche. Le travail est **envoyé au professeur** (Google Sheet, mode prof du Site Techno).

---

## Fichiers produits

### 1\. `Seance_Manipulation_Reseau_5e.docx`

Fiche **professeur** au format Word.

- En-tête bleu nuit (Collège Saint-Pierre / Séquence 1\)  
- 4 étapes chronométrées avec : rappel notion, bloc commande terminal, tableau questions/réponses attendues  
- Tableau de synthèse final : Notion Activité 1 → Commande → Ce que ça confirme  
- Note enseignant en vert (tips gestion de classe, lien IP lookup, gestion Ctrl+C)  
- Pied de page avec numérotation

### 2\. `reseau_eleve.html`

Fiche **élève** interactive, standalone HTML (aucune dépendance externe sauf Google Fonts).

- En-tête : champs **Élève 1 / Élève 2** (binôme), Classe, Date  
- Barre de progression temps réel (pastilles vertes par question)  
- 4 étapes : rappel notion \+ bloc terminal dark avec bouton "Copier" \+ zones textarea  
- Étape 4 spécifique : compteur voyants switch, sélecteur couleur avec dot animé, schéma à compléter  
- Tableau de synthèse (5 lignes, une par notion de l'Activité 1\)  
- Bannière félicitations à 100 %  
- Bouton **Imprimer** (CSS print propre, fond blanc)  
- **Sauvegarde automatique** du brouillon sur le PC (anti-perte en cas de rafraîchissement) \+ restauration au rechargement  
- Bouton **Envoyer au professeur** : POST vers le backend Apps Script partagé (`cap: "reseau5e"`), avec filet hors-ligne (file d'attente rejouée au chargement). La soumission apparaît dans le **tableau de bord prof** du Site Techno et dans le Google Sheet `Submissions`.  
- Bouton **Copie de secours** (export JSON local de secours)  
- Responsive mobile \+ respect `prefers-reduced-motion`

---

## Contenu pédagogique des 4 étapes

| \# | Titre | Commande | Durée | Notions confirmées |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Mon PC dans le réseau | `ipconfig` | \~7 min | Adresse IP, passerelle, WiFi vs câble |
| 2 | Suis-je vraiment connecté ? | `ping 8.8.8.8` / `ping www.google.fr` | \~7 min | Connectivité, DNS, pare-feu |
| 3 | Le chemin des données | `tracert www.google.fr` | \~8 min | Routeurs, internet \= réseau de réseaux |
| 4 | Observer le switch physique | Observation \+ `ipconfig` déco/reco | \~8 min | Switch, topologie étoile, DHCP |

---

## Prochaine étape

**Déploiement sur GitHub Pages** du fichier `reseau_eleve.html`.  
Romain héberge habituellement ses outils pédagogiques sur GitHub Pages (pattern habituel : dépôt public, fichier `index.html` ou HTML nommé à la racine ou dans un sous-dossier).

Le fichier est prêt, standalone, aucune dépendance locale. Il suffit de le pousser tel quel.  
