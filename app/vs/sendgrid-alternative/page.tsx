"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, X, ArrowRight, Zap, ShieldCheck, DollarSign, Sparkles, ChevronDown } from "lucide-react";

export default function SendgridAlternativePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const comparison = [
    { feature: "API Speed & Latency", sendport: "< 10ms Global Edge", sendgrid: "150ms - 400ms Legacy Queue" },
    { feature: "Modern React Email", sendport: "Native First-Class Support", sendgrid: "Legacy Handlebars / Raw HTML" },
    { feature: "Free Domain DKIM Verification", sendport: "Instant 1-Click DNS Lookup", sendgrid: "Complex Multi-Step CNAME setup" },
    { feature: "Account Setup Time", sendport: "< 60 seconds (Instant API Keys)", sendgrid: "24-48h manual account review & locks" },
    { feature: "Automated 30-Day Domain Warmup", sendport: "Included on Growth ($20)", sendgrid: "Requires expensive Pro / IP plan" },
    { feature: "Live Spam Score & Content Tester", sendport: "Built-in Pre-Flight Tester", sendgrid: "Paid 3rd party add-on" },
    { feature: "Regional Payment Rails", sendport: "Cards, Easypaisa, Raast, Crypto USDT", sendgrid: "US Credit Card Only" },
    { feature: "Developer UI / UX", sendport: "Clean Dark Resend Aesthetic", sendgrid: "Cluttered Legacy Twilio Console" },
    { feature: "Permanent Free Tier", sendport: "100 emails/day Free Forever", sendgrid: "60-day trial only" },
  ];

  const faqs = [
    {
      q: "Why are developers migrating from SendGrid to Sendport?",
      a: "Developers leave SendGrid because of frequent account reviews/locks, slow legacy API response times, lack of React Email support, and confusing Twilio console UI. Sendport offers sub-10ms delivery, instant key generation, modern React components, and transparent pricing.",
    },
    {
      q: "Can I replace SendGrid SMTP relay with Sendport in WordPress or Laravel?",
      a: "Yes! Sendport provides drop-in SMTP credentials (Host: smtp.getsendport.com, Port: 587/465). You can simply swap your SendGrid SMTP password and hostname in WP Mail SMTP or Laravel .env without touching any code.",
    },
    {
      q: "Does Sendport suffer from the sudden account suspensions common on SendGrid?",
      a: "No. Sendport uses automated pre-flight domain authentication (DKIM, SPF, DMARC) and soft-throttling warmup curves to prevent mailbox burn rather than abruptly locking your account during live production campaigns.",
    },
    {
      q: "How fast is Sendport compared to SendGrid?",
      a: "Sendport runs on globally distributed edge nodes with direct MX routing and optimized relay pipelines, delivering sub-10ms API dispatch compared to SendGrid's 150ms-400ms legacy message queues.",
    },
  ];

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: "Sendport Email API (SendGrid Alternative)",
        description: "Modern high-speed transactional email delivery platform with sub-10ms edge dispatch, React Email, and instant SMTP relay.",
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
          reviewCount: "620",
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
            item: "https://getsendport.com/vs/sendgrid-alternative",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "SendGrid Alternative",
            item: "https://getsendport.com/vs/sendgrid-alternative",
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
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar dark={true} />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="px-3.5 py-1 rounded-full border border-primary-500/30 bg-primary-500/10 text-xs font-bold text-primary-400 uppercase tracking-wider">
              Modern Email vs Legacy Twilio
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Looking for a SendGrid Alternative?
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Tired of slow legacy API queues, account suspensions, and complex pricing? Discover why engineering teams are leaving SendGrid for Sendport.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-200 transition shadow-lg flex items-center gap-2"
              >
                Migrate to Sendport Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs"
                className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition border border-slate-800"
              >
                View API Docs
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 border-b border-slate-800 bg-slate-900/60 p-4 text-xs font-bold uppercase tracking-wider text-slate-300">
              <div className="col-span-5 sm:col-span-4">Feature / Metric</div>
              <div className="col-span-4 sm:col-span-4 text-primary-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Sendport
              </div>
              <div className="col-span-3 sm:col-span-4 text-slate-400">Twilio SendGrid</div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {comparison.map((item) => (
                <div key={item.feature} className="grid grid-cols-12 p-4 text-xs hover:bg-slate-900/30 transition-colors items-center">
                  <div className="col-span-5 sm:col-span-4 font-medium text-slate-200">{item.feature}</div>
                  <div className="col-span-4 sm:col-span-4 text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{item.sendport}</span>
                  </div>
                  <div className="col-span-3 sm:col-span-4 text-slate-400 flex items-center gap-1.5">
                    <span className="text-rose-400 font-mono text-[11px]">{item.sendgrid}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Accordion Section for On-Page SEO Depth */}
          <div className="space-y-6 pt-6 border-t border-slate-800">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Frequently Asked Questions: SendGrid vs Sendport</h2>
              <p className="text-xs text-slate-400">Common questions about migrating your transactional email from SendGrid.</p>
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
