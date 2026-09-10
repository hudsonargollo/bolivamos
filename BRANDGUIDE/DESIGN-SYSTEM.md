# BoliVibes Design System

Source of truth for the **sun-mark identity (Brand Guide v1.0)** as it's actually
implemented in code today — `packages/design-tokens` (web + mobile tokens) and
`apps/web/app/admin/admin.css` (the internal tool's own "clay" component
kit). Written to be pasted into Claude Design or used as a reference doc when
generating BoliVibes UI, marketing assets, or the 3D sun mark.

> Older files under `BRANDGUIDE/tokens/` (Bebas Neue / Inter, `#1E1E1E`
> charcoal) are a superseded draft — do not use them. This document reflects
> what's actually shipped.

---

## 1. Brand essence

BoliVibes is a **local-discovery / nightlife-and-events app** for Bolivia.
The visual identity is a warm, sun-baked "clay" aesthetic — soft-shadowed,
rounded, high-roughness matte surfaces (like unglazed terracotta), built
around one mark: a radiating **sun** rising over a city plaza. Tone is warm
and energetic, not corporate; typography is bold/condensed for headlines,
clean and legible for body copy.

---

## 2. Logo — the sun mark

The mark is a ring (the horizon/plaza) with 12 trapezoidal rays radiating
outward, alternating through four brand colors clockwise:
`red → yellow → sage → orange` (repeating 3×, 30° apart).

**Flat SVG source** (`BRANDGUIDE/assets/sun-mark.svg`, viewBox `-120 -120 240 240`):

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-120 -120 240 240" width="240" height="240">
  <g>
    <!-- 12 rays, 30° apart, trapezoid from r=58 to r=108, half-width 9→16 -->
    <path d="M -9 -58 L 9 -58 L 16 -108 L -16 -108 Z" fill="#c04a2f" transform="rotate(0)"/>
    <path d="M -9 -58 L 9 -58 L 16 -108 L -16 -108 Z" fill="#e3a52f" transform="rotate(30)"/>
    <path d="M -9 -58 L 9 -58 L 16 -108 L -16 -108 Z" fill="#8ba672" transform="rotate(60)"/>
    <path d="M -9 -58 L 9 -58 L 16 -108 L -16 -108 Z" fill="#e2792f" transform="rotate(90)"/>
    <path d="M -9 -58 L 9 -58 L 16 -108 L -16 -108 Z" fill="#e3a52f" transform="rotate(120)"/>
    <path d="M -9 -58 L 9 -58 L 16 -108 L -16 -108 Z" fill="#c04a2f" transform="rotate(150)"/>
    <path d="M -9 -58 L 9 -58 L 16 -108 L -16 -108 Z" fill="#8ba672" transform="rotate(180)"/>
    <path d="M -9 -58 L 9 -58 L 16 -108 L -16 -108 Z" fill="#e3a52f" transform="rotate(210)"/>
    <path d="M -9 -58 L 9 -58 L 16 -108 L -16 -108 Z" fill="#c04a2f" transform="rotate(240)"/>
    <path d="M -9 -58 L 9 -58 L 16 -108 L -16 -108 Z" fill="#e2792f" transform="rotate(270)"/>
    <path d="M -9 -58 L 9 -58 L 16 -108 L -16 -108 Z" fill="#8ba672" transform="rotate(300)"/>
    <path d="M -9 -58 L 9 -58 L 16 -108 L -16 -108 Z" fill="#e3a52f" transform="rotate(330)"/>
    <!-- ring: r=44, stroke-width=14, charcoal -->
    <circle r="44" fill="none" stroke="#33302c" stroke-width="14"/>
  </g>
</svg>
```

Other flat exports live in `BRANDGUIDE/assets/`: `logo-full.svg` /
`logo-full-dark.svg` (wordmark + mark), `app-icon.svg`, `favicon.svg`.

### 3D version (the "bolivibes-sunrise" scene)

The mark also exists as a **live, animated 3D object** — a `<three-d-stage>`
web component (three.js) rendering the sun mark rising through a clipped
ground plane, embedded on the public homepage hero and the mobile sign-in
screen (`apps/web/app/embed/hero`, `apps/web/public/bolivibes/scene.js`).
Use this recipe when generating it as a Claude Design **3D object** artifact:

- **Material style — "clay"**: every mesh is `MeshStandardMaterial` with
  `roughness: 0.93, metalness: 0` (matte, unglazed-terracotta look, no
  reflections). Named per-part: `clay-red`, `clay-orange`, `clay-yellow`,
  `clay-green` (uses `boliSage` `#8ba672` for the mark's green ray, not
  `boliGreen`), `clay-charcoal` for the ring.
- **Construction**: ring = extruded annulus (`ExtrudeGeometry` on a
  `Shape`+hole `Path`), outer radius `51 × 0.45`, inner radius `37 × 0.45`,
  depth `4`, bevel `0.6`. 12 rays = extruded trapezoids (same path as the
  flat SVG, scaled ×0.45), depth `3.2`, bevel `0.5`, rotated `-i × 30°`
  (three.js rotates counter-clockwise, so the sign is flipped vs. the SVG's
  clockwise `rotate()`).
- **Ground reveal**: `renderer.localClippingEnabled = true` with a single
  clip plane `Plane(Vector3(0,1,0), 0.05)` applied to every sun-mark
  material — the mark is invisible below the plaza and rises up through it
  (used for a "sunrise" reveal animation), sitting in front of a low
  terracotta/sand/cream clay-city diorama.
- **Group name**: `bolivibes_sunrise` → `sun_mark` → `sun_ring` +
  `sun_rays` (children `ray_0`…`ray_11`).
- Full working source: `apps/web/public/bolivibes/scene.js` (materials +
  city + rays + animation loop) built on top of the generic
  `apps/web/public/bolivibes/three-d-stage.js` viewer/exporter shell.

---

## 3. Color palette

Canonical values — `packages/design-tokens/src/tokens.ts` is the single
source of truth; the Tailwind preset (web) and NativeWind preset (mobile)
are both generated from it.

| Token | Hex | Role |
|---|---|---|
| `boli-red` | `#C04A2F` | Headlines, primary button, sun ray (×3) |
| `boli-orange` | `#E2792F` | "VAMOS", highlight tags, sun ray (×2) |
| `boli-yellow` | `#E3A52F` | "Free" tag, sun ray (×4) |
| `boli-green` | `#2F5D3E` | Secondary actions, links, footer |
| `boli-sage` | `#8BA672` | Soft fills, sun ray (×3, *not* boli-green) |
| `bg-off-white` | `#F4EEE2` | Page background (cream) |
| `paper` | `#FDFAF3` | Cards / surfaces |
| `charcoal-dark` | `#33302C` | Ink — text, headlines, primary buttons, sun ring |
| `muted-clay-gray` | `#5B564F` | Secondary text |
| `white` | `#FFFFFF` | Pure neutral |
| `black` | `#000000` | Pure neutral |

**Note — the sun ray's "green" is `boli-sage` (`#8BA672`), not `boli-green`
(`#2F5D3E`).** They read very differently; don't substitute one for the
other when reproducing the mark.

---

## 4. Typography

Two systems are live in the codebase — use the one matching what you're
designing:

**App token system** (`packages/design-tokens` — mobile app, public
homepage content): 
- Display: **Anton** (fallback `Impact, sans-serif`) — headlines, uppercase, wide tracking
- Body: **Archivo** (fallback `Helvetica, Arial, sans-serif`)

**Admin dashboard chrome** (`apps/web/app/admin/admin.css` — internal tool
only, self-hosted woff2s):
- Headings (`h1`/`h2`/fieldset titles): **Caprasimo** (fallback `Georgia, serif`)
- Wordmark: **Archivo Black**
- Body/UI/labels: **Figtree** 600/700

Type scale (both systems share this, in px): `xs 12 · sm 14 · md 16 · lg 20 · xl 28 · 2xl 40 · 3xl 56`

Headline convention: uppercase, wide letter-spacing (`tracking-wide` /
`letter-spacing: 0.01em`).

---

## 5. Spacing, radius, shadow

```
space   1:4px  2:8px  3:12px  4:16px  5:24px  6:32px  7:48px  8:64px   (4px base grid)
radius  sm:4px  md:8px  lg:16px  pill:999px
shadow  sm: 0 1px 2px rgba(51,48,44,.10)
        md: 0 4px 12px rgba(51,48,44,.12)
```

Admin surfaces use a heavier "lifted card" shadow instead:
`0 1px 0 rgba(255,255,255,.6) inset, 0 6px 18px rgba(60,40,15,.08)`.

---

## 6. Components

### Clay buttons (`.clay-btn`)

The signature interactive element — a pill button with a gradient fill,
an inset highlight/shadow rim, and a hard drop shadow that "presses down"
on click (translateY + shadow collapse). Base variant is orange:

```css
.clay-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-weight: 700; font-size: 14px; letter-spacing: 0.3px;
  color: #F7F1E4; /* cream text */
  background: linear-gradient(#D0824A 0%, #C4703D 45%, #B4633A 100%);
  border: none; border-radius: 999px; padding: 10px 22px; cursor: pointer;
  box-shadow:
    inset 0 2px 0 rgba(255,246,230,.35),
    inset 0 -2px 0 rgba(74,36,12,.25),
    0 3px 0 #8E4A20,
    0 6px 10px rgba(60,35,15,.22);
}
.clay-btn:hover   { background: linear-gradient(#C4763F 0%, #B56435 45%, #A55932 100%); }
.clay-btn:active  { transform: translateY(3px);
  box-shadow: inset 0 2px 0 rgba(255,246,230,.3), inset 0 -2px 0 rgba(74,36,12,.28), 0 1px 0 #8E4A20; }
```

Color variants (same recipe, different gradient stops + shadow color):
- `.clay-sage` — sage green (`#97B17E → #7A8A5E → #6F8955`, shadow `#55613F`)
- `.clay-charcoal` — dark ink (`#4A443C → #3A352F → #322D27`, shadow `#1C1A17`)
- `.clay-danger` — red (`#D1684A → #B8492E → #9C3C25`, shadow `#6E2415`)
- `.clay-btn-sm` — compact size, single-layer shadow

### Cards (`.a-card`)
Rounded 18px, cream `#FBF4E6` surface, soft lifted shadow (see §5).

### Badges (`.a-badge`)
Small pill, 11px bold uppercase-ish label, solid fill — `charcoal` / `orange`
/ `sage` variants, cream text.

### Filter pills (`.a-filter-pill`)
Pill button, cream surface + 1px border by default; `.active` state fills
solid orange with cream text, border removed. Optional trailing `.count`
badge at 70% opacity.

### Tables (`.a-table`)
18px-rounded wrapper, header row uses the hover-surface tint, row hover
tints orange at 6% opacity, `.a-row-pending` highlights at 9%.

### Form fields (`.a-input` / `.a-select` / `.a-textarea`)
White fill, 1px `rgba(122,106,82,.18)` border, 12px radius, orange 2px
focus ring offset 1px. Fields grouped into `.a-fieldset` blocks separated
by a top border, each with a Caprasimo-set `.a-fieldset-title`.

---

## 7. Usage notes

- **Matte, not glossy.** Every 3D/clay surface uses high roughness (~0.93)
  and zero metalness — avoid reflective/glassy materials anywhere in the
  brand.
- **Rounded everywhere.** Buttons and pills are fully rounded (999px);
  cards/inputs use 8–18px radii. No sharp corners in UI chrome.
- **One accent per surface.** Buttons/badges commit to a single color
  variant (orange/sage/charcoal/danger) rather than mixing brand colors
  within one component.
- **Pressed state matters.** Interactive clay elements should always have a
  visible "pressed" state (translateY + shadow collapse) — it's core to the
  tactile feel, not optional polish.
- Don't reuse the stale `BRANDGUIDE/tokens/` values (Bebas Neue/Inter,
  `#1E1E1E`) — superseded by this doc.
