# Seared Vegas — missing menu info and launch checklist

Everything below needs owner confirmation before launch. Each item lists where it lives in the code.

## Reference files not in the repo
The brief mentions menu screenshots and an Instagram screenshot, but `websiite refrences/` only contains the approved website mockup. This build uses the prices and ingredients given in the written brief. Please add the menu screenshots so the items below can be checked against them.

## Prices (`src/data/menu.ts`)
| Item | Current value | Status |
|---|---|---|
| Steak Plate | $27 | Reference price, confirm |
| Chicken Plate | $25 | Reference price, confirm |
| Shrimp Plate | $27 | Reference price, confirm |
| Salmon Plate | $26 | Reference price, confirm |
| Lamb Chop Plate | $35 | Reference price, confirm |
| Filet Mignon Plate | $35 | Reference price, confirm |
| Chicken / Steak / Shrimp Tycoon Tacos (2) | $15 each | Reference price, confirm |
| Lamb Chop / Lobster Tail Tycoon Tacos (2) | $25 each | Reference price, confirm |
| **Loaded Cajun Corn** | `null` → "Price coming soon" | **Missing.** Paid checkout is blocked for it. |
| **Surf & Turf, additional protein** | `addOnPrice: null` on every protein | **Missing.** Paid checkout is blocked for surf & turf. |
| **Surf & Turf with lobster tail as the first protein** | No lobster-tail plate on the menu | **Missing.** Is there a lobster tail plate price? |

## Surf & Turf rules (`surfTurf` and `proteins` in `src/data/menu.ts`)
- **Pricing model (assumed):** first protein's large-plate price + an add-on price for the additional protein. Please confirm or give the real structure, e.g. a flat surf & turf price.
- **Proteins offered:** steak, chicken, lamb chop, filet mignon, shrimp, salmon, lobster tail. Which ones are actually allowed?
- **Different proteins required:** currently on (`requireDifferentProteins: true`). Can someone order a double of the same protein?
- **Number of proteins:** currently exactly two. Can customers add a third?

## Ingredients and descriptions
- **Loaded Cajun Corn:** toppings are cropped in the reference, so the description just says "Full toppings list coming soon". We need the real toppings list.
- **Large plates:** the description only says protein + base. Do plates include anything else (bread, sides, garnish)?
- **Tycoon tacos:** bell peppers, red onions, Parmesan-crusted tortilla and Seared sauce come from the brief. Any other toppings?
- **Steak cut:** is the steak in plates and tacos ribeye, sirloin, or something else?

## Modifiers (`src/data/menu.ts`)
| Modifier | Current setup | Question |
|---|---|---|
| Plate base | Required. Penne / yellow rice / half & half, all included at no charge | Any upcharge for half & half? |
| Seared sauce | Regular (default) / on the side / no sauce, no charge | Is this offered? Is there extra sauce, and what does it cost? |
| Ingredient removals (no onions, etc.) | Not offered | Should customers be able to remove ingredients? |
| Special instructions | Optional, 140 characters (`ordering.allowItemNotes`) | Keep or remove? |
| Spice level | Not offered | Is there a heat level choice? |

## Other menu items
Are there drinks, desserts, other sides, combos or kids' items that were cropped out of the screenshots?

## Business details (`src/config/site.ts`)
- Address `1021 E Charleston Blvd, Las Vegas, NV`: reference only, `confirmed: false`. Is this a permanent spot or one stop on a schedule?
- Phone `(725) 500-7077`: reference only, `confirmed: false`.
- Instagram `@searedvegas`: from the brief.
- **Hours:** intentionally empty. The site sends people to Instagram and shows no open/closed status. Provide hours or a schedule source to show them.
- Turn off `site.showPendingNotices` once everything above is confirmed. That removes the "pending confirmation" tags.

## Integrations needed for real online ordering
1. **Ordering / payment provider** (Square, Toast, Clover, or Stripe). Set `ordering.mode = "live"` and `ordering.paymentProvider`, then wire `submitOrder()` in `src/lib/ordering.ts` through a server route that recomputes prices from `src/data/menu.ts`.
2. **Sales tax rate:** `ordering.taxRate` (currently `null`, shown as "Calculated at checkout").
3. **Pickup scheduling:** `ordering.pickupScheduling` (currently off; we need pickup windows or a prep-time rule).
4. **Availability / 86'd items:** each item and protein has `available`. Decide whether this is edited by hand or synced from the POS.
5. **Order notifications:** how the truck receives orders (POS tablet, SMS, email).
6. **Domain + `metadataBase`** in `src/app/layout.tsx` so social share images resolve.

## Brand assets
- **Logo:** `public/brand/seared-vegas-logo.png` is cut from the mockup at low resolution. Replace it with the original high-resolution file (same name, square, transparent PNG).
- **Food photos:** all are AI-generated stand-ins. See `assets-src/README.md` to swap in real photography.
