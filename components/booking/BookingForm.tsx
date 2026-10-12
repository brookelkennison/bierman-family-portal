"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { DayRow, type DayOption } from "@/components/ui/DayRow";
import { Icon } from "@/components/ui/Icon";
import { KidAvatar } from "@/components/ui/KidAvatar";
import { KidBubble } from "@/components/ui/KidBubble";
import { Stepper } from "@/components/ui/Stepper";
import { TimeSlots } from "@/components/ui/TimeSlots";
import { Tooltip } from "@/components/ui/Tooltip";
import type { BookingData } from "@/lib/booking/data";
import { NOTES_MAX } from "@/lib/booking/schema";
import { isOffDay, slotsForDay } from "@/lib/booking/slots";
import {
  addDays,
  dayKey,
  dayKeyLabels,
  formatShortDate,
  formatClock,
  formatTimeRange,
  formatWallClock,
  monthLabel,
  zoneName,
} from "@/lib/time";
import { Section } from "./Section";

const STEPS = ["Child", "Provider", "Date and time", "Review"];
const MAX_WEEKS = 9;

const disciplineLabels = {
  aba: "ABA therapy",
  speech: "Speech therapy",
  ot: "Occupational therapy",
} as const;

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** "Tue, Thu · 9:00 AM to 12:00 PM" */
function hoursSummary(hours: BookingData["providers"][number]["hours"]) {
  if (hours.length === 0) return "No parent training hours right now";
  const days = [...new Set(hours.map((h) => h.weekday))]
    .sort()
    .map((d) => dayNames[d])
    .join(", ");
  const first = hours[0]!;
  return `${days} · ${formatWallClock(first.startsAt)} to ${formatWallClock(first.endsAt)}`;
}

/** "taken" shows inside the date and time card; "failed" at the top. */
type ErrorState = {
  kind: "taken" | "failed";
  title: string;
  message: string;
} | null;

/**
 * Book parent training (Figma 06, 07). One page of numbered questions with a
 * summary beside it. The stepper follows along as each answer is filled in.
 * The database checks every rule again when the parent presses Book.
 */
export function BookingForm(data: BookingData) {
  const { kids, providers, durationMinutes, childBusy, nowIso, latestIso } =
    data;
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);

  const [childId, setChildId] = useState<string | null>(
    kids.length === 1 ? (kids[0]?.id ?? null) : null,
  );
  const [providerId, setProviderId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ErrorState>(null);

  const child = kids.find((k) => k.id === childId) ?? null;
  const timezone =
    child?.center.timezone ??
    kids[0]?.center.timezone ??
    "America/Indiana/Indianapolis";
  const ownBcbaId = child?.careTeam.find(
    (m) => m.discipline === "aba",
  )?.providerId;

  // BCBAs at the child's center, their own BCBA first.
  const centerProviders = useMemo(
    () =>
      providers
        .filter((p) => p.centerId === child?.center.id)
        .sort(
          (a, b) => Number(b.id === ownBcbaId) - Number(a.id === ownBcbaId),
        ),
    [providers, child, ownBcbaId],
  );
  const provider = centerProviders.find((p) => p.id === providerId) ?? null;

  // A time is taken if the provider or this child is already busy.
  const busy = useMemo(
    () => [
      ...(provider?.busy ?? []),
      ...(childId ? (childBusy[childId] ?? []) : []),
    ],
    [provider, childId, childBusy],
  );

  const slotsFor = (key: string) =>
    provider
      ? slotsForDay({
          dayKey: key,
          hours: provider.hours,
          busy,
          timezone,
          durationMinutes,
          nowIso,
          latestIso,
        })
      : [];

  const thisMonday = (() => {
    const today = dayKey(nowIso, timezone);
    const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
    return addDays(today, -((weekday + 6) % 7));
  })();
  const weekStart = addDays(thisMonday, weekOffset * 7);
  const weekDays = [0, 1, 2, 3, 4].map((i) => addDays(weekStart, i));

  const dayOptions: DayOption[] = weekDays.map((key) => {
    const labels = dayKeyLabels(key);
    const off = provider ? isOffDay(key, provider.hours) : false;
    const open = slotsFor(key).some((s) => !s.taken);
    return {
      value: key,
      weekday: labels.weekday,
      day: key.slice(8).replace(/^0/, ""),
      label: `${labels.longWeekday}, ${labels.date}`,
      disabled: !provider || off || !open,
      caption: off ? "Off" : open ? "Open" : "Full",
    };
  });

  /** First week, from `from` on, that has an open time. Defaults to `from`. */
  function firstOpenWeek(p: BookingData["providers"][number], from: number) {
    for (let w = from; w < MAX_WEEKS; w++) {
      const start = addDays(thisMonday, w * 7);
      for (let i = 0; i < 5; i++) {
        const key = addDays(start, i);
        const open = slotsForDay({
          dayKey: key,
          hours: p.hours,
          busy: [...p.busy, ...(childId ? (childBusy[childId] ?? []) : [])],
          timezone,
          durationMinutes,
          nowIso,
          latestIso,
        }).some((s) => !s.taken);
        if (open) return { week: w, day: key };
      }
    }
    return { week: from, day: null };
  }

  function chooseChild(id: string) {
    setChildId(id);
    setProviderId(null);
    setDay(null);
    setSlot(null);
    setError(null);
  }

  function chooseProvider(id: string) {
    setProviderId(id);
    setSlot(null);
    setError(null);
    const p = centerProviders.find((x) => x.id === id);
    if (p) {
      const first = firstOpenWeek(p, 0);
      setWeekOffset(first.week);
      setDay(first.day);
    }
  }

  function moveWeek(delta: number) {
    const next = weekOffset + delta;
    setWeekOffset(next);
    setSlot(null);
    const firstOpen = [0, 1, 2, 3, 4]
      .map((i) => addDays(addDays(thisMonday, next * 7), i))
      .find((key) => slotsFor(key).some((s) => !s.taken));
    setDay(firstOpen ?? null);
  }

  const slots = day ? slotsFor(day) : [];
  const current = !child ? 0 : !provider ? 1 : !slot ? 2 : 3;
  const ready = Boolean(child && provider && slot);

  async function book() {
    if (!child || !provider || !slot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          patientId: child.id,
          providerId: provider.id,
          startsAt: slot,
          notes: notes || undefined,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        id?: string;
        error?: string;
        message?: string;
      };
      if (res.ok && body.id) {
        router.push(`/book/confirmed/${body.id}`);
        return;
      }
      if (res.status === 409) {
        // Keep everything else, drop the time, and load fresh busy times.
        setSlot(null);
        router.refresh();
        setError(
          body.error === "child_busy"
            ? {
                kind: "taken",
                title: `${child.firstName} is busy then`,
                message: `${child.firstName} already has a visit at ${formatClock(slot, timezone)}. Here are the other open times.`,
              }
            : {
                kind: "taken",
                title: "That time was just booked",
                message: `Someone booked ${formatClock(slot, timezone)} a moment ago. Here are the times still open.`,
              },
        );
      } else {
        setError({
          kind: "failed",
          title:
            res.status === 403
              ? "You can't book this visit"
              : "We couldn't book that time",
          message:
            body.message ??
            "Nothing was booked. Check your connection and try again.",
        });
      }
    } catch {
      setError({
        kind: "failed",
        title: "We couldn't book that time",
        message:
          "Nothing was booked. Check your connection and try again, or call your center if it keeps happening.",
      });
    } finally {
      setSubmitting(false);
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  const providerFirstName = provider?.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <Stepper steps={STEPS} current={current} />

      {error?.kind === "failed" && (
        <Banner tone="error" title={error.title} ref={errorRef}>
          {error.message}
        </Banner>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
          <Section number={1} title="Who is this visit for?">
            <div
              role="group"
              aria-label="Child"
              className="flex flex-wrap gap-3"
            >
              {kids.map((k) => (
                <KidBubble
                  key={k.id}
                  firstName={k.firstName}
                  detail={`Age ${k.age}`}
                  selected={k.id === childId}
                  onClick={() => chooseChild(k.id)}
                />
              ))}
            </div>
          </Section>

          {child && (
            <Section
              number={2}
              title={`What would you like to book for ${child.firstName}?`}
              hint={`Options come from ${child.firstName}'s care plan. Therapy times are set by the care team.`}
            >
              <ul className="flex flex-col gap-3">
                <li className="flex flex-wrap items-center gap-3 rounded-row border-2 border-navy bg-navy-tint/40 px-4.5 py-3.5">
                  <Icon name="book" className="text-navy" />
                  <span className="flex min-w-0 flex-1 basis-44 flex-col">
                    <span className="text-label text-ink">Parent training</span>
                    <span className="text-small text-muted">
                      {durationMinutes} minutes with a BCBA
                    </span>
                  </span>
                  <span className="rounded-full bg-green-tint px-2.5 py-1 text-tiny font-semibold text-green-text">
                    You can book
                  </span>
                </li>
                {child.careTeam.map((m) => (
                  <li
                    key={m.providerId}
                    className="flex flex-wrap items-center gap-3 rounded-row border border-line bg-page px-4.5 py-3.5 text-muted"
                  >
                    <Icon name={m.discipline} />
                    <span className="flex min-w-0 flex-1 basis-44 flex-col">
                      <span className="text-label">
                        {disciplineLabels[m.discipline]}
                      </span>
                      {m.scheduleSummary && (
                        <span className="text-small">{m.scheduleSummary}</span>
                      )}
                    </span>
                    <Tooltip
                      label="Set by care team"
                      title={`Scheduled by ${child.firstName}'s care team`}
                    >
                      Therapy hours come from {child.firstName}&apos;s treatment
                      plan and insurance authorization, so the care team builds
                      the weekly schedule. To ask for a change, call the center.
                    </Tooltip>
                  </li>
                ))}
              </ul>
              <p className="flex items-start gap-2 rounded-banner bg-aqua-tint px-4 py-3 text-small text-navy">
                <Icon name="info" size={16} className="mt-0.5" />
                Need a change to {child.firstName}&apos;s therapy schedule? Call
                the center at {child.center.phone}.
              </p>
            </Section>
          )}

          {child && (
            <Section number={3} title="Who would you like to meet with?">
              <fieldset className="flex flex-col gap-3">
                <legend className="sr-only">BCBA at {child.center.name}</legend>
                {centerProviders.map((p) => (
                  <label key={p.id} className="relative">
                    <input
                      type="radio"
                      name="provider"
                      value={p.id}
                      checked={providerId === p.id}
                      onChange={() => chooseProvider(p.id)}
                      className="peer sr-only"
                    />
                    <span className="flex cursor-pointer flex-wrap items-center gap-3 rounded-row border border-line bg-white px-4.5 py-3.5 transition-colors peer-checked:border-2 peer-checked:border-navy peer-checked:bg-navy-tint/40 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy hover:border-navy">
                      <span
                        aria-hidden
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-aqua-tint text-label font-bold text-navy"
                      >
                        {initials(p.name)}
                      </span>
                      <span className="flex min-w-0 flex-1 basis-44 flex-col">
                        <span className="text-label text-ink">
                          {[p.name, p.credential].filter(Boolean).join(", ")}
                        </span>
                        <span className="text-small text-muted">
                          {hoursSummary(p.hours)}
                        </span>
                      </span>
                      {p.id === ownBcbaId && (
                        <span className="rounded-full bg-green-tint px-2.5 py-1 text-tiny font-semibold text-green-text">
                          Your BCBA
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </fieldset>
            </Section>
          )}

          {provider && (
            <Section
              number={4}
              title="Pick a date and time"
              aside={
                <div className="flex items-center gap-2">
                  <span className="text-label text-ink">
                    {monthLabel(weekStart)}
                  </span>
                  <WeekButton
                    icon="back"
                    label="Previous week"
                    disabled={weekOffset <= 0}
                    onClick={() => moveWeek(-1)}
                  />
                  <WeekButton
                    icon="next"
                    label="Next week"
                    disabled={weekOffset >= MAX_WEEKS - 1}
                    onClick={() => moveWeek(1)}
                  />
                </div>
              }
            >
              {error?.kind === "taken" && (
                <Banner tone="error" title={error.title} ref={errorRef}>
                  {error.message}
                </Banner>
              )}
              <DayRow
                legend={`Week of ${dayKeyLabels(weekStart).date}`}
                name="day"
                days={dayOptions}
                value={day}
                onChange={(key) => {
                  setDay(key);
                  setSlot(null);
                }}
              />
              {day ? (
                <TimeSlots
                  legend={`Open times on ${formatShortDate(`${day}T12:00:00Z`, "UTC")}`}
                  hint={`(${zoneName(timezone, nowIso)})`}
                  name="time"
                  slots={slots}
                  value={slot}
                  onChange={(v) => {
                    setSlot(v);
                    setError(null);
                  }}
                />
              ) : (
                <p className="text-small text-muted">
                  No open times this week. Try the next week.
                </p>
              )}
            </Section>
          )}

          {provider && (
            <Section
              number={5}
              title={
                <>
                  Anything we should know?{" "}
                  <span className="text-label font-normal text-muted">
                    (optional)
                  </span>
                </>
              }
            >
              <label htmlFor="notes" className="sr-only">
                Notes for {provider.name}
              </label>
              <textarea
                id="notes"
                value={notes}
                maxLength={NOTES_MAX}
                rows={4}
                onChange={(e) => setNotes(e.target.value)}
                aria-describedby="notes-hint"
                placeholder={`Topics you'd like to cover, questions for ${providerFirstName}...`}
                className="w-full rounded-input border border-input-border bg-white px-4 py-3 text-body text-ink placeholder:text-placeholder hover:border-muted"
              />
              <p id="notes-hint" className="text-small text-muted">
                Your care team will see this. Please don&apos;t include medical
                details. {notes.length} of {NOTES_MAX} characters.
              </p>
            </Section>
          )}
        </div>

        <aside
          aria-labelledby="summary-heading"
          className="flex flex-col gap-4 rounded-card border border-line bg-white p-5 md:p-6 lg:sticky lg:top-24 lg:col-span-4"
        >
          <h2 id="summary-heading" className="text-h2 text-navy">
            Your visit
          </h2>
          <dl className="flex flex-col text-small">
            <SummaryRow label="For">
              {child ? (
                <span className="flex items-center gap-2">
                  <KidAvatar firstName={child.firstName} size={28} />
                  {child.firstName}
                </span>
              ) : (
                "Pick a child"
              )}
            </SummaryRow>
            <SummaryRow label="Visit">
              Parent training, {durationMinutes} min
            </SummaryRow>
            <SummaryRow label="Where">
              {child?.center.name ?? "Your center"}
            </SummaryRow>
            <SummaryRow label="With">
              {provider
                ? [provider.name, provider.credential]
                    .filter(Boolean)
                    .join(", ")
                : "Pick a BCBA"}
            </SummaryRow>
            <SummaryRow label="When">
              {slot ? (
                <>
                  {formatShortDate(slot, timezone)}
                  <br />
                  {formatTimeRange(
                    slot,
                    new Date(
                      Date.parse(slot) + durationMinutes * 60_000,
                    ).toISOString(),
                    timezone,
                  )}
                </>
              ) : (
                "Pick a time"
              )}
            </SummaryRow>
          </dl>
          <Button
            variant="pink"
            size="lg"
            fullWidth
            disabled={!ready}
            loading={submitting}
            onClick={book}
          >
            Book visit
          </Button>
          <p className="text-center text-small text-muted">
            {ready
              ? "Need to change it later? Call your center."
              : error?.kind === "taken"
                ? "Pick a new time to continue. Your other choices are saved."
                : "Answer each question to book."}
          </p>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4 border-b border-line py-3 last:border-b-0">
      <dt className="w-14 shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 font-semibold text-ink">{children}</dd>
    </div>
  );
}

function WeekButton({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: "back" | "next";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full border border-line text-navy transition-colors hover:bg-navy-tint disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon name={icon} />
    </button>
  );
}
