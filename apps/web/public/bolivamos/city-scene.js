// Free-roam 3D Santa Cruz — walks the same procedural clay-building
// technique as the hero scene (apps/web/public/bolivamos/scene.js: boxes/
// cylinders + high-roughness MeshStandardMaterial, no external 3D assets)
// but over the real geocoded places table (GET /api/places) instead of a
// fixed hand-placed skyline, with free navigation instead of the hero's
// fixed-camera district pans.
//
// Navigation is drag-to-look (mouse or touch) + an on-screen joystick for
// movement — deliberately NOT the Pointer Lock API. Two reasons: (1) it
// doesn't work on touch devices at all, and BoliVamos is mobile-first
// (docs/themed-maps/PRD-themed-interactive-maps.md §4); (2) it needs a
// same-page, non-synthetic user gesture that automated browser testing
// can't reliably trigger. Drag-to-look works identically on desktop and
// touch with no OS-level permission gate.
//
// Scope (see docs/themed-maps/README.md "Phase 0 status" for the full data
// picture): only verified, non-regional attraction/eat_drink/tour places
// get a building — street_zone rows are street *names*, not point POIs, and
// transfer/regional rows are either non-geocodable services or too far away
// for a walkable scene.

const canvas = document.getElementById('city-canvas');
const crosshairLabel = document.getElementById('crosshair-label');
const overlay = document.getElementById('lock-overlay');
const hud = document.getElementById('hud');
const joystickBase = document.getElementById('joystick-base');
const joystickStick = document.getElementById('joystick-stick');

// Attached immediately, before the `three` import below (which can take a
// couple seconds from a cold cache) — otherwise a click during that window
// is silently swallowed since the real dismiss listener isn't wired yet.
overlay.addEventListener('click', () => {
  overlay.style.display = 'none';
});

const [THREE] = await Promise.all([import('three')]);

// ---- materials (same clay recipe as scene.js: high roughness, no metal) ----
const clay = (name, hex) => {
  const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.93, metalness: 0 });
  m.name = name;
  return m;
};
const LAYER_COLOR = {
  attraction: 0xc4703d, // terracotta
  eat_drink: 0xc04a2f, // red
  tour: 0x8ba672, // sage
  transfer: 0x33302c, // charcoal (unused today — 0 verified)
};
const MAT = {
  ground: clay('clay-ground', 0xe6d7bd),
  district: clay('clay-district-pillar', 0xe3a52f),
  attraction: clay('clay-attraction', LAYER_COLOR.attraction),
  eat_drink: clay('clay-eat-drink', LAYER_COLOR.eat_drink),
  tour: clay('clay-tour', LAYER_COLOR.tour),
  event: new THREE.MeshStandardMaterial({ color: 0xe3a52f, roughness: 0.5, metalness: 0, emissive: 0xe3a52f, emissiveIntensity: 0.5 }),
};
MAT.event.name = 'clay-event-glow';

// ---- lat/lng -> local meters, origin at Plaza 24 de Septiembre (Centro) ----
// Flat-earth approximation — fine at city scale (a few km across).
const ORIGIN = { lat: -17.78325, lng: -63.18212 };
const M_PER_DEG_LAT = 111320;
const mPerDegLng = M_PER_DEG_LAT * Math.cos((ORIGIN.lat * Math.PI) / 180);
function toLocal(lng, lat) {
  return {
    x: (lng - ORIGIN.lng) * mPerDegLng,
    z: -(lat - ORIGIN.lat) * M_PER_DEG_LAT, // -z = north, matching camera "forward"
  };
}

// The 7 hero-scene districts (packages/db/scripts/fix-district-assignment.mjs
// — same centroids used to assign every place's district column).
const DISTRICTS = [
  { key: 'Zoo', lat: -17.759631, lng: -63.1853464 },
  { key: 'Parque Urbano', lat: -17.8052962, lng: -63.1436932 },
  { key: 'La Ramada', lat: -17.78908, lng: -63.1863 },
  { key: 'Centro', lat: -17.78325, lng: -63.18212 },
  { key: 'Reloj & Clima', lat: -17.7840852, lng: -63.1817189 },
  { key: 'Equipetrol', lat: -17.76399, lng: -63.1989 },
  { key: 'Las Brisas', lat: -17.7491852, lng: -63.1762605 },
];

// ---- renderer / scene / lights (same recipe as three-d-stage.js's _boot) ----
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5ead8);
scene.fog = new THREE.Fog(0xf5ead8, 60, 420);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.7, 8); // ~human eye height, standing near Plaza 24 de Septiembre

scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 1.1));
const key = new THREE.DirectionalLight(0xffffff, 2.0);
key.position.set(60, 90, 40);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -260;
key.shadow.camera.right = 260;
key.shadow.camera.top = 260;
key.shadow.camera.bottom = -260;
key.shadow.bias = -0.0003;
scene.add(key);
scene.add(new THREE.DirectionalLight(0xfff4e6, 0.45).translateX(-40).translateY(20).translateZ(-30));

const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), MAT.ground);
ground.name = 'ground';
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ---- district landmark pillars — give the free-roam space orientation ----
for (const d of DISTRICTS) {
  const { x, z } = toLocal(d.lng, d.lat);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 14, 12), MAT.district);
  pillar.name = 'district_' + d.key;
  pillar.position.set(x, 7, z);
  pillar.castShadow = true;
  scene.add(pillar);
}

// ---- load real places and place a clay building per verified, walkable POI ----
const buildingMeshes = [];
async function loadPlaces() {
  const res = await fetch('/api/places');
  const geojson = await res.json();
  const usable = geojson.features.filter(
    (f) => !f.properties.regional && ['attraction', 'eat_drink', 'tour'].includes(f.properties.layer),
  );
  for (const f of usable) {
    const [lng, lat] = f.geometry.coordinates;
    const { x, z } = toLocal(lng, lat);
    const rating = f.properties.rating || 3.5;
    const h = 3 + rating * 1.6; // taller buildings for higher-rated places — purely decorative, not a real footprint
    const w = 3 + Math.random() * 2;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), MAT[f.properties.layer] || MAT.attraction);
    mesh.name = f.properties.id;
    mesh.position.set(x, h / 2, z);
    mesh.rotation.y = Math.random() * Math.PI * 0.1;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.place = f.properties;
    scene.add(mesh);
    buildingMeshes.push(mesh);
  }
  hud.textContent = usable.length + ' places loaded';
  loadEvents(usable.length);
}
loadPlaces().catch((err) => {
  hud.textContent = 'Failed to load places: ' + err.message;
});

// Events (real rows from the core app's `events` table, geocoded from
// venue_name — see packages/db/scripts/geocode-events.mjs and migration
// 0003_events_geocoding.sql; venueId is null for all of them, so there's no
// venues.lat/lng to join). Rendered as glowing floating markers, pushed into
// the same buildingMeshes array so search/crosshair/tap-to-open all just
// work for events too — openPlaceSheet branches on layer === 'event' to
// show date/price instead of a star rating.
const eventMarkers = [];
async function loadEvents(placesCount) {
  const res = await fetch('/api/events');
  const rows = await res.json();
  const geocoded = rows.filter((e) => e.lat != null && e.lng != null);
  for (const e of geocoded) {
    const { x, z } = toLocal(e.lng, e.lat);
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.4, 0), MAT.event);
    mesh.name = 'event_' + e.id;
    mesh.position.set(x, 5, z);
    mesh.castShadow = true;
    mesh.userData.place = {
      id: e.id,
      name: e.title,
      layer: 'event',
      category: e.category,
      district: e.district,
      venueName: e.venueName,
      startTime: e.startTime,
      isFree: e.isFree,
      price: e.priceText,
      mapsUrl: e.mapsUrl,
    };
    scene.add(mesh);
    buildingMeshes.push(mesh);
    eventMarkers.push(mesh);
  }
  hud.textContent = placesCount + ' places · ' + geocoded.length + ' events loaded';
}

// ---- free-roam controls: drag-to-look (mouse or touch) + WASD/joystick ----
// No Pointer Lock API — see the file header for why. Rotation is plain
// yaw/pitch state applied to the camera each frame; translation reuses the
// same "move forward along the camera's current facing" math Pointer Lock
// controls use internally, just without needing lock to read it. (Overlay
// dismiss listener is attached at the top of the file, before the `three`
// import, so an early click isn't dropped.)

let yaw = Math.PI; // face -z (north-ish, toward the skyline) at start
let pitch = 0;
const LOOK_SENSITIVITY = 0.0035;
const PITCH_LIMIT = Math.PI / 2 - 0.05;

function applyLook(dx, dy) {
  yaw -= dx * LOOK_SENSITIVITY;
  pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch - dy * LOOK_SENSITIVITY));
  camera.rotation.set(pitch, yaw, 0, 'YXZ');
}
camera.rotation.order = 'YXZ';
camera.rotation.set(pitch, yaw, 0);

let dragging = false;
let lastX = 0;
let lastY = 0;
let dragDistance = 0; // accumulated pixels moved this gesture — a tap stays near 0
const TAP_THRESHOLD = 6;
function dragStart(x, y) {
  dragging = true;
  lastX = x;
  lastY = y;
  dragDistance = 0;
  overlay.style.display = 'none';
}
function dragMove(x, y) {
  if (!dragging) return;
  applyLook(x - lastX, y - lastY);
  dragDistance += Math.hypot(x - lastX, y - lastY);
  lastX = x;
  lastY = y;
}
function dragEnd() {
  if (dragging && dragDistance < TAP_THRESHOLD) {
    openPlaceSheet(hoveredPlace);
  }
  dragging = false;
}
canvas.addEventListener('mousedown', (e) => dragStart(e.clientX, e.clientY));
window.addEventListener('mousemove', (e) => dragMove(e.clientX, e.clientY));
window.addEventListener('mouseup', dragEnd);
canvas.addEventListener(
  'touchstart',
  (e) => {
    const t = e.touches[0];
    if (t) dragStart(t.clientX, t.clientY);
  },
  { passive: true },
);
canvas.addEventListener(
  'touchmove',
  (e) => {
    const t = e.touches[0];
    if (t) dragMove(t.clientX, t.clientY);
  },
  { passive: true },
);
canvas.addEventListener('touchend', dragEnd);

// Movement: WASD/arrows on desktop, a thumb joystick on touch. Both feed
// the same `moveInput` vector (x = strafe, y = forward), consumed once per
// frame in the render loop below.
const moveInput = { x: 0, y: 0 };
const keyState = { forward: false, back: false, left: false, right: false };
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW' || e.code === 'ArrowUp') keyState.forward = true;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') keyState.back = true;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') keyState.left = true;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') keyState.right = true;
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW' || e.code === 'ArrowUp') keyState.forward = false;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') keyState.back = false;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') keyState.left = false;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') keyState.right = false;
});
// A held key's keyup can be missed by the browser (switching to a drag-look
// mid-hold, alt-tabbing, the window losing focus) — that leaves the camera
// flying forward forever with no way to stop it. Clear all input the moment
// focus leaves the page, whatever caused it.
window.addEventListener('blur', () => {
  keyState.forward = keyState.back = keyState.left = keyState.right = false;
  moveInput.x = 0;
  moveInput.y = 0;
  dragging = false;
  joystickReset();
});

const JOYSTICK_RADIUS = 44;
let joystickTouchId = null;
function joystickUpdate(clientX, clientY) {
  const rect = joystickBase.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let dx = clientX - cx;
  let dy = clientY - cy;
  const dist = Math.min(Math.hypot(dx, dy), JOYSTICK_RADIUS);
  const angle = Math.atan2(dy, dx);
  dx = Math.cos(angle) * dist;
  dy = Math.sin(angle) * dist;
  joystickStick.style.transform = `translate(${dx}px, ${dy}px)`;
  moveInput.x = dx / JOYSTICK_RADIUS;
  moveInput.y = dy / JOYSTICK_RADIUS;
}
function joystickReset() {
  joystickTouchId = null;
  joystickStick.style.transform = 'translate(0px, 0px)';
  moveInput.x = 0;
  moveInput.y = 0;
}
joystickBase.addEventListener(
  'touchstart',
  (e) => {
    const t = e.changedTouches[0];
    if (!t) return;
    joystickTouchId = t.identifier;
    joystickUpdate(t.clientX, t.clientY);
    e.stopPropagation(); // don't also start a look-drag from this touch
  },
  { passive: true },
);
joystickBase.addEventListener(
  'touchmove',
  (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === joystickTouchId) joystickUpdate(t.clientX, t.clientY);
    }
    e.stopPropagation();
  },
  { passive: true },
);
joystickBase.addEventListener('touchend', (e) => {
  for (const t of e.changedTouches) {
    if (t.identifier === joystickTouchId) joystickReset();
  }
  e.stopPropagation();
});
const isTouch = matchMedia('(pointer: coarse)').matches;
joystickBase.style.display = isTouch ? 'block' : 'none';

const velocity = new THREE.Vector3();
const SPEED = 16;

// ---- crosshair raycast: label whatever building is dead-center in view,
// and remember it so a tap (see dragEnd above) opens its place sheet ----
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
let hoveredPlace = null;
function updateCrosshairLabel() {
  raycaster.setFromCamera(center, camera);
  const hit = raycaster.intersectObjects(buildingMeshes, false)[0];
  if (hit && hit.distance < 40) {
    const p = hit.object.userData.place;
    hoveredPlace = p;
    crosshairLabel.style.display = 'block';
    crosshairLabel.textContent =
      p.name + (p.category ? ' — ' + p.category : '') + (p.rating ? ' · ' + p.rating.toFixed(1) + '★' : '') + ' · tap to open';
  } else {
    hoveredPlace = null;
    crosshairLabel.style.display = 'none';
  }
}

// ---- place sheet (PRD §7.5): name/category/district/rating/price + actions.
// venueId linking ("Eventos aquí") is a P4 item — the button just stays
// hidden until places carry a real venueId (none do yet). ----
const placeSheet = document.getElementById('place-sheet');
const placeSheetBackdrop = document.getElementById('place-sheet-backdrop');
const placeSheetName = document.getElementById('place-sheet-name');
const placeSheetMeta = document.getElementById('place-sheet-meta');
const placeSheetRating = document.getElementById('place-sheet-rating');
const placeSheetMaps = document.getElementById('place-sheet-maps');
const placeSheetEvents = document.getElementById('place-sheet-events');
const placeSheetShare = document.getElementById('place-sheet-share');

let sheetPlace = null; // the place the open sheet describes — distinct from the
// live `hoveredPlace`, which keeps changing as the user looks around behind it
function formatEventDate(iso) {
  if (!iso) return null;
  const hasTime = iso.includes('T');
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  // Date-only strings ("2026-08-22") parse as UTC midnight — formatting them
  // in the viewer's local zone can shift the calendar day backward for any
  // timezone behind UTC. A bare date has no instant to convert, so format it
  // in UTC too; only real datetimes (with a time + offset) convert to local.
  return d.toLocaleDateString('es-BO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : { timeZone: 'UTC' }),
  });
}

function openPlaceSheet(place) {
  if (!place) return;
  sheetPlace = place;
  placeSheetName.textContent = place.name;

  if (place.layer === 'event') {
    placeSheetMeta.textContent = [place.category, place.venueName, place.district].filter(Boolean).join(' · ');
    placeSheetRating.textContent = [
      formatEventDate(place.startTime),
      place.isFree ? 'Gratis' : place.price,
    ]
      .filter(Boolean)
      .join('  ·  ');
    placeSheetMaps.href = place.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((place.venueName || place.name) + ' Santa Cruz de la Sierra Bolivia')}`;
    placeSheetEvents.style.display = 'none';
  } else {
    placeSheetMeta.textContent = [place.category, place.district].filter(Boolean).join(' · ');
    const stars = place.rating ? '★'.repeat(Math.round(place.rating)) + '☆'.repeat(5 - Math.round(place.rating)) : '';
    placeSheetRating.textContent = [
      stars && `${stars} ${place.rating.toFixed(1)}`,
      place.reviews ? `(${place.reviews} reseñas)` : null,
      place.price,
    ]
      .filter(Boolean)
      .join('  ·  ');
    placeSheetMaps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' Santa Cruz de la Sierra Bolivia')}`;
    placeSheetEvents.style.display = place.venueId ? 'inline-block' : 'none';
  }

  placeSheet.style.display = 'block';
  placeSheetBackdrop.style.display = 'block';
}
function closePlaceSheet() {
  placeSheet.style.display = 'none';
  placeSheetBackdrop.style.display = 'none';
}
document.getElementById('place-sheet-close').addEventListener('click', closePlaceSheet);
placeSheetBackdrop.addEventListener('click', closePlaceSheet);
placeSheetShare.addEventListener('click', async () => {
  const place = sheetPlace;
  const text = place ? `${place.name} — Santa Cruz de la Sierra (BoliVamos)` : 'BoliVamos';
  if (navigator.share) {
    navigator.share({ title: text, url: location.href }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text + ' ' + location.href).catch(() => {});
  }
});

// ---- search over places (PRD §8.1/§9 P2 exit criteria: "search over
// places + streets"). Streets aren't buildings in this scene (see the file
// header), so this searches the same attraction/eat_drink/tour set that's
// actually walkable — jumping straight to a match beats free-roaming a city
// this size to find one specific place. ----
const searchInput = document.getElementById('place-search');
const searchResults = document.getElementById('place-search-results');

function renderSearchResults(matches) {
  searchResults.innerHTML = '';
  if (!matches.length) {
    searchResults.style.display = 'none';
    return;
  }
  for (const mesh of matches.slice(0, 8)) {
    const p = mesh.userData.place;
    const row = document.createElement('div');
    row.textContent = p.name + (p.district ? ' · ' + p.district : '');
    row.style.cssText =
      'padding:10px 14px;cursor:pointer;font:600 13px Figtree,sans-serif;color:#201e1d;border-bottom:1px solid rgba(32,30,29,0.08);';
    row.addEventListener('mouseenter', () => (row.style.background = 'rgba(196,112,61,0.15)'));
    row.addEventListener('mouseleave', () => (row.style.background = 'transparent'));
    row.addEventListener('click', () => jumpToPlace(mesh));
    searchResults.appendChild(row);
  }
  searchResults.style.display = 'block';
}

function jumpToPlace(mesh) {
  // Stand a few meters back from the building, facing it, rather than
  // spawning inside its geometry.
  const dir = new THREE.Vector3(mesh.position.x, 0, mesh.position.z).normalize();
  if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
  camera.position.set(mesh.position.x + dir.x * 8, 1.7, mesh.position.z + dir.z * 8);
  yaw = Math.atan2(-(mesh.position.x - camera.position.x), -(mesh.position.z - camera.position.z));
  pitch = 0;
  camera.rotation.set(pitch, yaw, 0, 'YXZ');
  velocity.set(0, 0, 0);
  searchInput.value = '';
  searchResults.style.display = 'none';
  searchInput.blur();
  openPlaceSheet(mesh.userData.place);
}

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    searchResults.style.display = 'none';
    return;
  }
  renderSearchResults(buildingMeshes.filter((m) => m.userData.place.name.toLowerCase().includes(q)));
});
searchInput.addEventListener('focus', () => {
  if (searchInput.value.trim()) searchResults.style.display = 'block';
});
document.addEventListener('click', (e) => {
  if (!searchResults.contains(e.target) && e.target !== searchInput) searchResults.style.display = 'none';
});

// ---- category filter toggles: show/hide buildings and event markers by
// layer. buildingMeshes already holds both (loadEvents pushes events into
// the same array), so one filter loop covers everything. ----
document.querySelectorAll('.category-filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const layer = btn.dataset.layer;
    const active = btn.dataset.active !== 'false';
    const nowActive = !active;
    btn.dataset.active = String(nowActive);
    btn.style.opacity = nowActive ? '1' : '0.4';
    for (const mesh of buildingMeshes) {
      if (mesh.userData.place.layer === layer) mesh.visible = nowActive;
    }
  });
});

// ---- geolocate (PRD §8.1/§9 P2 exit criteria) — user-triggered (not
// automatic on load) so the permission prompt is expected, not a surprise.
// A visitor genuinely standing in Santa Cruz gets a real "you are here"
// marker + teleport; anyone testing from elsewhere gets an honest distance
// message instead of being silently flown across the world into the void. ----
const HERE_MAT = new THREE.MeshStandardMaterial({ color: 0x7fa3a0, roughness: 0.4, emissive: 0x7fa3a0, emissiveIntensity: 0.6 });
let hereMarker = null;
document.getElementById('locate-me-btn').addEventListener('click', () => {
  if (!navigator.geolocation) {
    hud.textContent = 'Geolocalización no disponible en este navegador';
    return;
  }
  hud.textContent = 'Buscando tu ubicación…';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const distKm = haversineKm(latitude, longitude, ORIGIN.lat, ORIGIN.lng);
      if (distKm > 30) {
        hud.textContent = `Estás a ${distKm.toFixed(0)} km del centro — fuera del área navegable`;
        return;
      }
      const { x, z } = toLocal(longitude, latitude);
      if (!hereMarker) {
        hereMarker = new THREE.Mesh(new THREE.SphereGeometry(1.2, 20, 16), HERE_MAT);
        hereMarker.name = 'you_are_here';
        scene.add(hereMarker);
      }
      hereMarker.position.set(x, 1.2, z);
      camera.position.set(x, 1.7, z + 6);
      yaw = Math.PI;
      pitch = 0;
      camera.rotation.set(pitch, yaw, 0, 'YXZ');
      velocity.set(0, 0, 0);
      hud.textContent = 'Listo — esa es tu posición real';
    },
    (err) => {
      hud.textContent = 'No se pudo obtener tu ubicación (' + err.message + ')';
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
});

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function fit() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
fit();
window.addEventListener('resize', fit);

const forwardVec = new THREE.Vector3();
const rightVec = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);

  // +1 = forward/right, -1 = back/left. Keyboard wins over the joystick if
  // both happen to be active. Joystick dy is screen-down-positive, so
  // pushing the thumb up (dy negative) must flip sign to mean "forward".
  const kForward = Number(keyState.forward) - Number(keyState.back);
  const kRight = Number(keyState.right) - Number(keyState.left);
  const wantForward = kForward !== 0 ? kForward : -moveInput.y;
  const wantRight = kRight !== 0 ? kRight : moveInput.x;

  // velocity.z = forward speed, velocity.x = right speed (both signed,
  // smoothed toward the current input so movement doesn't feel snappy).
  velocity.z -= velocity.z * 8 * dt;
  velocity.x -= velocity.x * 8 * dt;
  const mag = Math.min(Math.hypot(wantForward, wantRight), 1);
  if (mag > 0.01) {
    const norm = Math.max(Math.hypot(wantForward, wantRight), 1e-6);
    velocity.z += (wantForward / norm) * SPEED * mag * dt;
    velocity.x += (wantRight / norm) * SPEED * mag * dt;
  }

  // Camera-relative movement, flattened to the ground plane so looking up/
  // down doesn't fly you into the sky or ground.
  camera.getWorldDirection(forwardVec);
  forwardVec.y = 0;
  forwardVec.normalize();
  rightVec.crossVectors(forwardVec, up).normalize();
  camera.position.addScaledVector(forwardVec, velocity.z * dt);
  camera.position.addScaledVector(rightVec, velocity.x * dt);
  camera.position.y = 1.7; // fixed eye height — no vertical movement in v1

  // Safety net independent of the blur fix above: whatever the cause, never
  // let a runaway hold fly the camera out past the districts (Parque Urbano,
  // the farthest, sits ~4.75km from Centro) into the empty void beyond.
  const distFromOrigin = Math.hypot(camera.position.x, camera.position.z);
  if (distFromOrigin > 6000) {
    camera.position.x *= 6000 / distFromOrigin;
    camera.position.z *= 6000 / distFromOrigin;
    velocity.set(0, 0, 0);
  }

  updateCrosshairLabel();
  renderer.render(scene, camera);
});
