import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const audiences = await prisma.audience.findMany({
      where: { workspaceId: auth.workspace.id },
      include: {
        _count: {
          select: { contacts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      object: "list",
      data: audiences.map((aud) => ({
        id: aud.id,
        name: aud.name,
        description: aud.description,
        contacts_count: aud._count.contacts,
        created_at: aud.createdAt,
      })),
    });
  } catch (error: any) {
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "BadRequest", message: "Audience name is required" },
        { status: 400 }
      );
    }

    const audience = await prisma.audience.create({
      data: {
        workspaceId: auth.workspace.id,
        name,
        description,
      },
    });

    return NextResponse.json({
      object: "audience",
      data: audience,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
