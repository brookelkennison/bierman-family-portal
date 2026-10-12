import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Icon } from "./Icon";
import type { IconName } from "./icons";

export type ButtonVariant =
  "pink" | "navy" | "outline" | "ghost" | "danger" | "dangerText";

type StyleProps = {
  variant?: ButtonVariant;
  /** "lg" is the 54px login and form-submit size. */
  size?: "md" | "lg";
  fullWidth?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  pink: "bg-pink-button text-white hover:bg-pink-button-hover",
  navy: "bg-navy text-white hover:bg-navy-hover",
  outline: "border-navy bg-white text-navy hover:bg-navy-tint",
  ghost: "bg-transparent text-navy hover:bg-navy-tint",
  danger: "bg-danger text-white hover:bg-danger-hover",
  dangerText: "bg-transparent text-danger hover:bg-danger-tint",
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
}: StyleProps = {}) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-full border-2 border-transparent whitespace-nowrap transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
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
      className={[buttonClasses({ variant, size, fullWidth }), className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <Content iconLeft={iconLeft} iconRight={iconRight} loading={loading}>
        {children}
      </Content>
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
