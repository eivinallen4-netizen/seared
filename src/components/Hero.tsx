import Image from "next/image";
import { HERO_COUNTER } from "@/data/hero-counter";
import { FoodImage } from "./FoodImage";
import { Brush, CheckerStrip, Embers, FireCorners } from "./Decor";
import { Icon } from "./Icon";

export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <FireCorners />
      <Embers count={18} />
      <div className="hero__inner">
        <div className="hero__copy">
          <p className="eyebrow eyebrow--gold">Las Vegas Cajun Food Truck</p>
          <h1 id="hero-title" className="hero__title">
            <span>Big Flavor.</span>
            <span>
              Vegas <em>Heat.</em>
              <Brush variant={1} className="hero__brush" />
            </span>
          </h1>
          <p className="hero__lede">Tycoon Cajun tacos, loaded plates, and surf &amp; turf from Seared Vegas.</p>
          <div className="hero__ctas">
            <a href="#menu" className="btn btn--flame btn--lg">
              Start Your Order <Icon name="arrow-right" size={24} />
            </a>
            <a href="#menu-grid" className="link-arrow">
              Explore the Menu <Icon name="arrow-down" size={18} />
            </a>
          </div>
        </div>

        <div className="hero__stage">
          <div className="hero__flames" aria-hidden="true" />
          <div className="counter" aria-hidden="true">
            <Image
              src="/decor/hero-counter.webp"
              alt=""
              width={HERO_COUNTER.width}
              height={HERO_COUNTER.height}
              sizes="(max-width: 899px) 120vw, 70vw"
              preload
            />
          </div>
          <div className="hero__glow" aria-hidden="true" />
          <div className="hero__tray tray-lift">
            <div className="tray-shadow tray-shadow--hero" aria-hidden="true" />
            <FoodImage
              id="hero-tray"
              alt="Open black takeout tray with grilled lamb chops, a broiled lobster tail, creamy Cajun penne and a grilled lemon"
              sizes="(max-width: 768px) 100vw, 60vw"
              preload
            />
          </div>
        </div>
      </div>
      <CheckerStrip className="checker-strip--bottom hero__strip" />
    </section>
  );
}
