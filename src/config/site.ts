/**
 * Business + ordering configuration.
 *
 * Every value marked `confirmed: false` (or listed in MISSING_MENU_INFO.md) is a
 * reference value taken from the supplied screenshots / brief and must be
 * confirmed by the owner before launch.
 */

export const site = {
  name: "Seared Vegas",
  tagline: "Las Vegas Cajun food truck",

  location: {
    // Reference location from the brief — OWNER TO CONFIRM.
    street: "1021 E Charleston Blvd",
    city: "Las Vegas",
    region: "NV",
    confirmed: false,
    /** Food trucks move: keep this copy generic until a schedule source exists. */
    scheduleNote:
      "Truck location and hours can change. Check @searedvegas on Instagram before you head over.",
  },

  phone: {
    display: "(725) 500-7077",
    tel: "+17255007077",
    confirmed: false,
  },

  instagram: {
    handle: "@searedvegas",
    url: "https://www.instagram.com/searedvegas/",
    confirmed: true,
  },

  /** Hours are intentionally null: do not invent hours or live open/closed status. */
  hours: null as null | { label: string; confirmed: boolean },

  /** Show small "pending owner confirmation" notes in the UI. Turn off at launch. */
  showPendingNotices: true,
} as const;

export const fullAddress = `${site.location.street}, ${site.location.city}, ${site.location.region}`;

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  fullAddress,
)}`;

export const appleMapsUrl = `https://maps.apple.com/?daddr=${encodeURIComponent(fullAddress)}`;

/**
 * Ordering integration switches. Nothing here talks to a real backend yet.
 */
export const ordering = {
  /** "demo" = no backend. Swap to "live" once a provider is wired into `submitOrder`. */
  mode: "demo" as "demo" | "live",
  /** e.g. "square" | "toast" | "clover" | "stripe" — not configured. */
  paymentProvider: null as null | string,
  /** Sales-tax rate as a decimal (e.g. 0.08375). null = not configured, shown as "calculated at checkout". */
  taxRate: null as null | number,
  /** Pickup scheduling is off until the owner defines pickup windows. */
  pickupScheduling: { enabled: false, slots: [] as string[] },
  /** Allow a short free-text note per item. */
  allowItemNotes: true,
  itemNoteMaxLength: 140,
  maxQuantityPerLine: 20,
  /** localStorage key; bump the version suffix if the cart shape changes. */
  cartStorageKey: "seared-vegas-cart-v1",
} as const;
