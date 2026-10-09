import { NextRequest, NextResponse } from "next/server";
import { logSecurityAudit } from "@/lib/security/audit";
import { verifySessionEdge, SESSION_COOKIE_NAME } from "@/lib/auth/edge-session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      startupName,
      website,
      founderEmail,
      founderName,
      currentProvider,
      techStack,
      monthlyVolume,
      useCase,
    } = body;

    // 1. Basic validation
    if (!startupName || typeof startupName !== "string" || startupName.trim().length === 0) {
      return NextResponse.json(
        { error: "Startup or Company name is required." },
        { status: 400 }
      );
    }

    if (!website || typeof website !== "string" || website.trim().length === 0) {
      return NextResponse.json(
        { error: "Valid company website / domain is required." },
        { status: 400 }
      );
    }

    if (!founderEmail || typeof founderEmail !== "string" || !founderEmail.includes("@")) {
      return NextResponse.json(
        { error: "Valid founder email address is required." },
        { status: 400 }
      );
    }

    // 2. Extract client IP and optional session
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    let sessionUser = null;
    if (sessionCookie) {
      sessionUser = await verifySessionEdge(sessionCookie);
    }

    // 3. Persist audit log record
    const applicationPayload = {
      startupName: startupName.trim(),
      website: website.trim().toLowerCase(),
      founderEmail: founderEmail.trim().toLowerCase(),
      founderName: founderName?.trim() || null,
      currentProvider: currentProvider || "None",
      techStack: techStack || "Next.js",
      monthlyVolume: monthlyVolume || "< 25k/mo",
      useCase: useCase?.trim() || "Transactional / Onboarding",
      appliedAt: new Date().toISOString(),
    };

    await logSecurityAudit(
      "STARTUP_GRANT_APPLIED",
      sessionUser?.userId,
      applicationPayload,
      ip
    );

    return NextResponse.json({
      success: true,
      message:
        "Your $1,000 Startup Credit Grant application has been received! Our engineering team will review and approve your workspace within 24 hours.",
      grantAmount: "$1,000 USD",
      status: "UNDER_REVIEW",
    });
  } catch (err: any) {
    console.error("Startup application error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your application. Please try again or contact founders@getsendport.com." },
      { status: 500 }
    );
  }
}
