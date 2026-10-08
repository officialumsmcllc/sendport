import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

/**
 * GET, POST, DELETE /api/v1/suppressions
 * Isolated per workspace.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const suppressions = await prisma.suppression.findMany({
      where: { workspaceId: auth.workspace.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      suppressions: suppressions.map((s) => ({
        id: s.id,
        email: s.email,
        reason: s.reason,
        date: new Date(s.createdAt).toLocaleDateString(),
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
    const { email, reason } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const suppression = await prisma.suppression.upsert({
      where: {
        workspaceId_email: {
          workspaceId: auth.workspace.id,
          email: cleanEmail,
        },
      },
      update: {
        reason: reason || "MANUAL",
      },
      create: {
        workspaceId: auth.workspace.id,
        email: cleanEmail,
        reason: reason || "MANUAL",
      },
    });

    return NextResponse.json({
      success: true,
      suppression: {
        id: suppression.id,
        email: suppression.email,
        reason: suppression.reason,
        date: "Just now",
      },
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
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required." }, { status: 400 });
    }

    await prisma.suppression.deleteMany({
      where: {
        workspaceId: auth.workspace.id,
        email: email.trim().toLowerCase(),
      },
    });

    return NextResponse.json({ success: true, message: "Suppression removed successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
