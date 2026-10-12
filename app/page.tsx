import Link from "next/link";

// Placeholder until the home dashboard is built in #30.
export default function Home() {
  return (
    <main className="mx-auto flex max-w-page flex-col gap-4 px-6 py-10 md:px-12">
      <h1 className="text-h1 text-navy">Bierman Family Portal</h1>
      <p className="text-muted">The home dashboard is coming in #30.</p>
      {process.env.NODE_ENV !== "production" && (
        <Link href="/styleguide" className="font-semibold text-navy underline">
          Open the styleguide
        </Link>
      )}
    </main>
  );
}
