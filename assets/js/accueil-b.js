/* ==========================================================================
   Relooking de l'accueil — piste B « Cité-circuit »
   Couche posée par-dessus le site : elle n'en change pas le fonctionnement.
   doLogin, launch, renderDash, goPage et doLogout restent ceux d'index.html ;
   ce script les enveloppe (l'original d'abord, de façon synchrone) pour habiller
   la connexion et le tableau de bord, et animer la ville (cite-circuit.js).
   Sans html.accueil-b (?classique), il ne fait rien. Une erreur ici ne casse
   pas le site : tout est dans un try.
   ========================================================================== */
(function () {
  "use strict";
  var html = document.documentElement;
  if (!html.classList.contains("accueil-b")) return;
  try {

  var params = location.search;
  if (/[?&]rm\b/.test(params)) html.classList.add("rm");
  var mqRM = window.matchMedia("(prefers-reduced-motion: reduce)");
  function reduit() { return mqRM.matches || html.classList.contains("rm"); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function emettre(nom, detail) { document.dispatchEvent(new CustomEvent(nom, { detail: detail || {} })); }
  function texte(h) { var t = document.createElement("textarea"); t.innerHTML = h; return t.value; }
  function echapper(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- API lue par la scène ---------- */
  var fps = /[?&]fps\b/.test(params) ? document.body.appendChild(Object.assign(document.createElement("div"), { className: "b-fps" })) : null;
  window.ACCUEIL_B = {
    vue: "login",
    reduit: reduit,
    setFps: function (t) { if (fps) fps.textContent = t; }
  };
  function vue(v) {
    var ancienne = window.ACCUEIL_B.vue;
    window.ACCUEIL_B.vue = v;
    html.classList.remove("vue-login", "vue-dash", "vue-page");
    html.classList.add("vue-" + v);
    if (v !== ancienne) emettre("labo:view", { vue: v, de: ancienne });
  }

  /* ---------- Ce qui compte comme activité (pas un corrigé, pas une remédiation) ---------- */
  function estCorrige(s) { return /-cor(\b|-)|corrige/.test(s.id) || /Corrig/.test(texte(s.titre)); }
  function estEvaluation(s) { return !!(window.EVALUATIONS && EVALUATIONS[s.id]) || s.id === "dc" || /eval/.test(s.id); }
  function estActivite(s) { return !estCorrige(s) && !/^rem/.test(s.id); }

  /* ============================ CONNEXION ============================ */
  (function compteurs() {
    var ouvertes = SEQUENCES_DEF.filter(function (s) { return s.open && estActivite(s); });
    var seqs = {}, niveaux = {};
    ouvertes.forEach(function (s) { seqs[s.niveau + ":" + numeroSequence(s)] = 1; niveaux[s.niveau] = 1; });
    var val = { activites: ouvertes.length, sequences: Object.keys(seqs).length, niveaux: Object.keys(niveaux).length };
    $$("[data-b-compte]").forEach(function (el) {
      var cible = val[el.getAttribute("data-b-compte")] || 0;
      if (reduit()) { el.textContent = cible; return; }
      var t0 = performance.now();
      (function pas(t) {
        var k = Math.min(1, (t - t0) / 1300);
        el.textContent = Math.round(cible * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(pas);
      })(t0);
    });
  })();

  var MOTS = ["Programmer.", "Construire.", "Connecter.", "Comprendre."], iMot = 0;
  setInterval(function () {
    if (window.ACCUEIL_B.vue !== "login") return;
    var w = $(".b-rot .w"); if (!w) return;
    iMot = (iMot + 1) % MOTS.length;
    if (reduit()) { w.textContent = MOTS[iMot]; return; }
    w.classList.add("out");
    setTimeout(function () { w.textContent = MOTS[iMot]; w.classList.remove("out"); w.classList.add("in"); void w.offsetWidth; w.classList.remove("in"); }, 380);
  }, 2800);

  var FAITS = [
    ["Le Velcro est né en 1941 : George de Mestral a observé au microscope les crochets des graines de bardane restées accrochées à son chien.", "P13 · Biomimétisme"],
    ["La commande ping doit son nom au bruit du sonar : elle envoie un signal et attend son écho.", "P2 · Réseau"],
    ["Presque tout Internet entre les continents passe par des câbles posés au fond des océans, pas par satellite.", "P2 · Réseau"],
    ["Un robinet qui goutte peut gaspiller jusqu'à 100 litres d'eau par jour.", "P11 · L'eau"],
    ["Le nez du Shinkansen imite le bec du martin-pêcheur : le train fait beaucoup moins de bruit en sortant des tunnels.", "P13 · Biomimétisme"],
    ["En 1947, un papillon de nuit coincé dans un relais du calculateur Harvard Mark II est entré dans l'histoire comme le premier « bug » documenté.", "Numérique"],
    ["Le premier SMS, envoyé en décembre 1992, disait simplement « Merry Christmas ».", "Numérique"],
    ["Une imprimante 3D dépose la matière couche par couche, souvent en couches de 0,2 mm.", "Fabrication"]
  ];
  var iFait = Math.floor(Math.random() * FAITS.length);
  function montrerFait() { var t = $(".b-fact .t"), s = $(".b-fact .s"); if (t) t.textContent = FAITS[iFait][0]; if (s) s.textContent = FAITS[iFait][1]; }
  montrerFait();
  setInterval(function () {
    if (window.ACCUEIL_B.vue !== "login") return;
    var t = $(".b-fact .t"); if (!t) return;
    iFait = (iFait + 1) % FAITS.length;
    t.classList.add("swap");
    setTimeout(function () { montrerFait(); t.classList.remove("swap"); }, 450);
  }, 8000);

  /* ============================ TABLEAU DE BORD ============================ */
  function niveauEleve() { return user && (user.niveau || (user.c ? user.c.charAt(0) + "ème" : "")); }
  function monStatut(capId) {
    var subs = getSubs();
    for (var i = 0; i < subs.length; i++) if (user && subs[i].eid === user.id && subs[i].cap === capId) return subs[i].status || "pending";
    return "";
  }
  function metaDossier(s) { return ((window.DOSSIERS_SEQ || {})[s.niveau] || {})[numeroSequence(s)] || {}; }

  /* Bandeau en grille : Bonjour + date, « Ta prochaine mission », « Ton avancement ».
     Le bandeau existant est déplacé dans la grille, pas recréé (ses id restent). */
  function bento() {
    var ban = $("#pg-dash .wbanner");
    if (!ban) return null;
    var grille = $("#pg-dash .b-bento");
    if (!grille) {
      grille = document.createElement("div");
      grille.className = "b-bento b-only";
      ban.parentNode.insertBefore(grille, ban);
      grille.appendChild(ban);
      var date = document.createElement("div");
      date.className = "b-date"; date.id = "b-date";
      var h2 = $("#wmsg"); if (h2) h2.parentNode.insertBefore(date, h2.nextSibling);
    }
    return grille;
  }

  function habillerDash() {
    var grille = bento();
    if (!grille || !user) return;
    var eleve = !isProf && !isCollegue;
    var d = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
    var date = $("#b-date"); if (date) date.textContent = d.charAt(0).toUpperCase() + d.slice(1);
    $$(".b-tile", grille).forEach(function (t) { t.remove(); });
    if (!eleve) return;
    $("#wmsg").textContent = (new Date().getHours() < 18 ? "Bonjour " : "Bonsoir ") + user.p + " !";

    var niv = niveauEleve();
    var miennes = SEQUENCES_DEF.filter(function (s) { return s.niveau === niv && estActivite(s); })
      .sort(function (a, b) { return (a.ordre || 0) - (b.ordre || 0); });
    var c = { validated: 0, pending: 0, rejected: 0, afaire: 0, bientot: 0 }, mission = null;
    miennes.forEach(function (s) {
      var st = monStatut(s.id);
      if (!s.open) c.bientot++;
      else if (c[st] !== undefined) c[st]++;
      else { c.afaire++; if (!mission && !estEvaluation(s)) mission = s; }
    });
    var intro = $("#pg-dash .wbanner p");
    if (intro) intro.textContent = "Tu as " + c.validated + " travail" + (c.validated > 1 ? "x" : "") + " validé" + (c.validated > 1 ? "s" : "")
      + (c.pending ? ", " + c.pending + " en attente de correction" : "")
      + (c.rejected ? ", " + c.rejected + " à retravailler" : "") + ".";

    if (mission) {
      var m = metaDossier(mission), couleur = m.couleur || "#2E75B6";
      var tuile = document.createElement("div");
      tuile.className = "b-tile b-mission"; tuile.setAttribute("role", "button"); tuile.tabIndex = 0;
      tuile.style.setProperty("--c", couleur);
      tuile.innerHTML = '<span class="k">Ta prochaine mission</span><div class="row"><span class="ico">' + (m.icone || "&#x1F680;") + "</span><h3>"
        + echapper(texte(mission.titre).replace(/^P\d+\s*—\s*/, "")) + "</h3></div><p>" + echapper(texte(mission.desc)) + '</p><span class="b-cta">Commencer <span class="arr">→</span></span>';
      /* On passe par la carte du tableau de bord : même code d'accès, même page, mêmes règles. */
      var ouvrir = function () {
        var titre = texte(mission.titre);
        var carte = $$("#sequences-par-niveau .scard").filter(function (k) { var h = $("h3", k); return h && h.textContent === titre; })[0];
        if (carte) carte.click();
      };
      tuile.addEventListener("click", ouvrir);
      tuile.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ouvrir(); } });
      grille.appendChild(tuile);
    }
    var tot = miennes.length || 1;
    var prog = document.createElement("div");
    prog.className = "b-tile b-prog";
    prog.innerHTML = '<span class="k">Ton avancement · ' + echapper(niv.replace("ème", "e")) + "</span>"
      + '<div class="big">' + c.validated + " <small>travaux validés sur " + (miennes.length - c.bientot) + "</small></div>"
      + '<div class="bar"><i style="background:#34D399" data-w="' + (100 * c.validated / tot) + '%"></i><i style="background:#FBBF24" data-w="' + (100 * c.pending / tot)
      + '%"></i><i style="background:#F87171" data-w="' + (100 * c.rejected / tot) + '%"></i><i style="background:#00C6FF;opacity:.45" data-w="' + (100 * c.afaire / tot) + '%"></i></div>'
      + '<div class="legend"><span style="--c:#34D399">' + c.validated + " validés</span><span style=\"--c:#FBBF24\">" + c.pending + " en attente</span>"
      + (c.rejected ? '<span style="--c:#F87171">' + c.rejected + " à retravailler</span>" : "")
      + '<span style="--c:#00C6FF">' + c.afaire + " à faire</span><span style=\"--c:#71859F\">" + c.bientot + " à venir</span></div>";
    grille.appendChild(prog);
    requestAnimationFrame(function () { requestAnimationFrame(function () { $$(".b-prog .bar i").forEach(function (i) { i.style.width = i.getAttribute("data-w"); }); }); });
  }

  /* Anneaux, niveau de l'élève en premier, corrigés en retrait, cartes qui s'inclinent */
  function habillerSequences() {
    var hote = $("#sequences-par-niveau");
    if (!hote) return;
    $$(".scard", hote).forEach(function (k) {
      var h = $("h3", k);
      if (h && /Corrig/.test(h.textContent)) k.classList.add("b-cor");
      if (!k.classList.contains("locked")) inclinaison(k);
    });
    /* Anneau : travaux validés sur activités ouvertes du dossier (sans les corrigés,
       qui ne se valident jamais), lus sur les cartes affichées. */
    $$(".dossier", hote).forEach(function (d) {
      var cartes = $$(".scard:not(.b-cor):not(.locked)", d);
      var ouv = cartes.length, val = cartes.filter(function (k) { return /Travail valid/.test(k.textContent); }).length, bt = $(".dossier-bt", d);
      if (!bt || !ouv || !user || isProf || isCollegue || $(".b-ring", bt)) return;
      var r = 15, L = 2 * Math.PI * r, couleur = bt.style.borderLeftColor || "#00C6FF";
      bt.insertAdjacentHTML("beforeend", '<svg class="b-ring" viewBox="0 0 38 38" style="--c:' + couleur + '" aria-label="' + val + " sur " + ouv + ' validés">'
        + '<circle class="fond" cx="19" cy="19" r="' + r + '"></circle><circle class="val" cx="19" cy="19" r="' + r + '" stroke-dasharray="' + L.toFixed(1)
        + '" stroke-dashoffset="' + L.toFixed(1) + '" data-off="' + (L * (1 - Math.min(1, val / ouv))).toFixed(1) + '"></circle>'
        + '<text x="19" y="23" text-anchor="middle">' + val + "/" + ouv + "</text></svg>");
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { $$(".b-ring .val", hote).forEach(function (c) { c.style.strokeDashoffset = c.getAttribute("data-off"); }); }); });
    var niv = niveauEleve();
    if (niv && !isProf) {
      var sections = $$(".niveau-section", hote), mienne = sections.filter(function (s) { var l = $(".niveau-label", s); return l && l.textContent.indexOf(niv) >= 0; })[0];
      if (mienne) {
        hote.insertBefore(mienne, hote.firstChild);
        var lab = $(".niveau-label", mienne);
        if (lab && !$(".b-me", lab)) lab.insertAdjacentHTML("beforeend", '<span class="b-me">Ton niveau</span>');
      }
    }
  }

  /* Ressort critique (Apple : amortissement 1, réponse en secondes) */
  function Ressort(reponse) { this.x = 0; this.v = 0; this.cible = 0; this.k = Math.pow(2 * Math.PI / reponse, 2); this.c = 4 * Math.PI / reponse; }
  Ressort.prototype.pas = function (dt) {
    var n = Math.ceil(dt / (1 / 240)), h = dt / n;
    for (var i = 0; i < n; i++) { var a = -this.k * (this.x - this.cible) - this.c * this.v; this.v += a * h; this.x += this.v * h; }
    return Math.abs(this.x - this.cible) > 0.001 || Math.abs(this.v) > 0.001;
  };
  function inclinaison(el) {
    if (el._bIncline) return;
    el._bIncline = true;
    el.insertAdjacentHTML("afterbegin", '<span class="b-glare"></span>');
    var rx = new Ressort(0.4), ry = new Ressort(0.4), lv = new Ressort(0.35), actif = false, t0 = 0;
    function boucle(t) {
      var dt = Math.min(0.05, (t - t0) / 1000 || 0.016); t0 = t;
      var a = rx.pas(dt), b = ry.pas(dt), c = lv.pas(dt);
      el.style.transform = "perspective(800px) rotateX(" + rx.x.toFixed(2) + "deg) rotateY(" + ry.x.toFixed(2) + "deg) translateY(" + (-lv.x).toFixed(2) + "px)";
      if (a || b || c) requestAnimationFrame(boucle); else { actif = false; if (!rx.x && !ry.x) el.style.transform = ""; }
    }
    function lancer() { if (!actif) { actif = true; t0 = performance.now(); requestAnimationFrame(boucle); } }
    el.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch" || reduit()) return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--gx", (x * 100) + "%"); el.style.setProperty("--gy", (y * 100) + "%");
      rx.cible = (0.5 - y) * 6; ry.cible = (x - 0.5) * 8; lv.cible = 4; lancer();
    });
    el.addEventListener("pointerleave", function () { rx.cible = ry.cible = lv.cible = 0; lancer(); });
    el.addEventListener("pointerdown", function () { rx.cible = ry.cible = lv.cible = 0; rx.x = ry.x = lv.x = 0; el.style.transform = ""; });
  }

  /* ============================ ÉCOUTE DU SITE ============================ */
  function envelopper(nom, apres) {
    var original = window[nom];
    if (typeof original !== "function") return;
    window[nom] = function () {
      var r = original.apply(this, arguments);
      try { apres.apply(this, arguments); } catch (e) { try { console.warn("[accueil-b] " + nom + " :", e); } catch (e2) {} }
      return r;
    };
  }
  envelopper("goPage", function (pid) { vue(pid === "pg-dash" ? "dash" : "page"); });
  envelopper("renderDash", function () { habillerSequences(); habillerDash(); });
  envelopper("launch", function () {
    emettre("labo:login");
    if (window.ACCUEIL_B.vue === "dash" && !reduit()) {
      var p = $("#pg-dash");
      $$(".b-bento, .stit, #sequences-par-niveau > *", p).forEach(function (el, i) { el.style.setProperty("--i", i); });
      p.classList.remove("b-entree"); void p.offsetWidth; p.classList.add("b-entree");
      setTimeout(function () { p.classList.remove("b-entree"); }, 1600);
    }
  });
  envelopper("doLogout", function () { emettre("labo:logout"); vue("login"); });
  vue(document.getElementById("login").style.display === "none" ? "page" : "login");

  /* ============================ SCÈNE 3D ============================ */
  /* Décidé avant tout téléchargement : rien n'est chargé pour une machine qui ne l'affichera pas. */
  function capacite() {
    if (/[?&]sans3d\b/.test(params)) return false;
    try {
      var c = document.createElement("canvas"), gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) return false;
      var dbg = gl.getExtension("WEBGL_debug_renderer_info"), r = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
      var perte = gl.getExtension("WEBGL_lose_context"); if (perte) perte.loseContext();
      if (/SwiftShader|Software|llvmpipe|Basic Render/i.test(r)) return false;
    } catch (e) { return false; }
    if ((navigator.hardwareConcurrency || 4) <= 2) return false;
    if (navigator.deviceMemory && navigator.deviceMemory < 2) return false;
    if (navigator.connection && navigator.connection.saveData) return false;
    return true;
  }
  if (capacite()) {
    var s = document.createElement("script");
    s.src = "assets/js/cite-circuit.js";
    s.onerror = function () { html.classList.add("sans-3d"); };
    document.body.appendChild(s);
  } else html.classList.add("sans-3d");

  } catch (e) {
    try { console.warn("[accueil-b] relooking désactivé :", e); } catch (e2) {}
  }
})();
