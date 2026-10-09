import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { workspaceId: auth.workspace.id },
      orderBy: { createdAt: "desc" },
    });

    const mapped = apiKeys.map((k) => ({
      ...k,
      token: k.keyHash,
    }));
    return NextResponse.json({ apiKeys: mapped });
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
    const { name, scope } = body;

    // Generate sk_live_... key
    const rawSecret = crypto.randomBytes(24).toString("hex");
    const fullKey = `sk_live_${rawSecret}`;
    const keyPrefix = `sk_live_${rawSecret.substring(0, 8)}...`;

    const apiKey = await prisma.apiKey.create({
      data: {
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
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
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing key ID" }, { status: 400 });
    }

    const existingKey = await prisma.apiKey.findFirst({
      where: {
        id,
        workspaceId: auth.workspace.id,
      },
    });

    if (!existingKey) {
      return NextResponse.json({ error: "API Key not found in your workspace" }, { status: 404 });
    }

    await prisma.apiKey.delete({
      where: { id: existingKey.id },
    });

    return NextResponse.json({ success: true, message: "API Key revoked successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
