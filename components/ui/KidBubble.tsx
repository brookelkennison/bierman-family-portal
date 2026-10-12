import type { ComponentProps } from "react";
import { Icon } from "./Icon";
import { KidAvatar, kidTint } from "./KidAvatar";

type KidBubbleProps = Omit<ComponentProps<"button">, "children"> & {
  /** Child's first name, or leave out for the "All kids" bubble. */
  firstName?: string;
  /** Second line, e.g. "Age 7" or "2 children". */
  detail: string;
  selected: boolean;
};

/** 76px kid switcher from the dashboard. Selected gets the aqua ring. */
export function KidBubble({
  firstName,
  detail,
  selected,
  className,
  ...rest
}: KidBubbleProps) {
  const isAll = !firstName;
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={[
        "group flex w-24 flex-col items-center gap-2 rounded-row p-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <span
        className={[
          "flex size-19 items-center justify-center overflow-hidden rounded-full border-4 border-white transition-shadow",
          isAll ? "bg-navy text-white" : kidTint(firstName),
          selected
            ? "ring-3 ring-aqua"
            : "ring-2 ring-line group-hover:ring-aqua-light",
        ].join(" ")}
      >
        {isAll ? (
          <Icon name="allKids" size={30} />
        ) : (
          <KidAvatar firstName={firstName} size={68} />
        )}
      </span>
      <span className="text-label text-ink">
        {isAll ? "All kids" : firstName}
      </span>
      <span className="text-tiny text-muted">{detail}</span>
    </button>
  );
}
