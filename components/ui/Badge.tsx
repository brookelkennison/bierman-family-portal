import { Icon } from "./Icon";
import type { IconName } from "./icons";

export type BadgeKind = "careTeam" | "bookedByYou" | "cancelled" | "comingSoon";

const kinds: Record<
  BadgeKind,
  { label: string; icon: IconName; className: string }
> = {
  careTeam: {
    label: "Scheduled by your care team",
    icon: "careTeam",
    className: "bg-navy-tint px-3 py-1.25 text-tiny font-semibold text-navy",
  },
  bookedByYou: {
    label: "Booked by you",
    icon: "bookedByYou",
    className:
      "bg-green-tint px-3 py-1.25 text-tiny font-semibold text-green-text",
  },
  cancelled: {
    label: "Cancelled",
    icon: "cancelled",
    className: "bg-gray-tint px-3 py-1.25 text-tiny font-semibold text-muted",
  },
  comingSoon: {
    label: "Coming soon",
    icon: "comingSoon",
    className: "bg-sun px-2.5 py-0.75 text-micro text-sun-text shadow-tab",
  },
};

type BadgeProps = {
  kind: BadgeKind;
  /** Override the default wording, e.g. "Cancelled by center". */
  children?: string;
};

/** Status pill. Always text plus an icon, never color alone. */
export function Badge({ kind, children }: BadgeProps) {
  const { label, icon, className } = kinds[kind];
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full ${className}`}
    >
      <Icon name={icon} size={14} />
      {children ?? label}
    </span>
  );
}
