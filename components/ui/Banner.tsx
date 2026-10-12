import type { ReactNode, Ref } from "react";
import { Icon } from "./Icon";
import type { IconName } from "./icons";

type BannerTone = "info" | "warning" | "error";

const tones: Record<
  BannerTone,
  { box: string; title: string; icon: IconName; iconColor: string }
> = {
  info: {
    box: "border-navy-tint bg-navy-tint",
    title: "text-navy",
    icon: "info",
    iconColor: "text-navy",
  },
  warning: {
    box: "border-sun bg-sun-tint",
    title: "text-sun-text",
    icon: "error",
    iconColor: "text-sun-text",
  },
  error: {
    box: "border-danger-border bg-danger-tint",
    title: "text-danger",
    icon: "error",
    iconColor: "text-danger",
  },
};

type BannerProps = {
  tone?: BannerTone;
  title?: string;
  children: ReactNode;
  /** A button on the right, like "Try again" or "Go back" (Figma 15c). */
  action?: ReactNode;
  /**
   * Pass a ref and focus it after a failed submit, so screen readers announce
   * the message (Figma 02: "Focus moves to this message").
   */
  ref?: Ref<HTMLDivElement>;
};

/** Inline message box. Error banners use role="alert". */
export function Banner({
  tone = "info",
  title,
  children,
  action,
  ref,
}: BannerProps) {
  const t = tones[tone];
  return (
    <div
      ref={ref}
      tabIndex={ref ? -1 : undefined}
      role={tone === "error" ? "alert" : "status"}
      className={`flex flex-col gap-3 rounded-banner border px-4.5 py-4 sm:flex-row sm:items-center ${t.box}`}
    >
      <div className="flex flex-1 items-start gap-3">
        <span className={`mt-0.5 ${t.iconColor}`}>
          <Icon name={t.icon} />
        </span>
        <div className="flex flex-col text-label font-normal text-ink">
          {title && <p className={`font-bold ${t.title}`}>{title}</p>}
          <div>{children}</div>
        </div>
      </div>
      {action && <div className="shrink-0 sm:ml-auto">{action}</div>}
    </div>
  );
}
