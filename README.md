# Seared Vegas — online ordering site

A responsive one-page ordering site for Seared Vegas, a Las Vegas Cajun food truck, built with Next.js 16 and React 19.

**Status:** demo ordering. Customers can build an order, but checkout is a clearly labeled demo. No payment is taken and nothing is sent to the truck until an ordering provider is connected. See [MISSING_MENU_INFO.md](MISSING_MENU_INFO.md) for everything needed before launch.

## Run it
```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Where things live
| What | File |
|---|---|
| Menu items, prices, modifiers, availability, surf & turf options | `src/data/menu.ts` |
| Address, phone, Instagram, hours, ordering switches (tax, pickup, demo mode) | `src/config/site.ts` |
| Price math, validation, totals | `src/lib/pricing.ts` |
| Cart store (saved to localStorage, synced across tabs) | `src/lib/cart.tsx` |
| Ordering/payment integration point | `src/lib/ordering.ts` |
| Page sections | `src/components/` (Header, Hero, MenuSection, SurfTurfBuilder, FindTruck, Footer) |
| Ordering UI | `src/components/` (CustomizeDialog, CartDrawer, MobileCartBar, Toast) |
| Styles and design tokens | `src/app/globals.css` |
| Food image sources and replacement guide | `assets-src/README.md` |

## Ordering features
- Item customization with required options (plate base), defaults (Seared sauce), quantity, and an optional note
- Surf & turf builder: base, protein, additional protein, sauce, and quantity, with a live tray preview and price breakdown
- Cart: edit, change quantity, remove with undo, and identical items merged into one line. It survives reloads and syncs across tabs.
- Items without a confirmed price show "Price coming soon" and block checkout until a price is set
- Unavailable items (`available: false`) can't be added, and are flagged if already in a saved cart
- Mobile "View Your Order" bar, bottom-sheet customizer, and a full-height cart drawer
- Keyboard-accessible native `<dialog>` modals, visible focus, and reduced-motion support

## Note on CSS hot reload
With the Tailwind Turbopack loader in `next.config.ts`, edits to `globals.css` may not hot-reload in `next dev`. Restart the dev server after CSS changes. JS/TSX changes reload normally.
