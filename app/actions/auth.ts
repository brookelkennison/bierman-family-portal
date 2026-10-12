"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
  /** Echo the email back so the parent doesn't retype it. Never the password. */
  email?: string;
};

// One message for every failed login, so the page never reveals whether an
// email has an account (no user enumeration).
const GENERIC_ERROR =
  "That email and password don't match. Try again, or contact your center if you need help.";

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password.", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Server log only: the reason code, never the email or password. The
    // user always sees the same message.
    console.warn(
      "[auth] sign-in failed:",
      error.code ?? error.status ?? error.name,
    );
    return { error: GENERIC_ERROR, email };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
