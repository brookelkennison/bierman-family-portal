"use client";

import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";

/**
 * Shown inside the app shell when a page fails to load, usually Supabase
 * being unreachable. In production the error has no details, so nothing
 * sensitive reaches the browser.
 */
export default function AppError({ retry }: { retry: () => void }) {
  return (
    <div className="flex max-w-200 flex-col gap-6">
      <h1 className="text-h1-sm text-navy lg:text-h1">Something went wrong</h1>
      <Banner
        tone="error"
        title="We couldn't load this page"
        action={
          <Button variant="outline" onClick={() => retry()}>
            Try again
          </Button>
        }
      >
        Your information is safe. Check your connection and try again, or call
        your center if it keeps happening.
      </Banner>
    </div>
  );
}
