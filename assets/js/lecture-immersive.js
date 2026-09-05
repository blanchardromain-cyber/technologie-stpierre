/* ════════════════════════════════════════════════════════════════════════
   LECTURE IMMERSIVE — Collège Saint Pierre, Les Essarts
   Lit la page à voix haute (haut-parleurs ou écouteurs) en surlignant le
   texte au fur et à mesure : le paragraphe en cours, et le mot prononcé
   quand le navigateur le signale.

   Utilisation dans une capsule : une seule ligne, avant </body>
       <script src="../../assets/js/lecture-immersive.js" defer></script>

   Réglages facultatifs, à déclarer AVANT le script :
       <script>window.LECTURE_IMMERSIVE = {
         racine: "main",                        // zone à lire
         hote: ".pbar-in",                      // où placer le bouton
         sectionsFermees: "section.step.closed",// dépliées avant la lecture
         classeFermeture: "closed",
         vitesse: 1
       };</script>

   Pour exclure un élément de la lecture : attribut data-nolecture.
   API : LectureImmersive.demarrer(depuis) · .pause() · .stop() · .actif()
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var cfg = window.LECTURE_IMMERSIVE || {};
  var RACINE     = cfg.racine  || "main";
  var HOTE       = cfg.hote    || ".pbar-in";
  var FERMEES    = cfg.sectionsFermees !== undefined ? cfg.sectionsFermees : "section.step.closed";
  var CL_FERMEE  = cfg.classeFermeture || "closed";
  var SELECTEURS = cfg.selecteurs ||
    "h1, h2, h3, h4, .qlabel, .lesson, .hint, .legend, p, li, figcaption, td, th, .chip, .cbline label, summary";
  var CLE_VITESSE = "lecture_immersive_vitesse";

  var synth = window.speechSynthesis;
  var blocs = [], index = -1, motsCourants = [], bornes = [], enPause = false, enLecture = false;
  var voixFr = null, tickReprise = null, boundaryVu = false, motActif = null;
  var minuterie = null, plan = [], tDebut = 0, pauseCumul = 0, pauseDebut = 0;

  /* ── Styles ─────────────────────────────────────────────────────────── */
  function injecterStyles() {
    var css = document.createElement("style");
    css.textContent =
      ".li-barre{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap}" +
      ".li-btn{background:#F4F6F8;border:1px solid #E2E8F0;border-radius:8px;padding:6px 12px;" +
        "font-family:inherit;font-size:12px;font-weight:600;color:#4A5568;cursor:pointer;transition:.15s}" +
      ".li-btn:hover{background:#DEEAF1;border-color:#2E75B6;color:#1F4E79}" +
      ".li-btn.li-on{background:#E2EFDA;border-color:#1E6B3B;color:#1E6B3B}" +
      ".li-sel{background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:5px 6px;" +
        "font-family:inherit;font-size:12px;color:#4A5568;cursor:pointer}" +
      /* !important et couleur forcée : le surlignage doit rester lisible même sur
         un bandeau coloré ou un en-tête de tableau en texte blanc. */
      ".li-bloc{background:#FFF6C2!important;color:#1A202C!important;border-radius:5px;" +
        "box-shadow:0 0 0 4px #FFF6C2;transition:background .15s}" +
      ".li-bloc *{color:inherit!important}" +
      ".li-mot-actif{background:#FFC93C!important;border-radius:3px;box-shadow:0 0 0 2px #FFC93C}" +
      "body.li-en-cours .li-cliquable{cursor:pointer}" +
      "body.li-en-cours .li-cliquable:hover{outline:2px dashed #E8B84B;outline-offset:3px}" +
      "@media print{.li-barre{display:none!important}.li-bloc,.li-mot-actif{background:none!important;box-shadow:none!important}}";
    document.head.appendChild(css);
  }

  /* ── Voix française ─────────────────────────────────────────────────── */
  function choisirVoix() {
    if (!synth) return;
    var v = synth.getVoices() || [], fr = [], i;
    for (i = 0; i < v.length; i++) if (/^fr(-|_|$)/i.test(v[i].lang)) fr.push(v[i]);
    /* Les voix « réseau » (Google) ne signalent pas les mots prononcés dans
       Chrome : à défaut, le surlignage mot à mot ne pourrait pas suivre. On
       préfère donc une voix installée sur l'appareil quand il y en a une. */
    var locales = fr.filter(function (x) { return x.localService; });
    var choix = locales.length ? locales : fr;
    voixFr = null;
    for (i = 0; i < choix.length; i++) {
      if (!voixFr || /Amelie|Amélie|Thomas|Audrey|Hortense|Denise|Claude|Paul/i.test(choix[i].name)) {
        voixFr = choix[i];
      }
    }
  }

  /* ── Repérage des blocs à lire ──────────────────────────────────────── */
  function texteDe(bloc) {
    var t = "", n, w = parcours(bloc);
    while ((n = w.nextNode())) t += n.nodeValue + " ";
    return t.replace(/\s+/g, " ").trim();
  }
  function parcours(bloc) {
    return document.createTreeWalker(bloc, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        while (p && p !== bloc.parentNode) {
          var tag = (p.tagName || "").toLowerCase();
          if (tag === "script" || tag === "style" || tag === "button" ||
              tag === "input" || tag === "textarea" || tag === "select") return NodeFilter.FILTER_REJECT;
          if (p.nodeType === 1 && p.hasAttribute("data-nolecture")) return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
  }
  function construireBlocs() {
    var racine = document.querySelector(RACINE) || document.body;
    var trouves = [].slice.call(racine.querySelectorAll(SELECTEURS));
    blocs = trouves.filter(function (el) {
      if (el.closest("[data-nolecture]")) return false;
      if (!el.offsetParent && el.offsetHeight === 0) return false;      /* masqué */
      for (var i = 0; i < trouves.length; i++) {                        /* garder le plus fin */
        if (trouves[i] !== el && el.contains(trouves[i])) return false;
      }
      return texteDe(el).length > 1;
    });
    for (var i = 0; i < blocs.length; i++) blocs[i].classList.add("li-cliquable");
  }
  function deplierSections() {
    if (!FERMEES) return;
    var f = document.querySelectorAll(FERMEES);
    for (var i = 0; i < f.length; i++) f[i].classList.remove(CL_FERMEE);
  }

  /* ── Découpage en mots (uniquement le bloc lu, puis on recolle) ─────── */
  function decouper(bloc) {
    var noeuds = [], n, w = parcours(bloc);
    while ((n = w.nextNode())) noeuds.push(n);
    var mots = [];
    noeuds.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var sp = document.createElement("span");
        sp.className = "li-mot";
        sp.textContent = part;
        frag.appendChild(sp);
        mots.push(sp);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return mots;
  }
  function recoller(bloc) {
    if (!bloc) return;
    var sp = bloc.querySelectorAll("span.li-mot");
    for (var i = 0; i < sp.length; i++) {
      sp[i].parentNode.replaceChild(document.createTextNode(sp[i].textContent), sp[i]);
    }
    bloc.normalize();
  }

  /* ── Surlignage du mot prononcé ─────────────────────────────────────── */
  function surlignerMot(k) {
    if (k < 0 || k >= motsCourants.length) return;
    if (motActif === motsCourants[k]) return;
    if (motActif) motActif.classList.remove("li-mot-actif");
    motActif = motsCourants[k];
    motActif.classList.add("li-mot-actif");
  }

  /* Tous les navigateurs ne signalent pas les mots prononcés : Safari/iPad et
     les voix réseau de Chrome restent muets là-dessus. On estime alors la
     durée de chaque mot pour que le surlignage suive quand même ; dès qu'un
     vrai signal arrive, la minuterie s'efface au profit du navigateur. */
  function planifier(rate) {
    var cps = 13.5 * (parseFloat(rate) || 1), t = 0;
    plan = motsCourants.map(function (sp) {
      var mot = sp.textContent;
      t += (mot.length + 1) / cps * 1000;
      if (/[.!?:;]$/.test(mot)) t += 320;                 /* respiration de fin de phrase */
      else if (/[,)»]$/.test(mot)) t += 150;
      return t;
    });
  }
  function lancerMinuterie() {
    arreterMinuterie();
    tDebut = Date.now(); pauseCumul = 0; pauseDebut = 0;
    minuterie = setInterval(function () {
      if (boundaryVu) { arreterMinuterie(); return; }     /* le navigateur suit déjà */
      if (!enLecture || enPause || !plan.length) return;
      var ecoule = Date.now() - tDebut - pauseCumul;
      for (var k = 0; k < plan.length; k++) {
        if (ecoule < plan[k]) { surlignerMot(k); return; }
      }
      surlignerMot(plan.length - 1);
    }, 60);
  }
  function arreterMinuterie() {
    if (minuterie) { clearInterval(minuterie); minuterie = null; }
  }

  /* ── Lecture ────────────────────────────────────────────────────────── */
  function nettoyerBloc() {
    arreterMinuterie();
    if (index >= 0 && blocs[index]) {
      blocs[index].classList.remove("li-bloc");
      recoller(blocs[index]);
    }
    motsCourants = []; bornes = []; plan = []; motActif = null;
  }
  function lireBloc(i) {
    nettoyerBloc();
    index = i;
    if (index >= blocs.length) { stop(true); return; }
    var bloc = blocs[index];
    bloc.classList.add("li-bloc");
    try { bloc.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) { bloc.scrollIntoView(); }

    motsCourants = decouper(bloc);
    var texte = "", pos = 0;
    bornes = motsCourants.map(function (sp) {
      var mot = sp.textContent;
      var d = pos;
      texte += (texte ? " " : "") + mot;
      pos = texte.length;
      return { debut: texte.length - mot.length, fin: texte.length, sp: sp };
    });
    if (!texte) { lireBloc(index + 1); return; }

    var u = new SpeechSynthesisUtterance(texte);
    u.lang = "fr-FR";
    u.rate = parseFloat(vitesse());
    /* Une voix refusée par le navigateur ne doit pas interrompre la lecture :
       sans voix explicite, la voix par défaut du système prend le relais. */
    try { if (voixFr) u.voice = voixFr; } catch (e) { voixFr = null; }
    u.onboundary = function (e) {
      if (e.name && e.name !== "word") return;
      boundaryVu = true;
      arreterMinuterie();
      var ci = e.charIndex || 0;
      for (var k = 0; k < bornes.length; k++) {
        if (ci >= bornes[k].debut && ci < bornes[k].fin) { surlignerMot(k); return; }
      }
    };
    u.onend = function () { if (enLecture && !enPause) lireBloc(index + 1); };
    u.onerror = function () { if (enLecture && !enPause) lireBloc(index + 1); };
    /* La minuterie démarre tout de suite puis se recale sur le début réel de
       la voix, le temps de latence variant d'un appareil à l'autre. */
    planifier(u.rate);
    u.onstart = function () { if (!boundaryVu) tDebut = Date.now(); };
    synth.speak(u);
    if (!boundaryVu) lancerMinuterie();
  }
  function vitesse() {
    var v = null;
    try { v = localStorage.getItem(CLE_VITESSE); } catch (e) {}
    return v || cfg.vitesse || "1";
  }

  function demarrer(depuis) {
    if (!synth) { alert("La lecture à voix haute n'est pas disponible dans ce navigateur."); return; }
    stop(true);
    deplierSections();
    construireBlocs();
    if (!blocs.length) return;
    enLecture = true; enPause = false; boundaryVu = false;
    document.body.classList.add("li-en-cours");
    majBarre();
    tickReprise = setInterval(function () {          /* Chrome coupe au bout de ~15 s */
      if (enLecture && !enPause && synth.speaking) { synth.pause(); synth.resume(); }
    }, 9000);
    var depart = 0;
    if (depuis) { var k = blocs.indexOf(depuis); if (k >= 0) depart = k; }
    lireBloc(depart);
  }
  function pause() {
    if (!enLecture) return;
    if (enPause) {
      enPause = false;
      if (pauseDebut) { pauseCumul += Date.now() - pauseDebut; pauseDebut = 0; }
      synth.resume();
    } else {
      enPause = true; pauseDebut = Date.now(); synth.pause();
    }
    majBarre();
  }
  function stop(silencieux) {
    if (synth) synth.cancel();
    if (tickReprise) { clearInterval(tickReprise); tickReprise = null; }
    arreterMinuterie();
    nettoyerBloc();
    index = -1; enLecture = false; enPause = false;
    document.body.classList.remove("li-en-cours");
    var c = document.querySelectorAll(".li-cliquable");
    for (var i = 0; i < c.length; i++) c[i].classList.remove("li-cliquable");
    if (!silencieux) majBarre();
    else majBarre();
  }

  /* ── Barre de commande ──────────────────────────────────────────────── */
  var elBtn, elPause, elStop, elVit, elBarre;
  function majBarre() {
    if (!elBtn) return;
    elBtn.classList.toggle("li-on", enLecture);
    elBtn.innerHTML = enLecture ? "&#x1F50A; Lecture en cours" : "&#x1F50A; Lecture immersive";
    elPause.hidden = !enLecture;
    elStop.hidden = !enLecture;
    elVit.hidden = !enLecture;
    elPause.innerHTML = enPause ? "&#x25B6;&#xFE0F; Reprendre" : "&#x23F8;&#xFE0F; Pause";
  }
  function construireBarre() {
    elBarre = document.createElement("span");
    elBarre.className = "li-barre";
    elBarre.setAttribute("data-nolecture", "");

    elBtn = document.createElement("button");
    elBtn.type = "button"; elBtn.className = "li-btn";
    elBtn.title = "Lit la page à voix haute en surlignant le texte";
    elBtn.onclick = function () { enLecture ? stop() : demarrer(); };

    elPause = document.createElement("button");
    elPause.type = "button"; elPause.className = "li-btn"; elPause.hidden = true;
    elPause.onclick = pause;

    elStop = document.createElement("button");
    elStop.type = "button"; elStop.className = "li-btn"; elStop.hidden = true;
    elStop.innerHTML = "&#x23F9;&#xFE0F; Arrêter";
    elStop.onclick = function () { stop(); };

    elVit = document.createElement("select");
    elVit.className = "li-sel"; elVit.hidden = true;
    elVit.title = "Vitesse de lecture";
    [["0.7", "Lent"], ["0.85", "Posé"], ["1", "Normal"], ["1.15", "Rapide"]].forEach(function (o) {
      var op = document.createElement("option");
      op.value = o[0]; op.textContent = o[1];
      if (o[0] === String(vitesse())) op.selected = true;
      elVit.appendChild(op);
    });
    elVit.onchange = function () {
      try { localStorage.setItem(CLE_VITESSE, elVit.value); } catch (e) {}
      if (enLecture) { var i = index; synth.cancel(); lireBloc(i); }   /* relit le passage en cours */
    };

    elBarre.appendChild(elBtn); elBarre.appendChild(elPause);
    elBarre.appendChild(elStop); elBarre.appendChild(elVit);

    var hote = document.querySelector(HOTE);
    if (hote) hote.appendChild(elBarre);
    else {
      elBarre.style.cssText = "position:fixed;left:14px;bottom:70px;z-index:70;background:#fff;" +
        "border:1px solid #E2E8F0;border-radius:10px;padding:7px 10px;box-shadow:0 4px 16px rgba(0,0,0,.14)";
      document.body.appendChild(elBarre);
    }
    majBarre();
  }

  /* ── Départ ─────────────────────────────────────────────────────────── */
  function init() {
    if (!synth) return;                       /* navigateur sans synthèse vocale */
    injecterStyles();
    construireBarre();
    choisirVoix();
    if (typeof synth.onvoiceschanged !== "undefined") synth.onvoiceschanged = choisirVoix;

    /* En lecture, cliquer un paragraphe reprend à cet endroit. */
    document.addEventListener("click", function (ev) {
      if (!enLecture) return;
      var cible = ev.target.closest(".li-cliquable");
      if (!cible || elBarre.contains(ev.target)) return;
      var tag = (ev.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || tag === "button" || tag === "a") return;
      synth.cancel();
      enPause = false;
      lireBloc(blocs.indexOf(cible));
      majBarre();
    });
    window.addEventListener("beforeunload", function () { if (synth) synth.cancel(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.LectureImmersive = {
    demarrer: demarrer, pause: pause, stop: stop,
    actif: function () { return enLecture; },
    motParMot: function () { return boundaryVu; }
  };
})();
