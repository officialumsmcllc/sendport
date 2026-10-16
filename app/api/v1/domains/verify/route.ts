import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyDomainDns } from "@/lib/dns/verifier";
import { getAuthContext } from "@/lib/auth/workspace-auth";

/**
 * POST /api/v1/domains/verify
 * Body: { domainId: string } or { name: string }
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
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
            OR: [{ id: domainId || undefined }, { name: name || undefined }],
          },
        ],
      },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found in your workspace" }, { status: 404 });
    }

    // Run real DNS resolution check
    const dnsResult = await verifyDomainDns(
      domain.name,
      domain.dkimSelector || "sendport",
      domain.dkimPublicKey
    );

    // Update status in DB strictly based on valid DNS records
    const isNowVerified = Boolean(dnsResult.allValid);
    const updated = await prisma.domain.update({
      where: { id: domain.id },
      data: {
        isDkimValid: dnsResult.isDkimValid,
        isSpfValid: dnsResult.isSpfValid,
        isDmarcValid: dnsResult.isDmarcValid,
        isMxValid: dnsResult.isMxValid,
        status: isNowVerified ? "VERIFIED" : "PENDING",
        verifiedAt: isNowVerified ? new Date() : domain.verifiedAt,
        lastCheckedAt: new Date(),
      },
    });

    return NextResponse.json({
      domain: updated.name,
      status: updated.status,
      isDkimValid: dnsResult.isDkimValid,
      isSpfValid: dnsResult.isSpfValid,
      isDmarcValid: dnsResult.isDmarcValid,
      isMxValid: dnsResult.isMxValid,
      recordsFound: dnsResult.recordsFound,
      message: isNowVerified
        ? "Domain DNS verified successfully! You can now send emails from this domain."
        : "DNS records are still propagating or missing. Please ensure you have added the TXT records to your DNS provider (Cloudflare, Namecheap, GoDaddy).",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
