# Seared Vegas — food asset style guide (shared by every generation batch)

Reference mockup: `websiite refrences/landinpagestryle direcctiion.png` (look at it first: the hero tray and the three category trays are the target look).

## Every asset
- Photorealistic, warm, appetizing food photography. Warm key light from upper left, soft fill, gentle specular highlights on sauces. Rich but natural color.
- Camera: consistent elevated three-quarter view (about 35–40° above the table, looking down at the front-left corner of the container). Same angle across the whole set.
- Container (when the asset has one): an open, matte-black hinged foam/plastic takeout clamshell. The lid is open and standing up behind the base, hinge at the back. Clean, symmetrical, not warped, no extra lids, no text or logos on it.
- Black-and-cream checkerboard paper liner tucked into the container where noted, with the checker edges peeking over the rim.
- The ENTIRE container (including the open lid) must be inside the frame with clear margin on all sides. Nothing cropped.
- Transparent background (PNG with alpha). No table, no counter, no backdrop, no cast shadow on a floor — the website adds shadows. A faint contact shadow directly under the container is NOT wanted either; keep the alpha clean.
- Square canvas, 1024×1024 (or the tool's largest square), container centered, filling roughly 80% of the width.
- No text, letters, labels, watermarks or logos anywhere. No flames, smoke columns or food on fire. No utensils, no hands, no garnish piles outside the container.
- Realistic portions for a food truck plate. No duplicated/merged/malformed ingredients (count the tacos, count the chops).

## Ingredient facts (from the owner's menu)
- Tycoon Cajun Tacos: each order is TWO tacos. Parmesan-crusted tortilla (golden, crispy cheese crust visible on the tortilla edge), sautéed bell peppers (red/green/yellow strips), red onions, the protein, finished with a creamy orange-pink "Seared" signature sauce drizzle and a little chopped cilantro/parsley.
- Large plates: protein served over a base. Bases: Cajun Alfredo penne (creamy, orange-flecked Cajun cream sauce, parsley) / seasoned yellow rice / half pasta + half rice.
- Loaded Cajun corn: corn on the cob (2–3 cobs or cob halves), grilled with char marks, slathered with Cajun butter/crema, grated parmesan/cotija, Cajun seasoning dust, sauce drizzle, chopped parsley.

## Output
- Save the final transparent PNG to `assets-src/food/<id>.png` (exact ids listed in your batch).
- If the image tool cannot output real transparency, generate on a perfectly flat, plain light-grey (#d9d9d9) studio background and then remove the background yourself (e.g. `pip install "rembg[cpu]"` and run it with the `isnet-general-use` or `u2net` model, or another reliable method) so the saved PNG has real alpha. Keep the un-cut original as `assets-src/food/originals/<id>.png`.
- Verify each saved PNG with Python/Pillow: mode RGBA, corners fully transparent, container not clipped by the canvas edge (alpha bbox has margin on all sides). Regenerate anything that fails or looks wrong (wrong protein, malformed container, cropped lid, text artifacts, three tacos, etc.).
- Append one entry per asset to `assets-src/food/manifest-<batch>.json`: `{ "id", "file", "prompt", "notes" }`.

## Decor and textures
Non-food assets (paper, char, flames, sparks, brush strokes, burnt edges, the hero counter) follow `assets-src/briefs/decor-style-guide.md`. The full asset system and where each file is used is in `assets-src/briefs/decor-system.md`.
