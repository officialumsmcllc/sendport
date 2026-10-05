import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateDkimKeyPair } from "@/lib/dns/dkim";

/**
 * GET & POST /api/v1/domains
 */
export async function GET(req: NextRequest) {
  try {
    let workspace = await prisma.workspace.findFirst({
      include: {
        domains: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "Default Workspace", slug: "default" },
        include: { domains: true },
      });
    }

    return NextResponse.json({ domains: workspace.domains });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'name' parameter (e.g. 'mybrand.com')." },
        { status: 422 }
      );
    }

    const cleanDomain = name.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: "Default Workspace", slug: "default" },
      });
    }

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: "admin@getsendport.com", name: "Muhammad Umar", role: "ADMIN" },
      });
    }

    // Check if domain already exists
    const existing = await prisma.domain.findFirst({
      where: {
        workspaceId: workspace.id,
        name: cleanDomain,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Domain '${cleanDomain}' already exists in this workspace.` },
        { status: 409 }
      );
    }

    // Generate 2048-bit RSA DKIM Keypair
    const selector = "sendport";
    const { publicKey, privateKey, dnsRecordValue } = generateDkimKeyPair(selector);

    const domain = await prisma.domain.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
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
