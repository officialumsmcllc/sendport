export interface LinkScanResult {
  url: string;
  type: "valid" | "warning" | "error";
  message: string;
}

export interface PreFlightScanReport {
  score: number; // 0 - 100
  totalLinks: number;
  validLinks: number;
  warningsCount: number;
  errorsCount: number;
  findings: LinkScanResult[];
  recommendation: string;
}

export function scanEmailLinks(htmlContent: string): PreFlightScanReport {
  const linkRegex = /href=["']([^"']+)["']/gi;
  const matches = [...htmlContent.matchAll(linkRegex)];

  const findings: LinkScanResult[] = [];
  let validCount = 0;
  let warnCount = 0;
  let errorCount = 0;

  for (const match of matches) {
    const url = match[1].trim();

    // Skip mailto and tel links
    if (url.startsWith("mailto:") || url.startsWith("tel:")) {
      findings.push({
        url,
        type: "valid",
        message: "Valid communication protocol.",
      });
      validCount++;
      continue;
    }

    // Check placeholder links
    if (url === "#" || url === "" || url.toLowerCase().startsWith("javascript:")) {
      findings.push({
        url,
        type: "error",
        message: "Placeholder or empty link detected. Replace before dispatching to users.",
      });
      errorCount++;
      continue;
    }

    // Check for example / test domains
    if (url.includes("example.com") || url.includes("yourdomain.com") || url.includes("localhost")) {
      findings.push({
        url,
        type: "warning",
        message: "Placeholder domain detected (e.g. example.com or localhost).",
      });
      warnCount++;
      continue;
    }

    // Check for insecure HTTP
    if (url.startsWith("http://")) {
      findings.push({
        url,
        type: "warning",
        message: "Insecure HTTP link. Upgrade to HTTPS for better inbox deliverability.",
      });
      warnCount++;
      continue;
    }

    if (url.startsWith("https://")) {
      findings.push({
        url,
        type: "valid",
        message: "Secure HTTPS link.",
      });
      validCount++;
      continue;
    }

    // Relative or invalid link
    findings.push({
      url,
      type: "error",
      message: "Relative or malformed URL without http/https protocol.",
    });
    errorCount++;
  }

  const total = matches.length;
  let score = 100;
  if (total > 0) {
    score = Math.max(0, Math.round(100 - (errorCount * 30 + warnCount * 10)));
  }

  let recommendation = "All links look healthy! Safe to send.";
  if (errorCount > 0) {
    recommendation = `Found ${errorCount} broken/placeholder link(s). Please fix before launching campaign.`;
  } else if (warnCount > 0) {
    recommendation = `Found ${warnCount} warning(s). Recommended to upgrade links to HTTPS.`;
  }

  return {
    score,
    totalLinks: total,
    validLinks: validCount,
    warningsCount: warnCount,
    errorsCount: errorCount,
    findings,
    recommendation,
  };
}
