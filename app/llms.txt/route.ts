import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/config/site";

export const dynamic = "force-static";

export async function GET() {
  const content = `# ${siteConfig.name} — LLM Knowledge Base & Documentation
> ${siteConfig.tagline}
> URL: ${siteConfig.url}

## About Sendport
Sendport is a high-performance transactional and marketing email delivery infrastructure for software developers, AI agents, and modern applications.

## Key Technical Specifications
- 2048-bit RSA DKIM Cryptographic Key Generation & Signing
- Sub-10ms Average Dispatch Latency via globally distributed edge nodes
- SPF Alignment & DMARC Enforcement
- Instant SMTP Relay (Host: smtp.getsendport.com, Ports: 587 / 465)
- Native React Email component rendering (@react-email/components)
- Realtime Open and Click Tracking via zero-latency webhooks
- Multi-Currency Pricing (USD, EUR, GBP, AED, SAR, PKR) with Stripe, Wire, and Crypto USDT

## REST API Quick Reference

### Base URL
https://api.getsendport.com/v1 (or https://getsendport.com/api/v1)

### Authentication
Include API key in the Authorization header:
Authorization: Bearer sp_live_your_api_key

### Send Email (POST /v1/emails)
\`\`\`bash
curl -X POST https://api.getsendport.com/v1/emails \\
  -H "Authorization: Bearer sp_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "Acme <onboarding@yourdomain.com>",
    "to": ["user@example.com"],
    "subject": "Your Verification Code",
    "html": "<strong>Your code is 481-920</strong>",
    "trackOpens": true,
    "trackClicks": true
  }'
\`\`\`

### Node.js / TypeScript SDK
\`\`\`typescript
import { Sendport } from 'sendport';

const sendport = new Sendport({ apiKey: process.env.SENDPORT_API_KEY });

const { data, error } = await sendport.emails.send({
  from: 'Acme <onboarding@yourdomain.com>',
  to: ['user@example.com'],
  subject: 'Welcome to Acme',
  html: '<strong>Welcome!</strong>'
});
\`\`\`

### Python SDK
\`\`\`python
import sendport

client = sendport.Client(api_key="sp_live_your_api_key")
response = client.emails.send({
    "from": "Acme <onboarding@yourdomain.com>",
    "to": ["user@example.com"],
    "subject": "Welcome to Acme",
    "html": "<strong>Welcome!</strong>"
})
\`\`\`

## Full Documentation & Links
- Documentation: ${siteConfig.url}/docs
- Features: ${siteConfig.url}/features
- Platform Status: ${siteConfig.url}/status
- Full LLM Reference: ${siteConfig.url}/llms-full.txt
- XML Sitemap: ${siteConfig.url}/sitemap.xml
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
