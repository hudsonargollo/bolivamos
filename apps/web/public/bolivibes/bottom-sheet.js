// Draggable bottom sheets for the mobile layout — the persistent
// "content" sheet (Live tonight + All events, over the 3D scene), the
// transient "detail" sheet (tapping an event), and the existing zone/map
// popup (which becomes a bottom sheet instead of a centered card).
// Desktop is untouched: everything here is gated on isMobile(), and the
// sheet elements are plain in-flow blocks outside the mobile media query.
(function () {
  function isMobile() {
    return window.matchMedia('(max-width: 720px)').matches;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  /**
   * Wires drag-to-snap behavior onto `el`, dragged via `handle`. `getSnaps`
   * returns the current [min, ...steps..., max] visible-height list in px
   * (recomputed per-drag so a resize/orientation change is picked up for
   * free next time the sheet is touched).
   */
  function makeDraggableSheet(el, handle, getSnaps, opts) {
    opts = opts || {};
    const backdrop = opts.backdrop || null;
    let dragging = false;
    let startY = 0;
    let startHeight = 0;
    let currentSnap = opts.initialSnap || 0;

    function setBackdrop(visible) {
      if (!backdrop) return;
      backdrop.classList.toggle('visible', visible);
    }

    function apply(snapIndex, animate) {
      const snaps = getSnaps();
      snapIndex = clamp(snapIndex, 0, snaps.length - 1);
      currentSnap = snapIndex;
      el.style.transition = animate === false ? 'none' : '';
      el.style.transform = 'translateY(calc(100% - ' + snaps[snapIndex] + 'px))';
      setBackdrop(snaps[snapIndex] > snaps[0]);
      if (opts.onSnap) opts.onSnap(snapIndex);
    }

    function heightNow() {
      const snaps = getSnaps();
      const rect = el.getBoundingClientRect();
      return clamp(window.innerHeight - rect.top, snaps[0] * 0.4, snaps[snaps.length - 1]);
    }

    function closestSnapFor(height) {
      const snaps = getSnaps();
      let best = 0;
      let bestDist = Infinity;
      snaps.forEach(function (h, i) {
        const d = Math.abs(h - height);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }

    function onPointerDown(e) {
      dragging = true;
      startY = e.clientY;
      startHeight = heightNow();
      el.style.transition = 'none';
      try { handle.setPointerCapture(e.pointerId); } catch (err) {}
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const snaps = getSnaps();
      const dy = e.clientY - startY;
      const h = clamp(startHeight - dy, snaps[0] * 0.4, snaps[snaps.length - 1]);
      el.style.transform = 'translateY(calc(100% - ' + h + 'px))';
      setBackdrop(h > snaps[0] * 1.15);
    }
    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      el.style.transition = '';
      const snaps = getSnaps();
      const h = heightNow();
      // a fast drag below the smallest snap, past its own dismiss threshold,
      // closes a transient (dismissible) sheet entirely instead of springing
      // back to the smallest snap.
      if (opts.dismissBelow != null && h < opts.dismissBelow) {
        apply(0, true);
        if (opts.onDismiss) opts.onDismiss();
        return;
      }
      apply(closestSnapFor(h), true);
    }

    handle.addEventListener('pointerdown', onPointerDown);
    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', onPointerUp);
    handle.addEventListener('pointercancel', onPointerUp);

    return {
      open: function (snapIndex) { apply(snapIndex == null ? getSnaps().length - 1 : snapIndex, true); },
      close: function () { apply(0, true); },
      snapTo: function (snapIndex) { apply(snapIndex, true); },
      current: function () { return currentSnap; },
    };
  }

  function initContentSheet() {
    const el = document.getElementById('contentSheet');
    const handle = document.getElementById('contentSheetHandle');
    const scroller = document.getElementById('contentSheetScroll');
    if (!el || !handle || !scroller) return null;

    const PEEK = 132;
    function snaps() {
      return [PEEK, Math.round(window.innerHeight * 0.55), Math.round(window.innerHeight * 0.92)];
    }

    const heroHeader = document.querySelector('.hero-header');
    const clayMenu = document.getElementById('clayMenu');
    const sheet = makeDraggableSheet(el, handle, snaps, {
      initialSnap: 0,
      // above peek, the sheet's cream background sits right behind the
      // header — force its "docked" (opaque, dark-on-light) look so the
      // wordmark stays legible instead of assuming it's over dark sky.
      onSnap: function (snapIndex) {
        const raised = snapIndex > 0;
        if (heroHeader) heroHeader.classList.toggle('docked', raised);
        if (clayMenu) clayMenu.classList.toggle('docked', raised);
      },
    });
    // starting position (no transition on first paint)
    el.style.transform = 'translateY(calc(100% - ' + PEEK + 'px))';

    return {
      openToSection: function (sectionId, snapIndex) {
        sheet.open(snapIndex == null ? 2 : snapIndex);
        const section = document.getElementById(sectionId);
        if (section) {
          // wait for the open animation's first frame so the sheet is tall
          // enough for the section's offset to land in view correctly
          requestAnimationFrame(function () {
            scroller.scrollTo({ top: section.offsetTop - 8, behavior: 'smooth' });
          });
        }
      },
      peek: function () { sheet.snapTo(0); },
    };
  }

  function initDetailSheet() {
    const el = document.getElementById('detailSheet');
    const handle = document.getElementById('detailSheetHandle');
    const content = document.getElementById('detailSheetContent');
    const backdrop = document.getElementById('sheetBackdrop');
    if (!el || !handle || !content) return null;

    function snaps() { return [0, Math.round(window.innerHeight * 0.85)]; }

    const sheet = makeDraggableSheet(el, handle, snaps, {
      initialSnap: 0,
      backdrop: backdrop,
      dismissBelow: 80,
      onDismiss: function () { content.innerHTML = ''; },
    });
    el.style.transform = 'translateY(100%)';

    if (backdrop) {
      backdrop.addEventListener('click', function () {
        sheet.close();
        content.innerHTML = '';
      });
    }

    return {
      open: function (html) {
        content.innerHTML = html;
        el.setAttribute('aria-hidden', 'false');
        sheet.open(1);
      },
      close: function () {
        sheet.close();
        content.innerHTML = '';
      },
    };
  }

  function initInfoPopSheet() {
    const infoPop = document.getElementById('infoPop');
    const handle = document.getElementById('infoPopHandle');
    if (!infoPop || !handle) return;
    let dragStartY = 0;
    let dragging = false;
    handle.addEventListener('pointerdown', function (e) {
      dragging = true;
      dragStartY = e.clientY;
      try { handle.setPointerCapture(e.pointerId); } catch (err) {}
    });
    handle.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      const dy = Math.max(0, e.clientY - dragStartY);
      infoPop.style.transition = 'none';
      infoPop.style.transform = 'translateY(' + dy + 'px)';
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      infoPop.style.transition = '';
      const dy = Math.max(0, e.clientY - dragStartY);
      infoPop.style.transform = '';
      if (dy > 60) infoPop.classList.remove('open');
    }
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
  }

  const contentSheet = isMobile() ? initContentSheet() : null;
  const detailSheet = isMobile() ? initDetailSheet() : null;
  if (isMobile()) initInfoPopSheet();

  // Global hooks consumed by page-ui.js (event card taps) and scene.js
  // (bottom scene-tabs) — both check isMobile() themselves before calling
  // these, but the functions no-op safely if a sheet failed to init.
  window.__sheets = {
    isMobile: isMobile,
    openDetail: function (html) { if (detailSheet) detailSheet.open(html); },
    closeDetail: function () { if (detailSheet) detailSheet.close(); },
    openContentSection: function (sectionId, snapIndex) {
      if (contentSheet) contentSheet.openToSection(sectionId, snapIndex);
    },
  };
})();
