import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const email = await prisma.emailLog.findFirst({
      where: {
        OR: [{ messageId: id }, { id }],
      },
      include: {
        events: true,
      },
    });

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
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
