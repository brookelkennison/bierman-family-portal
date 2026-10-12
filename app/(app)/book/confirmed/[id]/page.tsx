import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getCurrentParent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatShortDate, formatTimeRange } from "@/lib/time";

export const metadata: Metadata = {
  title: "You're booked | Bierman Family Portal",
};

/**
 * Booking confirmed (Figma 08). Loads the visit as the signed-in parent, so
 * RLS decides what's visible. Only a parent training visit this parent booked
 * shows here; any other id, or someone else's, is a plain 404.
 */
export default async function BookingConfirmedPage({
  params,
}: PageProps<"/book/confirmed/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const parent = await getCurrentParent();
  const supabase = await createClient();
  const { data: visit } = await supabase
    .from("appointments")
    .select(
      "starts_at, ends_at, type, created_by, patient:patients(first_name), kind:appointment_types(label, duration_minutes), provider:providers(display_name, credential, center:centers(name, address, timezone))",
    )
    .eq("id", id)
    .maybeSingle();

  if (
    !visit ||
    visit.type !== "parent_training" ||
    visit.created_by !== parent.id
  ) {
    notFound();
  }

  const { center } = visit.provider;
  const providerFirstName = visit.provider.display_name.split(" ")[0];
  const rows: [string, string][] = [
    ["For", visit.patient.first_name],
    ["Visit", `${visit.kind.label}, ${visit.kind.duration_minutes} min`],
    [
      "With",
      [visit.provider.display_name, visit.provider.credential]
        .filter(Boolean)
        .join(", "),
    ],
    [
      "When",
      `${formatShortDate(visit.starts_at, center.timezone)}, ${formatTimeRange(visit.starts_at, visit.ends_at, center.timezone)}`,
    ],
    ["Where", `${center.name}, ${center.address}`],
  ];

  return (
    <div className="mx-auto flex w-full max-w-160 flex-col items-center gap-5 rounded-card border border-line bg-white px-5 py-8 text-center md:px-10 md:py-10">
      <div aria-hidden className="relative h-20 w-full max-w-90">
        <span className="absolute top-0 left-1/2 flex size-16 -translate-x-1/2 items-center justify-center rounded-full bg-green-tint text-green-text">
          <Icon name="success" size={30} />
        </span>
        <span className="absolute top-2 left-6 size-3.5 rounded-full bg-pink" />
        <span className="absolute top-0 right-8 size-2.5 rounded-full bg-sun" />
        <span className="absolute top-14 right-2 size-3 rounded-full bg-aqua" />
        <span className="absolute top-16 left-0 size-2 rounded-full bg-green" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-h1-sm text-navy lg:text-h1">You&apos;re booked!</h1>
        <p className="text-muted">
          Your visit with {providerFirstName} is on the calendar. You&apos;ll
          find it on your home page.
        </p>
      </div>

      <dl className="w-full rounded-row border border-line px-4 text-left text-small">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex gap-4 border-b border-line py-3 last:border-b-0"
          >
            <dt className="w-16 shrink-0 text-muted">{label}</dt>
            <dd className="min-w-0 font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" variant="pink">
          Back to home
        </ButtonLink>
        <ButtonLink href={`/appointments/${id}`} variant="outline">
          View appointment
        </ButtonLink>
      </div>
    </div>
  );
}
