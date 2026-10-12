import type { Metadata } from "next";
import { getCurrentParent } from "@/lib/auth";

export const metadata: Metadata = { title: "Home | Bierman Family Portal" };

// Placeholder until the home dashboard is built in #30.
export default async function HomePage() {
  const parent = await getCurrentParent();
  const firstName = parent.fullName.split(" ")[0];
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-h1-sm text-navy lg:text-h1">
        Good morning, {firstName}
      </h1>
      <p className="text-muted">The home dashboard is coming in #30.</p>
    </div>
  );
}
