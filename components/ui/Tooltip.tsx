"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

type TooltipProps = {
  /** Pill text, e.g. "Set by care team". */
  label: string;
  /** Bold first line of the tooltip. */
  title: string;
  children: ReactNode;
};

/**
 * "Set by care team" pill with an explanation on hover or focus (Figma 166:2).
 * The pill is a real button so keyboard and touch users can open it too.
 * Esc hides it, and the pointer can move onto the tooltip without it
 * vanishing (WCAG 1.4.13).
 */
export function Tooltip({ label, title, children }: TooltipProps) {
  const id = useId();
  const [hidden, setHidden] = useState(false);

  // Esc hides it whether it opened by hover or by focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHidden(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <span className="group/tip relative inline-flex">
      <button
        type="button"
        aria-describedby={id}
        onMouseEnter={() => setHidden(false)}
        onFocus={() => setHidden(false)}
        className="inline-flex items-center gap-1.5 rounded-full bg-navy-tint px-3 py-1.25 text-tiny font-semibold text-navy"
      >
        <Icon name="careTeam" size={14} />
        {label}
      </button>
      <span
        role="tooltip"
        id={id}
        className={[
          "absolute bottom-full left-0 z-30 mb-2 w-76 flex-col gap-1.5 rounded-mark bg-navy-deep px-4 py-3.5 text-small shadow-tooltip md:right-0 md:left-auto",
          hidden
            ? "hidden"
            : "hidden group-focus-within/tip:flex group-hover/tip:flex",
        ].join(" ")}
      >
        <span className="font-semibold text-white">{title}</span>
        <span className="text-white/90">{children}</span>
      </span>
    </span>
  );
}
