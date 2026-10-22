"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/config/site";
import { CURRENCIES, SupportedCurrency, formatPrice } from "@/lib/payments/currencies";
import { HOMEPAGE_FAQS } from "@/lib/content/faqs";
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

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            {/* Centered Floating Diagnostic Cards scoped within max-w-7xl */}
            <div className="hidden xl:flex absolute -left-2 2xl:left-2 top-4 flex-col gap-2 p-3.5 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl animate-float max-w-[210px] pointer-events-none z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold text-white">DKIM Key Active</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">2048-bit RSA · SPF Aligned</p>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full w-full animate-pulse" />
              </div>
            </div>

            <div className="hidden xl:flex absolute -right-2 2xl:right-2 top-4 flex-col gap-2 p-3.5 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl animate-float-slow max-w-[210px] pointer-events-none z-10">
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
                <span className="text-emerald-400 font-bold">High Inbox Placement</span>
              </div>
            </div>
            <div className="text-center space-y-6 max-w-4xl mx-auto">
              {/* Rainbow / Sleek Badge */}
              <div className="inline-flex p-[1px] rounded-full rainbow-border shadow-lg shadow-primary-500/10 hover:scale-105 transition-transform duration-300">
                <div className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-1.5 text-xs font-medium text-slate-200">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Next-Gen Email Infrastructure · Public Beta for Developers</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* Main Heading (Resend Editorial Style) */}
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl sm:leading-[1.05] drop-shadow-sm">
                Email for<br className="hidden sm:inline" />{" "}
                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  developers
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                The best way to reach humans instead of spam folders. Deliver transactional and marketing emails at scale with 2048-bit RSA DKIM signing, SPF and DMARC, and sub-10ms API response time.
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100 Free Emails / Day
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> 1 Free Custom Domain
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" /> Built for High Inbox Placement
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
                <p className="text-3xl sm:text-4xl font-black text-white">{siteConfig.stats.avgLatency}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Average API Response Time</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-emerald-400">{siteConfig.stats.dkimStandard}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Cryptographic Standard</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-white">{siteConfig.stats.freeTierDaily}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Permanent Free Tier</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-sky-400">30-Day</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">Automated Warmup</p>
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

        {/* 7. COMPETITOR COMPARISON SECTION (PageRank & High-Intent Conversion) */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-bold text-primary-400 mb-3 uppercase tracking-wider">
              <span>Honest Side-by-Side Benchmark</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Why Teams Are Leaving Resend & SendGrid
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
              Compare Sendport side-by-side with industry legacy providers and see why developers switch for significantly higher volume, built-in 30-day warmup, and global payment rails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Resend Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hover:border-slate-700 transition">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Sendport vs Resend</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">1.8x More Volume</span>
                </div>
                <h3 className="text-xl font-bold text-white">Looking for a Resend Alternative?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Resend Pro starts at $20/mo for 50,000 emails (checked on October 20, 2026). Sendport gives you 90k emails/month for $20 with automated 30-day warmup and multi-currency billing.*
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/vs/resend-alternative"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-400 hover:text-primary-300 transition"
                >
                  Compare Sendport vs Resend <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* SendGrid Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hover:border-slate-700 transition">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Sendport vs SendGrid</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">Sub-10ms API</span>
                </div>
                <h3 className="text-xl font-bold text-white">Looking for a SendGrid Alternative?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Escape slow queue latencies, abrupt account review suspensions, and cluttered Twilio consoles. Sendport offers instant API keys and modern React Email.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/vs/sendgrid-alternative"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-400 hover:text-primary-300 transition"
                >
                  Compare Sendport vs SendGrid <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Postmark Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hover:border-slate-700 transition">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Sendport vs Postmark</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Unified Engine</span>
                </div>
                <h3 className="text-xl font-bold text-white">Looking for a Postmark Alternative?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Postmark charges $15 for 10k emails. Sendport gives you 90k sends for $20 with unified transactional and marketing capabilities under one roof.*
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/vs/postmark-alternative"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-400 hover:text-primary-300 transition"
                >
                  Compare Sendport vs Postmark <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 text-center mt-6">Competitor information may change. Check their official sites.</p>
        </section>

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
              Zero hidden fees. Generous free tier with 1 custom verified domain included.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 flex flex-col justify-between shadow-2xl hover:border-slate-700 transition-all">
              <div>
                <h3 className="text-xl font-bold text-white">Starter</h3>
                <p className="text-xs text-slate-400 mt-1">Perfect for side projects & indie developers.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">Free</span>
                  <span className="text-xs text-slate-500">forever</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100 emails / day (3,000/mo)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1 Verified Custom Domain</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2048-bit RSA DKIM Signing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Developer REST API & SMTP Relay</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Realtime Webhooks & 3 Days Logs</li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-8 block w-full py-3.5 rounded-xl border border-slate-800 bg-slate-900 text-center text-xs font-semibold text-white hover:bg-slate-800 transition-all"
              >
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
                  <span className="text-4xl font-black text-white">{formatPrice(20, currency)}</span>
                  <span className="text-xs text-slate-500">/mo</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 3,000 emails / day (90,000/mo)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 5 Custom Verified Domains</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Audience & Contact Manager (10k contacts)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated 30-Day Domain Warmup</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Pre-Flight Broken Link Checker & 30 Days Logs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority 24/7 Developer Support</li>
                </ul>
              </div>
              <Link
                href="/signup?plan=growth"
                className="mt-8 block w-full py-3.5 rounded-xl bg-white text-center text-xs font-semibold text-black hover:bg-slate-200 transition-all shadow-md"
              >
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
                  <span className="text-xs text-slate-500">/mo</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 25,000 emails / day (750,000/mo)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Managed Dedicated Clean IP</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> BIMI & VMC Checkmark Advisor</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Spamhaus Blocklist Proactive Monitoring</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 99.99% SLA Guarantee</li>
                </ul>
              </div>
              <Link
                href="/signup?plan=scale_pro"
                className="mt-8 block w-full py-3.5 rounded-xl border border-slate-800 bg-slate-900 text-center text-xs font-semibold text-white hover:bg-slate-800 transition-all"
              >
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
            {HOMEPAGE_FAQS.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden"
                open={i === 0}
              >
                <summary className="w-full p-4 text-left font-semibold text-sm text-white flex items-center justify-between hover:text-primary-400 transition-colors cursor-pointer list-none select-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-900 bg-slate-950">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer dark={true} />
    </div>
  );
}
