// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { getSearchAnalytics, isGscConfigured } from "@/lib/seo/gsc-client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "28d";

    const now = new Date();
    let days = 28;
    if (range === "7d") days = 7;
    else if (range === "3m") days = 90;
    else if (range === "6m") days = 180;
    else if (range === "12m") days = 365;

    const startDate = new Date(now.getTime() - days * 24 * 3600 * 1000).toISOString().split("T")[0];
    const endDate = now.toISOString().split("T")[0];

    const result = await getSearchAnalytics({
      startDate,
      endDate,
      dimensions: ["query", "page"],
      rowLimit: 250,
    });

    return NextResponse.json({
      success: true,
      isConfigured: isGscConfigured(),
      range,
      startDate,
      endDate,
      data: result,
    });
  } catch (error: any) {
    console.error("[GSC API] Error in performance route:", error);
    return NextResponse.json({ error: error.message || "Failed to load GSC performance data" }, { status: 500 });
  }
}

