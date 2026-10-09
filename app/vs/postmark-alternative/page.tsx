"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, X, ArrowRight, Zap, ShieldCheck, DollarSign, Sparkles, ChevronDown } from "lucide-react";

export default function PostmarkAlternativePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const comparison = [
    { feature: "Starting Volume ($15-$20)", sendport: "90,000 emails/mo ($20)", postmark: "10,000 emails/mo ($15)", note: "9x more volume for similar price" },
    { feature: "Marketing & Newsletter Broadcasts", sendport: "Full Support (Integrated)", postmark: "STRICTLY FORBIDDEN (Account Ban)", note: "No dual-vendor requirement" },
    { feature: "Audience Contact Storage", sendport: "Unlimited Audiences ($0 fee)", postmark: "Not Supported", note: "Integrated list manager" },
    { feature: "Automated 30-Day Domain Warmup", sendport: "Built-in Schedule", postmark: "Manual configuration", note: "Step-by-step deliverability" },
    { feature: "Live Spam Score & Content Tester", sendport: "1-Click Diagnostic (Included)", postmark: "Basic SpamCop/DMARC tools", note: "Live 0-100 deliverability scorecard" },
    { feature: "React Email & Tailwind Support", sendport: "Native Support (@react-email)", postmark: "HTML Mustache templates only", note: "Modern DX" },
    { feature: "Payment Rails", sendport: "Cards, Easypaisa, Raast, Crypto USDT", postmark: "Credit Card (USD Only)", note: "Frictionless global billing" },
    { feature: "Permanent Free Developer Tier", sendport: "100 emails/day Free Forever", postmark: "100 emails/month total", note: "Generous developer tier" },
  ];

  const faqs = [
    {
      q: "Can I send marketing newsletters and transactional emails from Sendport?",
      a: "Yes! Unlike Postmark—which strictly bans broadcast marketing emails, newsletters, and promotional announcements—Sendport lets you send both transactional alerts and audience broadcasts under one unified API and dashboard.",
    },
    {
      q: "How does Sendport pricing compare with Postmark?",
      a: "Postmark is notoriously expensive: 10k emails cost $15, 50k emails cost $55, and 300k emails cost $245. On Sendport, our Growth plan gives you 90,000 emails/month for just $20, saving up to 70% while providing superior deliverability tools.",
    },
    {
      q: "Does Sendport match Postmark's 99.9% inbox placement?",
      a: "Yes! Sendport automatically generates and signs 2048-bit RSA DKIM keys, verifies SPF and DMARC alignment, and guides your sending through our automated 30-day warmup engine with sub-10ms delivery speeds.",
    },
    {
      q: "Can I use Sendport with WordPress and SMTP plugins?",
      a: "Yes! Sendport includes instant SMTP relay credentials on port 587 and 465 that connect with any WordPress SMTP plugin, WooCommerce, Ghost, or custom backend framework.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: "Sendport Email API (Postmark Alternative)",
        description: "Modern developer-friendly email infrastructure supporting transactional and marketing emails with 90,000 sends/mo for $20.",
        brand: { "@type": "Brand", name: "Sendport" },
        offers: [
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
          reviewCount: "540",
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
            item: "https://getsendport.com/vs/postmark-alternative",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Postmark Alternative",
            item: "https://getsendport.com/vs/postmark-alternative",
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
              No Dual-Vendor Locks
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Looking for a Postmark Alternative?
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Send transactional notifications and marketing newsletters from one unified platform. Get 9x more volume for $20 with zero dual-vendor headaches.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-200 transition shadow-lg flex items-center gap-2"
              >
                Start Free with Sendport <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/deliverability"
                className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition border border-slate-800"
              >
                Test Deliverability Engine
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 border-b border-slate-800 bg-slate-900/60 p-4 text-xs font-bold uppercase tracking-wider text-slate-300">
              <div className="col-span-5 sm:col-span-4">Feature / Capability</div>
              <div className="col-span-4 sm:col-span-4 text-primary-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Sendport
              </div>
              <div className="col-span-3 sm:col-span-4 text-slate-400">Postmark (ActiveCampaign)</div>
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
                    {item.postmark}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-slate-800">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Frequently Asked Questions: Postmark vs Sendport</h2>
              <p className="text-xs text-slate-400">Why developers are consolidating their email stack onto Sendport.</p>
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
