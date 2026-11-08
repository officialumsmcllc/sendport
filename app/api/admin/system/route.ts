import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { logSecurityAudit } from "@/lib/security/audit";
import { getSetting, setManySettings } from "@/lib/settings/system-settings";

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
    if (!session || !isSuperAdminUser(session.email, session.role)) {
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

    const dbRateLimit = await getSetting("global_rate_limit_per_sec", String(systemConfig.globalRateLimitPerSec));
    const dbMaintenance = await getSetting("maintenance_mode", String(systemConfig.maintenanceMode));
    const dbStrictDkim = await getSetting("strict_dkim_enforcement", String(systemConfig.strictDkimEnforcement));
    const dbInbound = await getSetting("inbound_processing", String(systemConfig.inboundProcessing));

    const activeConfig = {
      ...systemConfig,
      globalRateLimitPerSec: Number(dbRateLimit) || 250,
      maintenanceMode: dbMaintenance === "true",
      strictDkimEnforcement: dbStrictDkim !== "false",
      inboundProcessing: dbInbound !== "false",
    };

    return NextResponse.json({
      success: true,
      config: activeConfig,
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
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    systemConfig = {
      ...systemConfig,
      ...body,
    };

    // Auto-save to PostgreSQL database
    await setManySettings({
      global_rate_limit_per_sec: String(body.globalRateLimitPerSec || 250),
      maintenance_mode: String(body.maintenanceMode || false),
      strict_dkim_enforcement: String(body.strictDkimEnforcement ?? true),
      inbound_processing: String(body.inboundProcessing ?? true),
    }, "SYSTEM");

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
