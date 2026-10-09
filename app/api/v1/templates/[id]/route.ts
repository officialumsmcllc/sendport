import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{([a-zA-Z0-9_]+)\}\}/g);
  if (!matches) return [];
  const vars = matches.map((m) => m.replace(/[{}]/g, "").trim());
  return Array.from(new Set(vars));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const template = await prisma.emailTemplate.findFirst({
      where: { id, workspaceId: auth.workspace.id },
      include: { folder: true },
    });

    if (!template) {
      return NextResponse.json({ error: "NotFound", message: "Template not found" }, { status: 404 });
    }

    let vars: string[] = [];
    try {
      if (template.variables) vars = JSON.parse(template.variables);
    } catch {
      vars = extractVariables(template.htmlContent + " " + template.subject);
    }

    return NextResponse.json({
      template: {
        id: template.id,
        name: template.name,
        slug: template.slug,
        subject: template.subject,
        folder: template.folder?.name || "General",
        folderId: template.folderId,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        variables: vars,
        updatedAt: template.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, subject, htmlContent, textContent, folderId } = body;

    const existing = await prisma.emailTemplate.findFirst({
      where: { id, workspaceId: auth.workspace.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "NotFound", message: "Template not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (subject !== undefined) updateData.subject = subject.trim();
    if (htmlContent !== undefined) {
      updateData.htmlContent = htmlContent;
      const combined = (subject || existing.subject) + " " + htmlContent;
      updateData.variables = JSON.stringify(extractVariables(combined));
    }
    if (textContent !== undefined) updateData.textContent = textContent;
    if (folderId !== undefined) updateData.folderId = folderId || null;

    const updated = await prisma.emailTemplate.update({
      where: { id },
      data: updateData,
      include: { folder: true },
    });

    return NextResponse.json({
      message: "Template updated successfully",
      template: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.emailTemplate.findFirst({
      where: { id, workspaceId: auth.workspace.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "NotFound", message: "Template not found" }, { status: 404 });
    }

    await prisma.emailTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
