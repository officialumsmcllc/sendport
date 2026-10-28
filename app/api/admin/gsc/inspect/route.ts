// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { inspectUrl, isGscConfigured } from "@/lib/seo/gsc-client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    let url = body.url?.trim();

    if (!url) {
      return NextResponse.json({ error: "URL is required for inspection." }, { status: 400 });
    }

    // Auto prepend domain if relative path
    if (url.startsWith("/")) {
      url = `https://getsendport.com${url}`;
    }

    const inspection = await inspectUrl(url);

    return NextResponse.json({
      success: true,
      isConfigured: isGscConfigured(),
      inspection,
    });
  } catch (error: any) {
    console.error("[GSC Inspect] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to inspect URL" }, { status: 500 });
  }
}

