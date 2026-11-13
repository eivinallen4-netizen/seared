import { appleMapsUrl, directionsUrl, fullAddress, site } from "@/config/site";
import { CheckerStrip, ScorchedEdge } from "./Decor";
import { Icon } from "./Icon";

export function FindTruck() {
  return (
    <section className="truck" id="truck" aria-labelledby="truck-title">
      <CheckerStrip className="checker-strip--top" />
      <ScorchedEdge />
      <div className="container truck__grid">
        <div className="truck__copy">
          <p className="eyebrow eyebrow--red">Pull up hungry</p>
          <h2 id="truck-title" className="section-title section-title--ink section-title--left">
            Find the Truck
          </h2>
          <p className="truck__lede">{site.location.scheduleNote}</p>

          <dl className="truck__facts">
            <div>
              <dt><Icon name="pin" size={18} /> Location</dt>
              <dd>
                <address>{fullAddress}</address>
                {site.showPendingNotices && !site.location.confirmed && <span className="pending-tag">Pending owner confirmation</span>}
              </dd>
            </div>
            <div>
              <dt><Icon name="phone" size={18} /> Call</dt>
              <dd>
                <a href={`tel:${site.phone.tel}`}>{site.phone.display}</a>
                {site.showPendingNotices && !site.phone.confirmed && <span className="pending-tag">Pending owner confirmation</span>}
              </dd>
            </div>
            <div>
              <dt><Icon name="camera" size={18} /> Follow</dt>
              <dd>
                <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
                  {site.instagram.handle}
                  <span className="sr-only"> on Instagram (opens in a new tab)</span>
                </a>
              </dd>
            </div>
            <div>
              <dt><Icon name="clock" size={18} /> Hours</dt>
              <dd>{site.hours ? site.hours.label : "Posted on Instagram — check before you go"}</dd>
            </div>
          </dl>

          <div className="truck__ctas">
            <a className="btn btn--flame btn--lg" href="#menu">
              Start Your Order
            </a>
            <a className="btn btn--outline btn--lg" href={directionsUrl} target="_blank" rel="noopener noreferrer">
              Get Directions<span className="sr-only"> in Google Maps (opens in a new tab)</span>
            </a>
          </div>
          <p className="truck__alt">
            On iPhone? <a href={appleMapsUrl} target="_blank" rel="noopener noreferrer">Open in Apple Maps</a>
          </p>
        </div>

        {/* Stylised map card — no third-party embed, so nothing loads until the visitor asks for directions. */}
        <a className="map-card" href={directionsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${fullAddress} (opens Google Maps in a new tab)`}>
          <div className="map-card__map" aria-hidden="true">
            <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
              <rect width="400" height="300" fill="#efe0bf" />
              <g stroke="#e2cfa4" strokeWidth="14" fill="none">
                <path d="M-10 70 H410" />
                <path d="M-10 230 H410" />
                <path d="M90 -10 V310" />
                <path d="M300 -10 V310" />
              </g>
              <g stroke="#d8c08e" strokeWidth="5" fill="none">
                <path d="M-10 25 H410 M-10 115 H410 M-10 190 H410 M-10 275 H410" />
                <path d="M40 -10 V310 M150 -10 V310 M210 -10 V310 M250 -10 V310 M355 -10 V310" />
              </g>
              <path d="M-10 160 H410" stroke="#1a1410" strokeWidth="20" />
              <path d="M-10 160 H410" stroke="#f2b632" strokeWidth="2" strokeDasharray="14 12" />
              <text x="20" y="150" fill="#5b4532" fontSize="13" fontWeight="700" fontFamily="sans-serif" letterSpacing="2">
                E CHARLESTON BLVD
              </text>
            </svg>
            <div className="map-card__pin">
              <svg viewBox="0 0 40 52" width="48" height="62">
                <path d="M20 2C10 2 3 9.5 3 19c0 12.5 17 31 17 31s17-18.5 17-31C37 9.5 30 2 20 2z" fill="#d63b17" stroke="#18110c" strokeWidth="3" />
                <circle cx="20" cy="19" r="8.5" fill="#f6ead0" />
                <path d="M20.3 12.5c.2 2.4 3.1 3.7 3.1 7.1a3.4 3.4 0 0 1-6.8 0c0-1.5.7-2.4 1.3-3.2.3.9.8 1.3 1.2 1.4-.3-2.1-.1-3.9 1.2-5.300z" fill="#d63b17" />
              </svg>
            </div>
          </div>
          <div className="map-card__foot">
            <span>
              <strong>Seared Vegas</strong>
              <small>{fullAddress}</small>
            </span>
            <span className="map-card__go">Directions <Icon name="arrow-right" size={18} /></span>
          </div>
        </a>
      </div>
      <ScorchedEdge flip />
    </section>
  );
}
