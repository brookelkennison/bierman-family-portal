"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ComingSoonNote } from "@/components/ui/ComingSoonNote";

/**
 * "Manage this visit" (Figma 10). Every action is Coming soon for the
 * take-home: the buttons stay where the design puts them, but clicking only
 * explains how to make the change. No update or delete request is ever sent.
 */
export function ManageVisit({
  familyBooked,
  centerName,
  phone,
}: {
  /** Parent training a family booked: reschedule, cancel, delete. */
  familyBooked: boolean;
  centerName: string;
  phone: string;
}) {
  const [asked, setAsked] = useState(false);
  const show = () => setAsked(true);

  return (
    <section
      aria-labelledby="manage-heading"
      className="flex flex-col gap-3 rounded-card border border-line bg-white p-5 md:p-6"
    >
      <h2 id="manage-heading" className="text-h2 text-navy">
        Manage this visit
      </h2>

      {familyBooked ? (
        <>
          <Button
            variant="navy"
            iconLeft="appointments"
            fullWidth
            comingSoon
            onClick={show}
          >
            Reschedule
          </Button>
          <Button variant="outline" fullWidth comingSoon onClick={show}>
            Cancel visit
          </Button>
          <div className="mt-1 flex flex-col gap-1 border-t border-line pt-4">
            <div className="-mx-6 flex">
              <Button
                variant="dangerText"
                iconLeft="delete"
                comingSoon
                onClick={show}
              >
                Delete booking
              </Button>
            </div>
            <p className="text-small text-muted">
              Only if you booked by mistake. Canceling keeps a record for your
              care team.
            </p>
          </div>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            iconLeft="reportAbsence"
            fullWidth
            comingSoon
            onClick={show}
          >
            Report absence
          </Button>
          <p className="text-small text-muted">
            Therapy times are set by your care team.
          </p>
        </>
      )}

      {asked && <ComingSoonNote centerName={centerName} phone={phone} />}
    </section>
  );
}
