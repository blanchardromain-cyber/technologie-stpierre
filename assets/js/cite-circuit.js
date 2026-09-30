/* ==========================================================================
   Accueil — piste B « Cité-circuit » (relooking, voir assets/js/accueil-b.js)
   Survol sans fin d'une ville-circuit imprimé : puces-immeubles, pistes où
   circulent des impulsions de lumière, quartiers portant le nom des séquences
   (DOSSIERS_SEQ). Chargé par accueil-b.js seulement si la machine sait l'afficher ;
   three.js arrive par import() (importmap d'index.html). S'arrête hors de la
   connexion et du tableau de bord.
   ========================================================================== */
(async function () {
const [THREE, { RoomEnvironment }, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { ShaderPass }, { OutputPass }] = await Promise.all([
  import("three"),
  import("three/addons/environments/RoomEnvironment.js"),
  import("three/addons/postprocessing/EffectComposer.js"),
  import("three/addons/postprocessing/RenderPass.js"),
  import("three/addons/postprocessing/UnrealBloomPass.js"),
  import("three/addons/postprocessing/ShaderPass.js"),
  import("three/addons/postprocessing/OutputPass.js")
]);

const LABO = window.ACCUEIL_B;
const canvas = document.getElementById("b-scene");
const mobile = matchMedia("(pointer: coarse)").matches || innerWidth < 820;
let dpr = Math.min(devicePixelRatio, 1.5);

const FOND = new THREE.Color("#030814"), BRUME = new THREE.Color("#071A33");
const DENS = 0.042;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", stencil: false });
renderer.setPixelRatio(dpr);
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = FOND;
scene.fog = new THREE.FogExp2(BRUME, DENS);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35;
pmrem.dispose();

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 160);
camera.position.set(0, 3, 8);

const cle = new THREE.DirectionalLight("#9CC8FF", 1.1);
cle.position.set(-6, 10, 4);
scene.add(cle, new THREE.HemisphereLight("#2A4F80", "#02060D", 0.6));

/* ---------- Ville : une tuile de L × W, répétée trois fois le long du trajet ---------- */
const L = 48, W = mobile ? 40 : 64, C = 2.4;
const ville = new THREE.Group();
scene.add(ville);
const COPIES = [-L, 0, L];
const hasard = (a, b) => a + Math.random() * (b - a);
const PALETTE = ["#00C6FF", "#7B61FF", "#00E5A8", "#FFB547", "#FF6FD8"].map((c) => new THREE.Color(c));

/* Repères : un quartier par séquence (tours plus hautes, faisceau, étiquette) */
/* près de l'avenue : les étiquettes passent entre le texte d'accroche et la carte de connexion */
const REPERES = [
  { seq: 2, x: -4.8, z: -7.2, t: "Réseau informatique" },
  { seq: 11, x: 4.8, z: -14.4, t: "L’eau, ressource essentielle" },
  { seq: 1, x: -4.8, z: -21.6, t: "Aménagement d’un bâtiment" },
  { seq: 12, x: 4.8, z: -28.8, t: "Technologie & Alimentation" },
  { seq: 13, x: -4.8, z: -36, t: "Biomimétisme" },
  { seq: 3, x: 4.8, z: -43.2, t: "Réseau avec Filius" }
];
/* Nom, icône et couleur de chaque séquence : ceux du tableau de bord */
const D = {};
Object.keys(window.DOSSIERS_SEQ || {}).forEach((niv) => Object.keys(DOSSIERS_SEQ[niv]).forEach((n) => { D[n] = DOSSIERS_SEQ[niv][n]; }));
REPERES.forEach((r) => { if (!D[r.seq]) D[r.seq] = { titre: "P" + r.seq, icone: "", couleur: "#00C6FF" }; });

const puces = [], chapeaux = [], pistes = [];
const cols = Math.floor(W / C), rangs = Math.floor(L / C);
const occupe = new Set();
REPERES.forEach((r) => { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) occupe.add((Math.round(r.x / C) + a) + ":" + (Math.round(-r.z / C) + b)); });
for (let i = 0; i < cols; i++) {
  for (let j = 0; j < rangs; j++) {
    const x = -W / 2 + (i + 0.5) * C, z = -(j + 0.5) * C;
    if (Math.abs(x) < 2.6) continue;                         /* l'avenue centrale reste libre */
    if (occupe.has(Math.round(x / C) + ":" + j)) continue;
    if (Math.random() > 0.58) continue;
    const r = Math.random();
    const h = r < 0.7 ? hasard(0.08, 0.3) : r < 0.95 ? hasard(0.3, 1.2) : hasard(1.4, 3.0);
    const w = hasard(0.8, 1.9), d = hasard(0.8, 1.9);
    puces.push({ x, z, w, d, h });
    if (Math.random() < 0.32) chapeaux.push({ x, z, w: w * 0.62, d: d * 0.62, y: h + 0.012, c: PALETTE[(Math.random() * PALETTE.length) | 0], k: hasard(0.8, 2.2) });
  }
}
REPERES.forEach((r) => {
  const c = new THREE.Color(D[r.seq].couleur);
  puces.push({ x: r.x, z: r.z, w: 1.8, d: 1.8, h: hasard(3.2, 4.4) });
  chapeaux.push({ x: r.x, z: r.z, w: 1.3, d: 1.3, y: puces[puces.length - 1].h + 0.012, c, k: 3 });
  r.h = puces[puces.length - 1].h; r.c = c;
});
/* Pistes : le long des rues, plus un « bus » de données dans l'avenue */
for (let j = 0; j <= rangs; j++) {
  if (Math.random() < 0.55) { const n = 2 + ((Math.random() * 6) | 0), i0 = (Math.random() * (cols - n)) | 0; pistes.push({ x: -W / 2 + (i0 + n / 2) * C, z: -j * C, len: n * C, rot: 0, v: hasard(2, 5) * (Math.random() < 0.5 ? -1 : 1) }); }
}
for (let i = 0; i <= cols; i++) {
  const x = -W / 2 + i * C;
  if (Math.abs(x) < 2.6) continue;
  if (Math.random() < 0.6) { const n = 3 + ((Math.random() * 10) | 0), j0 = (Math.random() * (rangs - n)) | 0; pistes.push({ x, z: -(j0 + n / 2) * C, len: n * C, rot: -Math.PI / 2, v: hasard(2.5, 6) }); }
}
for (let k = -3; k <= 3; k++) pistes.push({ x: k * 0.32, z: -L / 2, len: L, rot: -Math.PI / 2, v: hasard(5, 9), bus: true });

const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v3 = new THREE.Vector3(), sc = new THREE.Vector3(), yAxe = new THREE.Vector3(0, 1, 0);
function instancier(geo, mat, liste, poser) {
  const n = liste.length * COPIES.length, im = new THREE.InstancedMesh(geo, mat, n);
  let k = 0;
  COPIES.forEach((oz) => liste.forEach((e) => { poser(e, oz, k); im.setMatrixAt(k, m4); k++; }));
  im.instanceMatrix.needsUpdate = true;
  im.frustumCulled = false;
  return im;
}
const box = new THREE.BoxGeometry(1, 1, 1);
const matPuce = new THREE.MeshStandardMaterial({ color: "#0B1A2E", metalness: 0.75, roughness: 0.36 });
ville.add(instancier(box, matPuce, puces, (e, oz) => { m4.compose(v3.set(e.x, e.h / 2, e.z + oz), q.identity(), sc.set(e.w, e.h, e.d)); }));
const imCh = instancier(box, new THREE.MeshBasicMaterial({ color: "#ffffff" }), chapeaux, (e, oz, k) => { m4.compose(v3.set(e.x, e.y, e.z + oz), q.identity(), sc.set(e.w, 0.02, e.d)); });
{ let k = 0; const c = new THREE.Color(); COPIES.forEach(() => chapeaux.forEach((e) => { imCh.setColorAt(k++, c.copy(e.c).multiplyScalar(e.k)); })); imCh.instanceColor.needsUpdate = true; }
ville.add(imCh);

/* Pistes : impulsions calculées dans le shader (aucun coût côté processeur) */
const partage = { uTime: { value: 0 }, uShock: { value: new THREE.Vector2(0, -999) }, uShockT: { value: -99 }, uFog: { value: DENS }, uFogCol: { value: BRUME }, uBoost: { value: 0 } };
const gPiste = new THREE.BoxGeometry(1, 1, 1);
const n = pistes.length * COPIES.length, aCol = new Float32Array(n * 3), aSeed = new Float32Array(n), aSpeed = new Float32Array(n);
{ let k = 0; COPIES.forEach(() => pistes.forEach((p) => { const c = p.bus ? PALETTE[k % 2] : PALETTE[(Math.random() * PALETTE.length) | 0]; c.toArray(aCol, k * 3); aSeed[k] = Math.random(); aSpeed[k] = p.v; k++; })); }
gPiste.setAttribute("aCol", new THREE.InstancedBufferAttribute(aCol, 3));
gPiste.setAttribute("aSeed", new THREE.InstancedBufferAttribute(aSeed, 1));
gPiste.setAttribute("aSpeed", new THREE.InstancedBufferAttribute(aSpeed, 1));
const matPiste = new THREE.ShaderMaterial({
  uniforms: partage,
  vertexShader: /* glsl */ `
    attribute vec3 aCol; attribute float aSeed; attribute float aSpeed;
    varying vec3 vCol; varying float vS, vSeed, vSpeed, vDepth; varying vec2 vW;
    void main() {
      vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
      float len = length(instanceMatrix[0].xyz);
      vS = (position.x + 0.5) * len;
      vCol = aCol; vSeed = aSeed; vSpeed = aSpeed; vW = wp.xz;
      vec4 mv = viewMatrix * wp; vDepth = -mv.z;
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    precision mediump float;
    uniform float uTime, uFog, uShockT, uBoost; uniform vec3 uFogCol; uniform vec2 uShock;
    varying vec3 vCol; varying float vS, vSeed, vSpeed, vDepth; varying vec2 vW;
    void main() {
      float q = fract((vS - uTime * vSpeed) / 9.0 + vSeed);
      float glow = smoothstep(0.80, 0.985, q) * (1.0 - smoothstep(0.985, 1.0, q));
      float age = uTime - uShockT;
      float r = length(vW - uShock) - age * 14.0;
      float ring = exp(-r * r * 0.25) * exp(-max(age, 0.0) * 0.9) * step(0.0, age);
      vec3 col = vCol * (0.10 + glow * (3.5 + uBoost) + ring * 3.0);
      float f = 1.0 - exp(-uFog * uFog * vDepth * vDepth);
      gl_FragColor = vec4(mix(col, uFogCol, clamp(f, 0.0, 1.0)), 1.0);
    }`
});
ville.add(instancier(gPiste, matPiste, pistes, (p, oz) => { m4.compose(v3.set(p.x, 0.012, p.z + oz), q.setFromAxisAngle(yAxe, p.rot), sc.set(p.len, 0.02, p.bus ? 0.05 : 0.07)); }));

/* Sol : quadrillage fin + rues, suit le déplacement de la ville */
const sol = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), new THREE.ShaderMaterial({
  uniforms: partage,
  vertexShader: "varying vec2 vP; varying float vDepth; void main(){ vP = position.xy; vec4 mv = modelViewMatrix * vec4(position, 1.0); vDepth = -mv.z; gl_Position = projectionMatrix * mv; }",
  fragmentShader: /* glsl */ `
    precision mediump float;
    uniform float uFog; uniform vec3 uFogCol;
    varying vec2 vP; varying float vDepth;
    float ligne(vec2 p, float s) { vec2 g = abs(fract(p / s - 0.5) - 0.5) / max(fwidth(p / s), vec2(1e-4)); return 1.0 - min(min(g.x, g.y), 1.0); }
    void main() {
      vec3 col = vec3(0.012, 0.03, 0.06);
      col += vec3(0.02, 0.09, 0.14) * ligne(vP, 0.6) * 0.35;
      col += vec3(0.03, 0.20, 0.30) * ligne(vP + 1.2, 2.4) * 0.6;
      float f = 1.0 - exp(-uFog * uFog * vDepth * vDepth);
      gl_FragColor = vec4(mix(col, uFogCol, clamp(f, 0.0, 1.0)), 1.0);
    }`
}));
sol.rotation.x = -Math.PI / 2;
ville.add(sol);

/* Faisceaux des repères */
const faisceaux = [];
REPERES.forEach((r) => COPIES.forEach((oz) => {
  const f = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 8, 1, true), new THREE.MeshBasicMaterial({ color: r.c.clone().multiplyScalar(1.6), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  f.scale.y = 26; f.position.set(r.x, r.h + 13, r.z + oz);
  ville.add(f); faisceaux.push(f);
}));

/* Lueur d'horizon et quelques étoiles */
const horizon = new THREE.Mesh(new THREE.PlaneGeometry(240, 60), new THREE.ShaderMaterial({
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: "precision mediump float; varying vec2 vUv; void main(){ float y = clamp(1.0 - abs(vUv.y - 0.32) * 3.2, 0.0, 1.0); float x = clamp(1.0 - abs(vUv.x - 0.5) * 1.6, 0.0, 1.0); vec3 c = mix(vec3(0.20, 0.10, 0.55), vec3(0.0, 0.55, 0.9), vUv.y); gl_FragColor = vec4(c * y * y * x * 0.9, 1.0); }",
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false
}));
horizon.position.set(0, 8, -95);
scene.add(horizon);
{
  const ns = mobile ? 150 : 320, p = new Float32Array(ns * 3);
  for (let i = 0; i < ns; i++) { p[i * 3] = hasard(-120, 120); p[i * 3 + 1] = hasard(14, 60); p[i * 3 + 2] = hasard(-110, -70); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: "#9FD8FF", size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.6, fog: false })));
}

/* ---------- Étiquettes des quartiers (DOM, projetées chaque image) ---------- */
const calque = document.createElement("div");
calque.className = "etiquettes";
calque.setAttribute("aria-hidden", "true");
document.body.appendChild(calque);
REPERES.forEach((r) => {
  r.el = document.createElement("div");
  r.el.className = "etq";
  r.el.innerHTML = "<i>" + D[r.seq].icone + "</i>" + D[r.seq].titre.replace(/^(P\d+)/, "<b>$1</b>");
  r.el.style.setProperty("--c", D[r.seq].couleur);
  calque.appendChild(r.el);
});
const proj = new THREE.Vector3();
/* Une étiquette qui passe sous le texte ou la carte de connexion s'efface : la lecture d'abord */
/* les éléments de texte eux-mêmes, pas leurs blocs (plus larges que le texte) */
const obstacles = ".b-eyebrow, .b-display .l > span, .b-lede, .b-stat, #login .lcard, .b-fact";
let cadres = [];
function dansObstacle(x, y) {
  /* l'étiquette (≈ 240 × 30 px) est centrée sur x et posée au-dessus de y */
  return cadres.some((r) => x > r.left - 125 && x < r.right + 125 && y > r.top - 4 && y < r.bottom + 34);
}
function etiquettes(offset) {
  const montrer = LABO.vue === "login";
  calque.style.opacity = montrer ? 1 : 0;
  if (!montrer) return;
  cadres = Array.from(document.querySelectorAll(obstacles), (el) => el.getBoundingClientRect());
  REPERES.forEach((r) => {
    let z = r.z + offset; if (z > 6) z -= L; if (z < 6 - L) z += L;
    proj.set(r.x, r.h + 1.1, z).project(camera);
    const dist = camera.position.z - z;
    const sx = (proj.x * 0.5 + 0.5) * innerWidth, sy = (-proj.y * 0.5 + 0.5) * innerHeight;
    let a = proj.z < 1 ? THREE.MathUtils.clamp(1 - (dist - 10) / 26, 0, 1) * THREE.MathUtils.clamp((dist - 1) / 4, 0, 1) : 0;
    if (a > 0 && dansObstacle(sx, sy)) a = 0;
    r.op = (r.op || 0) + (a - (r.op || 0)) * 0.15;             /* fondu, jamais d'apparition sèche */
    r.el.style.opacity = r.op.toFixed(3);
    r.el.style.transform = "translate(" + sx.toFixed(1) + "px," + sy.toFixed(1) + "px) translate(-50%,-100%)";
  });
}

/* ---------- Post-traitement ---------- */
const cible = new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType });
const composer = new EffectComposer(renderer, cible);
composer.setPixelRatio(dpr);
composer.setSize(innerWidth, innerHeight);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.85, 0.5, 0.72);
composer.addPass(bloom);
composer.addPass(new OutputPass());
const finition = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: "precision mediump float; uniform sampler2D tDiffuse; uniform float uTime; varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); } void main(){ vec4 c = texture2D(tDiffuse, vUv); float v = smoothstep(0.95, 0.35, length(vUv - 0.5)); c.rgb *= mix(0.5, 1.0, v); c.rgb += (h(vUv + fract(uTime)) - 0.5) * 0.03; gl_FragColor = c; }"
});
composer.addPass(finition);

/* ---------- Caméra : deux plans, passage amorti de l'un à l'autre ---------- */
const PLANS = {
  login: { y: 3.0, z: 8, ly: 0.4, lz: -12, v: 3.0 },
  dash: { y: 13, z: 12, ly: 0, lz: -8, v: 1.2 }
};
const etat = { y: 3, z: 8, ly: 0.4, lz: -12, v: 3, mx: 0, my: 0 };
let vise = Object.assign({ mx: 0, my: 0 }, PLANS.login);
function amortir(k, dt, e) { etat[k] += (vise[k] - etat[k]) * (1 - Math.pow(1 - e, dt * 60)); }

/* ---------- Pointeur et onde au clic ---------- */
const ray = new THREE.Raycaster(), plan = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), ndc = new THREE.Vector2(), pt = new THREE.Vector3();
addEventListener("pointermove", (e) => { vise.mx = (e.clientX / innerWidth) * 2 - 1; vise.my = -(e.clientY / innerHeight) * 2 + 1; reveiller(); }, { passive: true });
addEventListener("pointerdown", (e) => {
  if (e.target.closest("form, button, a, input, .scard, .dhead, .mission")) return;
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  if (ray.ray.intersectPlane(plan, pt)) onde(pt.x, pt.z);
});
function onde(x, z) { partage.uShock.value.set(x, z); partage.uShockT.value = horloge.elapsedTime; reveiller(); }

document.addEventListener("labo:login", () => { onde(0, camera.position.z - 6); vise = Object.assign(vise, PLANS.dash); partage.uBoost.value = 4; });
document.addEventListener("labo:logout", () => { vise = Object.assign(vise, PLANS.login); });
document.addEventListener("labo:view", (e) => {
  canvas.style.transition = "opacity .45s ease";
  canvas.style.opacity = e.detail.vue === "page" ? "0" : "";
  if (LABO.reduit()) { imageFixe(); return; }
  reveiller();
});

/* ---------- Qualité adaptative (fenêtres de 2 s, ne fait que baisser) ---------- */
let qualite = "haute", tFen = 0, nFen = 0, echauffe = 0;
function adapter(dt) {
  if (echauffe < 30) { echauffe++; return; }
  nFen++; tFen += dt;
  if (tFen < 2) return;
  const fps = Math.round(nFen / tFen); nFen = 0; tFen = 0;
  if (fps < 38 && qualite === "haute") { qualite = "moyenne"; dpr = 1; renderer.setPixelRatio(1); composer.setPixelRatio(1); }
  else if (fps < 26 && qualite === "moyenne") { qualite = "économe"; bloom.enabled = false; }
  LABO.setFps("WebGL · " + fps + " i/s · qualité " + qualite);
}

/* ---------- Boucle ---------- */
const horloge = new THREE.Clock();
let tourne = false, offset = 0;
function reveiller() { if (!tourne && !document.hidden && LABO.vue !== "page" && !LABO.reduit()) { tourne = true; horloge.getDelta(); requestAnimationFrame(tick); } }
/* L'avenue se place dans l'espace libre de l'écran de connexion : entre l'accroche et la
   carte, ou à droite des deux si elles sont l'une sous l'autre. setViewOffset décale le
   point de fuite sans bouger la caméra (étiquettes et clics restent justes). */
let decalage = 0;
function espaceLibre() {
  const W = innerWidth;
  if (LABO.vue !== "login" || W < 821) return 0;
  const h = document.querySelector(".b-hero"), c = document.querySelector("#login .lcard");
  if (!h || !c) return 0;
  const rh = h.getBoundingClientRect(), rc = c.getBoundingClientRect();
  const x = rc.left > rh.right ? (rh.right + rc.left) / 2 : (Math.max(rh.right, rc.right) + W) / 2;
  return x - W / 2;
}
function decaler(dt) {
  decalage += (espaceLibre() - decalage) * (1 - Math.pow(1 - 0.06, dt * 60));
  if (Math.abs(decalage) > 0.5) camera.setViewOffset(innerWidth, innerHeight, -decalage, 0, innerWidth, innerHeight);
  else if (camera.view && camera.view.enabled) camera.clearViewOffset();
}
function placer(dt) {
  decaler(dt || 1);
  ["y", "z", "ly", "lz", "v"].forEach((k) => amortir(k, dt, 0.035));
  amortir("mx", dt, 0.06); amortir("my", dt, 0.06);
  camera.position.set(etat.mx * 1.6, etat.y + etat.my * 0.6, etat.z);
  camera.lookAt(etat.mx * 2.4, etat.ly, etat.lz);
  camera.rotateZ(-etat.mx * 0.04);
}
function tick() {
  const dt = Math.min(horloge.getDelta(), 0.1), t = horloge.elapsedTime;
  partage.uTime.value = t; finition.uniforms.uTime.value = t;
  partage.uBoost.value *= Math.pow(0.4, dt);
  placer(dt);
  offset = (offset + etat.v * dt) % L;
  ville.position.z = offset;
  faisceaux.forEach((f, i) => { f.material.opacity = 0.28 + 0.12 * Math.sin(t * 1.5 + i); });
  etiquettes(offset);
  composer.render(dt);
  adapter(dt);
  if (LABO.vue === "page" || document.hidden) { tourne = false; echauffe = 0; nFen = 0; tFen = 0; LABO.setFps("WebGL · en pause (capsule ou page professeur)"); return; }
  requestAnimationFrame(tick);
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) reveiller(); });

function imageFixe() {
  vise = Object.assign(vise, LABO.vue === "login" ? PLANS.login : PLANS.dash);
  Object.assign(etat, vise, { mx: 0, my: 0 });
  placer(0); ville.position.z = offset = 12;
  etiquettes(offset);
  composer.render(0);
  LABO.setFps("WebGL · image fixe (moins de mouvement)");
}

let rsz = false;
addEventListener("resize", () => {
  if (rsz) return; rsz = true;
  requestAnimationFrame(() => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
    rsz = false;
    if (LABO.reduit()) imageFixe(); else reveiller();
  });
});

renderer.compile(scene, camera);
if (LABO.reduit()) imageFixe(); else reveiller();
document.documentElement.classList.add("scene-prete");
})().catch(function (e) { console.warn("Scène 3D indisponible :", e); document.documentElement.classList.add("sans-3d"); });
