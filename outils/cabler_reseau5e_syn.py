"""Câble la capsule « P2 — Synthèse : organiser un réseau numérique » (reseau5e-syn) dans index.html.

Calqué sur la synthèse P1 (batiment5e-syn) : page à iframe, entrée SEQUENCES_DEF, ouverture par
goPage (identité préremplie), badge « Synthèse », clic sur la tuile, reprise après le code.
Capsule non notée, rien n'est envoyé : aucune entrée EVALUATIONS.

Génère aussi le code d'accès de la tuile : l'EMPREINTE va dans index.html (règle 8), le code
en clair dans un fichier hors dépôt passé en argument. Refuse d'écrire si une ancre manque ou
si la capsule est déjà câblée. Fichiers en CRLF : lecture et écriture en binaire.

Lancer (Python 3.12) :
  python outils/cabler_reseau5e_syn.py <fichier-code-en-clair.txt>
"""
import base64
import hashlib
import re
import secrets
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
INDEX = RACINE / "index.html"
PAGE = RACINE / "Niveau 5" / "Organiser un réseau numérique" / "synthese_reseau_eleve.html"
CAP = "reseau5e-syn"
BUILD_AVANT, BUILD_APRES = b"build 2026-11-18b", b"build 2026-11-19a"
CONSONNES, VOYELLES = "bdfgkmnprstvz", "aeiou"


def nouveau_code():
    """Même forme que coffre.py : « BAKORI47 », facile à dicter."""
    syl = "".join(secrets.choice(CONSONNES) + secrets.choice(VOYELLES) for _ in range(3))
    return syl.upper() + "%02d" % secrets.randbelow(100)


def empreinte_code(seq_id, code):
    """= empreinteCode() d'index.html : PBKDF2-SHA256, sel « stp-techno:code: » + seqId, 100 000 itérations."""
    h = hashlib.pbkdf2_hmac("sha256", code.upper().encode(), ("stp-techno:code:" + seq_id).encode(), 100000, 32)
    return "#" + base64.b64encode(h).decode()


def remplacer(texte, ancre, nouveau, nom):
    if texte.count(ancre) != 1:
        raise SystemExit("Ancre introuvable ou multiple (%d) : %s" % (texte.count(ancre), nom))
    return texte.replace(ancre, nouveau)


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    sortie = Path(sys.argv[1])
    t = INDEX.read_bytes()
    if CAP.encode() in t:
        raise SystemExit("reseau5e-syn est déjà câblée : rien n'est écrit.")

    code = nouveau_code()
    while re.search(code.encode(), t, re.I) or re.search(code.encode(), PAGE.read_bytes(), re.I):
        code = nouveau_code()
    emp = empreinte_code(CAP, code)

    # 1. La page (iframe), juste après celle des exercices réseau.
    ancre = b'    <!-- P2 5e \xe2\x80\x94 \xc3\x89VALUATION N\xc2\xb01 (iframe'
    page = (
        "    <!-- P2 5e — SYNTHÈSE (iframe : Niveau 5/Organiser un réseau numérique/synthese_reseau_eleve.html) -->\r\n"
        '    <div id="pg-reseau5e-syn" class="h">\r\n'
        '      <div class="phdr">\r\n'
        "        <button class=\"btnbk\" onclick=\"goPage('pg-dash')\">&#x2190; Retour</button>\r\n"
        '        <h2 style="font-size:17px;font-weight:700">P2 &mdash; Synthèse : organiser un réseau numérique (5e)</h2>\r\n'
        "      </div>\r\n"
        '      <p style="font-size:13px;color:var(--td);max-width:900px;margin:0 0 12px;line-height:1.6">\r\n'
        "        La synthèse de la séquence, à <strong>gagner notion par notion</strong> : un défi, puis la notion se dévoile.\r\n"
        "        Rien n'est noté et rien n'est à envoyer. Le bouton <strong>&laquo;&nbsp;Imprimer ma synthèse&nbsp;&raquo;</strong> sort la fiche\r\n"
        "        complète et correcte, identique pour tous les élèves.\r\n"
        "      </p>\r\n"
        '      <iframe id="reseau5e-syn-frame" data-src="Niveau%205/Organiser%20un%20r%C3%A9seau%20num%C3%A9rique/synthese_reseau_eleve.html" title="P2 — Synthèse : organiser un réseau numérique (5e)"\r\n'
        '        style="width:100%;height:calc(100vh - 165px);min-height:560px;border:1px solid var(--gb);border-radius:12px;background:#F4F6F8"\r\n'
        '        loading="lazy"></iframe>\r\n'
        "    </div>\r\n\r\n"
    ).encode()
    t = remplacer(t, ancre, page + ancre, "page avant l'évaluation n°1")

    # 2. Entrée SEQUENCES_DEF, après les exercices réseau.
    m = re.search(rb'  \{id:"reseau5e-exo", ordre:20\.2,[^\r\n]*\r\n', t)
    if not m:
        raise SystemExit("Ancre introuvable : entrée SEQUENCES_DEF reseau5e-exo")
    entree = ('  {id:"reseau5e-syn", ordre:20.3, niveau:"5ème", titre:"P2 — Synthèse Organiser un réseau numérique", '
              'desc:"La synthèse à gagner : un défi par notion, la notion se dévoile ensuite. Simulateurs, aide au choix, '
              'fiche imprimable complète.", couleur:"#0284C7", code:"' + emp + '", open:true},\r\n').encode()
    t = t[:m.end()] + entree + t[m.end():]

    # 3. goPage : identité pour l'en-tête imprimé et les réglages dys de l'élève.
    ancre = b'  if (pid === "pg-reseau5e-exo") {\r\n'
    bloc = (
        '  if (pid === "pg-reseau5e-syn") {\r\n'
        "    try {\r\n"
        '      if (user) localStorage.setItem("reseau5e-syn_prefill", JSON.stringify({ id: user.id, p: user.p, n: user.n, c: user.c, ts: Date.now() }));\r\n'
        "    } catch (e) {}\r\n"
        '    var rsyIfr = document.getElementById("reseau5e-syn-frame");\r\n'
        '    if (rsyIfr) rsyIfr.src = rsyIfr.getAttribute("data-src");\r\n'
        "  }\r\n"
    ).encode()
    t = remplacer(t, ancre, bloc + ancre, "goPage reseau5e-exo")

    # 4. Badge « Synthèse ».
    t = remplacer(t, b'} else if (s.id === "batiment5e-syn") {',
                  b'} else if (s.id === "batiment5e-syn" || s.id === "reseau5e-syn") {', "badge synthèse")

    # 5. Clic sur la tuile.
    ancre = b'      else if (s.id === "reseau5e-exo")     clickAction = "onclick=\\"goPage(\'pg-reseau5e-exo\')\\"";\r\n'
    t = remplacer(t, ancre, ancre + b'      else if (s.id === "reseau5e-syn")     clickAction = "onclick=\\"goPage(\'pg-reseau5e-syn\')\\"";\r\n', "clickAction")

    # 6. Reprise après saisie du code.
    ancre = b'    else if (pendingSeq === "reseau5e-exo") goPage("pg-reseau5e-exo");\r\n'
    t = remplacer(t, ancre, ancre + b'    else if (pendingSeq === "reseau5e-syn") goPage("pg-reseau5e-syn");\r\n', "pendingSeq")

    # 7. Marqueur de version.
    t = remplacer(t, BUILD_AVANT, BUILD_APRES, "marqueur build")

    if re.search(code.encode(), t, re.I):
        raise SystemExit("Contrôle final en échec : le code apparaît en clair.")
    if t.count(b"\n") != t.count(b"\r\n"):
        raise SystemExit("Contrôle final en échec : une ligne a perdu son CR.")
    INDEX.write_bytes(t)
    sortie.parent.mkdir(parents=True, exist_ok=True)
    sortie.write_text("Code d'accès de la tuile « P2 — Synthèse Organiser un réseau numérique » (reseau5e-syn) : "
                      + code + "\n", encoding="utf-8")
    print("index.html câblé (%d occurrences de %s). Code écrit dans %s" % (t.count(CAP.encode()), CAP, sortie))


if __name__ == "__main__":
    main()
