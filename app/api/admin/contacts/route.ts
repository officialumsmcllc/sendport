import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const workspaceId = searchParams.get("workspaceId") || "";
    const status = searchParams.get("status") || "ALL"; // ALL, SUBSCRIBED, UNSUBSCRIBED
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "30", 10)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (workspaceId && workspaceId !== "ALL") {
      where.audience = {
        workspaceId,
      };
    }

    if (status === "SUBSCRIBED") {
      where.unsubscribed = false;
    } else if (status === "UNSUBSCRIBED") {
      where.unsubscribed = true;
    }

    if (query) {
      where.OR = [
        { email: { contains: query, mode: "insensitive" } },
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { tags: { contains: query, mode: "insensitive" } },
      ];
    }

    const [
      totalContacts,
      subscribedCount,
      unsubscribedCount,
      totalAudiences,
      workspaces,
      contacts,
    ] = await Promise.all([
      prisma.contact.count(),
      prisma.contact.count({ where: { unsubscribed: false } }),
      prisma.contact.count({ where: { unsubscribed: true } }),
      prisma.audience.count(),
      prisma.workspace.findMany({
        select: { id: true, name: true, slug: true, plan: true },
        orderBy: { name: "asc" },
      }),
      prisma.contact.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          audience: {
            select: {
              id: true,
              name: true,
              workspace: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  plan: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const filteredTotal = await prisma.contact.count({ where });

    return NextResponse.json({
      metrics: {
        totalContacts,
        subscribedCount,
        unsubscribedCount,
        totalAudiences,
      },
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit),
      },
      workspaces,
      contacts: contacts.map((c) => {
        let parsedTags: string[] = [];
        try {
          if (c.tags) {
            parsedTags = Array.isArray(JSON.parse(c.tags)) ? JSON.parse(c.tags) : [c.tags];
          }
        } catch {
          if (c.tags) parsedTags = [c.tags];
        }

        return {
          id: c.id,
          email: c.email,
          firstName: c.firstName,
          lastName: c.lastName,
          unsubscribed: c.unsubscribed,
          tags: parsedTags,
          createdAt: c.createdAt,
          audienceName: c.audience.name,
          audienceId: c.audience.id,
          workspaceId: c.audience.workspace.id,
          workspaceName: c.audience.workspace.name,
          workspacePlan: c.audience.workspace.plan,
        };
      }),
    });
  } catch (error: any) {
    console.error("Admin Contacts API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
    }

    await prisma.contact.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Contact deleted by Administrator" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
