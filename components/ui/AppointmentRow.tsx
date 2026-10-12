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
  // Mobile: a grid. The date, title, and arrow share the top row, and the
  // time, provider, and badge get the full card width underneath, so
  // nothing has to wrap into a narrow middle column. From md up it's one row.
  return (
    <article className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 rounded-row border border-line bg-white p-4 transition-colors hover:border-navy-tint md:flex md:gap-5 md:px-5 md:py-4.5">
      <div className="col-start-1 row-start-1 flex h-13 w-12 shrink-0 flex-col items-center justify-center rounded-banner bg-aqua-tint text-navy md:h-18 md:w-17">
        <span className="text-tiny font-semibold uppercase">{weekday}</span>
        <span className="text-date">{day}</span>
      </div>

      {/* "contents" on mobile lets the title and details sit in the grid. */}
      <div className="contents md:flex md:min-w-0 md:flex-1 md:flex-col md:gap-1.5">
        <div className="col-start-2 row-start-1 flex min-w-0 items-center gap-2.5">
          <KidAvatar firstName={childFirstName} size={28} />
          <h3 className="min-w-0 text-h3 text-ink">
            {title}{" "}
            <span className="block text-label font-normal text-muted md:inline md:text-h3 md:font-normal">
              for {childFirstName}
            </span>
          </h3>
        </div>
        <div className="col-span-3 row-start-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-3 text-label font-normal text-muted md:gap-x-5 md:border-0 md:pt-0">
          <span className="flex items-center gap-1.75">
            <Icon name="time" size={16} />
            {timeRange}
          </span>
          <span className="flex items-center gap-1.75">
            <Icon name="provider" size={16} />
            {provider}
          </span>
        </div>
        <div className="col-span-3 row-start-3 md:hidden">
          <Badge kind={badge}>{badgeLabel}</Badge>
        </div>
      </div>

      <div className="hidden md:block">
        <Badge kind={badge}>{badgeLabel}</Badge>
      </div>

      <Link
        href={href}
        aria-label={`View details: ${title} for ${childFirstName}, ${weekday} ${day}, ${timeRange}`}
        className="col-start-3 row-start-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-white text-navy transition-colors after:absolute after:inset-0 after:rounded-row hover:bg-navy-tint md:size-10.5"
      >
        <Icon name="next" />
      </Link>
    </article>
  );
}
