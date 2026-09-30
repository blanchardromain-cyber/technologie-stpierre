#!/usr/bin/env python3
"""Coffre des mots de passe du site Technologie (règle 8 de CLAUDE.md).

index.html est public : il ne contient aucun mot de passe ni code d'accès en
clair. Les mots de passe y figurent sous forme d'empreintes ; les valeurs en
clair utiles au professeur (impression des identifiants, codes à communiquer)
sont dans un coffre chiffré par le mot de passe professeur.

  python outils/coffre.py initialiser
      Convertit une version en clair (pwd, PMDP, code) : empreintes + coffre.
      Renouvelle les mots de passe des collègues, qui étaient publics.
  python outils/coffre.py ajouter --id lea.martin --prenom Léa --nom MARTIN --classe 4B
  python outils/coffre.py ajouter --id marc.dupont --prenom Marc --nom DUPONT --enseignant --classes 5B,5C
      Ajoute un compte ; le mot de passe généré s'affiche une seule fois.

Le mot de passe professeur est demandé au clavier, jamais affiché ni stocké.
Le script s'arrête sans rien écrire si une ancre attendue manque.
"""
import argparse
import base64
import getpass
import hashlib
import json
import os
import re
import secrets
import sys

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

SEL = "stp-techno:"          # = EMPREINTE_SEL dans index.html
ITER_EMPREINTE = 100000      # = EMPREINTE_ITER dans index.html
ITER_COFFRE = 600000
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(RACINE, "index.html")
OBJET = re.compile(r"\{[^{}]*\}")


class ErreurCoffre(Exception):
    pass


def _b64(octets):
    return base64.b64encode(octets).decode("ascii")


def empreinte(texte, sel):
    return _b64(hashlib.pbkdf2_hmac("sha256", texte.encode("utf-8"), sel.encode("utf-8"), ITER_EMPREINTE, 32))


def empreinte_mdp(ident, mdp):
    return empreinte(mdp, SEL + ident)


def empreinte_code(seq_id, code):
    return "#" + empreinte(code.upper(), SEL + "code:" + seq_id)


def _cle(mdp, sel, iterations):
    return hashlib.pbkdf2_hmac("sha256", mdp.encode("utf-8"), sel, iterations, 32)


def chiffrer(contenu, mdp):
    sel, iv = os.urandom(16), os.urandom(12)
    clair = json.dumps(contenu, ensure_ascii=False, sort_keys=True).encode("utf-8")
    data = AESGCM(_cle(mdp, sel, ITER_COFFRE)).encrypt(iv, clair, None)
    return {"v": 1, "it": ITER_COFFRE, "sel": _b64(sel), "iv": _b64(iv), "data": _b64(data)}


def dechiffrer(coffre, mdp):
    d = base64.b64decode
    try:
        clair = AESGCM(_cle(mdp, d(coffre["sel"]), coffre["it"])).decrypt(d(coffre["iv"]), d(coffre["data"]), None)
    except InvalidTag:
        raise ErreurCoffre("Mot de passe professeur incorrect : le coffre ne s'ouvre pas.")
    return json.loads(clair.decode("utf-8"))


def _syllabe():
    return secrets.choice("bdfgklmnprstvz") + secrets.choice("aeiou")


def nouveau_mdp():
    """Facile à dicter, sans lien avec le nom : « bako-rimu-47 »."""
    return _syllabe() + _syllabe() + "-" + _syllabe() + _syllabe() + "-" + "%02d" % secrets.randbelow(100)


def _bloc(texte, debut, fin="];"):
    """Positions du contenu compris entre la ligne `debut` et la première ligne `fin`."""
    m = re.search(re.escape(debut) + r"\r?\n(.*?)\r?\n" + re.escape(fin), texte, re.S)
    if not m:
        raise ErreurCoffre("Ancre introuvable dans index.html : " + debut)
    return m.start(1), m.end(1)


def _transformer(texte, debut, fonction, fin="];"):
    i, j = _bloc(texte, debut, fin)
    return texte[:i] + fonction(texte[i:j]) + texte[j:]


def _coffre_json(coffre):
    return json.dumps(coffre, separators=(",", ":"))


def initialiser(texte, mdp_prof):
    """Version en clair -> (texte converti, rapport). Ne touche qu'aux données."""
    if "COFFRE:" in texte:
        raise ErreurCoffre("Déjà fait : index.html contient déjà un coffre.")
    i, j = _bloc(texte, "var CFG = {", "};")
    ancien = re.search(r'PMDP:\s*"([^"]*)"', texte[i:j])
    if not ancien:
        raise ErreurCoffre("CFG.PMDP introuvable.")
    if len(mdp_prof) < 12:
        raise ErreurCoffre("Mot de passe professeur trop court : 12 caractères minimum.")
    if mdp_prof == ancien.group(1):
        raise ErreurCoffre("Le mot de passe professeur doit changer : l'ancien est public.")

    contenu = {"eleves": {}, "enseignants": {}, "codes": {}, "dcAnciens": []}
    renouveles = []

    def comptes(liste, renouveler):
        def convertir(m):
            obj = m.group(0)
            ident, pw = re.search(r'id:"([^"]+)"', obj), re.search(r'pwd:"([^"]*)"', obj)
            if not (ident and pw):
                raise ErreurCoffre("Compte sans identifiant ou sans mot de passe : " + obj[:60])
            mdp = pw.group(1)
            if renouveler:
                mdp = nouveau_mdp()
                renouveles.append(ident.group(1))
            contenu[liste][ident.group(1)] = mdp
            return obj[:pw.start()] + 'h:"' + empreinte_mdp(ident.group(1), mdp) + '"' + obj[pw.end():]
        return lambda bloc: OBJET.sub(convertir, bloc)

    def codes(bloc):
        def convertir(m):
            obj = m.group(0)
            code = re.search(r'code:"([^"]+)"', obj)
            if not code:
                return obj
            sid = re.search(r'id:"([^"]+)"', obj).group(1)
            contenu["codes"][sid] = code.group(1)
            return obj[:code.start()] + 'code:"' + empreinte_code(sid, code.group(1)) + '"' + obj[code.end():]
        return OBJET.sub(convertir, bloc)

    texte = _transformer(texte, "var ELEVES = [", comptes("eleves", False))
    texte = _transformer(texte, "var ENSEIGNANTS = [", comptes("enseignants", True))
    texte = _transformer(texte, "var SEQUENCES_DEF = [", codes)

    dc = re.search(r"var DC_CODES_ANCIENS = \[([^\]]*)\];", texte)
    if not dc:
        raise ErreurCoffre("Ancre introuvable dans index.html : var DC_CODES_ANCIENS")
    contenu["dcAnciens"] = re.findall(r'"([^"]*)"', dc.group(1))
    hachés = ", ".join('"' + empreinte_code("dc-corrige", c) + '"' for c in contenu["dcAnciens"])
    texte = texte[:dc.start(1)] + hachés + texte[dc.end(1):]

    coffre = chiffrer(contenu, mdp_prof)
    i, j = _bloc(texte, "var CFG = {", "};")
    cfg = re.sub(r'PMDP:\s*"[^"]*"', lambda m: "COFFRE: " + _coffre_json(coffre), texte[i:j])
    texte = texte[:i] + cfg + texte[j:]

    # Contrôles avant de rendre la main : rien en clair, coffre lisible
    for debut in ("var ELEVES = [", "var ENSEIGNANTS = ["):
        a, b = _bloc(texte, debut)
        if 'pwd:"' in texte[a:b]:
            raise ErreurCoffre("Un mot de passe en clair subsiste dans " + debut)
    i, j = _bloc(texte, "var CFG = {", "};")
    if "PMDP" in texte[i:j] or dechiffrer(coffre, mdp_prof) != contenu:
        raise ErreurCoffre("Contrôle final en échec : rien n'a été écrit.")
    rapport = {"eleves": len(contenu["eleves"]), "enseignants": len(contenu["enseignants"]),
               "codes": len(contenu["codes"]), "anciens": len(contenu["dcAnciens"]), "renouveles": renouveles}
    return texte, rapport


def ajouter(texte, mdp_prof, compte):
    """Ajoute un élève (ou un collègue si compte["enseignant"]). -> (texte, mot de passe)."""
    m = re.search(r"COFFRE: (\{[^\r\n]*\})", texte)
    if not m:
        raise ErreurCoffre("Pas de coffre : lancer d'abord « initialiser ».")
    contenu = dechiffrer(json.loads(m.group(1)), mdp_prof)
    ident = compte["id"].strip().lower()
    if not re.fullmatch(r"[a-z0-9.-]+", ident):
        raise ErreurCoffre("Identifiant invalide (lettres sans accent, chiffres, point, tiret) : " + ident)
    if re.search(r'id:"' + re.escape(ident) + '"', texte):
        raise ErreurCoffre("Identifiant déjà utilisé : " + ident)
    for cle in ("p", "n", "c"):
        if '"' in compte.get(cle, ""):
            raise ErreurCoffre("Guillemet interdit dans les champs.")
    mdp = nouveau_mdp()
    h = empreinte_mdp(ident, mdp)
    if compte.get("enseignant"):
        classes = ",".join('"' + c + '"' for c in compte.get("classes", []))
        ligne, debut, liste = '  { id:"%s", p:"%s", n:"%s", h:"%s", classes:[%s] }' % (ident, compte["p"], compte["n"], h, classes), "var ENSEIGNANTS = [", "enseignants"
    else:
        c = compte["c"]
        ligne, debut, liste = '  {id:"%s", p:"%s", n:"%s", c:"%s", niveau:"%sème", h:"%s"},' % (ident, compte["p"], compte["n"], c, c[:1], h), "var ELEVES = [", "eleves"
    nl = "\r\n" if "\r\n" in texte else "\n"

    def inserer(bloc):
        k = bloc.rfind("}")
        if k >= 0 and not bloc[k + 1:].lstrip().startswith(","):
            bloc = bloc[:k + 1] + "," + bloc[k + 1:]
        return bloc + nl + ligne

    texte = _transformer(texte, debut, inserer)
    contenu[liste][ident] = mdp
    m = re.search(r"COFFRE: (\{[^\r\n]*\})", texte)
    texte = texte[:m.start(1)] + _coffre_json(chiffrer(contenu, mdp_prof)) + texte[m.end(1):]
    return texte, mdp


def _saisie_masquee(question):
    """Petite fenêtre de saisie masquée. Elle fonctionne même quand le terminal ne
    transmet pas la frappe à getpass (terminal intégré, Python embarqué de WAPT).
    Repli sur getpass si tkinter manque."""
    try:
        import tkinter as tk
    except ImportError:
        return getpass.getpass(question + " ")
    racine = tk.Tk()
    racine.title("Coffre du site Technologie")
    racine.attributes("-topmost", True)
    reponse = {"texte": None}
    tk.Label(racine, text=question, padx=18, pady=12).pack()
    champ = tk.Entry(racine, show="•", width=38)
    champ.pack(padx=18)
    champ.focus_force()

    def valider(_evenement=None):
        reponse["texte"] = champ.get()
        racine.destroy()

    champ.bind("<Return>", valider)
    tk.Button(racine, text="Valider", command=valider).pack(pady=12)
    racine.mainloop()
    if reponse["texte"] is None:
        raise ErreurCoffre("Saisie annulée.")
    return reponse["texte"]


def _mot_de_passe_prof(args, nouveau):
    if args.mdp_env:
        return os.environ[args.mdp_env]
    mdp = _saisie_masquee("Nouveau mot de passe professeur (12 caractères minimum) :" if nouveau else "Mot de passe professeur :")
    if nouveau and _saisie_masquee("Confirmez le nouveau mot de passe :") != mdp:
        raise ErreurCoffre("Les deux saisies diffèrent.")
    return mdp


def main(argv=None):
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")
    p = argparse.ArgumentParser(description="Coffre des mots de passe du site Technologie.")
    sous = p.add_subparsers(dest="commande", required=True)
    for nom in ("initialiser", "ajouter"):
        s = sous.add_parser(nom)
        s.add_argument("--fichier", default=INDEX)
        s.add_argument("--sortie", help="par défaut, réécrit --fichier")
        s.add_argument("--mdp-env", help="TESTS SEULEMENT : variable d'environnement contenant le mot de passe professeur")
        if nom == "ajouter":
            s.add_argument("--id", required=True)
            s.add_argument("--prenom", required=True)
            s.add_argument("--nom", required=True)
            s.add_argument("--classe", default="")
            s.add_argument("--enseignant", action="store_true")
            s.add_argument("--classes", default="", help="collègue : classes suivies, séparées par des virgules")
    a = p.parse_args(argv)
    sortie = a.sortie or a.fichier
    if a.mdp_env and os.path.abspath(sortie) == os.path.abspath(INDEX):
        p.error("--mdp-env sert aux tests : il n'écrit jamais sur le index.html du site.")
    if a.commande == "ajouter" and not a.enseignant and not a.classe:
        p.error("--classe est obligatoire pour un élève.")
    try:
        with open(a.fichier, encoding="utf-8", newline="") as f:
            texte = f.read()
        if a.commande == "initialiser":
            texte, r = initialiser(texte, _mot_de_passe_prof(a, True))
            message = ("Conversion faite : %d élèves, %d collègue(s), %d codes, %d anciens codes du corrigé DC.\n"
                       "Mots de passe renouvelés (visibles dans le site, onglet Config) : %s"
                       % (r["eleves"], r["enseignants"], r["codes"], r["anciens"], ", ".join(r["renouveles"]) or "aucun"))
        else:
            compte = {"id": a.id, "p": a.prenom, "n": a.nom, "c": a.classe, "enseignant": a.enseignant,
                      "classes": [c.strip() for c in a.classes.split(",") if c.strip()]}
            texte, mdp = ajouter(texte, _mot_de_passe_prof(a, False), compte)
            message = "Compte ajouté : %s — mot de passe à lui transmettre : %s (aussi visible dans Config)" % (a.id.lower(), mdp)
    except ErreurCoffre as e:
        print("Erreur : " + str(e) + " Rien n'a été écrit.", file=sys.stderr)
        return 1
    with open(sortie, "w", encoding="utf-8", newline="") as f:
        f.write(texte)
    print(message)
    print("Fichier écrit : " + sortie)
    return 0


if __name__ == "__main__":
    sys.exit(main())
