export interface SpamAnalysisResult {
  score: number; // 0 to 100
  grade: "A+" | "A" | "B" | "C" | "F";
  summary: string;
  dnsScore: number; // Max 50
  contentScore: number; // Max 30
  complianceScore: number; // Max 20
  findings: Array<{
    category: "DNS" | "CONTENT" | "COMPLIANCE";
    type: "pass" | "warn" | "fail";
    title: string;
    description: string;
    impact: number; // points added or deducted
  }>;
  triggersDetected: string[];
}

export const WARMUP_STAGES = [
  { stage: "Stage 1", days: "Days 1 - 3", minDay: 1, maxDay: 3, dailyLimit: 50, ramp: "10%", label: "Initial Seed" },
  { stage: "Stage 2", days: "Days 4 - 7", minDay: 4, maxDay: 7, dailyLimit: 250, ramp: "25%", label: "Early Trust" },
  { stage: "Stage 3", days: "Days 8 - 14", minDay: 8, maxDay: 14, dailyLimit: 1000, ramp: "50%", label: "Scaling Phase" },
  { stage: "Stage 4", days: "Days 15 - 21", minDay: 15, maxDay: 21, dailyLimit: 2500, ramp: "75%", label: "High Volume" },
  { stage: "Stage 5", days: "Days 22 - 30+", minDay: 22, maxDay: 9999, dailyLimit: 5000, ramp: "100%", label: "Fully Warmed" },
];

const SPAM_TRIGGER_PATTERNS = [
  // Financial / Get rich
  /\b100%\s*free\b/i,
  /\bfree\s*money\b/i,
  /\bmake\s*money\s*(fast|online)?\b/i,
  /\bextra\s*cash\b/i,
  /\bearn\s*(\$|\£|\€)?[0-9]+/i,
  /\bguaranteed\s*profit\b/i,
  /\brisk[- ]free\b/i,
  /\bno\s*catch\b/i,
  /\bpassive\s*income\b/i,
  /\bcash\s*prize\b/i,
  /\byou\s*are\s*a\s*winner\b/i,
  /\bmillion\s*dollars\b/i,
  /\bbillion\s*dollars\b/i,
  /\bcrypto\s*giveaway\b/i,

  // Urgency / High pressure
  /\bact\s*now!?\b/i,
  /\burgent\s*action\s*(required)?\b/i,
  /\bcall\s*now!?\b/i,
  /\bapply\s*now!?\b/i,
  /\bexclusive\s*deal\s*expires\b/i,
  /\bdon'?t\s*delete\b/i,
  /\bimmediate\s*response\b/i,
  /\btime\s*sensitive\b/i,
  /\bonce\s*in\s*a\s*lifetime\b/i,
  /\blimited\s*time\s*only\b/i,

  // Deceptive / High spam sensitivity
  /\bthis\s*is\s*not\s*spam\b/i,
  /\bcongratulations!?\b/i,
  /\bclaim\s*your\s*(prize|reward|gift)\b/i,
  /\bclick\s*here\s*now\b/i,
  /\bopen\s*immediately\b/i,
  /\bsecret\s*revealed\b/i,
  /\bconfidential\s*offer\b/i,
  /\bpre[- ]approved\b/i,
  /\bunconditional\b/i,
  /\bno\s*credit\s*check\b/i,
  /\bwinner\s*notification\b/i,
];

/**
 * Analyzes subject and HTML body for spam triggers, formatting, and compliance signals.
 */
export function analyzeEmailContent(subject: string = "", bodyHtml: string = ""): {
  contentScore: number;
  complianceScore: number;
  findings: SpamAnalysisResult["findings"];
  triggersDetected: string[];
} {
  const findings: SpamAnalysisResult["findings"] = [];
  const triggersDetected: string[] = [];

  let contentPoints = 30; // Max 30
  let compliancePoints = 20; // Max 20

  const cleanSubject = subject.trim();
  const rawText = bodyHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  // 1. Subject line checks
  if (!cleanSubject) {
    contentPoints -= 15;
    findings.push({
      category: "CONTENT",
      type: "fail",
      title: "Missing Subject Line",
      description: "Emails without a subject line are immediately flagged as suspicious or spam.",
      impact: -15,
    });
  } else {
    // Check for ALL CAPS in subject (if subject is >= 6 chars)
    const upperCount = (cleanSubject.match(/[A-Z]/g) || []).length;
    const letterCount = (cleanSubject.match(/[A-Za-z]/g) || []).length;

    if (letterCount >= 8 && upperCount / letterCount > 0.65) {
      contentPoints -= 10;
      findings.push({
        category: "CONTENT",
        type: "fail",
        title: "Excessive Capitalization in Subject",
        description: "Subject contains mostly uppercase letters. Spam filters aggressively penalize all-caps subjects.",
        impact: -10,
      });
    } else {
      findings.push({
        category: "CONTENT",
        type: "pass",
        title: "Clean Subject Capitalization",
        description: "Subject line follows standard case formatting.",
        impact: 0,
      });
    }

    // Check excessive punctuation (e.g. !!!, ???, $$$)
    if (/[!?$]{2,}/.test(cleanSubject)) {
      contentPoints -= 5;
      findings.push({
        category: "CONTENT",
        type: "warn",
        title: "Repeated Punctuation in Subject",
        description: "Avoid using multiple consecutive punctuation marks (e.g. '!!!' or '$$$') in subject lines.",
        impact: -5,
      });
    }
  }

  // 2. Scan for spam words in subject and body
  const combinedContent = `${cleanSubject} ${rawText}`;
  for (const pattern of SPAM_TRIGGER_PATTERNS) {
    const match = combinedContent.match(pattern);
    if (match) {
      triggersDetected.push(match[0]);
    }
  }

  if (triggersDetected.length > 0) {
    const penalty = Math.min(20, triggersDetected.length * 5);
    contentPoints -= penalty;
    findings.push({
      category: "CONTENT",
      type: triggersDetected.length > 2 ? "fail" : "warn",
      title: `Spam Trigger Words Detected (${triggersDetected.length})`,
      description: `Detected high-risk trigger phrases: "${triggersDetected.slice(0, 4).join('", "')}"${
        triggersDetected.length > 4 ? ` and ${triggersDetected.length - 4} more` : ""
      }. Consider replacing them with neutral conversational language.`,
      impact: -penalty,
    });
  } else {
    findings.push({
      category: "CONTENT",
      type: "pass",
      title: "No Spam Trigger Words Found",
      description: "Content is free of common commercial high-pressure or misleading spam terms.",
      impact: 0,
    });
  }

  // 3. Link density and formatting
  const linkMatches = bodyHtml.match(/<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["']/gi) || [];
  if (linkMatches.length > 15) {
    contentPoints -= 5;
    findings.push({
      category: "CONTENT",
      type: "warn",
      title: "High Link Density",
      description: `Email contains ${linkMatches.length} links. Too many links degrade inbox placement.`,
      impact: -5,
    });
  } else {
    findings.push({
      category: "CONTENT",
      type: "pass",
      title: "Healthy Link-to-Text Ratio",
      description: `Email contains ${linkMatches.length} links, well within safe deliverability thresholds.`,
      impact: 0,
    });
  }

  // 4. Compliance: Unsubscribe Link
  const hasUnsubscribe =
    /unsubscribe/i.test(combinedContent) ||
    /opt[- ]out/i.test(combinedContent) ||
    /\{\{\s*unsubscribe\s*\}\}/i.test(bodyHtml);

  if (!hasUnsubscribe) {
    compliancePoints -= 12;
    findings.push({
      category: "COMPLIANCE",
      type: "fail",
      title: "Missing One-Click Unsubscribe Mechanism",
      description: "CAN-SPAM and GDPR require an obvious unsubscribe link. Gmail & Yahoo throttle senders without it.",
      impact: -12,
    });
  } else {
    findings.push({
      category: "COMPLIANCE",
      type: "pass",
      title: "Unsubscribe Mechanism Present",
      description: "Email contains opt-out / unsubscribe signals compliant with Google & Yahoo 2024+ sender guidelines.",
      impact: 0,
    });
  }

  // 5. Body length check
  if (rawText.length < 30) {
    compliancePoints -= 8;
    findings.push({
      category: "COMPLIANCE",
      type: "warn",
      title: "Very Short Email Body",
      description: "Extremely short or image-only emails can trigger automated bot spam filters.",
      impact: -8,
    });
  } else {
    findings.push({
      category: "COMPLIANCE",
      type: "pass",
      title: "Sufficient Text Volume",
      description: "Body contains appropriate character count for human-to-human or transactional communication.",
      impact: 0,
    });
  }

  return {
    contentScore: Math.max(0, contentPoints),
    complianceScore: Math.max(0, compliancePoints),
    findings,
    triggersDetected,
  };
}

/**
 * Combines DNS verification with content analysis into a comprehensive Deliverability Score.
 */
export function calculateDeliverabilityScore(
  dnsStatus: { isDkimValid: boolean; isSpfValid: boolean; isDmarcValid: boolean; isMxValid?: boolean },
  contentAnalysis: ReturnType<typeof analyzeEmailContent>
): SpamAnalysisResult {
  const findings = [...contentAnalysis.findings];
  let dnsScore = 0; // Max 50

  // SPF check (15 pts)
  if (dnsStatus.isSpfValid) {
    dnsScore += 15;
    findings.unshift({
      category: "DNS",
      type: "pass",
      title: "SPF Record Configured (+15 pts)",
      description: "SPF authorization validates that Sendport is permitted to send emails for your domain.",
      impact: 15,
    });
  } else {
    findings.unshift({
      category: "DNS",
      type: "fail",
      title: "SPF Record Missing or Invalid (-15 pts)",
      description: "Without SPF, recipient mail servers (Gmail, Outlook) may reject your emails.",
      impact: -15,
    });
  }

  // DKIM check (20 pts)
  if (dnsStatus.isDkimValid) {
    dnsScore += 20;
    findings.unshift({
      category: "DNS",
      type: "pass",
      title: "DKIM 2048-bit Cryptographic Signature (+20 pts)",
      description: "Valid DKIM signature proves your email was not tampered with in transit.",
      impact: 20,
    });
  } else {
    findings.unshift({
      category: "DNS",
      type: "fail",
      title: "DKIM Key Not Found (-20 pts)",
      description: "DKIM record is missing or not propagated yet. Messages will fail cryptographic validation.",
      impact: -20,
    });
  }

  // DMARC check (15 pts)
  if (dnsStatus.isDmarcValid) {
    dnsScore += 15;
    findings.unshift({
      category: "DNS",
      type: "pass",
      title: "DMARC Policy Active (+15 pts)",
      description: "DMARC policy prevents spoofers and phishers from using your domain name.",
      impact: 15,
    });
  } else {
    findings.unshift({
      category: "DNS",
      type: "warn",
      title: "DMARC Record Recommended (-10 pts)",
      description: "Adding a DMARC record (_dmarc.yourdomain.com) ensures 100% compliance with Yahoo and Gmail requirements.",
      impact: -10,
    });
    dnsScore += 5; // Partial credit
  }

  const totalScore = Math.min(100, Math.max(0, dnsScore + contentAnalysis.contentScore + contentAnalysis.complianceScore));

  let grade: SpamAnalysisResult["grade"] = "F";
  let summary = "";

  if (totalScore >= 92) {
    grade = "A+";
    summary = "Exceptional deliverability! Your email is fully optimized for primary inbox placement across Gmail, Outlook, and Apple Mail.";
  } else if (totalScore >= 80) {
    grade = "A";
    summary = "Great deliverability. Passing all critical authentication checks with minimal spam risk.";
  } else if (totalScore >= 65) {
    grade = "B";
    summary = "Acceptable, but has minor warnings. Address the flagged items to avoid landing in Spam or Promotions folders.";
  } else if (totalScore >= 45) {
    grade = "C";
    summary = "High risk of spam placement. Critical DNS records are missing or high-risk content triggers were detected.";
  } else {
    grade = "F";
    summary = "Critical failure! Recipients will likely reject or mark this message as spam. Fix authentication records immediately.";
  }

  return {
    score: totalScore,
    grade,
    summary,
    dnsScore,
    contentScore: contentAnalysis.contentScore,
    complianceScore: contentAnalysis.complianceScore,
    findings,
    triggersDetected: contentAnalysis.triggersDetected,
  };
}
