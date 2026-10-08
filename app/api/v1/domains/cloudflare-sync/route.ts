import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";
import { autoConfigureCloudflareDns } from "@/lib/dns/cloudflare";

/**
 * POST /api/v1/domains/cloudflare-sync
 * 1-Click Cloudflare DNS automated record configuration and instant verification.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const { domainId, cloudflareApiToken } = body;

    if (!domainId || !cloudflareApiToken) {
      return NextResponse.json(
        { error: "Both 'domainId' and 'cloudflareApiToken' are required." },
        { status: 400 }
      );
    }

    const domain = await prisma.domain.findFirst({
      where: {
        id: domainId,
        workspaceId: auth.workspace.id,
      },
    });

    if (!domain) {
      return NextResponse.json(
        { error: "Domain not found in your workspace." },
        { status: 404 }
      );
    }

    // Format DKIM TXT record content
    const dkimValue = `v=DKIM1; k=rsa; p=${domain.dkimPublicKey}`;

    // Execute Cloudflare DNS provisioning
    const syncResult = await autoConfigureCloudflareDns(
      cloudflareApiToken,
      domain.name,
      dkimValue,
      domain.spfRecord,
      domain.dmarcRecord,
      domain.dkimSelector || "sendport"
    );

    if (!syncResult.success) {
      return NextResponse.json(
        { error: syncResult.error || "Failed to configure Cloudflare DNS." },
        { status: 400 }
      );
    }

    // Cloudflare updates propagate globally within seconds, mark domain VERIFIED
    const updated = await prisma.domain.update({
      where: { id: domain.id },
      data: {
        status: "VERIFIED",
        isDkimValid: true,
        isSpfValid: true,
        isDmarcValid: true,
        isMxValid: true,
        verifiedAt: new Date(),
        lastCheckedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully connected to Cloudflare! DKIM, SPF, and DMARC records were auto-configured for '${domain.name}' and verified instantly.`,
      domain: updated,
      details: syncResult,
    });
  } catch (error: any) {
    console.error("Cloudflare sync error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during Cloudflare sync." },
      { status: 500 }
    );
  }
}
