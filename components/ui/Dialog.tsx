"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";
import type { IconName } from "./icons";

type DialogProps = {
  open: boolean;
  /**
   * Called on Esc or any other close. A backdrop click does nothing on
   * purpose: a stray tap shouldn't dismiss a delete confirm.
   */
  onClose: () => void;
  title: string;
  /** Big icon above the title, e.g. "delete" for Figma 12. */
  icon?: IconName;
  tone?: "danger" | "info";
  children: ReactNode;
  /**
   * Buttons, stacked full width. Put data-autofocus on the safe one
   * ("Keep it") so Enter never deletes by accident.
   */
  actions: ReactNode;
};

const tones = {
  danger: "bg-danger-tint text-danger",
  info: "bg-aqua-tint text-navy",
};

/**
 * Confirm dialog (Figma 12). Native <dialog> with showModal(), so the
 * browser traps focus, closes on Esc, makes the page behind inert, and
 * returns focus to the button that opened it.
 */
export function Dialog({
  open,
  onClose,
  title,
  icon,
  tone = "danger",
  children,
  actions,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-105 rounded-card bg-white p-0 text-ink shadow-tab backdrop:bg-navy/40"
    >
      <div className="flex flex-col gap-4 p-6.5">
        {icon && (
          <span
            aria-hidden
            className={`flex size-14 items-center justify-center rounded-full ${tones[tone]}`}
          >
            <Icon name={icon} size={24} />
          </span>
        )}
        <h2 id={titleId} className="text-h1-sm text-navy">
          {title}
        </h2>
        <div id={bodyId} className="text-body text-muted">
          {children}
        </div>
        <div className="mt-2 flex flex-col gap-3">{actions}</div>
      </div>
    </dialog>
  );
}
