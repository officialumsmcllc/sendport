"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Zap,
  ShieldCheck,
  Code2,
  Inbox,
  Sparkles,
  Split,
  Globe,
  Activity,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Lock,
  Layers,
  RefreshCw,
  Server,
} from "lucide-react";

export default function FeaturesPage() {
  const [selectedFeature, setSelectedFeature] = useState(0);

  const pillars = [
    {
      title: "Sub-10ms API Dispatch",
      badge: "Performance",
      description: "Distributed edge email nodes worldwide. Push transactional emails with REST or SDKs in single-digit milliseconds.",
      icon: Zap,
      color: "from-amber-500 to-orange-500",
      code: `// Resend-compatible SDK
import { Sendport } from 'sendport';

const sendport = new Sendport({ apiKey: 'sp_live_...' });

await sendport.emails.send({
  from: 'Your App <onboarding@yourdomain.com>',
  to: ['user@example.com'],
  subject: 'Welcome to our platform',
  react: <WelcomeEmail name="Sarah" />
});`,
    },
    {
      title: "2048-bit RSA DKIM & DMARC",
      badge: "Deliverability",
      description: "Automated cryptographic key generation, strict SPF alignment, and DMARC enforcement guaranteeing Primary Inbox placement.",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-500",
      code: `// Instant Domain DNS Check
curl -X POST https://api.getsendport.com/v1/domains/verify \\
  -H "Authorization: Bearer sp_live_..." \\
  -d '{"domain": "yourdomain.com"}'

// Response:
// { "dkim": "VALID_2048_BIT", "spf": "ALIGNED", "dmarc": "ENFORCED" }`,
    },
    {
      title: "React Email & Tailwind CSS",
      badge: "Developer Experience",
      description: "Build emails with React components and Tailwind CSS. Live browser preview, mobile simulation, and pure HTML export.",
      icon: Code2,
      color: "from-cyan-500 to-blue-500",
      code: `import { Html, Button, Text, Container } from '@react-email/components';

export function InvoiceEmail({ invoiceNumber, total }) {
  return (
    <Html>
      <Container className="bg-slate-900 text-white p-8 rounded-xl font-sans">
        <Text className="text-2xl font-bold">Invoice #{invoiceNumber}</Text>
        <Text className="text-slate-400">Total Due: {total}</Text>
        <Button href="https://yourdomain.com/pay" className="bg-primary-600 px-6 py-3 rounded-lg text-white font-semibold">
          Pay Now
        </Button>
      </Container>
    </Html>
  );
}`,
    },
    {
      title: "Audience & Segment Management",
      badge: "Marketing",
      description: "Store contacts, custom metadata tags, manage unsubscribe headers, and import unlimited subscribers via CSV or REST API.",
      icon: Inbox,
      color: "from-purple-500 to-pink-500",
      code: `// Add Contact to Audience
await sendport.contacts.create({
  audienceId: 'aud_prod_marketing',
  email: 'investor@sequoia.com',
  firstName: 'Roelof',
  lastName: 'Botha',
  tags: ['vip', 'series_a'],
  subscribed: true
});`,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-20 border-b border-slate-800/60">
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
            <div className="h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-primary-900/30 via-indigo-900/20 to-sky-900/20 blur-3xl animate-glow" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold text-slate-300 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary-400" /> Complete Feature Suite
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-3xl mx-auto">
              Everything modern developers need to send email
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
              Engineered from the ground up for blistering delivery speed, rock-solid inbox placement, and an unmatched developer experience.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/dashboard"
                className="rounded-xl bg-white px-6 py-3 text-xs sm:text-sm font-semibold text-black hover:bg-slate-200 transition-all shadow-md"
              >
                Start building for free
              </Link>
              <Link
                href="/docs"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all"
              >
                Read API docs
              </Link>
            </div>
          </div>
        </section>

        {/* Interactive Feature Tabs */}
        <section className="py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Nav List */}
            <div className="lg:col-span-5 space-y-3">
              {pillars.map((p, idx) => {
                const Icon = p.icon;
                const isSelected = selectedFeature === idx;
                return (
                  <button
                    key={p.title}
                    onClick={() => setSelectedFeature(idx)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? "border-primary-500/50 bg-slate-900/90 shadow-lg shadow-primary-500/10"
                        : "border-slate-800/60 bg-slate-950/40 hover:bg-slate-900/40 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg bg-gradient-to-tr ${p.color} text-white`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-white">{p.title}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pl-10">{p.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Right Code Display */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-xs font-mono text-slate-400">
                      {pillars[selectedFeature].title}.ts
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live SDK
                  </span>
                </div>
                <pre className="p-6 text-xs sm:text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed bg-[#06080e]">
                  <code>{pillars[selectedFeature].code}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* 6 Feature Cards Grid */}
        <section className="py-20 border-t border-slate-800/60 bg-slate-950/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Full Platform Capabilities</h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                Everything required for mission-critical SaaS, mobile apps, and high-volume e-commerce.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Pre-Flight Link Checker",
                  desc: "Scan email HTML before sending. Detect broken 404 links, insecure redirects, and phishing flags automatically.",
                  icon: Sparkles,
                },
                {
                  title: "Inbound Email Webhooks",
                  desc: "Parse incoming replies and forwarded emails. Receive structured JSON payloads directly at your webhook endpoints.",
                  icon: Inbox,
                },
                {
                  title: "Automated Warmup Engine",
                  desc: "Gradually ramp up daily volume across 30 days to build pristine IP sender reputation with Gmail and Outlook.",
                  icon: Activity,
                },
                {
                  title: "A/B Subject Variant Testing",
                  desc: "Test multiple subject lines with automated statistical winner dispatch to maximize opens and conversions.",
                  icon: Split,
                },
                {
                  title: "AI Spam & Score Optimizer",
                  desc: "Audit email subject and copy against 200+ spam keywords. Get instant recommendations to ensure 10/10 score.",
                  icon: Lock,
                },
                {
                  title: "Global SMTP Relay",
                  desc: "Compatible with WordPress, WooCommerce, Laravel, Django, and legacy systems over ports 587 and 465.",
                  icon: Server,
                },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/30 hover:border-slate-700/80 transition-all hover:translate-y-[-2px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400 mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* AUDIENCES & CONTACT LISTS SHOWCASE SECTION */}
        <section id="audiences" className="py-20 border-t border-slate-800/60 bg-black/40 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-semibold text-primary-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Audience Infrastructure</span>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  High-Performance Audiences & Segmented Contact Lists
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Manage millions of subscribers with sub-millisecond query filtering. Automatically tracks opt-outs, unsubscribes, bounce suppressions, and engagement tags.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">
                      <strong>Automatic Bounce Suppression:</strong> Hard bounces and spam complaints are automatically isolated to safeguard sender reputation.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">
                      <strong>Custom Metadata & Tags:</strong> Store arbitrary JSON key-value pairs per subscriber for dynamic template personalization.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">
                      <strong>One-Click CSV Imports:</strong> Ingest hundreds of thousands of contacts seamlessly with background stream validation.
                    </span>
                  </div>
                </div>
                <div className="pt-4 flex items-center gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition-all shadow-md"
                  >
                    <span>Create Free Audience</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
                  >
                    <Terminal className="w-3.5 h-3.5 text-primary-400" />
                    <span>Audience API Reference</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-white">Live Audience Metrics</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Total: 48,290 Verified</span>
                  </div>
                  <div className="mt-4 space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-slate-200">Production SaaS Users</span>
                      </div>
                      <span className="text-emerald-400 font-bold">34,120 contacts</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        <span className="text-slate-200">Newsletter Weekly Digest</span>
                      </div>
                      <span className="text-sky-400 font-bold">12,850 contacts</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-slate-200">High-Value Enterprise Leads</span>
                      </div>
                      <span className="text-amber-400 font-bold">1,320 contacts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRE-FLIGHT LINK CHECKER SHOWCASE SECTION */}
        <section id="link-checker" className="py-20 border-t border-slate-800/60 bg-slate-950/70 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="rounded-2xl border border-slate-800 bg-[#080c16] p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                    <span className="text-xs font-mono font-bold text-slate-300">Pre-Flight Link Diagnostic Report</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ALL PASS (100%)
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-300 truncate max-w-[240px]">https://yourdomain.com/login</span>
                      <span className="text-emerald-400 font-bold">200 OK · SSL Valid</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-300 truncate max-w-[240px]">https://yourdomain.com/unsubscribe</span>
                      <span className="text-emerald-400 font-bold">RFC 8058 Compliant</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-300 truncate max-w-[240px]">https://yourdomain.com/pricing</span>
                      <span className="text-emerald-400 font-bold">Fast Redirect (12ms)</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Phishing Blacklist: Clean</span>
                    <span>Zero 404s Detected</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Zero Broken Links Guaranteed</span>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Pre-Flight Email Link Verification & Security Scanning
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Never send an email with broken links or bad redirects again. Sendport automatically crawls and checks all URLs embedded inside your HTML and Markdown templates before dispatching.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">
                      <strong>Instant 404 & Timeout Interception:</strong> Catches broken links before your campaign hits recipient inboxes.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">
                      <strong>HTTPS & SSL Expiry Check:</strong> Ensures all destinations have valid SSL certificates to avoid browser security warnings.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">
                      <strong>Anti-Phishing Reputation Audit:</strong> Tests links against global malware and blacklists to prevent spam score degradation.
                    </span>
                  </div>
                </div>
                <div className="pt-4 flex items-center gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition-all shadow-md"
                  >
                    <span>Test Links Live</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer dark={true} />
    </div>
  );
}
