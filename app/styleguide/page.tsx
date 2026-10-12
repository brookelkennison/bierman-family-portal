import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AppointmentRow } from "@/components/ui/AppointmentRow";
import { AuthBlobs } from "@/components/ui/AuthBlobs";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { KidAvatar } from "@/components/ui/KidAvatar";
import { KidBubble } from "@/components/ui/KidBubble";
import { Skeleton, SkeletonList } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { Banner } from "@/components/ui/Banner";
import { Button, ButtonLink, type ButtonVariant } from "@/components/ui/Button";
import { PasswordField, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { icons, type IconName } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Styleguide | Bierman Family Portal",
};

// Dev-only page for checking components against Figma. Hidden in production.
export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") notFound();

  const variants: ButtonVariant[] = [
    "pink",
    "navy",
    "outline",
    "ghost",
    "danger",
    "dangerText",
  ];

  return (
    <main className="mx-auto flex max-w-page flex-col gap-10 px-6 py-10 md:px-12">
      <header>
        <h1 className="text-h1 text-navy">Styleguide</h1>
        <p className="text-muted">
          Every shared component in every state. Dev only.
        </p>
      </header>

      <Section title="Buttons">
        {variants.map((variant) => (
          <div key={variant} className="flex flex-wrap items-center gap-3">
            <span className="w-28 text-small text-muted">{variant}</span>
            <Button variant={variant}>Default</Button>
            <Button variant={variant} iconLeft="book">
              Icon left
            </Button>
            <Button variant={variant} iconRight="arrowRight">
              Icon right
            </Button>
            <Button variant={variant} loading>
              Loading
            </Button>
            <Button variant={variant} disabled>
              Disabled
            </Button>
          </div>
        ))}
        <div className="flex max-w-110 flex-col gap-3">
          <span className="text-small text-muted">
            Large, full width (login)
          </span>
          <Button size="lg" fullWidth>
            Log in
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-28 text-small text-muted">ButtonLink</span>
          <ButtonLink href="/styleguide" iconLeft="book">
            Book a visit
          </ButtonLink>
          <ButtonLink href="/styleguide" variant="navy" iconRight="arrowRight">
            View details
          </ButtonLink>
          <ButtonLink
            href="/styleguide"
            variant="outline"
            iconLeft="reportAbsence"
          >
            Report absence
          </ButtonLink>
        </div>
      </Section>

      <Section title="Fields">
        <div className="grid max-w-110 gap-5">
          <TextField
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
          <PasswordField
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <TextField
            label="With a hint"
            hint="Example: Leo is home sick today"
          />
          <TextField
            label="Email"
            type="email"
            defaultValue="jordan@example"
            error="Enter a full email, like you@example.com."
          />
          <TextField
            label="Disabled"
            defaultValue="Set by your center"
            disabled
          />
        </div>
      </Section>

      <Section title="Banners">
        <div className="grid max-w-200 gap-4">
          <Banner tone="error" title="We couldn't log you in">
            That email and password don&apos;t match. Try again, or contact your
            center if you need help.
          </Banner>
          <Banner tone="warning" title="Session expired">
            Log in again to keep going.
          </Banner>
          <Banner>
            All times are shown in Eastern Time, where your center is.
          </Banner>
        </div>
      </Section>

      <Section title="Auth blobs">
        <div className="relative h-115 overflow-hidden rounded-card bg-linear-150 from-aqua to-aqua-light">
          <AuthBlobs />
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap items-center gap-3">
          <Badge kind="careTeam" />
          <Badge kind="bookedByYou" />
          <Badge kind="cancelled" />
          <Badge kind="cancelled">Cancelled by center</Badge>
          <Badge kind="comingSoon" />
        </div>
      </Section>

      <Section title="Kid avatars and bubbles">
        <div className="flex flex-wrap items-center gap-4">
          <KidAvatar firstName="Maya" size={28} />
          <KidAvatar firstName="Maya" size={40} />
          <KidAvatar firstName="Leo" size={68} />
          <KidAvatar firstName="Ava" size={40} alt="Ava" />
          <span className="text-small text-muted">
            Ava has no illustration, so she gets initials.
          </span>
        </div>
        <div className="flex flex-wrap gap-7">
          <KidBubble detail="2 children" selected />
          <KidBubble firstName="Maya" detail="Age 7" selected={false} />
          <KidBubble firstName="Leo" detail="Age 3" selected={false} />
        </div>
      </Section>

      <Section title="Appointment rows">
        <div className="flex flex-col gap-3">
          <AppointmentRow
            weekday="Thu"
            day="8"
            title="ABA session"
            childFirstName="Leo"
            timeRange="9:00 AM to 2:00 PM EDT"
            provider="Sam Patel, BCBA"
            badge="careTeam"
            href="/styleguide"
          />
          <AppointmentRow
            weekday="Thu"
            day="22"
            title="Parent training"
            childFirstName="Maya"
            timeRange="10:00 to 11:00 AM EDT"
            provider="Taylor Brooks, BCBA"
            badge="bookedByYou"
            href="/styleguide"
          />
          <AppointmentRow
            weekday="Fri"
            day="9"
            title="ABA session"
            childFirstName="Leo"
            timeRange="9:00 AM to 2:00 PM EDT"
            provider="Sam Patel, BCBA"
            badge="cancelled"
            badgeLabel="Cancelled by center"
            href="/styleguide"
          />
        </div>
      </Section>

      <Section title="Card, toast, loading">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <h3 className="text-h2 text-navy">Westfield center</h3>
            <p className="mt-2 text-muted">
              16414 Southpark Dr, Westfield, IN 46074
            </p>
          </Card>
          <div className="flex flex-col gap-3">
            <Toast title="Parent training booked" detail="Maya · Thu, Oct 22" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
        <SkeletonList rows={2} />
      </Section>

      <Section title="Empty state">
        <EmptyState
          title="No cancelled visits"
          actions={
            <>
              <Button variant="outline">See upcoming</Button>
              <Button variant="ghost">See past visits</Button>
            </>
          }
        >
          <p>Visits you or the center cancel show up here.</p>
          <p>Switch to Upcoming or Past to see other visits.</p>
        </EmptyState>
      </Section>

      <Section title="Icons">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {(Object.keys(icons) as IconName[]).map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 rounded-mark bg-white p-3 text-navy"
            >
              <Icon name={name} />
              <span className="text-small text-ink">{name}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-navy">
          <Icon name="book" size={14} />
          <Icon name="book" size={18} />
          <Icon name="book" size={24} />
          <span className="text-small text-muted">14, 18, 24</span>
        </div>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-card bg-white p-6 shadow-tab">
      <h2 className="text-h2 text-navy">{title}</h2>
      {children}
    </section>
  );
}
