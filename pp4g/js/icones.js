/*
 * Jeu d'icônes Cockpit PP — SVG au trait, dessinées maison, style « instrument » cohérent
 * avec le logo horizon (trait fin, bouts arrondis). Auto-hébergé : aucune police d'icônes ni
 * CDN — l'app doit rester utilisable hors-ligne. Source UNIQUE partagée mobile (pp4g/) + PC
 * (Prof Principal 4e/, via ../pp4g/js/icones.js).
 *
 * Usage : <i class="ico" data-ico="trombinoscope"></i>
 *   L'icône hérite de la couleur (currentColor) et de la taille (1em) de son parent.
 *   L'injection se fait au chargement ; appeler PP4G_ICONES.injecter(racine) après un rendu
 *   dynamique pour traiter les <i data-ico> ajoutés ensuite.
 */
window.PP4G_ICONES = (function () {
  "use strict";

  // viewBox 0 0 24 24, trait 1.7, bouts/angles arrondis. Fond transparent.
  var D = {
    donnees: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.66 3.13 3 7 3s7-1.34 7-3V6"/><path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3"/>',
    trombinoscope: '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
    plan: '<path d="M4 5h16"/><rect x="4" y="9" width="4" height="3.4" rx="1"/><rect x="10" y="9" width="4" height="3.4" rx="1"/><rect x="16" y="9" width="4" height="3.4" rx="1"/><rect x="4" y="15" width="4" height="3.4" rx="1"/><rect x="10" y="15" width="4" height="3.4" rx="1"/><rect x="16" y="15" width="4" height="3.4" rx="1"/>',
    menage: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5V8h-3.5"/>',
    hub: '<path d="M12 21v-7"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><path d="M8.6 8.6a5 5 0 0 0 0 6.8"/><path d="M15.4 8.6a5 5 0 0 1 0 6.8"/><path d="M6 6a9 9 0 0 0 0 12"/><path d="M18 6a9 9 0 0 1 0 12"/>',
    psc1: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M12 9v6M9 12h6"/>',
    carnet: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 4v16"/><path d="M12 9h4M12 13h4"/>',
    retenues: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M4 14.5h16M10 5v14"/>',
    suivi: '<path d="M4 15a8 8 0 0 1 16 0"/><path d="M12 15l4-3"/><circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none"/>',
    hvc: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5l2 4.5-2 4.5-2-4.5z"/><circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none"/>',
    claude: '<rect x="5" y="8" width="14" height="11" rx="3.2"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1.3" fill="currentColor" stroke="none"/><circle cx="9.6" cy="13.2" r="1.2" fill="currentColor" stroke="none"/><circle cx="14.4" cy="13.2" r="1.2" fill="currentColor" stroke="none"/>',
    verrou: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    eleves: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.6a3 3 0 0 1 0 5.8"/><path d="M17.2 13.4a5.5 5.5 0 0 1 3.3 5.6"/>',
    drive: '<path d="M7.5 18a4 4 0 0 1-.4-8 5.2 5.2 0 0 1 10-1.2A3.6 3.6 0 0 1 16.5 18z"/><path d="M10.5 15v-1a1.5 1.5 0 0 1 3 0v1"/><rect x="9.7" y="15" width="4.6" height="3.4" rx="0.8"/>',
    diaporama: '<rect x="3.5" y="5" width="17" height="11" rx="2"/><path d="M9.5 20h5M12 16v4"/><path d="M10.5 8.5l4 2.5-4 2.5z" fill="currentColor" stroke="none"/>',
    cartes: '<rect x="8" y="4.5" width="11" height="13" rx="2"/><rect x="5" y="7.5" width="11" height="13" rx="2"/>',
    seance: '<rect x="4" y="4" width="16" height="13" rx="2"/><path d="M8 20h8M12 17v3M8 9h8M8 12.5h5"/>'
  };

  function svg(nom) {
    var d = D[nom];
    if (!d) return "";
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" width="1em" height="1em" aria-hidden="true">' + d + '</svg>';
  }

  function injecter(racine) {
    (racine || document).querySelectorAll("i.ico[data-ico]").forEach(function (el) {
      if (el.dataset.injecte) return;
      var html = svg(el.dataset.ico);
      if (html) { el.innerHTML = html; el.dataset.injecte = "1"; }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { injecter(); });
  else injecter();

  return { injecter: injecter, svg: svg, noms: Object.keys(D) };
})();
