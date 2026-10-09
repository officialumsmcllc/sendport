import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const original = await prisma.emailTemplate.findFirst({
      where: { id, workspaceId: auth.workspace.id },
    });

    if (!original) {
      return NextResponse.json(
        { error: "NotFound", message: "Template not found in your workspace" },
        { status: 404 }
      );
    }

    const shortId = Math.random().toString(36).substring(2, 6);
    const newSlug = `${original.slug}-copy-${shortId}`;
    const newName = `${original.name} (Copy)`;

    const cloned = await prisma.emailTemplate.create({
      data: {
        workspaceId: original.workspaceId,
        folderId: original.folderId,
        name: newName,
        slug: newSlug,
        subject: original.subject,
        htmlContent: original.htmlContent,
        textContent: original.textContent,
        variables: original.variables,
      },
    });

    return NextResponse.json({
      object: "email_template",
      message: "Template duplicated successfully",
      template: cloned,
    });
  } catch (error: any) {
    console.error("Duplicate Template Error:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: error.message },
      { status: 500 }
    );
  }
}
