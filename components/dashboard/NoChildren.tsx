import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import type { Center } from "@/lib/data";

/** A parent with no linked child yet (Figma 05). */
export function NoChildren({
  firstName,
  center,
}: {
  firstName: string;
  center: Center | null;
}) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1-sm text-navy lg:text-h1">
          Welcome, {firstName}
        </h1>
        <p className="text-muted">Your family portal is ready.</p>
      </div>
      <EmptyState
        title="No children are linked to your account yet"
        actions={
          <>
            {center && (
              <a
                href={`tel:${center.phone.replace(/\D/g, "")}`}
                className={buttonClasses({ variant: "outline" })}
              >
                <Icon name="phone" />
                <span>Call {center.name}</span>
              </a>
            )}
            <Link
              href="/help"
              className="text-button text-navy underline-offset-4 hover:underline"
            >
              Other ways to reach us
            </Link>
          </>
        }
      >
        <p>
          Your center links your child after intake. Once that happens, their
          appointments will show up here automatically.
        </p>
        <p>If you think this is a mistake, give your center a call.</p>
      </EmptyState>
    </div>
  );
}
