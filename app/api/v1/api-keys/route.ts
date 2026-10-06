import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        workspaces: {
          include: {
            workspace: {
              include: {
                apiKeys: {
                  orderBy: { createdAt: "desc" },
                },
              },
            },
          },
        },
      },
    });

    const workspace = user?.workspaces?.[0]?.workspace;
    return NextResponse.json({ apiKeys: workspace?.apiKeys || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, scope } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
        },
      },
    });

    const workspace = user?.workspaces?.[0]?.workspace;
    if (!workspace) {
      return NextResponse.json({ error: "No workspace found for user" }, { status: 404 });
    }

    // Generate sk_live_... key
    const rawSecret = crypto.randomBytes(24).toString("hex");
    const fullKey = `sk_live_${rawSecret}`;
    const keyPrefix = `sk_live_${rawSecret.substring(0, 8)}...`;

    const apiKey = await prisma.apiKey.create({
      data: {
        workspaceId: workspace.id,
        userId: session.userId,
        name: name || "Production Key",
        keyHash: fullKey,
        keyPrefix,
        scope: scope || "FULL_ACCESS",
      },
    });

    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      token: fullKey, // Shown only once upon creation
      keyPrefix: apiKey.keyPrefix,
      scope: apiKey.scope,
      created_at: apiKey.createdAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing key ID" }, { status: 400 });
    }

    await prisma.apiKey.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "API Key revoked successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
