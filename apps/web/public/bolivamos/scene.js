
const stage = document.querySelector('three-d-stage');
const { THREE } = await stage.ready;
// hero mode: hide the exporter toolbar and hint inside the stage
stage.shadowRoot.querySelectorAll('.toolbar, .note').forEach(el => { el.style.display = 'none'; });

// ---- materials (clay: high roughness, no metal) ----
const clay = (name, hex) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.93, metalness: 0 }); m.name = name; return m; };
const M = {
  ring:   clay('clay-charcoal', 0x33302c),
  red:    clay('clay-red',      0xc04a2f),
  orange: clay('clay-orange',   0xe2792f),
  yellow: clay('clay-yellow',   0xe3a52f),
  green:  clay('clay-green',    0x8ba672),
  cream:  clay('clay-cream',    0xefe4d2),
  sand:   clay('clay-sand',     0xdccbaa),
  white:  clay('clay-white',    0xf7f1e4),
  glass:  clay('clay-sage-glass', 0x74875c),
  terra:  clay('clay-terracotta', 0xc4703d),
  roof:   clay('clay-roof',     0xb0532f),
  ground: clay('clay-ground',   0xe6d7bd),
  trunk:  clay('clay-trunk',    0x6b5138),
};

const root = new THREE.Group(); root.name = 'bolivamos_sunrise';
// ground-plane clipping: the sun mark is invisible below the plaza and rises through the city
stage._renderer.localClippingEnabled = true;
const groundClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.05);
[M.ring, M.red, M.orange, M.yellow, M.green].forEach(m => { m.clippingPlanes = [groundClip]; });

// ---- ground plaza ----
const ground = new THREE.Mesh(new THREE.BoxGeometry(800, 3, 140), M.ground);
ground.name = 'plaza'; ground.position.set(0, -1.5, -18);
root.add(ground);

// ---- the sun mark (from sun-mark.svg, scale 0.45) ----
const S = 0.45, RIM = 7 * S;          // ring half-width
const sun = new THREE.Group(); sun.name = 'sun_mark';
// ring: extruded annulus
const ringShape = new THREE.Shape();
ringShape.absarc(0, 0, (44 + 7) * S, 0, Math.PI * 2, false);
const ringHole = new THREE.Path();
ringHole.absarc(0, 0, (44 - 7) * S, 0, Math.PI * 2, true);
ringShape.holes.push(ringHole);
const ringGeo = new THREE.ExtrudeGeometry(ringShape, { depth: 4, bevelEnabled: true, bevelThickness: 0.6, bevelSize: 0.6, bevelSegments: 3, curveSegments: 64 });
ringGeo.translate(0, 0, -2);
const ring = new THREE.Mesh(ringGeo, M.ring); ring.name = 'sun_ring';
sun.add(ring);
// rays: trapezoid r 58->108, half-width 9->16 (SVG units), extruded
const rayShape = new THREE.Shape();
rayShape.moveTo(-9 * S, 58 * S); rayShape.lineTo(9 * S, 58 * S);
rayShape.lineTo(16 * S, 108 * S); rayShape.lineTo(-16 * S, 108 * S); rayShape.closePath();
const rayGeo = new THREE.ExtrudeGeometry(rayShape, { depth: 3.2, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelSegments: 2 });
rayGeo.translate(0, 0, -1.6);
const rayMats = [M.red, M.yellow, M.green, M.orange, M.yellow, M.red, M.green, M.yellow, M.red, M.orange, M.green, M.yellow];
const rays = new THREE.Group(); rays.name = 'sun_rays';
rayMats.forEach((mat, i) => {
  const r = new THREE.Mesh(rayGeo, mat);
  r.name = 'ray_' + i;
  r.rotation.z = -i * Math.PI / 6;   // SVG rotate() is clockwise
  rays.add(r);
});
sun.add(rays);
// warm glow that comes up with the sun
const glow = new THREE.PointLight(0xffb46a, 0, 240, 1.8);
glow.name = 'sun_glow'; glow.position.set(0, 0, 26);
sun.add(glow);
const SUN_Z = -38, SUN_Y0 = -118, SUN_Y1 = 88;
sun.scale.setScalar(1.15);
sun.position.set(2, 66, SUN_Z);   // framed roughly at the risen pose
root.add(sun);

// ---- Santa Cruz skyline: rounded clay towers ----
function tower(name, x, z, w, h, d, mat, opts = {}) {
  const g = new THREE.Group(); g.name = name;
  const body = opts.round
    ? new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, h, 28), mat)
    : new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  body.name = name + '_body'; body.position.y = h / 2;
  g.add(body);
  if (opts.crown) {  // setback top tier
    const cw = w * 0.62, ch = h * 0.14;
    const crown = opts.round
      ? new THREE.Mesh(new THREE.CylinderGeometry(cw / 2, cw / 2, ch, 28), opts.crownMat || mat)
      : new THREE.Mesh(new THREE.BoxGeometry(cw, ch, d * 0.62), opts.crownMat || mat);
    crown.name = name + '_crown'; crown.position.y = h + ch / 2;
    g.add(crown);
  }
  g.position.set(x, 0.001, z);
  root.add(g);
  return g;
}
// back rank (frames the sun)
tower('torre_1',  -78, -52, 16, 62, 16, M.cream, { crown: true, crownMat: M.terra });
tower('torre_2',  -56, -60, 14, 78, 14, M.glass, { crown: true, crownMat: M.ring });
tower('torre_3',  -34, -50, 12, 54, 14, M.white);
tower('torre_4',   34, -56, 15, 82, 15, M.glass, { crown: true, crownMat: M.ring });
tower('torre_5',   58, -48, 13, 60, 16, M.sand,  { crown: true, crownMat: M.roof });
tower('torre_6',   80, -58, 14, 70, 14, M.cream, { round: true });
// mid rank
tower('torre_7',  -66, -18, 13, 44, 13, M.white, { round: true, crown: true, crownMat: M.terra });
tower('torre_8',  -44, -26, 12, 36, 12, M.sand);
tower('torre_9',   46, -22, 12, 48, 12, M.white, { crown: true, crownMat: M.glass });
tower('torre_10',  68, -14, 11, 34, 11, M.terra);
// wings — the skyline stretches wide
tower('torre_11', -100, -55, 14, 58, 14, M.cream, { crown: true, crownMat: M.terra });
tower('torre_12', -122, -48, 12, 44, 12, M.white, { round: true });
tower('torre_13', -146, -58, 15, 66, 15, M.glass, { crown: true, crownMat: M.ring });
tower('torre_14',  100, -50, 13, 52, 13, M.sand,  { crown: true, crownMat: M.roof });
tower('torre_15',  124, -60, 15, 74, 15, M.glass, { crown: true, crownMat: M.ring });
tower('torre_16',  148, -46, 12, 40, 12, M.terra);
tower('torre_17', -112, -20, 11, 30, 11, M.sand);
tower('torre_18',  116, -18, 12, 36, 12, M.white, { round: true });
// far wings
tower('torre_19', -172, -50, 14, 48, 14, M.cream, { crown: true, crownMat: M.terra });
tower('torre_20', -196, -58, 13, 60, 13, M.glass, { crown: true, crownMat: M.ring });
tower('torre_21', -186, -22, 11, 28, 11, M.sand);
tower('torre_22',  172, -54, 14, 56, 14, M.white, { crown: true, crownMat: M.glass });
tower('torre_23',  196, -46, 13, 44, 13, M.terra, { round: true });
tower('torre_24',  188, -18, 11, 30, 11, M.cream);

// ---- Catedral de San Lorenzo: twin brick towers, arched facade, dome ----
const cat = new THREE.Group(); cat.name = 'catedral';
const brick = clay('clay-brick', 0xb96a41);
const nave = new THREE.Mesh(new THREE.BoxGeometry(26, 14, 34), brick);
nave.name = 'catedral_nave'; nave.position.y = 7; cat.add(nave);
[-10, 10].forEach((tx, i) => {
  const t = new THREE.Mesh(new THREE.BoxGeometry(8, 26, 8), brick);
  t.name = 'catedral_torre_' + i; t.position.set(tx, 13, 15); cat.add(t);
  const belfry = new THREE.Mesh(new THREE.BoxGeometry(6.4, 5, 6.4), M.cream);
  belfry.name = 'catedral_campanario_' + i; belfry.position.set(tx, 28.5, 15); cat.add(belfry);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(3.4, 20, 14), M.roof);
  cap.name = 'catedral_cupula_torre_' + i; cap.scale.set(1, 0.85, 1); cap.position.set(tx, 32.4, 15); cat.add(cap);
});
const dome = new THREE.Mesh(new THREE.SphereGeometry(7.5, 24, 16), M.roof);
dome.name = 'catedral_cupula'; dome.scale.set(1, 0.8, 1); dome.position.set(0, 14, -6); cat.add(dome);
const lantern = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 3.4, 12), M.cream);
lantern.name = 'catedral_linterna'; lantern.position.set(0, 21, -6); cat.add(lantern);
const portal = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 2.4, 24, 1, false, 0, Math.PI), M.cream);
portal.name = 'catedral_portal'; portal.rotation.x = Math.PI / 2; portal.rotation.z = Math.PI / 2;
portal.position.set(0, 7, 23.1); cat.add(portal);
cat.position.set(-52, 0.004, 2); cat.rotation.y = 0.18; root.add(cat);

// ---- El Cristo Redentor: figure with open arms on a pedestal ----
const cristo = new THREE.Group(); cristo.name = 'cristo_redentor';
const ped = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 7, 10, 24), M.sand);
ped.name = 'cristo_pedestal'; ped.position.y = 5; cristo.add(ped);
const robe = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 3.4, 13, 18), M.white);
robe.name = 'cristo_tunica'; robe.position.y = 16.5; cristo.add(robe);
const arms = new THREE.Mesh(new THREE.BoxGeometry(14, 1.7, 1.7), M.white);
arms.name = 'cristo_brazos'; arms.position.y = 21.6; cristo.add(arms);
[-7, 7].forEach((hx, i) => {
  const hand = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), M.white);
  hand.name = 'cristo_mano_' + i; hand.position.set(hx, 21.6, 0); cristo.add(hand);
});
const head = new THREE.Mesh(new THREE.SphereGeometry(1.5, 14, 10), M.white);
head.name = 'cristo_cabeza'; head.position.y = 24.3; cristo.add(head);
cristo.position.set(46, 0.004, 8); cristo.rotation.y = 0.3; root.add(cristo);

// ---- toborochis: bottle-trunk trees with pink canopies ----
const pink = clay('clay-toborochi', 0xd98f9c);
function toborochi(name, x, z, s) {
  const g = new THREE.Group(); g.name = name;
  const trunk = new THREE.Mesh(new THREE.SphereGeometry(2.6, 14, 12), M.trunk);
  trunk.name = name + '_tronco'; trunk.scale.set(1, 1.7, 1); trunk.position.y = 4; g.add(trunk);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.3, 4, 10), M.trunk);
  neck.name = name + '_cuello'; neck.position.y = 9.5; g.add(neck);
  [[0, 12.4, 0, 3.4], [-2.6, 11.2, 1, 2.3], [2.5, 11.4, -0.8, 2.4]].forEach(([cx2, cy, cz, r], i) => {
    const c = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), pink);
    c.name = name + '_copa_' + i; c.scale.y = 0.8; c.position.set(cx2, cy, cz); g.add(c);
  });
  g.scale.setScalar(s); g.position.set(x, 0.005, z); root.add(g);
}
toborochi('toborochi_1', -152, 12, 1.15);
toborochi('toborochi_2', -28, 20, 1);
toborochi('toborochi_3', 88, 22, 1.1);
toborochi('toborochi_4', 160, 10, 0.95);
toborochi('toborochi_5', 22, 24, 0.9);

// ---- clouds: soft clay puffs drifting over the skyline ----
const cloudMat = clay('clay-cloud', 0xf9f4e9);
const clouds = new THREE.Group(); clouds.name = 'nubes';
function cloud(name, x, y, z, s) {
  const g = new THREE.Group(); g.name = name;
  [[0, 0, 0, 5], [-4.5, -0.8, 0.5, 3.4], [4.6, -0.6, -0.4, 3.6], [1.2, 1.8, 0, 3.2], [-2.2, 1.4, -0.6, 2.6]].forEach(([px, py, pz, r], i) => {
    const p = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), cloudMat);
    p.name = name + '_puff_' + i; p.scale.y = 0.72; p.position.set(px, py, pz); g.add(p);
  });
  g.scale.setScalar(s); g.position.set(x, y, z);
  g.userData.baseX = x; g.userData.speed = 1.6 + s;
  clouds.add(g);
}
cloud('nube_1', -150, 88, -62, 1.6);
cloud('nube_2', -66, 100, -70, 2.1);
cloud('nube_3', 38, 94, -66, 1.4);
cloud('nube_4', 128, 104, -72, 1.9);
cloud('nube_5', 196, 86, -60, 1.3);
cloud('nube_6', -210, 98, -68, 1.5);
root.add(clouds);

// ---- stars: fade out as the day breaks ----
const starMat = new THREE.MeshBasicMaterial({ color: 0xfdf3dc }); starMat.name = 'star-glow';
const stars = new THREE.Group(); stars.name = 'estrellas';
for (let i = 0; i < 26; i++) {
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), starMat);
  s.name = 'estrella_' + i;
  const a = (i * 137.5) % 360;
  s.position.set(-210 + (i * 431) % 420, 78 + (i * 97) % 58, -76 - (i * 13) % 8);
  s.scale.setScalar(0.6 + ((a % 7) / 10));
  s.userData.baseScale = s.scale.x;
  stars.add(s);
}
root.add(stars);
// front, low colonial blocks with tiled roofs
function casita(name, x, z, w, h, d) {
  const g = new THREE.Group(); g.name = name;
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.cream);
  b.name = name + '_walls'; b.position.y = h / 2; g.add(b);
  const tri = new THREE.Shape();
  tri.moveTo(-d * 0.62, 0); tri.lineTo(d * 0.62, 0); tri.lineTo(0, d * 0.42); tri.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(tri, { depth: w * 1.06, bevelEnabled: false });
  roofGeo.rotateY(Math.PI / 2); roofGeo.translate(-w * 0.53, 0, 0);
  const r = new THREE.Mesh(roofGeo, M.roof);
  r.name = name + '_roof'; r.position.y = h; g.add(r);
  g.position.set(x, 0.002, z); root.add(g);
}
casita('casa_1', -30, 8, 18, 9, 12);
// church with the analog clock — see iglesia below
// ---- Casa Melchor Pinto: brick portal, cream walls, warm doorway ----
const melchor = new THREE.Group(); melchor.name = 'casa_melchor_pinto';
const mpBrick = clay('clay-brick-mp', 0xb96a41);
const mpWalls = new THREE.Mesh(new THREE.BoxGeometry(24, 9, 12), M.white);
mpWalls.name = 'melchor_muros'; mpWalls.position.y = 4.5; melchor.add(mpWalls);
const mpPortal = new THREE.Mesh(new THREE.BoxGeometry(7, 11, 2.4), mpBrick);
mpPortal.name = 'melchor_portal'; mpPortal.position.set(0, 5.5, 5.4); melchor.add(mpPortal);
const mpDoor = new THREE.Mesh(new THREE.BoxGeometry(4, 6.4, 0.8), clay('clay-door-warm', 0xd97b2e));
mpDoor.name = 'melchor_puerta'; mpDoor.position.set(0, 3.2, 6.4); melchor.add(mpDoor);
const mpLintel = new THREE.Mesh(new THREE.BoxGeometry(8.4, 1, 3), M.cream);
mpLintel.name = 'melchor_dintel'; mpLintel.position.set(0, 11.5, 5.4); melchor.add(mpLintel);
const mpTri = new THREE.Shape();
mpTri.moveTo(-6.6, 0); mpTri.lineTo(6.6, 0); mpTri.lineTo(0, 3.8); mpTri.closePath();
const mpRoofGeo = new THREE.ExtrudeGeometry(mpTri, { depth: 24.6, bevelEnabled: false });
mpRoofGeo.rotateY(Math.PI / 2); mpRoofGeo.translate(-12.3, 0, 0);
const mpRoof = new THREE.Mesh(mpRoofGeo, M.roof);
mpRoof.name = 'melchor_techo'; mpRoof.position.set(0, 9, 0); melchor.add(mpRoof);
melchor.position.set(26, 0.003, 10); root.add(melchor);
// ---- Parque El Arenal: lagoon with its little bridge ----
const arenal = new THREE.Group(); arenal.name = 'parque_el_arenal';
const rimA = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 1, 36), M.sand);
rimA.name = 'arenal_borde'; rimA.position.y = 0.5; arenal.add(rimA);
const agua = new THREE.Mesh(new THREE.CylinderGeometry(13.6, 13.6, 1, 36), clay('clay-agua', 0x7fa3a0));
agua.name = 'arenal_laguna'; agua.position.y = 0.7; arenal.add(agua);
const puente = new THREE.Mesh(new THREE.TorusGeometry(7, 1, 10, 24, Math.PI), M.white);
puente.name = 'arenal_puente'; puente.position.y = 1.2; arenal.add(puente);
const isla = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.8, 2, 18), M.green);
isla.name = 'arenal_isla'; isla.position.y = 1.4; arenal.add(isla);
arenal.position.set(-84, 0.003, 24); root.add(arenal);
casita('casa_4', -72, 14, 16, 8, 11);
casita('casa_5',  -8, 14, 18, 8, 11);
// palms
function palm(name, x, z, h) {
  const g = new THREE.Group(); g.name = name;
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1, h, 10), M.trunk);
  t.name = name + '_trunk'; t.position.y = h / 2; g.add(t);
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(4.2, 12, 8), M.green);
    leaf.name = name + '_leaf_' + i;
    leaf.scale.set(1.7, 0.32, 0.6);
    leaf.rotation.y = i * Math.PI / 3;
    leaf.rotation.z = 0.35;
    leaf.position.set(Math.cos(i * Math.PI / 3) * 2.6, h, Math.sin(i * Math.PI / 3) * 2.6);
    g.add(leaf);
  }
  g.position.set(x, 0.003, z); root.add(g);
}
palm('palma_1', -52, 16, 12);
palm('palma_2',  12, 18, 14);
palm('palma_3',  16, 16, 11);
palm('palma_4',  78, 20, 13);
palm('palma_5', -102, 18, 12);
palm('palma_6', -132, 14, 14);
palm('palma_7', 104, 20, 13);
palm('palma_8', 66, 18, 12);

root.rotation.y = 0;
window.__parts = { root, sun };

stage.setObject(root);   // framed at the sun's risen pose (fliers added after framing on purpose)

// ---- locked hero framing (orbit disabled) ----
root.rotation.y = 0;
stage._controls.enabled = false;
const cam = stage._camera;
cam.fov = 26;
cam.near = 1; cam.far = 2000;
cam.updateProjectionMatrix();
// intro: zoomed on the clock + weather tower, then eases out to center;
// after that the city pans: drag sideways or use the district chips.
let panX = 0, panTarget = 0, zoomGoal = 430, camZ = 430;
// orientation is fixed once (straight ahead, slight constant downward pitch);
// the camera NEVER rotates after this — intro and navigation are pure translation.
const POSE_A = { p: [118, 58, 265] };
const POSE_B = { p: [0, 58, 430] };
cam.position.set(POSE_B.p[0], POSE_B.p[1], POSE_B.p[2]);
cam.lookAt(POSE_B.p[0], POSE_B.p[1] - 12, POSE_B.p[2] - 450);
const CAM_QUAT = cam.quaternion.clone();
function updateCamera(t) {
  const k = ease((t - 2.0) / 3.2);
  panX += (panTarget - panX) * 0.06;
  camZ += (zoomGoal - camZ) * 0.04;
  cam.position.set(lerp(POSE_A.p[0], POSE_B.p[0] + panX, k), POSE_B.p[1], lerp(POSE_A.p[2], camZ, k));
  cam.quaternion.copy(CAM_QUAT);
}
let dragOn = false, dragX = 0, dragMoved = 0;
stage.addEventListener('pointerdown', e => { dragOn = true; dragX = e.clientX; dragMoved = 0; });
window.addEventListener('pointerup', () => { dragOn = false; });
stage.addEventListener('pointermove', e => {
  if (!dragOn) return;
  const dx = e.clientX - dragX; dragX = e.clientX; dragMoved += Math.abs(dx);
  panTarget = Math.max(-370, Math.min(370, panTarget - dx * 0.45));
  zoomGoal = 430;
});
// interactive city map: side panel, spots pan the camera, live location marker
const DISTRICTS = [
  ['Zoo', -350, '#7a8a5e'], ['Parque Urbano', -265, '#5c7245'], ['La Ramada', -175, '#c04a2f'],
  ['Centro', 0, '#33302c'], ['Reloj & Clima', 118, '#c4703d'], ['Equipetrol', 245, '#8ba672'], ['Las Brisas', 336, '#b99a55']
];
const mapSpots = document.getElementById('mapSpots');
DISTRICTS.forEach(([nm, dx, col]) => {
  const b = document.createElement('button');
  b.className = 'metro-stop';
  b.innerHTML = '<span class="dot" style="background:' + col + '"></span><span class="lbl">' + nm + '</span>';
  b.addEventListener('click', () => { panTarget = dx; zoomGoal = 360; infoPop.classList.remove('open'); infoBtn.setAttribute('aria-expanded', 'false'); });
  mapSpots.appendChild(b);
});
const infoBtn = document.getElementById('infoBtn'), infoPop = document.getElementById('infoPop');
infoBtn.addEventListener('click', e => { e.stopPropagation(); const o = infoPop.classList.toggle('open'); infoBtn.setAttribute('aria-expanded', String(o)); });
document.addEventListener('click', e => { if (!infoPop.contains(e.target)) { infoPop.classList.remove('open'); infoBtn.setAttribute('aria-expanded', 'false'); } });
// the info icon tracks the tourism stand by the church
const INFO_ANCHOR = new THREE.Vector3(104, 17, 18);
const infoV = new THREE.Vector3();
function updateMap() {
  let best = 0, bd = 1e9;
  DISTRICTS.forEach(([, dx], i) => { const d = Math.abs(dx - panX); if (d < bd) { bd = d; best = i; } });
  Array.from(mapSpots.children).forEach((el, i) => el.classList.toggle('active', i === best));
  infoV.copy(INFO_ANCHOR).project(cam);
  const r = stage.getBoundingClientRect();
  const sx = (infoV.x * 0.5 + 0.5) * r.width, sy = (-infoV.y * 0.5 + 0.5) * r.height;
  infoBtn.style.left = sx + 'px'; infoBtn.style.top = (sy - 8) + 'px';
  const vis = infoV.z < 1 && sx > 40 && sx < r.width - 40 && sy > 80;
  infoBtn.style.display = vis ? '' : 'none';
  if (!vis) infoPop.classList.remove('open');
}

// ---- brandmark highlights: warm halo + clay that glows as it rises ----
const haloCanvas = document.createElement('canvas'); haloCanvas.width = haloCanvas.height = 256;
const hctx = haloCanvas.getContext('2d');
const grad = hctx.createRadialGradient(128, 128, 10, 128, 128, 128);
grad.addColorStop(0, 'rgba(255,214,150,0.85)');
grad.addColorStop(0.45, 'rgba(255,178,100,0.28)');
grad.addColorStop(1, 'rgba(255,170,90,0)');
hctx.fillStyle = grad; hctx.fillRect(0, 0, 256, 256);
const haloTex = new THREE.CanvasTexture(haloCanvas); haloTex.colorSpace = THREE.SRGBColorSpace;
const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
halo.name = 'sun_halo'; halo.material.name = 'sun-halo';
halo.position.set(0, 0, -8); halo.scale.setScalar(0.001);
sun.add(halo);
// per-mesh material clones so only the mark itself warms up (shared clay stays matte)
const glowMeshes = [];
sun.traverse(o => { if (o.isMesh && o !== halo) { o.material = o.material.clone(); o.material.emissive = new THREE.Color(o.material.color); glowMeshes.push(o); } });

// ================= PROMO FLIERS =================
// EDIT HERE to change the promoted events. Each flier carries an image
// (any project path or URL, square works best) and two lines of text.
// Promo fliers pull from our own /api/events (via window.__DB, set by the
// page's data loader) instead of a hardcoded list.
let EVENTS = [{ t: 'BOLIVAMOS!', s: 'Santa Cruz de la Sierra', u: location.origin + '/' }];
function refreshFlierEvents() {
  const db = window.__DB || [];
  const flat = db.flatMap(g => g.items).filter(e => e.u);
  if (!flat.length) return;
  EVENTS = flat.slice(0, 12).map(e => ({ t: e.t, s: (e.h === 'TBA' ? '' : e.h + ' \u00b7 ') + e.v, u: e.u }));
}
refreshFlierEvents();
window.addEventListener('bolivamos-data', refreshFlierEvents);
let evIdx = 0;
function makeBanner(w = 1280, h = 360) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  let cur = EVENTS[0];
  const draw = () => {
    const x = c.getContext('2d');
    x.fillStyle = '#f5ead8'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#c4703d'; x.lineWidth = 12; x.strokeRect(14, 14, w - 28, h - 28);
    // roomy three-row layout: title / subtitle / pill, nothing overlaps
    let fs = Math.round(h * 0.30);
    x.font = '700 ' + fs + 'px Caprasimo, Georgia, serif';
    while (x.measureText(cur.t).width > w - 120 && fs > 34) { fs -= 4; x.font = '700 ' + fs + 'px Caprasimo, Georgia, serif'; }
    x.fillStyle = '#33302c'; x.fillText(cur.t, 56, h * 0.36);
    let fs2 = Math.round(h * 0.17);
    x.font = '700 ' + fs2 + 'px Figtree, system-ui, sans-serif';
    while (x.measureText(cur.s).width > w - 120 && fs2 > 24) { fs2 -= 3; x.font = '700 ' + fs2 + 'px Figtree, system-ui, sans-serif'; }
    x.fillStyle = '#b0532f'; x.fillText(cur.s, 56, h * 0.58);
    const pw = 260, ph = 60, pxx = w - pw - 44, pyy = h - ph - 32;
    x.fillStyle = '#c4703d'; x.beginPath();
    if (x.roundRect) { x.roundRect(pxx, pyy, pw, ph, 30); x.fill(); } else { x.fillRect(pxx, pyy, pw, ph); }
    x.fillStyle = '#f7f1e4'; x.font = '800 32px Figtree, system-ui, sans-serif';
    x.fillText(((window.__lang || 'en') === 'es' ? 'Toca para ver ' : 'Tap to view ') + '\u2192', pxx + 26, pyy + 41);
    tex.needsUpdate = true;
  };
  draw();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  return { tex, show(ev) { cur = ev; draw(); } };
}
const zepBanner = makeBanner();
const planeBanner = makeBanner();
// --- zeppelin (flies left → right, ad panels on both flanks) ---
const zep = new THREE.Group(); zep.name = 'zeppelin';
const hull = new THREE.Mesh(new THREE.SphereGeometry(10, 28, 20), M.terra);
hull.name = 'zeppelin_hull'; hull.scale.set(2.35, 0.85, 0.85); zep.add(hull);
[[0, 5.5, 0, 0], [0, -5.5, 0, 0], [0, 0, 5.5, 1], [0, 0, -5.5, 1]].forEach(([fy1, fy, fz, horiz], i) => {
  const fin = new THREE.Mesh(new THREE.BoxGeometry(7, horiz ? 1.1 : 7, horiz ? 7 : 1.1), M.red);
  fin.name = 'zeppelin_fin_' + i; fin.position.set(-21, fy, fz); zep.add(fin);
});
const gondola = new THREE.Mesh(new THREE.BoxGeometry(7, 2.6, 3.2), M.ring);
gondola.name = 'zeppelin_gondola'; gondola.position.y = -9; zep.add(gondola);
const zepAdMat = new THREE.MeshBasicMaterial({ map: zepBanner.tex }); zepAdMat.name = 'zeppelin-ad';
[8.9, -8.9].forEach((zz, i) => {
  const ad = new THREE.Mesh(new THREE.PlaneGeometry(33, 9.3), zepAdMat);
  ad.name = 'zeppelin_ad_' + i; ad.position.set(1, 0.5, zz);
  if (zz < 0) ad.rotation.y = Math.PI;
  zep.add(ad);
});
zep.scale.setScalar(1.8);
zep.position.set(-260, 112, -58);
root.add(zep);
// --- banner plane (flies right → left, tows the banner) ---
const plane = new THREE.Group(); plane.name = 'avioneta';
const fus = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.05, 10, 16), M.green);
fus.name = 'avioneta_fuselaje'; fus.rotation.z = -Math.PI / 2; plane.add(fus);
const nose = new THREE.Mesh(new THREE.SphereGeometry(1.3, 14, 10), M.yellow);
nose.name = 'avioneta_nariz'; nose.position.x = 5; plane.add(nose);
const wing = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 15), M.cream);
wing.name = 'avioneta_ala'; wing.position.set(1, 0.6, 0); plane.add(wing);
const tailw = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 6), M.cream);
tailw.name = 'avioneta_cola'; tailw.position.set(-4.4, 0.4, 0); plane.add(tailw);
const tailf = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3, 0.5), M.red);
tailf.name = 'avioneta_timon'; tailf.position.set(-4.4, 1.7, 0); plane.add(tailf);
const prop = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.4, 0.7), M.ring);
prop.name = 'avioneta_helice'; prop.position.x = 6.3; plane.add(prop);
const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 8, 6), M.ring);
rope.name = 'avioneta_cuerda'; rope.rotation.z = Math.PI / 2; rope.position.set(-9, 0, 0); plane.add(rope);
const adMat = new THREE.MeshBasicMaterial({ map: planeBanner.tex, side: THREE.DoubleSide }); adMat.name = 'avioneta-ad';
const towed = new THREE.Mesh(new THREE.PlaneGeometry(36, 10.1), adMat);
towed.name = 'avioneta_banner'; towed.position.set(-31, 0, 0); towed.rotation.y = Math.PI;
plane.add(towed);
plane.rotation.y = Math.PI;   // flies toward -x, banner text faces the camera
plane.scale.setScalar(2.2);
plane.position.set(260, 62, -14);
root.add(plane);
// fliers are clickable — they open the shown event's page
let zepEv = EVENTS[0], planeEv = EVENTS[0];
const rayc = new THREE.Raycaster(), ptrV = new THREE.Vector2();
stage.addEventListener('click', ev => {
  const r = stage.getBoundingClientRect();
  ptrV.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  rayc.setFromCamera(ptrV, stage._camera);
  if (dragMoved > 8) return;
  const markHint = () => { try { localStorage.setItem('bolivamos_banner_hint_done', '1'); } catch (e) {} };
  if (zep.visible && rayc.intersectObject(zep, true).length && zepEv.u) { markHint(); window.open(zepEv.u, '_blank'); }
  else if (plane.visible && rayc.intersectObject(plane, true).length && planeEv.u) { markHint(); window.open(planeEv.u, '_blank'); }
  else if (rayc.intersectObject(valla, true).length) vallaPick.click();
});
stage.addEventListener('pointermove', ev => {
  const r = stage.getBoundingClientRect();
  ptrV.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  rayc.setFromCamera(ptrV, stage._camera);
  const hot = (zep.visible && rayc.intersectObject(zep, true).length) || (plane.visible && rayc.intersectObject(plane, true).length) || rayc.intersectObject(valla, true).length > 0;
  stage.style.cursor = hot ? 'pointer' : '';
});

// ---- scene extras ----
const moon = new THREE.Mesh(new THREE.SphereGeometry(9, 24, 18), new THREE.MeshBasicMaterial({ color: 0xf4ecd8 }));
moon.name = 'luna'; moon.material.name = 'luna-glow';
moon.position.set(-110, 128, -85); moon.scale.setScalar(0.001);
root.add(moon);
const luces = new THREE.Group(); luces.name = 'luces_ciudad';
const lucesMat = new THREE.MeshBasicMaterial({ color: 0xffd27a }); lucesMat.name = 'ventana-luz';
const TORRES = [[-78,-52,62],[-56,-60,78],[-34,-50,54],[34,-56,82],[58,-48,60],[80,-58,70],
  [-100,-55,58],[-122,-48,44],[-146,-58,66],[100,-50,52],[124,-60,74],[148,-46,40],
  [-66,-18,44],[-44,-26,36],[46,-22,48],[68,-14,34]];
TORRES.forEach(([x, z, h], ti) => {
  [0.42, 0.62, 0.82].forEach((f, li) => {
    const l = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), lucesMat);
    l.name = 'luz_' + ti + '_' + li;
    l.position.set(x + ((ti + li) % 3 - 1) * 3.2, h * f, z + 8.2);
    l.userData.phase = (ti * 2.3 + li * 1.7) % 6.28;
    luces.add(l);
  });
});
root.add(luces);
const globos = new THREE.Group(); globos.name = 'globos';
[[ -70, 95, -30, M.terra], [30, 112, -52, M.glass], [92, 88, -18, M.yellow]].forEach(([x, y, z, mat], i) => {
  const g = new THREE.Group(); g.name = 'globo_' + i;
  const env = new THREE.Mesh(new THREE.SphereGeometry(8, 20, 16), mat);
  env.name = 'globo_' + i + '_envelope'; env.scale.y = 1.15; g.add(env);
  const basket = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.6, 3.4), M.trunk);
  basket.name = 'globo_' + i + '_canasta'; basket.position.y = -13; g.add(basket);
  [[-1.4,-1.4],[1.4,-1.4],[-1.4,1.4],[1.4,1.4]].forEach(([cx, cz], ci) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.4, 6), M.ring);
    c.name = 'globo_' + i + '_cuerda_' + ci; c.position.set(cx, -9.4, cz); g.add(c);
  });
  g.userData = { baseX: x, baseY: y, phase: i * 2.1 };
  g.position.set(x, y, z);
  globos.add(g);
});
root.add(globos);

// ---- iglesia: colonial church, its tower is the analog clock ----
const iglesia = new THREE.Group(); iglesia.name = 'iglesia';
const igNave = new THREE.Mesh(new THREE.BoxGeometry(20, 11, 13), M.cream);
igNave.name = 'iglesia_nave'; igNave.position.set(7, 5.5, 0); iglesia.add(igNave);
const naveTri = new THREE.Shape();
naveTri.moveTo(-7.2, 0); naveTri.lineTo(7.2, 0); naveTri.lineTo(0, 4.6); naveTri.closePath();
const naveRoofGeo = new THREE.ExtrudeGeometry(naveTri, { depth: 20.6, bevelEnabled: false });
naveRoofGeo.rotateY(Math.PI / 2); naveRoofGeo.translate(-3.3, 0, 0);
const naveRoof = new THREE.Mesh(naveRoofGeo, M.roof);
naveRoof.name = 'iglesia_techo'; naveRoof.position.set(7, 11, 0); iglesia.add(naveRoof);
const torre = new THREE.Mesh(new THREE.BoxGeometry(13.5, 32, 13.5), M.cream);
torre.name = 'iglesia_torre'; torre.position.set(-8, 16, 0); iglesia.add(torre);
const belfry = new THREE.Mesh(new THREE.BoxGeometry(10, 6.5, 10), M.terra);
belfry.name = 'iglesia_campanario'; belfry.position.set(-8, 35.2, 0); iglesia.add(belfry);
const spire = new THREE.Mesh(new THREE.ConeGeometry(7.4, 8, 4), M.roof);
spire.name = 'iglesia_aguja'; spire.rotation.y = Math.PI / 4; spire.position.set(-8, 42.5, 0); iglesia.add(spire);
// clock face on the tower front
const rim = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 6.4, 0.7, 40), M.ring);
rim.name = 'reloj_marco'; rim.rotation.x = Math.PI / 2; rim.position.set(-8, 24, 6.9); iglesia.add(rim);
const face = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.6, 0.8, 40), M.white);
face.name = 'reloj_cara'; face.rotation.x = Math.PI / 2; face.position.set(-8, 24, 7.0); iglesia.add(face);
for (let i = 0; i < 12; i++) {
  const tickM = new THREE.Mesh(new THREE.BoxGeometry(0.7, i % 3 === 0 ? 1.9 : 1.0, 0.3), M.ring);
  tickM.name = 'reloj_marca_' + i;
  const a = i * Math.PI / 6;
  tickM.position.set(-8 + Math.sin(a) * 4.5, 24 + Math.cos(a) * 4.5, 7.55);
  tickM.rotation.z = -a;
  iglesia.add(tickM);
}
const handH = new THREE.Group(); handH.name = 'reloj_hora'; handH.position.set(-8, 24, 7.65);
const hhm = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.4, 0.3), M.ring); hhm.name = 'reloj_hora_brazo'; hhm.position.y = 1.4; handH.add(hhm);
iglesia.add(handH);
const handM = new THREE.Group(); handM.name = 'reloj_minuto'; handM.position.set(-8, 24, 7.75);
const mhm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.9, 0.25), M.red); mhm.name = 'reloj_minuto_brazo'; mhm.position.y = 2.0; handM.add(mhm);
iglesia.add(handM);
const pin = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), M.red);
pin.name = 'reloj_centro'; pin.position.set(-8, 24, 7.85); iglesia.add(pin);
iglesia.position.set(132, 0.002, 6);
root.add(iglesia);

// ---- tourism info stand, left of the church between the trees ----
const infoStand = new THREE.Group(); infoStand.name = 'puesto_info';
const isPost = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.75, 9, 10), M.trunk);
isPost.name = 'info_poste'; isPost.position.y = 4.5; infoStand.add(isPost);
const isFrame = new THREE.Mesh(new THREE.BoxGeometry(7.6, 7.6, 1.2), M.terra);
isFrame.name = 'info_marco'; isFrame.position.y = 12; infoStand.add(isFrame);
const isC = document.createElement('canvas'); isC.width = 256; isC.height = 256;
(() => { const x = isC.getContext('2d'); x.fillStyle = '#f5ead8'; x.fillRect(0, 0, 256, 256);
  x.fillStyle = '#c4703d'; x.beginPath(); x.arc(128, 128, 96, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#f7f1e4'; x.font = 'italic 800 150px Georgia, serif'; x.textAlign = 'center'; x.fillText('i', 128, 180); })();
const isTex = new THREE.CanvasTexture(isC); isTex.colorSpace = THREE.SRGBColorSpace;
const isMat = new THREE.MeshBasicMaterial({ map: isTex }); isMat.name = 'info-sign';
const isPanel = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 6.6), isMat);
isPanel.name = 'info_panel'; isPanel.position.set(0, 12, 0.7); infoStand.add(isPanel);
infoStand.position.set(104, 0.006, 18); root.add(infoStand);


// ---- torre del clima: the forecast screen building ----
const clima = new THREE.Group(); clima.name = 'torre_clima';
const climaBody = new THREE.Mesh(new THREE.BoxGeometry(16, 74, 14), M.sand);
climaBody.name = 'clima_cuerpo'; climaBody.position.y = 37; clima.add(climaBody);
const climaCrown = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 9), M.terra);
climaCrown.name = 'clima_corona'; climaCrown.position.y = 76; clima.add(climaCrown);
const climaCanvas = document.createElement('canvas'); climaCanvas.width = 640; climaCanvas.height = 420;
const climaTex = new THREE.CanvasTexture(climaCanvas);
climaTex.colorSpace = THREE.SRGBColorSpace; climaTex.anisotropy = 8;
const climaMat = new THREE.MeshBasicMaterial({ map: climaTex }); climaMat.name = 'clima-pantalla';
const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(24.2, 16.4, 0.8), M.terra);
screenFrame.name = 'clima_marco'; screenFrame.position.set(0, 63, 6.9); clima.add(screenFrame);
const screen = new THREE.Mesh(new THREE.PlaneGeometry(22.6, 14.8), climaMat);
screen.name = 'clima_pantalla'; screen.position.set(0, 63, 7.4); clima.add(screen);
function wxIcon(x2, cx, cy, r, code) {
  x2.save(); x2.lineWidth = r * 0.22; x2.lineCap = 'round';
  if (code <= 1) { // sun
    x2.fillStyle = '#e3a52f'; x2.beginPath(); x2.arc(cx, cy, r * 0.55, 0, 7); x2.fill();
    x2.strokeStyle = '#e3a52f';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4;
      x2.beginPath(); x2.moveTo(cx + Math.cos(a) * r * 0.75, cy + Math.sin(a) * r * 0.75);
      x2.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); x2.stroke(); }
  } else if (code < 51) { // cloud
    x2.fillStyle = '#dccbaa'; x2.beginPath();
    x2.arc(cx - r * 0.4, cy + r * 0.15, r * 0.45, 0, 7); x2.arc(cx + r * 0.15, cy - r * 0.1, r * 0.55, 0, 7);
    x2.arc(cx + r * 0.6, cy + r * 0.2, r * 0.4, 0, 7); x2.fill();
    x2.fillRect(cx - r * 0.7, cy + r * 0.15, r * 1.6, r * 0.4);
  } else { // rain
    wxIcon(x2, cx, cy - r * 0.2, r * 0.85, 3);
    x2.strokeStyle = '#7a8a5e';
    for (let i = -1; i <= 1; i++) { x2.beginPath(); x2.moveTo(cx + i * r * 0.42, cy + r * 0.45); x2.lineTo(cx + i * r * 0.42 - r * 0.12, cy + r * 0.85); x2.stroke(); }
  }
  x2.restore();
}
let wx = null;
function drawClima() {
  const x2 = climaCanvas.getContext('2d');
  x2.fillStyle = '#201e1d'; x2.fillRect(0, 0, 640, 420);
  x2.fillStyle = '#dccbaa'; x2.font = '700 34px Figtree, sans-serif';
  x2.fillText('SANTA CRUZ', 40, 56);
  x2.fillStyle = '#c67139'; x2.fillRect(40, 72, 560, 5);
  if (!wx) {
    x2.fillStyle = '#dccbaa'; x2.font = '600 36px Figtree, sans-serif';
    x2.fillText((window.__lang || 'en') === 'es' ? 'cargando clima…' : 'loading weather…', 40, 180);
  } else {
    wxIcon(x2, 120, 175, 72, wx.code);
    x2.fillStyle = '#f5ead8'; x2.font = '800 150px Figtree, sans-serif';
    x2.fillText(Math.round(wx.temp) + '°', 225, 228);
    const days = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
    wx.daily.slice(1, 4).forEach((d, i) => {
      const bx = 60 + i * 190;
      x2.fillStyle = '#dccbaa'; x2.font = '700 30px Figtree, sans-serif';
      x2.fillText(days[d.dow], bx, 310);
      wxIcon(x2, bx + 90, 300, 28, d.code);
      x2.fillStyle = '#f5ead8'; x2.font = '600 28px Figtree, sans-serif';
      x2.fillText(Math.round(d.max) + '° / ' + Math.round(d.min) + '°', bx, 380);
    });
  }
  climaTex.needsUpdate = true;
}
drawClima();
fetch('https://api.open-meteo.com/v1/forecast?latitude=-17.78&longitude=-63.18&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=America%2FLa_Paz')
  .then(r => r.json()).then(j => {
    wx = { temp: j.current.temperature_2m, code: j.current.weather_code,
      daily: j.daily.time.map((d, i) => ({ dow: new Date(d + 'T12:00:00').getDay(), max: j.daily.temperature_2m_max[i], min: j.daily.temperature_2m_min[i], code: j.daily.weather_code[i] })) };
    drawClima();
  }).catch(() => {});
clima.position.set(104, 0.002, -4);
root.add(clima);


// ---- distant ridge: the low hills that surround the city, hazy and subtle ----
const ridge = new THREE.Group(); ridge.name = 'serranias';
const hazeMat = new THREE.MeshStandardMaterial({ color: 0xb8b39a, roughness: 1, metalness: 0 }); hazeMat.name = 'clay-haze';
const hazeMat2 = new THREE.MeshStandardMaterial({ color: 0xc6bfa8, roughness: 1, metalness: 0 }); hazeMat2.name = 'clay-haze-far';
[[-380,54,150,0],[-260,40,190,1],[-120,62,170,0],[20,44,210,1],[160,58,160,0],[300,42,200,1],[420,52,150,0]].forEach(([x, hH, wW, far], i) => {
  const m = new THREE.Mesh(new THREE.ConeGeometry(wW / 2, hH, 5), far ? hazeMat2 : hazeMat);
  m.name = 'serrania_' + i;
  m.scale.z = 0.35; m.rotation.y = (i * 0.7) % 1.2;
  m.position.set(x, hH / 2 - 2, far ? -175 : -150);
  ridge.add(m);
});
root.add(ridge);

// ---- Parques district (far left): leafy trees + kiosk ----
function arbol(name, x, z, h) {
  const g = new THREE.Group(); g.name = name;
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, h, 8), M.trunk);
  tr.name = name + '_tronco'; tr.position.y = h / 2; g.add(tr);
  const cp = new THREE.Mesh(new THREE.SphereGeometry(h * 0.55, 12, 10), M.green);
  cp.name = name + '_copa'; cp.scale.y = 0.85; cp.position.y = h + h * 0.3; g.add(cp);
  g.position.set(x, 0.003, z); root.add(g);
}
arbol('parque_arbol_1', -228, 4, 10); arbol('parque_arbol_2', -252, 16, 13);
arbol('parque_arbol_3', -280, 2, 11); arbol('parque_arbol_4', -308, 14, 12);
arbol('parque_arbol_5', -262, -14, 14); arbol('parque_arbol_6', -298, -18, 10);
const kiosko = new THREE.Group(); kiosko.name = 'parque_kiosko';
const kBase = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 1.4, 8), M.sand);
kBase.name = 'kiosko_base'; kBase.position.y = 0.7; kiosko.add(kBase);
[0,1,2,3,4,5].forEach(i => {
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 6, 8), M.white);
  p.name = 'kiosko_pilar_' + i;
  const a = i * Math.PI / 3;
  p.position.set(Math.cos(a) * 5.4, 4.4, Math.sin(a) * 5.4); kiosko.add(p);
});
const kRoof = new THREE.Mesh(new THREE.ConeGeometry(8, 4.5, 8), M.roof);
kRoof.name = 'kiosko_techo'; kRoof.position.y = 9.6; kiosko.add(kRoof);
kiosko.position.set(-240, 0.004, -6); root.add(kiosko);

// ---- Equipetrol district (far right): glass towers + mall + event billboard ----
tower('equipetrol_1', 208, -50, 15, 88, 15, M.glass, { crown: true, crownMat: M.ring });
tower('equipetrol_2', 232, -58, 14, 72, 14, M.white, { round: true });
tower('equipetrol_3', 258, -48, 16, 96, 16, M.glass, { crown: true, crownMat: M.terra });
tower('equipetrol_4', 284, -56, 13, 64, 13, M.cream, { crown: true, crownMat: M.ring });
tower('equipetrol_5', 308, -46, 14, 80, 14, M.glass, { round: true });
const mall = new THREE.Group(); mall.name = 'mall';
const mallBody = new THREE.Mesh(new THREE.BoxGeometry(52, 16, 30), M.white);
mallBody.name = 'mall_cuerpo'; mallBody.position.y = 8; mall.add(mallBody);
const mallStripe = new THREE.Mesh(new THREE.BoxGeometry(52.4, 3, 30.4), M.terra);
mallStripe.name = 'mall_franja'; mallStripe.position.y = 13; mall.add(mallStripe);
const mallDome = new THREE.Mesh(new THREE.SphereGeometry(9, 20, 12), M.glass);
mallDome.name = 'mall_cupula'; mallDome.scale.y = 0.55; mallDome.position.y = 16; mall.add(mallDome);
const mallSignC = document.createElement('canvas'); mallSignC.width = 512; mallSignC.height = 128;
(() => { const x = mallSignC.getContext('2d'); x.fillStyle = '#33302c'; x.fillRect(0,0,512,128);
  x.fillStyle = '#f5ead8'; x.font = '700 58px Caprasimo, Georgia, serif'; x.textAlign = 'center'; x.fillText('VENTURA', 256, 86); })();
const mallSignTex = new THREE.CanvasTexture(mallSignC); mallSignTex.colorSpace = THREE.SRGBColorSpace;
const mallSignMat = new THREE.MeshBasicMaterial({ map: mallSignTex }); mallSignMat.name = 'mall-sign';
const mallSign = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), mallSignMat);
mallSign.name = 'mall_letrero'; mallSign.position.set(0, 12, 15.3); mall.add(mallSign);
mall.position.set(252, 0.004, 4); root.add(mall);

// ---- letrero helper: clay sign board on posts ----
function letrero(name, text, x, z, w, bg, fg) {
  const g = new THREE.Group(); g.name = name;
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const cx = c.getContext('2d'); cx.fillStyle = bg || '#33302c'; cx.fillRect(0, 0, 512, 128);
  cx.fillStyle = fg || '#f5ead8'; cx.font = '700 ' + (text.length > 9 ? 52 : 68) + 'px Caprasimo, Georgia, serif'; cx.textAlign = 'center'; cx.fillText(text, 256, 86);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  const mt = new THREE.MeshBasicMaterial({ map: tx }); mt.name = name + '-sign';
  const board = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), mt);
  board.name = name + '_tabla'; board.position.y = 7 + w / 8; g.add(board);
  [-w / 2 + 1, w / 2 - 1].forEach((px, i) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 7, 8), M.trunk);
    p.name = name + '_poste_' + i; p.position.set(px, 3.5, -0.3); g.add(p);
  });
  g.position.set(x, 0.006, z); root.add(g);
}

// ---- Parque Urbano (sign + extra green) & Zoo ----
letrero('letrero_parque', 'PARQUE URBANO', -265, 26, 22, '#7a8a5e');
arbol('parque_arbol_7', -218, -12, 12); arbol('parque_arbol_8', -238, 20, 9);
arbol('parque_arbol_9', -290, 22, 12); arbol('parque_arbol_10', -322, 0, 13);
const zoo = new THREE.Group(); zoo.name = 'zoo';
for (let i = 0; i < 14; i++) {
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3, 0.5), M.trunk);
  post.name = 'zoo_cerca_' + i;
  const a = (i / 14) * Math.PI * 2;
  post.position.set(Math.cos(a) * 22, 1.5, Math.sin(a) * 13);
  zoo.add(post);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.5, 0.4), M.sand);
  rail.name = 'zoo_riel_' + i;
  const a2 = ((i + 0.5) / 14) * Math.PI * 2;
  rail.position.set(Math.cos(a2) * 21.5, 2.6, Math.sin(a2) * 12.7);
  rail.rotation.y = -a2 + Math.PI / 2;
  zoo.add(rail);
}
const jirafa = new THREE.Group(); jirafa.name = "zoo_jirafa";
const jBody = new THREE.Mesh(new THREE.SphereGeometry(3, 14, 10), M.yellow);
jBody.name = 'jirafa_cuerpo'; jBody.scale.set(1.4, 1, 1); jBody.position.y = 5; jirafa.add(jBody);
const jNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 8, 10), M.yellow);
jNeck.name = 'jirafa_cuello'; jNeck.rotation.z = -0.25; jNeck.position.set(3.4, 9.5, 0); jirafa.add(jNeck);
const jHead = new THREE.Mesh(new THREE.SphereGeometry(1.4, 10, 8), M.yellow);
jHead.name = 'jirafa_cabeza'; jHead.scale.set(1.4, 1, 1); jHead.position.set(4.6, 13.6, 0); jirafa.add(jHead);
[[-1.8, -1.2], [1.8, -1.2], [-1.8, 1.2], [1.8, 1.2]].forEach(([lx, lz], i) => {
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 5, 8), M.yellow);
  leg.name = 'jirafa_pata_' + i; leg.position.set(lx, 2.5, lz); jirafa.add(leg);
});
jirafa.position.set(-6, 0, 0); zoo.add(jirafa);
const tapir = new THREE.Group(); tapir.name = "zoo_tapir";
const tBody2 = new THREE.Mesh(new THREE.SphereGeometry(2.6, 12, 10), M.trunk);
tBody2.name = 'tapir_cuerpo'; tBody2.scale.set(1.5, 1, 1); tBody2.position.y = 2.8; tapir.add(tBody2);
const tHead2 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 8), M.trunk);
tHead2.name = 'tapir_cabeza'; tHead2.scale.set(1.3, 1, 1); tHead2.position.set(3.4, 3.4, 0); tapir.add(tHead2);
tapir.position.set(8, 0, 4); zoo.add(tapir);
zoo.position.set(-352, 0.004, 2); root.add(zoo);
letrero('letrero_zoo', 'ZOO', -352, 24, 12, '#c67139');

// ---- La Ramada: market stalls with striped awnings ----
const ramada = new THREE.Group(); ramada.name = 'la_ramada';
[[0, 0, M.red], [11, 3, M.yellow], [22, -1, M.green], [33, 2, M.orange]].forEach(([sx, sz, mat], i) => {
  const stall = new THREE.Group(); stall.name = "ramada_puesto_" + i;
  const table = new THREE.Mesh(new THREE.BoxGeometry(8, 3.2, 6), M.sand);
  table.name = 'ramada_mesa_' + i; table.position.y = 1.6; stall.add(table);
  const awn = new THREE.Mesh(new THREE.BoxGeometry(9, 0.5, 7), mat);
  awn.name = 'ramada_toldo_' + i; awn.rotation.x = -0.12; awn.position.y = 6; stall.add(awn);
  [[-3.8, -2.8], [3.8, -2.8], [-3.8, 2.8], [3.8, 2.8]].forEach(([px, pz], pi) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 6, 6), M.white);
    p.name = 'ramada_palo_' + i + '_' + pi; p.position.set(px, 3, pz); stall.add(p);
  });
  stall.position.set(sx, 0, sz); ramada.add(stall);
});
ramada.position.set(-186, 0.004, 12); root.add(ramada);
letrero('letrero_ramada', 'LA RAMADA', -168, 32, 18, '#b0532f');

// ---- Equipetrol detail: cafe strip + streetlights + Las Brisas mall ----
[[206, M.terra], [218, M.glass], [230, M.red]].forEach(([cx2, mat], i) => {
  const cafe = new THREE.Group(); cafe.name = "equipetrol_cafe_" + i;
  const body = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 8), M.cream);
  body.name = 'cafe_cuerpo_' + i; body.position.y = 3; cafe.add(body);
  const awn = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.4, 3), mat);
  awn.name = 'cafe_toldo_' + i; awn.rotation.x = -0.2; awn.position.set(0, 5.2, 5); cafe.add(awn);
  cafe.position.set(cx2, 0.004, 20); root.add(cafe);
});
const farolas = new THREE.Group(); farolas.name = "farolas";
[196, 226, 256, 286, 316].forEach((fx, i) => {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 12, 8), M.ring);
  pole.name = 'farola_poste_' + i; pole.position.set(fx, 6, 32); farolas.add(pole);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), lucesMat);
  lamp.name = 'farola_luz_' + i; lamp.position.set(fx, 12.4, 32); farolas.add(lamp);
});
root.add(farolas);
const brisas = new THREE.Group(); brisas.name = 'las_brisas';
const bBody = new THREE.Mesh(new THREE.BoxGeometry(44, 20, 26), M.sand);
bBody.name = 'brisas_cuerpo'; bBody.position.y = 10; brisas.add(bBody);
const bStripe = new THREE.Mesh(new THREE.BoxGeometry(44.4, 3, 26.4), M.glass);
bStripe.name = 'brisas_franja'; bStripe.position.y = 16; brisas.add(bStripe);
const bTower = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 30, 20), M.white);
bTower.name = 'brisas_torre'; bTower.position.set(-16, 15, 0); brisas.add(bTower);
brisas.position.set(336, 0.004, -6); root.add(brisas);
letrero('letrero_brisas', 'LAS BRISAS', 336, 12, 20, '#7a8a5e');
letrero('letrero_equipetrol', 'EQUIPETROL', 246, 34, 20, '#33302c');

// ---- big billboard on the parks side: everything happening tonight ----
const noche = new THREE.Group(); noche.name = 'cartelera_esta_noche';
[-21, 21].forEach((px, i) => {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 22, 10), M.ring);
  post.name = 'noche_poste_' + i; post.position.set(px, 11, 0); noche.add(post);
});
const nFrame = new THREE.Mesh(new THREE.BoxGeometry(54, 32, 1.8), M.ring);
nFrame.name = 'noche_marco'; nFrame.position.y = 36; noche.add(nFrame);
const nC = document.createElement('canvas'); nC.width = 1024; nC.height = 576;
const nTex = new THREE.CanvasTexture(nC); nTex.colorSpace = THREE.SRGBColorSpace; nTex.anisotropy = 8;
function drawNoche() {
  const x = nC.getContext('2d');
  x.fillStyle = '#201e1d'; x.fillRect(0, 0, 1024, 576);
  x.fillStyle = '#e2792f'; x.font = '700 66px Caprasimo, Georgia, serif';
  x.fillText((window.__lang || 'en') === 'es' ? 'ESTA NOCHE' : 'TONIGHT', 48, 88);
  x.fillStyle = '#c4703d'; x.fillRect(48, 108, 928, 4);
  const db = window.__DB || [];
  const idx = (new Date().getDay() + 2) % 7;
  const g = db[idx];
  let evs = g ? g.items.filter(e => e.h === 'TBA' ? /Nightlife|Live music|Comedy/.test(e.cat) : parseInt(e.h, 10) >= 18) : [];
  if (!evs.length && g) evs = g.items.slice(-4);
  evs.slice(0, 6).forEach((e, i) => {
    const y = 168 + i * 62;
    x.fillStyle = '#e3a52f'; x.font = '800 30px Figtree, system-ui, sans-serif';
    x.fillText(e.h, 48, y);
    x.fillStyle = '#f5ead8'; x.font = '700 32px Figtree, system-ui, sans-serif';
    let title = e.t; while (x.measureText(title).width > 620 && title.length > 4) title = title.slice(0, -2);
    x.fillText(title === e.t ? title : title + '\u2026', 150, y);
    x.fillStyle = '#b8a98c'; x.font = '600 24px Figtree, system-ui, sans-serif'; x.textAlign = 'right';
    x.fillText(e.v.split(' \u00b7 ')[0], 976, y); x.textAlign = 'left';
  });
  x.fillStyle = '#7a8a5e'; x.font = '700 26px Figtree, system-ui, sans-serif';
  x.fillText('BOLIVAMOS!', 48, 540);
  nTex.needsUpdate = true;
}
drawNoche();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawNoche);
setInterval(drawNoche, 60000);
window.addEventListener('bolivamos-data', drawNoche);
const nMat = new THREE.MeshBasicMaterial({ map: nTex }); nMat.name = 'noche-panel';
const nPanel = new THREE.Mesh(new THREE.PlaneGeometry(51, 29), nMat);
nPanel.name = 'noche_panel'; nPanel.position.set(0, 36, 1.0); noche.add(nPanel);
noche.position.set(-224, 0.006, 28);
root.add(noche);



// ---- the event billboard: shows the host's uploaded image ----
const valla = new THREE.Group(); valla.name = 'valla_evento';
[-14, 14].forEach((px, i) => {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.2, 26, 10), M.ring);
  post.name = 'valla_poste_' + i; post.position.set(px, 13, 0); valla.add(post);
});
const vFrame = new THREE.Mesh(new THREE.BoxGeometry(42, 25, 1.6), M.terra);
vFrame.name = 'valla_marco'; vFrame.position.y = 36; valla.add(vFrame);
const vC = document.createElement('canvas'); vC.width = 1024; vC.height = 576;
const vTex = new THREE.CanvasTexture(vC); vTex.colorSpace = THREE.SRGBColorSpace; vTex.anisotropy = 8;
function vallaPlaceholder() {
  const x = vC.getContext('2d');
  x.fillStyle = '#f5ead8'; x.fillRect(0, 0, 1024, 576);
  x.strokeStyle = '#c4703d'; x.lineWidth = 10; x.setLineDash([26, 18]); x.strokeRect(28, 28, 968, 520); x.setLineDash([]);
  x.fillStyle = '#33302c'; x.textAlign = 'center';
  x.font = '700 58px Caprasimo, Georgia, serif';
  x.fillText('Tu evento aqu\u00ed', 512, 250);
  x.fillStyle = '#b0532f'; x.font = '600 34px Figtree, system-ui, sans-serif';
  x.fillText('Haz clic en la valla o arrastra la imagen del evento', 512, 320);
  vTex.needsUpdate = true;
}
function vallaImage(src) {
  const im = new Image();
  im.onload = () => {
    const x = vC.getContext('2d');
    x.fillStyle = '#201e1d'; x.fillRect(0, 0, 1024, 576);
    const s = Math.max(1024 / im.width, 576 / im.height);
    const w = im.width * s, hh = im.height * s;
    x.drawImage(im, (1024 - w) / 2, (576 - hh) / 2, w, hh);
    vTex.needsUpdate = true;
  };
  im.src = src;
}
vallaPlaceholder();
try { const saved = localStorage.getItem('bolivamos_valla_img'); if (saved) vallaImage(saved); } catch (e) {}
const vPanelMat = new THREE.MeshBasicMaterial({ map: vTex }); vPanelMat.name = 'valla-panel';
const vPanel = new THREE.Mesh(new THREE.PlaneGeometry(39.5, 22.5), vPanelMat);
vPanel.name = 'valla_panel'; vPanel.position.set(0, 36, 0.9); valla.add(vPanel);
valla.scale.setScalar(0.82);
valla.position.set(170, 0.005, 14); root.add(valla);
const vallaPick = document.createElement('input');
vallaPick.type = 'file'; vallaPick.accept = 'image/*'; vallaPick.style.display = 'none';
document.body.appendChild(vallaPick);
function vallaLoad(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const rd = new FileReader();
  rd.onload = () => { vallaImage(rd.result); try { localStorage.setItem('bolivamos_valla_img', rd.result); } catch (e) {} };
  rd.readAsDataURL(file);
}
vallaPick.addEventListener('change', () => vallaLoad(vallaPick.files[0]));
stage.addEventListener('dragover', e => e.preventDefault());
stage.addEventListener('drop', e => { e.preventDefault(); vallaLoad(e.dataTransfer.files[0]); });
window.addEventListener('bolivamos-lang', () => { try { zepBanner.show(zepEv); planeBanner.show(planeEv); drawNoche(); drawClima(); } catch (err) {} });

// ---- sunrise ----
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => {
  const a = new THREE.Color(c1), b = new THREE.Color(c2);
  return '#' + a.lerp(b, t).getHexString();
};
const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
let t0 = performance.now();
let zepPass = -1, planePass = -1;
window.__restart = () => { t0 = performance.now(); };
stage.addEventListener('dblclick', window.__restart);
// intro: fast impactful sunrise into "This week". Tabs then blend the scene
// smoothly to each section's mood: week (day), weekend (golden hour),
// nightlife (night: moon, stars, lit windows), places (warm dawn), todo (balloons).
const SCENES = {
  week:      { y: 88,   top: '#bcd6d6', mid: '#e8dcc4', low: '#f6ecd9', stars: 0,    moon: 0, luces: 0,   globos: 0 },
  weekend:   { y: 58,   top: '#a9c4c2', mid: '#e3c093', low: '#f2c682', stars: 0,    moon: 0, luces: 0.3, globos: 0 },
  nightlife: { y: -118, top: '#232840', mid: '#2e2f45', low: '#45364a', stars: 1,    moon: 1, luces: 1,   globos: 0 },
  places:    { y: 34,   top: '#4a3b46', mid: '#8a5a48', low: '#d98a4e', stars: 0.15, moon: 0, luces: 0.5, globos: 0 },
  todo:      { y: 80,   top: '#b9d8cd', mid: '#e6ddc0', low: '#f6ecd9', stars: 0,    moon: 0, luces: 0,   globos: 1 },
};
let scene = 'live';
// real-clock mood: rows are [hour, sunY, top, mid, low, stars]
const HCLOCK = [
  [ 0,  -118, '#232840', '#2e2f45', '#45364a', 1   ],
  [ 5,  -118, '#232840', '#2e2f45', '#45364a', 1   ],
  [ 6.5,  12, '#4a3b46', '#8a5a48', '#d98a4e', 0.3 ],
  [ 8,    70, '#bcd6d6', '#e8dcc4', '#f6ecd9', 0   ],
  [ 12,   88, '#bcd6d6', '#e8dcc4', '#f6ecd9', 0   ],
  [ 16.5, 62, '#a9c4c2', '#e3c093', '#f2c682', 0   ],
  [ 18.5, 16, '#5e4a5e', '#a05a48', '#e07b3f', 0.25],
  [ 19.5,-118,'#232840', '#2e2f45', '#45364a', 1   ],
  [ 24, -118, '#232840', '#2e2f45', '#45364a', 1   ],
];
function clockMood() {
  const d = new Date(), h = d.getHours() + d.getMinutes() / 60;
  let i = 0;
  while (i < HCLOCK.length - 2 && h >= HCLOCK[i + 1][0]) i++;
  const a = HCLOCK[i], b = HCLOCK[i + 1];
  const k = ease((h - a[0]) / (b[0] - a[0]));
  const stars = lerp(a[5], b[5], k);
  return { y: lerp(a[1], b[1], k), top: mix(a[2], b[2], k), mid: mix(a[3], b[3], k), low: mix(a[4], b[4], k),
    stars, moon: stars, luces: stars, globos: 0 };
}
const cur = { y: SUN_Y0, top: '#232840', mid: '#2e2f45', low: '#45364a', stars: 1, moon: 0, luces: 0, globos: 0 };
document.querySelectorAll('.scene-tab').forEach(b => b.addEventListener('click', () => {
  scene = b.dataset.scene;
  if (window.__setSection) window.__setSection(scene);
  const target = document.getElementById(scene === 'live' ? 'estaNoche' : 'eventos');
  if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 8, behavior: 'smooth' });
  document.querySelectorAll('.scene-tab').forEach(x => x.classList.toggle('active', x === b));
}));
const INTRO = 5;
function tick(now) {
  const t = (now - t0) / 1000;
  if (t < INTRO) {
    // slide-in: sky and sun flow from pre-dawn into their real-time position,
    // synced with the camera easing out from the clock + thermometer.
    const m0 = clockMood();
    const u = Math.min(1, Math.max(0, (t - 0.5) / 4.5));
    const c1 = 1.35, c3 = c1 + 1;
    const p = u === 0 ? 0 : 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
    const eu = ease(u);
    cur.y = lerp(SUN_Y0, m0.y, p);
    cur.top = mix('#232840', m0.top, eu);
    cur.mid = mix('#2e2f45', m0.mid, eu);
    cur.low = mix('#45364a', m0.low, eu);
    cur.stars = lerp(1, m0.stars, eu);
    cur.moon = lerp(0, m0.moon, eu); cur.luces = lerp(0, m0.luces, eu);
  } else {
    const tgt = scene === 'live' ? clockMood() : SCENES[scene], K = 0.035;
    cur.y = lerp(cur.y, tgt.y, K);
    cur.top = mix(cur.top, tgt.top, K); cur.mid = mix(cur.mid, tgt.mid, K); cur.low = mix(cur.low, tgt.low, K);
    cur.stars = lerp(cur.stars, tgt.stars, K);
    cur.moon = lerp(cur.moon, tgt.moon, K); cur.luces = lerp(cur.luces, tgt.luces, K); cur.globos = lerp(cur.globos, tgt.globos, K);
  }
  const starK = cur.stars, lit = Math.max(0, Math.min(1, (cur.y + 20) / 100));
  sun.position.y = cur.y + Math.sin(t * 0.7) * 0.6 * lit;
  sun.rotation.z = -t * 0.05 - 2.2;
  rays.rotation.z = -t * 0.04;
  clouds.children.forEach(c => {
    c.position.x = c.userData.baseX + ((t * c.userData.speed) % 460);
    if (c.position.x > 230) c.position.x -= 460;
  });
  stars.children.forEach(s => { s.scale.setScalar(s.userData.baseScale * Math.max(0.001, starK)); });
  stars.visible = starK > 0.02;
  // scene extras
  moon.scale.setScalar(Math.max(0.001, cur.moon));
  moon.visible = cur.moon > 0.02;
  luces.visible = cur.luces > 0.02;
  luces.children.forEach(l => { l.scale.setScalar(Math.max(0.001, cur.luces * (0.8 + 0.25 * Math.sin(t * 2.1 + l.userData.phase)))); });
  globos.visible = cur.globos > 0.02;
  globos.children.forEach(g => {
    g.scale.setScalar(Math.max(0.001, cur.globos));
    g.position.y = g.userData.baseY + Math.sin(t * 0.5 + g.userData.phase) * 3;
    g.position.x = g.userData.baseX + Math.sin(t * 0.13 + g.userData.phase) * 14;
  });
  // BOLI blends continuously with darkness — charcoal by day, cream by night
  const boli = document.querySelector('.wm-boli');
  if (boli && !document.querySelector('.hero-header.docked')) {
    const k = Math.max(0, Math.min(1, starK));
    const day =   ['#3a352f', '#2c2823', '#27231f', '#221e1a', '#1d1a16'];
    const night = ['#f2e7d0', '#d6c6a6', '#c4b394', '#b2a083', '#a08e72'];
    const c = day.map((d, i) => mix(d, night[i], k));
    boli.style.color = c[0];
    boli.style.textShadow = `0 1px 0 ${c[1]}, 0 2px 0 ${c[2]}, 0 3px 0 ${c[3]}, 0 4px 0 ${c[4]}, 0 7px 12px rgba(20,18,16,${0.4 + 0.15 * k})`;
  }
  // fliers alternate: zeppelin crosses, pause, plane crosses, pause — never together
  const T = 74, ct = t % T, cycle = Math.floor(t / T);
  if (ct < 40) {
    if (zepPass !== cycle) {
      zepPass = cycle;
      zep.position.z = [-70, -10, 8][Math.floor(Math.random() * 3)];
      zep.userData.baseY = 92 + Math.random() * 40;
      zepEv = EVENTS[evIdx++ % EVENTS.length]; zepBanner.show(zepEv);
    }
    zep.visible = true;
    zep.position.x = lerp(-260, 260, ct / 40);
    zep.position.y = zep.userData.baseY + Math.sin(t * 0.5) * 1.5;
  } else zep.visible = false;
  if (ct >= 45 && ct < 69) {
    if (planePass !== cycle) {
      planePass = cycle;
      plane.position.z = [-62, -12, 10][Math.floor(Math.random() * 3)];
      plane.userData.baseY = 55 + Math.random() * 55;
      planeEv = EVENTS[evIdx++ % EVENTS.length]; planeBanner.show(planeEv);
    }
    plane.visible = true;
    plane.position.x = lerp(260, -260, (ct - 45) / 24);
    plane.position.y = plane.userData.baseY + Math.sin(t * 0.9) * 1.2;
    towed.rotation.z = Math.sin(t * 2.2) * 0.045;
  } else plane.visible = false;
  prop.rotation.x = t * 26;
  const hintEl = document.getElementById('clickHint');
  if (hintEl) hintEl.classList.toggle('on', t > INTRO);
  const dnow = new Date();
  handM.rotation.z = -(dnow.getMinutes() + dnow.getSeconds() / 60) / 60 * Math.PI * 2;
  handH.rotation.z = -((dnow.getHours() % 12) + dnow.getMinutes() / 60) / 12 * Math.PI * 2;
  glow.intensity = lit * 1500;
  const hk = Math.max(0, Math.min(1, (sun.position.y - 12) / 60));   // halo only once the mark clears the rooftops
  halo.scale.setScalar(Math.max(0.001, hk * (185 + Math.sin(t * 1.1) * 9)));
  halo.material.opacity = hk * (0.55 + Math.sin(t * 1.1) * 0.1);
  glowMeshes.forEach(m => { m.material.emissiveIntensity = lit * (0.22 + Math.sin(t * 1.1) * 0.05); });
  updateCamera(t);
  updateMap();
  stage.style.setProperty('--stage-bg', `linear-gradient(${top2()} 0%, ${cur.mid} 58%, ${cur.low} 100%)`);
  requestAnimationFrame(tick);
}
function top2() { return cur.top; }
requestAnimationFrame(tick);
