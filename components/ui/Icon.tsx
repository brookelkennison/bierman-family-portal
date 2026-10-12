import { icons, type IconName } from "./icons";

type IconProps = {
  name: IconName;
  /** 14 for badges, 18 for buttons and rows, 24 for headers. */
  size?: 14 | 18 | 24;
  /**
   * Leave out for decorative icons (hidden from screen readers).
   * Set it only when the icon is the sole content, like an icon-only button
   * without its own aria-label.
   */
  label?: string;
  className?: string;
};

/** Lucide icon in the current text color. */
export function Icon({ name, size = 18, label, className }: IconProps) {
  const LucideIcon = icons[name];
  return (
    <LucideIcon
      width={size}
      height={size}
      strokeWidth={2}
      className={["shrink-0", className].filter(Boolean).join(" ")}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true, focusable: false })}
    />
  );
}
