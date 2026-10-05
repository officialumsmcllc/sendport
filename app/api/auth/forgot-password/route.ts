import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No registered account found with this email address. Please register first." },
        { status: 404 }
      );
    }

    // Generate secure 6-digit recovery code and reset token
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(24).toString("hex");

    return NextResponse.json({
      success: true,
      message: `Password reset recovery code generated for ${user.email}.`,
      recoveryCode,
      resetToken,
      email: user.email,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
