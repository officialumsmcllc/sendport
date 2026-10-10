"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, X, ArrowRight, Zap, ShieldCheck, DollarSign, Globe, Sparkles, ChevronDown } from "lucide-react";

export default function MailgunAlternativePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const comparison = [
    { feature: "Starting Tier Monthly Volume", sendport: "90,000 emails for $20/mo", mailgun: "$35/mo minimum (expensive overages)", note: "Save over 55% monthly" },
    { feature: "Overhead & Hidden Fees", sendport: "$0 (Predictable fixed price)", mailgun: "Steep overage charge per 1,000 emails", note: "No billing shock" },
    { feature: "Automated 30-Day Domain Warmup", sendport: "Included on all accounts", mailgun: "Manual / Enterprise only ($1,000+/mo)", note: "Guaranteed primary inbox placement" },
    { feature: "Pre-Flight Spam & 404 Diagnostics", sendport: "1-Click Live AI Spam Score", mailgun: "Paid Add-on only", note: "Test emails before sending" },
    { feature: "Custom Verified Domains", sendport: "Up to 5 on Growth ($20)", mailgun: "Restricted on base tiers", note: "Multi-tenant project isolation" },
    { feature: "Modern Edge REST API & SDKs", sendport: "Sub-50ms latency (Next.js 15 native)", mailgun: "Legacy XML/JSON endpoints", note: "Instant delivery speed" },
    { feature: "Global & Regional Payment Rails", sendport: "USD, PKR, EUR, GBP, USDT, Easypaisa, Raast", mailgun: "USD Credit Card Only", note: "Frictionless global billing" },
    { feature: "2048-bit RSA DKIM & DMARC", sendport: "Automatic 1-Click DNS sync", mailgun: "Supported", note: "Airtight cryptographic authentication" },
    { feature: "Audience Marketing Contact Fees", sendport: "$0 Extra (Included in plan)", mailgun: "Separate contact fees", note: "Zero subscriber tax" },
    { feature: "Inbound Email Webhook Parsing", sendport: "Included Free", mailgun: "Supported", note: "Receive replies as structured JSON" },
  ];

  const faqs = [
    {
      q: "Why are developers and SaaS founders switching from Mailgun to Sendport in 2026?",
      a: "Mailgun has repeatedly raised prices, introducing steep minimums ($35/mo) and punitive overage fees. Sendport offers 90,000 emails/mo for just $20, includes automated 30-day domain warmup, live pre-send spam scoring, and modern SDKs with sub-50ms dispatch latency.",
    },
    {
      q: "How easy is it to migrate from Mailgun SMTP or REST API to Sendport?",
      a: "Migration takes under 5 minutes. You can either swap your SMTP credentials (port 587/465 with 1-click credentials in your Sendport dashboard) or replace the Mailgun API endpoint with our ultra-clean REST API.",
    },
    {
      q: "Does Sendport charge extra for email overages like Mailgun does?",
      a: "No surprise bills. Sendport uses predictable quotas and provides transparent plan switches, so your card is never unexpectedly billed thousands of dollars for viral newsletter spikes.",
    },
    {
      q: "Can I use Sendport for transactional emails and newsletter marketing?",
      a: "Yes! Sendport handles high-volume transactional verification codes, password resets, and marketing campaigns with integrated audience management and zero contact storage fees.",
    },
  ];

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: "Sendport Email API - Best Mailgun Alternative",
        description: "Modern high-deliverability transactional email API with 90,000 emails for $20/mo, automated warmup, and 2048-bit DKIM.",
        brand: { "@type": "Brand", name: "Sendport" },
        offers: [
          {
            "@type": "Offer",
            name: "Starter Free Plan",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
          {
            "@type": "Offer",
            name: "Growth Plan",
            price: "20",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "1240",
          bestRating: "5",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://getsendport.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Alternatives",
            item: "https://getsendport.com/vs/mailgun-alternative",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Mailgun Alternative",
            item: "https://getsendport.com/vs/mailgun-alternative",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/20 selection:text-amber-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Looking for a Mailgun Alternative in 2026?</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Tired of Mailgun’s Price Hikes & Overages? <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              Switch to Sendport. 90,000 Emails for $20.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Mailgun now charges $35/mo with expensive overage fees. Sendport provides 90,000 emails per month, automated 30-day domain warmup, live spam checks, and sub-50ms dispatch latency for just $20/month.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl hover:bg-amber-400 transition-all hover:scale-105 active:scale-95"
            >
              <span>Claim 100 Free Daily Emails</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-3.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <span>Explore 5-Min Migration Guide</span>
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Sub-50ms Global Latency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>2048-bit RSA DKIM Authenticated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Save 55%+ Compared to Mailgun</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-slate-900/30 border-y border-slate-800/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Head-to-Head: Sendport vs. Mailgun
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Clear, transparent comparison between Sendport and Mailgun on performance, deliverability, and cost.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4 sm:p-5">Feature & Deliverability</th>
                    <th className="p-4 sm:p-5 text-amber-400 bg-amber-500/5 font-black">Sendport</th>
                    <th className="p-4 sm:p-5 text-slate-400">Mailgun</th>
                    <th className="p-4 sm:p-5 hidden sm:table-cell">Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {comparison.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 sm:p-5 font-bold text-white">{row.feature}</td>
                      <td className="p-4 sm:p-5 font-bold text-amber-300 bg-amber-500/5">{row.sendport}</td>
                      <td className="p-4 sm:p-5 text-slate-400">{row.mailgun}</td>
                      <td className="p-4 sm:p-5 text-slate-500 hidden sm:table-cell text-xs">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Frequently Asked Questions About Migrating from Mailgun
            </h2>
            <p className="mt-2 text-xs text-slate-400">Everything you need to know about switching without downtime.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA Card */}
          <div className="mt-16 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Ready to Stop Overpaying for Mailgun?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                Join thousands of developers enjoying 90,000 monthly emails for $20 with automated domain warmup and 99.98% deliverability.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-xs font-bold text-slate-950 shadow-lg hover:bg-amber-400 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Get Started Free (No Credit Card)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-xs font-bold text-white hover:bg-slate-700 transition-all"
                >
                  <span>View All Plan Tiers</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
