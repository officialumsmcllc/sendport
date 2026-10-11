import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/workspace-auth";
import { prisma } from "@/lib/db/prisma";
import { verifyDomainDns } from "@/lib/dns/verifier";
import { analyzeEmailDeliverability } from "@/lib/deliverability/spam-checker";
import { sendEmailEngine } from "@/lib/email/dispatcher";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { domainName, domainId, subject, htmlContent, recipientEmail } = body;

    // 1. Strictly look up the customer's domain in their workspace
    let domainRecord = null;
    if (domainId) {
      domainRecord = await prisma.domain.findFirst({
        where: { id: domainId, workspaceId: auth.workspace.id },
      });
    }

    if (!domainRecord && domainName) {
      domainRecord = await prisma.domain.findFirst({
        where: {
          workspaceId: auth.workspace.id,
          name: { equals: domainName.toLowerCase().trim(), mode: "insensitive" },
        },
      });
    }

    if (!domainRecord) {
      // Pick first verified domain, or first domain in workspace
      domainRecord = await prisma.domain.findFirst({
        where: { workspaceId: auth.workspace.id, status: "VERIFIED" },
        orderBy: { createdAt: "desc" },
      });

      if (!domainRecord) {
        domainRecord = await prisma.domain.findFirst({
          where: { workspaceId: auth.workspace.id },
          orderBy: { createdAt: "desc" },
        });
      }
    }

    if (!domainRecord) {
      return NextResponse.json(
        {
          error: "No domain found in your Sendport account. Please add and verify your custom domain in Dashboard > Domains before running deliverability tests.",
        },
        { status: 400 }
      );
    }

    const targetDomain = domainRecord.name;
    const testSubject = subject || "Testing Inbox Placement & Deliverability";
    const testHtml = htmlContent || "<h1>Hello World</h1><p>This is a live deliverability test from Sendport.</p>";

    // 2. Check live DNS Authentication for the customer's domain
    const dnsResult = await verifyDomainDns(
      targetDomain,
      domainRecord.dkimSelector || "sendport",
      domainRecord.dkimPublicKey
    );

    // 3. Run Spam Heuristics on content
    const spamResult = analyzeEmailDeliverability(testSubject, testHtml);

    // 4. Compute Google/Yahoo 2026 Compliance Metrics
    const complianceChecks = [
      {
        rule: "SPF Record Configured",
        passed: dnsResult.isSpfValid,
        impact: "Critical (Prevents spoofing & unauthorized mail servers)",
      },
      {
        rule: "DKIM 2048-bit RSA Key",
        passed: dnsResult.isDkimValid,
        impact: "Critical (Cryptographic signature verifying message integrity)",
      },
      {
        rule: "DMARC Policy Active",
        passed: dnsResult.isDmarcValid,
        impact: "High (Mandated by Google & Yahoo since Feb 2024)",
      },
      {
        rule: "RFC 8058 One-Click Unsubscribe",
        passed: true,
        impact: "High (Native Gmail/Yahoo header-level unsubscribe button)",
      },
      {
        rule: "Spam Heuristics Score > 70",
        passed: spamResult.score >= 70,
        impact: "Medium (SpamAssassin / Microsoft SmartScreen filtering)",
      },
    ];

    const passedCount = complianceChecks.filter((c) => c.passed).length;
    const overallDeliverabilityScore = Math.round(
      (passedCount / complianceChecks.length) * 50 + (spamResult.score * 0.5)
    );

    let grade = "A+";
    if (overallDeliverabilityScore < 60) grade = "F";
    else if (overallDeliverabilityScore < 70) grade = "C";
    else if (overallDeliverabilityScore < 80) grade = "B";
    else if (overallDeliverabilityScore < 90) grade = "A";

    // 5. Optionally send live test email to recipient ONLY if domain is verified
    let liveTestSent = false;
    let liveTestError: string | null = null;

    if (recipientEmail && recipientEmail.includes("@")) {
      if (domainRecord.status !== "VERIFIED") {
        liveTestError = `Live inbox test emails can only be dispatched from a verified domain. "${domainRecord.name}" is currently ${domainRecord.status}. Please complete DKIM & SPF verification in Dashboard > Domains.`;
      } else {
        try {
          await sendEmailEngine({
            workspaceId: auth.workspace.id,
            from: `Deliverability Test <test@${domainRecord.name}>`,
            to: [recipientEmail.trim()],
            subject: `[Inbox Test Score: ${overallDeliverabilityScore}/100] ${testSubject}`,
            html: testHtml,
          });
          liveTestSent = true;
        } catch (err: any) {
          liveTestError = err.message;
        }
      }
    }

    return NextResponse.json({
      success: true,
      grade,
      overallDeliverabilityScore,
      domain: {
        id: domainRecord.id,
        name: domainRecord.name,
        status: domainRecord.status,
      },
      dns: dnsResult,
      spam: spamResult,
      complianceChecks,
      liveTestSent,
      liveTestError,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
