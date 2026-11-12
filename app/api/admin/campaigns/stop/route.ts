// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { blastId } = body;

    if (!blastId) {
      return NextResponse.json({ error: "Campaign Blast ID is required." }, { status: 400 });
    }

    const updated = await prisma.broadcastBlast.update({
      where: { id: blastId },
      data: { status: "STOPPED" },
    });

    // Immediately cancel any pending or queued email logs for this blast
    await prisma.emailLog.updateMany({
      where: {
        workspaceId: updated.workspaceId,
        subject: updated.subject,
        status: { in: ["PENDING", "QUEUED", "SENDING"] },
      },
      data: { status: "CANCELLED" },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Campaign '${updated.subject}' has been safely stopped.`,
      status: updated.status,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

