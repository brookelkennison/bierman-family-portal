"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, mobileNav } from "./nav";

/** Tab pills under the top bar on small screens. No bottom tab bar. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="border-b border-line bg-white lg:hidden">
      <ul className="flex gap-2 overflow-x-auto px-5 py-3">
        {mobileNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex items-center rounded-full px-3.5 py-2 text-label whitespace-nowrap transition-colors",
                  active
                    ? "bg-navy text-white"
                    : "bg-page font-medium text-muted hover:text-navy",
                ].join(" ")}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
