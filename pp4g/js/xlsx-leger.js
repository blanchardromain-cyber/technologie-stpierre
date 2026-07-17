/*
 * Lecteur .xlsx minimal — SANS bibliothèque externe.
 *
 * Pourquoi maison : un .xlsx est simplement une archive ZIP contenant du XML, et le
 * navigateur sait déjà tout faire — DecompressionStream("deflate-raw") pour dézipper,
 * DOMParser pour lire le XML. Embarquer SheetJS (~900 Ko) dans une app qui doit rester
 * utilisable hors-ligne serait disproportionné pour « lire une liste d'élèves ».
 *
 * Portée assumée : lit la PREMIÈRE feuille d'un .xlsx et la rend en texte tabulé, que le
 * parseur existant (analyserListe) consomme comme un CSV. Ne gère PAS l'ancien .xls binaire
 * (format BIFF, sans rapport) : pour un .xls, passer par « Enregistrer sous → .xlsx » ou CSV.
 *
 * Source partagée mobile (pp4g/) + PC (Prof Principal 4e/, via ../../pp4g/js/xlsx-leger.js).
 *
 * API : PP4G_XLSX.texteDuFichier(file) -> Promise<string>
 *         xlsx  → texte tabulé (1 ligne par ligne de la feuille)
 *         autre → contenu texte brut (csv/json inchangés)
 */
window.PP4G_XLSX = (function () {
  "use strict";

  function estXlsx(fichier) {
    return /\.xlsx$/i.test(fichier.name || "");
  }

  async function inflateRaw(octets) {
    if (typeof DecompressionStream === "undefined") {
      throw new Error("ce navigateur ne sait pas décompresser un .xlsx — utilise un CSV.");
    }
    var flux = new Blob([octets]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(flux).arrayBuffer());
  }

  // ---- lecture ZIP (répertoire central + en-têtes locaux) ----
  function ouvrirZip(buffer) {
    var vue = new DataView(buffer), u8 = new Uint8Array(buffer);
    var eocd = -1, minimum = Math.max(0, buffer.byteLength - 22 - 65535);
    for (var i = buffer.byteLength - 22; i >= minimum; i--) {
      if (vue.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error("fichier .xlsx illisible (archive invalide).");
    var nb = vue.getUint16(eocd + 10, true);
    var pos = vue.getUint32(eocd + 16, true);
    var entrees = {};
    for (var n = 0; n < nb; n++) {
      if (vue.getUint32(pos, true) !== 0x02014b50) break;
      var methode = vue.getUint16(pos + 10, true);
      var tailleComp = vue.getUint32(pos + 20, true);
      var lgNom = vue.getUint16(pos + 28, true);
      var lgExtra = vue.getUint16(pos + 30, true);
      var lgComm = vue.getUint16(pos + 32, true);
      var offsetLocal = vue.getUint32(pos + 42, true);
      var nom = new TextDecoder().decode(u8.subarray(pos + 46, pos + 46 + lgNom));
      entrees[nom] = { methode: methode, tailleComp: tailleComp, offsetLocal: offsetLocal };
      pos += 46 + lgNom + lgExtra + lgComm;
    }
    return { entrees: entrees, vue: vue, u8: u8 };
  }

  async function extraire(zip, nom) {
    var e = zip.entrees[nom];
    if (!e) return null;
    // l'en-tête local redonne les longueurs nom/extra : les données commencent après.
    var lgNom = zip.vue.getUint16(e.offsetLocal + 26, true);
    var lgExtra = zip.vue.getUint16(e.offsetLocal + 28, true);
    var debut = e.offsetLocal + 30 + lgNom + lgExtra;
    var donnees = zip.u8.subarray(debut, debut + e.tailleComp);
    var brut = e.methode === 0 ? donnees : await inflateRaw(donnees);
    return new TextDecoder().decode(brut);
  }

  // ---- XLSX -> lignes ----
  function indiceColonne(ref) {           // "B3" -> 1
    var lettres = (ref || "").replace(/[0-9]/g, "");
    if (!lettres) return -1;
    var n = 0;
    for (var i = 0; i < lettres.length; i++) n = n * 26 + (lettres.toUpperCase().charCodeAt(i) - 64);
    return n - 1;
  }

  async function enLignes(buffer) {
    var zip = ouvrirZip(buffer);

    // table des chaînes partagées (la plupart des cellules texte y renvoient par index)
    var chaines = [];
    var xmlChaines = await extraire(zip, "xl/sharedStrings.xml");
    if (xmlChaines) {
      var docC = new DOMParser().parseFromString(xmlChaines, "application/xml");
      Array.prototype.forEach.call(docC.querySelectorAll("si"), function (si) {
        var s = "";
        Array.prototype.forEach.call(si.querySelectorAll("t"), function (t) { s += t.textContent; });
        chaines.push(s);
      });
    }

    var nomFeuille = "xl/worksheets/sheet1.xml";
    if (!zip.entrees[nomFeuille]) {
      nomFeuille = Object.keys(zip.entrees).filter(function (n) { return /^xl\/worksheets\/.+\.xml$/.test(n); }).sort()[0];
      if (!nomFeuille) throw new Error("aucune feuille de calcul trouvée dans le .xlsx.");
    }
    var xml = await extraire(zip, nomFeuille);
    var doc = new DOMParser().parseFromString(xml, "application/xml");

    var lignes = [];
    Array.prototype.forEach.call(doc.querySelectorAll("row"), function (row) {
      var cellules = [];
      Array.prototype.forEach.call(row.querySelectorAll("c"), function (c) {
        var type = c.getAttribute("t"), valeur = "";
        if (type === "inlineStr") {
          var is = c.querySelector("is");
          valeur = is ? is.textContent : "";
        } else {
          var v = c.querySelector("v");
          valeur = v ? v.textContent : "";
          if (type === "s") valeur = chaines[+valeur] || "";
        }
        var idx = indiceColonne(c.getAttribute("r"));
        cellules[idx >= 0 ? idx : cellules.length] = String(valeur).trim();
      });
      lignes.push(cellules);
    });
    return lignes;
  }

  // Texte tabulé : analyserListe détecte déjà la tabulation comme séparateur, et une
  // tabulation n'apparaît jamais dans un nom (contrairement au « ; »).
  function enTexte(lignes) {
    return lignes.map(function (l) {
      return Array.from(l, function (c) { return c == null ? "" : String(c).replace(/\t/g, " "); }).join("\t");
    }).join("\n");
  }

  async function texteDuFichier(fichier) {
    if (!estXlsx(fichier)) return fichier.text();
    var lignes = await enLignes(await fichier.arrayBuffer());
    if (!lignes.length) throw new Error("le .xlsx semble vide.");
    return enTexte(lignes);
  }

  return { estXlsx: estXlsx, enLignes: enLignes, enTexte: enTexte, texteDuFichier: texteDuFichier };
})();
