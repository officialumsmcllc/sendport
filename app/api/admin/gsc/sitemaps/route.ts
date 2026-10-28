// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { getSitemapsList, submitSitemap, isGscConfigured } from "@/lib/seo/gsc-client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const result = await getSitemapsList();
    return NextResponse.json({
      success: true,
      isConfigured: isGscConfigured(),
      ...result,
    });
  } catch (error: any) {
    console.error("[GSC Sitemaps] GET Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch sitemaps" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const feedpath = body.feedpath?.trim() || "https://getsendport.com/sitemap.xml";

    const result = await submitSitemap(feedpath);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[GSC Sitemaps] POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit sitemap" }, { status: 500 });
  }
}

