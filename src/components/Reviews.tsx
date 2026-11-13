"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatLikes, google, googleReviews, reviewVideo, videoReviews, type VideoReview } from "@/data/reviews";
import { CloseButton, Dialog } from "./Dialog";
import { Embers } from "./Decor";
import "./reviews.css";

/**
 * Social proof directly under the hero: Instagram video reviews (self-hosted
 * copies in public/reviews/) + the Google rating and quotes.
 *
 * Cards show a silent 6 s loop that only loads and plays while on screen (and not
 * at all with reduced motion). Tapping a card opens the full video with sound.
 */
export function Reviews() {
  const [playing, setPlaying] = useState<VideoReview | null>(null);
  const close = useCallback(() => setPlaying(null), []);

  return (
    <section className="reviews" id="reviews" aria-labelledby="reviews-title">
      <Embers count={10} />
      <div className="container reviews__inner">
        <header className="reviews__head">
          <p className="eyebrow eyebrow--gold">Vegas has tasted it</p>
          <h2 id="reviews-title" className="section-title section-title--cream">
            Don&apos;t take our word for it
          </h2>
          <a className="g-badge" href={google.url} target="_blank" rel="noopener noreferrer">
            <GoogleG />
            <strong>{google.rating.toFixed(1)}</strong>
            <Stars />
            <span>
              {google.count} Google reviews<span className="sr-only"> (opens Google Maps in a new tab)</span>
            </span>
          </a>
        </header>

        <h3 className="reviews__sub">
          <InstagramGlyph /> Video reviews from Vegas foodies
        </h3>
        <ul className="reel-rail" aria-label="Instagram video reviews">
          {videoReviews.map((r) => (
            <li key={r.id}>
              <ReelCard review={r} onOpen={() => setPlaying(r)} />
            </li>
          ))}
        </ul>

        <h3 className="reviews__sub">
          <GoogleG /> What people say on Google
        </h3>
        <ul className="quote-rail" aria-label="Google reviews">
          {googleReviews.map((r) => (
            <li key={r.name} className="quote-card">
              <Stars />
              <blockquote>
                <p>“{r.quote}”</p>
              </blockquote>
              <p className="quote-card__who">
                {r.name} <span>· Google review</span>
              </p>
            </li>
          ))}
        </ul>

        <div className="reviews__ctas">
          <a href="#menu" className="btn btn--flame btn--lg">
            Start Your Order <span aria-hidden="true">→</span>
          </a>
          <a className="link-plain" href={google.url} target="_blank" rel="noopener noreferrer">
            Read all {google.count} reviews on Google<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>

      <Dialog open={!!playing} onClose={close} labelledBy="reel-title" className="dialog--reel">
        {playing && <ReelPlayer review={playing} onClose={close} />}
      </Dialog>
    </section>
  );
}

function ReelCard({ review: r, onOpen }: { review: VideoReview; onOpen: () => void }) {
  const v = reviewVideo(r.id);
  const ref = useRef<HTMLVideoElement>(null);

  // Play the silent preview only while the card is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <button type="button" className="reel-card" onClick={onOpen} aria-label={`Play ${r.name}'s video review: “${r.quote}”`}>
      <video ref={ref} className="reel-card__video" src={v.loop} poster={v.poster} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />
      <span className="reel-card__shade" aria-hidden="true" />
      <span className="reel-card__top">
        <span className="reel-card__handle">
          @{r.handle}
          {r.verified && <VerifiedTick />}
        </span>
        {r.likes != null && <span className="reel-card__likes">♥ {formatLikes(r.likes)}</span>}
      </span>
      <span className="reel-card__play" aria-hidden="true">
        <PlayIcon />
      </span>
      <span className="reel-card__foot">
        <Stars />
        <span className="reel-card__quote">“{r.quote}”</span>
        <span className="reel-card__ordered">{r.ordered}</span>
      </span>
    </button>
  );
}

function ReelPlayer({ review: r, onClose }: { review: VideoReview; onClose: () => void }) {
  const v = reviewVideo(r.id);
  return (
    <div className="reel-player">
      <CloseButton onClick={onClose} label="Close video" />
      <p id="reel-title" className="reel-player__title">
        @{r.handle} on Seared Vegas
      </p>
      <video className="reel-player__video" src={v.full} poster={v.poster} controls autoPlay playsInline preload="auto" />
      <a className="reel-player__out" href={v.instagram} target="_blank" rel="noopener noreferrer">
        Watch on Instagram<span className="sr-only"> (opens in a new tab)</span> ↗
      </a>
    </div>
  );
}

/** Hero-sized one-liner: "★★★★★ 4.9 on Google · 30 reviews". Links down to #reviews. */
export function GoogleRatingLine() {
  return (
    <a className="hero-proof" href="#reviews">
      <Stars />
      <span>
        <strong>{google.rating.toFixed(1)} on Google</strong> · {google.count} reviews
      </span>
    </a>
  );
}

function Stars() {
  return (
    <span className="stars" role="img" aria-label="5 out of 5 stars">
      {"★★★★★"}
    </span>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
    </svg>
  );
}

function VerifiedTick() {
  return (
    <svg className="reel-card__tick" viewBox="0 0 24 24" width="15" height="15" role="img" aria-label="Verified">
      <path d="M12 1.5l2.6 2 3.2-.3 1 3.1 2.8 1.6-.9 3.1.9 3.1-2.8 1.6-1 3.1-3.2-.3-2.6 2-2.6-2-3.2.3-1-3.1-2.8-1.6.9-3.1-.9-3.1 2.8-1.6 1-3.1 3.2.3z" fill="#3897f0" />
      <path d="M8 12.2l2.7 2.7L16.2 9.4" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853" />
      <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2z" fill="#FBBC05" />
      <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1z" fill="#EA4335" />
    </svg>
  );
}
