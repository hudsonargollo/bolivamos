
// DB entries: h time, t title, v venue · price,
// cat category, u event url; optional desc, map, img (detail data imported per event).
let DB = [];
const DAY_MS = 86400000;
/** Groups our own flat /api/events list into the display shape this page
 *  expects: seven days starting today, each with its events for that day. */
function groupIntoWeek(flatEvents) {
  const days = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const WD_ES = ['Domingo', 'Lunes', 'Martes', 'Mi\u00e9rcoles', 'Jueves', 'Viernes', 'S\u00e1bado'];
  const MO_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  for (let i = 0; i < 7; i++) {
    const day = new Date(today.getTime() + i * DAY_MS);
    const dISO = day.toISOString().slice(0, 10);
    const items = flatEvents
      .filter(e => (e.startTime || '').slice(0, 10) === dISO)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
      .map(e => {
        // Read the hour straight off the ISO string (already in Bolivia's
        // UTC-4 offset) rather than via Date.getHours(), which would show
        // the viewer's own local time instead of Santa Cruz's.
        const timeM = /T(\d{2}):(\d{2})/.exec(e.startTime || '');
        const h = timeM ? timeM[1] + ':' + timeM[2] : 'TBA';
        const vParts = [e.venueName].filter(Boolean);
        if (e.priceText) vParts.push(e.priceText); else if (e.isFree) vParts.push('Gratis');
        return {
          h, t: e.title, v: vParts.join(' \u00b7 '), cat: e.category || 'More',
          u: location.origin + '/events/' + e.id,
          img: e.imageUrl || null,
          desc: e.description || null,
          map: e.mapsUrl || null,
        };
      });
    days.push({ d: WD_ES[day.getDay()] + ' \u00b7 ' + MO_ES[day.getMonth()] + ' ' + day.getDate(), items });
  }
  return days;
}
async function loadDB() {
  try {
    const res = await fetch('/api/events');
    const flat = await res.json();
    DB = groupIntoWeek(flat);
  } catch (err) {
    DB = groupIntoWeek([]);
    console.error('[bolivamos] failed to load events', err);
  }
  window.__DB = DB;
  window.dispatchEvent(new CustomEvent('bolivamos-data'));
}
const dbReady = loadDB();
const btn = (href, label, solid) => '<a href="' + href + '" target="_blank" rel="noopener" style="font-family:Figtree,sans-serif;font-weight:700;font-size:14px;text-decoration:none;padding:9px 18px;border-radius:999px;' +
  (solid ? 'background:#c4703d;color:#f7f1e4;' : 'background:rgba(196,113,57,.14);color:#8f4225;') + '">' + label + '</a>';
const dbList = document.getElementById('dbList');
const dayLabel = document.getElementById('dayLabel');
const dayTicks = document.getElementById('dayTicks');
const WD_SHORT_ES = ['Dom', 'Lun', 'Mar', 'Mi\u00e9', 'Jue', 'Vie', 'S\u00e1b'];
const WD_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WD_FULL_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MO_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const Lng = () => window.__lang || 'en';
/** Date for the i-th day of our 7-day window (i=0 is today), matching groupIntoWeek. */
function dayDate(i) {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return new Date(t.getTime() + i * DAY_MS);
}
/** Indices (within the 7-day window) that fall on the next Saturday/Sunday. */
function weekendIdxs() {
  const dow = new Date().getDay();
  const idxs = [];
  for (let i = 0; i < 7; i++) { const d = (dow + i) % 7; if (d === 0 || d === 6) idxs.push(i); }
  return idxs.length ? idxs : [0];
}
let selDay = 0;   // 0 = today, matching groupIntoWeek's array
let catFilter = null, weekendMode = false;
function buildTicks() {
  const names = Lng() === 'es' ? WD_SHORT_ES : WD_SHORT_EN;
  dayTicks.innerHTML = Array.from({ length: 7 }, (_, i) => {
    const d = dayDate(i);
    return '<button class="day-pill' + (i === selDay && !weekendMode ? ' active' : '') + (i === 0 ? ' today' : '') + '" data-day="' + i + '"><span class="dw">' + names[d.getDay()] + '</span><span class="dn">' + d.getDate() + '</span></button>';
  }).join('');
}
buildTicks();
dayTicks.addEventListener('click', e => { const b = e.target.closest('[data-day]'); if (!b) return; selDay = +b.dataset.day; weekendMode = false; buildTicks(); renderDB(); });
let viewMode = 'mini';
try { if (localStorage.getItem('bolivamos-view') === 'list') viewMode = 'list'; } catch (e) {}
function miniCard(e, gi, ei) {
  const url = e.u;
  const img = e.img || null;
  return '<a href="' + url + '" target="_blank" rel="noopener" style="text-decoration:none;background:#fbf4e6;border-radius:18px;overflow:hidden;box-shadow:0 2px 0 rgba(120,90,50,.12);display:flex;flex-direction:column;">' +
    (img ? '<div style="height:130px;background:#efe2c8;"><img src="' + img + '" alt="" loading="lazy" onerror="this.parentNode.style.display=' + "'none'" + '" style="width:100%;height:100%;object-fit:cover;filter:saturate(.85) contrast(.92) brightness(1.04);"></div>' : '<div style="height:84px;display:flex;align-items:center;justify-content:center;background:linear-gradient(140deg,rgba(198,113,57,.25),rgba(122,138,94,.25));font-family:Caprasimo,Georgia,serif;font-size:34px;color:#c4703d;">' + e.t.charAt(0) + '</div>') +
    '<div style="padding:10px 12px 14px;">' +
    '<div style="font-family:Figtree,sans-serif;font-weight:800;font-size:12px;color:#b0532f;">' + e.h + '</div>' +
    '<div style="font-family:Figtree,sans-serif;font-weight:700;font-size:14px;color:#201e1d;line-height:1.25;margin:3px 0 4px;">' + e.t + '</div>' +
    '<div style="font-family:Figtree,sans-serif;font-weight:600;font-size:12px;color:#7a6a52;">' + e.v + '</div>' +
    '</div></a>';
}
function card(e, gi, ei) {
  const url = e.u, id = 'ev-' + gi + '-' + ei;
  const wa = 'https://wa.me/?text=' + encodeURIComponent(e.t + ' \u00b7 ' + url);
  const detail = '<div id="' + id + '" style="display:none;padding:4px 18px 18px;">' +
    (e.img ? '<img src="' + e.img + '" alt="" loading="lazy" onerror="this.remove()" style="width:100%;max-width:460px;border-radius:16px;display:block;margin:6px 0 12px;">' : '') +
    (e.desc ? '<p style="font-family:Figtree,sans-serif;color:#4a4237;line-height:1.5;margin:0 0 14px;max-width:640px;">' + e.desc + '</p>' : '') +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;">' + btn(url, (Lng() === 'es' ? 'Ver evento ' : 'View event ') + '\u2192', true) + (e.map ? btn(e.map, 'Google Maps') : '') + btn(wa, 'WhatsApp') + '</div></div>';
  return '<div style="border-radius:16px;background:#fbf4e6;margin-bottom:8px;box-shadow:0 2px 0 rgba(120,90,50,.12);overflow:hidden;">' +
    '<div class="ev-head" data-target="' + id + '" role="button" tabindex="0" style="display:flex;gap:16px;align-items:baseline;padding:13px 18px;cursor:pointer;flex-wrap:wrap;">' +
    '<span style="font-family:Figtree,sans-serif;font-weight:800;color:#b0532f;min-width:56px;">' + e.h + '</span>' +
    '<span style="font-family:Figtree,sans-serif;font-weight:700;color:#201e1d;flex:1;min-width:200px;">' + e.t + '</span>' +
    '<span style="font-family:Figtree,sans-serif;font-weight:700;font-size:12px;color:#5c6e45;background:rgba(122,138,94,.18);padding:3px 12px;border-radius:999px;">' + e.cat + '</span>' +
    '<span style="font-family:Figtree,sans-serif;font-weight:600;color:#7a6a52;font-size:14px;">' + e.v + '</span>' +
    '</div>' + detail + '</div>';
}
function dayLabelFor(i) {
  const d = dayDate(i);
  return Lng() === 'es' ? DB[i].d : WD_FULL_EN[d.getDay()] + ' · ' + MO_EN[d.getMonth()] + ' ' + d.getDate();
}
function renderDB() {
  if (!DB.length) return;   // data not loaded yet — dbReady.then(renderDB) re-runs this once it is
  const idxs = weekendMode ? weekendIdxs() : [selDay];
  dayLabel.textContent = weekendMode ? (Lng() === 'es' ? 'Este fin de semana' : 'This weekend') : dayLabelFor(selDay);
  let html = idxs.map(gi => {
    const g = DB[gi];
    const items = g.items.filter(e => !catFilter || catFilter.includes(e.cat));
    const head = weekendMode ? '<h3 style="font-family:Caprasimo,Georgia,serif;font-size:24px;color:#c4703d;margin:26px 0 12px;">' + dayLabelFor(gi) + '</h3>' : '';
    const body = viewMode === 'mini' ? '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;">' + items.map((e, ei) => miniCard(e, gi, ei)).join('') + '</div>' : items.map((e, ei) => card(e, gi, ei)).join('');
    return head + (items.length ? body : '<p style="font-family:Figtree,sans-serif;font-weight:600;color:#7a6a52;">' + (Lng() === 'es' ? 'Nada en esta categor\u00eda este d\u00eda.' : 'Nothing in this category on this day.') + '</p>');
  }).join('');
  dbList.innerHTML = html;
}
dbList.addEventListener('click', e => {
  if (e.target.closest('a')) return;
  const hd = e.target.closest('.ev-head'); if (!hd) return;
  const d = document.getElementById(hd.dataset.target);
  if (window.__sheets && window.__sheets.isMobile()) {
    window.__sheets.openDetail(d.innerHTML);
    return;
  }
  d.style.display = d.style.display === 'none' ? 'block' : 'none';
});
window.__DB = DB;
window.__setSection = s => {
  if (s === 'nightlife') { catFilter = ['Nightlife', 'Comedy']; weekendMode = false; }
  else if (s === 'todo') { catFilter = ['Workshops & classes', 'Culture & arts', 'Markets & fairs', 'Community & expat', 'Sports & active', 'Family & kids', 'More']; weekendMode = false; }
  else if (s === 'weekend') { catFilter = null; weekendMode = true; }
  else { catFilter = null; weekendMode = false; }
  buildTicks();
  renderDB();
};
dbReady.then(renderDB);
window.addEventListener('bolivamos-lang', () => { buildTicks(); renderDB(); });
window.addEventListener('bolivamos-data', renderDB);
const viewListBtn = document.getElementById('viewList'), viewMiniBtn = document.getElementById('viewMini');
function setView(m) {
  viewMode = m;
  viewListBtn.classList.toggle('active', m === 'list');
  viewMiniBtn.classList.toggle('active', m === 'mini');
  try { localStorage.setItem('bolivamos-view', m); } catch (e) {}
  renderDB();
}
viewListBtn.addEventListener('click', () => setView('list'));
viewMiniBtn.addEventListener('click', () => setView('mini'));
if (viewMode === 'mini') setView('mini');
// ---- Live tonight billboard: auto-rotating slideshow of tonight's events ----
let liveTimer = null, liveIdx = 0;
function liveEvents() {
  const g = DB[0]; if (!g) return [];
  let evs = g.items.filter(e => e.h === 'TBA' ? /Nightlife|Live music|Comedy/.test(e.cat) : parseInt(e.h, 10) >= 18);
  if (!evs.length) evs = g.items.slice(-5);
  return evs.slice(0, 8);
}
function liveShow(i) {
  liveIdx = i;
  document.querySelectorAll('#liveBanner .live-slide').forEach((el, j) => el.classList.toggle('active', j === i));
  document.querySelectorAll('#liveDots .live-dot').forEach((el, j) => el.classList.toggle('active', j === i));
}
function liveStart(n) {
  clearInterval(liveTimer);
  if (n > 1) liveTimer = setInterval(() => liveShow((liveIdx + 1) % n), 5000);
}
// extruded sun mark, the branding signature stamped on every billboard
const SUN_SVG = (() => {
  const cols = ['#c04a2f', '#e3a52f', '#8ba672', '#e2792f', '#e3a52f', '#c04a2f', '#8ba672', '#e3a52f', '#c04a2f', '#e2792f', '#8ba672', '#e3a52f'];
  let s = '';
  for (let i = 0; i < 12; i++) s += '<path d="M-9 -58 L9 -58 L16 -108 L-16 -108 Z" fill="' + cols[i] + '" transform="rotate(' + (i * 30) + ')"/>';
  return '<svg class="bb-sun" viewBox="-125 -125 250 250" aria-hidden="true">' + s + '<circle r="44" fill="none" stroke="#33302c" stroke-width="14"/></svg>';
})();
function buildLive() {
  const wrap = document.getElementById('liveBanner'), dots = document.getElementById('liveDots');
  const evs = liveEvents(), es = Lng() === 'es';
  wrap.innerHTML = evs.map(e => {
    const img = e.img || null;
    return '<a class="live-slide" href="' + e.u + '" target="_blank" rel="noopener">' +
      '<div class="billboard">' + SUN_SVG +
      '<div class="bb-frame">' + (img ? '<img src="' + img + '" alt="" loading="lazy" onerror="this.remove()">' : '<div class="live-fallback"></div>') + '</div>' +
      '<div class="bb-legs"><span></span><span></span></div>' +
      '</div>' +
      '<div class="live-info">' +
      '<span class="live-time">' + (e.h === 'TBA' ? (es ? 'Esta noche' : 'Tonight') : e.h) + '</span>' +
      '<h3 class="live-title">' + e.t + '</h3>' +
      '<div class="live-venue">' + e.v + '</div>' +
      '<span class="live-cta">' + (es ? 'Ver evento \u2192' : 'View event \u2192') + '</span>' +
      '</div></a>';
  }).join('');
  dots.innerHTML = evs.length > 1 ? evs.map((e, i) => '<button class="live-dot" data-i="' + i + '" aria-label="' + (i + 1) + '"></button>').join('') : '';
  liveShow(0);
  liveStart(evs.length);
}
dbReady.then(buildLive);
window.addEventListener('bolivamos-lang', buildLive);
window.addEventListener('bolivamos-data', buildLive);
document.getElementById('liveDots').addEventListener('click', e => { const b = e.target.closest('.live-dot'); if (!b) return; liveShow(+b.dataset.i); liveStart(liveEvents().length); });
document.getElementById('liveBanner').addEventListener('mouseenter', () => clearInterval(liveTimer));
document.getElementById('liveBanner').addEventListener('mouseleave', () => liveStart(liveEvents().length));

// ---- Places (city directory): real venues from /api/places, browsable by
// category (layer) and neighborhood (district) — separate from the events
// list above, and separate from the interactive 3D map at /city3d (which
// this section links out to for a live demo). ----
const LAYER_LABEL = { eat_drink: ['Restaurants & bars', 'Restaurantes y bares'], attraction: ['Things to see', 'Qué ver'], tour: ['Tours', 'Tours'], transfer: ['Transfers', 'Traslados'] };
const LAYER_ORDER = ['eat_drink', 'attraction', 'tour', 'transfer'];
let PLACES = [], plLayer = null, plDistrict = 'all', plQuery = '', plShown = 24;
async function loadPlaces() {
  try {
    const res = await fetch('/api/places');
    const geo = await res.json();
    PLACES = (geo.features || []).map(f => f.properties).filter(p => p.layer !== 'street_zone');
  } catch (err) {
    PLACES = [];
    console.error('[bolivamos] failed to load places', err);
  }
  plLayer = LAYER_ORDER.find(l => PLACES.some(p => p.layer === l)) || null;
  renderPlaces();
}
const placesReady = loadPlaces();
function districtsFor(layer) {
  const counts = {};
  PLACES.filter(p => p.layer === layer).forEach(p => { const d = p.district || null; if (d) counts[d] = (counts[d] || 0) + 1; });
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 8);
}
function placeItems() {
  let arr = PLACES.filter(p => p.layer === plLayer);
  if (plDistrict !== 'all') arr = arr.filter(p => p.district === plDistrict);
  if (plQuery) { const q = plQuery.toLowerCase(); arr = arr.filter(p => (p.name + ' ' + (p.category || '')).toLowerCase().includes(q)); }
  return arr;
}
function placeCard(p) {
  const meta = [];
  if (p.rating) meta.push('<span class="pl-rate">★ ' + p.rating.toFixed(1) + '</span>' + (p.reviews ? '<span class="pl-rev">(' + p.reviews + ')</span>' : ''));
  if (p.price) meta.push('<span class="pl-price">' + p.price + '</span>');
  if (p.district) meta.push('<span class="pl-district">' + p.district + '</span>');
  return '<div class="pl-card"><div class="pl-name">' + p.name + '</div>' +
    (p.category ? '<div class="pl-type">' + p.category + '</div>' : '') +
    '<div class="pl-meta">' + meta.join('') + '</div></div>';
}
function renderPlaces() {
  const $ = id => document.getElementById(id);
  const es = Lng() === 'es';
  $('plTitle').textContent = es ? 'Directorio de la ciudad' : 'City directory';
  $('plSub').textContent = es ? 'Dónde comer, qué ver y cómo moverte por Santa Cruz' : 'Where to eat, what to see and how to get around Santa Cruz';
  $('plSearch').placeholder = es ? 'Buscar lugares…' : 'Search places…';
  if (!plLayer) { $('plTabs').innerHTML = ''; $('plSubs').innerHTML = ''; $('plGrid').innerHTML = ''; $('plMore').style.display = 'none'; return; }
  $('plTabs').innerHTML = LAYER_ORDER.filter(l => PLACES.some(p => p.layer === l)).map(l =>
    '<button class="pl-tab' + (l === plLayer ? ' active' : '') + '" data-layer="' + l + '">' + LAYER_LABEL[l][es ? 1 : 0] + '</button>').join('');
  const districts = districtsFor(plLayer);
  $('plSubs').innerHTML = '<button class="pl-sub' + (plDistrict === 'all' ? ' active' : '') + '" data-district="all">' + (es ? 'Todo' : 'All') + '</button>' +
    districts.map(d => '<button class="pl-sub' + (d === plDistrict ? ' active' : '') + '" data-district="' + d + '">' + d + '</button>').join('');
  const items = placeItems();
  $('plGrid').innerHTML = items.slice(0, plShown).map(placeCard).join('') ||
    '<p style="font-family:Figtree,sans-serif;font-weight:600;color:#7a6a52;">' + (es ? 'No hay lugares para este filtro.' : 'No places match this filter.') + '</p>';
  $('plMore').style.display = items.length > plShown ? 'block' : 'none';
  $('plMore').textContent = es ? 'Ver más' : 'Show more';
}
document.getElementById('plTabs').addEventListener('click', e => { const b = e.target.closest('[data-layer]'); if (!b) return; plLayer = b.dataset.layer; plDistrict = 'all'; plShown = 24; renderPlaces(); });
document.getElementById('plSubs').addEventListener('click', e => { const b = e.target.closest('[data-district]'); if (!b) return; plDistrict = b.dataset.district; plShown = 24; renderPlaces(); });
document.getElementById('plSearch').addEventListener('input', e => { plQuery = e.target.value; plShown = 24; renderPlaces(); });
document.getElementById('plMore').addEventListener('click', () => { plShown += 24; renderPlaces(); });
window.addEventListener('bolivamos-lang', renderPlaces);

  const burger = document.getElementById('burger'), clayMenu = document.getElementById('clayMenu');
  const heroHeader = document.querySelector('.hero-header');
  function dockHeader() {
    const docked = window.scrollY > window.innerHeight - 70;
    heroHeader.classList.toggle('docked', docked);
    clayMenu.classList.toggle('docked', docked);
  }
  window.addEventListener('scroll', dockHeader, { passive: true });
  dockHeader();
  burger.addEventListener('click', () => {
    const open = clayMenu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  const I18N = {
    en: { week: 'This week', weekend: 'This weekend', nightlife: 'Nightlife', explore: 'Explore the city', places: 'Places', todo: 'Things to do', list: 'List an event', live: 'Live', map: 'Map', tonightTitle: 'Live tonight', tonightSub: 'Happening in Santa Cruz after dark', viewList: 'List', viewMini: 'Miniatures',
      hint: 'Every public event in Santa Cruz de la Sierra, Bolivia, day by day, in English.',
      allEvents: 'All events', allSub: 'Slide to pick the day \u00b7 tap any event for details',
      mapSub: 'Tap a zone to travel \u00b7 drag the scene', openRealMap: 'Open the real map \u2192' },
    es: { week: 'Esta semana', weekend: 'Este finde', nightlife: 'Vida nocturna', explore: 'Explora la ciudad', places: 'Lugares', todo: 'Qu\u00e9 hacer', list: 'Publica tu evento', live: 'En vivo', map: 'Mapa', tonightTitle: 'En vivo esta noche', tonightSub: 'Lo que pasa en Santa Cruz al caer la noche', viewList: 'Lista', viewMini: 'Miniaturas',
      hint: 'Todos los eventos p\u00fablicos de Santa Cruz de la Sierra, Bolivia, d\u00eda a d\u00eda.',
      allEvents: 'Todos los eventos', allSub: 'Desliza para elegir el d\u00eda \u00b7 toca un evento para ver detalles',
      mapSub: 'Toca una zona para viajar \u00b7 arrastra la escena', openRealMap: 'Abrir mapa real \u2192' },
  };
  const langEn = document.getElementById('langEn'), langEs = document.getElementById('langEs');
  function setLang(l) {
    document.documentElement.lang = l;
    window.__lang = l;
    document.querySelectorAll('[data-i18n]').forEach(el => { const v = I18N[l][el.dataset.i18n]; if (v != null) el.innerHTML = v; });
    langEn.classList.toggle('active', l === 'en');
    langEs.classList.toggle('active', l === 'es');
    try { localStorage.setItem('bolivamos-lang', l); } catch (e) {}
    window.dispatchEvent(new CustomEvent('bolivamos-lang'));
  }
  langEn.addEventListener('click', () => setLang('en'));
  langEs.addEventListener('click', () => setLang('es'));
  let savedLang = 'en'; try { if (localStorage.getItem('bolivamos-lang') === 'es') savedLang = 'es'; } catch (e) {}
  setLang(savedLang);
