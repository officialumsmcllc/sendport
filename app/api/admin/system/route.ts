import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { logSecurityAudit } from "@/lib/security/audit";

// Global system config in memory / state cache
let systemConfig = {
  maintenanceMode: false,
  globalRateLimitPerSec: 250,
  maxAttachmentSizeMB: 25,
  inboundProcessing: true,
  strictDkimEnforcement: true,
  autoIpWarmup: true,
  broadcastNotice: "Welcome to Sendport High-Throughput Email Infrastructure v2.4",
  broadcastLevel: "INFO", // INFO, WARNING, CRITICAL
  broadcastActive: true,
};

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    // Server relays status
    const relays = [
      {
        name: "Primary In-House SMTP MTA (DKIM Signed)",
        host: "mail.getsendport.com:587",
        status: "HEALTHY",
        latencyMs: 18,
        activeIps: ["157.90.142.61", "157.90.142.62"],
        reputation: "100%",
        queueSize: 0,
      },
      {
        name: "Secondary Resilient Failover Pool",
        host: "relay-backup.getsendport.com:465",
        status: "STANDBY",
        latencyMs: 24,
        activeIps: ["157.90.142.63"],
        reputation: "99.9%",
        queueSize: 0,
      },
      {
        name: "High-Volume Transactional Engine (SES Gateway)",
        host: "email-smtp.us-east-1.amazonaws.com",
        status: "ACTIVE",
        latencyMs: 42,
        activeIps: ["Dedicated IP Pool"],
        reputation: "100%",
        queueSize: 2,
      },
      {
        name: "Inbound MX Routing & Webhook Gateway",
        host: "inbound.getsendport.com:25",
        status: "ONLINE",
        latencyMs: 15,
        activeIps: ["157.90.142.61"],
        reputation: "100%",
        queueSize: 0,
      },
    ];

    return NextResponse.json({
      success: true,
      config: systemConfig,
      relays,
      uptimeSeconds: process.uptime(),
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
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
    systemConfig = {
      ...systemConfig,
      ...body,
    };

    logSecurityAudit("ADMIN_SYSTEM_CONFIG_UPDATED", session.userId, {
      updatedFields: Object.keys(body),
    });

    return NextResponse.json({
      success: true,
      message: "System configuration updated successfully.",
      config: systemConfig,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
