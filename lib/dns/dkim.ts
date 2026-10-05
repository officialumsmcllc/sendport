import crypto from "crypto";

export interface DkimKeyPair {
  publicKey: string;     // Base64 public key formatted for DNS TXT (k=rsa; p=MIGf...)
  privateKey: string;    // PEM encoded private key for email signing
  dnsRecordValue: string; // "v=DKIM1; k=rsa; p=..."
  selector: string;
}

/**
 * Generates an industry-standard 2048-bit RSA Keypair for DKIM Signing
 */
export function generateDkimKeyPair(selector: string = "sendport"): DkimKeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "der",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  // Convert DER public key buffer to clean base64 string
  const base64PublicKey = publicKey.toString("base64");
  const dnsRecordValue = `v=DKIM1; k=rsa; p=${base64PublicKey}`;

  return {
    publicKey: base64PublicKey,
    privateKey,
    dnsRecordValue,
    selector,
  };
}

/**
 * Signs email header and body using domain's RSA private key (RFC-6376)
 */
export function signDkimHeader(
  domain: string,
  selector: string,
  privateKeyPem: string,
  headersToSign: Record<string, string>,
  body: string
): string {
  try {
    // Canonicalize body and compute SHA-256 body hash (bh)
    const normalizedBody = body.replace(/\r?\n/g, "\r\n").trimEnd() + "\r\n";
    const bodyHash = crypto.createHash("sha256").update(normalizedBody).digest("base64");

    const headerKeys = Object.keys(headersToSign).map((k) => k.toLowerCase()).join(":");
    const timestamp = Math.floor(Date.now() / 1000);

    let dkimHeader = `v=1; a=rsa-sha256; c=relaxed/relaxed; d=${domain}; s=${selector}; t=${timestamp}; h=${headerKeys}; bh=${bodyHash}; b=`;

    // Canonicalize headers
    let canonicalHeaders = "";
    for (const [key, value] of Object.entries(headersToSign)) {
      canonicalHeaders += `${key.toLowerCase().trim()}:${value.replace(/\s+/g, " ").trim()}\r\n`;
    }
    canonicalHeaders += `dkim-signature:${dkimHeader}`;

    // Sign with RSA-SHA256
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(canonicalHeaders);
    signer.end();
    const signature = signer.sign(privateKeyPem, "base64");

    return dkimHeader + signature;
  } catch (error) {
    console.error("DKIM Signing error:", error);
    return "";
  }
}
