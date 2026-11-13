"use client";

import { useCallback, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { getMenuItem, type MenuItem, type ModifierGroup } from "@/data/menu";
import { ordering } from "@/config/site";
import { useCart } from "@/lib/cart";
import {
  PRICE_COMING_SOON,
  defaultSelections,
  formatPrice,
  priceLine,
  validateSelections,
  type Selections,
} from "@/lib/pricing";
import { CloseButton, Dialog, QuantityStepper } from "./Dialog";
import { FoodImage } from "./FoodImage";
import { useToast } from "./Toast";

export function CustomizeDialog() {
  const { customizer, closeCustomizer } = useCart();
  const item = customizer ? getMenuItem(customizer.itemId) : undefined;
  const onClose = useCallback(() => closeCustomizer(), [closeCustomizer]);
  return (
    <Dialog open={!!item} onClose={onClose} labelledBy="customize-title" className="dialog--customize">
      {item && <CustomizeForm key={`${item.id}-${customizer?.lineId ?? "new"}`} item={item} lineId={customizer?.lineId} onDone={onClose} />}
    </Dialog>
  );
}

function CustomizeForm({ item, lineId, onDone }: { item: MenuItem; lineId?: string; onDone: () => void }) {
  const { lines, add, replace, openCart } = useCart();
  const toast = useToast();
  const editing = lineId ? lines.find((l) => l.lineId === lineId) : undefined;

  const [selections, setSelections] = useState<Selections>(() => editing?.selections ?? defaultSelections(item.modifierGroups));
  const [quantity, setQuantity] = useState(editing?.quantity ?? 1);
  const [note, setNote] = useState(editing?.note ?? "");
  const [showErrors, setShowErrors] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const noteId = useId();

  const errors = useMemo(() => validateSelections(item.modifierGroups, selections), [item.modifierGroups, selections]);
  const priced = priceLine({ lineId: "preview", itemId: item.id, quantity, selections, note });
  const verb = editing ? "Update Order" : item.category === "plates" ? "Add Plate to Order" : "Add to Order";

  const toggle = (g: ModifierGroup, optionId: string, checked: boolean) => {
    setSelections((s) => {
      const cur = s[g.id] ?? [];
      if (g.type === "single") return { ...s, [g.id]: [optionId] };
      const next = checked ? [...cur, optionId] : cur.filter((x) => x !== optionId);
      return { ...s, [g.id]: g.max != null ? next.slice(-g.max) : next };
    });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length) {
      setShowErrors(true);
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[data-invalid='true'] input")?.focus());
      return;
    }
    const line = { itemId: item.id, quantity, selections, note: note.trim() || undefined };
    if (editing) replace(editing.lineId, line);
    else add(line);
    onDone();
    toast.show({
      message: editing ? `${item.name} updated` : `${quantity} × ${item.name} added to your order`,
      detail: item.price == null ? `${PRICE_COMING_SOON} — checkout unlocks once the price is confirmed.` : undefined,
      action: { label: "View Your Order", onClick: openCart },
    });
  };

  return (
    <form ref={formRef} className="customize" onSubmit={submit} noValidate>
      <CloseButton onClick={onDone} />
      <div className="customize__hero">
        <div className="customize__tray">
          <div className="tray-shadow" aria-hidden="true" />
          <FoodImage id={item.image} alt={item.imageAlt} sizes="(max-width: 640px) 80vw, 420px" />
        </div>
      </div>

      <div className="customize__scroll">
        <header className="customize__head">
          {item.badge && <span className="dish__badge">{item.badge}</span>}
          <h2 id="customize-title" className="customize__title">
            {item.category === "plates" ? "Customize Your Plate" : item.name}
          </h2>
          {item.category === "plates" && <p className="customize__subtitle">{item.name}</p>}
          <p className="customize__desc">{item.description}</p>
          <p className={`customize__price ${item.price == null ? "is-pending" : ""}`}>
            {item.price == null ? PRICE_COMING_SOON : formatPrice(item.price)}
          </p>
        </header>

        {!item.available && (
          <p className="alert alert--warn" role="status">
            {item.name} is currently unavailable.
          </p>
        )}

        {item.modifierGroups.map((g) => {
          const err = showErrors ? errors[g.id] : undefined;
          return (
            <fieldset key={g.id} className="opt-group" data-invalid={err ? "true" : undefined} aria-describedby={err ? `${g.id}-err` : undefined}>
              <legend>
                <span className="opt-group__label">{g.label}</span>
                <span className={`opt-group__tag ${g.required ? "is-required" : ""}`}>{g.required ? "Required" : "Optional"}</span>
              </legend>
              <div className="opt-list">
                {g.options.map((o) => {
                  const checked = (selections[g.id] ?? []).includes(o.id);
                  const disabled = o.available === false;
                  return (
                    <label key={o.id} className={`opt ${checked ? "is-checked" : ""} ${disabled ? "is-disabled" : ""}`}>
                      <input
                        type={g.type === "single" ? "radio" : "checkbox"}
                        name={`${item.id}-${g.id}`}
                        value={o.id}
                        checked={checked}
                        disabled={disabled}
                        onChange={(e) => toggle(g, o.id, e.target.checked)}
                      />
                      <span className="opt__mark" aria-hidden="true" />
                      <span className="opt__label">{o.label}</span>
                      <span className="opt__price">
                        {disabled ? "Unavailable" : o.priceDelta == null ? "Price TBD" : o.priceDelta === 0 ? "Included" : `+${formatPrice(o.priceDelta)}`}
                      </span>
                    </label>
                  );
                })}
              </div>
              {err && (
                <p className="field-error" id={`${g.id}-err`} role="alert">
                  {err}
                </p>
              )}
            </fieldset>
          );
        })}

        {ordering.allowItemNotes && (
          <div className="field">
            <label htmlFor={noteId}>
              Special instructions <span className="opt-group__tag">Optional</span>
            </label>
            <textarea
              id={noteId}
              rows={2}
              maxLength={ordering.itemNoteMaxLength}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Allergies or requests — the truck will do its best"
            />
            <span className="field__count">
              {note.length}/{ordering.itemNoteMaxLength}
            </span>
          </div>
        )}

        {item.price == null && (
          <p className="alert alert--info">
            {PRICE_COMING_SOON}. You can add this to your order now, but checkout stays locked for it until the price is confirmed.
          </p>
        )}
      </div>

      <footer className="customize__foot">
        <QuantityStepper value={quantity} onChange={setQuantity} max={ordering.maxQuantityPerLine} label="Quantity" />
        <button type="submit" className="btn btn--flame btn--block" disabled={!item.available}>
          <span>{verb}</span>
          <span className="btn__price">{priced.lineTotal == null ? PRICE_COMING_SOON : formatPrice(priced.lineTotal)}</span>
        </button>
      </footer>
    </form>
  );
}
