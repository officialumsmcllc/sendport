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
    const email = await prisma.emailLog.findFirst({
      where: {
        workspaceId: auth.workspace.id,
        OR: [{ messageId: id }, { id }],
      },
      include: {
        events: true,
        domain: {
          select: { id: true, name: true, status: true },
        },
      },
    });

    if (!email) {
      return NextResponse.json({ error: "Email log not found in your workspace" }, { status: 404 });
    }

    return NextResponse.json({
      id: email.messageId,
      from: email.from,
      to: email.to.split(", "),
      subject: email.subject,
      status: email.status.toLowerCase(),
      open_count: email.openCount,
      click_count: email.clickCount,
      dkim_signed: email.dkimSigned,
      created_at: email.createdAt,
      events: email.events,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
