import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let workspaceId: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const apiKeyRaw = authHeader.replace("Bearer ", "").trim();
      const key = await prisma.apiKey.findFirst({
        where: {
          OR: [
            { keyHash: apiKeyRaw },
            { keyPrefix: { startsWith: apiKeyRaw.substring(0, 12) } },
          ],
        },
      });
      if (key) workspaceId = key.workspaceId;
    }

    if (!workspaceId) {
      // Fallback to primary workspace for dashboard session
      const ws = await prisma.workspace.findFirst();
      if (ws) workspaceId = ws.id;
    }

    if (!workspaceId) {
      return NextResponse.json({ audiences: [] });
    }

    const audiences = await prisma.audience.findMany({
      where: { workspaceId },
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
    const body = await req.json();
    const { name, description, workspaceId: providedWsId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "BadRequest", message: "Audience name is required" },
        { status: 400 }
      );
    }

    let workspaceId = providedWsId;
    if (!workspaceId) {
      const ws = await prisma.workspace.findFirst();
      if (ws) workspaceId = ws.id;
    }

    const audience = await prisma.audience.create({
      data: {
        workspaceId,
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
