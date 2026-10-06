import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { logSecurityAudit } from "@/lib/security/audit";

let broadcasts = [
  {
    id: "bc_1",
    title: "Dedicated High-Throughput IP Warmup Complete",
    message: "Our primary sending pool now handles up to 500k emails/day with 99.8% inbox placement.",
    type: "SUCCESS", // INFO, WARNING, CRITICAL, SUCCESS
    isActive: true,
    targetAudience: "ALL_USERS",
    createdAt: new Date().toISOString(),
  },
  {
    id: "bc_2",
    title: "Scheduled Maintenance Window",
    message: "Zero-downtime routing upgrade scheduled for Sunday 02:00 UTC.",
    type: "INFO",
    isActive: false,
    targetAudience: "ALL_USERS",
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      broadcasts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { title, message, type } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required." }, { status: 400 });
    }

    const newBroadcast = {
      id: "bc_" + Math.random().toString(36).substring(2, 9),
      title,
      message,
      type: type || "INFO",
      isActive: true,
      targetAudience: "ALL_USERS",
      createdAt: new Date().toISOString(),
    };

    broadcasts.unshift(newBroadcast);
    logSecurityAudit("BROADCAST_PUBLISHED", session.userId, { broadcastId: newBroadcast.id, title });

    return NextResponse.json({
      success: true,
      message: "Broadcast published to platform dashboard.",
      broadcast: newBroadcast,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, isActive } = body;

    const bc = broadcasts.find((b) => b.id === id);
    if (!bc) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    bc.isActive = isActive;
    return NextResponse.json({ success: true, broadcast: bc });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    broadcasts = broadcasts.filter((b) => b.id !== id);
    return NextResponse.json({ success: true, message: "Broadcast deleted." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
