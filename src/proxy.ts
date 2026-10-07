import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};

const ALLOWED_ORIGINS = new Set([process.env.NEXTAUTH_URL, process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000", "http://localhost:3001"].filter(Boolean) as string[]);

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const normalised = origin.replace(/\/$/, "");
  if (ALLOWED_ORIGINS.has(normalised)) return true;
  const host = req.headers.get("host");
  try {
    const { host: originHost } = new URL(normalised);
    return originHost === host;
  } catch {
    return false;
  }
}

function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
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

export default async function proxy(req: NextRequest) {
  const { method } = req;
  const url = req.nextUrl;
  const pathname = url.pathname;

  const isStateMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const isApiRoute = pathname.startsWith("/api/");

  if (isStateMutating && isApiRoute && !isSameOrigin(req)) {
    return new NextResponse(
      JSON.stringify({ error: "CSRF: request origin not allowed." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    const role = (token as { role?: string }).role;
    if (role !== "ADMIN" && role !== "MODERATOR") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();
  return addSecurityHeaders(res);
}
