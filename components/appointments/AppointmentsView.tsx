"use client";

import { useState, type ReactNode } from "react";
import { badgeFor } from "@/components/dashboard/AppointmentList";
import { AppointmentRow } from "@/components/ui/AppointmentRow";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { KidAvatar } from "@/components/ui/KidAvatar";
import { Segmented } from "@/components/ui/Segmented";
import type { Appointment, Child } from "@/lib/data";
import { dateTile, dayKey, formatShortDate, formatTimeRange } from "@/lib/time";

type Tab = "upcoming" | "past" | "cancelled";

/** Rows per "Show more". */
const PAGE = 10;

type AppointmentsViewProps = {
  kids: Child[];
  appointments: Appointment[];
  /** Server time, so server and browser agree on what's upcoming. */
  nowIso: string;
};

/**
 * Every visit for the family, grouped by day in center time (Figma 14).
 * Filters live in memory, not the URL, so a child's name never lands in
 * browser history.
 */
export function AppointmentsView({
  kids,
  appointments,
  nowIso,
}: AppointmentsViewProps) {
  const [childId, setChildId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [shown, setShown] = useState(PAGE);
  const now = new Date(nowIso).getTime();

  const forChild = childId
    ? appointments.filter((a) => a.childId === childId)
    : appointments;
  const filtered = (
    tab === "cancelled"
      ? forChild.filter((a) => a.status === "cancelled")
      : tab === "past"
        ? forChild.filter(
            (a) =>
              a.status !== "cancelled" && new Date(a.endsAt).getTime() < now,
          )
        : forChild.filter(
            (a) =>
              a.status !== "cancelled" && new Date(a.endsAt).getTime() >= now,
          )
  ).sort((a, b) =>
    tab === "upcoming"
      ? a.startsAt.localeCompare(b.startsAt)
      : b.startsAt.localeCompare(a.startsAt),
  );
  const visible = filtered.slice(0, shown);

  // Group the visible rows by calendar day at the center.
  const groups: { key: string; label: string; rows: Appointment[] }[] = [];
  for (const a of visible) {
    const key = dayKey(a.startsAt, a.timezone);
    let group = groups.at(-1);
    if (!group || group.key !== key) {
      const isToday = key === dayKey(nowIso, a.timezone);
      const date = formatShortDate(a.startsAt, a.timezone);
      group = { key, label: isToday ? `Today, ${date}` : date, rows: [] };
      groups.push(group);
    }
    group.rows.push(a);
  }

  function changeTab(next: Tab) {
    setTab(next);
    setShown(PAGE);
  }

  function changeChild(next: string | null) {
    setChildId(next);
    setShown(PAGE);
  }

  const selected = kids.find((k) => k.id === childId);
  const who = selected ? selected.firstName : "your family";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-card border border-line bg-white p-3 sm:p-4 md:flex-row md:items-center md:justify-between md:px-5">
        {kids.length > 1 && (
          <div role="group" aria-label="Child" className="flex flex-wrap gap-2">
            <FilterChip
              pressed={childId === null}
              onClick={() => changeChild(null)}
            >
              All kids
            </FilterChip>
            {kids.map((k) => (
              <FilterChip
                key={k.id}
                pressed={childId === k.id}
                onClick={() => changeChild(k.id)}
              >
                <KidAvatar firstName={k.firstName} size={28} />
                {k.firstName}
              </FilterChip>
            ))}
          </div>
        )}
        <Segmented
          label="Which appointments"
          value={tab}
          onChange={changeTab}
          options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "past", label: "Past" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />
      </div>

      <p aria-live="polite" className="sr-only">
        Showing {Math.min(shown, filtered.length)} of {filtered.length} {tab}{" "}
        visits for {who}.
      </p>

      {filtered.length === 0 ? (
        <Empty tab={tab} who={who} onTab={changeTab} />
      ) : (
        <section
          aria-label={`${tab[0]!.toUpperCase()}${tab.slice(1)} visits`}
          className="flex flex-col gap-5 rounded-card border border-line bg-white p-4 md:p-6"
        >
          {groups.map((g) => (
            <div key={g.key} className="flex flex-col gap-3">
              <h2 className="text-label text-navy">{g.label}</h2>
              <ul className="flex flex-col gap-3">
                {g.rows.map((a) => {
                  const tile = dateTile(a.startsAt, a.timezone);
                  const badge = badgeFor(a);
                  return (
                    <li key={a.id}>
                      <AppointmentRow
                        weekday={tile.weekday}
                        day={tile.day}
                        title={a.title}
                        childFirstName={a.childFirstName}
                        timeRange={formatTimeRange(
                          a.startsAt,
                          a.endsAt,
                          a.timezone,
                        )}
                        provider={a.provider}
                        badge={badge.kind}
                        badgeLabel={badge.label}
                        href={`/appointments/${a.id}`}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {filtered.length > shown && (
            <Button
              variant="ghost"
              className="self-center"
              onClick={() => setShown((n) => n + PAGE)}
            >
              Show more
            </Button>
          )}
        </section>
      )}
    </div>
  );
}

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={[
        "flex items-center gap-2 rounded-full border px-4 py-2 text-label transition-colors",
        pressed
          ? "border-navy bg-navy text-white"
          : "border-line bg-white text-ink hover:border-navy",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/** One empty message per filter (Figma 15c). */
function Empty({
  tab,
  who,
  onTab,
}: {
  tab: Tab;
  who: string;
  onTab: (t: Tab) => void;
}) {
  if (tab === "upcoming") {
    return (
      <EmptyState
        title={`Nothing coming up for ${who}`}
        actions={
          <>
            <ButtonLink href="/book" variant="outline" iconLeft="book">
              Book parent training
            </ButtonLink>
            <LinkButton onClick={() => onTab("past")}>
              See past visits
            </LinkButton>
          </>
        }
      >
        <p>When your care team schedules a visit, it shows up here.</p>
      </EmptyState>
    );
  }
  if (tab === "past") {
    return (
      <EmptyState
        title="No past visits"
        actions={
          <Button variant="outline" onClick={() => onTab("upcoming")}>
            See upcoming
          </Button>
        }
      >
        <p>Visits from the last 30 days show up here.</p>
      </EmptyState>
    );
  }
  return (
    <EmptyState
      title="No cancelled visits"
      actions={
        <>
          <Button variant="outline" onClick={() => onTab("upcoming")}>
            See upcoming
          </Button>
          <LinkButton onClick={() => onTab("past")}>See past visits</LinkButton>
        </>
      }
    >
      <p>Visits you or the center cancel show up here.</p>
      <p>Switch to Upcoming or Past to see other visits.</p>
    </EmptyState>
  );
}

function LinkButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-button text-navy underline-offset-4 hover:underline"
    >
      {children}
    </button>
  );
}
