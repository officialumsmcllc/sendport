import { NextRequest, NextResponse } from "next/server";
import { verifySessionEdge, SESSION_COOKIE_NAME } from "@/lib/auth/edge-session";

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

    if (session.role !== "ADMIN") {
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

    if (session.role !== "ADMIN") {
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
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 5. Auth pages (/login, /signup, /register) when already logged in
  if (pathname === "/login" || pathname === "/signup" || pathname === "/register") {
    if (session) {
      const redirectParam = req.nextUrl.searchParams.get("redirect");
      if (redirectParam && redirectParam.startsWith("/")) {
        return NextResponse.redirect(new URL(redirectParam, req.url));
      }

      if (session.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
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
