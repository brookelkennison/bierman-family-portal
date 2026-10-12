"use client";

type SegmentedProps<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** Pill switch like "Upcoming / Past" (Figma 03). Buttons with aria-pressed. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex gap-1.5 rounded-full bg-page p-1.5"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={[
              "rounded-full px-4 py-2.25 text-body transition-colors sm:px-5",
              active
                ? "bg-white font-semibold text-navy shadow-tab"
                : "font-medium text-muted hover:text-navy",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
