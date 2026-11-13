# Seared Vegas: Hormozi Conversion Audit

**Score: 35/100 (Rebuild the first screen first).** Raw score: 33 of the 95 points I could measure. The biggest leak is proof. The truck has strangers on Instagram calling the food "10/10" and "the best lamb chops in Vegas," and the site shows none of it. It also has AI-generated food, a footer that says "Food photos are representative," and a checkout that can't take an order yet.

- **Page goal assumed:** an online pickup order. The fallback goals are a call or text, or directions to the truck.
- **Capture:** a full browser capture of the local dev build (`localhost:3005`), 390×844 phone and 1440 desktop, plus @searedvegas on Instagram (bio and 12 recent reels, with transcripts).
- **Who it's for:** a client site before launch.

---

## Fix these first

### 1. Put the Instagram video reviews on the first scroll (proof: 0.5/8 → ~7/8)

**What's wrong.** The site has no reviews at all, no star ratings and no customer names. The only proof is the `@searedvegas` link in "Find the Truck" and the footer, and that link sends the visitor off-site. Meanwhile Instagram has:

| Reel | Creator | Likes / comments | What they say (paraphrased) |
|---|---|---|---|
| `instagram.com/reel/De-d3KdIF6M` | @iamsemiyajanea ("Taylor") | 703 / 17 | Found the truck on TikTok. Ordered nearly the whole menu. Says *everything* was a 10 out of 10, the lamb chop taco surprised her, the customer service was "top tier," and the corn ribs are a must. |
| `instagram.com/reel/DYPfyIsOvrK` | @frewena (**verified**) | 228 / 17 | Caption is five stars and "Perfection!" Says they have the best lamb chops in Vegas. |
| `instagram.com/reel/DfTbkUuB8ZE` | @tcreezylasvegas | 135 / 12 | A 2.5-minute visit: lobster tail tacos, says the "food phenomenal," staff were welcoming, and the menu is easy to order from. |
| `instagram.com/reel/DYBWufOSB16` | @thatc0mpt0nf00die | **4,657 / 154** | A staff interview at the truck that states the hours and address. It's the biggest reach of anything posted. |

**The exact change.**
1. **Hero proof line**, right under the subheadline and above the button:
   `★★★★★ "Everything was a 10 out of 10." — Taylor, @iamsemiyajanea`
2. **New "Vegas Says" reel strip** directly under the hero, before "What are you craving?" It holds 3–4 vertical video cards, each with:
   - a muted autoplay loop of 6–8 s (the bite and the reaction)
   - the creator's handle, the like count and a one-line pull quote
   - tap to play the full clip with sound in a dialog
   - Heading: **"Don't take our word for it."** Sub: **"Real Vegas foodies. Real lamb chops. Unpaid opinions."** (Keep "unpaid" only if it's true. Ask the owner.)
3. **Badges on menu items** where the reviews point: "Reviewers' #1 pick" on Lamb Chop Tacos and the Lamb Chop Plate, and "Called a must-have" on the Cajun corn.

**Why it works.** In the value equation, *perceived likelihood* is the multiplier the page is missing. A verified creator saying "best lamb chops in Vegas" is worth more than any headline you could write. Hormozi's rule is that proof sits close to the CTA, so the strip goes before the menu, not after it.

**How to do it properly:**
- **Ask each creator for permission and the raw file** with a DM. Don't screen-record their reels. Credit them by handle and link back.
- **Self-host the clips** as compressed MP4s (720p, about 1–2 MB each, `preload="none"` with a poster image). Don't use Instagram's `embed.js`, which adds roughly 1 MB of third-party script per embed and loads slowly on phones.

### 2. Rewrite the first screen around what Vegas already calls them (headline: 3/10 → 8/10)

**What's wrong.** The H1 "BIG FLAVOR. VEGAS HEAT." is a slogan. It promises no outcome and could belong to any hot-sauce brand. The truck's real positioning is already in its Instagram bio, *"The Lamb Chop Truck of Las Vegas"* and *"Home of the Tycoon Cajun Tacos,"* and every reviewer repeats it.

**The exact change** (`src/components/Hero.tsx`):

```
Eyebrow:  LAS VEGAS CAJUN FOOD TRUCK · 1021 E CHARLESTON
H1:       The Lamb Chop Truck of Las Vegas.
Sub:      Lamb chop & lobster tail Tycoon Cajun tacos, loaded Cajun plates and corn ribs.
          Order ahead, skip the line, pick up hot.
Proof:    ★★★★★ "Everything was a 10 out of 10." — @iamsemiyajanea
Status:   ● Open today 1–10 PM   [owner to confirm hours]
CTA:      Order Ahead for Pickup →        (secondary: "Call or text (725) 500-7077")
```

**Why it works.** Hormozi's first job for a headline is to stop the scroll and promise a clear outcome. "The Lamb Chop Truck of Las Vegas" is specific, it already has social traction, and it names the hero item. The status line answers the first question a food-truck visitor has, which is "are they open right now?", without sending them to Instagram.

### 3. Fix the dead-end order flow before launch (next-step friction: 2/10 → 8/10)

**What's wrong.** "Start Your Order" leads into a menu, a customize dialog and a cart, and then checkout shows a "Demo checkout" banner. The order cannot be placed (`ordering.mode: "demo"` in `src/config/site.ts`, and `submitOrder` throws). Tap-to-call isn't on the first screen at all. It's about 10 screens down in "Find the Truck."

**The exact change.**
- **Best:** connect the payment provider the truck already uses at the window (most trucks use Square, which has hosted checkout links) through `src/lib/ordering.ts` and `src/app/api/orders/route.ts`.
- **If that can't happen before launch:** change the primary CTA to **"Call or Text Your Order"**. Use `sms:+17255007077` and `tel:` buttons, since the Instagram bio literally says "Text/call." Keep the menu as a browse-and-decide tool. Never ship a checkout that silently fails.
- **Either way:** add a sticky mobile bar with **Call · Text · Directions** next to the cart bar.

**Why it works.** Speed to lead: a hungry person's need peaks the moment they decide. A dead-end checkout loses that order, and that customer probably won't come back to try again.

---

## Trust killers (cheap and costing orders right now)

1. **"Pending owner confirmation" tags on the address and phone,** plus the footer line "Prices, address and phone are pending owner confirmation." **The Instagram bio already confirms both** (📍1021 E Charleston Blvd, 📲 (725) 500-7077). In `src/config/site.ts`, set `location.confirmed` and `phone.confirmed` to `true`. Only the prices still need the owner.
2. **"Food photos are representative" and AI-generated food.** All 23 food images are generated (`assets-src/briefs/batch-a.md`, `batch-b.md`). The Instagram grid is full of real trays on the real checker liner. Swap at least the hero and the five taco and plate photos for real ones, then delete the disclaimer.
3. **The menu doesn't match what reviewers ordered.** The site says "Cajun Corn: Corn on the cob." Two reviewers and the truck's own sign (visible in a reel thumbnail) say **corn ribs**. Reels also mention **regular street tacos** and **Kool-Aid**, and neither is on the site. Have the owner confirm, then update `src/data/menu.ts`.
4. **"Check @searedvegas on Instagram before you head over."** This sends visitors off the site to find the hours. A staff member says on camera (May 2026 reel) that they're there **Monday–Saturday, 1–10 PM**, and "always here." Confirm with the owner, then set `site.hours` and say it plainly.
5. **The site offers "Call" only, but the bio says "Text/call."** Add an `sms:` link, because people in line at a tire shop text.
6. **There's no privacy policy link.** You'll need one as soon as checkout collects a name, phone or card.

---

## Scorecard

| # | Area | Score | What we saw |
|---|---|---|---|
| 1 | Headline | 3/10 | "BIG FLAVOR. VEGAS HEAT." A slogan with no outcome or audience. |
| 2 | Subheadline | 2.5/5 | "Tycoon Cajun tacos, loaded plates, and surf & turf from Seared Vegas." It says *what*, but gives no why-believe, how-fast or where. |
| 3 | Hero image | 2/5 | An AI-rendered tray, partly cut off at the bottom of the first screen. It looks polished but isn't their food. Real photos exist on Instagram. |
| 4 | CTA | 7/10 | "START YOUR ORDER →" is visible on the first screen, with a quieter "Explore the menu" link. There's one clear action, but the label doesn't say what you get (pickup, no line). |
| 5 | Next-step friction | 2/10 | The checkout is a demo and can't complete an order. No tap-to-call or text on the first screen (the only `tel:` link is about 10 screens down). |
| 6 | Objections | 2/8 | Prices are shown ("From $15.00"). "When are you open?" gets "Posted on Instagram." Nothing on wait or ready time, or where to park ("next to the tire shop," per a reviewer). |
| 7 | Proof | 0.5/8 | No reviews, ratings or names on the site. The only proof is an Instagram handle. |
| 8 | Focus and length | 6/9 | 14.9 phone screens and 737 words. That's justified by a real menu with one goal (order). It loses points for the second CTA cluster and the "pending" notes. |
| 9 | Value equation | 2.5/10 | Outcome is half-named (the food, not the experience) for 1.5. Likelihood 0 (no proof). Speed 0 (no ready time). Effort 1 ("order online for pickup" appears only in the footer). |
| 10 | Offer enhancers | 1/10 | "Tycoon Cajun Tacos" and "Build Your Surf & Turf" are named offers, for 1 point. No scarcity, urgency, bonus or guarantee. |
| 11 | Avatar | 2.5/5 | "Las Vegas Cajun food truck" names the city but not the person or situation (lunch near downtown, late-night after work, out-of-towners). |
| 12 | Mobile speed | not measured | It's a dev build on localhost (2.1 MB, 52 requests, 1.06 MB of images). Run pagespeed.web.dev on the production URL. |
| 13 | Speed to lead | 2/5 | A `tel:` link exists, but it's buried. No SMS, no open-now status, no ready time. |
| | **Total** | **33 / 95 → 35/100** | Even full marks on speed would only reach 38, so the grade doesn't change. |

---

## Headline rewrites (split test these)

1. **The Lamb Chop Truck of Las Vegas.** *Lamb chop & lobster tail Tycoon tacos on E Charleston. Order ahead, pick up hot.* (This is their own positioning, and reviewers repeat it.)
2. **Lobster Tail Tacos & Lamb Chops, Hot When You Pull Up.** *Order ahead from the truck on E Charleston. Ready in [X] minutes.* (Speed. [X] comes from the owner.)
3. **Vegas Foodies Call It 10/10. Taste Why Tonight.** *Tycoon Cajun tacos, lamb chop plates and Cajun corn ribs. Open till 10 PM [confirm].* (Proof-led.)

**MAGIC name for the builder section:** "Build Your Plate" → **"The Tycoon Surf & Turf: Your Plate, Two Proteins, Ready in [X] Min."**

---

## 4-week split test plan

| Week | Element | A | B | Metric |
|---|---|---|---|---|
| 1 | Headline | "Big Flavor. Vegas Heat." | "The Lamb Chop Truck of Las Vegas." | Order starts plus call/text taps per visitor |
| 2 | Hero image | AI tray render | Real photo or a 6 s muted loop from a review reel | Same |
| 3 | Proof placement | Reel strip under the hero | One autoplay review clip *inside* the hero, beside the headline | Same, plus scroll to menu |
| 4 | CTA label | "Start Your Order" | "Order Ahead, Skip the Line" (only once ordering is live) | Completed orders per visitor |

The truck probably gets low web traffic. Run each test until both versions have a few hundred visitors, and treat early results as a hint, not a verdict. Most of the traffic will come from the Instagram bio link, so put the site URL in the bio first.

---

## Keep

- **The visual identity.** The checker liner, flame orange and condensed display type match the real truck and the Instagram grid.
- **Prices on every card.** "From $15.00" on the first category card answers the price question early.
- **The Surf & Turf builder.** It's a genuinely differentiated, named offer. Give it a stronger name and a ready time, but don't cut it.
- **Accessibility work** (skip link, labelled dialogs, alt text). Don't let redesigns break it.

---

## The fix plan (in order)

**Phase 0: launch blockers (½ day)**
1. In `src/config/site.ts`, set address and phone to confirmed (the Instagram bio verifies them). Set `hours` once the owner confirms Mon–Sat 1–10 PM. Add `sms: "+17255007077"`.
2. Ordering: either connect Square (or whatever they use) in `src/lib/ordering.ts`, or switch the CTAs to Call/Text for launch.
3. Menu check with the owner: corn ribs vs. corn on the cob, street tacos, Kool-Aid, final prices (`src/data/menu.ts`).

**Phase 1: first screen (½ day)**
4. Rewrite `Hero.tsx`: new H1 and subheadline, a ★ proof line, an open-today status, and a secondary Call/Text action.
5. Add a sticky mobile Call · Text · Directions bar, built into `MobileCartBar.tsx`.

**Phase 2: video proof (1 day, after permissions)**
6. DM @iamsemiyajanea, @frewena, @tcreezylasvegas and @thatc0mpt0nf00die for permission and raw files.
7. Compress the clips (ffmpeg, 720p, about 1.5 MB, plus a 6–8 s silent loop and a poster frame) into `public/reviews/`, with the data in `src/data/reviews.ts`.
8. Build `ReviewReels.tsx` and place it between `<Hero />` and `<MenuSection />` in `src/app/page.tsx`. Add the reviewer badges on the lamb chop and corn cards.

**Phase 3: real photos (as photos arrive)**
9. Replace `hero-tray` and the plate and taco images with real shots from the truck. Remove "Food photos are representative" and the price-pending notice once prices are confirmed.

**Phase 4: offer and objections (½ day)**
10. Add a short "Before you pull up" strip: **Where:** 1021 E Charleston, same lot as the tire shop. **When:** Mon–Sat 1–10 PM. **How long:** ready in [X] min if you order ahead. **Parking:** [owner].
11. Add real scarcity only if it's true, such as "Lobster tails until they sell out." No discounts.
12. Add LocalBusiness `openingHours` and `aggregateRating` (only from a real review source) to the JSON-LD in `layout.tsx`.

**Phase 5: measure**
13. Put the site link in the Instagram bio. Track order starts, call, text and directions taps. Run the 4-week test plan above.
