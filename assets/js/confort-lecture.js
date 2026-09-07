/* ════════════════════════════════════════════════════════════════════════
   CONFORT DE LECTURE — Collège Saint Pierre, Les Essarts
   Panneau d'aménagements pour les élèves dys (dyslexie, dysorthographie,
   dyspraxie visuo-spatiale) et, plus largement, pour tous ceux qui lisent
   mieux avec un texte plus grand, plus aéré ou sur un fond moins éblouissant.

   Réglages proposés : police, taille, interligne, espacement des lettres et
   des mots, couleur de page, largeur de colonne, règle de lecture et masque
   de lecture. Les choix sont enregistrés sur l'appareil et se retrouvent
   d'une capsule à l'autre : l'élève ne les refait qu'une fois.

   Utilisation dans une capsule : une seule ligne, avant </body>
       <script src="../../assets/js/confort-lecture.js" defer></script>

   Réglages facultatifs, à déclarer AVANT le script :
       <script>window.CONFORT_LECTURE = {
         hote: ".pbar-in",              // où placer le bouton
         racine: "main",                // zone dont la taille est ajustée
         fonts: "../../pp4g/fonts/"     // dossier des polices B612
       };</script>

   API : ConfortLecture.ouvrir() · .fermer() · .reglages() · .appliquer(obj)
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var cfg    = window.CONFORT_LECTURE || {};
  var HOTE   = cfg.hote   || ".pbar-in";
  var RACINE = cfg.racine || "main";
  var FONTS  = cfg.fonts  || "../../pp4g/fonts/";
  var CLE    = "confort_lecture";

  /* Valeurs par défaut = page telle qu'elle est écrite par le professeur. */
  var DEFAUT = {
    police: "systeme",   /* systeme | b612 | large */
    taille: 0,           /* 0 → 4 */
    interligne: 0,       /* 0 → 2 */
    espacement: 0,       /* 0 → 2 */
    fond: "blanc",       /* blanc | creme | bleu | gris | vert */
    colonne: false,      /* limite la longueur des lignes */
    regle: false,        /* règle de lecture qui suit le curseur */
    masque: false        /* masque le reste de la page */
  };
  var TAILLES     = [1, 1.1, 1.2, 1.35, 1.5];
  var INTERLIGNES = ["", "1.9", "2.3"];
  var ESPACEMENTS = ["", ".055em/.16em", ".11em/.3em"];
  /* Teintes de page : [fond de la page, fond des cartes]. Des fonds pastel,
     jamais un blanc pur, réduisent l'éblouissement et l'effet de « rivières ». */
  var TEINTES = {
    creme: ["#F3E7CF", "#FBF3E4"],
    bleu:  ["#D6E6F4", "#E9F2FA"],
    gris:  ["#DDE1E6", "#EFF1F4"],
    vert:  ["#DBE9D6", "#EEF6EC"]
  };

  var etat = lire();
  var panneau = null, bouton = null, regleEl = null, masqueEl = null;

  /* ── Mémoire ────────────────────────────────────────────────────────── */
  function lire() {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) {}
    var r = {};
    for (var k in DEFAUT) if (DEFAUT.hasOwnProperty(k)) {
      r[k] = (o[k] === undefined) ? DEFAUT[k] : o[k];
    }
    return r;
  }
  function ecrire() {
    try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) {}
  }
  function actif() {
    for (var k in DEFAUT) if (DEFAUT.hasOwnProperty(k) && etat[k] !== DEFAUT[k]) return true;
    return false;
  }

  /* ── Styles ─────────────────────────────────────────────────────────── */
  function injecterStyles() {
    var css = document.createElement("style");
    css.textContent =
      /* Police B612 (Airbus / ANSSI) : dessinée pour être lue vite et sans
         confondre les lettres proches. Chargée seulement si elle est choisie. */
      "@font-face{font-family:'B612CL';src:url('" + FONTS + "B612-Regular.ttf') format('truetype');font-weight:400;font-display:swap}" +
      "@font-face{font-family:'B612CL';src:url('" + FONTS + "B612-Bold.ttf') format('truetype');font-weight:700;font-display:swap}" +

      ".cl-btn{background:#F4F6F8;border:1px solid #E2E8F0;border-radius:8px;padding:6px 12px;" +
        "font-family:inherit;font-size:12px;font-weight:600;color:#4A5568;cursor:pointer;transition:.15s}" +
      ".cl-btn:hover{background:#DEEAF1;border-color:#2E75B6;color:#1F4E79}" +
      ".cl-btn.cl-on{background:#E2EFDA;border-color:#1E6B3B;color:#1E6B3B}" +

      /* ─ Panneau ─ */
      ".cl-fond{position:fixed;inset:0;background:rgba(15,23,42,.34);z-index:190;display:none}" +
      ".cl-fond.cl-ouvert{display:block}" +
      ".cl-panneau{position:fixed;z-index:200;right:16px;top:16px;width:min(360px,calc(100vw - 32px));" +
        "max-height:calc(100vh - 32px);overflow:auto;background:#fff;border-radius:14px;" +
        "box-shadow:0 18px 48px rgba(15,23,42,.28);padding:16px 18px 18px;display:none;" +
        "font-family:'DM Sans',system-ui,sans-serif;color:#1A202C}" +
      ".cl-panneau.cl-ouvert{display:block}" +
      ".cl-tete{display:flex;align-items:center;gap:10px;margin-bottom:4px}" +
      ".cl-tete h2{font-size:16px;font-weight:700;color:#1F4E79;flex:1;margin:0}" +
      ".cl-x{background:none;border:none;font-size:20px;line-height:1;color:#4A5568;cursor:pointer;padding:2px 6px;border-radius:6px}" +
      ".cl-x:hover{background:#F4F6F8}" +
      ".cl-intro{font-size:12px;color:#4A5568;margin:0 0 12px;line-height:1.5}" +
      ".cl-grp{margin-bottom:13px}" +
      ".cl-grp>span.cl-lb{display:block;font-size:11px;font-weight:700;text-transform:uppercase;" +
        "letter-spacing:.8px;color:#1F4E79;margin-bottom:5px}" +
      ".cl-choix{display:flex;flex-wrap:wrap;gap:6px}" +
      ".cl-opt{border:2px solid #E2E8F0;background:#fff;border-radius:8px;padding:6px 11px;" +
        "font-family:inherit;font-size:12.5px;font-weight:600;color:#4A5568;cursor:pointer;transition:.12s}" +
      ".cl-opt:hover{border-color:#2E75B6}" +
      ".cl-opt[aria-pressed=true]{background:#1F4E79;border-color:#1F4E79;color:#fff}" +
      ".cl-opt.cl-pastille{width:34px;height:30px;padding:0}" +
      ".cl-pied{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px solid #E2E8F0}" +
      ".cl-apercu{border:1px dashed #CBD5E0;border-radius:9px;padding:9px 11px;font-size:13px;color:#1A202C;margin-bottom:12px}" +

      /* ─ Réglages appliqués à la page ─ */
      "html.cl-police-b612 body,html.cl-police-b612 body *{font-family:'B612CL','DM Sans',system-ui,sans-serif!important}" +
      "html.cl-police-large body,html.cl-police-large body *{font-family:Verdana,Tahoma,'DM Sans',system-ui,sans-serif!important}" +
      "html.cl-espacement body{letter-spacing:var(--cl-lettre)!important;word-spacing:var(--cl-mot)!important}" +
      "html.cl-interligne body,html.cl-interligne body p,html.cl-interligne body li,html.cl-interligne body td," +
        "html.cl-interligne body label,html.cl-interligne body .qlabel{line-height:var(--cl-interligne)!important}" +
      "html.cl-colonne body p,html.cl-colonne body li,html.cl-colonne body .lesson,html.cl-colonne body .qlabel," +
        "html.cl-colonne body .hint{max-width:62ch}" +
      /* La teinte porte sur le fond de page ET sur les cartes : c'est derrière le
         texte qu'un fond moins éblouissant aide vraiment à lire. */
      "html.cl-teinte body{background:var(--cl-page)!important}" +
      "html.cl-teinte section.step,html.cl-teinte .stbody,html.cl-teinte .card," +
        "html.cl-teinte .lesson,html.cl-teinte figure.illus,html.cl-teinte figure.illus figcaption," +
        "html.cl-teinte table.grid td{background:var(--cl-carte)!important}" +

      /* ─ Règle et masque de lecture ─ */
      ".cl-regle{position:fixed;left:0;right:0;height:2.4em;z-index:150;pointer-events:none;display:none;" +
        "background:rgba(255,214,102,.30);border-top:2px solid #E8A317;border-bottom:2px solid #E8A317}" +
      ".cl-regle.cl-ouvert{display:block}" +
      ".cl-masque{position:fixed;inset:0;z-index:149;pointer-events:none;display:none}" +
      ".cl-masque.cl-ouvert{display:block}" +
      ".cl-masque div{position:absolute;left:0;right:0;background:rgba(15,23,42,.55)}" +

      "@media print{.cl-btn,.cl-panneau,.cl-fond,.cl-regle,.cl-masque{display:none!important}" +
        "html.cl-teinte body,html.cl-teinte section.step,html.cl-teinte .stbody,html.cl-teinte .card," +
        "html.cl-teinte .lesson,html.cl-teinte table.grid td{background:#fff!important}}";
    document.head.appendChild(css);
  }

  /* ── Application des réglages ────────────────────────────────────────── */
  function appliquer(nouveau) {
    if (nouveau) { for (var k in nouveau) if (nouveau.hasOwnProperty(k)) etat[k] = nouveau[k]; }
    var h = document.documentElement, s = h.style, cl = h.classList;

    cl.remove("cl-police-b612", "cl-police-large");
    if (etat.police === "b612")  cl.add("cl-police-b612");
    if (etat.police === "large") cl.add("cl-police-large");

    /* La taille agit par zoom sur la zone de contenu : l'en-tête, la barre
       d'outils et la barre d'envoi gardent leur place et restent atteignables. */
    var racine = document.querySelector(RACINE);
    if (racine) racine.style.zoom = TAILLES[etat.taille] === 1 ? "" : TAILLES[etat.taille];

    cl.toggle("cl-interligne", etat.interligne > 0);
    s.setProperty("--cl-interligne", INTERLIGNES[etat.interligne] || "");

    cl.toggle("cl-espacement", etat.espacement > 0);
    var esp = (ESPACEMENTS[etat.espacement] || "").split("/");
    s.setProperty("--cl-lettre", esp[0] || "normal");
    s.setProperty("--cl-mot", esp[1] || "normal");

    var teinte = TEINTES[etat.fond];
    cl.toggle("cl-teinte", !!teinte);
    s.setProperty("--cl-page",  teinte ? teinte[0] : "");
    s.setProperty("--cl-carte", teinte ? teinte[1] : "");

    cl.toggle("cl-colonne", !!etat.colonne);

    if (regleEl)  regleEl.classList.toggle("cl-ouvert", !!etat.regle);
    if (masqueEl) masqueEl.classList.toggle("cl-ouvert", !!etat.masque);
    if (etat.regle || etat.masque) brancherSuivi(); else debrancherSuivi();

    if (bouton) bouton.classList.toggle("cl-on", actif());
    ecrire();
    majPanneau();
  }

  /* ── Règle / masque : suivent le curseur ou le doigt ─────────────────── */
  var suivi = false, yCourant = null;
  function placer(y) {
    yCourant = y;
    var hauteur = 44;
    if (regleEl && etat.regle) {
      hauteur = regleEl.offsetHeight || 44;
      regleEl.style.top = Math.max(0, y - hauteur / 2) + "px";
    }
    if (masqueEl && etat.masque) {
      var bande = 92;
      masqueEl.firstChild.style.top = "0px";
      masqueEl.firstChild.style.height = Math.max(0, y - bande / 2) + "px";
      masqueEl.lastChild.style.top = (y + bande / 2) + "px";
      masqueEl.lastChild.style.bottom = "0px";
    }
  }
  function surDeplacement(e) {
    var y = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
    if (typeof y === "number") placer(y);
  }
  function brancherSuivi() {
    if (suivi) return;
    suivi = true;
    document.addEventListener("mousemove", surDeplacement, { passive: true });
    document.addEventListener("touchmove", surDeplacement, { passive: true });
    placer(yCourant === null ? Math.round(window.innerHeight / 2) : yCourant);
  }
  function debrancherSuivi() {
    if (!suivi) return;
    suivi = false;
    document.removeEventListener("mousemove", surDeplacement);
    document.removeEventListener("touchmove", surDeplacement);
  }

  /* ── Panneau ────────────────────────────────────────────────────────── */
  function groupe(titre, html) {
    return '<div class="cl-grp"><span class="cl-lb">' + titre + '</span><div class="cl-choix">' + html + '</div></div>';
  }
  function opt(cle, valeur, libelle, extra) {
    return '<button type="button" class="cl-opt' + (extra || "") + '" data-cle="' + cle +
           '" data-valeur="' + valeur + '">' + libelle + '</button>';
  }
  function construirePanneau() {
    var fond = document.createElement("div");
    fond.className = "cl-fond";
    fond.addEventListener("click", fermer);

    panneau = document.createElement("div");
    panneau.className = "cl-panneau";
    panneau.setAttribute("role", "dialog");
    panneau.setAttribute("aria-label", "Confort de lecture");
    panneau.setAttribute("data-nolecture", "");

    panneau.innerHTML =
      '<div class="cl-tete"><h2>&#x1F441;&#xFE0F; Confort de lecture</h2>' +
      '<button type="button" class="cl-x" aria-label="Fermer">&times;</button></div>' +
      '<p class="cl-intro">Règle la page comme tu la lis le mieux. Tes choix sont gardés sur cet appareil et ' +
      'te suivent dans les autres activités.</p>' +
      '<div class="cl-apercu" id="cl-apercu">L’eau potable est une ressource limitée : il faut éviter de la gaspiller.</div>' +

      groupe("Police",
        opt("police", "systeme", "Standard") + opt("police", "b612", "B612 (dys)") + opt("police", "large", "Verdana")) +

      groupe("Taille du texte",
        opt("taille", "0", "A") + opt("taille", "1", "A+") + opt("taille", "2", "A++") +
        opt("taille", "3", "A+++") + opt("taille", "4", "A++++")) +

      groupe("Interligne",
        opt("interligne", "0", "Normal") + opt("interligne", "1", "Aéré") + opt("interligne", "2", "Très aéré")) +

      groupe("Espacement des lettres et des mots",
        opt("espacement", "0", "Normal") + opt("espacement", "1", "Espacé") + opt("espacement", "2", "Très espacé")) +

      groupe("Couleur de la page",
        opt("fond", "blanc", "&nbsp;", ' cl-pastille" title="Blanc" style="background:#fff') +
        opt("fond", "creme", "&nbsp;", ' cl-pastille" title="Crème" style="background:#FBF3E4') +
        opt("fond", "bleu",  "&nbsp;", ' cl-pastille" title="Bleu pâle" style="background:#E9F2FA') +
        opt("fond", "gris",  "&nbsp;", ' cl-pastille" title="Gris" style="background:#EFF1F4') +
        opt("fond", "vert",  "&nbsp;", ' cl-pastille" title="Vert pâle" style="background:#EEF6EC')) +

      groupe("Aides au repérage",
        opt("colonne", "toggle", "&#x1F4D0; Lignes courtes") +
        opt("regle",   "toggle", "&#x1F4CF; Règle de lecture") +
        opt("masque",  "toggle", "&#x1F311; Masque de lecture")) +

      '<div class="cl-pied">' +
      '<button type="button" class="cl-btn" id="cl-reset">&#x21BA; Tout remettre à zéro</button>' +
      '<button type="button" class="cl-btn" id="cl-ok" style="margin-left:auto">Terminé</button>' +
      '</div>';

    document.body.appendChild(fond);
    document.body.appendChild(panneau);

    panneau.querySelector(".cl-x").addEventListener("click", fermer);
    panneau.querySelector("#cl-ok").addEventListener("click", fermer);
    panneau.querySelector("#cl-reset").addEventListener("click", function () {
      etat = {};
      for (var k in DEFAUT) if (DEFAUT.hasOwnProperty(k)) etat[k] = DEFAUT[k];
      appliquer();
    });
    panneau.addEventListener("click", function (ev) {
      var b = ev.target.closest(".cl-opt");
      if (!b) return;
      var cle = b.getAttribute("data-cle"), v = b.getAttribute("data-valeur");
      var o = {};
      if (v === "toggle") o[cle] = !etat[cle];
      else o[cle] = /^\d+$/.test(v) ? parseInt(v, 10) : v;
      appliquer(o);
    });
    panneau._fond = fond;
  }
  function majPanneau() {
    if (!panneau) return;
    var opts = panneau.querySelectorAll(".cl-opt");
    for (var i = 0; i < opts.length; i++) {
      var cle = opts[i].getAttribute("data-cle"), v = opts[i].getAttribute("data-valeur");
      var choisi = (v === "toggle") ? !!etat[cle] : String(etat[cle]) === v;
      opts[i].setAttribute("aria-pressed", choisi ? "true" : "false");
    }
  }
  function ouvrir() {
    if (!panneau) construirePanneau();
    majPanneau();
    panneau._fond.classList.add("cl-ouvert");
    panneau.classList.add("cl-ouvert");
  }
  function fermer() {
    if (!panneau) return;
    panneau._fond.classList.remove("cl-ouvert");
    panneau.classList.remove("cl-ouvert");
  }

  /* ── Bouton dans la barre d'outils ──────────────────────────────────── */
  function construireBouton() {
    bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "cl-btn";
    bouton.title = "Police, taille, interligne, couleur de page, règle de lecture…";
    bouton.innerHTML = "&#x1F441;&#xFE0F; Confort de lecture";
    bouton.addEventListener("click", ouvrir);

    var enveloppe = document.createElement("span");
    enveloppe.setAttribute("data-nolecture", "");
    enveloppe.appendChild(bouton);

    var hote = document.querySelector(HOTE);
    if (hote) hote.appendChild(enveloppe);
    else {
      enveloppe.style.cssText = "position:fixed;left:14px;bottom:112px;z-index:70;background:#fff;" +
        "border:1px solid #E2E8F0;border-radius:10px;padding:7px 10px;box-shadow:0 4px 16px rgba(0,0,0,.14)";
      document.body.appendChild(enveloppe);
    }
  }

  /* ── Départ ─────────────────────────────────────────────────────────── */
  function init() {
    injecterStyles();

    regleEl = document.createElement("div");
    regleEl.className = "cl-regle";
    regleEl.setAttribute("data-nolecture", "");
    masqueEl = document.createElement("div");
    masqueEl.className = "cl-masque";
    masqueEl.setAttribute("data-nolecture", "");
    masqueEl.innerHTML = "<div></div><div></div>";
    document.body.appendChild(masqueEl);
    document.body.appendChild(regleEl);

    construireBouton();
    appliquer();

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") fermer();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.ConfortLecture = {
    ouvrir: ouvrir,
    fermer: fermer,
    reglages: function () { var c = {}; for (var k in etat) if (etat.hasOwnProperty(k)) c[k] = etat[k]; return c; },
    appliquer: appliquer
  };
})();
