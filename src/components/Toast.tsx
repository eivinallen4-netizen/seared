"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "./Icon";

type ToastData = {
  id: number;
  message: string;
  detail?: string;
  action?: { label: string; onClick: () => void };
};

let current: ToastData | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const toastStore = {
  show(t: Omit<ToastData, "id">) {
    current = { ...t, id: Date.now() };
    emit();
  },
  hide() {
    current = null;
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export const useToast = () => toastStore;

export function ToastRegion() {
  const toast = useSyncExternalStore(
    toastStore.subscribe,
    () => current,
    () => null,
  );

  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!toast || held) return;
    const t = window.setTimeout(() => toastStore.hide(), 6000);
    return () => window.clearTimeout(t);
  }, [toast, held]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div
          className="toast"
          key={toast.id}
          onPointerEnter={() => setHeld(true)}
          onPointerLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
        >
          <span className="toast__icon" aria-hidden="true">
            <Icon name="check" size={16} />
          </span>
          <div className="toast__text">
            <p className="toast__msg">{toast.message}</p>
            {toast.detail && <p className="toast__detail">{toast.detail}</p>}
          </div>
          {toast.action && (
            <button
              type="button"
              className="btn btn--cream btn--sm"
              onClick={() => {
                toast.action!.onClick();
                toastStore.hide();
              }}
            >
              {toast.action.label}
            </button>
          )}
          <button type="button" className="icon-btn toast__close" aria-label="Dismiss" onClick={() => toastStore.hide()}>
            <Icon name="close" size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
