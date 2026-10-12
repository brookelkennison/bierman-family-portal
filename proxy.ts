import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "@/lib/env";

/** Pages anyone can open without logging in. */
const PUBLIC_PATHS = ["/login"];
const DEV_ONLY_PUBLIC_PATHS = ["/styleguide"];

const isDev = process.env.NODE_ENV === "development";

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return (
    process.env.NODE_ENV !== "production" &&
    DEV_ONLY_PUBLIC_PATHS.includes(pathname)
  );
}

/**
 * Strict Content-Security-Policy. Only scripts carrying this request's nonce
 * can run (Next adds it to its own scripts automatically), so an injected
 * <script> is blocked. Dev needs 'unsafe-eval' for React's error overlay.
 */
function contentSecurityPolicy(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Dev tools and hot reload inject unnonced <style> tags, so dev allows
    // inline styles. Production stays nonce-only.
    isDev
      ? "style-src 'self' 'unsafe-inline'"
      : `style-src 'self' 'nonce-${nonce}'`,
    // Inline style attributes (used by next/image) can't run code.
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    `connect-src 'self' ${new URL(supabaseUrl).origin}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

/**
 * Runs before every page and API request:
 * 1. Sets a per-request CSP nonce and no-store caching.
 * 2. Refreshes the Supabase session cookie if it's close to expiring.
 * 3. Sends logged-out visitors to /login, and logged-in users away from it.
 */
export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = contentSecurityPolicy(nonce);

  // Pass the CSP to Next on the request so it can stamp the nonce on its scripts.
  const forward = () => {
    const headers = new Headers(request.headers);
    headers.set("x-nonce", nonce);
    headers.set("Content-Security-Policy", csp);
    return NextResponse.next({ request: { headers } });
  };

  let response = forward();

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = forward();
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
    return withSecurity(
      NextResponse.json({ error: "not_signed_in" }, { status: 401 }),
      csp,
    );
  }

  if (!signedIn && !isPublic(pathname)) {
    // Had a session cookie that no longer works: say so on the login page.
    const hadSession = request.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-"));
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = hadSession ? "?reason=expired" : "";
    return withSecurity(redirectKeepingCookies(url, response), csp);
  }

  if (signedIn && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return withSecurity(redirectKeepingCookies(url, response), csp);
  }

  return withSecurity(response, csp);
}

/** CSP plus no-store: browsers and proxies never keep a copy of these pages. */
function withSecurity(response: NextResponse, csp: string) {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
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
