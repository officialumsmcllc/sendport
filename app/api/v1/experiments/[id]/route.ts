import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

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
    const { status, title, split } = body;

    const existing = await prisma.abExperiment.findFirst({
      where: { id, workspaceId: auth.workspace.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    const updated = await prisma.abExperiment.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(title ? { title: title.trim() } : {}),
        ...(split ? { split: Number(split) } : {}),
      },
    });

    return NextResponse.json({ success: true, experiment: updated });
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

    const existing = await prisma.abExperiment.findFirst({
      where: { id, workspaceId: auth.workspace.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    await prisma.abExperiment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Experiment deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
