"use client";

import { useState } from "react";
import { DayRow } from "@/components/ui/DayRow";
import { Stepper } from "@/components/ui/Stepper";
import { TimeSlots } from "@/components/ui/TimeSlots";

const steps = ["Child", "Visit", "Where", "Date and time", "Review"];

const days = [
  {
    value: "2026-10-19",
    weekday: "Mon",
    day: "19",
    label: "Monday, October 19",
  },
  {
    value: "2026-10-20",
    weekday: "Tue",
    day: "20",
    label: "Tuesday, October 20",
  },
  {
    value: "2026-10-21",
    weekday: "Wed",
    day: "21",
    label: "Wednesday, October 21",
    disabled: true,
  },
  {
    value: "2026-10-22",
    weekday: "Thu",
    day: "22",
    label: "Thursday, October 22",
  },
  {
    value: "2026-10-23",
    weekday: "Fri",
    day: "23",
    label: "Friday, October 23",
  },
];

const slots = [
  { value: "09", label: "9:00 AM", taken: true },
  { value: "10", label: "10:00 AM" },
  { value: "11", label: "11:00 AM" },
  { value: "13", label: "1:00 PM", taken: true },
  { value: "14", label: "2:00 PM" },
  { value: "15", label: "3:00 PM" },
];

/** Client wrapper so the styleguide can show the pickers working. */
export function BookingDemo() {
  const [step, setStep] = useState(3);
  const [day, setDay] = useState<string | null>("2026-10-22");
  const [slot, setSlot] = useState<string | null>("10");
  return (
    <div className="flex flex-col gap-6">
      <Stepper steps={steps} current={step} />
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className="rounded-full border border-line px-3 py-1 text-small"
          >
            {i + 1}
          </button>
        ))}
      </div>
      <DayRow
        legend="October 2026"
        name="demo-day"
        days={days}
        value={day}
        onChange={setDay}
      />
      <TimeSlots
        legend="Open times on Thu, Oct 22"
        hint="(Eastern Time)"
        name="demo-time"
        slots={slots}
        value={slot}
        onChange={setSlot}
      />
      <TimeSlots
        legend="Open times on Wed, Oct 21"
        name="demo-none"
        slots={[]}
        value={null}
        onChange={() => {}}
      />
    </div>
  );
}
