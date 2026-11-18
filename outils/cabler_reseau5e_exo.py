"""Câble la capsule « Exercices réseau 5e » (cap reseau5e-exo) dans index.html.

Chaque insertion s'appuie sur une ancre de la capsule sœur reseau5e-ev1 / reseau5e-org
(règle 6). Le script échoue sans rien écrire si une ancre manque ou apparaît plusieurs
fois, ou si la capsule est déjà câblée. index.html est en CRLF : lecture et écriture en
binaire, chaque fragment inséré reçoit des fins de ligne CRLF.

Code de la tuile : le MÊME que le code de classe 5A (un seul code à donner à la 5A).
Son empreinte est calculée depuis le fichier des codes en clair, hors dépôt, sans
jamais l'afficher.

Lancer (Python 3.12) :
  python outils/cabler_reseau5e_exo.py <fichier-codes-en-clair.txt>
"""
import base64
import hashlib
import re
import sys
from pathlib import Path

INDEX = Path(__file__).resolve().parent.parent / "index.html"
SRC = "Niveau%205/Organiser%20un%20r%C3%A9seau%20num%C3%A9rique/"
BUILD = "2026-11-18a"


def empreinte_tuile(fichier_codes):
    m = re.search(r"^5A : (\S+)$", Path(fichier_codes).read_text(encoding="utf-8"), re.M)
    if not m:
        sys.exit("code 5A introuvable dans " + str(fichier_codes))
    h = hashlib.pbkdf2_hmac("sha256", m.group(1).upper().encode(), b"stp-techno:code:reseau5e-exo", 100000, 32)
    return "#" + base64.b64encode(h).decode()


def remplacements(code_tuile):
    page = (
        '    <!-- P2 5e — EXERCICES RÉSEAU (iframe : Niveau 5/Organiser un réseau numérique/exercices_reseau_eleve.html) -->\n'
        '    <div id="pg-reseau5e-exo" class="h">\n'
        '      <div class="phdr">\n'
        '        <button class="btnbk" onclick="goPage(\'pg-dash\')">&#x2190; Retour</button>\n'
        '        <h2 style="font-size:17px;font-weight:700">P2 &mdash; Exercices : le fonctionnement d\'un réseau informatique (5e)</h2>\n'
        '      </div>\n'
        '      <p style="font-size:13px;color:var(--td);max-width:900px;margin:0 0 12px;line-height:1.6">\n'
        '        Quatre exercices d\'<strong>entraînement corrigés immédiatement</strong>, en deux essais : ton bilan te dit ce qui est maîtrisé et ce qui reste à revoir.\n'
        '      </p>\n'
        '      <p class="prof-only" style="font-size:13px;color:var(--td);max-width:900px;margin:0 0 12px;line-height:1.6">\n'
        '        Note proposée sur 20 pour information (investissement) ; la copie part au tableau de bord après le 2e essai.\n'
        '        Accès sans compte jusqu\'au 25/11 par lien direct et code de classe (outils/codes_classes_exo.py).\n'
        '      </p>\n'
        '      <iframe id="reseau5e-exo-frame" data-src="' + SRC + 'exercices_reseau_eleve.html" title="P2 — Exercices réseau (5e)"\n'
        '        style="width:100%;height:calc(100vh - 165px);min-height:560px;border:1px solid var(--gb);border-radius:12px;background:#F4F6F8"\n'
        '        loading="lazy"></iframe>\n'
        '    </div>\n'
        '\n'
    )
    seq = ('  {id:"reseau5e-exo", ordre:20.2, niveau:"5ème", titre:"P2 — Exercices : le fonctionnement d\'un réseau informatique", '
           'desc:"Architecture d\'un réseau local, rôle des matériels du collège, travail sur son compte, cheminement de l\'information. '
           'Entraînement corrigé immédiatement, en deux essais. Aides dys intégrées.", couleur:"#0EA5E9", code:"' + code_tuile + '", open:true},\n')
    gopage = (
        '  if (pid === "pg-reseau5e-exo") {\n'
        '    try {\n'
        '      if (user) localStorage.setItem("reseau5e-exo_prefill", JSON.stringify({ id: user.id, p: user.p, n: user.n, c: user.c, ts: Date.now() }));\n'
        '    } catch (e) {}\n'
        '    var rxoIfr = document.getElementById("reseau5e-exo-frame");\n'
        '    if (rxoIfr) rxoIfr.src = rxoIfr.getAttribute("data-src");\n'
        '  }\n'
    )
    evaluation = (
        '  /* P2 5e — Exercices réseau : corrigés par exercices_reseau_corr.js (RXO), source\n'
        '     unique partagée avec la page élève. Travail formatif, note pour information. */\n'
        '  "reseau5e-exo": {\n'
        '    titre: "P2 5e — Exercices réseau",\n'
        '    total: 20,\n'
        '    sections: [\n'
        '      { cle: "ex1", label: "1 Architecture d\'un réseau local", max: 5, compact: true },\n'
        '      { cle: "ex2", label: "2 Rôle des constituants du réseau", max: 5, compact: true },\n'
        '      { cle: "ex3", label: "3 Utilisation du réseau du collège", max: 5, compact: true },\n'
        '      { cle: "ex4", label: "4 Cheminement de l\'information", max: 5, compact: true }\n'
        '    ],\n'
        '    corriger: function (f) {\n'
        '      if (!window.RXO) return { points: {}, detail: [] };\n'
        '      var r = RXO.corriger(f || {}), detail = [];\n'
        '      function ligne(sec, k, label, rep, attendu) {\n'
        '        var v = (f || {})[k];\n'
        '        detail.push({ sec: sec, label: label, pts: r.items[k] ? 1 : 0, etat: !v ? "vide" : r.items[k] ? "ok" : "ko", rep: v || "", attendu: attendu });\n'
        '      }\n'
        '      RXO.ELEMENTS_EX1.forEach(function (e) { ligne("ex1", "e1_" + e.id, e.label, null, e.rep); });\n'
        '      RXO.LIAISONS_EX1.forEach(function (e) { ligne("ex1", "e1_" + e.id, e.label, null, e.rep); });\n'
        '      RXO.DEFINITIONS_EX2.forEach(function (e) { ligne("ex2", "e2_" + e.id, e.label, null, e.rep); });\n'
        '      RXO.QUESTIONS_EX3.forEach(function (q) { ligne("ex3", q.id, q.label, null, q.rep); });\n'
        '      ["q1", "q2"].forEach(function (q) {\n'
        '        var n = q.charAt(1), ch = r.chemins[q], att = ch.attendu || RXO.CHEMINS_EX4[q].attendus[0];\n'
        '        detail.push({ sec: "ex4", label: "Question " + n + " (" + Math.round(ch.frac * 100) + " % juste)", pts: ch.frac,\n'
        '          etat: !(f || {})["e4_c" + n] ? "vide" : ch.frac === 1 ? "ok" : ch.frac > 0 ? "partiel" : "ko",\n'
        '          rep: String((f || {})["e4_c" + n] || "").replace(/,/g, " → ") + " / " + String((f || {})["e4_l" + n] || "").replace(/,/g, ", "),\n'
        '          attendu: att.c.join(" → ") + " / " + att.l.join(", ") });\n'
        '      });\n'
        '      /* Les points de section sont ceux de RXO (sur 5) ; les points par ligne ne servent qu\'à l\'affichage. */\n'
        '      return { points: r.pts, detail: detail };\n'
        '    },\n'
        '    appreciation: function (pts, note) {\n'
        '      var niv = {}, ks = ["ex1", "ex2", "ex3", "ex4"];\n'
        '      ks.forEach(function (k) { var p = (Number(pts[k]) || 0) / 5; niv[k] = p >= 0.8 ? "maitrise" : p >= 0.5 ? "encours" : "arevoir"; });\n'
        '      return window.RXO ? RXO.appreciation({ note: note, niveaux: niv }) : fmtPts(note) + "/20";\n'
        '    }\n'
        '  },\n'
        '\n'
    )
    return [
        ('            <option value="reseau5e-ev1">P2 5e &mdash; &Eacute;valuation n&deg;1</option>\n', "après",
         '            <option value="reseau5e-exo">P2 5e &mdash; Exercices r&eacute;seau</option>\n'),
        ('    <!-- P2 5e — ÉVALUATION N°1 (iframe : Niveau 5/Organiser un réseau numérique/evaluation1_eleve.html) -->\n', "avant", page),
        ('  {id:"reseau5e-ev1", ordre:20.5,', "avant_ligne", seq),
        ('  if (pid === "pg-reseau5e-ev1-cor") re1CorOuvrir();\n', "après", gopage),
        ('        } else if (s.id === "reseau5e-org") {\n', "avant",
         '        } else if (s.id === "reseau5e-exo") {\n'
         '          badgeHtml = \'<span class="badge" style="background:#E1F5FE;color:#01579B;font-weight:700">&#x270F;&#xFE0F; Entra&icirc;nement</span>\';\n'),
        ('      else if (s.id === "reseau5e-ev1-cor") clickAction = "onclick=\\"goPage(\'pg-reseau5e-ev1-cor\')\\"";\n', "après",
         '      else if (s.id === "reseau5e-exo")     clickAction = "onclick=\\"goPage(\'pg-reseau5e-exo\')\\"";\n'),
        ('    else if (pendingSeq === "reseau5e-ev1-cor") goPage("pg-reseau5e-ev1-cor");\n', "après",
         '    else if (pendingSeq === "reseau5e-exo") goPage("pg-reseau5e-exo");\n'),
        ('  "reseau5e-org": {\n', "avant", evaluation),
        ('  "reseau5e-ev1":"P2 5e — Évaluation n°1",\n', "après", '  "reseau5e-exo":"P2 5e — Exercices réseau",\n'),
        ('|| sub.cap === "reseau5e-org" || sub.cap === "reseau5e-ev1") ? "5ᵉ" : "4ᵉ";', "remplacer",
         '|| sub.cap === "reseau5e-org" || sub.cap === "reseau5e-ev1" || sub.cap === "reseau5e-exo") ? "5ᵉ" : "4ᵉ";'),
        ('<script>window.CONFORT_LECTURE  =', "avant_ligne",
         '<script src="' + SRC + 'exercices_reseau_corr.js"></script>\n'),
        ('build 2026-11-09b</span>', "remplacer", 'build ' + BUILD + '</span>'),
    ]


def crlf(s):
    return s.replace("\r\n", "\n").replace("\n", "\r\n").encode("utf-8")


def main():
    if len(sys.argv) != 2:
        sys.exit("usage : cabler_reseau5e_exo.py <fichier-codes-en-clair.txt>")
    brut = INDEX.read_bytes()
    if b"reseau5e-exo" in brut:
        sys.exit("reseau5e-exo est déjà câblé : rien n'est écrit")
    nb_crlf = brut.count(b"\r\n")
    for ancre, mode, frag in remplacements(empreinte_tuile(sys.argv[1])):
        a = crlf(ancre)
        n = brut.count(a)
        if n != 1:
            sys.exit(f"ancre trouvée {n} fois (1 attendue) : {ancre.strip()[:80]} — rien n'est écrit")
        f = crlf(frag)
        if mode == "après":
            brut = brut.replace(a, a + f)
        elif mode == "avant":
            brut = brut.replace(a, f + a)
        elif mode == "remplacer":
            brut = brut.replace(a, f)
        elif mode == "avant_ligne":
            i = brut.index(a)
            debut = brut.rfind(b"\n", 0, i) + 1
            brut = brut[:debut] + f + brut[debut:]
    if b"\n" in brut.replace(b"\r\n", b""):
        sys.exit("une fin de ligne LF seule apparaîtrait : rien n'est écrit")
    INDEX.write_bytes(brut)
    print(f"index.html câblé : {brut.count(b'reseau5e-exo')} occurrences de reseau5e-exo, "
          f"{brut.count(chr(13).encode() + chr(10).encode()) - nb_crlf} lignes ajoutées, build {BUILD}")


if __name__ == "__main__":
    main()
