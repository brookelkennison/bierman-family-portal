import Link from "next/link";
import { Badge, type BadgeKind } from "./Badge";
import { Icon } from "./Icon";
import { KidAvatar } from "./KidAvatar";

type AppointmentRowProps = {
  /** Short weekday and day of month, already in the center's time zone. */
  weekday: string;
  day: string;
  /** "ABA session", "Parent training", ... */
  title: string;
  childFirstName: string;
  /** Formatted range with zone, e.g. "9:00 AM to 2:00 PM EDT". */
  timeRange: string;
  /** "Sam Patel, BCBA" */
  provider: string;
  badge: BadgeKind;
  badgeLabel?: string;
  href: string;
};

/**
 * One appointment in a list: date tile, who and when, status, and a link.
 * The whole row is clickable (the arrow link stretches over it), and the
 * link's label reads the full appointment for screen readers.
 */
export function AppointmentRow({
  weekday,
  day,
  title,
  childFirstName,
  timeRange,
  provider,
  badge,
  badgeLabel,
  href,
}: AppointmentRowProps) {
  return (
    <article className="relative flex items-start gap-3 rounded-row border border-line bg-white px-3.5 py-4 transition-colors hover:border-navy-tint md:items-center md:gap-5 md:px-5 md:py-4.5">
      <div className="flex h-15 w-14 shrink-0 flex-col items-center justify-center rounded-banner bg-aqua-tint text-navy md:h-18 md:w-17">
        <span className="text-tiny font-semibold uppercase">{weekday}</span>
        <span className="text-date">{day}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <KidAvatar firstName={childFirstName} size={28} />
          <h3 className="min-w-0 text-h3 text-ink">
            {title}{" "}
            <span className="font-normal text-muted">for {childFirstName}</span>
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-label font-normal text-muted">
          <span className="flex items-center gap-1.75">
            <Icon name="time" size={16} />
            {timeRange}
          </span>
          <span className="flex items-center gap-1.75">
            <Icon name="provider" size={16} />
            {provider}
          </span>
        </div>
        <div className="md:hidden">
          <Badge kind={badge}>{badgeLabel}</Badge>
        </div>
      </div>

      <div className="hidden md:block">
        <Badge kind={badge}>{badgeLabel}</Badge>
      </div>

      <Link
        href={href}
        aria-label={`View details: ${title} for ${childFirstName}, ${weekday} ${day}, ${timeRange}`}
        className="flex size-9 shrink-0 items-center justify-center self-center rounded-full border border-line bg-white text-navy transition-colors after:absolute after:inset-0 after:rounded-row hover:bg-navy-tint md:size-10.5"
      >
        <Icon name="next" />
      </Link>
    </article>
  );
}
