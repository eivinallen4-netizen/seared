"use client";

import { useCallback, useState } from "react";
import { fullAddress, ordering, site } from "@/config/site";
import { surfTurf } from "@/data/menu";
import { useCart } from "@/lib/cart";
import { isDemo } from "@/lib/ordering";
import { PRICE_COMING_SOON, formatPrice, type OrderTotals, type PricedLine } from "@/lib/pricing";
import { CloseButton, Dialog, QuantityStepper } from "./Dialog";
import { FoodImage } from "./FoodImage";
import { Icon } from "./Icon";
import { EDIT_SURF_TURF_EVENT } from "./SurfTurfBuilder";
import { useToast } from "./Toast";

type View = "cart" | "checkout";

export function CartDrawer() {
  const { cartOpen, closeCart } = useCart();
  const [view, setView] = useState<View>("cart");
  const onClose = useCallback(() => {
    closeCart();
    setView("cart");
  }, [closeCart]);

  return (
    <Dialog open={cartOpen} onClose={onClose} labelledBy="cart-title" className="dialog--drawer">
      <div className="drawer">
        {view === "cart" ? <CartView onCheckout={() => setView("checkout")} onClose={onClose} /> : <CheckoutView onBack={() => setView("cart")} onClose={onClose} />}
      </div>
    </Dialog>
  );
}

/* ----------------------------------------------------------------- cart view */

function CartView({ onCheckout, onClose }: { onCheckout: () => void; onClose: () => void }) {
  const { hydrated, totals, storageError, notice, dismissNotice } = useCart();

  return (
    <>
      <header className="drawer__head">
        <h2 id="cart-title" className="drawer__title">
          Your Order {hydrated && totals.itemCount > 0 && <span className="drawer__count">{totals.itemCount}</span>}
        </h2>
        <CloseButton onClick={onClose} label="Close your order" />
      </header>

      {(storageError || notice) && (
        <div className={`alert ${storageError ? "alert--warn" : "alert--info"} alert--dismiss`} role="status">
          <span>{storageError ?? notice}</span>
          <button type="button" className="icon-btn" aria-label="Dismiss" onClick={dismissNotice}>
            <Icon name="close" size={20} />
          </button>
        </div>
      )}

      <div className="drawer__body">
        {!hydrated ? (
          <div className="cart-loading" role="status" aria-label="Loading your order">
            {[0, 1].map((i) => (
              <div key={i} className="skeleton-line">
                <span className="skeleton skeleton--thumb" />
                <span className="skeleton skeleton--text" />
              </div>
            ))}
          </div>
        ) : totals.lines.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty__tray" aria-hidden="true">
              <FoodImage id="tray-empty" alt="" sizes="180px" />
            </div>
            <p className="cart-empty__title">Your order is empty</p>
            <p className="cart-empty__text">Tycoon tacos, loaded plates and surf &amp; turf are a tap away.</p>
            <a href="#menu" className="btn btn--flame" onClick={onClose}>
              Start Your Order
            </a>
          </div>
        ) : (
          <ul className="cart-lines">
            {totals.lines.map((pl) => (
              <CartLineRow key={pl.line.lineId} pl={pl} onClose={onClose} />
            ))}
          </ul>
        )}
      </div>

      {hydrated && totals.lines.length > 0 && (
        <footer className="drawer__foot">
          <Totals totals={totals} />
          {!totals.canCheckout && (
            <ul className="blockers" id="checkout-blockers">
              {totals.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="btn btn--flame btn--block btn--lg"
            onClick={onCheckout}
            disabled={!totals.canCheckout}
            aria-describedby={!totals.canCheckout ? "checkout-blockers" : undefined}
          >
            Continue to Checkout
          </button>
          <a href="#menu" className="link-btn" onClick={onClose}>
            Keep ordering
          </a>
        </footer>
      )}
    </>
  );
}

function CartLineRow({ pl, onClose }: { pl: PricedLine; onClose: () => void }) {
  const { setQuantity, remove, add, openCustomizer } = useCart();
  const toast = useToast();
  const { line } = pl;
  const isSurfTurf = line.itemId === surfTurf.itemId;

  const onRemove = () => {
    remove(line.lineId);
    toast.show({
      message: `${pl.name} removed`,
      action: { label: "Undo", onClick: () => add({ itemId: line.itemId, quantity: line.quantity, selections: line.selections, note: line.note }) },
    });
  };

  const onEdit = () => {
    if (isSurfTurf) {
      onClose();
      window.dispatchEvent(new CustomEvent(EDIT_SURF_TURF_EVENT, { detail: line }));
    } else {
      openCustomizer({ itemId: line.itemId, lineId: line.lineId });
    }
  };

  return (
    <li className={`cart-line ${pl.unavailable ? "is-unavailable" : ""}`}>
      <div className="cart-line__thumb" aria-hidden="true">
        <FoodImage id={pl.image} alt="" sizes="88px" />
      </div>
      <div className="cart-line__main">
        <div className="cart-line__top">
          <p className="cart-line__name">{pl.name}</p>
          <p className={`cart-line__price ${pl.lineTotal == null ? "is-pending" : ""}`}>
            {pl.lineTotal == null ? (pl.unavailable ? "Unavailable" : PRICE_COMING_SOON) : formatPrice(pl.lineTotal)}
          </p>
        </div>
        {pl.details.length > 0 && (
          <ul className="cart-line__details">
            {pl.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
        {line.note && <p className="cart-line__note">“{line.note}”</p>}
        {pl.issues.length > 0 && (
          <ul className="cart-line__issues">
            {pl.issues.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        )}
        <div className="cart-line__actions">
          {!pl.unavailable && (
            <QuantityStepper size="sm" value={line.quantity} onChange={(n) => setQuantity(line.lineId, n)} max={ordering.maxQuantityPerLine} label={`Quantity of ${pl.name}`} />
          )}
          {!pl.unavailable && (
            <button type="button" className="link-btn" onClick={onEdit}>
              Edit<span className="sr-only"> {pl.name}</span>
            </button>
          )}
          <button type="button" className="link-btn link-btn--danger" onClick={onRemove}>
            Remove<span className="sr-only"> {pl.name}</span>
          </button>
        </div>
      </div>
    </li>
  );
}

function Totals({ totals }: { totals: OrderTotals }) {
  return (
    <dl className="totals">
      <div>
        <dt>Subtotal{totals.unpricedCount ? " (priced items)" : ""}</dt>
        <dd>{formatPrice(totals.subtotal)}</dd>
      </div>
      {totals.unpricedCount > 0 && (
        <div>
          <dt>Items awaiting a price</dt>
          <dd className="is-pending">{totals.unpricedCount}</dd>
        </div>
      )}
      <div>
        <dt>Tax</dt>
        <dd>{totals.tax == null ? "Calculated at checkout" : formatPrice(totals.tax)}</dd>
      </div>
      <div className="totals__grand">
        <dt>{totals.tax == null ? "Estimated total" : "Total"}</dt>
        <dd>{totals.total == null ? PRICE_COMING_SOON : formatPrice(totals.total)}</dd>
      </div>
    </dl>
  );
}

/* ------------------------------------------------------------- checkout view */

function CheckoutView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const { totals } = useCart();
  const [copied, setCopied] = useState<"idle" | "ok" | "error">("idle");

  const summaryText = [
    `Seared Vegas order`,
    ...totals.lines.map(
      (pl) => `${pl.line.quantity} × ${pl.name}${pl.details.length ? ` (${pl.details.join("; ")})` : ""}${pl.line.note ? ` — "${pl.line.note}"` : ""} — ${pl.lineTotal == null ? PRICE_COMING_SOON : formatPrice(pl.lineTotal)}`,
    ),
    `Subtotal: ${formatPrice(totals.subtotal)}`,
  ].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied("ok");
    } catch {
      setCopied("error");
    }
  };

  return (
    <>
      <header className="drawer__head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back to your order">
          <Icon name="arrow-left" size={22} />
        </button>
        <h2 id="cart-title" className="drawer__title">
          Checkout
        </h2>
        <CloseButton onClick={onClose} label="Close checkout" />
      </header>

      <div className="drawer__body">
        {isDemo() && (
          <div className="demo-banner" role="note">
            <p className="demo-banner__tag">Demo checkout</p>
            <p>
              Online ordering and payment aren&apos;t connected yet. Nothing on this screen sends your order to the truck or charges you.
            </p>
          </div>
        )}

        <h3 className="checkout__h">Order summary</h3>
        <ul className="summary-lines">
          {totals.lines.map((pl) => (
            <li key={pl.line.lineId}>
              <span className="summary-lines__qty">{pl.line.quantity}×</span>
              <span className="summary-lines__name">
                {pl.name}
                {pl.details.length > 0 && <small>{pl.details.join(" · ")}</small>}
                {pl.line.note && <small>“{pl.line.note}”</small>}
              </span>
              <span className="summary-lines__price">{pl.lineTotal == null ? PRICE_COMING_SOON : formatPrice(pl.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <Totals totals={totals} />

        <h3 className="checkout__h">Pickup</h3>
        <p className="checkout__p">
          Pickup at the truck — {fullAddress}
          {site.showPendingNotices && !site.location.confirmed && <span className="pending-tag">Location pending confirmation</span>}
        </p>
        <p className="checkout__p checkout__muted">
          {ordering.pickupScheduling.enabled ? "Choose a pickup time below." : "Pickup times aren't available online yet."} {site.location.scheduleNote}
        </p>

        <h3 className="checkout__h">Payment</h3>
        <button type="button" className="btn btn--block btn--disabled-look" disabled aria-describedby="pay-note">
          Pay online — coming soon
        </button>
        <p id="pay-note" className="checkout__muted">
          Card payment will appear here once the truck connects its ordering provider. This demo never asks for card details.
        </p>
      </div>

      <footer className="drawer__foot">
        <p className="checkout__muted checkout__muted--center">Want this order today? Call the truck and read it off:</p>
        <a className="btn btn--flame btn--block btn--lg" href={`tel:${site.phone.tel}`}>
          Call {site.phone.display}
        </a>
        <button type="button" className="btn btn--outline btn--block" onClick={copy}>
          {copied === "ok" ? (
            <>
              Order summary copied <Icon name="check" size={18} />
            </>
          ) : (
            "Copy order summary"
          )}
        </button>
        {copied === "error" && (
          <p className="field-error" role="alert">
            Couldn&apos;t copy automatically — your browser blocked clipboard access.
          </p>
        )}
      </footer>
    </>
  );
}
