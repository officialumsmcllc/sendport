import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create user and default workspace
    const user = await prisma.user.create({
      data: {
        name: name?.trim() || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        passwordHash,
        role: "USER",
      },
    });

    const slug = `workspace-${normalizedEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "")}-${Date.now().toString(36)}`;
    const workspace = await prisma.workspace.create({
      data: {
        name: `${user.name}'s Workspace`,
        slug,
        plan: "STARTER",
        dailyQuota: 500,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    // Send Welcome Email if SMTP is configured
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
          from: `"Sendport Team" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: "Welcome to Sendport — Start sending emails in seconds! 🚀",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #0f172a; margin-top: 0;">Welcome to Sendport, ${user.name}! 🎉</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">Your developer workspace is ready. You can now add your sending domain, generate 2048-bit DKIM keys, and start sending high-deliverability transactional emails with sub-10ms latency.</p>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #1e293b;">Your Starter Plan Includes:</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #64748b;">
                  <li>500 Free Emails / Day (15,000 / month)</li>
                  <li>1 Verified Custom Domain + DKIM & SPF</li>
                  <li>SMTP Relay & Developer REST API</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://getsendport.com'}/dashboard" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block;">Open Your Dashboard &rarr;</a>
              </div>
              <p style="color: #64748b; font-size: 12px;">Need help? Reply directly to this email or reach out to our team.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">Sendport &bull; The Developer-First Email Delivery Platform</p>
            </div>
          `,
        });
      } catch (mailErr) {
        console.warn("Failed to send welcome email via SMTP:", mailErr);
      }
    }

    // Create session token
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully! Welcome to Sendport.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaceId: workspace.id,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
