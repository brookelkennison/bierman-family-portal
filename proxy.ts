import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "@/lib/env";

/** Pages anyone can open without logging in. */
const PUBLIC_PATHS = ["/login"];
const DEV_ONLY_PUBLIC_PATHS = ["/styleguide"];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return (
    process.env.NODE_ENV !== "production" &&
    DEV_ONLY_PUBLIC_PATHS.includes(pathname)
  );
}

/**
 * Runs before every page request:
 * 1. Refreshes the Supabase session cookie if it's close to expiring.
 * 2. Sends logged-out visitors to /login, and logged-in users away from it.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // getClaims() verifies the token's signature, so a forged cookie fails here.
  // Don't run code between createServerClient and this call.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  // API routes answer with JSON, never a redirect page, so the client can
  // show "Your session ended" instead of trying to parse HTML.
  if (!signedIn && pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
  }

  if (!signedIn && !isPublic(pathname)) {
    // Had a session cookie that no longer works: say so on the login page.
    const hadSession = request.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-"));
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = hadSession ? "?reason=expired" : "";
    return redirectKeepingCookies(url, response);
  }

  if (signedIn && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return redirectKeepingCookies(url, response);
  }

  return response;
}

/** A redirect that carries over any refreshed session cookies. */
function redirectKeepingCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: [
    // Everything except Next internals and static files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
