import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { KidAvatar } from "@/components/ui/KidAvatar";
import type { Child } from "@/lib/data";

const programLabels: Record<Child["program"], string> = {
  focused_aba: "Focused ABA program",
  comprehensive_aba: "Comprehensive ABA program",
};

const disciplineLabels = {
  aba: "ABA therapy",
  speech: "Speech therapy",
  ot: "Occupational therapy",
} as const;

/**
 * One child's care plan (Figma 03b). Read only: the care team sets therapy
 * times, and parents only book parent training.
 */
export function CarePlanCard({ kid }: { kid: Child }) {
  return (
    <Card aria-labelledby="care-plan-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <KidAvatar firstName={kid.firstName} size={28} />
          <h2 id="care-plan-heading" className="text-h2 text-navy">
            {kid.firstName}&apos;s care plan
          </h2>
        </div>
        <span className="rounded-full bg-navy-tint px-2.5 py-1 text-tiny font-semibold text-navy">
          Set by care team
        </span>
      </div>

      <ul className="flex flex-wrap gap-2">
        <li className="rounded-full bg-aqua-tint px-3 py-1 text-tiny font-semibold text-navy">
          {programLabels[kid.program]}
        </li>
        <li className="rounded-full bg-sun-tint px-3 py-1 text-tiny font-semibold text-sun-text">
          {kid.weeklyAbaHours} hrs of ABA a week
        </li>
      </ul>

      {kid.carePlanNote && (
        <p className="text-small text-muted">{kid.carePlanNote}</p>
      )}

      {kid.careTeam.length > 0 && (
        <ul aria-label="Care team">
          {kid.careTeam.map((m) => (
            <li
              key={m.name}
              className="flex items-start gap-3 border-t border-line py-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-tint text-green-text">
                <Icon name={m.discipline} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-label text-ink">
                  {disciplineLabels[m.discipline]}
                </span>
                {m.scheduleSummary && (
                  <span className="text-small text-muted">
                    {m.scheduleSummary}
                  </span>
                )}
                <span className="text-small text-muted">
                  {[m.name, m.credential].filter(Boolean).join(", ")}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
