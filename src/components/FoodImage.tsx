"use client";

import Image from "next/image";
import { useState } from "react";
import { foodImages, type FoodImage as FoodImageData, type FoodImageId } from "@/data/food-images";

type Props = {
  id: FoodImageId | null;
  alt: string;
  sizes: string;
  className?: string;
  preload?: boolean;
};

/**
 * Transparent food tray layered over the page. Falls back to a drawn tray
 * silhouette while loading or when an image is missing / fails.
 */
export function FoodImage({ id, alt, sizes, className = "", preload }: Props) {
  const img = (id ? foodImages[id] : null) as FoodImageData | null;
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  if (!img || state === "error") {
    return (
      <div className={`food-img food-img--fallback ${className}`} role="img" aria-label={`${alt} (photo coming soon)`}>
        <TraySilhouette />
      </div>
    );
  }

  return (
    <div className={`food-img ${state === "loading" ? "is-loading" : ""} ${className}`} style={{ aspectRatio: `${img.width} / ${img.height}` }}>
      <Image
        src={img.src}
        width={img.width}
        height={img.height}
        alt={alt}
        sizes={sizes}
        preload={preload}
        loading={preload ? "eager" : "lazy"}
        fetchPriority={preload ? "high" : undefined}
        onLoad={() => setState("ready")}
        onError={() => setState("error")}
        draggable={false}
      />
    </div>
  );
}

function TraySilhouette() {
  return (
    <svg viewBox="0 0 200 150" aria-hidden="true">
      <path d="M38 62 L52 14 Q54 8 60 8 L140 8 Q146 8 148 14 L162 62 Z" fill="#1d1916" />
      <path d="M16 70 Q14 62 22 62 L178 62 Q186 62 184 70 L172 132 Q170 140 162 140 L38 140 Q30 140 28 132 Z" fill="#262019" />
      <path d="M30 72 L170 72 L160 128 L40 128 Z" fill="#3a2f25" />
    </svg>
  );
}
