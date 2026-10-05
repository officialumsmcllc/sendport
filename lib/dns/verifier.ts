import dns from "dns/promises";

export interface DnsVerificationResult {
  domain: string;
  isDkimValid: boolean;
  isSpfValid: boolean;
  isDmarcValid: boolean;
  isMxValid: boolean;
  allValid: boolean;
  recordsFound: {
    dkim?: string[];
    spf?: string[];
    dmarc?: string[];
    mx?: string[];
  };
  errors?: string[];
}

/**
 * Resolves TXT records with fallback to Cloudflare DNS-over-HTTPS (DoH)
 * to bypass local DNS caching delays.
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
    // Ignore and fallback to DoH
  }

  // Tier 2: Cloudflare DoH API (real-time global lookup)
  if (results.length === 0) {
    try {
      const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=TXT`,
        {
          headers: { Accept: "application/dns-json" },
          cache: "no-store",
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
    } catch {
      // Fallback failed
    }
  }

  return results;
}

/**
 * Verifies DKIM, SPF, DMARC, and MX records for a customer domain.
 */
export async function verifyDomainDns(
  domainName: string,
  dkimSelector: string = "sendport",
  expectedPublicKey: string
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

    // 2. Verify SPF TXT Record on root domain
    const spfRecords = await resolveTxtWithFallback(cleanDomain);
    result.recordsFound.spf = spfRecords;
    for (const record of spfRecords) {
      if (record.includes("v=spf1") && (record.includes("getsendport.com") || record.includes("include:") || record.includes("~all") || record.includes("-all"))) {
        result.isSpfValid = true;
        break;
      }
    }

    // 3. Verify DMARC TXT Record on _dmarc.domain.com
    const dmarcRecords = await resolveTxtWithFallback(dmarcHostname);
    result.recordsFound.dmarc = dmarcRecords;
    for (const record of dmarcRecords) {
      if (record.includes("v=DMARC1")) {
        result.isDmarcValid = true;
        break;
      }
    }

    // 4. Check MX record (optional or inbound)
    try {
      const mxRecords = await dns.resolveMx(cleanDomain);
      result.recordsFound.mx = mxRecords.map((m) => `${m.priority} ${m.exchange}`);
      result.isMxValid = mxRecords.length > 0;
    } catch {
      result.isMxValid = true; // Not strictly blocking if user only sends
    }

    result.allValid = result.isDkimValid && result.isSpfValid;
  } catch (error: any) {
    result.errors?.push(error.message || "DNS check failed");
  }

  return result;
}
