"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { Icon } from "./Icon";

const links = [
  { href: "#menu", label: "Menu" },
  { href: "#build", label: "Build Your Plate" },
  { href: "#truck", label: "Find the Truck" },
];

export function Header() {
  const { totals, hydrated, openCart } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const count = totals.itemCount;

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-header__inner">
        <a href="#top" className="site-header__logo" aria-label="Seared Vegas — back to top">
          <Image src="/brand/seared-vegas-logo-256.webp" alt="Seared Vegas" width={256} height={256} preload sizes="128px" />
        </a>

        <nav aria-label="Main" className={`site-nav ${open ? "is-open" : ""}`} id="site-nav">
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              </li>
            ))}
            <li className="site-nav__order">
              <a href="#menu" className="btn btn--flame" onClick={() => setOpen(false)}>
                Order Online
              </a>
            </li>
          </ul>
        </nav>

        <div className="site-header__actions">
          <button
            type="button"
            className="cart-btn"
            onClick={openCart}
            aria-label={`View Your Order, ${hydrated ? count : 0} item${count === 1 ? "" : "s"}`}
          >
            <CartIcon />
            <span className={`cart-btn__count ${count ? "has-items" : ""}`} aria-hidden="true">
              {hydrated ? count : ""}
            </span>
          </button>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className="menu-toggle__bars" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function CartIcon() {
  return (
    <Icon name="cart" size={26} />
  );
}
