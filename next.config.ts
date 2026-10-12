import type { NextConfig } from "next";

/**
 * Headers that are the same on every response. The Content-Security-Policy
 * needs a fresh nonce per request, so it's set in proxy.ts instead.
 */
const securityHeaders = [
  // Always use HTTPS for the next two years, including subdomains.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Never send the page URL to other sites.
  { key: "Referrer-Policy", value: "no-referrer" },
  // Don't let browsers guess file types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Older browsers' version of frame-ancestors 'none': no embedding in iframes.
  { key: "X-Frame-Options", value: "DENY" },
  // The app never needs these device features.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  // cacheComponents is off on purpose: every page renders per request, so
  // health data is never cached and each response gets its own CSP nonce.
  // (Next's docs: nonce-based CSP doesn't work with prerendered shells.)
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
