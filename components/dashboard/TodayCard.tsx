"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Appointment } from "@/lib/data";
import { dayKey, formatShortDate, formatTimeRange } from "@/lib/time";

type TodayCardProps = {
  appointments: Appointment[];
  nowIso: string;
  /** Center phone, for the "call us for now" line under Report absence. */
  centerPhone: string;
};

/**
 * The hero card (Figma 03). Shows the next visit today, or the next visit
 * coming up if today is clear. Renders nothing when there's nothing ahead;
 * the dashboard shows its own empty state for that.
 */
export function TodayCard({
  appointments,
  nowIso,
  centerPhone,
}: TodayCardProps) {
  const [showAbsence, setShowAbsence] = useState(false);
  const now = new Date(nowIso).getTime();

  const next = appointments.find(
    (a) => a.status === "scheduled" && new Date(a.endsAt).getTime() >= now,
  );
  if (!next) return null;

  const isToday =
    dayKey(next.startsAt, next.timezone) === dayKey(nowIso, next.timezone);
  const shortDate = formatShortDate(next.startsAt, next.timezone).replace(
    ",",
    "",
  );

  return (
    <section
      aria-labelledby="today-heading"
      className="relative overflow-hidden rounded-card bg-linear-155 from-aqua-tint to-aqua-soft p-6 md:p-8"
    >
      {/* Decorative shapes from the brand, hidden on small screens. */}
      <div aria-hidden className="hidden md:block">
        <span className="absolute -top-15 -right-10 size-55 rounded-full bg-aqua opacity-20" />
        <span className="absolute top-27.5 right-37.5 size-22.5 rounded-full bg-sun opacity-55" />
        <span className="absolute top-42.5 right-17.5 size-11 rounded-full bg-pink opacity-45" />
      </div>

      <div className="relative flex max-w-150 flex-col gap-3.5">
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-white px-3 py-1.25 text-tiny font-semibold text-navy">
          <span className="text-sun">
            <Icon name="comingSoon" size={14} />
          </span>
          {isToday ? "Today" : "Next up"}
        </span>

        <h2 id="today-heading" className="text-h1-sm text-navy">
          {next.title} for {next.childFirstName}
        </h2>

        <ul className="flex flex-wrap gap-x-5.5 gap-y-2 text-label font-normal text-navy">
          <li className="flex items-center gap-1.75">
            <Icon name="date" size={16} />
            {isToday ? `Today, ${shortDate}` : shortDate}
          </li>
          <li className="flex items-center gap-1.75">
            <Icon name="time" size={16} />
            {formatTimeRange(next.startsAt, next.endsAt, next.timezone)}
          </li>
          <li className="flex items-center gap-1.75">
            <Icon name="location" size={16} />
            {next.centerName}
          </li>
        </ul>

        <div className="flex flex-wrap gap-3 pt-1.5">
          <ButtonLink
            href={`/appointments/${next.id}`}
            variant="navy"
            iconRight="arrowRight"
          >
            View details
          </ButtonLink>
          <Button
            variant="outline"
            iconLeft="reportAbsence"
            aria-expanded={showAbsence}
            aria-controls="absence-coming-soon"
            onClick={() => setShowAbsence((open) => !open)}
          >
            Report absence
          </Button>
        </div>

        {showAbsence && (
          <div
            id="absence-coming-soon"
            role="status"
            className="flex flex-col items-start gap-2 rounded-banner bg-white p-4"
          >
            <Badge kind="comingSoon" />
            <p className="text-small text-ink">
              Reporting an absence here is on the way. For now, call the center
              at{" "}
              <a
                href={`tel:${centerPhone.replace(/\D/g, "")}`}
                className="font-semibold text-navy underline underline-offset-4"
              >
                {centerPhone}
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
