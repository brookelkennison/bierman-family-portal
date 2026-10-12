import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ManageVisit } from "@/components/appointments/ManageVisit";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { Icon } from "@/components/ui/Icon";
import { KidAvatar } from "@/components/ui/KidAvatar";
import { getCurrentParent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatShortDate, formatTimeRange } from "@/lib/time";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Appointment | Bierman Family Portal",
};

/**
 * One visit (Figma 10). Loaded as the signed-in parent with RLS on, so
 * another family's id looks exactly like one that doesn't exist: a 404.
 */
export default async function AppointmentPage({
  params,
}: PageProps<"/appointments/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const parent = await getCurrentParent();
  const supabase = await createClient();
  const { data: visit } = await supabase
    .from("appointments")
    .select(
      "starts_at, ends_at, status, notes, cancel_reason, cancelled_by_kind, created_by, patient:patients(first_name), kind:appointment_types(label, family_bookable), provider:providers(display_name, credential, center:centers(name, address, city, state, postal_code, phone, timezone))",
    )
    .eq("id", id)
    .maybeSingle();
  if (!visit) notFound();

  const { center } = visit.provider;
  const tz = center.timezone;
  const childName = visit.patient.first_name;
  const minutes = Math.round(
    (Date.parse(visit.ends_at) - Date.parse(visit.starts_at)) / 60_000,
  );
  const bookedByYou = visit.created_by === parent.id;
  const nowIso = new Date().toISOString();
  const upcoming =
    visit.status === "scheduled" &&
    Date.parse(visit.ends_at) > Date.parse(nowIso);

  const badge =
    visit.status === "cancelled" ? (
      <Badge kind="cancelled">
        {visit.cancelled_by_kind
          ? `Cancelled by ${visit.cancelled_by_kind}`
          : "Cancelled"}
      </Badge>
    ) : !visit.kind.family_bookable ? (
      <Badge kind="careTeam" />
    ) : bookedByYou ? (
      <Badge kind="bookedByYou" />
    ) : (
      <Badge kind="bookedByYou">Booked by another caregiver</Badge>
    );

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/appointments"
        className="flex items-center gap-1 self-start text-label text-navy underline-offset-4 hover:underline"
      >
        <Icon name="back" size={16} />
        All appointments
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <article className="flex flex-col gap-5 rounded-card border border-line bg-white p-5 md:p-6 lg:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <KidAvatar firstName={childName} size={40} />
              <div className="flex flex-col">
                <span className="text-small text-muted">For {childName}</span>
                <h1 className="text-h1-sm text-navy">{visit.kind.label}</h1>
              </div>
            </div>
            {badge}
          </div>

          {visit.status === "cancelled" && (
            <Banner title="This visit was cancelled">
              {visit.cancel_reason ?? "It's no longer on the calendar."}
            </Banner>
          )}

          <dl className="grid gap-3 sm:grid-cols-3">
            <Tile label="Date" value={formatShortDate(visit.starts_at, tz)} />
            <Tile
              label="Time"
              value={formatTimeRange(visit.starts_at, visit.ends_at, tz)}
            />
            <Tile label="Length" value={`${minutes} minutes`} />
          </dl>

          <dl className="flex flex-col text-small">
            <Row label="With">
              {[visit.provider.display_name, visit.provider.credential]
                .filter(Boolean)
                .join(", ")}
            </Row>
            <Row label="Where">
              {center.name}, {center.address}, {center.city}, {center.state}{" "}
              {center.postal_code}
            </Row>
          </dl>

          {visit.notes && (
            <div className="flex flex-col gap-2">
              <h2 className="text-h3 text-ink">
                {bookedByYou ? "Your notes" : "Notes"}
              </h2>
              <p className="text-body whitespace-pre-line text-muted">
                {visit.notes}
              </p>
            </div>
          )}
        </article>

        <aside className="lg:col-span-4">
          {upcoming ? (
            <ManageVisit
              familyBooked={visit.kind.family_bookable}
              centerName={center.name}
              phone={center.phone}
            />
          ) : (
            <section className="flex flex-col gap-2 rounded-card border border-line bg-white p-5 md:p-6">
              <h2 className="text-h2 text-navy">
                {visit.status === "cancelled"
                  ? "Cancelled"
                  : "This visit has passed"}
              </h2>
              <p className="text-small text-muted">
                Questions about it? Call {center.name} at {center.phone}.
              </p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-banner bg-aqua-tint px-4 py-3.5">
      <dt className="text-tiny text-muted">{label}</dt>
      <dd className="text-label text-navy">{value}</dd>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 border-b border-line py-3.5 last:border-b-0">
      <dt className="w-16 shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 font-semibold text-ink">{children}</dd>
    </div>
  );
}
