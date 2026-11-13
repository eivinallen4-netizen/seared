"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { ordering } from "@/config/site";
import { getMenuItem, surfTurf } from "@/data/menu";
import { computeTotals, lineKey, type CartLine, type OrderTotals, type Selections } from "./pricing";

/* ---------------------------------------------------------------------------
   Cart store — a tiny external store persisted to localStorage.
   The server snapshot is "not hydrated yet", so the first client render matches
   the server HTML and the saved order appears right after hydration.
   ------------------------------------------------------------------------- */

type CartState = {
  hydrated: boolean;
  lines: CartLine[];
  storageError: string | null;
  notice: string | null;
};

const SERVER_STATE: CartState = { hydrated: false, lines: [], storageError: null, notice: null };
let state: CartState = SERVER_STATE;
const listeners = new Set<() => void>();

const clampQty = (n: number) => Math.max(1, Math.min(ordering.maxQuantityPerLine, Math.round(n) || 1));
const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function set(next: Partial<CartState>, persist = false) {
  state = { ...state, ...next };
  if (persist) {
    try {
      window.localStorage.setItem(ordering.cartStorageKey, JSON.stringify({ v: 1, lines: state.lines }));
    } catch {
      state = { ...state, storageError: "Your browser blocked saving the order. It will stay open in this tab only." };
    }
  }
  listeners.forEach((l) => l());
}

/** Accept only well-formed lines that still point at something on the menu. */
function parseStored(raw: string | null): { lines: CartLine[]; dropped: number } {
  if (!raw) return { lines: [], dropped: 0 };
  const data = JSON.parse(raw) as unknown;
  const arr = Array.isArray((data as { lines?: unknown })?.lines) ? (data as { lines: unknown[] }).lines : [];
  const lines: CartLine[] = [];
  for (const l of arr) {
    const c = l as Partial<CartLine>;
    if (typeof c?.lineId !== "string" || typeof c.itemId !== "string" || typeof c.quantity !== "number") continue;
    if (c.itemId !== surfTurf.itemId && !getMenuItem(c.itemId)) continue;
    const selections: Selections = {};
    for (const [k, v] of Object.entries(c.selections ?? {})) if (Array.isArray(v)) selections[k] = v.filter((x) => typeof x === "string");
    lines.push({
      lineId: c.lineId,
      itemId: c.itemId,
      quantity: clampQty(c.quantity),
      selections,
      note: typeof c.note === "string" ? c.note.slice(0, ordering.itemNoteMaxLength) : undefined,
    });
  }
  return { lines, dropped: arr.length - lines.length };
}

function loadFromStorage() {
  try {
    const { lines, dropped } = parseStored(window.localStorage.getItem(ordering.cartStorageKey));
    set({
      hydrated: true,
      lines,
      notice: dropped
        ? `${dropped} saved item${dropped > 1 ? "s were" : " was"} removed because ${dropped > 1 ? "they're" : "it's"} no longer on the menu.`
        : state.notice,
    });
  } catch {
    set({ hydrated: true, lines: [], storageError: "We couldn't restore your saved order, so we started a fresh one." });
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    if (!state.hydrated) queueMicrotask(loadFromStorage);
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}

/** Keep multiple tabs in sync. */
function onStorage(e: StorageEvent) {
  if (e.key === ordering.cartStorageKey) loadFromStorage();
}

function mergeInto(lines: CartLine[], line: Omit<CartLine, "lineId">, lineId?: string): CartLine[] {
  const key = lineKey(line);
  const existing = lines.find((l) => l.lineId !== lineId && lineKey(l) === key);
  if (existing) {
    return lines
      .filter((l) => l.lineId !== lineId)
      .map((l) => (l === existing ? { ...l, quantity: clampQty(l.quantity + line.quantity) } : l));
  }
  if (lineId) return lines.map((l) => (l.lineId === lineId ? { ...line, lineId, quantity: clampQty(line.quantity) } : l));
  return [...lines, { ...line, lineId: newId(), quantity: clampQty(line.quantity) }];
}

const actions = {
  add: (line: Omit<CartLine, "lineId">) => set({ lines: mergeInto(state.lines, line), notice: null }, true),
  replace: (lineId: string, line: Omit<CartLine, "lineId">) => set({ lines: mergeInto(state.lines, line, lineId) }, true),
  setQuantity: (lineId: string, quantity: number) =>
    set({ lines: state.lines.map((l) => (l.lineId === lineId ? { ...l, quantity: clampQty(quantity) } : l)) }, true),
  remove: (lineId: string) => set({ lines: state.lines.filter((l) => l.lineId !== lineId) }, true),
  clear: () => set({ lines: [] }, true),
  dismissNotice: () => set({ notice: null, storageError: null }),
};

/* ---------------------------------------------------------------- context */

export type CustomizerTarget = { itemId: string; lineId?: string } | null;

type CartContextValue = CartState &
  typeof actions & {
    totals: OrderTotals;
    cartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    customizer: CustomizerTarget;
    openCustomizer: (t: NonNullable<CustomizerTarget>) => void;
    closeCustomizer: () => void;
  };

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
  const [cartOpen, setCartOpen] = useState(false);
  const [customizer, setCustomizer] = useState<CustomizerTarget>(null);

  const totals = useMemo(() => computeTotals(cart.lines), [cart.lines]);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openCustomizer = useCallback((t: NonNullable<CustomizerTarget>) => setCustomizer(t), []);
  const closeCustomizer = useCallback(() => setCustomizer(null), []);

  const value: CartContextValue = {
    ...cart,
    ...actions,
    totals,
    cartOpen,
    openCart,
    closeCart,
    customizer,
    openCustomizer,
    closeCustomizer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
