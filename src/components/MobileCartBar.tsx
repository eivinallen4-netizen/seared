"use client";

import { useCart } from "@/lib/cart";
import { PRICE_COMING_SOON, formatPrice } from "@/lib/pricing";
import { CartIcon } from "./Header";

/** Sticky "View Your Order" bar on small screens once the order has items. */
export function MobileCartBar() {
  const { hydrated, totals, openCart, cartOpen } = useCart();
  if (!hydrated || totals.itemCount === 0 || cartOpen) return null;
  const amount = totals.unpricedCount ? (totals.subtotal ? `${formatPrice(totals.subtotal)} +` : PRICE_COMING_SOON) : formatPrice(totals.subtotal);
  return (
    <div className="mobile-cart">
      <button type="button" className="mobile-cart__btn" onClick={openCart}>
        <span className="mobile-cart__count">
          <CartIcon />
          <span>{totals.itemCount}</span>
        </span>
        <span className="mobile-cart__label">View Your Order</span>
        <span className="mobile-cart__amount">{amount}</span>
      </button>
    </div>
  );
}
