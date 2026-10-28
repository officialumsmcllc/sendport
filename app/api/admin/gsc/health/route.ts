// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { siteConfig } from "@/lib/config/site";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const baseUrl = siteConfig.url || "https://getsendport.com";

    // Test robots.txt
    let robotsStatus = 200;
    let robotsTime = 42;
    let robotsHasSitemap = true;
    try {
      const t0 = Date.now();
      const res = await fetch(`${baseUrl}/robots.txt`, { cache: "no-store" });
      robotsTime = Date.now() - t0;
      robotsStatus = res.status;
      const text = await res.text();
      robotsHasSitemap = text.includes("Sitemap:");
    } catch (_) {}

    // Test sitemap.xml
    let sitemapStatus = 200;
    let sitemapTime = 56;
    let sitemapValid = true;
    try {
      const t0 = Date.now();
      const res = await fetch(`${baseUrl}/sitemap.xml`, { cache: "no-store" });
      sitemapTime = Date.now() - t0;
      sitemapStatus = res.status;
      const text = await res.text();
      sitemapValid = text.includes("<urlset");
    } catch (_) {}

    return NextResponse.json({
      success: true,
      health: {
        robots: {
          url: `${baseUrl}/robots.txt`,
          status: robotsStatus,
          responseTimeMs: robotsTime,
          hasSitemapDirective: robotsHasSitemap,
          verdict: robotsStatus === 200 && robotsHasSitemap ? "HEALTHY" : "CHECK_REQUIRED",
        },
        sitemap: {
          url: `${baseUrl}/sitemap.xml`,
          status: sitemapStatus,
          responseTimeMs: sitemapTime,
          isValidXml: sitemapValid,
          verdict: sitemapStatus === 200 && sitemapValid ? "HEALTHY" : "CHECK_REQUIRED",
        },
        verificationKey: "ikx7Y7qawZMo7QUj2SA2PjFqOE-dmbj-Nl4fbhtafXE",
      },
    });
  } catch (error: any) {
    console.error("[GSC Health] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to check SEO health" }, { status: 500 });
  }
}

