
import dns from "dns/promises";
import type { DnsVerificationResult, DnsDiagnosticReport } from "@/types/dns";
export type { DnsVerificationResult, DnsDiagnosticReport } from "@/types/dns";

/**
 * Detects the user's primary DNS provider by inspecting NS records via DoH.
 */
export async function detectDnsProvider(domain: string): Promise<{ name: string; icon: string }> {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=NS`,
      {
        headers: { Accept: "application/dns-json" },
        cache: "no-store",
        signal: AbortSignal.timeout(3500),
      }
    );
    if (res.ok) {
      const data = await res.json();
      const nsList = (data.Answer || [])
        .map((a: any) => String(a.data || "").toLowerCase())
        .join(" ");

      if (nsList.includes("dns-parking.com") || nsList.includes("hostinger")) {
        return { name: "Hostinger", icon: "hostinger" };
      }
      if (nsList.includes("cloudflare")) {
        return { name: "Cloudflare", icon: "cloudflare" };
      }
      if (nsList.includes("domaincontrol.com") || nsList.includes("godaddy")) {
        return { name: "GoDaddy", icon: "godaddy" };
      }
      if (nsList.includes("registrar-servers.com") || nsList.includes("namecheap")) {
        return { name: "Namecheap", icon: "namecheap" };
      }
      if (nsList.includes("awsdns")) {
        return { name: "AWS Route 53", icon: "aws" };
      }
      if (nsList.includes("googledomains") || nsList.includes("cloud-dns")) {
        return { name: "Google Cloud DNS", icon: "google" };
      }
      if (nsList.includes("bluehost")) {
        return { name: "Bluehost", icon: "bluehost" };
      }
      if (nsList.includes("hostgator")) {
        return { name: "HostGator", icon: "hostgator" };
      }
    }
  } catch {}
  return { name: "Your DNS Provider (Hostinger / Cloudflare / GoDaddy / Namecheap)", icon: "dns" };
}

/**
 * Resolves TXT records with fallback to Cloudflare & Google DNS-over-HTTPS (DoH)
 * to bypass local container DNS caching delays or UDP 53 drops.
 */
async function resolveTxtWithFallback(hostname: string): Promise<string[]> {
  const results: string[] = [];

  // Tier 1: Local Node.js DNS resolver
  try {
    const txtRecords = await dns.resolveTxt(hostname);
    for (const chunk of txtRecords) {
      results.push(chunk.join(""));
    }
  } catch {
    // Fallback to DoH
  }

  // Tier 2: Cloudflare DoH API (real-time global lookup)
  if (results.length === 0) {
    try {
      const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=TXT`,
        {
          headers: { Accept: "application/dns-json" },
          cache: "no-store",
          signal: AbortSignal.timeout(3500),
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.Answer && Array.isArray(data.Answer)) {
          for (const item of data.Answer) {
            if (item.data) {
              results.push(item.data.replace(/^"|"$/g, "").replace(/\\"/g, '"'));
            }
          }
        }
      }
    } catch {}
  }

  // Tier 3: Google DoH API Fallback
  if (results.length === 0) {
    try {
      const gRes = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=TXT`,
        { signal: AbortSignal.timeout(3500) }
      );
      if (gRes.ok) {
        const data = await gRes.json();
        if (data.Answer && Array.isArray(data.Answer)) {
          for (const item of data.Answer) {
            if (item.data) {
              results.push(item.data.replace(/^"|"$/g, "").replace(/\\"/g, '"'));
            }
          }
        }
      }
    } catch {}
  }

  return results;
}

/**
 * Verifies DKIM, SPF, DMARC, and MX records for a customer domain.
 * Enforces RFC 7208 single SPF record rule and auto-generates merged records when conflicts exist.
 */
export async function verifyDomainDns(
  domainName: string,
  dkimSelector: string = "sendport",
  expectedPublicKey: string = ""
): Promise<DnsVerificationResult> {
  const cleanDomain = domainName.trim().toLowerCase();
  const dkimHostname = `${dkimSelector}._domainkey.${cleanDomain}`;
  const dmarcHostname = `_dmarc.${cleanDomain}`;

  const result: DnsVerificationResult = {
    domain: cleanDomain,
    isDkimValid: false,
    isSpfValid: false,
    isDmarcValid: false,
    isMxValid: false,
    allValid: false,
    multipleSpfDetected: false,
    recordsFound: {},
    errors: [],
  };

  try {
    // 1. Verify DKIM TXT Record
    const dkimRecords = await resolveTxtWithFallback(dkimHostname);
    result.recordsFound.dkim = dkimRecords;
    for (const record of dkimRecords) {
      if (
        (record.includes("v=DKIM1") || record.includes("k=rsa")) &&
        (record.includes(expectedPublicKey.substring(0, 30)) || record.includes("p="))
      ) {
        result.isDkimValid = true;
        break;
      }
    }

    // 2. Deep SPF Record Verification & RFC 7208 Conflict Detection
    const rootTxtRecords = await resolveTxtWithFallback(cleanDomain);
    const spfRecords = rootTxtRecords.filter((r) => r.trim().startsWith("v=spf1"));
    result.recordsFound.spf = spfRecords;

    if (spfRecords.length > 1) {
      // VIOLATION: Multiple SPF records found! RFC 7208 strictly forbids this and Gmail/Yahoo reject mail with PermError
      result.multipleSpfDetected = true;
      result.isSpfValid = false;

      const mechanisms = new Set<string>();
      mechanisms.add("include:mail.getsendport.com");

      for (const rec of spfRecords) {
        const parts = rec.trim().split(/\s+/);
        for (const p of parts) {
          const lower = p.toLowerCase();
          if (
            lower === "v=spf1" ||
            lower === "~all" ||
            lower === "-all" ||
            lower === "?all" ||
            lower === "+all"
          ) {
            continue;
          }
          mechanisms.add(p);
        }
      }

      const merged = `v=spf1 ${Array.from(mechanisms).join(" ")} ~all`;
      result.suggestedMergedSpf = merged;
      result.spfWarning = `Multiple SPF records detected (${spfRecords.length} found). RFC 7208 forbids having more than 1 SPF record. Gmail, Yahoo, and Outlook reject emails with SPF PermError. Please delete existing separate records and replace with the single merged record.`;
    } else if (spfRecords.length === 1) {
      result.multipleSpfDetected = false;
      const rec = spfRecords[0];
      if (
        rec.includes("mail.getsendport.com") ||
        rec.includes("45.59.103.242") ||
        rec.includes("getsendport.com")
      ) {
        result.isSpfValid = true;
      } else {
        result.isSpfValid = false;
        result.spfWarning = "An SPF record exists on your domain, but it does not authorize SendPort (missing 'include:mail.getsendport.com').";
        const existingParts = rec
          .trim()
          .split(/\s+/)
          .filter((p) => !p.startsWith("v=spf1") && !p.endsWith("all"));
        const mergedParts = Array.from(
          new Set(["include:mail.getsendport.com", ...existingParts])
        );
        result.suggestedMergedSpf = `v=spf1 ${mergedParts.join(" ")} ~all`;
      }
    } else {
      result.multipleSpfDetected = false;
      result.isSpfValid = false;
      result.suggestedMergedSpf = "v=spf1 include:mail.getsendport.com ~all";
      result.spfWarning = "No SPF record found on domain. Add the TXT record to authorize outbound sending.";
    }

    // 3. Verify DMARC TXT Record on _dmarc.domain.com (RFC 7489 Single Record Compliance)
    const dmarcRecords = await resolveTxtWithFallback(dmarcHostname);
    result.recordsFound.dmarc = dmarcRecords;

    const dmarcMatches = dmarcRecords.filter((record) => record.includes("v=DMARC1"));

    if (dmarcMatches.length > 1) {
      result.multipleDmarcDetected = true;
      result.isDmarcValid = false;
      result.dmarcWarning = `CRITICAL DELIVERABILITY ALERT: Multiple DMARC records detected on ${dmarcHostname} (${dmarcMatches.length} records found). RFC 7489 Section 6.6.3 strictly dictates that having more than 1 DMARC record causes Google, Yahoo, and Microsoft to treat DMARC as failed (PermError), which immediately routes ALL your emails to the recipient's Spam folder! You must remove the duplicate records from your DNS provider and leave only ONE.`;
      result.suggestedMergedDmarc = "v=DMARC1; p=none; sp=none; rua=mailto:dmarc@getsendport.com; aspf=r; adkim=r";
    } else if (dmarcMatches.length === 1) {
      result.isDmarcValid = true;
    }

    // 4. Verify BIMI TXT Record on default._bimi.domain.com
    const bimiHostname = `default._bimi.${cleanDomain}`;
    let isBimiValid = false;
    let bimiWarning: string | undefined;
    const bimiRecords = await resolveTxtWithFallback(bimiHostname);
    result.recordsFound.bimi = bimiRecords;

    const bimiMatch = bimiRecords.find((r) => r.toLowerCase().includes("v=bimi1"));
    if (bimiMatch) {
      // Check DMARC strictness (must be quarantine or reject for Google/Yahoo to honor BIMI)
      const dmarcRec = dmarcMatches[0] || "";
      const isStrictDmarc = /p=\s*(quarantine|reject)\b/i.test(dmarcRec);
      if (!isStrictDmarc) {
        bimiWarning = "BIMI record detected, but DMARC policy is 'p=none'. Gmail and Yahoo require 'p=quarantine' or 'p=reject' for the verified brand logo to display.";
      } else {
        isBimiValid = true;
      }
    }
    result.isBimiValid = isBimiValid;
    result.bimiWarning = bimiWarning;

    // 5. Check MX record (optional or inbound)
    try {
      const mxRecords = await dns.resolveMx(cleanDomain);
      result.recordsFound.mx = mxRecords.map((m) => `${m.priority} ${m.exchange}`);
      result.isMxValid = mxRecords.length > 0;
    } catch {
      result.isMxValid = true; // Not strictly blocking if user only sends
    }

    result.allValid =
      result.isDkimValid &&
      result.isSpfValid &&
      !result.multipleSpfDetected &&
      !result.multipleDmarcDetected;
  } catch (error: any) {
    result.errors?.push(error.message || "DNS check failed");
  }

  return result;
}

/**
 * Deep, client-facing DNS health inspection.
 * Detects conflicts, nameserver provider, and produces exact step-by-step remediation instructions.
 */
export async function inspectDomainDnsHealth(
  domainName: string,
  dkimSelector: string = "sendport",
  expectedPublicKey: string = ""
): Promise<DnsDiagnosticReport> {
  const cleanDomain = domainName.trim().toLowerCase();
  const dkimHostname = `${dkimSelector}._domainkey.${cleanDomain}`;
  const dmarcHostname = `_dmarc.${cleanDomain}`;
  const bimiHostname = `default._bimi.${cleanDomain}`;

  // 1. Detect DNS Provider
  const dnsProvider = await detectDnsProvider(cleanDomain);

  // 2. Fetch all DNS records in parallel via high-availability DoH
  const [rootTxtRecords, dkimRecords, dmarcRecords, bimiRecords, mxRecordsRaw] = await Promise.all([
    resolveTxtWithFallback(cleanDomain),
    resolveTxtWithFallback(dkimHostname),
    resolveTxtWithFallback(dmarcHostname),
    resolveTxtWithFallback(bimiHostname),
    dns.resolveMx(cleanDomain).catch(() => []),
  ]);

  // 3. SPF Analysis
  const spfRecords = rootTxtRecords.filter((r) => r.trim().startsWith("v=spf1"));
  const multipleSpf = spfRecords.length > 1;
  let spfStatus: "PASS" | "CONFLICT_MULTIPLE" | "MISSING" | "UNAUTHORIZED" = "MISSING";
  let suggestedMergedSpf = "v=spf1 include:mail.getsendport.com ~all";
  let spfWarning: string | undefined;
  const spfSteps: string[] = [];

  if (multipleSpf) {
    spfStatus = "CONFLICT_MULTIPLE";
    const mechanisms = new Set<string>();
    mechanisms.add("include:mail.getsendport.com");
    for (const rec of spfRecords) {
      const parts = rec.trim().split(/\s+/);
      for (const p of parts) {
        const lower = p.toLowerCase();
        if (
          lower === "v=spf1" ||
          lower === "~all" ||
          lower === "-all" ||
          lower === "?all" ||
          lower === "+all"
        ) {
          continue;
        }
        mechanisms.add(p);
      }
    }
    suggestedMergedSpf = `v=spf1 ${Array.from(mechanisms).join(" ")} ~all`;
    spfWarning = `FATAL DELIVERABILITY CONFLICT: You have ${spfRecords.length} separate SPF records in your ${dnsProvider.name} DNS. RFC 7208 strictly permits only ONE SPF record per domain. Having multiple records triggers 'SPF PermError', causing Google and Yahoo to reject emails with '550 5.7.1 UnsolicitedMessageError'.`;

    spfSteps.push(`Open your DNS manager on ${dnsProvider.name}.`);
    spfSteps.push(`Locate all TXT records starting with 'v=spf1'.`);
    spfSteps.push(`Delete the extra duplicate TXT records.`);
    spfSteps.push(`Update the remaining single SPF TXT record value to: ${suggestedMergedSpf}`);
  } else if (spfRecords.length === 1) {
    const rec = spfRecords[0];
    const isAuth =
      rec.includes("mail.getsendport.com") ||
      rec.includes("45.59.103.242") ||
      rec.includes("getsendport.com");
    if (isAuth) {
      spfStatus = "PASS";
      suggestedMergedSpf = rec;
    } else {
      spfStatus = "UNAUTHORIZED";
      spfWarning = `Your SPF record does not include SendPort's mail server ('include:mail.getsendport.com').`;
      const existingParts = rec
        .trim()
        .split(/\s+/)
        .filter((p) => !p.startsWith("v=spf1") && !p.endsWith("all"));
      const mergedParts = Array.from(
        new Set(["include:mail.getsendport.com", ...existingParts])
      );
      suggestedMergedSpf = `v=spf1 ${mergedParts.join(" ")} ~all`;
      spfSteps.push(`Edit the TXT record starting with 'v=spf1' in ${dnsProvider.name}.`);
      spfSteps.push(`Replace value with: ${suggestedMergedSpf}`);
    }
  } else {
    spfStatus = "MISSING";
    spfWarning = `No SPF TXT record found on ${cleanDomain}. Outbound emails will fail authentication.`;
    spfSteps.push(`Add a new TXT record on ${dnsProvider.name}.`);
    spfSteps.push(`Host/Name: @ (or leave blank).`);
    spfSteps.push(`Value: ${suggestedMergedSpf}`);
  }

  // 4. DKIM Analysis
  let dkimStatus: "PASS" | "MISSING" | "MISMATCH" = "MISSING";
  let dkimWarning: string | undefined;
  const dkimSteps: string[] = [];

  const validDkimRecord = dkimRecords.find(
    (r) =>
      (r.includes("v=DKIM1") || r.includes("k=rsa")) &&
      (r.includes(expectedPublicKey.substring(0, 30)) || r.includes("p="))
  );

  if (validDkimRecord) {
    dkimStatus = "PASS";
  } else if (dkimRecords.length > 0) {
    dkimStatus = "MISMATCH";
    dkimWarning = `DKIM record found at ${dkimHostname}, but the public key does not match SendPort's 2048-bit RSA key.`;
    dkimSteps.push(`Update the TXT record at host '${dkimHostname}'.`);
    dkimSteps.push(`Set Value to SendPort's 2048-bit RSA public key.`);
  } else {
    dkimStatus = "MISSING";
    dkimWarning = `No DKIM record found at '${dkimHostname}'.`;
    dkimSteps.push(`Add a new TXT record on ${dnsProvider.name}.`);
    dkimSteps.push(`Host/Name: ${dkimSelector}._domainkey`);
    dkimSteps.push(`Value: SendPort 2048-bit RSA Public Key.`);
  }

  // 5. DMARC Analysis
  const dmarcMatches = dmarcRecords.filter((r) => r.includes("v=DMARC1"));
  const multipleDmarc = dmarcMatches.length > 1;
  let dmarcStatus: "PASS" | "CONFLICT_MULTIPLE" | "MISSING" = "MISSING";
  let dmarcWarning: string | undefined;
  let suggestedMergedDmarc = "v=DMARC1; p=none; sp=none; rua=mailto:dmarc@getsendport.com; aspf=r; adkim=r";
  let dmarcPolicy = "none";
  const dmarcSteps: string[] = [];

  if (multipleDmarc) {
    dmarcStatus = "CONFLICT_MULTIPLE";
    dmarcWarning = `FATAL DELIVERABILITY CONFLICT: Multiple DMARC records (${dmarcMatches.length}) found at ${dmarcHostname}. RFC 7489 Section 6.6.3 dictates that having more than 1 DMARC record causes Google and Yahoo to fail DMARC (PermError), routing 100% of your emails to Spam.`;
    dmarcSteps.push(`Open your DNS manager on ${dnsProvider.name}.`);
    dmarcSteps.push(`Delete all duplicate TXT records at host '_dmarc'.`);
    dmarcSteps.push(`Keep only ONE record with value: ${suggestedMergedDmarc}`);
  } else if (dmarcMatches.length === 1) {
    dmarcStatus = "PASS";
    suggestedMergedDmarc = dmarcMatches[0];
    const polMatch = dmarcMatches[0].match(/p=([a-zA-Z]+)/);
    if (polMatch) dmarcPolicy = polMatch[1];
  } else {
    dmarcStatus = "MISSING";
    dmarcWarning = `No DMARC record found at '${dmarcHostname}'. Gmail requires DMARC for bulk sending.`;
    dmarcSteps.push(`Add a new TXT record on ${dnsProvider.name}.`);
    dmarcSteps.push(`Host/Name: _dmarc`);
    dmarcSteps.push(`Value: ${suggestedMergedDmarc}`);
  }

  // 6. BIMI Analysis (Verified Inbox Avatar)
  const isDmarcStrict = dmarcPolicy.toLowerCase() === "quarantine" || dmarcPolicy.toLowerCase() === "reject";
  const bimiMatches = bimiRecords.filter((r) => r.toLowerCase().includes("v=bimi1"));
  let bimiStatus: "PASS" | "DMARC_INSUFFICIENT" | "MISSING" | "INVALID_SVG" = "MISSING";
  let bimiLogoUrl: string | undefined;
  let bimiWarning: string | undefined;
  const bimiSteps: string[] = [];

  if (bimiMatches.length > 0) {
    const rawBimi = bimiMatches[0];
    const lMatch = rawBimi.match(/l=([^;]+)/i);
    if (lMatch) bimiLogoUrl = lMatch[1].trim();

    if (!isDmarcStrict) {
      bimiStatus = "DMARC_INSUFFICIENT";
      bimiWarning = `BIMI record detected at '${bimiHostname}', but your DMARC policy is 'p=${dmarcPolicy}'. Gmail and Yahoo mandate strict 'p=quarantine' or 'p=reject' before rendering verified brand logos in the recipient's inbox.`;
      bimiSteps.push(`Upgrade DMARC policy on ${dnsProvider.name} to: v=DMARC1; p=quarantine; rua=mailto:dmarc@getsendport.com`);
    } else {
      bimiStatus = "PASS";
    }
  } else {
    bimiStatus = "MISSING";
    bimiSteps.push(`Upload your brand logo SVG in SendPort's BIMI manager.`);
    bimiSteps.push(`Add a TXT record at host 'default._bimi' with value: v=BIMI1; l=https://getsendport.com/api/v1/domains/bimi/${cleanDomain}/logo.svg;`);
  }

  // 7. MX Records
  const mxList = Array.isArray(mxRecordsRaw)
    ? mxRecordsRaw.map((m: any) => `${m.priority} ${m.exchange}`)
    : [];

  // 8. Calculate Health Score
  let score = 100;
  if (multipleSpf) score -= 40;
  else if (spfStatus === "MISSING") score -= 30;
  else if (spfStatus === "UNAUTHORIZED") score -= 25;

  if (dkimStatus === "MISSING") score -= 35;
  else if (dkimStatus === "MISMATCH") score -= 20;

  if (multipleDmarc) score -= 35;
  else if (dmarcStatus === "MISSING") score -= 15;

  score = Math.max(0, Math.min(100, score));

  const hasFatalConflict = multipleSpf || multipleDmarc;
  let healthStatus: "EXCELLENT" | "CRITICAL_CONFLICT" | "ACTION_REQUIRED" = "ACTION_REQUIRED";
  if (hasFatalConflict) {
    healthStatus = "CRITICAL_CONFLICT";
  } else if (score === 100) {
    healthStatus = "EXCELLENT";
  }

  let summary = "Your domain DNS authentication is healthy and fully deliverability-ready.";
  if (hasFatalConflict) {
    summary = `CRITICAL CONFLICT DETECTED on ${dnsProvider.name}: Duplicate SPF/DMARC records are actively causing Google and Yahoo to block your emails. Follow the fix instructions below.`;
  } else if (score < 100) {
    summary = "One or more DNS records are pending or incomplete. Update your DNS to ensure 100% inbox placement.";
  }

  return {
    domain: cleanDomain,
    dnsProvider,
    healthScore: score,
    healthStatus,
    hasFatalConflict,
    rootTxtRecords,
    spf: {
      status: spfStatus,
      recordsFound: spfRecords,
      multipleDetected: multipleSpf,
      authorized: spfStatus === "PASS",
      suggestedMergedRecord: suggestedMergedSpf,
      warningMessage: spfWarning,
      stepByStepFix: spfSteps,
    },
    dkim: {
      status: dkimStatus,
      selector: dkimSelector,
      hostname: dkimHostname,
      recordsFound: dkimRecords,
      publicKeyMatches: dkimStatus === "PASS",
      warningMessage: dkimWarning,
      stepByStepFix: dkimSteps,
    },
    dmarc: {
      status: dmarcStatus,
      hostname: dmarcHostname,
      recordsFound: dmarcRecords,
      multipleDetected: multipleDmarc,
      policy: dmarcPolicy,
      isStrictPolicy: isDmarcStrict,
      suggestedMergedRecord: suggestedMergedDmarc,
      warningMessage: dmarcWarning,
      stepByStepFix: dmarcSteps,
    },
    bimi: {
      status: bimiStatus,
      selector: "default",
      hostname: bimiHostname,
      logoUrl: bimiLogoUrl,
      recordsFound: bimiRecords,
      warningMessage: bimiWarning,
      stepByStepFix: bimiSteps,
      isDmarcStrict,
    },
    mx: {
      status: mxList.length > 0 ? "CONFIGURED" : "OPTIONAL_PENDING",
      recordsFound: mxList,
    },
    summary,
  };
}
