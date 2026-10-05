import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const ws = await prisma.workspace.findFirst();
    if (!ws) return NextResponse.json({ folders: [] });

    const folders = await prisma.templateFolder.findMany({
      where: { workspaceId: ws.id },
      include: {
        _count: {
          select: { templates: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      object: "list",
      data: folders.map((f) => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
        color: f.color,
        templates_count: f._count.templates,
        created_at: f.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "BadRequest", message: "Folder name is required" },
        { status: 400 }
      );
    }

    const ws = await prisma.workspace.findFirst();
    if (!ws) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const folder = await prisma.templateFolder.upsert({
      where: {
        workspaceId_slug: {
          workspaceId: ws.id,
          slug,
        },
      },
      update: {
        name,
        color: color || "#3b82f6",
      },
      create: {
        workspaceId: ws.id,
        name,
        slug,
        color: color || "#3b82f6",
      },
    });

    return NextResponse.json({
      object: "template_folder",
      data: folder,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
