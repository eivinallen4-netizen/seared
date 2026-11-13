# Seared Vegas — decor & texture style guide (shared by every decor batch)

Reference mockup: `websiite refrences/landinpagestryle direcctiion.png`. Look at it first: the scorched dark background, the flames and sparks at the edges, the checkered counter block under the hero tray, the torn burnt paper edge glowing orange, the aged cream paper, the dry-brush underlines. Those materials are what this batch produces. The food trays already exist; do NOT generate food.

## Art direction (applies to every asset)
World: a Las Vegas Cajun food truck at night. Two materials only: (1) CHAR — soot-black griddle steel / charred butcher paper; (2) PAPER — aged cream butcher paper. Fire is the only light source in the world.

Palette (use only these): char #120e0b, char-2 #1b1511, char-3 #261e18, cream #f6ead0, paper #f3e3c2, paper-2 #ead4a8, ink #18110c, flame-deep #a3270c, flame #d63b17, flame-hot #f25a1f, ember #ff7a1a, gold #f2b632, hot core #ffe2a0. No blues, greens, purples or cool greys.

Lighting by asset type:
- TEXTURE TILES: perfectly flat top-down scan, even light edge to edge, no vignette, no directional light, no single dominant feature, LOW contrast.
- FIRE / SPARKS: isolated on PURE #000000 black, nothing else in frame, photographic, crisp fast shutter. The black must be true black right to the canvas edges (it is converted to transparency later).
- OBJECTS: product photography, warm rim light from below-left as if from a fire, soft key from upper-left, isolated on a perfectly flat plain light-grey #d9d9d9 background.
- INK MARKS: solid black ink on pure white, flat scan, no grey wash, no paper texture.

Grit level: "worn, not filthy" — believable use, never grime that reads as dirty food.

Never: text, letters, numbers, logos, watermarks, people, hands, food, utensils, frames or borders, grid lines, drop shadows on the background.

## Output rules
- Use your built-in image generation tool. Generate at the tool's largest size for the requested orientation (square / landscape / portrait). Exact pixel sizes do not matter; a later script crops, makes tiles seamless and converts black or white backgrounds to transparency. Do NOT try to do that post-processing yourself unless the asset says so.
- Save the untouched generation to `assets-src/decor/originals/<id>.png` (exact ids in your batch).
- Look at every image after generating it. Regenerate when it breaks a rule: any text or logo, a background that is not the flat colour asked for, the subject cropped where the brief says it must not be, wrong camera angle, visible frame/border, or an obviously unusable composition. Up to three attempts per asset; keep the best and say so in the manifest notes.
- Do not edit any code in this repository. Only write files under `assets-src/`.
- Append one entry per asset to the manifest named in your batch: `{ "id", "file", "prompt", "size", "notes" }`.
- When finished, print a short summary listing every file and any asset you could not get right.
