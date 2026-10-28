// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { publishIndexingNotification, isGscConfigured } from "@/lib/seo/gsc-client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    let url = body.url?.trim();
    const type = body.type === "URL_DELETED" ? "URL_DELETED" : "URL_UPDATED";

    if (!url) {
      return NextResponse.json({ error: "URL is required for index notification" }, { status: 400 });
    }

    if (url.startsWith("/")) {
      url = `https://getsendport.com${url}`;
    }

    const result = await publishIndexingNotification(url, type);
    return NextResponse.json({
      ...result,
      isConfigured: isGscConfigured(),
      targetUrl: url,
      action: type,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[GSC Index Ping] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to notify Googlebot" }, { status: 500 });
  }
}

