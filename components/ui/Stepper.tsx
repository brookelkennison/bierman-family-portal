import { Icon } from "./Icon";

type StepperProps = {
  steps: string[];
  /** Index of the step the parent is on, starting at 0. */
  current: number;
};

/**
 * Booking progress (Figma 06 and 07). Desktop shows every step by name;
 * mobile shows "Step 4 of 5" and a bar, since five labels won't fit.
 */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <nav aria-label="Booking steps">
      <ol className="hidden items-center gap-3 rounded-card border border-line bg-white px-5 py-3.5 md:flex">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={step}
              aria-current={active ? "step" : undefined}
              className="flex flex-1 items-center gap-3 last:flex-none"
            >
              <span className="flex shrink-0 items-center gap-2">
                <span
                  className={[
                    "flex size-6 items-center justify-center rounded-full text-tiny font-semibold",
                    done
                      ? "bg-green-tint text-green-text"
                      : active
                        ? "bg-navy text-white"
                        : "border border-line text-muted",
                  ].join(" ")}
                >
                  {done ? <Icon name="success" size={14} /> : i + 1}
                </span>
                <span
                  className={[
                    "text-small",
                    active ? "font-semibold text-navy" : "text-ink",
                  ].join(" ")}
                >
                  {step}
                  {done && <span className="sr-only"> (done)</span>}
                </span>
              </span>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={`h-0.5 flex-1 rounded-full ${done ? "bg-green" : "bg-line"}`}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col gap-2 md:hidden">
        <p className="text-label text-aqua-text">
          Step {current + 1} of {steps.length}
          <span className="font-normal text-muted"> · {steps[current]}</span>
        </p>
        {/* Segments instead of a width style, so the strict CSP stays happy. */}
        <div
          aria-hidden
          className="flex h-2 overflow-hidden rounded-full bg-line"
        >
          {steps.map((step, i) => (
            <span
              key={step}
              className={`flex-1 ${i <= current ? "bg-green" : ""}`}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
