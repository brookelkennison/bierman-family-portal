/** First thing a keyboard user tabs to: jumps past the header to the page. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-full bg-navy px-5 py-3 text-label text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
    >
      Skip to main content
    </a>
  );
}
