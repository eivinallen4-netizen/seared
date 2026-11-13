/**
 * Social proof pulled from public sources (Nov 2026).
 *
 * - Instagram: public reels by creators who tagged @searedvegas. The videos are
 *   re-encoded copies in public/reviews/ (<id>.mp4 full with sound, <id>-loop.mp4
 *   a silent 6 s preview, <id>.webp poster), credited by handle with a link back.
 * - Google: the Seared Vegas Business Profile. Quotes are verbatim excerpts
 *   (trimmed with "…"); update `google.rating` / `google.count` when they change.
 */

export type VideoReview = {
  /** Instagram reel shortcode, e.g. instagram.com/reel/<id>/ — also the file name in public/reviews/. */
  id: string;
  handle: string;
  name: string;
  verified?: boolean;
  /** Short verbatim line from the reel or its caption. */
  quote: string;
  /** What they ordered / talked about, shown as a tag. */
  ordered: string;
  /** Like count when captured; null when the post was a repost. */
  likes: number | null;
};

export const videoReviews: VideoReview[] = [
  {
    id: "De-d3KdIF6M",
    handle: "iamsemiyajanea",
    name: "Taylor",
    quote: "Everything was a 10 out of 10.",
    ordered: "Lamb chop tacos · corn ribs",
    likes: 703,
  },
  {
    id: "DYPfyIsOvrK",
    handle: "frewena",
    name: "Frewena",
    verified: true,
    quote: "They have the best lamb chops in Vegas.",
    ordered: "Lamb chops · tacos · Cajun corn",
    likes: 228,
  },
  {
    id: "DfTbkUuB8ZE",
    handle: "tcreezylasvegas",
    name: "TCreezy",
    quote: "The food phenomenal. Everyone was so welcoming.",
    ordered: "Lobster tail tacos",
    likes: 135,
  },
  {
    id: "DfY1f_3yRZC",
    handle: "tahtahchante",
    name: "Tahtah",
    quote: "I couldn’t even order just one thing.",
    ordered: "Lamb chops · lobster tacos · Kool-Aid",
    likes: null,
  },
];

export const reviewVideo = (id: string) => ({
  full: `/reviews/${id}.mp4`,
  loop: `/reviews/${id}-loop.mp4`,
  poster: `/reviews/${id}.webp`,
  instagram: `https://www.instagram.com/reel/${id}/`,
});

export const google = {
  rating: 4.9,
  count: 30,
  /** Opens the Seared Vegas listing on Google Maps. */
  url: "https://www.google.com/maps?cid=3035941438314846926",
};

export type TextReview = { name: string; quote: string };

export const googleReviews: TextReview[] = [
  { name: "Kay V", quote: "The food is exceptional. The service is exceptional. I give this place a 10 out of 10. Went back 2 days in a row." },
  { name: "Tre Cardilla", quote: "Greatest food truck around… The lamb & pasta, if I had to request a last meal, it would be from this food truck." },
  { name: "Chris Rocket", quote: "Amazing friendly staff. Fantastic flavorful and tender meat! Their loaded Cajun corn is amazing. 10/10" },
  { name: "Knot Them", quote: "That fillet mignon is tender, juicy, and cooked to perfection!" },
  { name: "Amy Burgers", quote: "Food is top notch, so good and full of flavor." },
  { name: "Karina Calimee", quote: "I’m literally writing this review while still eating because that’s how good this food is!" },
];

export const formatLikes = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n);
