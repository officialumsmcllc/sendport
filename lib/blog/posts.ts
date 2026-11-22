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
| **Free Tier** | **100 emails/day** (3,000/mo) | 100/day (3,000/mo) | 60-day trial only | 100 emails/mo |
| **$20 Growth Plan** | **90,000 emails/mo** (3k/day) | 30,000 emails/mo | 50,000 emails/mo | 10,000 emails/mo ($15) |
| **Enterprise / Scale** | **750,000 emails/mo** ($79) | Custom ($500+) | 100,000 emails/mo ($89.95) | 300,000 emails/mo ($245) |
| **Multi-Domain Sending** | 1 on Free, 5 on Growth, Unltd Scale | 1 on free, add-on fees | Unlimited | Unlimited |
| **Audience Contacts Cost** | **$0 extra fees** | Charged per 1k contacts | Extra Marketing add-on | Not permitted (Transactional only) |
| **Payment Options** | **Stripe, EasyPaisa, JazzCash, USDT, Wire** | Stripe / Credit Card only | Credit Card only | Credit Card only |
| **Automated 30-Day Warmup** | **Built-in Schedule** | Manual / Enterprise | Paid add-on | Manual |
| **Live Spam Tester** | **Built-in 0-100 Scorecard** | Not available | Paid 3rd party tool | Basic tools |
| **DKIM & SPF Generation** | Instant RSA-2048 auto-gen | Auto-generated | Manual CNAME | DNS TXT |

---

## 2. Free Tier & Quota Breakdown

- **Sendport**: Gives developers **100 emails per day** (3,000 emails/month) free forever with 2048-bit DKIM, automated DNS verification, and full REST API access. Upgrading to the $20 Growth plan unlocks **90,000 emails/month (3,000/day)** with automated 30-day warmup.
- **Resend**: Caps you at **100 emails per day** (3,000/month) and charges extra for marketing contacts once you scale.
- **SendGrid**: Discontinued its free forever plan; new accounts only receive a temporary 60-day trial followed by forced upgrades.
- **Postmark**: Limits free developer tier to **100 emails per month total** and strictly bans marketing or newsletter broadcasts.

---

## 3. Deliverability Architecture

Deliverability in 2026 requires strict compliance with Google and Yahoo's 2024+ DMARC requirements.

Sendport provides an interactive **Deliverability & Warmup Engine** that monitors your sender score, calculates real bounce rates, and guides new domains through an automated 30-day warmup ramp. Every custom domain configured on Sendport automatically generates **RSA-2048 bit DKIM keys** and full DMARC alignments out of the box.

\`\`\`typescript
// Sending via Sendport REST API in Next.js 15
const res = await fetch("https://api.getsendport.com/v1/emails/send", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + process.env.SENDPORT_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "notifications@yourdomain.com",
    to: "user@example.com",
    subject: "Welcome to our platform",
    html: "<h1>Your account is ready</h1>",
  }),
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

## Step 1: Configure Your Environment

Sendport provides a high-speed HTTP REST API compatible with any Node.js, Bun, Edge, or Cloudflare Worker runtime without external dependencies.

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
- **Fair, Predictable Pricing**: Generous quotas (100 free emails/day) without surprise contact fees.
- **Global Payment Freedom**: Support for international cards, local bank transfers, JazzCash, EasyPaisa, and crypto USDT.
    `,
  },
  {
    slug: "how-to-fix-yahoo-421-4-7-0-tss04-error",
    title: "How to Fix Yahoo 421 4.7.0 [TSS04] Unexpected Volume & Deferral Errors",
    excerpt:
      "Encountering Yahoo TSS04 rate limit blocks? Learn why Yahoo Mail MX clusters defer outbound emails and how to configure adaptive throttle pacing to guarantee 100% inbox delivery.",
    category: "Deliverability",
    date: "April 2, 2026",
    readTime: "8 min read",
    author: {
      name: "Umar Farooq",
      role: "Founder & Infrastructure Lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    tags: ["Yahoo TSS04", "SMTP 421 Error", "Email Deliverability", "Throttle Pacing", "Yahoo Postmaster"],
    content: `
## What Does SMTP Error Code 421 4.7.0 [TSS04] Mean?

If your mail server or transactional email provider attempts to send a batch of emails to **@yahoo.com**, **@ymail.com**, or **@aol.com** and receives the following response:

\`\`\`text
421 4.7.0 [TSS04] Messages from 45.59.103.242 temporarily deferred due to unexpected volume or user complaints - 4.16.55.1; see https://postmaster.yahooinc.com/error-codes
\`\`\`

Do not panic: **this is not a permanent failure (hard bounce)**. 

In the SMTP RFC standard:
- **5xx** codes represent permanent rejections (e.g., user does not exist or permanent domain block).
- **4xx** codes represent **transient deferrals (soft throttles)**. Yahoo's receiving MX cluster (\`mta6.am0.yahoodns.net\`) is telling your server: *"You are sending too fast or opened too many simultaneous connections. Slow down, queue the message, and retry in a few moments."*

---

## Why Does Yahoo Trigger TSS04?

Yahoo Mail is one of the most volume-sensitive mail providers in the world. The primary triggers include:

1. **High Connection Concurrency**: Opening 5 or 10 parallel TCP Port 25 connections to Yahoo MX clusters in the exact same second from a single sending IP.
2. **Sudden Spike on Newly Warmed IP**: Sending a campaign blast of several hundred messages without a gradual warmup schedule.
3. **Missing or Misaligned Reverse DNS (PTR)**: Yahoo aggressively defers connections if the outbound IP address lacks an authentic PTR record pointing to your sending HELO domain.

---

## How to Fix Yahoo TSS04 Step-by-Step

### 1. Enforce Domain-Aware Sequential Pacing (Anti-Throttle Engine)
Never blast emails to Yahoo using parallel connection pools (\`Promise.all\` in Node.js or multiple threads in Python). 

Instead, pace connections to Yahoo MX servers sequentially with a **750ms to 1,000ms delay** between consecutive connection handshakes:

\`\`\`typescript
// Example: Domain-aware pacing engine
const recipientDomain = contact.email.split("@")[1]?.toLowerCase() || "";
const isYahooMx = recipientDomain.includes("yahoo") || recipientDomain.includes("aol");

// Enforce 750ms spacing for Yahoo to avoid TSS04 rate limit deferrals
const delayMs = isYahooMx ? 750 : 150;
await new Promise((resolve) => setTimeout(resolve, delayMs));
\`\`\`

### 2. Verify Your PTR and FCrDNS (Forward-Confirmed Reverse DNS)
Ensure your dedicated sending IP resolves reversely to your hostname, and that hostname resolves forward to the exact same IP:

\`\`\`bash
# 1. Reverse lookup:
dig -x 45.59.103.242 +short
# Output: mail.getsendport.com.

# 2. Forward lookup:
dig mail.getsendport.com +short
# Output: 45.59.103.242
\`\`\`

### 3. Ensure Strict DMARC and 2048-Bit RSA DKIM
Yahoo's 2024+ sender policy requires every bulk sender sending over 5,000 emails/day to have:
- Valid SPF record with zero syntax errors.
- Cryptographically signed 2048-bit RSA DKIM key aligned with the \`From:\` header domain.
- A published DMARC policy on \`_dmarc.yourdomain.com\` with \`p=none\` or \`p=quarantine\`.

---

## How Sendport Automatically Solves Yahoo TSS04

Sendport's autonomous dedicated VPS MTA engine comes pre-equipped with an **Adaptive Throttle Pacing Governor**:
- Detects \`421 [TSS04]\` deferrals in real-time.
- Automatically marks the affected email as **\`QUEUED\`** (not failed) and slows connection concurrency to 1 msg/1.5s until Yahoo MX transitions back to \`250 OK\` healthy state.
- Zero manual maintenance required.
    `,
  },
  {
    slug: "how-to-fix-outlook-550-5-7-1-s3150-blocklist",
    title: "How to Fix Outlook & Hotmail 550 5.7.1 S3150 IP Blocklist Rejections",
    excerpt:
      "A complete step-by-step guide to removing your sending IP from Microsoft Outlook's S3150 blocklist, escalating past automated bot denials, and setting up SNDS/JMRP.",
    category: "Deliverability",
    date: "April 5, 2026",
    readTime: "7 min read",
    author: {
      name: "Umar Farooq",
      role: "Founder & Infrastructure Lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    tags: ["Outlook S3150", "Hotmail Blocklist", "SMTP 550 5.7.1", "Deliverability Support", "Microsoft SNDS"],
    content: `
## Understanding Microsoft Outlook Error 550 5.7.1 S3150

When dispatching emails to Microsoft mailboxes (**@outlook.com**, **@hotmail.com**, **@live.com**, **@msn.com**), receiving mail servers may reject your connection with this diagnostic notice:

\`\`\`text
Dedicated VPS MTA: Transmission failed via hotmail-com.olc.protection.outlook.com: (550, "5.7.1 
Unfortunately, messages from [45.59.103.242] weren't sent. Please contact your Internet service 
provider since part of their network is on our block list (S3150). [Name=Protocol Filter Agent] 
[AGT=PFA] [MXId=...prod.outlook.com]")
\`\`\`

### What Is the S3150 Filter?
The \`S3150\` code is triggered by Microsoft's automated **Protocol Filter Agent (PFA)**. Unlike a recipient-level spam block, this is a **network-level reputation filter**. When a new VPS IP or cloud subnet (such as AlphaVPS, Hetzner, DigitalOcean, or AWS) begins sending mail, Microsoft's automated filter flags the entire subnet by default until authentic ownership and anti-abuse compliance are proven.

---

## Step 1: Technical Pre-Flight Verification

Before requesting mitigation from Microsoft, your mail server **must** be technically flawless. If Microsoft's compliance engine finds a single error during inspection, your ticket will be permanently closed.

Ensure the following 4 pillars are verified:
1. **Valid Reverse DNS (PTR)**: IP must resolve to a valid hostname (e.g. \`mail.yourdomain.com\`).
2. **2048-Bit RSA DKIM**: Signed on all outgoing dispatches with valid selector.
3. **Aligned SPF**: \`v=spf1 include:mail.yourdomain.com ~all\`.
4. **DMARC Record**: Published on root domain \`_dmarc.yourdomain.com\`.

---

## Step 2: Submitting the Microsoft Delist Ticket

Navigate to Microsoft's official deliverability support portal:  
🔗 **https://olcsupport.office.com/**

Fill out the form with these exact settings:
- **Issue Title**: \`IP [YOUR_IP] S3150 Delist Request - mail.yourdomain.com\`
- **Contact Name**: Your Name / Company Name
- **What domain are you sending to?**: Select \`hotmail.com\` or \`outlook.com\`
- **Outbound IP(s)**: Enter your dedicated IP (e.g. \`45.59.103.242\`)
- **Is your server dedicated or shared?**: Select **Dedicated**
- **How would you describe your company?**: Select **ESP** or **SaaS / Web App**

---

## Step 3: Escalating Past the Automated Bot Refusal

Within 5 to 15 minutes of submission, Microsoft's automated filter will send an automated reply to your contact email:

> *"Not qualified for mitigation. Our investigation has determined that the above IP(s) do not qualify for mitigation."*

**Do not be discouraged — this happens to 99% of new submissions.** The bot sends this automatically. 

### How to Escalate to a Human Deliverability Engineer:
Hit **Reply** to that exact automated email without modifying the subject line, and paste this professional technical statement:

\`\`\`text
Hello Microsoft Deliverability Support Team,

I am writing to respectfully request human review and mitigation for sending IP: 45.59.103.242 (mail.getsendport.com).

This is a newly provisioned, dedicated clean IP server utilized strictly for opt-in transactional notifications (password resets, account activations, order receipts). We enforce zero-tolerance anti-abuse policies and immediate one-click unsubscription.

Technical Authentication Verification:
- Valid PTR / FCrDNS: 45.59.103.242 -> mail.getsendport.com
- Cryptographic DKIM: 2048-bit RSA cryptographically verified
- SPF & DMARC: Strict compliance (p=none / p=quarantine)
- Clean Reputation: Zero listings on Spamhaus, Barracuda, SURBL, or SORBS

Please grant conditional mitigation to allow authentic user notifications to deliver smoothly to Outlook.com and Hotmail.com recipients.

Thank you for your assistance,
Sendport Deliverability Engineering
\`\`\`

Within 12 to 24 hours, a Microsoft engineer (such as Anthony from Outlook Deliverability) will inspect your PTR and DKIM records and reply:  
**"We have implemented mitigation for your IP. This process may take 24 - 48 hours to replicate completely throughout our system."**

---

## Step 4: Long-Term Monitoring via Microsoft SNDS & JMRP

To maintain long-term sender reputation with Microsoft:
1. Enroll your sending IP in **Smart Network Data Services (SNDS)**: https://sendersupport.olc.protection.outlook.com/snds/
2. Sign up for the **Junk Email Reporting Program (JMRP)** to receive real-time automated spam complaint notifications.
    `,
  },
  {
    slug: "laravel-11-smtp-transactional-email-setup-guide",
    title: "How to Configure Transactional Email in Laravel 11 with SMTP & REST API",
    excerpt:
      "A modern developer walkthrough for sending transactional emails, order receipts, and auth notifications in Laravel 11 with asynchronous queue workers.",
    category: "Engineering",
    date: "April 8, 2026",
    readTime: "6 min read",
    author: {
      name: "Sendport Engineering",
      role: "Developer Relations Team",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
    tags: ["Laravel 11", "PHP", "SMTP Relay", "Transactional Email", "Mailables"],
    content: `
## Overview

Laravel 11 features a streamlined, minimal application skeleton with modern configuration files. In this guide, we will configure transactional email delivery in Laravel 11 using both:
1. **High-Speed SMTP Relay** (Standard Laravel Mailables)
2. **Direct REST API Dispatches via Guzzle** (Sub-15ms Edge Latency)

---

## Method 1: Configuring Laravel 11 SMTP Relay

Open your Laravel application's \`.env\` file and configure the mail environment variables:

\`\`\`env
MAIL_MAILER=smtp
MAIL_HOST=mail.getsendport.com
MAIL_PORT=587
MAIL_USERNAME=sp_live_your_api_key_here
MAIL_PASSWORD=sp_live_your_api_key_here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="notifications@yourdomain.com"
MAIL_FROM_NAME="\${APP_NAME}"
\`\`\`

### Testing with a Mailable Class

Generate a new Mailable using Artisan:

\`\`\`bash
php artisan make:mail WelcomeUserMail
\`\`\`

Open \`app/Mail/WelcomeUserMail.php\` and implement the \`content\` and \`envelope\` methods:

\`\`\`php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeUserMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $userName) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to our platform, ' . $this->userName . '!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome',
        );
    }
}
\`\`\`

---

## Method 2: High-Performance Queued Emails

Never block user HTTP requests while establishing SMTP socket handshakes. In Laravel 11, implement the \`ShouldQueue\` contract to push email dispatches to Redis or database queue workers:

\`\`\`php
use Illuminate\Contracts\Queue\ShouldQueue;

class WelcomeUserMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;
    // ...
}
\`\`\`

Dispatch the email in your Controller or Livewire component:

\`\`\`php
use App\Mail\WelcomeUserMail;
use Illuminate\Support\Facades\Mail;

Mail::to($user->email)->queue(new WelcomeUserMail($user->name));
\`\`\`

---

## Method 3: Direct Sendport REST API via Laravel HTTP Client

If you prefer zero SMTP connection overhead and instant sub-20ms HTTP dispatch:

\`\`\`php
use Illuminate\Support\Facades\Http;

$response = Http::withToken(config('services.sendport.key'))
    ->post('https://api.getsendport.com/v1/emails/send', [
        'from'    => 'Acme App <notifications@yourdomain.com>',
        'to'      => [$user->email],
        'subject' => 'Your Verification Code',
        'html'    => view('emails.verification', ['code' => $otp])->render(),
    ]);

if ($response->successful()) {
    $messageId = $response->json('id');
}
\`\`\`

---

## Why Choose Sendport for Laravel?

- **Zero Dropped Connections**: 99.99% uptime with autonomous dedicated VPS MTA fallback.
- **2048-Bit RSA DKIM Out of the Box**: Guarantees Gmail and Yahoo authentication compliance.
- **Real-Time Webhook Streaming**: Track opens, clicks, and hard bounces directly into your Laravel webhooks without 3rd-party polling plugins.
    `,
  },
  {
    slug: "sending-transactional-emails-python-fastapi-guide",
    title: "High-Performance Transactional Email in Python & FastAPI (Zero Dependencies)",
    excerpt:
      "Learn how to build asynchronous, background-safe email dispatches in Python using FastAPI, BackgroundTasks, and Sendport's dedicated edge API.",
    category: "Engineering",
    date: "April 11, 2026",
    readTime: "5 min read",
    author: {
      name: "Sendport Engineering",
      role: "Infrastructure Team",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    },
    tags: ["Python", "FastAPI", "Async Email", "aiosmtplib", "Sendport API", "Backend Engineering"],
    content: `
## Introduction

Modern Python web applications built with **FastAPI**, **Starlette**, or **AIOHTTP** operate on an asynchronous event loop (\`asyncio\`). Synchronous SMTP dispatches block the event loop, severely throttling API throughput and degrading response latency.

In this guide, we'll demonstrate two optimal ways to dispatch transactional emails in Python:
1. **Asynchronous REST API via HTTPX & BackgroundTasks** (Recommended)
2. **Direct SMTP Relay via aiosmtplib**

---

## Method 1: Async HTTP REST Dispatches via HTTPX (Fastest)

Install \`httpx\` for non-blocking asynchronous HTTP requests:

\`\`\`bash
pip install httpx fastapi uvicorn
\`\`\`

### Creating the Email Service Module (\`email_service.py\`)

\`\`\`python
import os
import httpx
import logging

SENDPORT_API_KEY = os.getenv("SENDPORT_API_KEY", "sp_live_your_key_here")
SENDPORT_API_URL = "https://api.getsendport.com/v1/emails/send"

logger = logging.getLogger("sendport_mailer")

async def send_transactional_email(to_email: str, subject: str, html_content: str):
    headers = {
        "Authorization": f"Bearer {SENDPORT_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "from": "Acme Notifications <notifications@yourdomain.com>",
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(SENDPORT_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            logger.info(f"✅ Email delivered to {to_email}. Message ID: {data.get('id')}")
            return data
        except httpx.HTTPError as err:
            logger.error(f"❌ Failed to dispatch email to {to_email}: {err}")
            return None
\`\`\`

---

## Method 2: Integrating with FastAPI BackgroundTasks

Never make user registration or checkout endpoints wait for network I/O. Use FastAPI's \`BackgroundTasks\` to fire-and-forget:

\`\`\`python
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel, EmailStr
from email_service import send_transactional_email

app = FastAPI(title="Acme SaaS Backend")

class UserSignup(BaseModel):
    name: str
    email: EmailStr

@app.post("/v1/auth/signup")
async def signup_user(payload: UserSignup, background_tasks: BackgroundTasks):
    # 1. Save user to database (PostgreSQL / SQLite)
    # user = await db.create_user(payload.dict())

    # 2. Schedule non-blocking welcome email dispatch
    welcome_html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Welcome to Acme, {payload.name}!</h2>
        <p>Your workspace is ready. Click below to verify your email address:</p>
        <a href="https://yourdomain.com/verify" style="background: #f59e0b; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Verify Account</a>
    </div>
    """

    background_tasks.add_task(
        send_transactional_email,
        to_email=payload.email,
        subject=f"Welcome aboard, {payload.name}!",
        html_content=welcome_html
    )

    # 3. Return immediate 201 response to client in sub-10ms
    return {"status": "success", "message": "User created. Welcome email dispatched."}
\`\`\`

---

## Summary & Performance Metrics

| Metric | Traditional Python smtplib | Sendport Async HTTPX |
| :--- | :--- | :--- |
| **API Response Time** | 800ms - 2,500ms (blocking) | **5ms - 15ms** (background) |
| **DKIM Signing** | Manual Python configuration | **Automatic 2048-bit RSA** |
| **Throttle Protection** | Drops connection on 421 | **Built-in Adaptive Pacing** |
| **TLS Encryption** | Requires manual cert validation | **Strict TLS 1.3 End-to-End** |
    `,
  },
];
