"use client";

import { useEffect, useRef, useState } from "react";
import { categories, categoryCards, menuItems, type CategoryId, type MenuItem } from "@/data/menu";
import { site } from "@/config/site";
import { useCart } from "@/lib/cart";
import { PRICE_COMING_SOON, formatPrice } from "@/lib/pricing";
import { FoodImage } from "./FoodImage";
import { CheckerStrip, ScorchedEdge, SlashMarks } from "./Decor";
import { Icon } from "./Icon";

type Filter = "all" | CategoryId;

const fromPrice = (cat: CategoryId) => {
  const prices = menuItems.filter((i) => i.category === cat && i.price != null).map((i) => i.price!);
  return prices.length ? `From ${formatPrice(Math.min(...prices))}` : PRICE_COMING_SOON;
};

export function MenuSection() {
  const [filter, setFilter] = useState<Filter>("all");
  const gridRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // The pill bar only gets its paper backing while it is pinned under the header.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 76;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < headerH + 2), {
      rootMargin: `-${headerH + 1}px 0px 0px 0px`,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const { openCustomizer } = useCart();

  const visible = filter === "all" ? menuItems : menuItems.filter((i) => i.category === filter);
  const groups = categories
    .map((c) => ({ ...c, items: visible.filter((i) => i.category === c.id) }))
    .filter((g) => g.items.length);

  const scrollToGrid = () =>
    requestAnimationFrame(() => gridRef.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));

  const jumpTo = (cat: CategoryId) => {
    setFilter(cat);
    scrollToGrid();
  };

  // The filter pills sit above the category cards, so picking one also brings the dishes into view.
  const pickFilter = (f: Filter) => {
    setFilter(f);
    if (f !== "all") scrollToGrid();
  };

  return (
    <section className="menu" id="menu" aria-labelledby="menu-title">
      <CheckerStrip className="checker-strip--top" />
      <ScorchedEdge />
      <div className="container">
        <header className="section-head">
          <h2 id="menu-title" className="section-title section-title--ink">
            <SlashMarks side="left" />
            What Are You Craving?
            <SlashMarks side="right" />
          </h2>
        </header>

        <div ref={sentinelRef} className="filters-sentinel" aria-hidden="true" />
        <div className={`filters ${stuck ? "is-stuck" : ""}`} role="group" aria-label="Filter the menu">
          {(["all", ...categories.map((c) => c.id)] as Filter[]).map((f) => {
            const label = f === "all" ? "All" : categories.find((c) => c.id === f)!.filterLabel;
            const count = f === "all" ? menuItems.length : menuItems.filter((i) => i.category === f).length;
            return (
              <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => pickFilter(f)}>
                {label}
                <span className="sr-only"> ({count} items)</span>
              </button>
            );
          })}
        </div>

        {/* Category introduction cards (from the approved mockup) */}
        <ul className="cat-cards" aria-label="Menu categories">
          {categoryCards.map((c) => (
            <li key={c.id} className={`cat-card cat-card--${c.tone}`}>
              <div className="cat-card__tray tray-lift">
                <div className="tray-shadow" aria-hidden="true" />
                <FoodImage id={c.image} alt="" sizes="(max-width: 640px) 80vw, 30vw" />
              </div>
              <div className="cat-card__body">
                <h3 className="cat-card__title">{c.title}</h3>
                <p className="cat-card__price">{c.id === "sides" ? "Corn on the cob" : fromPrice(c.id)}</p>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => (c.itemId ? openCustomizer({ itemId: c.itemId }) : jumpTo(c.id))}
                >
                  {c.cta} <Icon name="plus" size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="menu-browse" id="menu-grid" ref={gridRef}>
          <p className="sr-only" aria-live="polite">
            Showing {visible.length} {visible.length === 1 ? "item" : "items"}
          </p>

          {groups.map((g) => (
            <div key={g.id} className="menu-group">
              <div className="menu-group__head">
                <h3 className="menu-group__title">{g.label}</h3>
                {g.id === "tacos" && <p className="menu-group__note">Two tacos per order · Parmesan-crusted tortilla</p>}
                {g.id === "plates" && <p className="menu-group__note">Choose Cajun Alfredo penne, seasoned yellow rice, or half &amp; half</p>}
              </div>
              <ul className="dish-grid">
                {g.items.map((item) => (
                  <li key={item.id}>
                    <DishCard item={item} onOrder={() => openCustomizer({ itemId: item.id })} />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {site.showPendingNotices && (
            <p className="pending-note">Menu prices are reference prices pending owner confirmation. Photos are representative.</p>
          )}
        </div>
      </div>
      <CheckerStrip className="checker-strip--bottom" />
    </section>
  );
}

function DishCard({ item, onOrder }: { item: MenuItem; onOrder: () => void }) {
  const cta = !item.available ? "Unavailable" : item.category === "plates" ? "Customize Your Plate" : "Add to Order";
  return (
    <article className={`dish ${!item.available ? "dish--unavailable" : ""}`} aria-labelledby={`dish-${item.id}`}>
      <div className="dish__tray tray-lift">
        <div className="tray-shadow" aria-hidden="true" />
        <FoodImage id={item.image} alt={item.imageAlt} sizes="(max-width: 640px) 70vw, (max-width: 1100px) 40vw, 300px" />
      </div>
      <div className="dish__body">
        {item.badge && <span className="dish__badge">{item.badge}</span>}
        <h4 className="dish__name" id={`dish-${item.id}`}>
          {item.name}
        </h4>
        <p className="dish__desc">{item.description}</p>
        <div className="dish__foot">
          <p className={`dish__price ${item.price == null ? "is-pending" : ""}`}>
            {item.price == null ? PRICE_COMING_SOON : formatPrice(item.price)}
          </p>
          <button type="button" className="btn btn--flame btn--sm" onClick={onOrder} disabled={!item.available} aria-describedby={`dish-${item.id}`}>
            {cta}
            {item.available && <Icon name="plus" size={16} />}
          </button>
        </div>
        {!item.available && <p className="dish__status">Currently unavailable</p>}
      </div>
    </article>
  );
}
