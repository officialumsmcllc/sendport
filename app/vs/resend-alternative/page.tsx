"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, X, ArrowRight, Zap, ShieldCheck, DollarSign, Globe, Sparkles, ChevronDown } from "lucide-react";

export default function ResendAlternativePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const comparison = [
    { feature: "Growth Plan Volume ($20/mo)", sendport: "90,000 emails/mo (3,000/day)", resend: "30,000 emails/mo (1,000/day)", note: "3x more volume for $20" },
    { feature: "Verified Sending Domains ($20)", sendport: "Up to 5 Custom Domains", resend: "Domain add-on fees", note: "Multi-project flexibility" },
    { feature: "Automated 30-Day Domain Warmup", sendport: "Built-in (Automated Curve)", resend: "Manual / Enterprise only", note: "Protects new domain reputation" },
    { feature: "Live Spam Score & Content Tester", sendport: "1-Click Diagnostic (Included)", resend: "Not Available", note: "Tests 40+ filters before sending" },
    { feature: "Pre-Flight Link 404 Checker", sendport: "Built-in Automated Scanner", resend: "Not Available", note: "Stops broken links" },
    { feature: "Multi-Currency & Regional Rails", sendport: "USD, PKR, EUR, GBP, USDT, Easypaisa, Raast", resend: "USD Only (Stripe Card)", note: "Frictionless global billing" },
    { feature: "Audience Marketing Contact Fees", sendport: "$0 Extra (Included in plan)", resend: "Billed separately per 1k contacts", note: "No surprise contact bills" },
    { feature: "2048-bit RSA DKIM & DMARC", sendport: "Automatic 1-Click DNS", resend: "Supported", note: "Equal cryptographic strength" },
    { feature: "React Email & Tailwind Support", sendport: "Full Support (@react-email)", resend: "Full Support", note: "Drop-in code compatibility" },
    { feature: "Inbound Email Webhook Parsing", sendport: "Included Free", resend: "Supported", note: "Receive replies as JSON" },
  ];

  const faqs = [
    {
      q: "Why are developers switching from Resend to Sendport in 2026?",
      a: "Developers switch to Sendport for three main reasons: (1) 3x higher monthly sending limits on the $20 tier (90,000 emails/mo vs 30,000 on Resend), (2) zero extra fees for audience marketing contacts, and (3) integrated deliverability tools including automated 30-day warmup and a real-time spam score tester.",
    },
    {
      q: "Can I migrate my existing React Email templates from Resend to Sendport?",
      a: "Yes! Sendport has 100% native support for React Email (@react-email/components). You can copy and paste your existing email code without changing your frontend styling or JSX components.",
    },
    {
      q: "How does Sendport compare with Resend for international payments?",
      a: "Resend requires a US-compatible credit card via Stripe in USD. Sendport supports global cards alongside local bank wires, regional mobile wallets (Easypaisa, JazzCash, Raast), and Crypto USDT with instant activation.",
    },
    {
      q: "Does Sendport include automated domain warmup like Resend Enterprise?",
      a: "Yes! Every Sendport account includes our automated 30-day domain warmup progression schedule that gradually ramps your sending volume from Day 1 to Day 30 to guarantee maximum inbox placement on Gmail and Outlook.",
    },
  ];

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: "Sendport Email API",
        description: "Modern developer-first transactional email API with 2048-bit DKIM, automated warmup, and 90,000 emails/mo for $20.",
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
          reviewCount: "840",
          bestRating: "5",
        },
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
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar dark={true} />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Hero */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full border border-primary-500/30 bg-primary-500/10 text-xs font-bold text-primary-400 uppercase tracking-wider">
              Honest Side-by-Side Comparison
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Looking for a Resend Alternative?
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Why engineering teams and fast-growing startups choose Sendport over Resend for 3x higher volume, built-in 30-day warmup, and global payment options.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-200 transition shadow-lg flex items-center gap-2"
              >
                Start Sending Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/playground"
                className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition border border-slate-800"
              >
                Explore API Playground
              </Link>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 border-b border-slate-800 bg-slate-900/60 p-4 text-xs font-bold uppercase tracking-wider text-slate-300">
              <div className="col-span-5 sm:col-span-4">Feature / Capability</div>
              <div className="col-span-4 sm:col-span-4 text-primary-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Sendport
              </div>
              <div className="col-span-3 sm:col-span-4 text-slate-400">Resend.com</div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {comparison.map((item) => (
                <div key={item.feature} className="grid grid-cols-12 p-4 text-xs hover:bg-slate-900/30 transition-colors items-center">
                  <div className="col-span-5 sm:col-span-4 font-medium text-slate-200">
                    {item.feature}
                    <span className="block text-[10px] text-slate-500 font-normal sm:hidden">{item.note}</span>
                  </div>
                  <div className="col-span-4 sm:col-span-4 text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{item.sendport}</span>
                  </div>
                  <div className="col-span-3 sm:col-span-4 text-slate-400 font-normal">
                    {item.resend}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High-Impact Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">3x More Volume for $20</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Resend gives you 30,000 emails/month on their $20 plan. Sendport delivers 90,000 emails/month (3,000/day) with up to 5 verified domains.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
              <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-400 w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Automated 30-Day Warmup</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                New domains get automatic warmup progression and real-time spam score diagnostics, avoiding Gmail/Outlook spam traps from Day 1.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Global & Regional Rails</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pay with global Cards, Bank Wire, Crypto USDT, or regional mobile wallets (Easypaisa, JazzCash, Raast) with instant receipt verification.
              </p>
            </div>
          </div>

          {/* FAQ Accordion Section for On-Page SEO Depth */}
          <div className="space-y-6 pt-6 border-t border-slate-800">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Frequently Asked Questions: Resend vs Sendport</h2>
              <p className="text-xs text-slate-400">Everything you need to know before migrating to Sendport.</p>
            </div>

            <div className="space-y-3 max-w-3xl mx-auto">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="p-4 pt-0 text-xs text-slate-400 border-t border-slate-900 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
