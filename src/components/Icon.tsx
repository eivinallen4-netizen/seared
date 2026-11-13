/** One icon family for the whole site, drawn from /icons/sprite.svg. Colour follows currentColor. */

export type IconName =
  | "cart"
  | "close"
  | "plus"
  | "minus"
  | "check"
  | "arrow-right"
  | "arrow-left"
  | "arrow-down"
  | "pin"
  | "clock"
  | "phone"
  | "camera"
  | "trash"
  | "undo"
  | "alert"
  | "flame"
  | "wave";

export function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={`icon icon--${name} ${className}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <use href={`/icons/sprite.svg#${name}`} />
    </svg>
  );
}
