# Batch C1 — paper, char, grit, brush strokes, burnt paper edges

Read `assets-src/briefs/decor-style-guide.md` and look at the mockup image `websiite refrences/landinpagestryle direcctiion.png` before generating anything. Follow the output rules in the style guide exactly. Manifest: `assets-src/decor/manifest-c1.json`.

Generate these assets (ids are the file names under `assets-src/decor/originals/`):

1. `paper-tile` (square) — Tileable texture: flat top-down scan of aged cream butcher paper. Warm cream base averaging #f0dfbb, subtle long paper fibres, very faint mottled tea-stain blotches in slightly darker tan (#e2c896), a sparse sprinkle of tiny dark grit specks. No folds, creases, tears, burn marks, grease rings, vignette, lighting gradient or shadows. Contrast must stay LOW because black display type sits on it. Uniform all over — no feature that would be noticed when the image repeats.

2. `char-tile` (square) — Tileable texture: flat top-down scan of a soot-blackened surface, halfway between seasoned cast-iron griddle steel and charred butcher paper. Near-black warm charcoal, #0f0b08 to #241a13 only, averaging #16110d. Very subtle soot mottling, faint smudges, a few hairline scuffs, rare tiny dull rust-orange scorch specks. Extremely low contrast, even lighting, no vignette, no highlights, no grill grates, no distinct spots that would visibly repeat.

3. `grit-tile` (square) — Tileable greyscale texture: worn screen-print ink on card stock. Mostly white (values between 70% and 100%, never solid black), with evenly scattered small irregular grey speckles, fine hairline scuffs and a few small worn patches. High frequency only: no large shapes, gradients, vignette or clusters.

4. `paper-stain` (landscape) — A flat, evenly lit image used later as a MULTIPLY overlay: mostly pure white, with soft warm-sepia aged-paper effects (#c9a676 to #a87a45). A gentle darker toasted border along all four edges, strongest at the top-left and top-right corners; three or four very faint irregular tea-stain clouds in the middle third; a few long pale fibre streaks. The centre stays nearly white. No tears, fold lines, hard edges, rings or objects.

5. `brush-underline-1` (landscape) — A single horizontal dry-brush paint stroke in solid black on pure white, one fast confident swipe with a wide flat bristle brush. Thick and dense at the left start with a blunt pressed edge, rising slightly (2–4°) to the right, then thinning and breaking into dry bristle streaks and scratchy gaps at the right tail. Visible bristle texture inside the stroke, ragged edges. No splatter outside the stroke, no drips. The stroke is long and thin (about 10:1), vertically centred, filling about 90% of the width with clear white margin all round. Only ONE stroke in the image.

6. `brush-underline-2` (landscape) — Same as `brush-underline-1`, but shorter and flatter, with a slight upward hook at the right end. A clearly different stroke, not a copy.

7. `brush-underline-3` (landscape) — Same as `brush-underline-1`, but thinner, with a longer, wispier tail. A clearly different stroke, not a copy.

8. `brush-rule` (landscape) — One long, perfectly horizontal hand-inked rule in solid black on pure white, drawn in one pass with a slightly dry flat marker. Thin (about 40:1), mostly even thickness with subtle wobble, dry broken ends, a few bristle gaps. Vertically centred, spanning about 94% of the width. Only ONE line in the image.

9. `scorch-edge` (landscape) — Photorealistic macro of the TOP edge of a sheet of aged cream butcher paper (#f3e3c2), torn by hand and then burnt, shot perfectly straight-on (flat, no perspective, no depth of field), on pure black #000000. The paper fills the bottom ~50% of the frame and runs off the left, right and bottom edges. The torn, burnt edge runs horizontally across the FULL width at a roughly constant height, with organic, non-repeating bites, lobes and fibre wisps; its amplitude is about 6–10% of the image height. Along the edge: a thin band of black char, then a glowing ember rim of deep orange (#ff6a10) with a few small yellow-white hot spots tracing the tear, and a faint orange glow haze bleeding up into the black above. The paper just below the edge is toasted brown and fades back to clean, plain, flat cream within about 12% of the image height. A few tiny ember specks float above the edge. No smoke, no flames taller than a few pixels. The left and right ends of the edge should be at about the same height so the strip can repeat.

10. `scorch-corner` (landscape) — Straight-on, evenly lit view of the TOP-LEFT corner of a sheet of aged cream paper (#f3e3c2) on pure black #000000. The paper fills the frame except for a black margin along the top and left. The corner is burnt: an irregular charred black edge with a thin glowing ember rim (#ff6a10 with small yellow-white hot spots) runs along the top edge and turns down the left side for about a third of the height. Toasted brown scorching fades inward to clean flat cream. Two small round charred burn holes with glowing rims sit near the corner, and a few ember specks float just outside the edge. The bottom-right half of the image is plain, clean, flat cream paper. No smoke, no flames.

Write `assets-src/decor/manifest-c1.json`. When finished, print a short summary listing every file and any asset you could not get right.
