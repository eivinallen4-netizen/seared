/**
 * Seared Vegas menu data — kept separate from presentation.
 *
 * Prices are REFERENCE prices from the owner's menu screenshots and are pending
 * owner confirmation. `price: null` means the price is unknown: the item shows
 * "Price coming soon" and blocks paid checkout until a price is configured.
 *
 * Do not add ingredients, prices or modifier charges that are not on the owner's
 * menu. Unknowns are tracked in /MISSING_MENU_INFO.md.
 */

import type { FoodImageId } from "./food-images";

export type CategoryId = "tacos" | "plates" | "sides";

export type ModifierOption = {
  id: string;
  label: string;
  /** Extra charge in cents. 0 = included. null = charge unknown (blocks checkout). */
  priceDelta: number | null;
  available?: boolean;
};

export type ModifierGroup = {
  id: string;
  label: string;
  /** Helper text under the group heading. */
  hint?: string;
  required: boolean;
  /** "single" renders radios, "multi" renders checkboxes. */
  type: "single" | "multi";
  min?: number;
  max?: number;
  defaultOptionIds?: string[];
  options: ModifierOption[];
};

export type MenuItem = {
  id: string;
  category: CategoryId;
  name: string;
  /** Short, factual description — only ingredients confirmed on the menu. */
  description: string;
  /** Price in cents. null = price coming soon. */
  price: number | null;
  image: FoodImageId;
  imageAlt: string;
  modifierGroups: ModifierGroup[];
  available: boolean;
  /** Short label such as "2 per order". */
  badge?: string;
  /** Price + details still need owner confirmation. */
  confirmed: boolean;
};

export type Category = {
  id: CategoryId;
  label: string;
  /** Plural label for filter chips. */
  filterLabel: string;
};

export const categories: Category[] = [
  { id: "tacos", label: "Tycoon Cajun Tacos", filterLabel: "Tacos" },
  { id: "plates", label: "Large Plates", filterLabel: "Plates" },
  { id: "sides", label: "Sides", filterLabel: "Sides" },
];

/* ---------------------------------------------------------------- modifiers */

const plateBase: ModifierGroup = {
  id: "base",
  label: "Choose your base",
  hint: "Required",
  required: true,
  type: "single",
  // No default on purpose: the customer must choose a base.
  options: [
    { id: "penne", label: "Cajun Alfredo penne pasta", priceDelta: 0 },
    { id: "rice", label: "Seasoned yellow rice", priceDelta: 0 },
    { id: "half-half", label: "Half pasta / half rice", priceDelta: 0 },
  ],
};

/** Preference only — no charges. Options limited to what the menu names. */
const sauce: ModifierGroup = {
  id: "sauce",
  label: "Signature Seared sauce",
  required: true,
  type: "single",
  defaultOptionIds: ["regular"],
  options: [
    { id: "regular", label: "Regular", priceDelta: 0 },
    { id: "side", label: "On the side", priceDelta: 0 },
    { id: "none", label: "No sauce", priceDelta: 0 },
  ],
};

/* -------------------------------------------------------------------- items */

const usd = (dollars: number) => Math.round(dollars * 100);

const taco = (
  id: string,
  protein: string,
  price: number,
  image: FoodImageId,
): MenuItem => ({
  id: `taco-${id}`,
  category: "tacos",
  name: `${protein} Tycoon Tacos`,
  description: `Two tacos on a Parmesan-crusted tortilla with ${protein.toLowerCase()}, bell peppers, red onions and signature Seared sauce.`,
  price: usd(price),
  image,
  imageAlt: `Two ${protein.toLowerCase()} Tycoon Cajun tacos in an open black takeout tray`,
  modifierGroups: [sauce],
  available: true,
  badge: "2 per order",
  confirmed: false,
});

const plate = (
  id: string,
  protein: string,
  price: number,
  image: FoodImageId,
): MenuItem => ({
  id: `plate-${id}`,
  category: "plates",
  name: `${protein} Plate`,
  description: `${protein} over your choice of Cajun Alfredo penne, seasoned yellow rice, or half pasta / half rice.`,
  price: usd(price),
  image,
  imageAlt: `${protein} large plate in an open black takeout tray`,
  modifierGroups: [plateBase],
  available: true,
  badge: "Large plate",
  confirmed: false,
});

export const menuItems: MenuItem[] = [
  // Tycoon Cajun Tacos — two per order (reference prices)
  taco("chicken", "Chicken", 15, "taco-chicken"),
  taco("steak", "Steak", 15, "taco-steak"),
  taco("shrimp", "Shrimp", 15, "taco-shrimp"),
  taco("lamb-chop", "Lamb Chop", 25, "taco-lamb-chop"),
  taco("lobster-tail", "Lobster Tail", 25, "taco-lobster-tail"),

  // Large plates (reference prices)
  plate("steak", "Steak", 27, "plate-steak"),
  plate("chicken", "Chicken", 25, "plate-chicken"),
  plate("shrimp", "Shrimp", 27, "plate-shrimp"),
  plate("salmon", "Salmon", 26, "plate-salmon"),
  plate("lamb-chop", "Lamb Chop", 35, "plate-lamb-chop"),
  plate("filet-mignon", "Filet Mignon", 35, "plate-filet-mignon"),

  // Sides
  {
    id: "side-loaded-cajun-corn",
    category: "sides",
    name: "Loaded Cajun Corn",
    // Toppings are cropped in the reference menu — keep factual until confirmed.
    description: "Corn on the cob, loaded Cajun style. Full toppings list coming soon.",
    price: null, // Price not visible in the reference — PRICE COMING SOON
    image: "corn-loaded-cajun",
    imageAlt: "Loaded Cajun corn on the cob in an open black takeout tray",
    modifierGroups: [],
    available: true,
    badge: "Side",
    confirmed: false,
  },
];

export const getMenuItem = (id: string) => menuItems.find((i) => i.id === id);

/* ------------------------------------------------------- category intro cards */

export const categoryCards: {
  id: CategoryId;
  title: string;
  image: FoodImageId;
  tone: "gold" | "cream" | "red";
  cta: string;
  /** If set, the CTA opens this item's customizer instead of filtering. */
  itemId?: string;
}[] = [
  { id: "tacos", title: "Tycoon Tacos", image: "taco-shrimp", tone: "gold", cta: "Add to Order" },
  { id: "plates", title: "Loaded Plates", image: "plate-steak", tone: "cream", cta: "Add to Order" },
  {
    id: "sides",
    title: "Cajun Corn",
    image: "corn-loaded-cajun",
    tone: "red",
    cta: "Add to Order",
    itemId: "side-loaded-cajun-corn",
  },
];

/* --------------------------------------------------------- surf & turf builder */

export type ProteinId =
  | "steak"
  | "chicken"
  | "shrimp"
  | "salmon"
  | "lamb-chop"
  | "filet-mignon"
  | "lobster-tail";

export type Protein = {
  id: ProteinId;
  label: string;
  kind: "surf" | "turf";
  image: FoodImageId;
  /** Large plate this protein maps to (its price is the builder's plate price). */
  plateItemId?: string;
  /** Charge for adding this protein as the ADDITIONAL protein. null = unknown. */
  addOnPrice: number | null;
  available: boolean;
};

export const proteins: Protein[] = [
  { id: "steak", label: "Steak", kind: "turf", image: "protein-steak", plateItemId: "plate-steak", addOnPrice: null, available: true },
  { id: "chicken", label: "Chicken", kind: "turf", image: "protein-chicken", plateItemId: "plate-chicken", addOnPrice: null, available: true },
  { id: "lamb-chop", label: "Lamb Chop", kind: "turf", image: "protein-lamb-chop", plateItemId: "plate-lamb-chop", addOnPrice: null, available: true },
  { id: "filet-mignon", label: "Filet Mignon", kind: "turf", image: "protein-filet-mignon", plateItemId: "plate-filet-mignon", addOnPrice: null, available: true },
  { id: "shrimp", label: "Shrimp", kind: "surf", image: "protein-shrimp", plateItemId: "plate-shrimp", addOnPrice: null, available: true },
  { id: "salmon", label: "Salmon", kind: "surf", image: "protein-salmon", plateItemId: "plate-salmon", addOnPrice: null, available: true },
  // No lobster-tail large plate on the reference menu, so it has no plate price.
  { id: "lobster-tail", label: "Lobster Tail", kind: "surf", image: "protein-lobster-tail", addOnPrice: null, available: true },
];

export const surfTurf = {
  itemId: "surf-and-turf",
  name: "Surf & Turf Plate",
  /**
   * Pricing model (PENDING OWNER CONFIRMATION):
   *   plate price of the first protein  +  addOnPrice of the additional protein.
   * While any part is null the builder shows "Price coming soon" and the line
   * cannot go through paid checkout.
   */
  bases: plateBase.options.map((o) => ({
    ...o,
    image: (o.id === "penne" ? "base-penne" : o.id === "rice" ? "base-rice" : "base-half-half") as FoodImageId,
  })),
  sauce,
  /** Require two different proteins ("mix your proteins"). */
  requireDifferentProteins: true,
};

export const baseLabel = (id: string) => plateBase.options.find((o) => o.id === id)?.label ?? id;
export const proteinById = (id: string) => proteins.find((p) => p.id === id);
