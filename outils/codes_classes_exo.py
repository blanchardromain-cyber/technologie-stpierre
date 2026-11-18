"""Codes de classe de la capsule « Exercices réseau 5e » (accès sans compte).

Génère un code par classe (forme « bako-rimu-47 »), écrit leurs EMPREINTES dans
exercices_reseau_eleve.html (bloc `var CODES_CLASSES = {` … `};`) et les codes EN CLAIR
dans un fichier hors dépôt, à communiquer par ÉcoleDirecte. Règle 8 : aucun code en clair
dans le dépôt. Refuse d'écrire si l'ancre manque. Fichier HTML en CRLF : lecture et
écriture en binaire.

Lancer (Python 3.12) :
  python outils/codes_classes_exo.py <fichier-codes-en-clair.txt>
"""
import base64
import hashlib
import re
import secrets
import sys
from pathlib import Path

PAGE = Path(__file__).resolve().parent.parent / "Niveau 5" / "Organiser un réseau numérique" / "exercices_reseau_eleve.html"
CAP = "reseau5e-exo"
CLASSES = ["5A", "5B", "5C", "5D", "5E", "5F", "5G"]
CONSONNES, VOYELLES = "bdfgkmnprstvz", "aeiou"


def syllabes(n=2):
    return "".join(secrets.choice(CONSONNES) + secrets.choice(VOYELLES) for _ in range(n))


def nouveau_code():
    return f"{syllabes()}-{syllabes()}-{secrets.randbelow(90) + 10}"


def empreinte_code(seq_id, code):
    """= empreinteCode() d'index.html : PBKDF2-SHA256, sel « stp-techno:code: » + seqId, 100 000 itérations."""
    h = hashlib.pbkdf2_hmac("sha256", code.upper().encode(), ("stp-techno:code:" + seq_id).encode(), 100000, 32)
    return "#" + base64.b64encode(h).decode()


def main():
    if len(sys.argv) != 2:
        sys.exit("usage : codes_classes_exo.py <fichier-codes-en-clair.txt>")
    sortie = Path(sys.argv[1])
    brut = PAGE.read_bytes()
    motif = re.compile(rb"var CODES_CLASSES = \{\r?\n.*?\};", re.S)
    if len(motif.findall(brut)) != 1:
        sys.exit("ancre « var CODES_CLASSES = { … }; » introuvable ou multiple : rien n'est écrit")
    codes = {c: nouveau_code() for c in CLASSES}
    nl = b"\r\n" if b"\r\n" in brut else b"\n"
    lignes = [f'  "{c}":"{empreinte_code(CAP + ":" + c, codes[c])}"'.encode() for c in CLASSES]
    bloc = b"var CODES_CLASSES = {" + nl + (b"," + nl).join(lignes) + nl + b"};"
    PAGE.write_bytes(motif.sub(lambda m: bloc, brut))
    sortie.parent.mkdir(parents=True, exist_ok=True)
    sortie.write_text("Codes de classe — Exercices réseau 5e (accès sans compte jusqu'au 25/11/2026)\n"
                      + "".join(f"{c} : {codes[c]}\n" for c in CLASSES), encoding="utf-8")
    print(f"{len(CLASSES)} empreintes écrites dans la page ; codes en clair dans {sortie}")


if __name__ == "__main__":
    main()
