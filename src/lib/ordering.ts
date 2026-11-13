import { ordering } from "@/config/site";
import type { CartLine } from "./pricing";

/**
 * Integration point for a real ordering / payment provider (Square, Toast,
 * Clover, Stripe, ...). In "demo" mode nothing is sent anywhere.
 *
 * When wiring a provider:
 *  1. Recompute prices SERVER-SIDE from src/data/menu.ts — never trust client totals.
 *  2. Create the order + payment session with the provider.
 *  3. Only show a confirmation after the provider confirms the order.
 */
export class OrderingNotConfiguredError extends Error {
  constructor() {
    super("Online ordering is not connected yet.");
    this.name = "OrderingNotConfiguredError";
  }
}

export async function submitOrder(_lines: CartLine[]): Promise<{ orderId: string; checkoutUrl?: string }> {
  void _lines;
  if (ordering.mode === "demo" || !ordering.paymentProvider) throw new OrderingNotConfiguredError();
  // TODO(launch): POST to a route handler (src/app/api/orders/route.ts) that talks to the provider.
  throw new OrderingNotConfiguredError();
}

export const isDemo = () => ordering.mode === "demo" || !ordering.paymentProvider;
