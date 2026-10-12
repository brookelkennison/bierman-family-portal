"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { kidTint } from "@/components/ui/KidAvatar";
import type { Appointment } from "@/lib/data";
import {
  addDays,
  dayKey,
  dayKeyLabels,
  formatTimeRangeShort,
  nextMonday,
} from "@/lib/time";

/** One week back ("This week") to seven ahead, matching the data window. */
const MIN_OFFSET = -1;
const MAX_OFFSET = 7;

type WeekStripProps = {
  appointments: Appointment[];
  nowIso: string;
  timezone: string;
};

/** Mon to Fri at a glance (Figma 03). Starts on next week. */
export function WeekStrip({ appointments, nowIso, timezone }: WeekStripProps) {
  const [offset, setOffset] = useState(0);
  const monday = addDays(nextMonday(dayKey(nowIso, timezone)), offset * 7);
  const days = [0, 1, 2, 3, 4].map((i) => addDays(monday, i));

  const heading =
    offset === -1
      ? "This week"
      : offset === 0
        ? "Next week"
        : `Week of ${dayKeyLabels(monday).date}`;

  const byDay = new Map<string, Appointment[]>();
  for (const a of appointments) {
    if (a.status === "cancelled") continue;
    const key = dayKey(a.startsAt, a.timezone);
    byDay.set(key, [...(byDay.get(key) ?? []), a]);
  }

  return (
    <section
      aria-labelledby="week-heading"
      className="flex flex-col gap-4 rounded-card border border-line bg-white p-5 md:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="week-heading" aria-live="polite" className="text-h2 text-navy">
          {heading}
        </h2>
        <div className="flex gap-2">
          <WeekButton
            icon="back"
            label="Previous week"
            disabled={offset <= MIN_OFFSET}
            onClick={() => setOffset((o) => o - 1)}
          />
          <WeekButton
            icon="next"
            label="Following week"
            disabled={offset >= MAX_OFFSET}
            onClick={() => setOffset((o) => o + 1)}
          />
        </div>
      </div>

      <ul className="grid gap-3 md:grid-cols-5">
        {days.map((key) => {
          const labels = dayKeyLabels(key);
          const visits = byDay.get(key) ?? [];
          return (
            <li
              key={key}
              className="flex min-w-0 flex-col gap-2.5 rounded-banner border border-line p-3"
            >
              <h3 className="flex items-baseline justify-between gap-2 text-small">
                <span className="font-semibold text-ink">
                  <span className="sr-only">{labels.longWeekday}</span>
                  <span aria-hidden>{labels.weekday}</span>
                </span>
                <span className="text-muted">{labels.date}</span>
              </h3>
              {visits.length === 0 ? (
                <p className="text-tiny text-muted">Nothing scheduled</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {visits.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/appointments/${a.id}`}
                        className={`block rounded-mark px-2.5 py-2 text-tiny transition-[filter] hover:brightness-95 ${kidTint(a.childFirstName)}`}
                      >
                        <span className="block font-semibold text-ink">
                          {a.childFirstName} · {a.shortLabel}
                        </span>
                        <span className="block text-muted">
                          {formatTimeRangeShort(
                            a.startsAt,
                            a.endsAt,
                            a.timezone,
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function WeekButton({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: "back" | "next";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full border border-line text-navy transition-colors hover:bg-navy-tint disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon name={icon} />
    </button>
  );
}
