"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

// Count open modals so stacked dialogs (cart → edit item) keep the page scroll-locked.
let openModals = 0;
const syncScrollLock = () => document.documentElement.classList.toggle("has-modal", openModals > 0);

/**
 * Accessible modal built on native <dialog>: focus is trapped, Esc closes,
 * the page behind is inert, and focus returns to the opener on close.
 */
export function Dialog({
  open,
  onClose,
  labelledBy,
  className = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      d.showModal();
      openModals++;
      syncScrollLock();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handleClose = () => {
      openModals = Math.max(0, openModals - 1);
      syncScrollLock();
      (opener.current as HTMLElement | null)?.focus?.();
      onClose();
    };
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    d.addEventListener("close", handleClose);
    d.addEventListener("cancel", handleCancel);
    return () => {
      d.removeEventListener("close", handleClose);
      d.removeEventListener("cancel", handleCancel);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      aria-labelledby={labelledBy}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {open && children}
    </dialog>
  );
}

export function CloseButton({ onClick, label = "Close" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="icon-btn dialog__close" onClick={onClick} aria-label={label}>
      <Icon name="close" size={22} />
    </button>
  );
}

export function QuantityStepper({
  value,
  onChange,
  max,
  label,
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  max: number;
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={`stepper stepper--${size}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={`Decrease ${label.toLowerCase()}`}>
        <Icon name="minus" size={20} />
      </button>
      <output aria-live="polite" aria-label={`${label}: ${value}`}>{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Increase ${label.toLowerCase()}`}>
        <Icon name="plus" size={20} />
      </button>
    </div>
  );
}
