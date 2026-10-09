import { NextRequest, NextResponse } from "next/server";
import { analyzeEmailDeliverability } from "@/lib/deliverability/spam-checker";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject = "", content = "", htmlContent = "" } = body;
    const emailBody = htmlContent || content;

    const result = analyzeEmailDeliverability(subject, emailBody);

    let grade: "A+" | "A" | "B" | "C" | "F" = "A+";
    if (result.score >= 95) grade = "A+";
    else if (result.score >= 85) grade = "A";
    else if (result.score >= 70) grade = "B";
    else if (result.score >= 50) grade = "C";
    else grade = "F";

    return NextResponse.json({
      success: true,
      score: result.score,
      grade,
      isSpamLikely: result.isSpamLikely,
      detectedTriggers: result.detectedTriggers,
      suggestions: result.suggestions,
      details: result.details,
    });
  } catch (error: any) {
    console.error("Spam Check API Error:", error);
    return NextResponse.json(
      { error: "InternalError", message: error.message || "Failed to analyze spam heuristics" },
      { status: 500 }
    );
  }
}
