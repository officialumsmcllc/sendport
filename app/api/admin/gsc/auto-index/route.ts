// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { getLatestAutoIndexReport, runAutoIndexScan } from "@/lib/seo/auto-indexer";
import { inspectUrl, publishIndexingNotification } from "@/lib/seo/gsc-client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const report = await getLatestAutoIndexReport();
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error("[Auto-Index GET] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load auto-index report" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));

    // If specific single URL auto-index requested
    if (body.url) {
      let url = body.url.trim();
      if (url.startsWith("/")) {
        url = `https://getsendport.com${url}`;
      }

      const inspection = await inspectUrl(url);
      const isIndexed =
        inspection.verdict === "PASS" &&
        !(inspection.coverageState || "").toLowerCase().includes("not indexed");

      let pingResult = null;
      if (!isIndexed || body.forcePing) {
        pingResult = await publishIndexingNotification(url, "URL_UPDATED");
      }

      return NextResponse.json({
        success: true,
        url,
        isIndexed,
        inspection,
        pingResult,
        actionTaken: !isIndexed ? "AUTO_INDEXED" : "VERIFIED_INDEXED",
        message: !isIndexed
          ? `Page was unindexed. Automatically dispatched Googlebot crawl ping!`
          : `Page is already verified and indexed.`,
      });
    }

    // Trigger full site-wide scan & auto-index
    const report = await runAutoIndexScan();

    return NextResponse.json({
      success: true,
      message: `Full site scan completed. ${report.autoDispatchedCount} unindexed pages were automatically healed and pushed to Googlebot!`,
      report,
    });
  } catch (error: any) {
    console.error("[Auto-Index POST] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute auto-index scan" }, { status: 500 });
  }
}

