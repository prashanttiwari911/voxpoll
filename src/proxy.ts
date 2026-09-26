/**
 * src/proxy.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Next.js Edge proxy for VoTI (formerly middleware).
 *
 * Responsibilities:
 *  1. Security headers (CSP, HSTS, X-Frame-Options, etc.)
 *  2. CSRF origin validation for non-GET state-mutating requests
 *  3. Admin route RBAC redirect (belt-and-suspenders on top of page.tsx redirect)
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ---------------------------------------------------------------------------
// Config — which paths the proxy runs on
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    // Run on everything except static assets and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};

// ---------------------------------------------------------------------------
// Allowed origins for CSRF validation
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = new Set(
  [
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "http://localhost:3001",
  ].filter(Boolean) as string[]
);

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  // No origin header = same-origin browser request or server-to-server — allow
  if (!origin) return true;
  // Strip trailing slash for comparison
  const normalised = origin.replace(/\/$/, "");
  if (ALLOWED_ORIGINS.has(normalised)) return true;
  // Fallback: compare against the request host
  const host = req.headers.get("host");
  try {
    const { host: originHost } = new URL(normalised);
    return originHost === host;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Security headers applied to every response
// ---------------------------------------------------------------------------
function addSecurityHeaders(res: NextResponse): NextResponse {
  // Prevent clickjacking
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  // Stop MIME sniffing
  res.headers.set("X-Content-Type-Options", "nosniff");
  // Referrer policy
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions policy
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  // HSTS — only in production
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
  // Basic Content-Security-Policy
  // Allow: self, Google (OAuth), DiceBear (avatars), inline scripts (Next.js needs it)
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval in dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://api.dicebear.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com *",
      "connect-src 'self'",
      "frame-ancestors 'self'",
    ].join("; ")
  );
  return res;
}

// ---------------------------------------------------------------------------
// Proxy handler
export default async function proxy(req: NextRequest) {
  const { method } = req;
  const url = req.nextUrl;
  const pathname = url.pathname;

  // ── 1. CSRF check for state-mutating requests to API routes ──
  // Server Actions use POST to /app-dir paths; API routes are under /api
  const isStateMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const isApiRoute = pathname.startsWith("/api/");

  if (isStateMutating && isApiRoute && !isSameOrigin(req)) {
    return new NextResponse(
      JSON.stringify({ error: "CSRF: request origin not allowed." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 2. Admin route RBAC ──
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    // Role is stored in the JWT by the NextAuth callbacks
    const role = (token as { role?: string }).role;
    if (role !== "ADMIN" && role !== "MODERATOR") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // ── 3. Proceed with security headers ──
  const res = NextResponse.next();
  return addSecurityHeaders(res);
}
