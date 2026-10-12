import type { ReactNode } from "react";

/** Numbered card for one question on the booking page (Figma 06). */
export function Section({
  number,
  title,
  hint,
  aside,
  children,
}: {
  number: number;
  title: ReactNode;
  hint?: string;
  /** Right side of the heading row, like week arrows. */
  aside?: ReactNode;
  children: ReactNode;
}) {
  const id = `book-step-${number}`;
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-4 rounded-card border border-line bg-white p-5 md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={id} className="flex items-center gap-3 text-h2 text-navy">
          <span
            aria-hidden
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-aqua-tint text-tiny font-semibold"
          >
            {number}
          </span>
          <span>{title}</span>
        </h2>
        {aside}
      </div>
      {hint && <p className="-mt-2 text-small text-muted">{hint}</p>}
      {children}
    </section>
  );
}
