import type { IconName } from "@/components/ui/icons";

export type NavItem = { href: string; label: string; icon: IconName };

/** Desktop top-bar tabs (Figma 03). "Book a visit" is its own pink button. */
export const desktopNav: NavItem[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/appointments", label: "Appointments", icon: "appointments" },
  { href: "/help", label: "Help", icon: "help" },
];

/** Mobile tab pills (Figma 07b). Booking is a tab here; Help lives in the menu. */
export const mobileNav: NavItem[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/appointments", label: "Appointments", icon: "appointments" },
  { href: "/book", label: "Book a visit", icon: "book" },
];

export function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}
