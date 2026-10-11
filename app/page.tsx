// Temporary theme preview. Replaced by the real home page in #30.
const swatches = [
  ["navy", "bg-navy"],
  ["navy-tint", "bg-navy-tint"],
  ["aqua", "bg-aqua"],
  ["aqua-tint", "bg-aqua-tint"],
  ["pink", "bg-pink"],
  ["pink-button", "bg-pink-button"],
  ["pink-tint", "bg-pink-tint"],
  ["green", "bg-green"],
  ["green-tint", "bg-green-tint"],
  ["sun", "bg-sun"],
  ["sun-tint", "bg-sun-tint"],
  ["line", "bg-line"],
  ["page", "bg-page"],
  ["danger", "bg-danger"],
] as const;

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-page px-6 py-10 md:px-12">
      <h1 className="text-h1 text-navy">Bierman theme preview</h1>
      <p className="mt-2 text-body text-muted">
        Check these against the Figma mockups. This page goes away in #30.
      </p>

      <section className="mt-8 rounded-card border border-line bg-white p-7">
        <h2 className="text-h2 text-navy">Type</h2>
        <p className="mt-4 text-h1 text-navy">Heading 1, 34/42 bold</p>
        <p className="mt-2 text-h2 text-navy">Heading 2, 20/28 bold</p>
        <p className="mt-2 text-h3 text-ink">Heading 3, 16/24 semibold</p>
        <p className="mt-2 text-body text-ink">Body, 15/24 regular</p>
        <p className="mt-2 text-small text-muted">Small, 13/20 muted</p>
      </section>

      <section className="mt-6 rounded-card border border-line bg-white p-7">
        <h2 className="text-h2 text-navy">Buttons and badges</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="rounded-full bg-pink-button px-6 py-3 text-body font-bold text-white">
            Book parent training
          </button>
          <button className="rounded-full bg-navy px-6 py-3 text-body font-bold text-white">
            Navy button
          </button>
          <button className="rounded-full border-2 border-navy bg-white px-6 py-3 text-body font-bold text-navy">
            Outline button
          </button>
          <span className="rounded-full bg-navy-tint px-3 py-1 text-tiny font-semibold text-navy">
            Scheduled by your care team
          </span>
          <span className="rounded-full bg-green-tint px-3 py-1 text-tiny font-semibold text-green-text">
            Booked by you
          </span>
          <span className="rounded-full bg-sun px-3 py-1 text-tiny font-bold text-sun-text">
            Coming soon
          </span>
        </div>
      </section>

      <section className="mt-6 rounded-card border border-line bg-white p-7">
        <h2 className="text-h2 text-navy">Colors</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {swatches.map(([name, cls]) => (
            <li key={name} className="text-small text-muted">
              <div className={`h-14 rounded-mark border border-line ${cls}`} />
              <span className="mt-1 block">{name}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
