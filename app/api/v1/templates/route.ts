import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{([a-zA-Z0-9_]+)\}\}/g);
  if (!matches) return [];
  const vars = matches.map((m) => m.replace(/[{}]/g, "").trim());
  return Array.from(new Set(vars));
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folderSlug = searchParams.get("folder");
    const query = searchParams.get("q") || "";

    // Check count and seed starter templates if empty
    const count = await prisma.emailTemplate.count({
      where: { workspaceId: auth.workspace.id },
    });

    if (count === 0) {
      // Seed default professional transactional and marketing templates
      await prisma.emailTemplate.createMany({
        data: [
          {
            workspaceId: auth.workspace.id,
            name: "Welcome Onboarding Email",
            slug: "welcome-onboarding",
            subject: "Welcome to {{company_name}} 🚀",
            htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
  <h2 style="color: #0f172a; margin-top: 0;">Welcome, {{first_name}}!</h2>
  <p style="color: #475569; font-size: 15px; line-height: 1.6;">We are thrilled to have you onboard at {{company_name}}. Let's get your setup completed in minutes.</p>
  <a href="https://getsendport.com/dashboard" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px;">Go to Dashboard &rarr;</a>
</div>`,
            textContent: "Welcome, {{first_name}}! We are thrilled to have you onboard at {{company_name}}.",
            variables: JSON.stringify(["company_name", "first_name"]),
          },
          {
            workspaceId: auth.workspace.id,
            name: "Security OTP Verification",
            slug: "security-otp-verification",
            subject: "Your Sendport Verification Code: {{otp_code}}",
            htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;">
  <h2 style="color: #0f172a; margin-top: 0;">Security Verification Code</h2>
  <p style="color: #64748b; font-size: 14px;">Enter this 6-digit code to securely confirm your account action.</p>
  <div style="background: #f1f5f9; padding: 18px 32px; border-radius: 12px; display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: 900; color: #0f172a; font-family: monospace; border: 1px dashed #cbd5e1;">
    {{otp_code}}
  </div>
  <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">This code will expire in 10 minutes. If you did not request this, please ignore.</p>
</div>`,
            textContent: "Your verification code is: {{otp_code}}. Expires in 10 minutes.",
            variables: JSON.stringify(["otp_code"]),
          },
        ],
      });
    }

    const whereClause: any = {
      workspaceId: auth.workspace.id,
    };

    if (folderSlug && folderSlug !== "all") {
      whereClause.folder = { slug: folderSlug };
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { subject: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
      ];
    }

    const templates = await prisma.emailTemplate.findMany({
      where: whereClause,
      include: {
        folder: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const parsed = templates.map((t) => {
      let vars: string[] = [];
      try {
        if (t.variables) {
          vars = JSON.parse(t.variables);
        }
      } catch {
        vars = extractVariables(t.htmlContent + " " + t.subject);
      }
      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        subject: t.subject,
        folder: t.folder?.name || "General",
        folderId: t.folderId,
        htmlContent: t.htmlContent,
        textContent: t.textContent,
        variables: vars,
        updatedAt: t.updatedAt,
        createdAt: t.createdAt,
      };
    });

    return NextResponse.json({
      object: "list",
      data: parsed,
      count: parsed.length,
    });
  } catch (error: any) {
    console.error("Templates GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, subject, htmlContent, textContent, folderId } = body;

    if (!name || !subject || !htmlContent) {
      return NextResponse.json(
        { error: "BadRequest", message: "Name, subject, and htmlContent are required" },
        { status: 400 }
      );
    }

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug || "template"}-${randomSuffix}`;

    const autoVars = extractVariables(htmlContent + " " + subject);

    const created = await prisma.emailTemplate.create({
      data: {
        workspaceId: auth.workspace.id,
        name: name.trim(),
        slug,
        subject: subject.trim(),
        htmlContent,
        textContent: textContent || "",
        folderId: folderId || null,
        variables: JSON.stringify(autoVars),
      },
      include: {
        folder: true,
      },
    });

    return NextResponse.json({
      object: "email_template",
      message: "Template created successfully",
      template: {
        id: created.id,
        name: created.name,
        slug: created.slug,
        subject: created.subject,
        folder: created.folder?.name || "General",
        folderId: created.folderId,
        htmlContent: created.htmlContent,
        textContent: created.textContent,
        variables: autoVars,
        updatedAt: created.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Template Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
