import type { Metadata } from "next";
import { Suspense } from "react";
import { AppointmentsView } from "@/components/appointments/AppointmentsView";
import { NoChildren } from "@/components/dashboard/NoChildren";
import { ButtonLink } from "@/components/ui/Button";
import { SkeletonList } from "@/components/ui/Skeleton";
import { getCurrentParent } from "@/lib/auth";
import { getDefaultCenter, getFamilyData } from "@/lib/data";
import { zoneName } from "@/lib/time";

export const metadata: Metadata = {
  title: "Appointments | Bierman Family Portal",
};

/** All appointments (Figma 14). Errors fall through to (app)/error.tsx. */
export default function AppointmentsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Appointments />
    </Suspense>
  );
}

async function Appointments() {
  const parent = await getCurrentParent();
  const family = await getFamilyData(parent.id);
  const nowIso = new Date().toISOString();

  if (family.kids.length === 0) {
    return (
      <NoChildren
        firstName={parent.fullName.split(" ")[0] ?? parent.fullName}
        center={await getDefaultCenter()}
      />
    );
  }

  const zone = zoneName(family.kids[0]!.center.timezone, nowIso);
  return (
    <div className="flex flex-col gap-6">
      <Header subtitle={`Everything on your family's calendar, in ${zone}.`} />
      <AppointmentsView {...family} nowIso={nowIso} />
    </div>
  );
}

function Header({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1-sm text-navy lg:text-h1">Appointments</h1>
        <p className="text-muted">{subtitle}</p>
      </div>
      <ButtonLink
        href="/book"
        variant="pink"
        iconLeft="book"
        className="self-start md:self-auto"
      >
        Book parent training
      </ButtonLink>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Header subtitle="Everything on your family's calendar." />
      <SkeletonList rows={4} label="Loading appointments" />
    </div>
  );
}
