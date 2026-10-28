// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { getSearchAnalytics } from "@/lib/seo/gsc-client";
import {
  findStrikingDistanceKeywords,
  findLowCtrOpportunities,
  detectCannibalization,
} from "@/lib/seo/ranking-doctor";

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

    const startDate = new Date(now.getTime() - days * 24 * 3600 * 1000).toISOString().split("T")[0];
    const endDate = now.toISOString().split("T")[0];

    const analytics = await getSearchAnalytics({
      startDate,
      endDate,
      dimensions: ["query", "page"],
      rowLimit: 500,
    });

    const strikingDistance = findStrikingDistanceKeywords(analytics.rows);
    const ctrOpportunities = findLowCtrOpportunities(analytics.rows);
    const cannibalizationIssues = detectCannibalization(analytics.rows);

    // Calculate total potential clicks gain
    let potentialGainClicks = 0;
    strikingDistance.forEach((s) => {
      const match = s.potentialTrafficLift.match(/\+(\d+)/);
      if (match) potentialGainClicks += parseInt(match[1], 10);
    });
    ctrOpportunities.forEach((c) => {
      potentialGainClicks += c.missedClicksPerMonth;
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalOpportunities: strikingDistance.length + ctrOpportunities.length + cannibalizationIssues.length,
        strikingDistanceCount: strikingDistance.length,
        lowCtrCount: ctrOpportunities.length,
        cannibalizationCount: cannibalizationIssues.length,
        estimatedMonthlyClickGain: potentialGainClicks,
      },
      recommendations: {
        strikingDistance,
        ctrOpportunities,
        cannibalizationIssues,
      },
    });
  } catch (error: any) {
    console.error("[GSC Recommendations] Error generating SEO prescriptions:", error);
    return NextResponse.json({ error: error.message || "Failed to generate recommendations" }, { status: 500 });
  }
}

