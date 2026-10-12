"use client";

import Link from "next/link";
import { useState } from "react";
import { AppointmentRow } from "@/components/ui/AppointmentRow";
import type { BadgeKind } from "@/components/ui/Badge";
import type { Appointment } from "@/lib/data";
import { dateTile, formatTimeRange } from "@/lib/time";
import { Segmented } from "@/components/ui/Segmented";

type Tab = "upcoming" | "past";

const LIMIT = 5;

function badgeFor(a: Appointment): { kind: BadgeKind; label?: string } {
  if (a.status === "cancelled") {
    return {
      kind: "cancelled",
      label: a.cancelledByKind
        ? `Cancelled by ${a.cancelledByKind}`
        : undefined,
    };
  }
  if (a.bookedBy === "you") return { kind: "bookedByYou" };
  if (a.bookedBy === "otherCaregiver")
    return { kind: "bookedByYou", label: "Booked by another caregiver" };
  return { kind: "careTeam" };
}

type AppointmentListProps = {
  appointments: Appointment[];
  /** Server time, so server and browser agree on what's upcoming. */
  nowIso: string;
  /** "Leo" when one child is selected, for "Leo's appointments". */
  childName?: string;
};

/** "Appointments" card with Upcoming / Past (Figma 03). */
export function AppointmentList({
  appointments,
  nowIso,
  childName,
}: AppointmentListProps) {
  const [tab, setTab] = useState<Tab>("upcoming");
  const now = new Date(nowIso).getTime();

  const upcoming = appointments.filter(
    (a) => a.status !== "cancelled" && new Date(a.endsAt).getTime() >= now,
  );
  const past = appointments
    .filter(
      (a) => new Date(a.endsAt).getTime() < now || a.status === "cancelled",
    )
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const list = (tab === "upcoming" ? upcoming : past).slice(0, LIMIT);

  return (
    <section
      aria-labelledby="appointments-heading"
      className="flex flex-col gap-4 rounded-card border border-line bg-white p-5 md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="appointments-heading" className="text-h2 text-navy">
          {childName ? `${childName}'s appointments` : "Appointments"}
        </h2>
        <Segmented
          label="Which appointments"
          value={tab}
          onChange={setTab}
          options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "past", label: "Past" },
          ]}
        />
      </div>

      {list.length === 0 ? (
        <p className="py-6 text-center text-muted">
          {tab === "upcoming"
            ? "Nothing coming up right now."
            : "No past visits in the last 30 days."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((a) => {
            const tile = dateTile(a.startsAt, a.timezone);
            const badge = badgeFor(a);
            return (
              <li key={a.id}>
                <AppointmentRow
                  weekday={tile.weekday}
                  day={tile.day}
                  title={a.title}
                  childFirstName={a.childFirstName}
                  timeRange={formatTimeRange(a.startsAt, a.endsAt, a.timezone)}
                  provider={a.provider}
                  badge={badge.kind}
                  badgeLabel={badge.label}
                  href={`/appointments/${a.id}`}
                />
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/appointments"
        className="self-start text-label text-navy underline-offset-4 hover:underline"
      >
        See all appointments
      </Link>
    </section>
  );
}
