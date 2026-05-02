# Automatisation du planning de Paul

Ce dossier contient un système qui régénère `index.html` automatiquement chaque
lundi à 07h00 (heure de Paris) via GitHub Actions — sans dépendre du PC de
M. Blanchard.

## Comment ça marche

```
unlock-config.json   ←  source de vérité (dates, codes, titres)
        +
template.html.j2     ←  gabarit visuel
        ↓
   generate.py        ←  rend le HTML selon la date du jour
        ↓
    index.html        ←  fichier publié sur GitHub Pages
```

Le workflow `.github/workflows/unlock-suivi-paul.yml` :
1. Tourne chaque lundi à 07h00 Paris (5h UTC en été, 6h UTC en hiver)
2. Exécute `generate.py` sur les serveurs GitHub
3. Commit & push `index.html` si quelque chose a changé

Vous pouvez aussi le déclencher à la main depuis l'onglet **Actions** de votre
dépôt GitHub (`Run workflow`).

## Workflow hebdomadaire pour vous

**Avant le lundi de la semaine N**, vous éditez `unlock-config.json` :
- Vous renseignez le `code`, le `title`, l'`activity_html` de la semaine N
- Vous poussez le fichier sur GitHub (commit normal)

**Lundi 07h00**, le workflow s'exécute tout seul :
- Il lit `unlock-config.json`
- Il calcule que la date du jour ≥ `active_from` de la semaine N
- Il régénère `index.html` avec la semaine N en "active" et la semaine N-1 en "done"
- Il commit/push automatiquement
- GitHub Pages publie la nouvelle version dans la minute

## Statuts possibles d'une semaine

| Statut    | Quand                                          | Affichage              |
| --------- | ---------------------------------------------- | ---------------------- |
| `soon`    | Avant `active_from` ET `activity_label` vide   | "À planifier" (gris)   |
| `locked`  | Avant `active_from` ET `activity_label` rempli | "Code à venir" (cadenas) |
| `active`  | `active_from` ≤ aujourd'hui < `done_from`      | "En cours" (bleu)      |
| `done`    | aujourd'hui ≥ `done_from`                      | "Terminé ✅" (vert)    |

Le code n'apparaît dans la boîte que si la semaine est `active` ou `done` ET
qu'un `code` est renseigné. Sinon c'est la boîte "verrouillée" qui s'affiche.

## Tester en local avant de pousser

```bash
cd suivi-paul
pip install jinja2

# Diagnostic — n'écrit rien
python generate.py --check

# Simuler une date précise
python generate.py --check --date 2026-05-18

# Régénérer index.html pour de vrai
python generate.py
```

## Calendrier configuré (Mondays 2026)

| Sem | Active du              | Devient "done" le | Activité                              |
| --- | ---------------------- | ----------------- | ------------------------------------- |
| 1   | 27 avril 2026          | 11 mai 2026       | PIX · IA (`VFFVDG669`) — prolongée    |
| 2   | 11 mai 2026            | 18 mai 2026       | Capsule P12 · Alimentation (`ALI26`)  |
| 3   | 18 mai 2026            | 25 mai 2026       | Devoir Commun                         |
| 4   | 25 mai 2026            | 1er juin 2026     | À planifier                           |
| 5   | 1er juin 2026          | 8 juin 2026       | À planifier                           |
| 6   | 8 juin 2026            | 15 juin 2026      | À planifier                           |
| 7   | 15 juin 2026           | 22 juin 2026      | Dernière semaine                      |

## En cas de problème

- **Le workflow n'a pas tourné** : Onglet Actions → vérifier les logs.
  Vous pouvez relancer à la main avec `Run workflow`.
- **Le code de la semaine N n'a pas été ajouté à temps** : pas grave, vous
  l'ajoutez dans `unlock-config.json`, le push relance automatiquement le workflow
  via GitHub Actions (push-trigger). Voir le YAML pour ajouter `on: push:` si
  vous voulez forcer ce comportement.
- **Vous voulez décaler une semaine** : modifiez `active_from` et `done_from`
  dans `unlock-config.json`, puis `Run workflow` manuellement.
