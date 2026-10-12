import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/icons";

const teasers: { icon: IconName; title: string; detail: string }[] = [
  {
    icon: "progress",
    title: "Progress, as it happens",
    detail: "Goals and graphs after every session",
  },
  {
    icon: "sessionNote",
    title: "Today's session note",
    detail: "What happened, in plain words",
  },
  {
    icon: "practice",
    title: "Practice at home",
    detail: "Log the goals your BCBA sets",
  },
  {
    icon: "paperwork",
    title: "Paperwork and billing",
    detail: "Sign, pay, and track insurance hours",
  },
  {
    icon: "careCircle",
    title: "Care circle",
    detail: "School and doctors in one view",
  },
];

/** Features that aren't built yet, so parents know what's coming. */
export function OnTheWayCard() {
  return (
    <Card
      aria-labelledby="on-the-way-heading"
      className="flex flex-col gap-1.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5">
        <h2 id="on-the-way-heading" className="text-h2 text-navy">
          On the way
        </h2>
        <Badge kind="comingSoon" />
      </div>
      <ul>
        {teasers.map((t) => (
          <li
            key={t.title}
            className="flex items-center gap-3 border-t border-line py-2.5"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-aqua-tint text-navy">
              <Icon name={t.icon} />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-label text-ink">{t.title}</span>
              <span className="text-small text-muted">{t.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
