import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthBlobs } from "@/components/ui/AuthBlobs";
import { Logo } from "@/components/ui/Logo";
import { ExpiredNotice } from "./ExpiredNotice";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in | Bierman Family Portal" };

// Figma 01 (desktop) and 02 (mobile).
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Desktop: aqua brand panel */}
      <aside className="relative hidden w-160 shrink-0 flex-col justify-between overflow-hidden bg-linear-150 from-aqua to-aqua-light p-14 lg:flex">
        <Logo tone="onAqua" />
        <div className="relative z-10 flex max-w-117.5 flex-col gap-4">
          <p className="w-100 text-display text-navy">
            Every little win, all in one place.
          </p>
          <p className="w-100 text-lead text-navy">
            See your child&apos;s schedule, book parent training, and let your
            care team know about absences.
          </p>
        </div>
        <p className="text-small text-navy">Demo app with sample data only.</p>
        <AuthBlobs />
      </aside>

      {/* Mobile: white top bar */}
      <header className="border-b border-line bg-white px-5 py-3.5 lg:hidden">
        <Logo size="sm" />
      </header>

      <main className="flex flex-1 items-start justify-center px-5 py-7 lg:items-center lg:px-12">
        <div className="flex w-full max-w-110 flex-col gap-5.5">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-h1-sm text-navy lg:text-h1">Welcome back</h1>
            <p className="text-muted">
              Log in to see your family&apos;s appointments.
            </p>
          </div>
          <Suspense fallback={null}>
            <ExpiredNotice />
          </Suspense>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
