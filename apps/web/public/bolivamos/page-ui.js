
// DB pattern mirrors bolivamos.com event pages: h time, t title, v venue · price,
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
const dayRange = document.getElementById('dayRange');
const dayTicks = document.getElementById('dayTicks');
const DAY_SHORT = ['Vie', 'S\u00e1b', 'Dom', 'Lun', 'Mar', 'Mi\u00e9', 'Jue'];
const TICKS_EN = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
const DAYS_EN = ['Friday \u00b7 Aug 21', 'Saturday \u00b7 Aug 22', 'Sunday \u00b7 Aug 23', 'Monday \u00b7 Aug 24', 'Tuesday \u00b7 Aug 25', 'Wednesday \u00b7 Aug 26', 'Thursday \u00b7 Aug 27'];
const Lng = () => window.__lang || 'en';
let selDay = (new Date().getDay() + 2) % 7;   // DB starts on Friday
let catFilter = null, weekendMode = false;
dayRange.value = selDay;
function buildTicks() { dayTicks.innerHTML = (Lng() === 'es' ? DAY_SHORT : TICKS_EN).map((d, i) => '<button data-day="' + i + '" style="border:0;background:none;cursor:pointer;font-family:Figtree,sans-serif;font-weight:800;font-size:13px;color:#7a6a52;padding:2px 4px;">' + d + '</button>').join(''); }
buildTicks();
dayTicks.addEventListener('click', e => { const b = e.target.closest('[data-day]'); if (!b) return; selDay = +b.dataset.day; weekendMode = false; dayRange.value = selDay; renderDB(); });
dayRange.addEventListener('input', () => { selDay = +dayRange.value; weekendMode = false; renderDB(); });
let viewMode = 'list';
try { if (localStorage.getItem('bolivamos-view') === 'mini') viewMode = 'mini'; } catch (e) {}
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
function renderDB() {
  const idxs = weekendMode ? [1, 2] : [selDay];
  dayLabel.textContent = weekendMode ? (Lng() === 'es' ? 'Este fin de semana' : 'This weekend') : (Lng() === 'es' ? DB[selDay].d : DAYS_EN[selDay]);
  let html = idxs.map(gi => {
    const g = DB[gi];
    const items = g.items.filter(e => !catFilter || catFilter.includes(e.cat));
    const head = weekendMode ? '<h3 style="font-family:Caprasimo,Georgia,serif;font-size:24px;color:#c4703d;margin:26px 0 12px;">' + (Lng() === 'es' ? g.d : DAYS_EN[gi]) + '</h3>' : '';
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
// ---- Live tonight slider: today\u2019s evening events as image cards ----
function buildLive() {
  const track = document.getElementById('liveTrack');
  const idx = (new Date().getDay() + 2) % 7;
  const g = DB[idx]; if (!g) return;
  let evs = g.items.filter(e => e.h === 'TBA' ? /Nightlife|Live music|Comedy/.test(e.cat) : parseInt(e.h, 10) >= 18);
  if (!evs.length) evs = g.items.slice(-6);
  const es = Lng() === 'es';
  track.innerHTML = evs.map(e => {
    const url = e.u;
    const img = e.img || null;
    return '<a href="' + url + '" target="_blank" rel="noopener" style="flex:none;width:270px;scroll-snap-align:start;text-decoration:none;background:#2b2825;border-radius:20px;overflow:hidden;box-shadow:0 6px 0 rgba(0,0,0,.35);">' +
      (img ? '<div style="height:190px;background:#3a352f;"><img src="' + img + '" alt="" loading="lazy" onerror="this.parentNode.style.display=' + "'none'" + '" style="width:100%;height:100%;object-fit:cover;filter:saturate(.85) contrast(.92) brightness(1.04);"></div>' : '<div style="height:110px;display:flex;align-items:center;justify-content:center;background:linear-gradient(140deg,#c67139,#7a8a5e);font-family:Caprasimo,Georgia,serif;font-size:44px;color:#f5ead8;">' + e.t.charAt(0) + '</div>') +
      '<div style="padding:14px 16px 18px;">' +
      '<div style="font-family:Figtree,sans-serif;font-weight:800;font-size:13px;color:#e3a52f;">' + (e.h === 'TBA' ? (es ? 'Esta noche' : 'Tonight') : e.h) + '</div>' +
      '<div style="font-family:Figtree,sans-serif;font-weight:700;font-size:16px;color:#f5ead8;line-height:1.25;margin:4px 0 6px;">' + e.t + '</div>' +
      '<div style="font-family:Figtree,sans-serif;font-weight:600;font-size:13px;color:#b8a98c;">' + e.v + '</div>' +
      '</div></a>';
  }).join('');
}
dbReady.then(buildLive);
window.addEventListener('bolivamos-lang', buildLive);
window.addEventListener('bolivamos-data', buildLive);
document.getElementById('livePrev').addEventListener('click', () => document.getElementById('liveTrack').scrollBy({ left: -576, behavior: 'smooth' }));
document.getElementById('liveNext').addEventListener('click', () => document.getElementById('liveTrack').scrollBy({ left: 576, behavior: 'smooth' }));

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
    en: { week: 'This week', weekend: 'This weekend', nightlife: 'Nightlife', places: 'Places', todo: 'Things to do', list: 'List an event', live: 'Live', map: 'Map', tonightTitle: 'Live tonight', tonightSub: 'Happening in Santa Cruz after dark', viewList: 'List', viewMini: 'Miniatures',
      hint: 'Every public event in Santa Cruz de la Sierra, Bolivia, day by day, in English.',
      allEvents: 'All events', allSub: 'Slide to pick the day \u00b7 tap any event for details',
      mapSub: 'Tap a zone to travel \u00b7 drag the scene', openRealMap: 'Open the real map \u2192' },
    es: { week: 'Esta semana', weekend: 'Este finde', nightlife: 'Vida nocturna', places: 'Lugares', todo: 'Qu\u00e9 hacer', list: 'Publica tu evento', live: 'En vivo', map: 'Mapa', tonightTitle: 'En vivo esta noche', tonightSub: 'Lo que pasa en Santa Cruz al caer la noche', viewList: 'Lista', viewMini: 'Miniaturas',
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
