"""Câble la capsule « P11 — Synthèse — L'eau, ressource essentielle » (p11-syn, 4e) dans index.html.

Capsule NON notée mais qui ENVOIE l'avancement de l'élève au professeur (socle d'eau56) :
aucune entrée EVALUATIONS, mais un rendu professeur propre (buildP11SynModalHTML), qui sert
aussi à la copie imprimée.

Points d'ancrage, extraits par `grep -n "eau4e-syn"` et `grep -n "eau56"` (règle 6) :
  1. page iframe pg-p11-syn ......... après celle d'eau4e-syn : la tuile doit ouvrir une page.
  2. entrée SEQUENCES_DEF ............ après eau4e-syn (ordre 116.2) : la tuile, code = empreinte (règle 8).
  3. goPage + préremplissage ........ « p11-syn_prefill » {id, p, n, c, ts}, comme eau56 : identité
                                      de l'élève pour l'envoi et ses réglages dys.
  4. badge « Synthèse » ............. même badge qu'eau4e-syn.
  5. clickAction .................... le clic sur la tuile ouvre la page.
  6. pendingSeq ..................... reprise après saisie du code d'accès.
  7. filtre fcap .................... la capsule envoie : le professeur doit pouvoir filtrer ses copies.
  8. FICHE_TITRES (capTitles) ....... titre de la copie imprimée.
  9. bloc JS P11SYN_* + buildP11SynModalHTML, avant le bloc eau56 : lecture défensive de fields.
 10. liste des soumissions (renderSubs) : sans branche, la colonne affichait « undefined/undefined »
                                      (la capsule n'envoie ni score ni qcmTot) ; on y met le résumé des niveaux.
 11. openModal ...................... branche propre, placée AVANT EVALUATIONS[sub.cap] (règle 6).
 12. printModalSub .................. impression depuis le modal.
 13. ficheScoreTexte ................ ligne d'en-tête de la copie : PAS dans `totaux`, qui suppose
                                      un « x/total réponses » ; ni note ni total pour une capsule non notée.
 14. ficheReponsesHTML .............. copie imprimée (unité et lot), AVANT EVALUATIONS[sub.cap].
 15. export CSV (_buildCapsuleCSV) .. colonnes niveaux, durée, adapté ; _ajouterColonnesNotes ajoute
                                      ensuite ses colonnes de note, vides, comme pour eau56.
 16. marqueur build ................. règle 7.
Points examinés et laissés de côté :
  - widget statistiques (renderEx1Stats) : réservé aux capsules corrigées (EVALUATIONS, P11 ex1/ex2)
    ou aux champs P12 ; il se masque seul pour une capsule inconnue, comme pour eau56.
  - EVALUATIONS / bareme / noteAutoDe / baremeDe : capsule non notée, rien à déclarer.
  - CSS #pg-eau56 (mobile) : propre à eau56 ; eau4e-syn, page sœur, n'en a pas.
  - ficheNiveau : renvoie déjà « 4ᵉ » par défaut.
  - aménagements dys du site : la capsule embarque les siens dans l'iframe (comme eau4e-syn).

Génère aussi le code d'accès de la tuile : l'EMPREINTE va dans index.html (règle 8), le code
en clair dans un fichier hors dépôt passé en argument. Refuse d'écrire si une ancre manque ou
si la capsule est déjà câblée. Fichiers en CRLF : lecture et écriture en binaire.

Lancer (Python 3.12) :
  python outils/cabler_p11_syn.py <fichier-code-en-clair.txt>
"""
import base64
import hashlib
import re
import secrets
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
INDEX = RACINE / "index.html"
DOSSIER = RACINE / "Niveau 4" / "P11 Eau ressource essentielle"
PAGES = [DOSSIER / "synthese_p11_eleve.html", DOSSIER / "synthese_p11_logique.js"]
CAP = "p11-syn"
BUILD_AVANT, BUILD_APRES = b"build 2026-11-19a", b"build 2026-11-24a"
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
        raise SystemExit("Ancre introuvable ou multiple (%d) : %s — rien n'est écrit." % (texte.count(ancre), nom))
    return texte.replace(ancre, nouveau)


def crlf(s):
    """Texte écrit ici en LF -> octets CRLF, comme index.html."""
    return s.replace("\r\n", "\n").replace("\n", "\r\n").encode("utf-8")


PAGE = """    <!-- P11 4e — SYNTHÈSE FINALE (iframe : Niveau 4/P11 Eau ressource essentielle/synthese_p11_eleve.html) -->
    <div id="pg-p11-syn" class="h">
      <div class="phdr">
        <button class="btnbk" onclick="goPage('pg-dash')">&#x2190; Retour</button>
        <h2 style="font-size:17px;font-weight:700">P11 &mdash; Synth&egrave;se : l'eau, ressource essentielle (4e)</h2>
      </div>
      <p style="font-size:13px;color:var(--td);max-width:900px;margin:0 0 12px;line-height:1.6">
        La synth&egrave;se de la s&eacute;quence, &agrave; <strong>gagner notion par notion</strong> : un d&eacute;fi, puis la notion se d&eacute;voile.
        Ta carte m&eacute;moire montre tes niveaux, et l'entra&icirc;nement pr&eacute;pare l'&eacute;valuation n&deg;2.
        Rien n'est not&eacute; : ton avancement part &agrave; ton professeur, pour qu'il voie o&ugrave; t'aider.
      </p>
      <iframe id="p11-syn-frame" data-src="Niveau%204/P11%20Eau%20ressource%20essentielle/synthese_p11_eleve.html" title="P11 — Synthèse : l'eau, ressource essentielle (4e)"
        style="width:100%;height:calc(100vh - 165px);min-height:560px;border:1px solid var(--gb);border-radius:12px;background:#F4F6F8"
        loading="lazy"></iframe>
    </div>

"""

GOPAGE = """  if (pid === "pg-p11-syn") {
    // Identité de l'élève : envoi de son avancement au professeur et réglages dys.
    try {
      if (user) localStorage.setItem("p11-syn_prefill", JSON.stringify({ id: user.id, p: user.p, n: user.n, c: user.c, ts: Date.now() }));
    } catch (e) {}
    var p11sIfr = document.getElementById("p11-syn-frame");
    if (p11sIfr) p11sIfr.src = p11sIfr.getAttribute("data-src");
  }
"""

BLOC_JS = """/* ════ P11 4e — SYNTHÈSE FINALE (cap p11-syn) ════
   Capsule non notée. La page élève envoie dans fields, en chaînes JSON : le meilleur niveau
   de chaque notion (_niv), le dernier (_dernier), les tentatives (_essais), l'entraînement à
   l'évaluation n°2 (_module.module[id].reussi) ; et en clair duree (minutes) et adapte
   (« oui » / « non »). Ici, on ne fait qu'afficher. Une clé manquante ou illisible se lit
   « absent » ; un objet vide veut dire « rien de fait », ce n'est pas la même chose. */
/* aligné sur NOTIONS de synthese_p11_logique.js (identifiant, titre, même ordre) */
var P11SYN_TITRES = [
  ["n0",  "Les étapes de conception d'un objet technique"],
  ["n1",  "Analyse du besoin"],
  ["n2",  "Bête à cornes"],
  ["n3",  "Contraintes"],
  ["n4",  "Les normes"],
  ["n5",  "Cahier des charges (Textuel)"],
  ["n6",  "Pieuvre"],
  ["n7",  "Cahier des Charges Technique ou Fonctionnel"],
  ["n8",  "Conception de l'objet"],
  ["n9",  "Chaîne d'information"],
  ["n10", "Chaîne d'énergie"],
  ["n11", "Le fonctionnement d'un objet"],
  ["n12", "Le choix des matériaux"]
];
/* aligné sur MODULE de synthese_p11_logique.js (critère de chaque défi d'entraînement) */
var P11SYN_CRITERES = [
  ["m_p1", "P1 · Compléter un diagramme FAST"],
  ["m_p2", "P2 · Compléter les deux chaînes et nommer les énergies"],
  ["m_p3", "P3 · La chaîne d’énergie d’un objet qui se déplace"],
  ["m_p4", "P4 · Des exigences aux critères du matériau"],
  ["m_i1", "I1 · Choisir un matériau"],
  ["m_i2", "I2 · Calculer avec un tableur"],
  ["m_i3", "I3 · Énergie grise et cycle de vie"]
];
/* Pictogramme ET mot : le niveau ne repose jamais sur la couleur seule. */
var P11SYN_NIVEAUX = {
  acquis:   { picto: "✓", mot: "acquis",   coul: "#1E6B3B" },
  en_cours: { picto: "◐", mot: "en cours", coul: "#C55A11" },
  a_revoir: { picto: "↻", mot: "à revoir", coul: "#C0392B" }
};
var P11SYN_PAS_FAIT = { picto: "○", mot: "pas encore fait", coul: "#555" };

function p11SynLire(sub) {
  var f = sub && sub.fields && typeof sub.fields === "object" ? sub.fields : null;
  function a(o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); }
  function objet(k) {
    if (!a(f, k) || f[k] === null || f[k] === "") return null;
    try { var v = JSON.parse(f[k]); return v && typeof v === "object" && !Array.isArray(v) ? v : null; } catch (e) { return null; }
  }
  var m = objet("_module");
  return {
    present: !!f,
    niv: objet("_niv"), essais: objet("_essais"),
    module: m && m.module && typeof m.module === "object" ? m.module : null,
    duree: a(f, "duree") && f.duree !== null && String(f.duree) !== "" ? String(f.duree) : null,
    adapte: a(f, "adapte") && (f.adapte === "oui" || f.adapte === "non") ? f.adapte : null
  };
}
/* Niveau d'une notion, seulement s'il est l'un des trois connus (« constructor » ne passe pas). */
function p11SynNiveau(lu, id) {
  if (!lu.niv || !Object.prototype.hasOwnProperty.call(lu.niv, id)) return null;
  var v = lu.niv[id];
  return Object.prototype.hasOwnProperty.call(P11SYN_NIVEAUX, v) ? v : null;
}
/* « 8 acquis · 3 en cours · 2 à revoir » (+ « · n pas encore fait ») ; « niveaux absents » sinon. */
function p11SynResume(lu) {
  if (!lu.niv) return "niveaux absents";
  var n = { acquis: 0, en_cours: 0, a_revoir: 0 }, i;
  for (i = 0; i < P11SYN_TITRES.length; i++) { var v = p11SynNiveau(lu, P11SYN_TITRES[i][0]); if (v) n[v]++; }
  var reste = P11SYN_TITRES.length - n.acquis - n.en_cours - n.a_revoir;
  return n.acquis + " acquis · " + n.en_cours + " en cours · " + n.a_revoir + " à revoir"
    + (reste ? " · " + reste + " pas encore fait" : "");
}
function buildP11SynModalHTML(sub) {
  var esc = _ficheEsc, lu = p11SynLire(sub), i;
  var html = '<div style="background:#DEEAF1;border:1px solid #9DC3E6;border-radius:6px;padding:8px 12px;font-size:13px;margin-bottom:10px">'
    + '<strong>&#x1F9E9; ' + esc(sub && sub.ename || '') + '</strong> — Classe ' + esc(sub && sub.ecls || '')
    + ' — <span style="color:#555">synthèse non notée</span></div>';
  if (!lu.present) return html + '<em>Aucune donnée enregistrée (champs absents de la copie).</em>';
  html += '<div style="font-size:13px;font-weight:700;color:#1F4E79;margin:4px 0 6px">Carte mémoire : ' + esc(p11SynResume(lu)) + '</div>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:12.5px;margin-bottom:12px">'
    + '<thead><tr style="background:#1F4E79;color:#fff"><th style="padding:6px 9px;text-align:left">Notion</th>'
    + '<th style="padding:6px 9px;text-align:left;width:150px">Niveau</th>'
    + '<th style="padding:6px 9px;text-align:center;width:90px">Tentatives</th></tr></thead><tbody>';
  for (i = 0; i < P11SYN_TITRES.length; i++) {
    var id = P11SYN_TITRES[i][0], v = p11SynNiveau(lu, id);
    var d = v ? P11SYN_NIVEAUX[v] : P11SYN_PAS_FAIT;
    var niveau = lu.niv ? '<span style="color:' + d.coul + ';font-weight:700">' + esc(d.picto) + ' ' + esc(d.mot) + '</span>'
                        : '<span style="color:#555;font-style:italic">absent</span>';
    var essais = !lu.essais ? '<span style="color:#555;font-style:italic">absent</span>'
               : Object.prototype.hasOwnProperty.call(lu.essais, id) ? esc(Number(lu.essais[id]) || 0) : "0";
    html += '<tr style="background:' + (i % 2 ? "#fff" : "#f7f9fb") + ';border-bottom:1px solid #e3e8ee">'
      + '<td style="padding:5px 9px">' + esc(P11SYN_TITRES[i][1]) + '</td>'
      + '<td style="padding:5px 9px">' + niveau + '</td>'
      + '<td style="padding:5px 9px;text-align:center;font-variant-numeric:tabular-nums">' + essais + '</td></tr>';
  }
  html += '</tbody></table>';
  html += '<div style="font-size:12.5px;margin-bottom:10px;line-height:1.7">'
    + '<strong>Durée :</strong> ' + (lu.duree === null ? '<em>absente</em>' : esc(lu.duree) + ' min')
    + ' &nbsp;·&nbsp; <strong>Mode adapté :</strong> ' + (lu.adapte === null ? '<em>absent</em>' : esc(lu.adapte)) + '</div>';
  html += '<div style="font-weight:700;color:#1F4E79;font-size:12px;margin:8px 0 4px">ENTRAÎNEMENT À L\\'ÉVALUATION N°2</div>';
  if (!lu.module) return html + '<div style="font-size:12.5px"><em>absent</em></div>';
  var reussis = 0, lignes = "";
  for (i = 0; i < P11SYN_CRITERES.length; i++) {
    var mid = P11SYN_CRITERES[i][0];
    var m = Object.prototype.hasOwnProperty.call(lu.module, mid) && lu.module[mid] && typeof lu.module[mid] === "object" ? lu.module[mid] : null;
    var etat = !m || !(Number(m.essais) > 0) ? "○ pas encore essayé" : m.reussi === true ? "✓ réussi" : "✗ essayé, pas encore réussi";
    if (m && m.reussi === true) reussis++;
    lignes += '<li>' + esc(P11SYN_CRITERES[i][1]) + ' — ' + esc(etat) + (m && Number(m.essais) > 0 ? ' (' + esc(Number(m.essais)) + ' essai' + (Number(m.essais) > 1 ? 's' : '') + ')' : '') + '</li>';
  }
  html += '<div style="font-size:12.5px">' + reussis + '/' + P11SYN_CRITERES.length + ' critères réussis</div>'
    + '<ul style="font-size:12.5px;margin:4px 0 0 18px;padding:0;line-height:1.6">' + lignes + '</ul>';
  return html;
}

"""

LISTE = """      } else if (s.cap === "p11-syn") {
        /* Non notée : ni score ni total, le résumé des niveaux de la carte mémoire. */
        sc = '<span style="background:#DEEAF1;color:#1F4E79;border-radius:6px;padding:3px 8px;font-size:12px;font-weight:700">&#x1F9E9; ' + _ficheEsc(p11SynResume(p11SynLire(s))) + '</span>';
"""

MODAL = """  } else if (sub.cap === "p11-syn") {
    if (mh3) mh3.textContent = "P11 4e — Synthèse finale";
    document.getElementById("mrep").innerHTML = buildP11SynModalHTML(sub);
    document.getElementById("mscore").textContent = "Synthèse non notée — " + p11SynResume(p11SynLire(sub)) + " — Statut : " + (FICHE_STATUTS[sub.status] || sub.status);
"""

CSV = """  if (cap === "p11-syn") {
    /* Non notée : le résumé des niveaux, la durée et le mode adapté. */
    return {
      headers: ["Eleve","Classe","Date","Statut","niveaux","Duree (min)","Adapte"],
      rows: filtered.map(function (x) {
        var lu = p11SynLire(x);
        return [x.ename, x.ecls, dateOf(x), x.status, p11SynResume(lu),
                lu.duree === null ? "absent" : lu.duree, lu.adapte === null ? "absent" : lu.adapte];
      })
    };
  }
"""


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    sortie = Path(sys.argv[1])
    t = INDEX.read_bytes()
    if CAP.encode() in t:
        raise SystemExit("p11-syn est déjà câblée : rien n'est écrit.")

    code = nouveau_code()
    while re.search(code.encode(), t, re.I) or any(re.search(code.encode(), p.read_bytes(), re.I) for p in PAGES):
        code = nouveau_code()
    emp = empreinte_code(CAP, code)

    # 1. Page (iframe), juste après celle de la synthèse intermédiaire.
    ancre = crlf("    <!-- P11 4e — ACTIVITÉS 5 ET 6 (iframe : Niveau 4/P11 Eau ressource essentielle/eau56_eleve.html) -->\n")
    t = remplacer(t, ancre, crlf(PAGE) + ancre, "page avant celle d'eau56")

    # 2. Entrée SEQUENCES_DEF, après la synthèse intermédiaire.
    m = re.search(rb'  \{id:"eau4e-syn", ordre:116,[^\r\n]*\r\n', t)
    if not m:
        raise SystemExit("Ancre introuvable : entrée SEQUENCES_DEF eau4e-syn — rien n'est écrit.")
    entree = crlf('  {id:"p11-syn", ordre:116.2, niveau:"4ème", titre:"P11 — Synthèse — L\'eau, ressource essentielle", '
                  'desc:"La synthèse à gagner : un défi par notion, la notion se dévoile ensuite. Carte mémoire de tes niveaux, '
                  'entraînement à l\'évaluation n°2. Aides dys intégrées.", couleur:"#1F4E79", code:"' + emp + '", open:true},\n')
    t = t[:m.end()] + entree + t[m.end():]

    # 3. goPage : identité préremplie, après le bloc eau4e-syn.
    ancre = crlf('  if (pid === "pg-eau34") {\n')
    t = remplacer(t, ancre, crlf(GOPAGE) + ancre, "goPage pg-eau34")

    # 4. Badge « Synthèse ».
    t = remplacer(t, b'} else if (s.id === "eau4e-syn") {',
                  b'} else if (s.id === "eau4e-syn" || s.id === "p11-syn") {', "badge synthèse")

    # 5. Clic sur la tuile.
    ancre = crlf('      else if (s.id === "eau4e-syn") clickAction = "onclick=\\"goPage(\'pg-eau4e-syn\')\\"";\n')
    t = remplacer(t, ancre, ancre + crlf('      else if (s.id === "p11-syn")   clickAction = "onclick=\\"goPage(\'pg-p11-syn\')\\"";\n'), "clickAction")

    # 6. Reprise après saisie du code.
    ancre = crlf('    else if (pendingSeq === "eau4e-syn") goPage("pg-eau4e-syn");\n')
    t = remplacer(t, ancre, ancre + crlf('    else if (pendingSeq === "p11-syn") goPage("pg-p11-syn");\n'), "pendingSeq")

    # 7. Filtre fcap.
    ancre = crlf('            <option value="eau56">P11 4e &mdash; Activit&eacute;s 5 et 6</option>\n')
    t = remplacer(t, ancre, ancre + crlf('            <option value="p11-syn">P11 4e &mdash; Synth&egrave;se finale</option>\n'), "filtre fcap")

    # 8. FICHE_TITRES.
    ancre = crlf('"eau56":"P11 4e — Activités 5 et 6",\n')
    t = remplacer(t, ancre, ancre + crlf('  "p11-syn":"P11 4e — Synthèse finale",\n'), "FICHE_TITRES")

    # 9. Bloc JS, avant celui d'eau56.
    ancre = crlf("/* ════ P11 4e — ACTIVITÉS 5 ET 6 (cap eau56) ════\n")
    t = remplacer(t, ancre, crlf(BLOC_JS) + ancre, "bloc JS eau56")

    # 10. Liste des soumissions.
    ancre = crlf('      } else if (s.cap === "eau56") {\n        var e5Done')
    t = remplacer(t, ancre, crlf(LISTE) + ancre, "renderSubs eau56")

    # 11. openModal, avant EVALUATIONS[sub.cap].
    ancre = crlf('  } else if (sub.cap === "eau56") {\n    if (mh3) mh3.textContent = "P11 4e — Activités 5 et 6";\n')
    t = remplacer(t, ancre, crlf(MODAL) + ancre, "openModal eau56")

    # 12. printModalSub.
    ancre = crlf('  else if (sub.cap === "eau56") answersHTML = buildEau56ModalHTML(sub);\n')
    t = remplacer(t, ancre, ancre + crlf('  else if (sub.cap === "p11-syn") answersHTML = buildP11SynModalHTML(sub);\n'), "printModalSub")

    # 13. ficheScoreTexte, hors de `totaux`.
    ancre = crlf("  var totaux = { eau4e:49,")
    t = remplacer(t, ancre, crlf('  if (sub.cap === "p11-syn") return "Synthèse non notée — " + p11SynResume(p11SynLire(sub)) + st;\n') + ancre, "ficheScoreTexte")

    # 14. ficheReponsesHTML, avant EVALUATIONS[sub.cap].
    ancre = crlf('  if (sub.cap === "eau56")           return buildEau56ModalHTML(sub);\n')
    t = remplacer(t, ancre, ancre + crlf('  if (sub.cap === "p11-syn")         return buildP11SynModalHTML(sub);\n'), "ficheReponsesHTML")

    # 15. Export CSV.
    ancre = crlf('  if (cap === "eau56") {\n    var e56Cols')
    t = remplacer(t, ancre, crlf(CSV) + ancre, "export CSV")

    # 16. Marqueur de version.
    t = remplacer(t, BUILD_AVANT, BUILD_APRES, "marqueur build")

    if re.search(code.encode(), t, re.I):
        raise SystemExit("Contrôle final en échec : le code apparaît en clair — rien n'est écrit.")
    if t.count(b"\n") != t.count(b"\r\n"):
        raise SystemExit("Contrôle final en échec : une ligne a perdu son CR — rien n'est écrit.")
    INDEX.write_bytes(t)
    sortie.parent.mkdir(parents=True, exist_ok=True)
    sortie.write_text("Code d'accès de la tuile « P11 — Synthèse — L'eau, ressource essentielle » (p11-syn) : "
                      + code + "\n", encoding="utf-8")
    print("index.html câblé (%d occurrences de %s). Code de %d caractères écrit dans %s"
          % (t.count(CAP.encode()), CAP, len(code), sortie))


if __name__ == "__main__":
    main()
