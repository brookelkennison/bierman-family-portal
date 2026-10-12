import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Badge } from "./Badge";
import { Icon } from "./Icon";
import type { IconName } from "./icons";

export type ButtonVariant =
  "pink" | "navy" | "outline" | "ghost" | "danger" | "dangerText";

type StyleProps = {
  variant?: ButtonVariant;
  /** "lg" is the 54px login and form-submit size. */
  size?: "md" | "lg";
  fullWidth?: boolean;
  /**
   * Not built yet (Figma 55). The button stays visible and focusable, gets
   * aria-disabled and the yellow Coming soon badge, and keeps full color so
   * the badge text stays readable. Its onClick should explain what to do.
   */
  comingSoon?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  pink: "border-transparent bg-pink-button text-white hover:bg-pink-button-hover",
  navy: "border-transparent bg-navy text-white hover:bg-navy-hover",
  outline: "border-navy bg-white text-navy hover:bg-navy-tint",
  ghost: "border-transparent bg-transparent text-navy hover:bg-navy-tint",
  danger: "border-transparent bg-danger text-white hover:bg-danger-hover",
  dangerText:
    "border-transparent bg-transparent text-danger hover:bg-danger-tint",
};

const sizes = {
  md: "px-6 py-3 text-button",
  lg: "h-13.5 px-6 text-button-lg",
};

/** Shared classes so links that look like buttons match exactly. */
export function buttonClasses({
  variant = "pink",
  size = "md",
  fullWidth = false,
  comingSoon = false,
}: StyleProps = {}) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-full border-2 whitespace-nowrap transition-colors",
    comingSoon
      ? "disabled:cursor-not-allowed disabled:opacity-50"
      : "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    variants[variant],
    sizes[size],
    fullWidth ? "w-full" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

type ContentProps = {
  iconLeft?: IconName;
  iconRight?: IconName;
  children: ReactNode;
};

function Content({
  iconLeft,
  iconRight,
  loading,
  children,
}: ContentProps & { loading?: boolean }) {
  return (
    <>
      {loading ? (
        <Icon
          name="loading"
          className="animate-spin motion-reduce:animate-none"
        />
      ) : (
        iconLeft && <Icon name={iconLeft} />
      )}
      <span>{children}</span>
      {iconRight && !loading && <Icon name={iconRight} />}
    </>
  );
}

type ButtonProps = StyleProps &
  ContentProps &
  Omit<ComponentProps<"button">, "children"> & {
    /** Shows a spinner, sets aria-busy, and blocks clicks. */
    loading?: boolean;
  };

export function Button({
  variant,
  size,
  fullWidth,
  comingSoon = false,
  iconLeft,
  iconRight,
  loading = false,
  disabled,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-disabled={comingSoon || undefined}
      className={[
        buttonClasses({ variant, size, fullWidth, comingSoon }),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <Content iconLeft={iconLeft} iconRight={iconRight} loading={loading}>
        {children}
      </Content>
      {comingSoon && <Badge kind="comingSoon" />}
    </button>
  );
}

type ButtonLinkProps = StyleProps &
  ContentProps &
  Omit<ComponentProps<typeof Link>, "children">;

/** A link styled as a button, for navigation like "Book a visit". */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  iconLeft,
  iconRight,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={[buttonClasses({ variant, size, fullWidth }), className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <Content iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </Content>
    </Link>
  );
}
