#!/usr/bin/env python3
"""Chiffre un corrigé pour qu'il ne soit lisible que depuis la page professeur.

Le dépôt est public (règle 8 de CLAUDE.md) : un corrigé écrit dans index.html ou
dans un fichier servi se lit par « Afficher le code source ». Ici, le corrigé en
clair (fragment HTML + clé de correction JSON) reste sur le poste du professeur,
hors du dépôt (.gitignore) ; seul un fichier chiffré est publié :

  {"v":1, "it":600000, "sel":…, "iv":…, "data":…}   AES-GCM, clé = PBKDF2-SHA256(code)

Le code du corrigé est rangé dans le coffre du professeur (codes[<id>]) : la page
professeur l'y lit et déchiffre sans rien demander. Un collègue saisit ce code une
fois (le professeur le lui communique, voir le panneau « Codes d'accès »).

  python outils/chiffrer_corrige.py --id reseau5e-org-cor \\
      --source "Niveau 5/Organiser un réseau numérique/corrige_reseau_org.source.html" \\
      --cles   "Niveau 5/Organiser un réseau numérique/corrige_reseau_org.cles.json" \\
      --sortie "Niveau 5/Organiser un réseau numérique/corrige_reseau_org.chiffre.json"

  Le mot de passe professeur est demandé dans une fenêtre masquée. Le code existant
  est réutilisé (relancer le script après avoir modifié le corrigé suffit) ; sinon un
  code est généré, affiché une seule fois et rangé dans le coffre.

  TESTS SEULEMENT : --code-test CODE chiffre avec ce code sans ouvrir ni écrire le
  coffre (index.html n'est pas touché).

Lancer avec Python 3.12 (…\\AppData\\Local\\Programs\\Python\\Python312\\python.exe) :
le python du PATH (WAPT) n'a pas tkinter.
"""
import argparse
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import coffre  # noqa: E402  (même dossier : chiffrement, coffre, saisie masquée)

ITERATIONS = coffre.ITER_COFFRE


def chiffrer_paquet(paquet, code):
    """Même format que le coffre, clé dérivée du code (en majuscules)."""
    return coffre.chiffrer(paquet, code.strip().upper())


def poser_code_corrige(texte, mdp_prof, ident):
    """Lit le code du corrigé dans le coffre, ou en crée un. -> (texte, code, nouveau)."""
    m = re.search(r"COFFRE: (\{[^\r\n]*\})", texte)
    if not m:
        raise coffre.ErreurCoffre("Pas de coffre dans index.html.")
    contenu = coffre.dechiffrer(json.loads(m.group(1)), mdp_prof)
    codes = contenu.setdefault("codes", {})
    if codes.get(ident):
        return texte, codes[ident], False
    code = coffre.nouveau_code()
    while coffre._apparait(code, texte):
        code = coffre.nouveau_code()
    codes[ident] = code
    texte = texte[:m.start(1)] + coffre._coffre_json(coffre.chiffrer(contenu, mdp_prof)) + texte[m.end(1):]
    if coffre._apparait(code, texte):
        raise coffre.ErreurCoffre("Contrôle final en échec : le code apparaît en clair.")
    return texte, code, True


def main(argv=None):
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")
    p = argparse.ArgumentParser(description="Chiffre un corrigé pour la page professeur.")
    p.add_argument("--id", required=True, help="identifiant du corrigé (clé du code dans le coffre)")
    p.add_argument("--source", required=True, help="fragment HTML du corrigé, en clair")
    p.add_argument("--cles", required=True, help="clé de correction JSON, en clair")
    p.add_argument("--sortie", required=True, help="fichier chiffré publié")
    p.add_argument("--fichier", default=coffre.INDEX, help="index.html qui contient le coffre")
    p.add_argument("--code-test", help="TESTS SEULEMENT : code imposé, coffre ni lu ni écrit")
    p.add_argument("--mdp-env", help="TESTS SEULEMENT : variable d'environnement du mot de passe professeur")
    a = p.parse_args(argv)
    if a.mdp_env and os.path.abspath(a.fichier) == os.path.abspath(coffre.INDEX):
        p.error("--mdp-env sert aux tests : il n'écrit jamais sur le index.html du site.")

    with open(a.source, encoding="utf-8") as f:
        html = f.read()
    html = re.sub(r"^\s*<!--.*?-->\s*", "", html, flags=re.S)   # l'avertissement « ne pas versionner »
    with open(a.cles, encoding="utf-8") as f:
        cles = json.load(f)
    cles.pop("_note", None)
    paquet = {"html": html, "cles": cles}

    try:
        if a.code_test:
            code, nouveau, texte = a.code_test, False, None
        else:
            with open(a.fichier, encoding="utf-8", newline="") as f:
                texte = f.read()
            texte, code, nouveau = poser_code_corrige(texte, coffre._mot_de_passe_prof(a, False), a.id)
        chiffre = chiffrer_paquet(paquet, code)
    except coffre.ErreurCoffre as e:
        print("Erreur : " + str(e) + " Rien n'a été écrit.", file=sys.stderr)
        return 1

    # Garde-fou : rien du corrigé ne doit rester lisible dans le fichier publié.
    # (Des mots courts trouveraient des faux positifs dans le base64 : on cherche
    # des morceaux longs du texte en clair.)
    publie = json.dumps(chiffre)
    morceaux = [m for m in re.findall(r"[A-Za-zÀ-ÿ' ]{24,}", html)][:40] + list(cles.keys())[:5]
    for m in morceaux:
        if m.strip() and m.strip() in publie:
            print("Erreur : le fichier chiffré contient du texte en clair (« %s »). Rien n'a été écrit." % m.strip()[:40], file=sys.stderr)
            return 1
    with open(a.sortie, "w", encoding="utf-8", newline="\n") as f:
        f.write(publie + "\n")
    if nouveau:
        with open(a.fichier, "w", encoding="utf-8", newline="") as f:
            f.write(texte)
        print("Nouveau code du corrigé « %s » : %s — rangé dans le coffre (panneau « Codes d'accès »)." % (a.id, code))
        print("Fichier écrit : " + a.fichier)
    elif not a.code_test:
        print("Code du corrigé inchangé (lu dans le coffre).")
    print("Corrigé chiffré : " + a.sortie)
    return 0


if __name__ == "__main__":
    sys.exit(main())
