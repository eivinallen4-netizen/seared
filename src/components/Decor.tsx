/** Purely decorative pieces: sparks, fire, checker strips, burnt paper edges, brush marks. All aria-hidden. */

import type { CSSProperties } from "react";
import { SPARK_FRAMES } from "@/data/spark-sprite";

// Deterministic pseudo-random so server and client render the same markup.
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 1000) / 1000;
};

/** Rising sparks, drawn from the spark sprite sheet and kept to the edges of a section. */
export function Embers({ count = 14, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`embers ${className}`} aria-hidden="true" style={{ "--frames": SPARK_FRAMES } as CSSProperties}>
      {Array.from({ length: count }, (_, i) => {
        // Bias sparks toward the left/right edges, away from the content column.
        const edge = rand(i, 1) < 0.5 ? rand(i, 2) * 22 : 78 + rand(i, 2) * 22;
        return (
          <span
            key={i}
            style={
              {
                left: `${edge.toFixed(1)}%`,
                "--frame": Math.floor(rand(i, 7) * SPARK_FRAMES),
                "--size": `${(9 + rand(i, 3) * 15).toFixed(0)}px`,
                "--dur": `${(7 + rand(i, 4) * 9).toFixed(1)}s`,
                "--delay": `${(-rand(i, 5) * 14).toFixed(1)}s`,
                "--drift": `${((rand(i, 6) - 0.5) * 80).toFixed(0)}px`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

/** Fire licking in from the bottom corners of a dark band, plus a still field of sparks. */
export function FireCorners({ className = "" }: { className?: string }) {
  return (
    <div className={`fire-band ${className}`} aria-hidden="true">
      <span className="fire-band__sparks" />
      <span className="fire fire--l" />
      <span className="fire fire--r" />
    </div>
  );
}

export function CheckerStrip({ className = "" }: { className?: string }) {
  return <div className={`checker-strip ${className}`} aria-hidden="true" />;
}

/**
 * Torn, burnt paper edge. Sits at the top of a paper section (char above, paper below);
 * `flip` puts it at the bottom of a paper section instead.
 */
export function ScorchedEdge({ flip = false }: { flip?: boolean }) {
  return <div className={`scorched ${flip ? "scorched--flip" : ""}`} aria-hidden="true" />;
}

/** Three tapered rays. Same shape as the flares beside the big call-to-action buttons. */
export function SlashMarks({ side }: { side: "left" | "right" }) {
  return (
    <svg className={`slash-marks slash-marks--${side}`} viewBox="0 0 48 40" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 9.5L42 1.2 42.6 3 4.8 14.5ZM3 17.5L46 19.4V20.8L3 22.5ZM4.8 25.5L42.6 37 42 38.8 4 30.5Z"
      />
    </svg>
  );
}

/** Dry-brush stroke. Colour comes from CSS (it is a mask), so it always stays on brand tokens. */
export function Brush({ variant = 1, className = "" }: { variant?: 1 | 2 | 3; className?: string }) {
  return <span className={`brush brush--${variant} ${className}`} aria-hidden="true" />;
}
