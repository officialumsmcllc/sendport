import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "ALL";
    const query = searchParams.get("q")?.trim() || "";

    const where: any = {};
    if (statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    if (query) {
      where.OR = [
        { ticketNumber: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { subject: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ];
    }

    const [tickets, totalCount, newCount, openCount, repliedCount, closedCount] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: "NEW" } }),
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.supportTicket.count({ where: { status: "REPLIED" } }),
      prisma.supportTicket.count({ where: { status: "CLOSED" } }),
    ]);

    return NextResponse.json({
      tickets,
      counts: {
        total: totalCount,
        new: newCount,
        open: openCount,
        replied: repliedCount,
        closed: closedCount,
      },
    });
  } catch (error: any) {
    console.error("[ADMIN_SUPPORT_GET_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch support tickets." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { ticketId, status, priority } = body;

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data,
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: any) {
    console.error("[ADMIN_SUPPORT_PATCH_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to update support ticket." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
    }

    await prisma.supportTicket.delete({
      where: { id: ticketId },
    });

    return NextResponse.json({ success: true, message: "Ticket removed successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
