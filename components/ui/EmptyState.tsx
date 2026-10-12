import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  children: ReactNode;
  /** Buttons or links, like "See upcoming". */
  actions?: ReactNode;
};

/** Friendly "nothing here" card with the soft circles illustration (Figma 15c). */
export function EmptyState({ title, children, actions }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center gap-8 rounded-card border border-line bg-white p-8 text-center md:flex-row md:p-16 md:text-left">
      <Illustration />
      <div className="flex flex-col items-center gap-3 md:items-start">
        <h2 className="text-h1-sm text-navy">{title}</h2>
        <div className="flex flex-col gap-2 text-muted">{children}</div>
        {actions && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}

function Illustration() {
  return (
    <div aria-hidden="true" className="relative size-50 shrink-0">
      <div className="absolute inset-0 rounded-full bg-aqua-tint" />
      <div className="absolute top-8 -left-1 size-16 rounded-full border-4 border-white bg-pink-tint" />
      <div className="absolute top-4 right-0 size-16 rounded-full border-4 border-white bg-green-tint" />
      <div className="absolute right-1 bottom-12 size-6 rounded-full bg-sun" />
      <div className="absolute top-1/2 left-1/2 flex size-22 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-dashed border-aqua text-h2 font-normal text-navy">
        +
      </div>
    </div>
  );
}
