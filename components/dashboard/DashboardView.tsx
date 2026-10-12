"use client";

import { useState } from "react";
import type { Center, FamilyData } from "@/lib/data";
import { AppointmentList } from "./AppointmentList";
import { BookTrainingCard } from "./BookTrainingCard";
import { CenterCard } from "./CenterCard";
import { KidPicker } from "./KidPicker";
import { OnTheWayCard } from "./OnTheWayCard";
import { TodayCard } from "./TodayCard";
import { WeekStrip } from "./WeekStrip";

type DashboardViewProps = FamilyData & { nowIso: string };

/**
 * Interactive part of the dashboard. Which child is selected lives here in
 * memory, not in the URL, so a child's name never ends up in browser history
 * or server logs.
 */
export function DashboardView({
  kids,
  appointments,
  nowIso,
}: DashboardViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    kids.length === 1 ? (kids[0]?.id ?? null) : null,
  );
  const visibleKids = selectedId
    ? kids.filter((k) => k.id === selectedId)
    : kids;
  const visible = selectedId
    ? appointments.filter((a) => a.childId === selectedId)
    : appointments;

  // Siblings almost always share a center, but don't assume it.
  const centers = [
    ...new Map(visibleKids.map((k) => [k.center.id, k.center])).values(),
  ] satisfies Center[];
  const home = centers[0] ?? kids[0]?.center;

  return (
    <div className="flex flex-col gap-7">
      <KidPicker kids={kids} selectedId={selectedId} onSelect={setSelectedId} />
      <div className="grid gap-7 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-7 lg:col-span-8">
          {home && (
            <TodayCard
              appointments={visible}
              nowIso={nowIso}
              centerPhone={home.phone}
            />
          )}
          {home && (
            <WeekStrip
              appointments={visible}
              nowIso={nowIso}
              timezone={home.timezone}
            />
          )}
          <AppointmentList appointments={visible} nowIso={nowIso} />
        </div>
        <aside
          aria-label="Booking and center info"
          className="flex min-w-0 flex-col gap-7 lg:col-span-4"
        >
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
