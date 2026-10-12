/**
 * Public Supabase settings, checked once with a clear message instead of a
 * vague Supabase error when .env.local is missing.
 * Next inlines NEXT_PUBLIC_ values at build time, so each must be read by its
 * full name (no dynamic process.env[name] lookups).
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and fill it in (see README setup).`,
    );
  }
  return value;
}

export const supabaseUrl = required(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const supabasePublishableKey = required(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
