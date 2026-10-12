import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { Icon } from "@/components/ui/Icon";
import { getCurrentParent } from "@/lib/auth";
import { getFamilyData } from "@/lib/data";
import { formatLongDate, partOfDay } from "@/lib/time";

export const metadata: Metadata = { title: "Home | Bierman Family Portal" };

/** Home dashboard (Figma 03 and 04). */
export default async function HomePage() {
  const parent = await getCurrentParent();
  const family = await getFamilyData(parent.id);
  const nowIso = new Date().toISOString();
  const firstName = parent.fullName.split(" ")[0];
  const timezone =
    family.kids[0]?.center.timezone ?? "America/Indiana/Indianapolis";

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1-sm text-navy lg:text-h1">
            Good {partOfDay(nowIso, timezone)}, {firstName}
          </h1>
          <p className="text-muted">
            Here&apos;s what&apos;s coming up for your family.
          </p>
        </div>
        <p className="flex items-center gap-2 text-label text-ink">
          <Icon name="date" />
          {formatLongDate(nowIso, timezone)}
        </p>
      </div>

      {/* No-children empty state arrives in 30c. */}
      <DashboardView {...family} nowIso={nowIso} />
    </div>
  );
}
