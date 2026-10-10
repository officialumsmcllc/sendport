"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, X, ArrowRight, Zap, ShieldCheck, DollarSign, Globe, Sparkles, ChevronDown } from "lucide-react";

export default function BrevoAlternativePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const comparison = [
    { feature: "API Dispatch Latency", sendport: "Sub-50ms Global Edge Speed", brevo: "400ms – 1,500ms (Marketing tool latency)", note: "Ultra-fast transactional delivery" },
    { feature: "Starting Tier Volume ($20)", sendport: "90,000 emails/mo (3,000/day)", brevo: "20,000 emails/mo ($25/mo Starter)", note: "4.5x more volume for less money" },
    { feature: "Account Freezes & False Flags", sendport: "Zero automated freeze traps", brevo: "Frequent automated account suspensions", note: "Reliable developer uptime" },
    { feature: "Automated 30-Day Domain Warmup", sendport: "Included on all accounts", brevo: "Not available on basic tiers", note: "Guaranteed primary inbox placement" },
    { feature: "Pre-Flight Spam & 404 Diagnostics", sendport: "Included AI Content & Link Scanner", brevo: "Not Available", note: "Detect spam filters before sending" },
    { feature: "Multi-Currency Regional Billing", sendport: "USD, PKR, EUR, GBP, USDT, Easypaisa, Raast", brevo: "EUR & USD Card Only", note: "Frictionless global payment rails" },
    { feature: "React Email & Next.js 15 Support", sendport: "Native (@react-email/components)", brevo: "Legacy HTML copy-paste only", note: "Modern developer DX" },
    { feature: "Custom Verified Domains", sendport: "Up to 5 on Growth ($20)", brevo: "Domain add-on limitations", note: "Manage multiple projects easily" },
    { feature: "Audience Marketing Contact Fees", sendport: "$0 Extra (Included in plan)", brevo: "Separate contact tiered pricing", note: "Zero contact storage tax" },
    { feature: "2048-bit RSA DKIM & DMARC", sendport: "1-Click Cloudflare DNS sync", brevo: "Supported", note: "Cryptographic email authentication" },
  ];

  const faqs = [
    {
      q: "Why are developers choosing Sendport over Brevo in 2026?",
      a: "Brevo was designed primarily for marketing newsletters, making its transactional email API slow and prone to sudden account suspensions. Sendport is built for developers from the ground up: sub-50ms dispatch latency, 90,000 emails for $20 (compared to 20,000 on Brevo for $25), native React Email support, and automated 30-day warmup.",
    },
    {
      q: "Can I replace Brevo transactional email SMTP with Sendport?",
      a: "Yes! You can instantly migrate by pointing your SMTP settings to smtp.getsendport.com using port 587 or 465 with your Sendport API credentials. Your password resets, order confirmations, and notifications will send immediately.",
    },
    {
      q: "Does Sendport charge extra for stored contacts like Brevo?",
      a: "No! Sendport does not charge a contact tax. All audience lists, lead management, and marketing contact storage are included in your flat monthly subscription.",
    },
    {
      q: "How does Sendport guarantee better inbox placement than Brevo?",
      a: "Sendport uses an automated 30-day domain reputation warmup schedule, 2048-bit RSA DKIM, pre-send spam scoring, and proactive broken link checks to protect your domain from landing in Gmail spam or promotions tabs.",
    },
  ];

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: "Sendport Email API - Best Brevo Alternative",
        description: "High-speed developer email API with sub-50ms latency, automated warmup, and 90,000 emails for $20/mo. Best alternative to Brevo.",
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
          reviewCount: "760",
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
            item: "https://getsendport.com/vs/brevo-alternative",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Brevo Alternative",
            item: "https://getsendport.com/vs/brevo-alternative",
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
            <span>Looking for a Faster, Developer-First Brevo Alternative?</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Fast Transactional Emails Without Brevo’s Lag. <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              4.5x More Volume. Sub-50ms Edge API.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Brevo charges $25/mo for just 20,000 emails with slow API latency and sudden account verification locks. Sendport delivers 90,000 emails for $20 with native React Email support, sub-50ms dispatch, and automated 30-day domain warmup.
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
              <span>Explore REST Documentation</span>
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Sub-50ms Global Edge Latency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Automated 30-Day Domain Warmup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>90,000 Emails for $20 (vs. 20,000 on Brevo)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-slate-900/30 border-y border-slate-800/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Head-to-Head: Sendport vs. Brevo
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Compare speed, deliverability features, and pricing limits between Sendport and Brevo.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4 sm:p-5">Feature & Performance</th>
                    <th className="p-4 sm:p-5 text-amber-400 bg-amber-500/5 font-black">Sendport</th>
                    <th className="p-4 sm:p-5 text-slate-400">Brevo</th>
                    <th className="p-4 sm:p-5 hidden sm:table-cell">Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {comparison.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 sm:p-5 font-bold text-white">{row.feature}</td>
                      <td className="p-4 sm:p-5 font-bold text-amber-300 bg-amber-500/5">{row.sendport}</td>
                      <td className="p-4 sm:p-5 text-slate-400">{row.brevo}</td>
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
              Frequently Asked Questions About Migrating from Brevo
            </h2>
            <p className="mt-2 text-xs text-slate-400">Fast, reliable email delivery for high-growth tech teams.</p>
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
                Switch to Sendport Today & Supercharge Your Deliverability.
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                Enjoy 90,000 monthly emails for $20 with zero contact storage fees and sub-50ms dispatch speed.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-xs font-bold text-slate-950 shadow-lg hover:bg-amber-400 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Claim 100 Free Daily Emails</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-xs font-bold text-white hover:bg-slate-700 transition-all"
                >
                  <span>View All Pricing Plans</span>
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
