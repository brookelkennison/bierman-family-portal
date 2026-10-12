import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Help | Bierman Family Portal" };

export default function HelpPage() {
  return (
    <div className="flex max-w-200 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1-sm text-navy lg:text-h1">Help</h1>
        <p className="text-muted">
          Questions about your child&apos;s schedule or your account? Your
          center can help.
        </p>
      </div>
      <Card>
        <h2 className="text-h2 text-navy">Contact your center</h2>
        <p className="mt-2 text-muted">
          Your center can change therapy times, link a child to your account, or
          add another caregiver.
        </p>
      </Card>
      <Card>
        <h2 className="text-h2 text-navy">Looking for an evaluation?</h2>
        <p className="mt-2 text-muted">
          Our intake team schedules evaluations:{" "}
          <span className="font-semibold text-ink">(800) 931-8113</span>.
        </p>
      </Card>
    </div>
  );
}
