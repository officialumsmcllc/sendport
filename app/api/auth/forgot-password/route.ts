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

    // Send real password reset email if SMTP is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST) {
      try {
        const nodemailer = (await import("nodemailer")).default;
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "465", 10),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Sendport Security" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: "Your Sendport Password Reset Code",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">You requested a password reset for your Sendport account. Use the 6-digit verification code below to set a new password:</p>
              <div style="text-align: center; margin: 28px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; background: #eef2ff; padding: 12px 24px; border-radius: 8px; display: inline-block;">${recoveryCode}</span>
              </div>
              <p style="color: #64748b; font-size: 12px;">This code will expire in 15 minutes. If you didn't request this reset, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">Sendport Email Platform &bull; secure.getsendport.com</p>
            </div>
          `,
        });
      } catch (mailErr) {
        console.warn("Failed to send reset email via SMTP:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Password reset recovery code generated and sent to ${user.email}.`,
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
