type SkeletonProps = { className?: string };

/** Gray placeholder block. Size it to match what it replaces so nothing jumps. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "animate-pulse rounded-row bg-line motion-reduce:animate-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

/** Loading list: rows at real appointment-row height, announced once. */
export function SkeletonList({
  rows = 3,
  label = "Loading appointments",
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div aria-busy="true" className="flex flex-col gap-3">
      <span className="sr-only" role="status">
        {label}
      </span>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-27.5" />
      ))}
    </div>
  );
}
