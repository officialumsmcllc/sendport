// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import dns from "dns/promises";

export interface DnsVerificationResult {
  domain: string;
  isDkimValid: boolean;
  isSpfValid: boolean;
  isDmarcValid: boolean;
  isMxValid: boolean;
  allValid: boolean;
  multipleSpfDetected?: boolean;
  spfWarning?: string;
  suggestedMergedSpf?: string;
  multipleDmarcDetected?: boolean;
  dmarcWarning?: string;
  suggestedMergedDmarc?: string;
  recordsFound: {
    dkim?: string[];
    spf?: string[];
    dmarc?: string[];
    mx?: string[];
  };
  errors?: string[];
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

    // 4. Check MX record (optional or inbound)
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
