import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { NoChildren } from "@/components/dashboard/NoChildren";
import { getCurrentParent } from "@/lib/auth";
import { getDefaultCenter, getFamilyData } from "@/lib/data";
import { formatLongDate, partOfDay } from "@/lib/time";

export const metadata: Metadata = { title: "Home | Bierman Family Portal" };

/** Home dashboard (Figma 03, 03b, 04, 05). */
export default function HomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const parent = await getCurrentParent();
  const family = await getFamilyData(parent.id);
  const firstName = parent.fullName.split(" ")[0] ?? parent.fullName;

  if (family.kids.length === 0) {
    return (
      <NoChildren firstName={firstName} center={await getDefaultCenter()} />
    );
  }

  const nowIso = new Date().toISOString();
  const timezone =
    family.kids[0]?.center.timezone ?? "America/Indiana/Indianapolis";

  return (
    <DashboardView
      {...family}
      nowIso={nowIso}
      greeting={`Good ${partOfDay(nowIso, timezone)}, ${firstName}`}
      longDate={formatLongDate(nowIso, timezone)}
    />
  );
}
