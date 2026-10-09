import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";
import { verifyDomainDns } from "@/lib/dns/verifier";
import { analyzeEmailContent, calculateDeliverabilityScore } from "@/lib/email/spam-analyzer";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { domainId, subject, bodyHtml } = body;

    // Verify domain belongs to this user's workspace
    let domainRecord = null;
    if (domainId) {
      domainRecord = await prisma.domain.findFirst({
        where: {
          id: domainId,
          workspaceId: auth.workspace.id,
        },
      });
    }

    if (!domainRecord) {
      // Pick the first available verified or registered domain in the workspace
      domainRecord = await prisma.domain.findFirst({
        where: { workspaceId: auth.workspace.id },
        orderBy: { createdAt: "desc" },
      });
    }

    let dnsStatus = {
      isDkimValid: false,
      isSpfValid: false,
      isDmarcValid: false,
      isMxValid: false,
      domain: domainRecord?.name || "unknown",
    };

    if (domainRecord) {
      // Perform live DNS lookup
      const dnsResult = await verifyDomainDns(
        domainRecord.name,
        domainRecord.dkimSelector || "sendport",
        domainRecord.dkimPublicKey
      );

      dnsStatus = {
        isDkimValid: dnsResult.isDkimValid,
        isSpfValid: dnsResult.isSpfValid,
        isDmarcValid: dnsResult.isDmarcValid,
        isMxValid: dnsResult.isMxValid,
        domain: domainRecord.name,
      };

      // Sync status into DB cache if changed
      if (
        domainRecord.isDkimValid !== dnsResult.isDkimValid ||
        domainRecord.isSpfValid !== dnsResult.isSpfValid ||
        domainRecord.isDmarcValid !== dnsResult.isDmarcValid
      ) {
        prisma.domain
          .update({
            where: { id: domainRecord.id },
            data: {
              isDkimValid: dnsResult.isDkimValid,
              isSpfValid: dnsResult.isSpfValid,
              isDmarcValid: dnsResult.isDmarcValid,
              isMxValid: dnsResult.isMxValid,
              lastCheckedAt: new Date(),
            },
          })
          .catch(() => {});
      }
    }

    // Run deep content analysis
    const contentAnalysis = analyzeEmailContent(subject || "", bodyHtml || "");

    // Calculate composite deliverability score (0-100)
    const report = calculateDeliverabilityScore(dnsStatus, contentAnalysis);

    return NextResponse.json({
      success: true,
      domain: domainRecord?.name || null,
      domainStatus: domainRecord?.status || "NONE",
      dnsStatus,
      report,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
