"use client";

import Script from "next/script";
import "./bolivamos-scene.css";

const BODY_HTML = `
<div class="hero-wrap">
<three-d-stage name="bolivamos-sunrise" background="linear-gradient(#232840 0%, #2e2f45 58%, #45364a 100%)"></three-d-stage>
<header class="hero-header">
  <a class="wordmark" href="#"><span class="wm-boli">BOLI</span><span class="wm-vamos">VAMOS</span><span class="wm-excl">!</span></a>
  <nav class="clay-nav">
    <a class="clay-btn navitem" href="#" data-i18n="week">This week</a>
    <a class="clay-btn sage navitem" href="#" data-i18n="places">Places</a>
    <a class="clay-btn charcoal navitem" href="#" data-i18n="list">List an event</a>
    <div class="lang-seg" role="group" aria-label="Language">
      <button id="langEn" class="active">EN</button>
      <button id="langEs">ES</button>
    </div>
    <button class="clay-btn clay-burger" id="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </nav>
</header>
<button class="info-btn" id="infoBtn" aria-label="Zonas" aria-expanded="false">i</button>
<div class="info-pop" id="infoPop" aria-label="Mapa">
  <div class="map-title">Santa Cruz de la Sierra</div>
  <div class="map-sub" data-i18n="mapSub">Tap a zone to travel</div>
  <div id="mapSpots" class="metro"></div>
</div>
<nav class="scene-tabs" aria-label="Secciones">
  <button class="clay-btn scene-tab active" data-scene="live" data-i18n="live">Live</button>
  <button class="clay-btn scene-tab" data-scene="week" data-i18n="week">This week</button>
  <button class="clay-btn scene-tab" data-scene="weekend" data-i18n="weekend">This weekend</button>
  <button class="clay-btn scene-tab" data-scene="nightlife" data-i18n="nightlife">Nightlife</button>
  <button class="clay-btn scene-tab" data-scene="places" data-i18n="places">Places</button>
  <button class="clay-btn scene-tab" data-scene="todo" data-i18n="todo">Things to do</button>
</nav>
<nav class="clay-menu" id="clayMenu">
  <a href="#" data-i18n="week">This week</a><a href="#" data-i18n="weekend">This weekend</a><a href="#" data-i18n="nightlife">Nightlife</a><a href="#" data-i18n="places">Places</a><a href="#" data-i18n="todo">Things to do</a><a href="#" data-i18n="list">List an event</a>
</nav>
<div class="click-hint" id="clickHint" data-i18n="hint">The banners are <b>clickable</b></div>
</div>
<section id="estaNoche" style="position:relative;z-index:5;background:#201e1d;">
  <div style="max-width:1160px;margin:0 auto;padding:64px 24px 70px;">
    <h2 style="font-family:Caprasimo,Georgia,serif;font-size:40px;color:#f5ead8;margin:0 0 4px;" data-i18n="tonightTitle">Live tonight</h2>
    <p style="font-family:Figtree,sans-serif;font-weight:600;color:#b8a98c;margin:0 0 28px;" data-i18n="tonightSub">Happening in Santa Cruz after dark</p>
    <div style="position:relative;">
      <button id="livePrev" aria-label="Anterior" style="position:absolute;left:-10px;top:50%;transform:translateY(-50%);z-index:2;width:44px;height:44px;border:0;border-radius:50%;cursor:pointer;background:#c67139;color:#f5ead8;font-size:20px;font-weight:800;box-shadow:0 4px 0 #8e4a20;">←</button>
      <button id="liveNext" aria-label="Siguiente" style="position:absolute;right:-10px;top:50%;transform:translateY(-50%);z-index:2;width:44px;height:44px;border:0;border-radius:50%;cursor:pointer;background:#c67139;color:#f5ead8;font-size:20px;font-weight:800;box-shadow:0 4px 0 #8e4a20;">→</button>
      <div id="liveTrack" style="display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 2px 18px;scrollbar-width:none;"></div>
    </div>
  </div>
</section>
<section id="eventos" style="position:relative;z-index:5;background:#f5ead8;border-top:6px solid #c67139;">
  <div style="max-width:1060px;margin:0 auto;padding:72px 24px 90px;">
    <h2 style="font-family:Caprasimo,Georgia,serif;font-size:44px;color:#201e1d;margin:0 0 8px;" data-i18n="allEvents">All events</h2>
    <p style="font-family:Figtree,sans-serif;font-weight:600;color:#7a6a52;margin:0 0 40px;" data-i18n="allSub">Slide to pick the day</p>
    <div style="margin:0 0 26px;">
      <div id="dayLabel" style="font-family:Caprasimo,Georgia,serif;font-size:30px;color:#c4703d;margin:0 0 12px;"></div>
      <input id="dayRange" type="range" min="0" max="6" step="1" value="0" aria-label="Día" style="width:100%;max-width:540px;accent-color:#c4703d;height:6px;display:block;">
      <div style="display:flex;align-items:center;justify-content:space-between;max-width:540px;">
        <div id="dayTicks" style="display:flex;justify-content:space-between;flex:1;margin-top:6px;"></div>
      </div>
      <div style="display:flex;gap:6px;margin-top:16px;">
        <button id="viewList" class="view-btn active" data-i18n="viewList">List</button>
        <button id="viewMini" class="view-btn" data-i18n="viewMini">Miniatures</button>
      </div>
    </div>
    <div id="dbList"></div>
  </div>
</section>`;

export default function HomeScene() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
      <Script src="/bolivamos/three-d-stage.js" strategy="afterInteractive" />
      <Script src="/bolivamos/page-ui.js" strategy="afterInteractive" />
      <Script src="/bolivamos/scene.js" type="module" strategy="afterInteractive" />
    </>
  );
}
