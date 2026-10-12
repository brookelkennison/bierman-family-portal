"use client";

export type DayOption = {
  /** Day key like "2026-10-22", in the center's time zone. */
  value: string;
  /** "Thu" */
  weekday: string;
  /** "22" */
  day: string;
  /** Full name for screen readers, e.g. "Thursday, October 22". */
  label: string;
  /** No open times that day. */
  disabled?: boolean;
  /** Short line under the date: "Open", "Off", or "Full". */
  caption?: string;
};

type DayRowProps = {
  /** Visible group label, e.g. "October 2026". */
  legend: string;
  /** Radio group name, unique on the page. */
  name: string;
  days: DayOption[];
  value: string | null;
  onChange: (value: string) => void;
};

/**
 * Pick a day (Figma 06 and 07). Real radio buttons under the tiles, so
 * arrow keys, Tab, and screen readers work without extra code.
 */
export function DayRow({ legend, name, days, value, onChange }: DayRowProps) {
  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{legend}</legend>
      <div className="grid grid-cols-5 gap-2 sm:flex sm:gap-2.5">
        {days.map((d) => (
          <label key={d.value} className="relative sm:w-17">
            <input
              type="radio"
              name={name}
              value={d.value}
              checked={value === d.value}
              disabled={d.disabled}
              onChange={() => onChange(d.value)}
              aria-label={
                d.disabled
                  ? `${d.label}, ${d.caption?.toLowerCase() ?? "no open times"}`
                  : d.label
              }
              className="peer sr-only"
            />
            <span
              aria-hidden
              className={[
                "flex flex-col items-center gap-0.5 rounded-banner border py-3 transition-colors",
                "border-line bg-white text-ink",
                "peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white",
                "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy",
                "peer-disabled:cursor-not-allowed peer-disabled:bg-gray-tint peer-disabled:text-placeholder",
                "cursor-pointer peer-enabled:hover:border-navy",
              ].join(" ")}
            >
              <span className="text-small">{d.weekday}</span>
              <span className="text-date">{d.day}</span>
              {d.caption && (
                <span className="text-micro font-normal">{d.caption}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
