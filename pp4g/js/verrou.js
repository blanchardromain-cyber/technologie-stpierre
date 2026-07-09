/*
 * Verrou PIN local optionnel (plan §3.5). Ce n'est PAS du chiffrement : la vraie protection
 * reste le verrouillage du téléphone lui-même — ce verrou dissuade juste un accès rapide si
 * le téléphone est déverrouillé et prêté. Le PIN n'est jamais stocké en clair (haché SHA-256,
 * WebCrypto natif, zéro dépendance).
 *
 * Inclus sur TOUTES les pages pp4g (index.html, donnees.html, outils/*.html), après
 * outils/js/donnees.js dont il utilise PP4G.config pour lire/écrire le hash.
 *
 * Comportement : si aucun PIN n'est configuré (PP4G.config "pinHash" absent), ce script ne
 * fait rien (verrou = fonctionnalité opt-in). Sinon, un écran de verrouillage bloque la page
 * tant que le bon code n'est pas saisi. La fenêtre de déverrouillage glisse avec l'activité
 * (sessionStorage, 5 min) : navigation rapide entre pages pp4g = pas de re-demande ; app en
 * arrière-plan plus de 5 min OU application fermée puis rouverte = code redemandé.
 */
(function () {
  "use strict";
  var DELAI_RELOCK_MS = 5 * 60 * 1000;
  var CLE_ACTIVITE = "pp4g-verrou-activite";

  function hacher(pin) {
    var data = new TextEncoder().encode(pin);
    return crypto.subtle.digest("SHA-256", data).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    });
  }

  function marquerActif() { sessionStorage.setItem(CLE_ACTIVITE, String(Date.now())); }

  function sessionValide() {
    var t = +sessionStorage.getItem(CLE_ACTIVITE);
    return t && (Date.now() - t) < DELAI_RELOCK_MS;
  }

  function creerOverlay(hashAttendu) {
    if (document.getElementById("verrouOverlay")) return;
    var div = document.createElement("div");
    div.id = "verrouOverlay";
    div.style.cssText = "position:fixed;inset:0;background:#0f1f3d;color:#f5f1e8;z-index:99999;" +
      "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;" +
      "font-family:'Segoe UI',Arial,sans-serif;padding:20px;text-align:center";
    div.innerHTML =
      '<img src="' + (location.pathname.indexOf("/outils/") >= 0 ? "../" : "") + 'icons/logo-source.svg" style="width:56px;height:56px" alt="">' +
      '<div>Code de verrouillage</div>' +
      '<input id="verrouPin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" ' +
      'style="font-family:\'B612\',monospace;font-size:1.3rem;padding:8px 12px;border-radius:8px;border:none;width:140px;text-align:center;letter-spacing:4px">' +
      '<button id="verrouValider" style="font-size:.9rem;padding:10px 18px;min-height:44px;border:none;border-radius:8px;background:#e8763a;color:#fff;font-weight:600">Valider</button>' +
      '<div id="verrouErreur" style="color:#f2a5a5;font-size:.82rem;min-height:1.2em"></div>';
    document.body.appendChild(div);
    var input = div.querySelector("#verrouPin"), erreur = div.querySelector("#verrouErreur");
    function tenter() {
      hacher(input.value).then(function (h) {
        if (h === hashAttendu) { marquerActif(); div.remove(); }
        else { erreur.textContent = "Code incorrect."; input.value = ""; input.focus(); }
      });
    }
    div.querySelector("#verrouValider").onclick = tenter;
    input.onkeydown = function (ev) { if (ev.key === "Enter") tenter(); };
    setTimeout(function () { input.focus(); }, 50);
  }

  function verifier() {
    if (!window.PP4G || !window.PP4G.config) return; // donnees.js pas chargé sur cette page
    window.PP4G.config.lire("pinHash").then(function (hash) {
      if (!hash) return; // pas de PIN configuré : verrou désactivé
      if (sessionValide()) { marquerActif(); return; } // fenêtre glissante rafraîchie
      creerOverlay(hash);
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") verifier();
  });

  function demarrer() { window.PP4G.ready().then(verifier); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();
})();
