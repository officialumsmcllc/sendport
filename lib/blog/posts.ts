export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "Comparisons" | "Deliverability" | "Next.js & Frameworks" | "Engineering";
  date: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  featured?: boolean;
  tags: string[];
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "resend-vs-sendgrid-vs-sendport-comparison-2026",
    title: "Resend vs SendGrid vs Postmark vs Sendport: The 2026 Email API Benchmark",
    excerpt:
      "A no-nonsense, technical comparison of email limits, pricing, deliverability engines, developer experience, and global payment support in 2026.",
    category: "Comparisons",
    date: "March 28, 2026",
    readTime: "7 min read",
    featured: true,
    author: {
      name: "Umar Farooq",
      role: "Founder & Infrastructure Lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    tags: ["Resend Alternative", "SendGrid", "Email API", "Pricing Comparison"],
    content: `
## The State of Developer Email in 2026

For over a decade, **SendGrid** dominated transactional email. Then, modern developer platforms like **Resend** and **Postmark** transformed the landscape by focusing on developer experience (DX), React Email templates, and ultra-fast APIs.

However, in 2026, founders and developers face new hurdles:
1. **Restrictive Free Tiers**: SendGrid removed its permanent free tier (now just a 60-day trial), while Postmark offers only 100 emails/month.
2. **Double Billed Audiences**: Resend bills you separately for transactional volume AND marketing contacts.
3. **Credit Card Only Friction**: Most US-based providers reject international bank transfers, local currencies, or USDT crypto billing.

In this benchmark, we put **Sendport**, **Resend**, **SendGrid**, and **Postmark** head-to-head.

---

## 1. Quick Comparison Matrix (2026)

| Feature | Sendport | Resend | SendGrid (Twilio) | Postmark |
| :--- | :--- | :--- | :--- | :--- |
| **Free Tier** | **500 emails/day** (15,000/mo) | 100/day (3,000/mo) | 60-day trial only | 100 emails/mo |
| **$19-$20 Plan** | **150,000 emails/mo** (5k/day) | 50,000 emails/mo | 50,000 emails/mo | 10,000 emails/mo ($15) |
| **Enterprise / Scale** | **750,000 emails/mo** ($59) | Custom ($500+) | 100,000 emails/mo ($89.95) | 300,000 emails/mo ($245) |
| **Multi-Domain Sending** | Unlimited verified domains | 1 on free, unlimited paid | Unlimited | Unlimited |
| **Audience Contacts Cost** | **$0 extra fees** | Charged per 1k contacts | Extra Marketing add-on | Not permitted (Transactional only) |
| **Payment Options** | **Stripe, EasyPaisa, JazzCash, USDT, Wire** | Stripe / Credit Card only | Credit Card only | Credit Card only |
| **DKIM & SPF Generation** | Instant RSA-2048 auto-gen | Auto-generated | Manual CNAME | DNS TXT |

---

## 2. Free Tier & Quota Breakdown

- **Sendport**: Gives developers **500 emails per day** (up to 15,000 emails/month) completely free with custom domains and webhooks.
- **Resend**: Caps you at **100 emails per day** (3,000/month) and restricts free accounts to a single verified domain.
- **SendGrid**: Discontinued its free forever plan in 2025; new accounts only receive a temporary 60-day trial.
- **Postmark**: Limits free developer tier to **100 emails per month total**, making testing in staging environments cumbersome.

---

## 3. Deliverability Architecture

Deliverability in 2026 requires strict compliance with Google and Yahoo's 2024+ DMARC requirements.

Sendport isolates marketing and transactional sending reputations while maintaining dedicated IP warmup ramps. Every custom domain configured on Sendport automatically generates **RSA-2048 bit DKIM keys** and full DMARC alignments out of the box.

\`\`\`typescript
// Sending via Sendport in Next.js 15
import { Sendport } from "sendport";

const sendport = new Sendport(process.env.SENDPORT_API_KEY);

await sendport.emails.send({
  from: "notifications@yourdomain.com",
  to: "user@example.com",
  subject: "Welcome to our platform",
  html: "<h1>Your account is ready</h1>",
});
\`\`\`

---

## 4. Verdict: Which Provider Should You Choose?

- **Choose Sendport** if you want the highest email allowance per dollar, need zero contact-penalty fees for audiences, require local/crypto payment flexibility, and want modern Next.js/React email integrations.
- **Choose Resend** if your app only sends less than 3,000 emails/month and you strictly use Stripe.
- **Choose Postmark** if you have a massive enterprise budget and only send password resets.
    `,
  },
  {
    slug: "how-to-fix-emails-going-to-spam-spf-dkim-dmarc",
    title: "Why Your Emails Land in Spam: The Ultimate SPF, DKIM & DMARC Setup Guide (2026)",
    excerpt:
      "A practical engineering guide to getting 99.8%+ inbox placement. Learn how Google and Yahoo's strict DMARC enforcement works and how to fix email deliverability.",
    category: "Deliverability",
    date: "March 25, 2026",
    readTime: "9 min read",
    author: {
      name: "Umar Farooq",
      role: "Founder & Infrastructure Lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    tags: ["Deliverability", "DKIM", "SPF", "DMARC", "DNS Setup"],
    content: `
## Why Do Emails Go to Spam in 2026?

Email deliverability has undergone a massive transformation. Google Gmail, Yahoo, Microsoft 365, and Apple Mail now immediately reject or quarantine messages from domains that do not have **100% cryptographic authentication alignment**.

If your emails are landing in the Spam or Promotions folder, 90% of the time it is due to one of three missing DNS records:
1. **Missing or Incomplete SPF (Sender Policy Framework)**
2. **Unsigned or 1024-bit DKIM (DomainKeys Identified Mail)**
3. **Missing DMARC Policy (Domain-based Message Authentication, Reporting & Conformance)**

Let's fix all three in under 10 minutes.

---

## Step 1: SPF (Sender Policy Framework)

SPF tells receiving mail servers which IP addresses are authorized to send email on behalf of your domain name.

### The Correct Record:
Add a **TXT** record at your root domain (\`@\` or \`yourdomain.com\`):

| Record Type | Host | Value | TTL |
| :--- | :--- | :--- | :--- |
| **TXT** | \`@\` | \`v=spf1 include:mail.getsendport.com ~all\` | 3600 |

> **Crucial Rule**: Never create more than one SPF record on a single domain. If you already have Google Workspace, combine them:  
> \`v=spf1 include:_spf.google.com include:mail.getsendport.com ~all\`

---

## Step 2: 2048-Bit RSA DKIM

DKIM attaches a cryptographic digital signature to every outbound email header. When the recipient server receives the email, it pulls your public key from DNS to verify that the message was not tampered with during transit.

In Sendport, go to **Dashboard &rarr; Domains &rarr; Add Domain**. Sendport will generate a 2048-bit key pair.

Add the TXT record to your DNS (e.g. Cloudflare, Namecheap, GoDaddy):

| Record Type | Host | Value |
| :--- | :--- | :--- |
| **TXT** | \`sendport._domainkey.yourdomain.com\` | \`v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\` |

---

## Step 3: DMARC Policy

DMARC is the policy rulebook. It tells Gmail and Yahoo what to do if an incoming email fails SPF or DKIM.

Without DMARC, Gmail flags your domain as untrusted.

| Record Type | Host | Value |
| :--- | :--- | :--- |
| **TXT** | \`_dmarc.yourdomain.com\` | \`v=DMARC1; p=none; rua=mailto:dmarc@getsendport.com; sp=none; aspf=r;\` |

### What the tags mean:
- \`v=DMARC1\`: DMARC Version 1 protocol.
- \`p=none\`: Monitor mode (safe for setup without bouncing legit mail). Once verified, upgrade to \`p=quarantine\` or \`p=reject\`.
- \`rua\`: Aggregate XML report destination to track spoofing attempts.

---

## Summary Checklist for 99.8% Inbox Placement

- [x] SPF record present with zero syntax errors.
- [x] RSA-2048 DKIM key published on selector \`sendport._domainkey\`.
- [x] DMARC record added on \`_dmarc\`.
- [x] MX records aligned for inbound bounces.
- [x] One-click unsubscribe header included in all non-transactional dispatches.
    `,
  },
  {
    slug: "sending-transactional-emails-nextjs-15-app-router",
    title: "How to Send Transactional Emails in Next.js 15 App Router (TypeScript Guide)",
    excerpt:
      "A complete walkthrough of sending transactional emails using Next.js 15 Server Actions and Route Handlers with Sendport.",
    category: "Next.js & Frameworks",
    date: "March 20, 2026",
    readTime: "6 min read",
    author: {
      name: "Sendport Engineering",
      role: "Developer Relations Team",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
    tags: ["Next.js 15", "TypeScript", "React Email", "Server Actions"],
    content: `
## Introduction

Next.js 15 brings powerful Server Actions and streaming primitives. In this guide, we'll demonstrate how to send transactional emails (such as welcome emails, password resets, and purchase invoices) directly from a Next.js 15 App Router application with sub-20ms latency.

---

## Step 1: Install the Sendport SDK or Use Native Fetch

Sendport provides a lightweight HTTP API compatible with any Node.js, Bun, Edge, or Cloudflare Worker runtime.

\`\`\`bash
npm install sendport
# or use native fetch in Next.js
\`\`\`

Add your API key to \`.env.local\`:

\`\`\`env
SENDPORT_API_KEY=sk_live_your_api_key_here
\`\`\`

---

## Step 2: Create a Server Action

Create a new file at \`app/actions/send-welcome.ts\`:

\`\`\`typescript
"use server";

export async function sendWelcomeEmail(toEmail: string, userName: string) {
  try {
    const res = await fetch("https://api.getsendport.com/v1/emails/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${process.env.SENDPORT_API_KEY}\`,
      },
      body: JSON.stringify({
        from: "Acme App <welcome@yourdomain.com>",
        to: toEmail,
        subject: \`Welcome to Acme, \${userName}!\`,
        html: \`
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h1 style="color: #0f172a;">Welcome aboard, \${userName}!</h1>
            <p style="color: #475569; line-height: 1.6;">
              Thank you for signing up. Your account is now active and ready to go.
            </p>
            <a href="https://yourdomain.com/dashboard" 
               style="display: inline-block; background: #f59e0b; color: #000; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
              Go to Your Dashboard &rarr;
            </a>
          </div>
        \`,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to dispatch email");
    }

    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
\`\`\`

---

## Step 3: Trigger in Your Signup Component

\`\`\`tsx
"use client";

import { useState } from "react";
import { sendWelcomeEmail } from "@/app/actions/send-welcome";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending welcome email...");
    const result = await sendWelcomeEmail(email, name);
    if (result.success) {
      setStatus("Email sent! Check your inbox.");
    } else {
      setStatus("Error: " + result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button type="submit" className="bg-amber-500 text-black font-bold px-4 py-2 rounded">
        Create Account
      </button>
      {status && <p className="text-sm text-slate-600">{status}</p>}
    </form>
  );
}
\`\`\`

---

## Conclusion

With Sendport's global edge network, transactional emails dispatch in under 18ms with automated DKIM signing. You get free open/click tracking and webhook delivery out of the box.
    `,
  },
  {
    slug: "why-developers-are-switching-from-mailgun-and-sendgrid",
    title: "Why Developers Are Migrating From SendGrid and Mailgun in 2026",
    excerpt:
      "Legacy email providers are bloated, slow, and expensive. Here's why modern engineering teams are moving to developer-first email infrastructure.",
    category: "Engineering",
    date: "March 15, 2026",
    readTime: "5 min read",
    author: {
      name: "Sendport Engineering",
      role: "Infrastructure Team",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
    tags: ["Mailgun Alternative", "SendGrid Alternative", "Email Infrastructure"],
    content: `
## The Problem with Legacy Email Infrastructure

SendGrid was founded in 2009. Mailgun was founded in 2010. While they helped build the early cloud web, over the last 15 years they have acquired massive technical debt.

### 1. Clunky, Bloated Dashboards
Searching for a single email log in SendGrid can take 10-15 seconds. Finding a bounce reason requires clicking through multiple legacy sub-menus.

### 2. Arbitrary Account Suspensions
Automated fraud detection bots at legacy providers frequently freeze new developer accounts without human review, causing critical production outages for early-stage startups.

### 3. Aggressive Price Hikes
SendGrid's elimination of the free tier and Mailgun's strict 30-day message retention upcharges have forced teams to seek modern alternatives.

---

## What Modern Email Infrastructure Looks Like

Modern platforms like **Sendport** are built from the ground up for 2026 developer workflows:
- **Instant Sub-20ms API Latency**: Edge routing nodes situated in US, EU, and Asia.
- **Crystal Clear Logs**: Real-time WebSocket streaming of every dispatch, open, and click event.
- **Fair, Predictable Pricing**: Generous quotas (500 free emails/day) without surprise contact fees.
- **Global Payment Freedom**: Support for international cards, local bank transfers, JazzCash, EasyPaisa, and crypto USDT.
    `,
  },
];
