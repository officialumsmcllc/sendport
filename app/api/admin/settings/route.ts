// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { logSecurityAudit } from "@/lib/security/audit";
import { getAllSettings, setManySettings } from "@/lib/settings/system-settings";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Superadmin privileges required." }, { status: 403 });
    }

    const dbSettings = await getAllSettings();

    // Sensible defaults merged with environment variables
    const settings = {
      // Cryptomus Web3 Gateway
      cryptomus_merchant_id: dbSettings.cryptomus_merchant_id || process.env.CRYPTOMUS_MERCHANT_ID || "",
      cryptomus_api_key: dbSettings.cryptomus_api_key || process.env.CRYPTOMUS_API_KEY || "",
      cryptomus_is_active: dbSettings.cryptomus_is_active ?? "true",
      cryptomus_currency: dbSettings.cryptomus_currency || "USD",

      // Stripe Gateway
      stripe_secret_key: dbSettings.stripe_secret_key || process.env.STRIPE_SECRET_KEY || "",
      stripe_publishable_key: dbSettings.stripe_publishable_key || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      stripe_is_active: dbSettings.stripe_is_active ?? "false",

      // Platform & SMTP Cluster Rules
      global_rate_limit_per_sec: dbSettings.global_rate_limit_per_sec || "250",
      maintenance_mode: dbSettings.maintenance_mode || "false",
      strict_dkim_enforcement: dbSettings.strict_dkim_enforcement || "true",
      inbound_processing: dbSettings.inbound_processing || "true",
      auto_ip_warmup: dbSettings.auto_ip_warmup || "true",

      ...dbSettings,
    };

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("[ADMIN_SETTINGS_GET_ERR]:", error);
    return NextResponse.json({ error: error.message || "Failed to load settings." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Superadmin privileges required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { settings, category = "GENERAL" } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Invalid payload: 'settings' object required." }, { status: 400 });
    }

    // Save key-value pairs directly to PostgreSQL
    const saved = await setManySettings(settings, category);
    if (!saved) {
      return NextResponse.json({ error: "Failed to persist settings in database." }, { status: 500 });
    }

    logSecurityAudit("ADMIN_SETTINGS_SAVED", session.userId, {
      updatedKeys: Object.keys(settings),
      category,
    });

    const refreshed = await getAllSettings();

    return NextResponse.json({
      success: true,
      message: "All settings saved and synchronized to database successfully!",
      settings: refreshed,
    });
  } catch (error: any) {
    console.error("[ADMIN_SETTINGS_POST_ERR]:", error);
    return NextResponse.json({ error: error.message || "Internal server error." }, { status: 500 });
  }
}

