"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { desktopNav, isActive } from "./nav";

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden lg:block">
      <ul className="flex gap-1.5 rounded-full bg-page p-1.5">
        {desktopNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex items-center gap-2 rounded-full px-5 py-2.25 text-body transition-colors",
                  active
                    ? "bg-white font-semibold text-navy shadow-tab"
                    : "font-medium text-muted hover:text-navy",
                ].join(" ")}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
