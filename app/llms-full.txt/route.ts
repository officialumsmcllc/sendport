import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/config/site";

export const dynamic = "force-static";

export async function GET() {
  const content = `# Sendport — Complete Technical & API Reference (LLMs-Full)
> Platform: ${siteConfig.name} (${siteConfig.tagline})
> Canonical URL: ${siteConfig.url}

## 1. Architecture Overview
Sendport is a developer-first email infrastructure built for high deliverability, sub-10ms latency, and modern integration patterns.

### Core Capabilities:
- **Cryptographic Authentication:** Every custom domain automatically receives a unique 2048-bit RSA private/public keypair for DKIM signing.
- **DNS Verification:** Automated DNS queries resolve SPF, DKIM TXT, DMARC, and MX records with instant status indicators.
- **Edge Delivery Nodes:** Global mail relays route transactional payloads with sub-10ms delivery latency.
- **Realtime Webhooks:** HMAC-SHA256 signed event streams for email.delivered, email.opened, email.clicked, email.bounced, and email.complained.
- **SMTP Gateway:** Compatible with all SMTP standard clients, WordPress plugins (WP Mail SMTP), Laravel, Ghost, and Ruby on Rails.

---

## 2. API Endpoints

### 2.1 Send Email
- **Method:** \`POST /api/v1/emails\` or \`POST https://api.getsendport.com/v1/emails\`
- **Headers:** \`Authorization: Bearer <API_KEY>\`, \`Content-Type: application/json\`
- **Request Body:**
\`\`\`json
{
  "from": "Acme <onboarding@yourdomain.com>",
  "to": ["user@example.com"],
  "subject": "Account Verification",
  "html": "<h1>Your verification code is 123456</h1>",
  "text": "Your verification code is 123456",
  "trackOpens": true,
  "trackClicks": true,
  "tags": [{ "name": "category", "value": "auth" }]
}
\`\`\`
- **Response:**
\`\`\`json
{
  "id": "msg_9f82ab4c1e09",
  "from": "onboarding@yourdomain.com",
  "to": ["user@example.com"],
  "status": "QUEUED",
  "createdAt": "2026-10-06T00:00:00.000Z"
}
\`\`\`

### 2.2 Verify Domain DNS
- **Method:** \`POST /api/v1/domains/verify\`
- **Request Body:** \`{ "domain": "yourdomain.com" }\`
- **Response:**
\`\`\`json
{
  "domain": "yourdomain.com",
  "status": "VERIFIED",
  "dkim": { "valid": true, "selector": "sendport", "keyLength": 2048 },
  "spf": { "valid": true, "record": "v=spf1 include:mail.getsendport.com ~all" },
  "dmarc": { "valid": true, "record": "v=DMARC1; p=none; rua=mailto:dmarc@getsendport.com" }
}
\`\`\`

### 2.3 Link Checker (Pre-flight QA)
- **Method:** \`POST /api/v1/tools/link-checker\`
- **Request Body:** \`{ "html": "<a href='https://example.com'>Link</a>" }\`
- **Response:** \`{ "totalLinks": 1, "brokenCount": 0, "results": [...] }\`

---

## 3. Pricing & Quotas
1. **Starter Plan:** Free Forever — 500 emails/day (15,000/mo), 3 custom verified domains, full REST API and SMTP relay.
2. **Growth Plan:** $29/mo — 5,000 emails/day (150,000/mo), unlimited custom domains, AI spam reducer, link checker, 10k contacts.
3. **Scale Pro:** $79/mo — 25,000 emails/day (750,000/mo), dedicated IP, sub-10ms priority queue, RBAC multi-team workspaces.

---

## 4. Contact & Support
- Founder: Muhammad Umar (Founder & Lead Architect)
- Support: support@getsendport.com
- Security: security@getsendport.com
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
