import Image from "next/image";
import { fullAddress, site } from "@/config/site";
import { CheckerStrip, Embers, FireCorners } from "./Decor";
import { Icon } from "./Icon";

export function Footer() {
  const year = 2026;
  return (
    <footer className="site-footer">
      <CheckerStrip />
      <FireCorners className="fire-band--soft" />
      <Embers count={10} />
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Image src="/brand/seared-vegas-logo-256.webp" alt="Seared Vegas" width={256} height={256} sizes="120px" className="site-footer__logo" />
          <p className="site-footer__tag">Big flavor. Vegas heat. Cajun food truck in Las Vegas.</p>
        </div>

        <nav aria-label="Footer" className="site-footer__col">
          <h2 className="site-footer__h">Explore</h2>
          <ul>
            <li><a href="#menu">Menu</a></li>
            <li><a href="#build">Build Your Plate</a></li>
            <li><a href="#truck">Find the Truck</a></li>
            <li><a href="#menu">Order Online</a></li>
          </ul>
        </nav>

        <div className="site-footer__col">
          <h2 className="site-footer__h">Visit &amp; contact</h2>
          <ul>
            <li><address><Icon name="pin" size={18} /> {fullAddress}</address></li>
            <li><a href={`tel:${site.phone.tel}`}><Icon name="phone" size={18} /> {site.phone.display}</a></li>
            <li>
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
                <Icon name="camera" size={18} /> Instagram {site.instagram.handle}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="site-footer__col">
          <h2 className="site-footer__h">Ordering</h2>
          <ul className="site-footer__notes">
            <li>Order online for pickup at the truck.</li>
            <li>Online payment is not connected yet — checkout is a demo.</li>
            <li>Check Instagram for today&apos;s hours and location.</li>
          </ul>
        </div>
      </div>
      <p className="site-footer__signoff" aria-hidden="true">
        <span>Big Flavor.</span> <em>Vegas Heat.</em>
      </p>
      <div className="container site-footer__legal">
        <p>© {year} Seared Vegas. Food photos are representative.</p>
        {site.showPendingNotices && <p>Prices, address and phone are pending owner confirmation.</p>}
      </div>
    </footer>
  );
}
