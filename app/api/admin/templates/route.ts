import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

// Automated spam & security analysis for user templates
function analyzeTemplateSafety(subject: string, htmlContent: string) {
  const flags: string[] = [];
  let score = 0; // 0 is clean, 100 is high risk

  const spamTriggers = [
    { pattern: /\b(100% free|free money|wire transfer|crypto payout|bitcoin|lottery)\b/i, label: "High-risk financial/lottery keywords", penalty: 35 },
    { pattern: /\b(urgent action required|account suspended|verify your wallet|reset password immediately)\b/i, label: "Phishing/urgency triggers", penalty: 40 },
    { pattern: /\b(viagra|cialis|enhancement|pills)\b/i, label: "Restricted pharmaceutical terms", penalty: 50 },
    { pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/i, label: "Executable JavaScript tag detected", penalty: 60 },
    { pattern: /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/i, label: "Embedded iframe detected", penalty: 40 },
  ];

  for (const trigger of spamTriggers) {
    if (trigger.pattern.test(subject) || trigger.pattern.test(htmlContent)) {
      flags.push(trigger.label);
      score += trigger.penalty;
    }
  }

  // Check for unsubscribe link/tag
  const hasUnsubscribe = /unsubscribe|\{\{unsubscribe\}\}|opt-out/i.test(htmlContent);
  if (!hasUnsubscribe && htmlContent.length > 200) {
    flags.push("Missing unsubscribe disclaimer or tag");
    score += 15;
  }

  score = Math.min(100, score);
  const riskLevel = score >= 50 ? "HIGH" : score >= 25 ? "MEDIUM" : "LOW";

  return {
    score,
    riskLevel,
    flags,
    hasUnsubscribe,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));
    const q = (searchParams.get("q") || "").trim();
    const workspaceId = searchParams.get("workspaceId");

    const where: any = {};
    if (workspaceId && workspaceId !== "ALL") {
      where.workspaceId = workspaceId;
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { subject: { contains: q, mode: "insensitive" } },
        { workspace: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [templates, totalCount, totalWorkspaces] = await Promise.all([
      prisma.emailTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              slug: true,
              plan: true,
              members: {
                take: 1,
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          folder: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      }),
      prisma.emailTemplate.count({ where }),
      prisma.workspace.count(),
    ]);

    // Attach safety audit to each template
    const formattedTemplates = templates.map((t) => {
      const safety = analyzeTemplateSafety(t.subject, t.htmlContent || "");
      let parsedVariables: string[] = [];
      try {
        if (t.variables) {
          parsedVariables = JSON.parse(t.variables);
        }
      } catch (e) {
        parsedVariables = [];
      }

      const ownerUser = t.workspace?.members?.[0]?.user;

      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        subject: t.subject,
        htmlContent: t.htmlContent,
        textContent: t.textContent,
        variables: parsedVariables,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        workspace: {
          id: t.workspace?.id || t.workspaceId,
          name: t.workspace?.name || "Workspace",
          slug: t.workspace?.slug || "",
          plan: t.workspace?.plan || "STARTER",
          user: ownerUser || {
            id: "",
            name: null,
            email: "user@domain.com",
          },
        },
        folder: t.folder,
        safety,
      };
    });

    return NextResponse.json({
      success: true,
      templates: formattedTemplates,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      stats: {
        totalTemplates: totalCount,
        totalWorkspaces,
      },
    });
  } catch (error: any) {
    console.error("Admin Templates GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch user templates" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Template ID is required." }, { status: 400 });
    }

    const existing = await prisma.emailTemplate.findUnique({
      where: { id },
      include: {
        workspace: { select: { id: true, name: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    await prisma.emailTemplate.delete({
      where: { id },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "DELETE_USER_TEMPLATE",
          details: `Admin deleted template "${existing.name}" (ID: ${existing.id}) belonging to workspace "${existing.workspace?.name || existing.workspaceId}"`,
          ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
        },
      });
    } catch (e) {
      console.warn("Audit log creation warning:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Template "${existing.name}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error("Admin Template DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete template" }, { status: 500 });
  }
}
