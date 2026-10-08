/**
 * Cloudflare DNS Automated Provisioning Integration
 * Automatically provisions DKIM, SPF, DMARC, and MX records via Cloudflare v4 API.
 */

export interface CloudflareSyncResult {
  success: boolean;
  zoneId?: string;
  zoneName?: string;
  recordsAdded: string[];
  recordsUpdated: string[];
  error?: string;
}

export async function autoConfigureCloudflareDns(
  apiToken: string,
  domainName: string,
  dkimRecordValue: string,
  spfRecordValue: string,
  dmarcRecordValue: string,
  dkimSelector: string = "sendport"
): Promise<CloudflareSyncResult> {
  const cleanDomain = domainName.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const token = apiToken.trim();

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // 1. Identify Zone ID (Find root domain or exact zone in Cloudflare)
  const domainParts = cleanDomain.split(".");
  const candidateZones: string[] = [cleanDomain];
  if (domainParts.length > 2) {
    candidateZones.push(domainParts.slice(-2).join("."));
  }

  let zoneId: string | null = null;
  let matchedZoneName: string | null = null;

  for (const candidate of candidateZones) {
    try {
      const zoneRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(candidate)}&status=active`,
        { headers }
      );
      if (zoneRes.ok) {
        const zoneData = await zoneRes.json();
        if (zoneData.success && zoneData.result && zoneData.result.length > 0) {
          zoneId = zoneData.result[0].id;
          matchedZoneName = zoneData.result[0].name;
          break;
        }
      }
    } catch {
      // Continue search
    }
  }

  if (!zoneId) {
    return {
      success: false,
      recordsAdded: [],
      recordsUpdated: [],
      error: `Could not find an active Cloudflare zone for '${cleanDomain}'. Please make sure this domain is added to your Cloudflare account and your API token has 'Zone:Read' and 'DNS:Edit' permissions.`,
    };
  }

  // 2. Fetch existing DNS records in this Zone
  let existingRecords: any[] = [];
  try {
    const listRes = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?per_page=100`,
      { headers }
    );
    if (listRes.ok) {
      const listData = await listRes.json();
      if (listData.success) {
        existingRecords = listData.result || [];
      }
    }
  } catch (err: any) {
    return {
      success: false,
      recordsAdded: [],
      recordsUpdated: [],
      error: `Failed to read existing DNS records from Cloudflare: ${err.message}`,
    };
  }

  const recordsAdded: string[] = [];
  const recordsUpdated: string[] = [];

  // Helper function to create or update a record
  async function upsertRecord(type: string, name: string, content: string) {
    const fullExpectedName = name === "@" ? matchedZoneName! : name.includes(".") ? name : `${name}.${matchedZoneName}`;

    // Find existing matching record
    const match = existingRecords.find(
      (r) =>
        r.type === type &&
        (r.name === fullExpectedName ||
          r.name === `${name}.${matchedZoneName}` ||
          (name === "@" && r.name === matchedZoneName))
    );

    if (match) {
      // If content is already present (e.g. SPF already contains include), don't overwrite if not needed
      if (match.content === content) {
        recordsAdded.push(`${type} ${fullExpectedName} (already present)`);
        return;
      }

      // If SPF already exists, intelligently merge include:mail.getsendport.com
      let updatedContent = content;
      if (type === "TXT" && match.content.startsWith("v=spf1")) {
        if (!match.content.includes("getsendport.com")) {
          updatedContent = match.content.replace("~all", "include:mail.getsendport.com ~all").replace("-all", "include:mail.getsendport.com -all");
        } else {
          recordsAdded.push(`SPF ${fullExpectedName} (Sendport already included)`);
          return;
        }
      }

      const updateRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${match.id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            type,
            name: fullExpectedName,
            content: updatedContent,
            ttl: 1, // Auto TTL
          }),
        }
      );

      if (updateRes.ok) {
        recordsUpdated.push(`${type} ${fullExpectedName}`);
      } else {
        const err = await updateRes.json();
        console.warn(`Cloudflare update error for ${fullExpectedName}:`, err);
      }
    } else {
      // Create new DNS record
      const createRes = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            type,
            name: fullExpectedName,
            content,
            ttl: 1, // Auto TTL
          }),
        }
      );

      if (createRes.ok) {
        recordsAdded.push(`${type} ${fullExpectedName}`);
      } else {
        const err = await createRes.json();
        console.warn(`Cloudflare create error for ${fullExpectedName}:`, err);
      }
    }
  }

  // 3. Upsert DKIM Record
  const dkimName = `${dkimSelector}._domainkey.${cleanDomain}`;
  await upsertRecord("TXT", dkimName, dkimRecordValue);

  // 4. Upsert SPF Record
  await upsertRecord("TXT", cleanDomain, spfRecordValue);

  // 5. Upsert DMARC Record
  const dmarcName = `_dmarc.${cleanDomain}`;
  await upsertRecord("TXT", dmarcName, dmarcRecordValue);

  return {
    success: true,
    zoneId,
    zoneName: matchedZoneName || cleanDomain,
    recordsAdded,
    recordsUpdated,
  };
}
