"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/config/site";
import { CURRENCIES, SupportedCurrency, formatPrice } from "@/lib/payments/currencies";
import { CodePlayground } from "@/components/landing/CodePlayground";
import { ReactEmailPlayground } from "@/components/landing/ReactEmailPlayground";
import { WebhookSimulator } from "@/components/landing/WebhookSimulator";
import { AudienceWidget } from "@/components/landing/AudienceWidget";
import { DeliverabilityGrid } from "@/components/landing/DeliverabilityGrid";
import { TestimonialWall } from "@/components/landing/TestimonialWall";
import { EmailReimaginedCta } from "@/components/landing/EmailReimaginedCta";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Terminal,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const [currency, setCurrency] = useState<SupportedCurrency>("USD");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Sendport ensure 99.99% Primary Inbox delivery?",
      a: "Sendport automatically enforces 2048-bit RSA DKIM cryptographic signatures, SPF alignment, DMARC validation, and PTR reverse DNS records on clean static IPs with sub-10ms delivery queues.",
    },
    {
      q: "Can I use Sendport with WordPress, WooCommerce, and Laravel?",
      a: "Yes! In addition to REST API and SDKs, Sendport provides instant SMTP relay credentials (Host: smtp.getsendport.com, Port: 587/465) that connect with any WordPress SMTP plugin or backend framework.",
    },
    {
      q: "Can I write email templates using React and Tailwind?",
      a: "Absolutely. Sendport provides first-class support for React Email (@react-email/components). You can build type-safe, reusable email components and preview them live in your browser.",
    },
    {
      q: "What payment methods are supported for international and regional clients?",
      a: "We support global Credit/Debit Cards via Stripe, PayPal, Wise, Payoneer, direct Bank Wire (IBAN/SWIFT), regional mobile wallets (Easypaisa, JazzCash, Raast), and Crypto USDT (TRC-20 / BEP-20) with instant receipt verification.",
    },
    {
      q: "Is there a free tier for developers?",
      a: "Yes! Our Starter plan is 100% Free Forever, giving you 500 emails/day (15,000/month), 3 verified domains, 2048-bit DKIM signing, live open/click tracking, and full REST API access.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      {/* Top Navbar */}
      <Navbar activeCurrency={currency} onCurrencyChange={setCurrency} dark={true} />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-28">
          {/* Subtle Ambient Radial Glow & Grid Background */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-grid-dark mask-radial opacity-60" />
            <div className="h-[600px] w-[1000px] rounded-full bg-gradient-to-tr from-primary-900/30 via-indigo-900/20 to-sky-900/30 blur-3xl animate-glow" />
          </div>

          {/* Floating Diagnostic Cards for Desktop */}
          <div className="hidden xl:flex absolute left-12 top-1/3 flex-col gap-2 p-3.5 rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-2xl animate-float max-w-[220px] pointer-events-none z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-white">DKIM Key Active</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">2048-bit RSA · SPF Aligned</p>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full w-full animate-pulse" />
            </div>
          </div>

          <div className="hidden xl:flex absolute right-12 top-1/3 flex-col gap-2 p-3.5 rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-2xl animate-float-slow max-w-[220px] pointer-events-none z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Edge Dispatch</span>
              <span className="text-[11px] font-mono font-bold text-emerald-400">8.4 ms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span className="text-[10px] text-slate-300 font-mono">Region: us-east-1</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono flex items-center justify-between">
              <span>Queue: 0 ms</span>
              <span className="text-emerald-400 font-bold">100% Primary</span>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6 max-w-4xl mx-auto">
              {/* Rainbow / Sleek Badge */}
              <div className="inline-flex p-[1px] rounded-full rainbow-border shadow-lg shadow-primary-500/10 hover:scale-105 transition-transform duration-300">
                <div className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-1.5 text-xs font-medium text-slate-200">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Next-Gen Email Infrastructure for AI & Modern Developers</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* Main Heading (Resend Editorial Style) */}
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl sm:leading-[1.05] drop-shadow-sm">
                Email for <br />
                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  developers
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                The best way to reach humans instead of spam folders. Deliver transactional and marketing emails at scale with 2048-bit RSA DKIM and sub-10ms latency.
              </p>

              {/* CTA Buttons (Resend Glass Aesthetic with Shimmer) */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-semibold text-black shadow-xl hover:bg-slate-200 transition-all hover:scale-105 active:scale-95 shimmer-effect"
                >
                  Get started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/docs"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-all shadow-sm"
                >
                  <Terminal className="w-4 h-4 text-slate-400" />
                  Documentation
                </Link>
              </div>

              {/* Key Trust Signals */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 500 Free Emails / Day
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> 3 Free Custom Domains
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" /> 99.99% Primary Inbox Placement
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="border-y border-slate-900 bg-slate-950/40 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-black text-white">{siteConfig.stats.uptime}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Platform Uptime</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-emerald-400">{siteConfig.stats.avgLatency}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Average Dispatch Latency</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-white">{siteConfig.stats.emailsDelivered}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Emails Delivered</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-sky-400">{siteConfig.stats.activeSenders}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Active Developers</p>
              </div>
            </div>
          </div>
        </section>

        {/* 1. CODE PLAYGROUND (MULTI-FRAMEWORK / MULTI-SDK) */}
        <CodePlayground />

        {/* 2. SOCIAL PROOF / TESTIMONIAL WALL & LOGO STRIP */}
        <TestimonialWall />

        {/* 3. REACT EMAIL LIVE PLAYGROUND */}
        <ReactEmailPlayground />

        {/* 4. MODULAR WEBHOOKS & TEST MODE SIMULATOR */}
        <WebhookSimulator />

        {/* 5. AUDIENCES & BROADCAST ANALYTICS */}
        <AudienceWidget />

        {/* 6. DELIVERABILITY & TRUST GRID */}
        <DeliverabilityGrid />

        {/* PRICING SECTION */}
        <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-slate-900">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 mb-3">
              <span>Transparent Developer Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Start free, scale as you grow
            </h2>
            <p className="mt-3 text-base text-slate-400 max-w-lg mx-auto">
              Zero hidden fees. Generous free tier with 3 custom verified domains included.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 flex flex-col justify-between shadow-2xl hover:border-slate-700 transition-all">
              <div>
                <h3 className="text-xl font-bold text-white">Starter</h3>
                <p className="text-xs text-slate-400 mt-1">Perfect for side projects & indie developers.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{formatPrice(0, currency)}</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 500 emails / day (15,000/mo)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 3 Verified Domains</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2048-bit RSA DKIM Signing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Developer REST API & SMTP Relay</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Realtime Webhooks & Live Logs</li>
                </ul>
              </div>
              <Link href="/dashboard" className="mt-8 block w-full py-3.5 rounded-xl border border-slate-800 bg-slate-900 text-center text-xs font-semibold text-white hover:bg-slate-800 transition-all">
                Get Started Free
              </Link>
            </div>

            {/* Growth Plan */}
            <div className="rounded-2xl border-2 border-primary-500 bg-slate-950 p-8 flex flex-col justify-between relative shadow-2xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-3.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                Most Popular
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Growth</h3>
                <p className="text-xs text-slate-400 mt-1">For growing SaaS apps and production businesses.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{formatPrice(29, currency)}</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 5,000 emails / day (50,000/mo)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Custom Domains</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Audience & Contact Manager (10k contacts)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Pre-Flight Broken Link Checker</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Spam Score Reducer</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority 24/7 Developer Support</li>
                </ul>
              </div>
              <Link href="/dashboard" className="mt-8 block w-full py-3.5 rounded-xl bg-white text-center text-xs font-semibold text-black hover:bg-slate-200 transition-all shadow-md">
                Start Growth Plan
              </Link>
            </div>

            {/* Scale Pro Plan */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 flex flex-col justify-between shadow-2xl hover:border-slate-700 transition-all">
              <div>
                <h3 className="text-xl font-bold text-white">Scale Pro</h3>
                <p className="text-xs text-slate-400 mt-1">For high-volume platforms & agencies.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{formatPrice(79, currency)}</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 20,000 emails / day (250,000/mo)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Managed Dedicated Clean IP</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> BIMI & VMC Checkmark Advisor</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Spamhaus Blocklist Proactive Monitoring</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 99.99% SLA Guarantee</li>
                </ul>
              </div>
              <Link href="/dashboard" className="mt-8 block w-full py-3.5 rounded-xl border border-slate-800 bg-slate-900 text-center text-xs font-semibold text-white hover:bg-slate-800 transition-all">
                Upgrade to Scale Pro
              </Link>
            </div>
          </div>
        </section>

        {/* 7. RESEND-STYLE GRAND FINALE CTA ("EMAIL REIMAGINED. AVAILABLE TODAY.") */}
        <EmailReimaginedCta />

        {/* FAQ SECTION */}
        <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-900">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">Everything you need to know about Sendport.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-4 text-left font-semibold text-sm text-white flex items-center justify-between hover:text-primary-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-900 bg-slate-950">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer dark={true} />
    </div>
  );
}
