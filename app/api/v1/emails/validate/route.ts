import { NextRequest, NextResponse } from "next/server";
import { validateEmailAddress } from "@/lib/email/validator";

/**
 * POST /api/v1/emails/validate
 * In-flight syntax, disposable email detection, and format verification
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Missing required parameter 'email'." },
        { status: 422 }
      );
    }

    const result = validateEmailAddress(email);

    return NextResponse.json({
      email: result.email,
      is_valid: result.isValid,
      is_disposable: result.isDisposable,
      domain: result.domain,
      reason: result.reason || "Valid syntax format",
      score: result.isValid && !result.isDisposable ? 0.98 : 0.1,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
