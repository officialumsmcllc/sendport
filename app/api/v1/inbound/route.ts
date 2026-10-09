import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const webhook = await prisma.webhook.findFirst({
      where: {
        workspaceId: auth.workspace.id,
        events: { contains: "inbound" },
      },
      include: {
        deliveries: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    const domains = await prisma.domain.findMany({
      where: { workspaceId: auth.workspace.id },
      select: { id: true, name: true, status: true, isMxValid: true },
    });

    return NextResponse.json({
      webhook: webhook
        ? {
            id: webhook.id,
            url: webhook.url,
            secret: webhook.secret,
            isActive: webhook.isActive,
            deliveries: webhook.deliveries,
          }
        : null,
      domains,
    });
  } catch (error: any) {
    console.error("Inbound GET Error:", error);
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
    const { url, isActive = true } = body;

    if (!url || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "BadRequest", message: "A valid HTTP/HTTPS webhook URL is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.webhook.findFirst({
      where: {
        workspaceId: auth.workspace.id,
        events: { contains: "inbound" },
      },
    });

    let webhook;
    if (existing) {
      webhook = await prisma.webhook.update({
        where: { id: existing.id },
        data: {
          url: url.trim(),
          isActive: Boolean(isActive),
        },
      });
    } else {
      const generatedSecret = `whsec_${crypto.randomBytes(24).toString("hex")}`;
      webhook = await prisma.webhook.create({
        data: {
          workspaceId: auth.workspace.id,
          url: url.trim(),
          secret: generatedSecret,
          events: "inbound.email,email.received",
          isActive: Boolean(isActive),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Inbound webhook route saved to database successfully",
      webhook,
    });
  } catch (error: any) {
    console.error("Inbound POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
