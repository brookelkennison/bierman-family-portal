import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import type { Parent } from "@/lib/auth";
import { DesktopNav } from "./DesktopNav";
import { ParentMenu } from "./ParentMenu";

/** Sticky top bar: logo, tabs, Book a visit, and the parent menu (Figma 03). */
export function AppHeader({ parent }: { parent: Parent }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white">
      <div className="mx-auto flex max-w-page items-center justify-between px-5 py-3.5 lg:px-12 lg:py-4.5">
        <Link
          href="/"
          aria-label="Bierman Family Portal, home"
          className="rounded-mark"
        >
          <span className="lg:hidden">
            <Logo size="sm" />
          </span>
          <span className="hidden lg:block">
            <Logo />
          </span>
        </Link>
        <DesktopNav />
        <div className="flex items-center gap-4">
          <ButtonLink href="/book" iconLeft="book" className="max-lg:hidden">
            Book a visit
          </ButtonLink>
          <ParentMenu fullName={parent.fullName} initials={parent.initials} />
        </div>
      </div>
    </header>
  );
}
