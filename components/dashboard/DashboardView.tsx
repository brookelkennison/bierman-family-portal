"use client";

import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import type { Center, FamilyData } from "@/lib/data";
import { AppointmentList } from "./AppointmentList";
import { BookTrainingCard } from "./BookTrainingCard";
import { CarePlanCard } from "./CarePlanCard";
import { CenterCard } from "./CenterCard";
import { KidPicker } from "./KidPicker";
import { OnTheWayCard } from "./OnTheWayCard";
import { TodayCard } from "./TodayCard";
import { WeekStrip } from "./WeekStrip";

type DashboardViewProps = FamilyData & {
  nowIso: string;
  /** "Good morning, Jordan", worked out on the server in center time. */
  greeting: string;
  /** "Monday, October 12" in center time. */
  longDate: string;
};

/**
 * Interactive part of the dashboard. Which child is selected lives here in
 * memory, not in the URL, so a child's name never ends up in browser history
 * or server logs.
 */
export function DashboardView({
  kids,
  appointments,
  nowIso,
  greeting,
  longDate,
}: DashboardViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    kids.length === 1 ? (kids[0]?.id ?? null) : null,
  );
  const selected = kids.find((k) => k.id === selectedId);
  const visibleKids = selected ? [selected] : kids;
  const visible = selected
    ? appointments.filter((a) => a.childId === selected.id)
    : appointments;

  // Siblings almost always share a center, but don't assume it.
  const centers: Center[] = [
    ...new Map(visibleKids.map((k) => [k.center.id, k.center])).values(),
  ];
  const home = centers[0];

  const now = new Date(nowIso).getTime();
  const hasUpcoming = visible.some(
    (a) => a.status === "scheduled" && new Date(a.endsAt).getTime() >= now,
  );

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1-sm text-navy lg:text-h1">{greeting}</h1>
          <p className="text-muted">
            {selected
              ? `Here's ${selected.firstName}'s week.`
              : "Here's what's coming up for your family."}
          </p>
        </div>
        <p className="flex items-center gap-2 text-label text-ink">
          <Icon name="date" />
          {longDate}
        </p>
      </div>

      <KidPicker kids={kids} selectedId={selectedId} onSelect={setSelectedId} />

      <div className="grid gap-7 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-7 lg:col-span-8">
          {hasUpcoming && home ? (
            <>
              <TodayCard
                appointments={visible}
                nowIso={nowIso}
                centerPhone={home.phone}
              />
              <WeekStrip
                appointments={visible}
                nowIso={nowIso}
                timezone={home.timezone}
                childName={selected?.firstName}
              />
            </>
          ) : (
            <EmptyState
              title={`Nothing coming up for ${selected?.firstName ?? "your family"}`}
              actions={
                <>
                  <ButtonLink href="/book" variant="outline" iconLeft="book">
                    Book parent training
                  </ButtonLink>
                  <Link
                    href="/appointments"
                    className="text-button text-navy underline-offset-4 hover:underline"
                  >
                    See past visits
                  </Link>
                </>
              }
            >
              <p>
                When your care team schedules a visit, it shows up here
                automatically.
              </p>
              <p>
                You can still book parent training with your child&apos;s BCBA.
              </p>
            </EmptyState>
          )}
          <AppointmentList
            appointments={visible}
            nowIso={nowIso}
            childName={selected?.firstName}
          />
        </div>
        <aside
          aria-label="Care plan and center info"
          className="flex min-w-0 flex-col gap-7 lg:col-span-4"
        >
          {selected && <CarePlanCard kid={selected} />}
          <BookTrainingCard kids={visibleKids} />
          {centers.map((c) => (
            <CenterCard key={c.id} center={c} nowIso={nowIso} />
          ))}
          <OnTheWayCard />
        </aside>
      </div>
    </div>
  );
}
