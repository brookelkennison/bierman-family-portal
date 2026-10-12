import type { ReactNode, Ref } from "react";
import { Icon } from "./Icon";
import type { IconName } from "./icons";

type BannerTone = "info" | "warning" | "error";

const tones: Record<BannerTone, { box: string; icon: IconName }> = {
  info: { box: "border-navy-tint bg-navy-tint text-navy", icon: "info" },
  warning: { box: "border-sun bg-sun-tint text-sun-text", icon: "error" },
  error: {
    box: "border-danger-border bg-danger-tint text-danger-text",
    icon: "error",
  },
};

type BannerProps = {
  tone?: BannerTone;
  title?: string;
  children: ReactNode;
  /**
   * Pass a ref and focus it after a failed submit, so screen readers announce
   * the message (Figma 02: "Focus moves to this message").
   */
  ref?: Ref<HTMLDivElement>;
};

/** Inline message box. Error banners use role="alert". */
export function Banner({ tone = "info", title, children, ref }: BannerProps) {
  const { box, icon } = tones[tone];
  return (
    <div
      ref={ref}
      tabIndex={ref ? -1 : undefined}
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-banner border px-4.5 py-4 text-label font-normal ${box}`}
    >
      <Icon name={icon} className="mt-0.5" />
      <div className="flex flex-col">
        {title && <p className="font-bold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
