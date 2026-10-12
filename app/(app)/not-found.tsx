import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Page not found | Bierman Family Portal",
};

/**
 * 404 inside the app shell (Figma 13). Also used when an appointment isn't
 * yours: RLS hides it, so it looks the same as one that doesn't exist, and
 * nobody can probe which IDs are real.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center md:py-16">
      <div aria-hidden className="relative mb-4 size-25">
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-aqua-tint text-navy">
          <Icon name="search" />
        </span>
        <span className="absolute top-3 -left-4 size-5.5 rounded-full bg-sun" />
        <span className="absolute -right-4 bottom-2 size-4 rounded-full bg-pink" />
      </div>
      <h1 className="text-h1-sm text-navy lg:text-h1">
        We couldn&apos;t find that page
      </h1>
      <p className="max-w-110 text-muted">
        It may have moved, or it isn&apos;t available on your account.
        Let&apos;s get you back to your family&apos;s home page.
      </p>
      <ButtonLink href="/" variant="pink" className="mt-2">
        Go to home
      </ButtonLink>
    </div>
  );
}
