# Food and brand asset sources

All food images are **temporary, AI-generated stand-ins** (made with Codex image generation) until real photography is ready. Each is an open black takeout tray (or a protein on its own) on a transparent background, shot at the same three-quarter angle, so the site can layer it over cards.

```
assets-src/
  briefs/            prompts + style guide given to Codex (style-guide.md, batch-a.md, batch-b.md) and its logs
  food/<id>.png      transparent master PNGs (1254×1254) — the files to replace
  food/originals/    raw generations before background removal
  food/manifest-*.json  prompt used for each image
  brand/             logo cut from the approved mockup
public/food/<id>.webp   optimized web copies (generated — don't edit)
src/data/food-images.ts sizes for the web copies (generated — don't edit)
```

## Asset checklist
| Id | Used for | Status |
|---|---|---|
| hero-tray | Hero: lamb chops, lobster tail, Cajun penne, grilled lemon | ✅ generated |
| plate-steak | Steak Plate, "Loaded Plates" category card | ✅ |
| plate-chicken | Chicken Plate | ✅ |
| plate-shrimp | Shrimp Plate | ✅ |
| plate-salmon | Salmon Plate | ✅ |
| plate-lamb-chop | Lamb Chop Plate | ✅ |
| plate-filet-mignon | Filet Mignon Plate | ✅ |
| taco-chicken | Chicken Tycoon Tacos | ✅ |
| taco-steak | Steak Tycoon Tacos | ✅ |
| taco-shrimp | Shrimp Tycoon Tacos, "Tycoon Tacos" category card | ✅ |
| taco-lamb-chop | Lamb Chop Tycoon Tacos | ✅ |
| taco-lobster-tail | Lobster Tail Tycoon Tacos | ✅ |
| corn-loaded-cajun | Loaded Cajun Corn, "Cajun Corn" category card | ✅ |
| base-penne / base-rice / base-half-half | Surf & turf builder base trays | ✅ |
| protein-steak … protein-lobster-tail (7) | Builder protein cutouts layered on the base tray | ✅ |
| Logo | Header, footer, favicon | ⚠️ low-res crop from the mockup; needs the original file |

## Replacing an image with real photography
1. Shoot or edit the dish to match: open black clamshell, lid up behind, elevated three-quarter view, whole container in frame.
2. Remove the background so it's a transparent PNG, and save it over `assets-src/food/<id>.png` with the same id.
3. Run `node scripts/optimize-food-images.mjs`. It crops to the food, writes `public/food/<id>.webp`, and updates `src/data/food-images.ts`.

To add a new dish: add its id to `IDS` in the script, run it, then point the menu item's `image` at that id in `src/data/menu.ts`.

## Replacing the logo
Save the original high-resolution logo as a square transparent PNG at `public/brand/seared-vegas-logo.png`. No code changes needed.
