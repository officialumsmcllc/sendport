import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    let workspace = await prisma.workspace.findFirst({
      include: {
        apiKeys: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "Default Workspace", slug: "default" },
        include: { apiKeys: true },
      });
    }

    return NextResponse.json({ apiKeys: workspace.apiKeys });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, scope } = body;

    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "Default Workspace", slug: "default" },
      });
    }

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: "admin@getsendport.com", name: "Muhammad Umar" },
      });
    }

    // Generate sk_live_... key
    const rawSecret = crypto.randomBytes(24).toString("hex");
    const fullKey = `sk_live_${rawSecret}`;
    const keyPrefix = `sk_live_${rawSecret.substring(0, 6)}...`;

    const apiKey = await prisma.apiKey.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        name: name || "Production Key",
        keyHash: fullKey, // for full-stack demo/SaaS display
        keyPrefix,
        scope: scope || "FULL_ACCESS",
      },
    });

    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      token: fullKey, // Shown only once upon creation
      scope: apiKey.scope,
      created_at: apiKey.createdAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing 'id' parameter" }, { status: 400 });
    }

    await prisma.apiKey.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
