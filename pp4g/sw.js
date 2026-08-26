/*
 * Service worker « Cockpit PP » — stale-while-revalidate, scope isolé à pp4g/.
 * Enregistré depuis pp4g/index.html avec register("sw.js") -> scope par défaut = pp4g/
 * (aucun autre dossier du site n'est concerné : blast radius nul sur le reste du dépôt).
 *
 * Règle absolue : ne JAMAIS intercepter/mettre en cache les appels vers Apps Script ou
 * Google (Hub, PSC1, Carnet, Sheets) — ce sont des données vivantes, jamais figées.
 * Le garde-fou est le test d'origine + scope ci-dessous.
 *
 * CACHE_VERSION : à incrémenter à chaque lot de fichiers ajoutés/modifiés sous pp4g/
 * (N1 = v1 ; N2 ajoutera l'écran données -> v2 ; etc.) pour forcer le renouvellement du cache.
 */
const CACHE_VERSION = "pp4g-v27";

const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./donnees.html",
  "./cockpit.css",
  "./outils/plan-de-classe.html",
  "./outils/equipes-menage.html",
  "./outils/trombinoscope.html",
  "./outils/retenue.html",
  "./outils/cr-reunion.html",
  "./outils/js/donnees.js",
  "./js/verrou.js",
  "./js/icones.js",
  "./js/xlsx-leger.js",
  "./fonts/B612-Regular.ttf",
  "./fonts/B612-Bold.ttf",
  "./icons/logo-source.svg",
  "./icons/favicon-48.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE))
    // Pas de self.skipWaiting() ici : on laisse la nouvelle version "en attente" et on
    // prévient l'utilisateur (bannière côté index.html) avant de basculer — voir le
    // gestionnaire de message "skipWaiting" plus bas.
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(noms.filter((n) => n !== CACHE_VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Garde-fou : uniquement les requêtes dans le scope pp4g/ de ce service worker.
  // Laisse passer nativement tout le reste (Apps Script, Google Sheets, autres pages du site).
  if (!req.url.startsWith(self.registration.scope)) return;

  event.respondWith(
    caches.match(req).then((repCache) => {
      const repReseau = fetch(req).then((rep) => {
        if (rep && rep.status === 200) {
          const copie = rep.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copie));
        }
        return rep;
      }).catch(() => repCache);
      return repCache || repReseau;
    })
  );
});
