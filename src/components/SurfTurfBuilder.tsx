"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { proteins, surfTurf, type ProteinId } from "@/data/menu";
import { ordering } from "@/config/site";
import { useCart } from "@/lib/cart";
import { PRICE_COMING_SOON, formatPrice, surfTurfBreakdown, type CartLine } from "@/lib/pricing";
import { FoodImage } from "./FoodImage";
import { QuantityStepper } from "./Dialog";
import { Embers, FireCorners } from "./Decor";
import { useToast } from "./Toast";

export const EDIT_SURF_TURF_EVENT = "seared:edit-surf-turf";

type Errors = Partial<Record<"base" | "protein" | "extra" | "sauce", string>>;

export function SurfTurfBuilder() {
  const { add, replace, openCart, lines } = useCart();
  const toast = useToast();
  const [base, setBase] = useState<string | null>(null);
  const [main, setMain] = useState<ProteinId | null>(null);
  const [extra, setExtra] = useState<ProteinId | null>(null);
  const [sauce, setSauce] = useState<string>(surfTurf.sauce.defaultOptionIds?.[0] ?? "regular");
  const [qty, setQty] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [editTarget, setEditingId] = useState<string | null>(null);
  const stepsRef = useRef<HTMLFormElement>(null);

  // "Edit" from the cart loads a saved surf & turf line back into the builder.
  useEffect(() => {
    const onEdit = (e: Event) => {
      const line = (e as CustomEvent<CartLine>).detail;
      setBase(line.selections.base?.[0] ?? null);
      setMain((line.selections.protein?.[0] as ProteinId) ?? null);
      setExtra((line.selections.extra?.[0] as ProteinId) ?? null);
      setSauce(line.selections.sauce?.[0] ?? "regular");
      setQty(line.quantity);
      setEditingId(line.lineId);
      setErrors({});
      document.getElementById("build")?.scrollIntoView({ block: "start" });
      requestAnimationFrame(() => stepsRef.current?.querySelector<HTMLElement>("input:checked, input")?.focus());
    };
    window.addEventListener(EDIT_SURF_TURF_EVENT, onEdit);
    return () => window.removeEventListener(EDIT_SURF_TURF_EVENT, onEdit);
  }, []);

  // If the line being edited was removed from the cart, we're no longer editing.
  const editingId = editTarget && lines.some((l) => l.lineId === editTarget) ? editTarget : null;

  const selections = {
    base: base ? [base] : [],
    protein: main ? [main] : [],
    extra: extra ? [extra] : [],
    sauce: [sauce],
  };
  const breakdown = surfTurfBreakdown(selections);
  const baseOpt = surfTurf.bases.find((b) => b.id === base);
  const mainP = proteins.find((p) => p.id === main);
  const extraP = proteins.find((p) => p.id === extra);
  const sauceLabel = surfTurf.sauce.options.find((o) => o.id === sauce)?.label;

  const pickMain = (id: ProteinId) => {
    setMain(id);
    if (surfTurf.requireDifferentProteins && extra === id) setExtra(null);
    setErrors((e) => ({ ...e, protein: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!base) next.base = "Pick a base.";
    if (!main) next.protein = "Pick your protein.";
    if (!extra) next.extra = "Pick an additional protein.";
    else if (surfTurf.requireDifferentProteins && extra === main) next.extra = "Pick a different protein to mix.";
    if (!sauce) next.sauce = "Choose a sauce preference.";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      requestAnimationFrame(() => document.querySelector<HTMLInputElement>(`[name="st-${first}"]`)?.focus());
      return;
    }
    const line = { itemId: surfTurf.itemId, quantity: qty, selections };
    if (editingId) replace(editingId, line);
    else add(line);
    toast.show({
      message: editingId ? "Surf & Turf updated" : `${qty} × Surf & Turf (${mainP!.label} + ${extraP!.label}) added`,
      detail: breakdown.unit == null ? `${PRICE_COMING_SOON} — checkout unlocks once pricing is confirmed.` : undefined,
      action: { label: "View Your Order", onClick: openCart },
    });
    setEditingId(null);
  };

  const unitLabel = breakdown.unit == null ? PRICE_COMING_SOON : formatPrice(breakdown.unit);
  const totalLabel = breakdown.unit == null ? PRICE_COMING_SOON : formatPrice(breakdown.unit * qty);

  return (
    <section className="builder" id="build" aria-labelledby="build-title">
      <FireCorners />
      <Embers count={16} />
      <div className="container">
        <header className="builder__head">
          <h2 id="build-title" className="section-title section-title--cream">
            <span>Your Plate.</span> <span>Your Rules.</span>
          </h2>
          <p className="builder__lede">Pick your base. Mix your proteins. Make it yours.</p>
          <a
            href="#builder-steps"
            className="btn btn--flame btn--lg btn--flare"
            onClick={(e) => {
              e.preventDefault();
              stepsRef.current?.scrollIntoView({ block: "start" });
              stepsRef.current?.querySelector<HTMLElement>("input")?.focus({ preventScroll: true });
            }}
          >
            Build Your Surf &amp; Turf
          </a>
        </header>

        <div className="builder__grid">
          {/* Live plate preview */}
          <div className="builder__preview" aria-hidden="true">
            <div className="builder__plate tray-lift">
              <div className="tray-shadow" />
              <FoodImage id={baseOpt?.image ?? "tray-empty"} alt="" sizes="(max-width: 900px) 90vw, 520px" />
              {mainP && (
                <div className="builder__protein builder__protein--a" key={`a-${mainP.id}`}>
                  <FoodImage id={mainP.image} alt="" sizes="260px" />
                </div>
              )}
              {extraP && (
                <div className="builder__protein builder__protein--b" key={`b-${extraP.id}`}>
                  <FoodImage id={extraP.image} alt="" sizes="260px" />
                </div>
              )}
            </div>
            <div className="builder__tags">
              <span className={base ? "on" : ""}>{baseOpt ? baseOpt.label : "Base"}</span>
              <span className={main ? "on" : ""}>{mainP ? mainP.label : "Protein"}</span>
              <span className={extra ? "on" : ""}>{extraP ? `+ ${extraP.label}` : "+ Protein"}</span>
            </div>
          </div>

          <form className="builder__steps" id="builder-steps" ref={stepsRef} onSubmit={submit} noValidate aria-label="Build your surf and turf">
            <Step n={1} title="Pick your base" error={errors.base}>
              <div className="tile-list tile-list--3">
                {surfTurf.bases.map((b) => (
                  <label key={b.id} className={`tile ${base === b.id ? "is-checked" : ""}`}>
                    <input type="radio" name="st-base" value={b.id} checked={base === b.id} onChange={() => { setBase(b.id); setErrors((e) => ({ ...e, base: undefined })); }} />
                    <span className="tile__label">{b.label}</span>
                    <span className="tile__meta">Included</span>
                  </label>
                ))}
              </div>
            </Step>

            <Step n={2} title="Pick your protein" error={errors.protein}>
              <ProteinTiles name="st-protein" value={main} onPick={pickMain} />
            </Step>

            <Step n={3} title="Add a protein" hint="Mix surf and turf — pick a different one" error={errors.extra}>
              <ProteinTiles
                name="st-extra"
                value={extra}
                disabledId={surfTurf.requireDifferentProteins ? main : null}
                onPick={(id) => { setExtra(id); setErrors((e) => ({ ...e, extra: undefined })); }}
                showAddOn
              />
            </Step>

            <Step n={4} title="Sauce preference" hint="Signature Seared sauce" error={errors.sauce}>
              <div className="tile-list tile-list--3">
                {surfTurf.sauce.options.map((o) => (
                  <label key={o.id} className={`tile tile--compact ${sauce === o.id ? "is-checked" : ""}`}>
                    <input type="radio" name="st-sauce" value={o.id} checked={sauce === o.id} onChange={() => setSauce(o.id)} />
                    <span className="tile__label">{o.label}</span>
                  </label>
                ))}
              </div>
            </Step>

            <Step n={5} title="How many plates?">
              <QuantityStepper value={qty} onChange={setQty} max={ordering.maxQuantityPerLine} label="Plates" />
            </Step>

            <div className="summary-wrap">
            <div className="summary" aria-live="polite">
              <h3 className="summary__title">Your Surf &amp; Turf</h3>
              <ul className="summary__picks">
                <li><span>Base</span><strong>{baseOpt?.label ?? "—"}</strong></li>
                <li><span>Protein</span><strong>{mainP?.label ?? "—"}</strong></li>
                <li><span>Additional</span><strong>{extraP?.label ?? "—"}</strong></li>
                <li><span>Sauce</span><strong>{sauceLabel}</strong></li>
              </ul>
              <dl className="summary__rows">
                {breakdown.rows.map((r) => (
                  <div key={r.label}>
                    <dt>{r.label}</dt>
                    <dd className={r.amount == null ? "is-pending" : ""}>{r.note ?? (r.amount == null ? PRICE_COMING_SOON : formatPrice(r.amount))}</dd>
                  </div>
                ))}
                {qty > 1 && (
                  <div>
                    <dt>Per plate × {qty}</dt>
                    <dd className={breakdown.unit == null ? "is-pending" : ""}>{unitLabel}</dd>
                  </div>
                )}
                <div className="summary__total">
                  <dt>Total</dt>
                  <dd className={breakdown.unit == null ? "is-pending" : ""}>{main ? totalLabel : "—"}</dd>
                </div>
              </dl>
              {main && breakdown.unit == null && (
                <p className="summary__note">Surf &amp; turf add-on pricing is being confirmed. You can build and save your plate now; checkout unlocks once pricing is set.</p>
              )}
              <button type="submit" className="btn btn--flame btn--block btn--lg">
                {editingId ? "Update Order" : "Add to Order"}
              </button>
              {editingId && (
                <button type="button" className="link-btn" onClick={() => setEditingId(null)}>
                  Cancel editing (save as a new plate instead)
                </button>
              )}
            </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Step({ n, title, hint, error, children }: { n: number; title: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <fieldset className="step" data-invalid={error ? "true" : undefined} aria-describedby={error ? `step-${n}-err` : undefined}>
      <legend>
        <span className="step__n" aria-hidden="true">{n}</span>
        <span className="step__title">{title}</span>
        {hint && <span className="step__hint">{hint}</span>}
      </legend>
      {children}
      {error && (
        <p className="field-error" id={`step-${n}-err`} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function ProteinTiles({
  name,
  value,
  onPick,
  disabledId,
  showAddOn,
}: {
  name: string;
  value: ProteinId | null;
  onPick: (id: ProteinId) => void;
  disabledId?: ProteinId | null;
  showAddOn?: boolean;
}) {
  return (
    <div className="tile-list tile-list--proteins">
      {proteins.map((p) => {
        const disabled = !p.available || p.id === disabledId;
        return (
          <label key={p.id} className={`tile tile--protein ${value === p.id ? "is-checked" : ""} ${disabled ? "is-disabled" : ""}`}>
            <input type="radio" name={name} value={p.id} checked={value === p.id} disabled={disabled} onChange={() => onPick(p.id)} />
            <span className="tile__thumb" aria-hidden="true">
              <FoodImage id={p.image} alt="" sizes="72px" />
            </span>
            <span className="tile__label">{p.label}</span>
            <span className={`tile__kind tile__kind--${p.kind}`}>{p.kind === "surf" ? "Surf" : "Turf"}</span>
            {showAddOn && <span className="tile__meta">{p.id === disabledId ? "Already picked" : p.addOnPrice == null ? "Price soon" : `+${formatPrice(p.addOnPrice)}`}</span>}
          </label>
        );
      })}
    </div>
  );
}
