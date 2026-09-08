/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    // On Vercel, VERCEL_URL is auto-set (without https://); fall back to localhost for dev
    NEXT_PUBLIC_APP_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  },
  // Brand URLs: /pitchora* → /presentiq* (the platform is now Pitchora,
  // but the file routes stay under /presentiq for v0.1–v0.4 link compatibility).
  async rewrites() {
    return [
      { source: "/pitchora",            destination: "/presentiq" },
      { source: "/pitchora/:path*",     destination: "/presentiq/:path*" },
    ];
  },
  async headers() {
    // Content Security Policy — see THREAT_MODEL.md § 4.5 / § 5 G1.
    // 'strict-dynamic' would be tighter but conflicts with a few of
    // Next.js's own inline chunks in dev; we ship an allowlist that
    // covers Next's runtime, our fonts, and the Supabase + Stripe
    // origins we already call server-side.
    const csp = [
      "default-src 'self'",
      // React server components hydration needs 'unsafe-inline' until
      // Next.js promotes 'strict-dynamic' nonces to the App Router.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob:",
      // Supabase + Stripe + LLM providers — server-side only, but
      // client SDKs also hit these directly.
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://o.pitchora.ai",
      "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      // Belt-and-braces: X-Frame-Options is legacy; this is the real
      // clickjacking gate on modern browsers.
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");
    const security = [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self), payment=(self), usb=(), interest-cohort=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      // Isolate our origin from cross-origin popups / windows.
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
      { key: "Origin-Agent-Cluster", value: "?1" },
    ];
    return [
      {
        source: "/api/:path*",
        headers: [
          // Public API surface: CORS is deliberately permissive because
          // no session cookie is ever accepted cross-origin (Supabase
          // JWTs are SameSite=Lax and third-party contexts strip them).
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, x-org-id, x-request-id" },
          ...security,
        ],
      },
      {
        source: "/:path*",
        headers: security,
      },
    ];
  },
};

export default nextConfig;
