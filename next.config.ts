import type { NextConfig } from "next";

// The page has zero user-generated or CMS-sourced content — everything
// rendered is a literal string written in this repo — so there's no
// injection surface that a per-request CSP nonce would meaningfully guard
// against here. Using a nonce would force the whole marketing page into
// dynamic rendering (nonces must be fresh per request, which is incompatible
// with static prerendering), trading away the "fast, static, CDN-served"
// goal for a security property this specific page doesn't need. If dynamic,
// user-sourced content is ever rendered on this page, switch to a
// nonce-based CSP via middleware first.
const isDev = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-eval' is dev-only: React's dev mode uses eval() to reconstruct
  // component stacks for HMR/debugging and never does in production.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
