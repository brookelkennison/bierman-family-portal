import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Child } from "@/lib/data";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Parent training is the one visit families book themselves, always with
 * their child's BCBA (Figma 03). Therapy itself is set by the care team.
 */
export function BookTrainingCard({ kids }: { kids: Child[] }) {
  const rows = kids.flatMap((kid) => {
    const bcba = kid.careTeam.find((m) => m.discipline === "aba");
    return bcba ? [{ kid, bcba }] : [];
  });

  return (
    <section
      aria-labelledby="book-training-heading"
      className="flex flex-col gap-3.5 rounded-card bg-pink-tint p-7"
    >
      <h2 id="book-training-heading" className="text-h2 text-navy">
        Book parent training
      </h2>
      <p className="text-small text-ink">
        Meet with your child&apos;s BCBA to practice strategies for home.
        Therapy times are set by your care team.
      </p>

      {rows.length > 0 && (
        <ul className="flex flex-col gap-3.5">
          {rows.map(({ kid, bcba }) => (
            <li key={kid.id}>
              <Link
                href="/book"
                className="flex items-center gap-3 rounded-row bg-white px-4.5 py-4 transition-colors hover:bg-navy-tint"
              >
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-aqua-tint text-label font-bold text-navy"
                >
                  {initials(bcba.name)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-body font-semibold text-ink">
                    For {kid.firstName}
                  </span>
                  <span className="text-small text-muted">
                    with{" "}
                    {[bcba.name, bcba.credential].filter(Boolean).join(", ")}
                  </span>
                </span>
                <span className="text-navy">
                  <Icon name="next" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <ButtonLink href="/book" variant="pink" iconLeft="book" fullWidth>
        Book parent training
      </ButtonLink>
    </section>
  );
}
