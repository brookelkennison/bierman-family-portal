type LogoProps = {
  /** "onAqua" for the login panel, "onWhite" for headers. */
  tone?: "onAqua" | "onWhite";
  size?: "md" | "sm";
};

/** Placeholder "B" mark plus the product name. */
export function Logo({ tone = "onWhite", size = "md" }: LogoProps) {
  const tile = tone === "onAqua" ? "bg-white" : "bg-aqua";
  const subtitle = tone === "onAqua" ? "text-navy" : "text-muted";
  const tileSize =
    size === "md" ? "size-10 text-brand" : "size-8.5 text-brand-sm";
  const name = size === "md" ? "text-brand" : "text-brand-sm";

  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`flex items-center justify-center rounded-mark text-navy ${tile} ${tileSize}`}
      >
        B
      </span>
      <span className="flex flex-col">
        <span className={`text-navy ${name}`}>Bierman</span>
        <span className={`text-tiny ${subtitle}`}>Family Portal</span>
      </span>
    </div>
  );
}
