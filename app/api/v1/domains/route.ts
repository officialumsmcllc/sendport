import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateDkimKeyPair } from "@/lib/dns/dkim";
import { getAuthContext } from "@/lib/auth/workspace-auth";

/**
 * GET, POST & DELETE /api/v1/domains
 * Strictly isolated per user workspace.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized. Please log in or provide an API key." }, { status: 401 });
    }

    const domains = await prisma.domain.findMany({
      where: {
        workspaceId: auth.workspace.id,
      },
      orderBy: { createdAt: "desc" },
    });

    const userPlan = (auth.workspace.plan || "STARTER").toUpperCase();
    const limit = userPlan === "STARTER" ? 1 : userPlan === "GROWTH" ? 5 : 99999;

    return NextResponse.json({
      domains,
      plan: userPlan,
      limit,
      count: domains.length,
      canAddMore: domains.length < limit,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized. Please log in or provide an API key." }, { status: 401 });
    }

    // Enforce Plan Domain Limits
    const userPlan = (auth.workspace.plan || "STARTER").toUpperCase();
    const maxDomainsAllowed = userPlan === "STARTER" ? 1 : userPlan === "GROWTH" ? 5 : 99999;

    const existingDomainsCount = await prisma.domain.count({
      where: { workspaceId: auth.workspace.id },
    });

    if (existingDomainsCount >= maxDomainsAllowed) {
      const upgradePlan = userPlan === "STARTER" ? "Growth" : "Scale Pro";
      return NextResponse.json(
        {
          error: `Domain limit reached (${existingDomainsCount}/${maxDomainsAllowed}) for ${userPlan} plan. Upgrade to ${upgradePlan} to connect more sending domains.`,
          code: "DOMAIN_LIMIT_REACHED",
          currentPlan: userPlan,
          limit: maxDomainsAllowed,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'name' parameter (e.g. 'mybrand.com')." },
        { status: 422 }
      );
    }

    const cleanDomain = name.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    // Check if domain already exists in THIS workspace
    const existing = await prisma.domain.findFirst({
      where: {
        workspaceId: auth.workspace.id,
        name: cleanDomain,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Domain '${cleanDomain}' already exists in your workspace.` },
        { status: 409 }
      );
    }

    // Generate 2048-bit RSA DKIM Keypair
    const selector = "sendport";
    const { publicKey, privateKey, dnsRecordValue } = generateDkimKeyPair(selector);

    const domain = await prisma.domain.create({
      data: {
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
        name: cleanDomain,
        status: "PENDING",
        dkimSelector: selector,
        dkimPrivateKey: privateKey,
        dkimPublicKey: publicKey,
        spfRecord: "v=spf1 include:mail.getsendport.com ~all",
        dmarcRecord: "v=DMARC1; p=none; rua=mailto:dmarc@getsendport.com",
        mxRecord: "inbound.getsendport.com",
      },
    });

    return NextResponse.json({
      id: domain.id,
      name: domain.name,
      status: domain.status,
      records: [
        {
          type: "TXT",
          name: `${selector}._domainkey.${cleanDomain}`,
          value: dnsRecordValue,
          status: "pending",
          priority: "DKIM (2048-bit RSA) - Mandatory",
        },
        {
          type: "TXT",
          name: cleanDomain,
          value: domain.spfRecord,
          status: "pending",
          priority: "SPF - Mandatory",
        },
        {
          type: "TXT",
          name: `_dmarc.${cleanDomain}`,
          value: domain.dmarcRecord,
          status: "pending",
          priority: "DMARC - Recommended",
        },
        {
          type: "MX",
          name: cleanDomain,
          value: domain.mxRecord,
          priority: "Inbound Routing (Priority 10)",
          status: "optional",
        },
      ],
      created_at: domain.createdAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing domain ID parameter." }, { status: 400 });
    }

    const existing = await prisma.domain.findFirst({
      where: {
        id,
        workspaceId: auth.workspace.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Domain not found in your workspace." }, { status: 404 });
    }

    await prisma.domain.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({
      success: true,
      message: `Domain '${existing.name}' was successfully removed from your workspace.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
