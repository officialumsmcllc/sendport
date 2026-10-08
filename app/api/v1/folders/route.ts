import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const folders = await prisma.templateFolder.findMany({
      where: { workspaceId: auth.workspace.id },
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
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "BadRequest", message: "Folder name is required" },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const folder = await prisma.templateFolder.upsert({
      where: {
        workspaceId_slug: {
          workspaceId: auth.workspace.id,
          slug,
        },
      },
      update: {
        name,
        color: color || "#3b82f6",
      },
      create: {
        workspaceId: auth.workspace.id,
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
