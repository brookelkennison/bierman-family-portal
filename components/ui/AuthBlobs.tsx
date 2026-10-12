/**
 * Decorative circles from the login screen's aqua panel (Figma 01).
 * Place inside a `relative overflow-hidden` container. Hidden from screen
 * readers and from clicks.
 */
export function AuthBlobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute top-30 left-97.5 size-85 rounded-full bg-white/18" />
      <div className="absolute top-52.5 left-100 size-30 rounded-full bg-sun" />
      <div className="absolute top-90 left-126.5 size-16 rounded-full bg-pink" />
      <div className="absolute top-62.5 left-98 size-9.5 rounded-full bg-green" />
    </div>
  );
}
