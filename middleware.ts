import { NextRequest, NextResponse } from "next/server";
import { verifySessionEdge, SESSION_COOKIE_NAME } from "@/lib/auth/edge-session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionEdge(token) : null;

  // 1. If user attempts to access /dashboard/admin -> redirect to dedicated /admin
  if (pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/")) {
    const targetUrl = new URL("/admin", req.url);
    return NextResponse.redirect(targetUrl);
  }

  // 2. Protect Admin Web Portal (/admin and /admin/*)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    if (!isSuperAdminUser(session.email, session.role)) {
      // Regular users are strictly forbidden from seeing or accessing admin portal
      const dashboardUrl = new URL("/dashboard", req.url);
      dashboardUrl.searchParams.set("error", "unauthorized_admin_access");
      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
  }

  // 3. Protect Admin API Routes (/api/admin/*)
  if (pathname.startsWith("/api/admin/")) {
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required. Please log in as an administrator." },
        { status: 401 }
      );
    }

    if (!isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json(
        { error: "Forbidden. Administrative privileges required." },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // 4. Protect User Dashboard (/dashboard and /dashboard/*)
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname + search);
      const res = NextResponse.redirect(loginUrl);
      if (token) {
        res.cookies.delete(SESSION_COOKIE_NAME);
      }
      return res;
    }

    return NextResponse.next();
  }

  // 5. Login page (/login)
  // Never redirect /login away to avoid any potential redirect loops.
  // If a corrupted or expired cookie exists, clean it up on the response.
  if (pathname === "/login") {
    if (token && !session) {
      const res = NextResponse.next();
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }
    return NextResponse.next();
  }

  // 6. Registration pages (/signup, /register)
  // Only redirect if the session is cryptographically valid and unexpired.
  if (pathname === "/signup" || pathname === "/register") {
    const redirectParam = req.nextUrl.searchParams.get("redirect");
    const planParam = req.nextUrl.searchParams.get("plan");
    if (session) {
      if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
        return NextResponse.redirect(new URL(redirectParam, req.url));
      }
      if (planParam && planParam !== "starter") {
        return NextResponse.redirect(
          new URL(`/dashboard/billing?plan=${encodeURIComponent(planParam)}`, req.url)
        );
      }
      if (isSuperAdminUser(session.email, session.role)) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (token && !session) {
      const res = NextResponse.next();
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/admin",
    "/api/admin/:path*",
    "/login",
    "/signup",
    "/register",
  ],
};
