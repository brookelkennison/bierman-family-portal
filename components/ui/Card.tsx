import type { ComponentProps } from "react";

type CardProps = ComponentProps<"section"> & {
  /** "md" for dashboard side cards (28px), "sm" for tighter lists (20px). */
  padding?: "md" | "sm" | "none";
};

const paddings = { md: "p-7", sm: "p-5", none: "" };

/** White rounded panel with a hairline border, used across the dashboard. */
export function Card({ padding = "md", className, ...rest }: CardProps) {
  return (
    <section
      className={[
        "rounded-card border border-line bg-white",
        paddings[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
