import {
  baseLabel,
  getMenuItem,
  proteinById,
  surfTurf,
  type MenuItem,
  type ModifierGroup,
} from "@/data/menu";
import { ordering } from "@/config/site";
import type { FoodImageId } from "@/data/food-images";

export type Selections = Record<string, string[]>;

export type CartLine = {
  lineId: string;
  /** Menu item id, or surfTurf.itemId for builder plates. */
  itemId: string;
  quantity: number;
  selections: Selections;
  note?: string;
};

export type PricedLine = {
  line: CartLine;
  name: string;
  image: FoodImageId | null;
  imageAlt: string;
  /** Human-readable choices, e.g. "Base: Seasoned yellow rice". */
  details: string[];
  /** Cents per unit, or null when any part of the price is unknown. */
  unitPrice: number | null;
  lineTotal: number | null;
  /** Problems that block checkout for this line. */
  issues: string[];
  /** Line can't be priced or ordered at all (removed / unavailable). */
  unavailable: boolean;
};

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export const PRICE_COMING_SOON = "Price coming soon";

export const priceLabel = (cents: number | null) => (cents == null ? PRICE_COMING_SOON : formatPrice(cents));

/* ------------------------------------------------------------- validation */

export function validateSelections(groups: ModifierGroup[], selections: Selections): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const g of groups) {
    const picked = (selections[g.id] ?? []).filter((id) => g.options.some((o) => o.id === id && o.available !== false));
    const min = g.min ?? (g.required ? 1 : 0);
    if (picked.length < min)
      errors[g.id] = /^choose/i.test(g.label)
        ? `Please ${g.label.charAt(0).toLowerCase()}${g.label.slice(1)}.`
        : `Please choose an option for ${g.label}.`;
    if (g.max != null && picked.length > g.max) errors[g.id] = `Choose up to ${g.max}.`;
  }
  return errors;
}

export function defaultSelections(groups: ModifierGroup[]): Selections {
  const s: Selections = {};
  for (const g of groups) s[g.id] = [...(g.defaultOptionIds ?? [])];
  return s;
}

/* --------------------------------------------------------------- pricing */

function priceMenuItem(item: MenuItem, selections: Selections) {
  let unit: number | null = item.price;
  const details: string[] = [];
  const issues: string[] = [];
  if (item.price == null) issues.push(`${PRICE_COMING_SOON} for ${item.name}.`);

  for (const g of item.modifierGroups) {
    const picked = selections[g.id] ?? [];
    const labels: string[] = [];
    for (const id of picked) {
      const opt = g.options.find((o) => o.id === id);
      if (!opt) continue;
      labels.push(opt.label);
      if (opt.priceDelta == null) {
        unit = null;
        issues.push(`${PRICE_COMING_SOON} for ${opt.label}.`);
      } else if (unit != null) unit += opt.priceDelta;
    }
    if (labels.length) {
      const name = g.label.replace(/^Choose your /i, "");
      details.push(`${name.charAt(0).toUpperCase()}${name.slice(1)}: ${labels.join(", ")}`);
    }
  }
  const errors = validateSelections(item.modifierGroups, selections);
  if (Object.keys(errors).length) issues.push("Some required choices are missing — edit this item.");
  return { unit, details, issues };
}

export type SurfTurfBreakdown = {
  rows: { label: string; amount: number | null; note?: string }[];
  unit: number | null;
};

/** Builder price: first protein's large-plate price + additional protein's add-on price. */
export function surfTurfBreakdown(selections: Selections): SurfTurfBreakdown {
  const base = selections.base?.[0];
  const main = proteinById(selections.protein?.[0] ?? "");
  const extra = proteinById(selections.extra?.[0] ?? "");
  const rows: SurfTurfBreakdown["rows"] = [];

  if (base) rows.push({ label: `Base · ${baseLabel(base)}`, amount: 0, note: "Included" });
  let unit: number | null = 0;

  if (main) {
    const plate = main.plateItemId ? getMenuItem(main.plateItemId) : undefined;
    const amount = plate?.price ?? null;
    rows.push({ label: `${main.label} plate`, amount });
    unit = amount == null ? null : unit + amount;
  }
  if (extra) {
    rows.push({ label: `Add ${extra.label}`, amount: extra.addOnPrice });
    unit = extra.addOnPrice == null || unit == null ? null : unit + extra.addOnPrice;
  }
  if (!main) unit = null;
  return { rows, unit };
}

export function priceLine(line: CartLine): PricedLine {
  const base: Omit<PricedLine, "name" | "image" | "imageAlt" | "details" | "unitPrice" | "lineTotal" | "issues" | "unavailable"> = { line };

  if (line.itemId === surfTurf.itemId) {
    const main = proteinById(line.selections.protein?.[0] ?? "");
    const extra = proteinById(line.selections.extra?.[0] ?? "");
    const baseId = line.selections.base?.[0];
    const sauceId = line.selections.sauce?.[0];
    const sauceLabel = surfTurf.sauce.options.find((o) => o.id === sauceId)?.label;
    const { unit } = surfTurfBreakdown(line.selections);
    const issues: string[] = [];
    const unavailable = !main || !extra || !baseId || main.available === false || extra.available === false;
    if (unavailable) issues.push("This plate has an option that is no longer available — remove it and rebuild.");
    if (unit == null) issues.push(`${PRICE_COMING_SOON} for Surf & Turf.`);
    return {
      ...base,
      name: surfTurf.name,
      image: surfTurf.bases.find((b) => b.id === baseId)?.image ?? "base-half-half",
      imageAlt: `${surfTurf.name}`,
      details: [
        baseId ? `Base: ${baseLabel(baseId)}` : "",
        main && extra ? `Proteins: ${main.label} + ${extra.label}` : "",
        sauceLabel ? `Seared sauce: ${sauceLabel}` : "",
      ].filter(Boolean),
      unitPrice: unavailable ? null : unit,
      lineTotal: unavailable || unit == null ? null : unit * line.quantity,
      issues,
      unavailable,
    };
  }

  const item = getMenuItem(line.itemId);
  if (!item) {
    return {
      ...base,
      name: "Item no longer on the menu",
      image: null,
      imageAlt: "",
      details: [],
      unitPrice: null,
      lineTotal: null,
      issues: ["This item is no longer on the menu — please remove it."],
      unavailable: true,
    };
  }
  const { unit, details, issues } = priceMenuItem(item, line.selections);
  if (!item.available) issues.unshift(`${item.name} is currently unavailable.`);
  return {
    ...base,
    name: item.name,
    image: item.image,
    imageAlt: item.imageAlt,
    details,
    unitPrice: unit,
    lineTotal: unit == null ? null : unit * line.quantity,
    issues,
    unavailable: !item.available,
  };
}

export type OrderTotals = {
  lines: PricedLine[];
  itemCount: number;
  /** Sum of every priced line. */
  subtotal: number;
  /** Lines without a confirmed price. */
  unpricedCount: number;
  tax: number | null;
  total: number | null;
  canCheckout: boolean;
  blockers: string[];
};

export function computeTotals(cart: CartLine[]): OrderTotals {
  const lines = cart.map(priceLine);
  const itemCount = cart.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + (l.lineTotal ?? 0), 0);
  const unpricedCount = lines.filter((l) => l.lineTotal == null).length;
  const tax = ordering.taxRate == null ? null : Math.round(subtotal * ordering.taxRate);
  const blockers: string[] = [];
  if (!lines.length) blockers.push("Your order is empty.");
  if (unpricedCount) blockers.push(`${unpricedCount} item${unpricedCount > 1 ? "s don't" : " doesn't"} have a confirmed price yet. Remove ${unpricedCount > 1 ? "them" : "it"} to continue.`);
  if (lines.some((l) => l.unavailable)) blockers.push("Remove unavailable items to continue.");
  return {
    lines,
    itemCount,
    subtotal,
    unpricedCount,
    tax,
    total: unpricedCount ? null : subtotal + (tax ?? 0),
    canCheckout: blockers.length === 0,
    blockers,
  };
}

/** Lines with identical choices merge into one. */
export const lineKey = (l: Pick<CartLine, "itemId" | "selections" | "note">) =>
  JSON.stringify([
    l.itemId,
    Object.keys(l.selections)
      .sort()
      .map((k) => [k, [...l.selections[k]].sort()]),
    (l.note ?? "").trim().toLowerCase(),
  ]);
