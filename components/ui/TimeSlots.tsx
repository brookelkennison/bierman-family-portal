"use client";

export type SlotOption = {
  /** Start time as an ISO string. */
  value: string;
  /** "10:00 AM", already in center time. */
  label: string;
  /** Someone else has it. Shown, but can't be picked. */
  taken?: boolean;
};

type TimeSlotsProps = {
  /** Visible heading, e.g. "Open times on Thu, Oct 22". */
  legend: string;
  /** Shown after the legend, e.g. "(Eastern Time)". */
  hint?: string;
  name: string;
  slots: SlotOption[];
  value: string | null;
  onChange: (value: string) => void;
};

/**
 * Pick a time (Figma 06 and 07). Taken times stay visible so the parent
 * understands why their usual time is missing.
 */
export function TimeSlots({
  legend,
  hint,
  name,
  slots,
  value,
  onChange,
}: TimeSlotsProps) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-3 text-label text-ink">
        {legend}
        {hint && <span className="font-normal text-muted"> {hint}</span>}
      </legend>
      {slots.length === 0 ? (
        <p className="text-small text-muted">
          No open times this day. Try another day.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
          {slots.map((s) => (
            <label key={s.value} className="relative">
              <input
                type="radio"
                name={name}
                value={s.value}
                checked={value === s.value}
                disabled={s.taken}
                onChange={() => onChange(s.value)}
                className="peer sr-only"
              />
              <span
                className={[
                  "flex h-12 items-center justify-center rounded-mark border text-button transition-colors",
                  "border-line bg-white text-navy",
                  "peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white",
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy",
                  "peer-disabled:cursor-not-allowed peer-disabled:border-gray-tint peer-disabled:bg-gray-tint peer-disabled:font-normal peer-disabled:text-placeholder",
                  "cursor-pointer peer-enabled:hover:border-navy",
                ].join(" ")}
              >
                {s.taken ? `${s.label} · Taken` : s.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
