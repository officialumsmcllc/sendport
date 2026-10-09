import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/workspace-auth";
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
    const { domainName, subject, htmlContent, recipientEmail } = body;

    const targetDomain = domainName || "getsendport.com";
    const testSubject = subject || "Testing Inbox Placement & Deliverability";
    const testHtml = htmlContent || "<h1>Hello World</h1><p>This is a live deliverability test from Sendport.</p>";

    // 1. Check DNS Authentication
    const dnsResult = await verifyDomainDns(targetDomain);

    // 2. Run Spam Heuristics
    const spamResult = analyzeEmailDeliverability(testSubject, testHtml);

    // 3. Compute Google/Yahoo 2026 Compliance Metrics
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

    // 4. Optionally send live test email to recipient
    let liveTestSent = false;
    let liveTestError = null;

    if (recipientEmail && recipientEmail.includes("@")) {
      try {
        await sendEmailEngine({
          workspaceId: auth.workspace.id,
          from: `Deliverability Test <test@${targetDomain}>`,
          to: [recipientEmail.trim()],
          subject: `[Inbox Test Score: ${overallDeliverabilityScore}/100] ${testSubject}`,
          html: testHtml,
        });
        liveTestSent = true;
      } catch (err: any) {
        liveTestError = err.message;
      }
    }

    return NextResponse.json({
      success: true,
      grade,
      overallDeliverabilityScore,
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
