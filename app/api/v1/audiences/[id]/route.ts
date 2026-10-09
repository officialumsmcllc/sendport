import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

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

    const audience = await prisma.audience.findFirst({
      where: {
        id,
        workspaceId: auth.workspace.id,
      },
      include: {
        _count: {
          select: { contacts: true },
        },
      },
    });

    if (!audience) {
      return NextResponse.json({ error: "Audience not found" }, { status: 404 });
    }

    // Get breakdown stats
    const subscribedCount = await prisma.contact.count({
      where: { audienceId: id, unsubscribed: false },
    });
    const unsubscribedCount = await prisma.contact.count({
      where: { audienceId: id, unsubscribed: true },
    });

    return NextResponse.json({
      object: "audience",
      data: {
        id: audience.id,
        name: audience.name,
        description: audience.description,
        totalContacts: audience._count.contacts,
        subscribedContacts: subscribedCount,
        unsubscribedContacts: unsubscribedCount,
        createdAt: audience.createdAt,
        updatedAt: audience.updatedAt,
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
    const { name, description } = body;

    const existing = await prisma.audience.findFirst({
      where: { id, workspaceId: auth.workspace.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Audience not found" }, { status: 404 });
    }

    const updated = await prisma.audience.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
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

    const existing = await prisma.audience.findFirst({
      where: { id, workspaceId: auth.workspace.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Audience not found" }, { status: 404 });
    }

    // Delete contacts first, then audience
    await prisma.contact.deleteMany({
      where: { audienceId: id },
    });

    await prisma.audience.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Audience '${existing.name}' and all contacts deleted successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
