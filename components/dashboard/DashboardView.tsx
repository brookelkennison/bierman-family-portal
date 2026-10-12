"use client";

import { useState } from "react";
import type { FamilyData } from "@/lib/data";
import { AppointmentList } from "./AppointmentList";
import { KidPicker } from "./KidPicker";

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
  const visible = selectedId
    ? appointments.filter((a) => a.childId === selectedId)
    : appointments;

  return (
    <div className="flex flex-col gap-7">
      <KidPicker kids={kids} selectedId={selectedId} onSelect={setSelectedId} />
      <div className="grid gap-7 lg:grid-cols-12">
        <div className="flex flex-col gap-7 lg:col-span-8">
          <AppointmentList appointments={visible} nowIso={nowIso} />
        </div>
        {/* Side column (book, center, on the way) arrives in 30b. */}
      </div>
    </div>
  );
}
