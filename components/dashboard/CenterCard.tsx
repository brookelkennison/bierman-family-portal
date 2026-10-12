import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { Center } from "@/lib/data";
import { zoneName } from "@/lib/time";

/** The family's center: address, phone, and which time zone the app uses. */
export function CenterCard({
  center,
  nowIso,
}: {
  center: Center;
  nowIso: string;
}) {
  const headingId = `center-${center.id}`;
  return (
    <Card aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 id={headingId} className="text-h2 text-navy">
        {center.name}
      </h2>
      <p className="flex items-start gap-1.75 text-label font-normal text-muted">
        <Icon name="location" size={16} className="mt-0.5" />
        {center.address}, {center.city}, {center.state} {center.postalCode}
      </p>
      <p className="flex items-center gap-1.75 text-label font-normal text-muted">
        <Icon name="phone" size={16} />
        <a
          href={`tel:${center.phone.replace(/\D/g, "")}`}
          className="underline-offset-4 hover:text-navy hover:underline"
        >
          {center.phone}
        </a>
      </p>
      <p className="mt-1.5 flex items-start gap-3 rounded-banner bg-aqua-tint px-4.5 py-4 text-small text-navy">
        <Icon name="time" size={16} className="mt-0.5" />
        All times are shown in {zoneName(center.timezone, nowIso)}, where your
        center is.
      </p>
    </Card>
  );
}
