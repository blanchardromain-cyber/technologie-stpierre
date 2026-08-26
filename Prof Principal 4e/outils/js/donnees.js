/*
 * Couche données partagée des outils locaux 🟥 (plan de classe, ménage, trombinoscope).
 * Étape N0 du PLAN-APP-NOMADE.md — « refactor couche données ».
 *
 * Rôle : décider D'OÙ viennent les données élèves/photos, une seule fois, pour les 3 outils.
 *   - Sur PC (file://) : les scripts ../donnees/classes.js et ../donnees/eleves-4G.js
 *     ont déjà rempli window.CLASSES / window.DONNEES_4G  →  on les utilise tels quels.
 *   - Sur mobile / PWA (GitHub Pages) : le dossier donnees/ n'existe pas (gitignoré, jamais
 *     déployé). On lit alors la base IndexedDB « pp4g » (remplie par l'import — étape N2) et
 *     on expose son contenu VIA LES MÊMES globales window.CLASSES / window.DONNEES_4G, plus
 *     PP4G.photoUrl() pour les photos (blob URLs). Les outils n'ont donc pas à savoir d'où
 *     vient la donnée : ils continuent de lire window.CLASSES / window.DONNEES_4G comme avant.
 *
 * Contrat pour les outils :
 *   PP4G.ready()               -> Promise résolue quand la source est prête (globales peuplées).
 *                                 À attendre AVANT de lire window.CLASSES / window.DONNEES_4G.
 *   PP4G.photoUrl(nom, prenom) -> URL de la photo (chemin ../donnees/photos/... sur PC,
 *                                 blob URL en mode IndexedDB, "" si absente).
 *   PP4G.source                -> "globals" ou "idb" (connu après ready()).
 *
 * Contrat d'écriture (étape N2, écran ⚙️ Données) : donnees.js est le point d'ouverture unique
 *   de la base IndexedDB « pp4g » (magasins « eleves » keyPath "classe", « photos » clé
 *   "NOM Prénom", « config », « meta ») — toute lecture/écriture passe par les fonctions PP4G
 *   ci-dessous pour éviter que le schéma ne diverge entre les pages qui l'utilisent :
 *   PP4G.importerClasse({classe, annee, eleves, ...}) -> Promise
 *   PP4G.importerPhoto(cle, blob)                     -> Promise   (cle = "NOM Prénom")
 *   PP4G.listerClasses()                              -> Promise<[{classe,annee,eleves}]>
 *   PP4G.supprimerClasses(noms)                       -> Promise<nb>  (nom ou tableau de noms)
 *   PP4G.exporterTout(avecPhotos)                     -> Promise<{classes, photos?}>
 *   PP4G.effacerTout()                                -> Promise  (vide les 4 magasins)
 *   PP4G.meta.lire(cle) / PP4G.meta.ecrire(cle, val)  -> Promise
 *   PP4G.config.lire(cle) / PP4G.config.ecrire(cle, val) -> Promise  (verrou PIN — voir js/verrou.js)
 *
 * IMPORTANT : ce fichier existe en 2 copies identiques (Prof Principal 4e/outils/js/donnees.js
 * pour le PC, pp4g/outils/js/donnees.js pour la PWA) — toute modification doit être répercutée
 * sur les deux (cf. PLAN-APP-NOMADE.md §7/N0). La copie PC n'utilise que ready()/photoUrl() en
 * pratique (mode "globals"), les fonctions d'écriture y restent dormantes.
 *
 * Aucune donnée nominative dans ce fichier : il est versionné (public). Les données réelles
 * vivent soit dans donnees/ (PC, gitignoré) soit dans IndexedDB (téléphone) — jamais ici.
 */
window.PP4G = (function () {
  "use strict";

  var DB_NAME = "pp4g", DB_VERSION = 1;
  var source = null;                 // "globals" | "idb", connu après ready()
  var photoBlobUrls = {};            // "NOM Prénom" -> blob URL (mode idb uniquement)
  var readyPromise = null;

  function ouvrirBase() {
    return new Promise(function (resolve) {
      if (!("indexedDB" in window) || !window.indexedDB) { resolve(null); return; }
      var req;
      try { req = indexedDB.open(DB_NAME, DB_VERSION); }
      catch (e) { resolve(null); return; }
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains("eleves")) db.createObjectStore("eleves", { keyPath: "classe" });
        if (!db.objectStoreNames.contains("photos")) db.createObjectStore("photos");
        if (!db.objectStoreNames.contains("config")) db.createObjectStore("config");
        if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { resolve(null); };
      req.onblocked = function () { resolve(null); };
    });
  }

  // Lit tout un magasin. Retourne [{key, value}] pour préserver les clés (photos).
  function lireTout(db, magasin) {
    return new Promise(function (resolve) {
      var out = [];
      var tx;
      try { tx = db.transaction(magasin, "readonly"); }
      catch (e) { resolve(out); return; }
      var store = tx.objectStore(magasin);
      var req = store.openCursor();
      req.onsuccess = function () {
        var cur = req.result;
        if (cur) { out.push({ key: cur.key, value: cur.value }); cur.continue(); }
        else resolve(out);
      };
      req.onerror = function () { resolve(out); };
    });
  }

  function chargerDepuisIdb() {
    return ouvrirBase().then(function (db) {
      if (!db) return;
      return lireTout(db, "eleves")
        .then(function (rangs) {
          // magasin « eleves » keyPath "classe" → value = {classe, annee, eleves}
          var classes = rangs.map(function (r) { return r.value; }).filter(Boolean);
          if (classes.length) {
            window.CLASSES = {};
            classes.forEach(function (c) { if (c && c.classe) window.CLASSES[c.classe] = c; });
            window.DONNEES_4G = window.CLASSES["4G"] || classes[0];
          }
          return lireTout(db, "photos");
        })
        .then(function (photos) {
          (photos || []).forEach(function (p) {
            if (p.value instanceof Blob) photoBlobUrls[p.key] = URL.createObjectURL(p.value);
          });
        });
    });
  }

  function ready() {
    if (readyPromise) return readyPromise;
    readyPromise = new Promise(function (resolve) {
      // PC : les data-scripts ont déjà peuplé les globales → rien à faire.
      if (window.CLASSES || window.DONNEES_4G) { source = "globals"; resolve(); return; }
      // PWA/mobile : lire IndexedDB (vide tant que l'import N2 n'a pas eu lieu).
      source = "idb";
      chargerDepuisIdb().then(resolve, resolve);
    });
    return readyPromise;
  }

  var EXTENSIONS_PHOTO = ["jpg", "jpeg", "JPG", "JPEG", "png", "PNG"];

  function photoUrl(nom, prenom) {
    var cle = nom + " " + prenom;
    if (source === "idb") {
      if (photoBlobUrls[cle]) return photoBlobUrls[cle];
      // Repli insensible à la casse/espaces : rattrape un fichier importé "Dupont Jean.jpg"
      // alors que la fiche élève attend "DUPONT Jean" (nom toujours en majuscules côté données).
      var norm = cle.trim().toLowerCase();
      for (var k in photoBlobUrls) {
        if (k.trim().toLowerCase() === norm) return photoBlobUrls[k];
      }
      return "";
    }
    // Mode PC : chemin identique à celui qu'utilisaient les outils historiquement.
    // essayerExtension() tente ensuite jpeg/png si le .jpg initial est introuvable (onerror).
    return "../donnees/photos/" + encodeURIComponent(cle) + "." + EXTENSIONS_PHOTO[0];
  }

  // Repli d'extension pour le mode PC (chemin fichier) : appelé depuis le onerror d'un <img>
  // dont le src vient de photoUrl(). Retourne true si un nouvel essai vient d'être lancé (un
  // autre événement onerror suivra), false si toutes les extensions ont été tentées (repli
  // final à la charge de l'appelant). Sans effet en mode idb (URL blob, rien à deviner).
  function essayerExtension(img) {
    if (source === "idb") return false;
    var i = +(img.getAttribute("data-photo-i") || 0) + 1;
    if (i >= EXTENSIONS_PHOTO.length) return false;
    var base = img.getAttribute("data-photo-base");
    if (base === null) {
      base = img.src.replace(/\.[A-Za-z0-9]+$/, "");
      img.setAttribute("data-photo-base", base);
    }
    img.setAttribute("data-photo-i", i);
    img.src = base + "." + EXTENSIONS_PHOTO[i];
    return true;
  }

  // ---------- écriture (étape N2 : import/export) ----------

  function ecrire(magasin, valeur, cle) {
    return ouvrirBase().then(function (db) {
      if (!db) throw new Error("IndexedDB indisponible sur ce navigateur.");
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(magasin, "readwrite");
        var req = cle === undefined ? tx.objectStore(magasin).put(valeur) : tx.objectStore(magasin).put(valeur, cle);
        req.onsuccess = function () { resolve(); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function importerClasse(donnees) {
    if (!donnees || !donnees.classe || !Array.isArray(donnees.eleves)) {
      return Promise.reject(new Error("Format invalide : champs 'classe' et 'eleves' requis."));
    }
    return ecrire("eleves", donnees);
  }

  function importerPhoto(cle, blob) {
    return ecrire("photos", blob, cle);
  }

  // Supprime une ou plusieurs classes du magasin « eleves » (les photos, clés « NOM Prénom »,
  // ne sont pas liées à une classe : elles restent, et seront écrasées au prochain import).
  function supprimerClasses(noms) {
    var liste = Array.isArray(noms) ? noms : [noms];
    if (!liste.length) return Promise.resolve(0);
    return ouvrirBase().then(function (db) {
      if (!db) throw new Error("IndexedDB indisponible sur ce navigateur.");
      return new Promise(function (resolve, reject) {
        var tx = db.transaction("eleves", "readwrite");
        var store = tx.objectStore("eleves");
        liste.forEach(function (n) { store.delete(n); });
        tx.oncomplete = function () { resolve(liste.length); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function listerClasses() {
    return ouvrirBase().then(function (db) {
      if (!db) return [];
      return lireTout(db, "eleves").then(function (rangs) { return rangs.map(function (r) { return r.value; }); });
    });
  }

  function blobEnBase64(blob) {
    return new Promise(function (resolve, reject) {
      var lecteur = new FileReader();
      lecteur.onload = function () { resolve(lecteur.result); };
      lecteur.onerror = function () { reject(lecteur.error); };
      lecteur.readAsDataURL(blob);
    });
  }

  function exporterTout(avecPhotos) {
    return ouvrirBase().then(function (db) {
      if (!db) return { classes: [] };
      return lireTout(db, "eleves").then(function (rangs) {
        var classes = rangs.map(function (r) { return r.value; });
        if (!avecPhotos) return { classes: classes };
        return lireTout(db, "photos").then(function (photos) {
          return Promise.all(photos.map(function (p) {
            return p.value instanceof Blob ? blobEnBase64(p.value).then(function (b64) { return [p.key, b64]; }) : null;
          })).then(function (paires) {
            var photosObj = {};
            paires.forEach(function (p) { if (p) photosObj[p[0]] = p[1]; });
            return { classes: classes, photos: photosObj };
          });
        });
      });
    });
  }

  function effacerTout() {
    return ouvrirBase().then(function (db) {
      if (!db) return;
      var magasins = ["eleves", "photos", "config", "meta"];
      return Promise.all(magasins.map(function (m) {
        return new Promise(function (resolve, reject) {
          var req = db.transaction(m, "readwrite").objectStore(m).clear();
          req.onsuccess = function () { resolve(); };
          req.onerror = function () { reject(req.error); };
        });
      }));
    });
  }

  function magasinCleValeur(magasin) {
    return {
      lire: function (cle) {
        return ouvrirBase().then(function (db) {
          if (!db) return undefined;
          return new Promise(function (resolve) {
            var req = db.transaction(magasin, "readonly").objectStore(magasin).get(cle);
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { resolve(undefined); };
          });
        });
      },
      ecrire: function (cle, valeur) { return ecrire(magasin, valeur, cle); }
    };
  }

  var meta = magasinCleValeur("meta");
  var config = magasinCleValeur("config"); // options d'app : PIN (verrou.js), URLs backends…

  return {
    ready: ready,
    photoUrl: photoUrl,
    essayerExtension: essayerExtension,
    importerClasse: importerClasse,
    importerPhoto: importerPhoto,
    listerClasses: listerClasses,
    supprimerClasses: supprimerClasses,
    exporterTout: exporterTout,
    effacerTout: effacerTout,
    meta: meta,
    config: config,
    get source() { return source; }
  };
})();
