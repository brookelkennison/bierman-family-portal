import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Parent = {
  id: string;
  fullName: string;
  initials: string;
};

/**
 * The logged-in parent, read once per request (React cache dedupes calls from
 * the layout and the page). getUser() checks the session with Supabase, and
 * the profile read goes through RLS, so it can only ever return your own row.
 */
export const getCurrentParent = cache(async (): Promise<Parent> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const fullName = profile?.full_name ?? "Parent";

  return { id: user.id, fullName, initials: initialsOf(fullName) };
});

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? "") : "";
  return (first + last).toUpperCase() || "P";
}
