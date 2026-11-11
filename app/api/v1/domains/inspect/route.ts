// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { inspectDomainDnsHealth } from "@/lib/dns/verifier";
import { getAuthContext } from "@/lib/auth/workspace-auth";

/**
 * GET & POST /api/v1/domains/inspect
 * Deep real-time DNS deliverability & conflict diagnostic tool.
 * Queries Cloudflare & Google DoH in real-time, identifies the DNS provider (Hostinger, Cloudflare, etc.),
 * and returns step-by-step remediation instructions for conflicts.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const domainId = searchParams.get("domainId");
    const domainName = searchParams.get("name") || searchParams.get("domain");

    if (!domainId && !domainName) {
      return NextResponse.json({ error: "Parameter 'domainId' or 'domain' is required." }, { status: 400 });
    }

    const userMemberships = await prisma.workspaceMember.findMany({
      where: { userId: auth.user.id },
      select: { workspaceId: true },
    }).catch(() => []);

    const userWorkspaceIds = userMemberships.map((m: any) => m.workspaceId);
    const allWorkspaceIds = Array.from(new Set([auth.workspace.id, ...userWorkspaceIds].filter(Boolean)));

    const domain = await prisma.domain.findFirst({
      where: {
        AND: [
          {
            OR: [
              { workspaceId: { in: allWorkspaceIds } },
              { userId: auth.user.id },
              { user: { email: auth.user.email } },
            ],
          },
          {
            OR: [
              { id: domainId || undefined },
              { name: domainName ? domainName.toLowerCase().trim() : undefined },
            ],
          },
        ],
      },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found in your workspace" }, { status: 404 });
    }

    // Run deep real-time health diagnostic
    const report = await inspectDomainDnsHealth(
      domain.name,
      domain.dkimSelector || "sendport",
      domain.dkimPublicKey
    );

    // Sync DB status
    const isNowVerified = report.healthScore === 100 && !report.hasFatalConflict;
    await prisma.domain.update({
      where: { id: domain.id },
      data: {
        isDkimValid: report.dkim.status === "PASS",
        isSpfValid: report.spf.status === "PASS",
        isDmarcValid: report.dmarc.status === "PASS",
        isMxValid: report.mx.status === "CONFIGURED",
        status: isNowVerified ? "VERIFIED" : report.hasFatalConflict ? "FAILED" : "PENDING",
        verifiedAt: isNowVerified ? (domain.verifiedAt || new Date()) : domain.verifiedAt,
        lastCheckedAt: new Date(),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      domainId: domain.id,
      report,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "DNS inspection failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { domainId, name } = body;

    const userMemberships = await prisma.workspaceMember.findMany({
      where: { userId: auth.user.id },
      select: { workspaceId: true },
    }).catch(() => []);

    const userWorkspaceIds = userMemberships.map((m: any) => m.workspaceId);
    const allWorkspaceIds = Array.from(new Set([auth.workspace.id, ...userWorkspaceIds].filter(Boolean)));

    const domain = await prisma.domain.findFirst({
      where: {
        AND: [
          {
            OR: [
              { workspaceId: { in: allWorkspaceIds } },
              { userId: auth.user.id },
              { user: { email: auth.user.email } },
            ],
          },
          {
            OR: [
              { id: domainId || undefined },
              { name: name ? name.toLowerCase().trim() : undefined },
            ],
          },
        ],
      },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found in your workspace" }, { status: 404 });
    }

    const report = await inspectDomainDnsHealth(
      domain.name,
      domain.dkimSelector || "sendport",
      domain.dkimPublicKey
    );

    const isNowVerified = report.healthScore === 100 && !report.hasFatalConflict;
    await prisma.domain.update({
      where: { id: domain.id },
      data: {
        isDkimValid: report.dkim.status === "PASS",
        isSpfValid: report.spf.status === "PASS",
        isDmarcValid: report.dmarc.status === "PASS",
        isMxValid: report.mx.status === "CONFIGURED",
        status: isNowVerified ? "VERIFIED" : report.hasFatalConflict ? "FAILED" : "PENDING",
        verifiedAt: isNowVerified ? (domain.verifiedAt || new Date()) : domain.verifiedAt,
        lastCheckedAt: new Date(),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      domainId: domain.id,
      report,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "DNS inspection failed" }, { status: 500 });
  }
}

