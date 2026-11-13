# Seared Vegas: one decor and texture system for the whole site

Every line number below was checked against the current `src/app/globals.css` (2787 lines). The regional audits cite the CSS about 8 lines too low from the hero block onward. Corrected anchors: `.hero` 811, `.counter` 898, `.hero__tray` 954, `.btn--flame` 210, `.btn--flare` 276-306, `.scorched` 423, `.embers span` 455, `.menu` 1014, `.cat-card__title::after` 1084, `.builder` 1369, `.summary` 1636, `.truck` 1749, `.site-footer` 1894, `.drawer` 2353, `.toast` 2702, reduced-motion block 2766-2787.

## What I checked in the code

- **The hero tray is shot front-on**: the lid is straight behind and symmetrical. `public/food/hero-tray.webp` is 958x925, and the 1254x1254 master is in `assets-src/food/hero-tray.png`. The `base-*` trays are shot three-quarter. So the hero counter must match the front-on camera, and any builder surface must match the three-quarter camera. One checker asset cannot serve both.
- **Two favicons ship**: `src/app/favicon.ico` is still the Create Next App default (15 KB), and `layout.tsx:24` also sets `icons` to the 512px logo. `openGraph.images` (`layout.tsx:28`) is a transparent WebP, and there is no `metadataBase`. Next's docs confirm `icon.svg`, `apple-icon.png` and `opengraph-image.jpg` + `.alt.txt` are valid file conventions.
- **The logo is heavy**: `public/brand/seared-vegas-logo.png` is 354 KB at 512px. It displays at 104px in the header and 120px in the footer.
- **There is no 404 page**: `src/app` contains only `page.tsx`, `layout.tsx`, `globals.css` and `favicon.ico`.
- **The scorched edge is a mechanical sawtooth**. It is drawn with `preserveAspectRatio="none"` (`Decor.tsx:44`). `.scorched` has a fixed 46px height, `background: var(--char)` and `overflow: hidden`, which clips the glow (`globals.css:423-445`). The modifiers it emits (`scorched--top/--bottom/--cream/--char`, `checker-strip--top/--bottom`) are not defined anywhere in the CSS.
- **The flare marks are three parallel skewed bars**, and they are hidden under 480px (`globals.css:276-306`).
- **`.btn--flame:hover` uses `filter: brightness(1.08)`** (`globals.css:218`).
- **`.hero::before` is unused**, so it is free for a new layer.
- **Stacking order**: header z 40, mobile cart z 30, toast z 60, skip-link z 100. Dialogs render in the top layer.

---

## 1. Art direction for all decor assets

Paste this block at the top of every Codex decor prompt, as `assets-src/briefs/batch-c-decor.md` → "Shared art direction".

```
SEARED VEGAS — DECOR ART DIRECTION (applies to every asset in this batch)
World: a Las Vegas Cajun food truck at night. Two materials only: (1) CHAR — soot-black griddle steel /
charred butcher paper; (2) PAPER — aged cream butcher paper. Fire is the only light source in the world.
Palette (use only these): char #120e0b, char-2 #1b1511, char-3 #261e18, cream #f6ead0, paper #f3e3c2,
paper-2 #ead4a8, ink #18110c, flame-deep #a3270c, flame #d63b17, flame-hot #f25a1f, ember #ff7a1a,
gold #f2b632, hot core #ffe2a0. No blues, greens, purples or cool greys (smoke tops may go neutral grey).
Lighting by type:
  - TEXTURE TILES: perfectly flat top-down scan, even light edge to edge, no vignette, no directional light,
    no single dominant feature, LOW contrast (detail within ±6% luminance of the mean).
  - FIRE / SPARK / SMOKE: isolated on PURE #000000, nothing else in frame, photographic, crisp fast-shutter.
  - OBJECTS: product photography, warm rim light from below-left as if from a fire, soft key upper-left,
    isolated on flat plain #d9d9d9.
  - INK MARKS: solid black ink on pure white, flat scan, no grey wash, no paper texture.
Grit level: "worn, not filthy" — believable use, never grime that reads as dirty food.
Never: text, letters, numbers, logos, watermarks, people, food, utensils, frames or borders,
grid lines, drop shadows on the background.
```

These production rules hold for the whole batch:

- **Light layers** (fire, sparks, smoke) are generated on black. In post, alpha is set to the brightest of the three colour channels and the colour is un-premultiplied, so each layer ships as WebP with real alpha and composites with normal blending. No `mix-blend-mode` is needed, which keeps animated layers cheap on the GPU. `screen` remains an optional look tweak for static layers.
- **Ink marks** become white-RGB plus alpha masks. CSS supplies the colour through `background: var(--token)` and `mask`, so colour always stays on tokens.
- **Tiles** are flat scans. They are made seamless in post, and nothing under body text may exceed ±6% luminance.
- **Objects** are cut out with rembg `isnet-general-use`, the method already set in `style-guide.md:23`.

---

## 2. Final asset table

Output folders:

- Codex sources go to `assets-src/decor/originals/<id>.png`, final masters to `assets-src/decor/<id>.png`, and metadata to `assets-src/decor/manifest-c.json`.
- Shipped files go to `public/textures/` (tiles), `public/decor/` (overlays, masks and SVGs) and `public/icons/` (the sprite).

### 2A. Codex batch C: raster textures and overlays

| # | id → public path | Size / format | Tiling | Pri | Used in |
|---|---|---|---|---|---|
| C1 | paper-tile → `textures/paper-tile.webp` (+ derived `paper-tile-mult.webp`, greyscale, mean ~#f2f2f2) | gen 1024², WebP q80 ≤140 KB, shown at 512px | both axes | **P0** | `.menu`, `.truck`, `.summary`, `.drawer`, `.customize`, `.filters`, `.btn--outline` |
| C2 | char-tile → `textures/char-tile.webp` | gen 1024², WebP q75 ≤110 KB, shown at 512px | both axes | **P0** | body, `.hero`, `.builder`, `.site-footer`, `.site-header.is-scrolled`, mobile `.site-nav`, `.step`, `.drawer__head`, `.customize__hero`, `.toast` |
| C3 | hero-flames → `decor/hero-flames.webp` (+ `hero-flames-b.webp`, P2) | gen 2400x900 → alpha WebP q75 ≤150 KB, plus a 1200w mobile copy | none | **P0** | `.hero__flames` (new) |
| C4 | fire-corner → `decor/fire-corner.webp` | gen 1600x1000 → alpha WebP ≤120 KB, plus an 800w copy | none (mirrored in CSS) | **P0** | hero, builder and footer bottom corners |
| C5 | scorch-edge → `decor/scorch-edge.webp`, `decor/scorch-edge@1x.webp` | 2400x240 and 1200x120, alpha WebP q85 ≤90 KB | repeat-x | **P0** | `.scorched` (menu, truck top; flipped for truck bottom) |
| C6 | brush set → `decor/brush/underline-1.png`, `-2`, `-3`, `rule.png` | 1200x~140 masks (rule 1600x40), PNG-8 alpha ≤20 KB each | none | **P0** | hero underline, card titles, section and footer headings, nav hover, `.menu-group__head` |
| C7 | hero-counter → `decor/hero-counter.webp` (+ `hero-counter-m.webp`) | gen 2400x900 → alpha WebP q80 ≤180 KB; mobile 1400w ≤90 KB | none | **P0** | `.counter` (replaces the CSS 3D checker) |
| C8 | spark-sprite → `decor/spark-sprite.webp` | 1024x128 (8 cells of 128²), alpha WebP ≤40 KB | sprite | P1 | `.embers span` (hero, builder, footer) |
| C9 | spark-field → `decor/spark-field.webp` | gen 2560x1600 → 1920x1200 alpha WebP ≤140 KB | none | P1 | static spark scatter at the edges of hero, builder and footer; also the reduced-motion stand-in |
| C10 | grit-tile → `textures/grit-tile.png` | 512² greyscale PNG ≤40 KB, shown at 200-256px | both axes | P1 | `.btn--flame`, `.mobile-cart__btn`, `.chip[aria-pressed=true]`, `.cat-card--gold/--red`, `.step__n`, `.drawer__count` |
| C11 | paper-stain → `textures/paper-stain.webp` | 2400x1600 greyscale WebP q70 ≤160 KB | none (cover) | P1 | `.menu::before`, `.truck::before` (multiply) |
| C12 | scorch-corner → `decor/scorch-corner.webp` | 900x700 alpha WebP ≤90 KB | none (mirrored) | P1 | `.menu__burn--l/--r` (new spans under `.scorched`) |
| C13 | tray-empty → `food/tray-empty.webp` (through the existing food pipeline) | 1024² RGBA, existing `optimize-food-images.mjs` | none | P1 | builder empty preview, cart empty state, 404 |
| C14 | smoke-wisps → `decor/smoke-wisps.webp` | 1600² → alpha WebP ≤70 KB | none | P2 | `.hero__smoke`, `.builder__head::before` |
| C15 | distress-mask → `textures/distress-mask.png` | 512² greyscale mask ≤30 KB | both axes | P2 | stamp SVGs, `.dish__badge`, `.step__n` |
| C16 | builder-surface → `decor/builder-surface.webp` | 1600x900 alpha WebP ≤140 KB | none | P2 | under `.builder__plate`. It must use the **three-quarter** camera of the `base-*` trays, not the hero's. |
| C17 | skyline → `decor/skyline.png` | 2400x400 mask ≤40 KB | repeat-x if possible | P2 | `.site-footer::after` |
| C18 | map-base → `decor/map-base.webp` | 1600x1200 WebP q80 ≤170 KB | none | P2 | `.map-card__map`, only after the address is confirmed (`config/site.ts`) |

**Codex prompts.** Prefix each one with the shared block from section 1.

**C1 paper-tile**
> Seamless tileable texture, 1024x1024, flat top-down scan of aged cream butcher paper. Warm cream base averaging #f0dfbb, subtle long paper fibres, very faint mottled tea-stain blotches in slightly darker tan (#e2c896), a sparse sprinkle of tiny dark grit specks. No folds, creases, tears, burn marks, grease rings, vignette, lighting gradient or shadows. Contrast must stay low because black display type sits on it. The edges must wrap seamlessly on all four sides.

**C2 char-tile**
> Seamless tileable texture, 1024x1024, flat top-down scan of a soot-blackened surface, halfway between seasoned cast-iron griddle steel and charred butcher paper. Near-black warm charcoal, #0f0b08 to #241a13 only, averaging #16110d. Very subtle soot mottling, faint smudges, a few hairline scuffs, rare tiny dull rust-orange scorch specks. Extremely low contrast, even lighting, no vignette, no highlights, no grill grates, no distinct spots that would visibly repeat. Edges wrap seamlessly on all four sides.

**C3 hero-flames**
> Realistic open fire flames isolated on pure solid black (#000000), crisp fast shutter. Orange, amber and yellow flames with deep red tips (#a3270c) and a hot pale core (#ffe2a0) near the base, a few small flying sparks. The flames rise from one straight horizontal line along the very bottom edge of the frame. Left to right: a tall, dense cluster of licking flames in the left third; a low, short band of small flames across the middle; a medium cluster in the right third. Every flame tip ends inside the frame against black. No logs, no grill, no wood, no smoke, no ground, no reflections. Ultra-wide 8:3, 2400x900.

For `hero-flames-b`, use the same prompt with "different flame shapes, same layout".

**C4 fire-corner**
> Fire rising from the bottom-left corner only, on pure solid black (#000000), 1600x1000. Deep red-orange flame tongues (#a3270c, #d63b17, #ff7a1a, hot core #ffe2a0 at the base), a soft orange heat haze hugging the bottom-left edge, and dozens of small streaky sparks drifting up and to the right with slight motion blur. The fire mass stays within the bottom-left 45% of the width and 55% of the height. Everything beyond the middle of the frame, and the whole top-right half, is perfectly black. No smoke columns, no objects, no ground.

**C5 scorch-edge**
> Photorealistic macro of the TOP edge of a sheet of aged cream butcher paper (#f3e3c2), torn by hand and then burnt, shot perfectly straight-on (flat, no perspective, no depth of field), on pure black. Canvas 2400x600. The paper fills the bottom ~55%. The torn, burnt edge runs horizontally across the FULL width with organic, non-repeating bites, lobes and fibre wisps; its amplitude is about 6-10% of the image height. Along the edge: a thin band of black char, then a glowing ember rim of deep orange (#ff6a10) with a few small yellow-white hot spots tracing the tear, and a faint orange glow haze bleeding up into the black above. The paper just below the edge is toasted brown and fades back to clean cream within about 10% of the height. A few tiny ember specks float above the edge. No smoke, no flames taller than a few pixels.

**C6 brush set.** Generate four separate images.

> (underline-1) A single horizontal dry-brush paint stroke in solid black on pure white, 2400x300, one fast confident swipe with a wide flat bristle brush. Thick and dense at the left start with a blunt pressed edge, rising slightly (2-4°) to the right, then thinning and breaking into dry bristle streaks and scratchy gaps at the right tail. Visible bristle texture inside the stroke, ragged edges. No splatter outside the stroke, no drips. The stroke fills about 92% of the width with margin all round.
>
> (underline-2) Same as underline-1, but shorter and flatter, with a slight upward hook at the right end.
>
> (underline-3) Same as underline-1, but thinner, with a longer, wispier tail.
>
> (rule) One long, perfectly horizontal hand-inked rule in solid black on pure white, 3200x120, drawn in one pass with a slightly dry flat marker. Mostly even thickness with subtle wobble, dry broken ends, a few bristle gaps.

**C7 hero-counter**
> Product photograph of a long, low rectangular display block covered in a black-and-cream checkerboard vinyl tablecloth (squares about 9 cm, cream #efe1c3 and near-black #15100c) pulled tight over it. The camera faces the long front face squarely and is raised about 25-30° looking down onto the top surface; symmetrical perspective, vanishing point centred. **Do not use a three-quarter view.** The top face takes about 40% of the image height and the front vertical face about 30%. Both faces are checkered, with a crisp, slightly rounded edge between them. The block's LEFT end is a clean square corner. The block continues past the RIGHT edge of the frame. The cloth is subtly real: faint creases, a slight grease sheen, a little soot speckle near the front edge, cream squares warm and aged. Warm orange rim light from below-left and behind, as if from a fire. The top surface glows softly where a food container will sit, centre-right, and the front face is darker. Isolated on flat plain #d9d9d9. Nothing on the block. 2400x900.

**C8 spark-sprite**
> Sprite sheet on pure solid black (#000000), 1024x128: exactly one row of 8 equal 128x128 cells. Each cell holds ONE isolated spark, centred and at least 14px from the cell edges. In order: (1) a tiny white-hot round spark; (2) a soft round orange ember with a halo; (3) a thin vertical spark streak, bright head at the top, fading tail below; (4) a longer thin streak, slightly tilted; (5) an irregular flake of glowing ash with a darker edge; (6) two sparks close together; (7) a dim cooling deep-red ember; (8) a small forked crackling spark. Colour ramp: #ffe2a0 core, then #ff7a1a, then #a3270c falloff. No grid lines.

**C9 spark-field**
> Floating fire sparks and glowing embers on pure solid black (#000000), 2560x1600. Hundreds of tiny orange, amber and yellow-white sparks: sharp pinpoints, short curved motion-blurred streaks drifting upward and slightly sideways, and 3-4 larger soft out-of-focus bokeh embers. Density is highest along the far left and far right edges and in the bottom corners. The central 50% of the frame is almost empty black. No flames, no smoke.

**C10 grit-tile**
> Seamless tileable greyscale texture, 512x512: worn screen-print ink on card stock. Mostly white (values between 70% and 100%, never solid black), with evenly scattered small irregular grey speckles, fine hairline scuffs and a few small worn patches. High frequency only: no large shapes, gradients, vignette or clusters. Tiles seamlessly on all four edges.

**C11 paper-stain**
> A flat, evenly lit image used as a MULTIPLY overlay, 2400x1600: mostly pure white, with soft warm-sepia aged-paper effects (#c9a676 to #a87a45). A gentle darker toasted border along all four edges, strongest at the top-left and top-right corners; three or four very faint irregular tea-stain clouds in the middle third; a few long pale fibre streaks. The centre stays nearly white. No tears, fold lines, hard edges, rings or objects.

**C12 scorch-corner**
> Straight-on, evenly lit view of the TOP-LEFT corner of a sheet of aged cream paper (#f3e3c2) on pure black, 1800x1400. The corner is burnt: an irregular charred black edge with a thin glowing ember rim (#ff6a10 with small yellow-white hot spots) runs along the top and turns down the left side for about a third of the height. Toasted brown scorching fades inward. Two small round charred burn holes with glowing rims sit near the corner, and a few ember specks float just outside the edge. No smoke, no flames.

**C13 tray-empty.** This goes into the food pipeline using `style-guide.md` conventions. It is a container-only shot, so nothing gets regenerated.

> Follow assets-src/briefs/style-guide.md exactly. Asset id tray-empty: the identical open matte-black hinged foam clamshell used in base-penne / base-rice / base-half-half, with the identical three-quarter camera, scale and canvas position on a 1024x1024 transparent canvas. Keep the black-and-cream checkerboard paper liner tucked in, with its checker edges peeking over the rim and slightly crumpled, but the container is completely EMPTY: no food, no sauce, no crumbs. Lid open and standing behind. Use assets-src/food/base-penne.png as the composition reference.

Then overlay-check that the outline matches `base-penne` within about 2% bbox.

**C14 smoke-wisps**
> Thin, delicate wisps of rising smoke on pure solid black (#000000), 1600x1600. Soft translucent curls start narrow at the bottom centre, drift upward, fan out and fade completely before every edge (the outer 40px is pure black). The lower smoke is lit warm orange from a fire below; the upper smoke is pale neutral grey. No fire, no objects.

**C15 distress-mask**
> Seamless tileable texture, 512x512, black and white only: a white field with scattered black speckles, tiny ink voids, fine dry-brush scratches and worn rubber-stamp patchiness, about 10% black coverage, evenly distributed, no clusters, no recognisable shapes. Tiles seamlessly on all four edges.

**C16 builder-surface**
> A black and cream checkerboard tablecloth (squares #15100c and #efe1c3, about 12x8 visible) lying flat, photographed from an elevated three-quarter angle about 35-40° above the surface, looking toward the front-left corner. This must match the camera of assets-src/food/base-penne.png. Warm key light from the upper left, very slight fabric texture, one soft wrinkle near the front. The back edge and both sides fade softly into a smoky, burnt vignette. Isolated on flat #d9d9d9; the vignette is kept as partial alpha in post. Nothing on the cloth. 1600x900.

**C17 skyline**
> Flat solid-black silhouette on pure white, 2400x400, very wide panorama of a generic Las Vegas-style skyline: one tall slender observation tower with a pod near the top, clustered resort towers with curved and stepped rooflines, two palm trees, and low desert ridges behind. Flat bottom edge across the full width. No windows, lights, signs or logos.

**C18 map-base**
> Top-down illustrated street map in vintage risograph style, 1600x1200, with absolutely no text, letters, numbers, icons, pins or compass. Cream paper (#efe0bf), city blocks in tan (#e2cfa4) with thin ink-brown outlines (#5b4532), a minor street grid in cream, two vertical avenues, and one bold horizontal boulevard at about 53% from the top drawn as a thick near-black road (#1a1410) with a dashed gold centre line (#f2b632). Flat orthographic view, slightly imperfect ink registration.

**Cut from the audits, and why:**

- **hero-backdrop plate.** Its look is rebuilt from C2, C4, C9 and the existing radials, which saves about 260 KB on the LCP path and makes the hero use the same layers as the builder and footer.
- **food-truck illustration.** On "Find the Truck", an AI truck that is not the owner's truck misleads customers. Ask the owner for a photo instead.
- **headline-wear mask.** The mockup headline is clean, and the mask would hurt legibility.
- **tape strip and grease stain.** They are gimmicky, not in the mockup, and the grease would sit near prices.
- **Codex logo redraw and Codex favicon.** Both risk changing the letterforms. Ask the owner for the vector logo instead.
- **separate card-grunge and stamp-ink tiles.** Merged into C10 and C15.
- **ember-bokeh-static.** Merged into C4 and C9.
- **spark-burst sprite.** The burst is rebuilt from C8 frames with CSS.

### 2B. Hand-built SVG

| id → path | Spec | Pri | Used in |
|---|---|---|---|
| flare-burst → `decor/flare-burst.svg` | viewBox `0 0 48 40`, three filled tapered rays, right-hand orientation (thick inner end at the left). Paths: `M4 9.5L42 1.2 42.6 3 4.8 14.5Z M3 17.5L46 19.4V20.8L3 22.5Z M4.8 25.5L42.6 37 42 38.8 4 30.5Z`, plus `stroke-width=.8 stroke-linejoin=round`, `fill=#000` for mask use. ≤600 B. | **P0** | `SlashMarks` (`Decor.tsx:62-68`, rendered inline with the same paths) and `.btn--flare::before/::after` (as a mask). One family for both. |
| icon sprite → `icons/sprite.svg` + `src/components/Icon.tsx`; standalone `icons/check.svg`, `icons/arrow-down.svg` for CSS masks | 24² grid, stroke `currentColor` 2.25, round caps. Arrows lean -8° to echo the italic type. Set: cart, close, plus, minus, check, arrow-right, arrow-left, arrow-down, pin, clock, phone, camera (a generic Instagram glyph), trash, undo, alert, flame, wave, steer, drizzle, cup, no-sauce. ≤6 KB in total. | **P0** | replaces the glyph text in `Header.tsx:86-94`, `Hero.tsx:23` (→), `.link-arrow::after` (`globals.css:319`, ↓), `CartDrawer.tsx:51,234,292`, `Toast.tsx:50,68`, `Dialog.tsx:104,108`, `MenuSection.tsx:62,140`, `FindTruck.tsx:19-44,93`, `Footer.tsx:30-37`, `.tile.is-checked::after` (1561) |
| favicon mark → `src/app/icon.svg` | 64² viewBox: a #120e0b disc, a 2px #f2b632 ring, a three-tongue flame (gradient #a3270c → #f25a1f → #f2b632), and a cream "SV" in Barlow Condensed 900 italic converted to paths with a 1px char outline. | **P0** | browser tab |
| badge-burst → `decor/badge-burst.svg` | 48², a 14-point irregular starburst mask. ≤800 B. | P1 | `.step__n` (1492) |
| check-brush → `decor/check-brush.svg` | 24², a tapered brush check plus a rough ring, one path. ≤500 B. | P1 | `.tile.is-checked::after` (1561) |
| stamps → `decor/stamp-sold-out.svg`, `stamp-picked.svg`, `stamp-order-up.svg` | double-ruled rough frame, words as outlined display-font paths, `fill=#000` mask. ≤4 KB each. | P2 | `.dish--unavailable .dish__tray::after`, `.tile.is-disabled .tile__thumb::after`, `.summary__stamp` |
| price-ticket → `decor/price-ticket.svg` | 140x56 mask with small half-circle notches and a perforation line. | P2 | `.dish__price` (1260); not on `.is-pending` (1267) |
| map-pin | inline in `FindTruck.tsx:81-86`, 48x64, flame gradient with an ink stroke and a cream disc holding the sprite `#flame` | P2 | `.map-card__pin` |
| nav-divider | inline data-URI, 4x30, a slanted tapered cream tick | P2 | `.site-nav li + li::before` (648), plus a new divider between the logo and Menu |

### 2C. Generated by script (Pillow or sharp, not Codex)

| id → path | Spec | Pri |
|---|---|---|
| grain → `textures/grain-256.png` | 256² RGBA, alpha-only Gaussian noise (σ≈0.35, 0.4px blur) plus about 0.3% 2px dust specks. Perfectly periodic; AI noise always shows its repeat. ≤25 KB. | **P0** |
| logo re-exports → `brand/seared-vegas-logo-256.webp`, `-512.webp` | from the existing PNG; ≤30 KB and ≤70 KB. The header and footer currently load the 354 KB PNG. | **P0** |
| favicon.ico (16/32/48) + `src/app/apple-icon.png` (180, logo at 86% on solid #120e0b) | rendered by sharp from `icon.svg` and the logo. Delete the default `favicon.ico` and `metadata.icons`. | **P0** |
| OG card → `src/app/opengraph-image.jpg` (+ `.alt.txt`), and the same for `twitter-image` | 1200x630 JPG q82 ≤300 KB. Composite of char-tile, fire-corner on both sides, the hero-counter strip at the bottom, hero-tray at the right 58%, the logo top-left, and "BIG FLAVOR. / VEGAS HEAT." as SVG text converted to paths (HEAT in #ff5a1c) with brush underline-1 in flame-hot. Safe area 1080x560. | **P0** |
| hero-tray re-export | from the 1254² master to `public/food/hero-tray.webp` at full resolution (currently 958px rendered up to 680 CSS px) | P1 |
| tray-mask → `decor/tray-mask.svg` | potrace of the `base-penne` alpha, one path, ≤3 KB | P1 |
| scorch-edge-v → `decor/scorch-edge-v.webp` | C5 rotated 90°, derived in post | P2 |
| manifest icons (192, 512, maskable 512 at 76% on #120e0b) | sharp | P2 |
| hero-tray LQIP (`blurDataURL`, 24px) | sharp, written into `src/data/food-images.ts` | P2 |

### 2D. CSS only (no files)

| id | Change | Pri |
|---|---|---|
| checker-band | Use one `--checker` size token everywhere: 11px squares in a 22px strip with a 2px #0b0806 rule above and below and a soft shadow; 8px squares under 640px. Merge the copies in `.checker-strip` (414-420), the drawer head, customize and summary. Define `--top` / `--bottom`. | **P0** |
| button states | Remove `filter: brightness` (218) because it flattens the grit. Hover: translateY(-1px) plus a 3px rgba(255,122,26,.25) ring. Shorten the 4px ledge (215) to 2-3px. Add an inset top highlight. Add `.btn--nav` (upright, radius 5px). `.btn--outline:hover` (233) becomes cream with a 4px ink ledge instead of #fff. | P1 |
| nav-hover-brush | `.site-nav a:not(.btn)::after` masked with brush/underline-2, drawn on with clip-path; also used for `[aria-current]` | P1 |
| summary-ticket | square top corners, zig-zag bottom mask on an inner wrapper, `drop-shadow` filter, dotted price leaders, `tabular-nums` | P1 |
| chips | 40px tall, min-width 7.5rem, upright text, ink ledge on hover, burnt fill plus grit when active | P1 |
| skeleton tokens | `--sk-a` / `--sk-b` per surface: cream #e3cfa6/#f3e6cb, dark #2a211a/#3b2f25 | P1 |
| tile-price-tag | clip-path notch on `.tile__meta`, plus a `--muted` variant | P2 |

---

## 3. Integration notes, by component

**Global layer stack for every dark band (hero, builder, footer):** `var(--char)` → char-tile → existing radial glows → fire-corner (left, plus a mirrored right) → spark-field → `<Embers>` sprites → content (z 1+) → global grain.

**Global (`globals.css` 51-68)**
- `body { background: var(--char) url(/textures/char-tile.webp) 0 0/512px; }`
- `body::before { content:""; position:fixed; inset:0; z-index:90; pointer-events:none; background:url(/textures/grain-256.png) 0 0/256px; opacity:.07 }`. It sits above the toast (60) and below the skip-link (100). Use opacity only, with no blend mode, because a fixed full-screen blend layer forces a repaint on every scroll frame.
- Dialogs live in the top layer, so `.drawer::after` and `.customize::after` each repeat the grain with `position:absolute` and `isolation:isolate`.
- Add `::selection{background:var(--flame);color:#fff6e6}`.
- Add `.drawer, .customize, .summary {color-scheme:light; scrollbar-color:var(--ink-soft) transparent}` to fix the dark scrollbars that `:root` (39) causes on paper.
- Add `html{scrollbar-gutter:stable}`.

**Header (`Header.tsx`; 578-680)**
- `.site-header.is-scrolled` (584): `background: rgba(18,14,11,.9) url(/textures/char-tile.webp) 0 0/512px`, plus a 6px mini checker band in `::after`.
- `.site-header__logo img`: use the 256 WebP. Add a ring and glow: `box-shadow:0 0 0 3px #0b0806, 0 0 28px 4px rgba(255,90,20,.28)`. Size it 128px at 1200px and up.
- Nav hover: brush mask as described in 2D.
- `ORDER ONLINE` gets `.btn--nav`.
- Mobile `.site-nav` (625): char-tile background, a scorched or checker bottom edge, and a transform/opacity slide-in instead of `display` toggling.

**Hero (`Hero.tsx`; 811-1010)**
- `.hero` (816-820): `background: radial-gradient(60% 55% at 72% 55%, rgba(255,110,30,.22), transparent 70%), url(/textures/char-tile.webp) 0 0/512px, var(--char)`. Drop the two corner radials (818-819); C4 replaces them.
- `.hero::before`: spark-field, `center/cover`, opacity .85, hidden under 640px.
- New `.hero__fire--l` and `.hero__fire--r` (or a single `.hero__fire` with `::before`/`::after`): fire-corner at bottom-left, and mirrored at bottom-right with `scaleX(-1)`.
- `.hero::after` vignette (822-829): make it a sides and top inset only, so the checker strip below does not sit under a black band.
- New `<div class="hero__flames">` placed after `.counter` and before `.hero__glow`: `left:-4%; right:-10vw; bottom:28%; height:46%; background:url(/decor/hero-flames.webp) center bottom/100% 100% no-repeat; mask-image:linear-gradient(0deg,#000 55%,transparent)`. Under 900px: 36% height, opacity .75. Optional P2 flicker: cross-fade to `-b` with an opacity animation only.
- `.counter` (898-943): replace the two divs with `<img class="counter__img" src=/decor/hero-counter.webp alt="" aria-hidden>`. Set `perspective:none; height:auto; left:-2%; right:-18vw`, and give the img `drop-shadow(0 30px 40px rgba(0,0,0,.7))`. Keep the old conic rules only as a fallback. Mobile (998-1010) uses `hero-counter-m.webp` with `object-position:left`.
- `.hero__tray` (954-961): remove `rotate:-3deg`. Retune `margin-bottom: 11%` so the base lands on the counter's lit top. Add a warm rim light: `drop-shadow(-10px -4px 22px rgba(255,100,30,.28))`. Allow up to `min(100%,760px)` once the tray is re-exported.
- `.tray-shadow--hero` (965): a tight dark contact ellipse.
- `.brush-underline` (871): change the `<svg>` in `Hero.tsx:17-19` to a `<span>`. Style: `aspect-ratio:10/1; width:min(92%,460px); background:linear-gradient(90deg,var(--flame-hot),var(--flame) 70%,var(--flame-deep)); mask:url(/decor/brush/underline-1.png) left/100% 100% no-repeat; margin:.15em 0 1.25rem .2rem`. Draw it on with a clip-path animation.
- Under 900px, preload only the tray and the counter. The flames and sparks load at low fetch priority.

**Menu (`MenuSection.tsx`; 1014-1290)**
- `.menu` (1018-1020): `radial-gradient(160% 120% at 50% 50%, transparent 50%, rgba(150,95,30,.18) 85%, rgba(110,60,15,.35) 100%), url(/textures/paper-tile.webp) 0 0/512px, var(--paper)`. Drop the white centre glow (1019).
- `.menu::before`: paper-stain with multiply at .6.
- `.scorched` (423-445): render a `div` with no SVG. `height:clamp(56px,7vw,110px); background:url(/decor/scorch-edge.webp) 0 0/auto 100% repeat-x; overflow:visible; z-index:2`. Remove `background:var(--char)` and `overflow:hidden`. The strip's lower 20% is transparent, so the section's own paper tile shows through. This is what makes the edge seamless. Add `.scorched--bottom{transform:scaleY(-1)}`, then remove the unused `tone` prop or define it.
- `.menu__burn--l/--r` (P1): scorch-corner at `top:0`, `width:clamp(180px,26vw,420px)`, mirrored on the right, hidden under 480px.
- `.slash-marks` (160-175): inline flare-burst paths. On mobile, replace the hidden marks with a short brush underline instead of nothing.
- `.cat-card--gold/--red` (1054-1064): `::before` with grit-tile at `600px→256px`. Multiply at .35 on gold, soft-light at .5 on red. Add inset edge darkening.
- `.cat-card__title::after` (1084): `mask:url(/decor/brush/underline-{1,2,3}.png)`, cycling with `:nth-child`. Background `var(--burnt)`, or `var(--gold)` on red cards (1095).
- `.filters` (1108): paper-tile with the same 512 size plus a bottom shadow. Misalignment while sticky is invisible at ±6% tile contrast.
- `.chip` (1124) and `.chip[aria-pressed=true]` (1146): as described in 2D.
- `.menu-group__head` (1171): replace `border-bottom` with an `::after` masked by `brush/rule.png`.
- `.dish__badge` (1226): distress mask, rotated -2deg (P2).
- `.dish__price` (1260): ticket mask (P2).

**Builder (`SurfTurfBuilder.tsx`; 1369-1730)**
- `.builder` (1369): char-tile under the existing glows. Remove the two corner radials once fire-corner is in place (both corners; footer opacity .6).
- `.btn--flare` (276-306): flare-burst mask, `width:44px; height:34px; background:var(--flame-hot)`, with `scaleX(-1)` on the left copy. Remove the skew. On hover, move each flare 3px outward. Show at 28px under 480px instead of `display:none`.
- `.step` (1469): `linear-gradient(rgba(38,30,24,.82),rgba(27,21,17,.9)), url(char-tile) 0 0/384px`.
- `.step__n` (1492): badge-burst mask with grit; flame-hot when the step is complete.
- `.tile.is-checked::after` (1561): check-brush mask with a pop-in.
- `.tile__kind--surf` (1627): drop the off-palette blue. Use a cream outline with the wave icon.
- Empty preview (`SurfTurfBuilder.tsx:125`): `tray-empty` instead of a dimmed `base-half-half`, plus a "Pick a base" caption.
- `.summary` (1636): `paper-tile-mult` with multiply on `--paper-card`, and the ticket treatment.

**Find the Truck and footer (1749-1990)**
- `.truck` (1749): same paper layers as `.menu`.
- Add `<ScorchedEdge flip />` at the end of `FindTruck`, so the truck-to-footer seam matches every other paper/char boundary.
- `.map-card__map` (1828): restyle the existing SVG with ink roads on the paper tile and grain. Use C18 only once the address is final. Add "Map not to scale".
- Truck facts and footer contact: sprite icons in `var(--flame)`.
- `.site-footer` (1894): char-tile plus fire-corner at .6. Skyline is P2.
- `.site-footer__h` (1921): a 60px flame brush underline (underline-3).
- Footer links: min-height 44px.

**Small UI**
- `.food-img.is-loading::before` (537): the tray-mask shimmer using the skeleton tokens. Remove "PHOTO SOON" (`FoodImage.tsx:57`).
- `.cart-empty__tray` (2525): `tray-empty` at 180px, rotated -4deg.
- `.drawer` (2353): paper-tile-mult. Optional P2 vertical scorch edge.
- `.drawer__head` (2363), `.customize__hero` (2039) and `.toast` (2702): char-tile.
- Toast: variant icons, plus pause-on-hover and focus for the Undo action (WCAG 2.2.1).
- Count bump on `.cart-btn__count` and `.mobile-cart__count`: 6 spans using C8 frames, 0.5s, colour flash only under reduced motion.

**Reduced motion (2766-2787)**
- `.embers span{display:none}`, and show the static spark-field at .85. This replaces the current frozen band of dots at 2777-2782.
- Disable flame flicker, smoke drift, brush draw-on and the count burst. The flames rest at full opacity.
- Pause the embers while a modal is open: `html.has-modal .embers span{animation-play-state:paused}`. Also pause them offscreen with an IntersectionObserver.

---

## 4. Post-processing pipeline

This needs a new script, `scripts/build-decor.py` (Pillow + numpy; rembg for C7, C13 and C16; potrace for the tray mask), plus a sharp step in `scripts/optimize-decor.mjs` that mirrors `optimize-food-images.mjs`.

1. **Archive.** Copy every raw Codex output to `assets-src/decor/originals/`, and log `{id, file, prompt, notes}` to `manifest-c.json`.
2. **Tiles (C1, C2, C10, C15).**
   - Roll the image by W/2 and H/2, heal the cross seam with a 96px feathered blend from an un-rolled copy, then roll back.
   - Normalise: C1 mean RGB within ±6 of (240,223,187) and luminance std ≤8; C2 mean ≈#16110d, min ≥#0b0806, max ≤#2a2119; C10 mean ≈#ededed with no pixel under 60%.
   - **Check:** render a 3x3 preview to `assets-src/decor/previews/`, and confirm no visible seam and no obviously repeating blotch.
   - Derive `paper-tile-mult` from C1: desaturate and level to a mean of #f2f2f2.
3. **Light layers (C3, C4, C8, C9, C14).**
   - Crush the black floor with levels so values ≤6 become 0.
   - Set alpha to the brightest channel with gamma 0.8, then un-premultiply the colour.
   - **Check:** the top-right quadrant of C4 has alpha 0. C14 has alpha 0 within 40px of every edge. Every C8 cell border has alpha 0. Drop connected specks under 3px.
4. **Ink masks (C6, C15, C17).**
   - Convert to greyscale, apply levels (white→0, black→255), and use the result as alpha with pure white RGB.
   - Drop connected components under 40px, trim to the bbox plus 8px, then resize: brushes 1200w, rule 1600x40.
   - **Check:** the corners have alpha 0.
5. **Mixed-alpha edges (C5, C12).**
   - Crop C5 to 2400x240 centred on the tear.
   - Make it horizontally seamless with a 160px wrap cross-fade.
   - Pixels within ΔE 10 of the paper base get alpha 0. Toast pixels get partial alpha by distance from the paper colour. Char and ember pixels are opaque. The black above the tear is recoloured to exactly #120e0b at alpha 255.
   - **Check:** the top row is fully opaque, the bottom 20% is fully transparent, and a 3x tiling preview shows no seam.
   - C12: alpha 0 in the bottom-right 40%.
   - Rotate C5 to produce `scorch-edge-v`.
6. **Cut-outs (C7, C13, C16).**
   - Run rembg `isnet-general-use`, then defringe the alpha edge with a 1px erode and colour decontamination.
   - C7: keep the counter running off the right edge. **Check** that the left corner is square and crisp.
   - C13: add the id to `IDS` in `scripts/optimize-food-images.mjs:18`.
7. **Export.**
   - sharp → WebP (alpha where needed). Tiles q75-80; overlays q75 with `alphaQuality 80`. Masks are PNG-8 via pngquant (64 colours is enough for alpha).
   - Make `@1x` and mobile copies at about 50% width for C3, C4, C5, C7 and C9.
   - Skip AVIF at this stage. Every texture is a CSS `background`/`mask`, and `image-set()` with AVIF/WebP fallbacks doubles the CSS surface for about a 15% gain.
8. **Size budget (fail the script when exceeded).**

| Group | Budget |
|---|---|
| Global, loaded on every page: grain 25 + char-tile 110 + paper-tile 140 + icons 6 + logo-256 30 | ≤ 320 KB |
| Hero first paint, beyond the tray: counter 180 + flames 150 + fire-corner 120 (shared) | ≤ 450 KB desktop / ≤ 220 KB mobile |
| Below the fold, lazy (paper-stain, spark-field, scorch-edge, scorch-corner, sprite, grit, brushes) | ≤ 600 KB |
| Whole decor system | ≤ 1.4 MB, each file within its table budget |

9. **Visual QA.** Screenshot the stack at 375, 768, 1280 and 1920 px in both light and dark tokens. Check:
   - the cream/char seams at hero→menu, menu→builder, builder→truck and truck→footer;
   - that the counter top meets the tray base;
   - text contrast on the tiles (≥4.5:1 for body copy, measured at the darkest tile pixel).

---

## 5. Non-asset gaps against the mockup, ranked

1. **The tray and counter are on different planes.** `rotateX(58deg)` with an off-centre perspective origin (`globals.css:904-916`), plus `rotate:-3deg` on the tray (960), against a front-on tray photo. Fix with C7, remove the rotation, and retune `margin-bottom` (958). Re-export the tray from the 1254 master and let it bleed off the right edge, as in the mockup.
2. **Seams.**
   - The `.scorched` modifiers and `.checker-strip--top/--bottom` are missing from the CSS (`Decor.tsx:43`, `MenuSection.tsx:35`, `FindTruck.tsx:7`).
   - The hero vignette darkens the strip (828).
   - Truck→footer has no burnt edge (`Footer.tsx:9`).
   - The `.scorched` band on the truck uses flat `var(--char)` (426) and so does not match the builder's glow corners.
3. **Menu order and type.**
   - In the mockup the filter pills sit directly under "WHAT ARE YOU CRAVING?" and above the cards. In code the cards come first (`MenuSection.tsx:47-87`).
   - The heading is upright in the mockup, but `.section-title` forces italic (143). Add `.menu .section-title{font-style:normal}` at 1030, and check it fits on one line between 1024 and 1200px.
   - The chips are smaller in the mockup, equal-width, and have no count badges.
4. **Hero headline.**
   - letter-spacing -0.02em and line-height 0.84 (853-854).
   - A softer shadow instead of the hard `0 4px 0` (857).
   - "HEAT." without the neon halo (869).
   - The underline should run under the whole VEGAS HEAT. line, sitting tight to the baseline.
   - Make the eyebrow (`Hero.tsx:10`) less prominent, and shrink the lede to about 1.05rem at 70% opacity.
5. **Buttons.**
   - `.btn` forces italic and a 10px radius (180-192). The mockup's ORDER ONLINE and ADD TO ORDER + are upright with square-ish corners.
   - Make the CTA labels uniform: "ADD TO ORDER +" (`menu.ts:187-195`).
   - `.btn:disabled` uses grayscale (254), which turns the flame colour muddy.
6. **Category cards.** The mockup has a ~2px outline, a soft shadow, a 12-14px radius and darker inset edges; the code uses a 3px border, a 6px hard offset shadow and `--radius` 18px (1043-1064). The trays should break out further: about 45% above the card and overhanging both sides.
7. **Header.** The logo should be about 128px, overlapping the hero. Add a divider between the logo and Menu, and use equal padding around every divider; the 1rem button margin makes the spacing asymmetric.
8. **Favicon, OG and social.** Delete the default `favicon.ico` and `metadata.icons` (`layout.tsx:24`). Add `metadataBase`, since the production URL is still needed and unknown. Remove `openGraph.images` (28) so the file convention wins. Add `twitter: {card:'summary_large_image'}`.
9. **Empty, loading and error states.**
   - The builder preview implies food is already chosen (`SurfTurfBuilder.tsx:125` with `.is-dim`).
   - The empty cart shows "PHOTO SOON" (`CartDrawer.tsx:69` → `FoodImage.tsx:57`).
   - The skeleton is invisible on dark tiles.
   - **There is no `src/app/not-found.tsx`.** Add one: a char band with `tray-empty`, the heading "THIS PAGE GOT 86'D." in the display italic, and a flame CTA back to the menu. No new asset is needed.
10. **Mobile.**
    - There is no sticky running total in the builder; check that it doesn't collide with the `MobileCartBar` padding.
    - The nav panel cannot animate because it toggles `display`.
    - The flares are hidden under 480px.
    - The header badge shows a "·" before hydration (`Header.tsx:67`).
    - Use `tabular-nums` on all prices.
11. **Footer.**
    - It has no sign-off moment. Add a large "BIG FLAVOR. VEGAS HEAT." echo in the display type.
    - It loads the 354 KB logo for a 120px display.
    - Its links are 40px tall, under the 44px target used elsewhere.
12. **Toast and dialogs.**
    - The toast always shows a ✓, even for "removed".
    - Auto-hide is a fixed 6s with no pause, which fails WCAG for the Undo action.
    - Dialogs open with an animation but close instantly. Add `@starting-style` and `transition-behavior: allow-discrete` exit transitions.
    - The backdrop is flat. A faint ember radial would tie it into the fire world.
13. **Performance and motion.** 44 ember animations (hero 18, builder 16, footer 10) run offscreen and behind open modals. Halve the count under 640px. Reduced motion needs a designed still image (C9), not frozen dots.
14. **Do not add a custom cursor or animated grain.** Both hurt usability on an ordering flow, and the hover lift, icon nudge and count burst already give the site its personality.

Key files:
- `C:\Users\Theo\Desktop\Projects\sered\src\app\globals.css`
- `C:\Users\Theo\Desktop\Projects\sered\src\components\Decor.tsx`
- `C:\Users\Theo\Desktop\Projects\sered\src\app\layout.tsx`
- `C:\Users\Theo\Desktop\Projects\sered\assets-src\briefs\style-guide.md`
- `C:\Users\Theo\Desktop\Projects\sered\scripts\optimize-food-images.mjs`

New brief to write: `C:\Users\Theo\Desktop\Projects\sered\assets-src\briefs\batch-c-decor.md`