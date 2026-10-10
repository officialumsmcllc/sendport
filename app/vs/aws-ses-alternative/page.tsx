"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, X, ArrowRight, Zap, ShieldCheck, DollarSign, Globe, Sparkles, ChevronDown } from "lucide-react";

export default function AwsSesAlternativePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const comparison = [
    { feature: "Account Activation & Onboarding", sendport: "Instant (Send in 60 seconds)", awsSes: "Strict 'Sandbox Mode' (Days of manual review)", note: "Zero waiting for AWS approval tickets" },
    { feature: "Setup Complexity (DevOps)", sendport: "1-Click API Key or SMTP", awsSes: "Complex IAM Roles, SNS Topics & CloudWatch", note: "No AWS infrastructure overhead" },
    { feature: "Automated 30-Day Domain Warmup", sendport: "Built-in Automatic Curve", awsSes: "Manual (Must script yourself)", note: "Guaranteed primary inbox placement" },
    { feature: "Live Spam Score & Pre-Flight Check", sendport: "Included AI Spam Diagnostics", awsSes: "Not Available (Must build own tools)", note: "Test emails before dispatch" },
    { feature: "Visual Dashboard & Analytics", sendport: "Real-time opens, clicks & latency", awsSes: "Raw SNS/CloudWatch metrics only", note: "Modern developer interface" },
    { feature: "Multi-Currency & Regional Payments", sendport: "USD, PKR, EUR, GBP, USDT, Easypaisa, Raast", awsSes: "AWS Consolidated Billing (USD Credit Card)", note: "Flexible local payment rails" },
    { feature: "Monthly Volume on Growth ($20)", sendport: "90,000 emails/mo", awsSes: "Variable (plus SNS & data transfer add-ons)", note: "Transparent all-inclusive pricing" },
    { feature: "2048-bit RSA DKIM & DMARC", sendport: "1-Click Cloudflare DNS sync", awsSes: "Manual Route 53 CNAME entry", note: "Zero DNS misconfiguration risk" },
    { feature: "Audience Marketing Contact Fees", sendport: "$0 Extra (Included in plan)", awsSes: "Requires separate Amazon Pinpoint", note: "All-in-one transactional & marketing" },
    { feature: "Inbound Email Webhook Parsing", sendport: "Included Free", awsSes: "Requires S3 bucket + Lambda + SNS", note: "Native JSON webhooks without AWS bloat" },
  ];

  const faqs = [
    {
      q: "Why do developers look for an AWS SES alternative?",
      a: "While AWS SES is cheap per email, the hidden engineering cost is immense: developers spend days trying to escape AWS 'Sandbox Mode', setting up IAM permissions, configuring SNS topics for bounces, and building custom warmup scripts. Sendport gives developers instant sending, automated warmup, and live spam diagnostics out of the box.",
    },
    {
      q: "How does Sendport avoid the AWS SES 'Sandbox Mode' wait time?",
      a: "Sendport uses automated domain reputation screening and real-time deliverability checks. Once you verify your domain via DNS, you can immediately begin dispatching production transactional emails without submitting human support tickets to AWS.",
    },
    {
      q: "Can I replace AWS SES SMTP relay with Sendport in my application?",
      a: "Yes! Simply update your SMTP host to smtp.getsendport.com with port 587 or 465 and your Sendport API credentials. Your existing Laravel, Node.js, Django, or Rails app will work immediately.",
    },
    {
      q: "Does Sendport charge for bounce tracking or SNS topics like AWS?",
      a: "No! All bounce tracking, open/click pixel telemetry, and webhook deliveries are completely free and included in your plan with zero micro-billing fees.",
    },
  ];

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: "Sendport Email API - Best AWS SES Alternative",
        description: "Zero AWS Sandbox waiting. Developer-first transactional email API with automated warmup, pre-send spam scoring, and 90,000 emails for $20/mo.",
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
          reviewCount: "980",
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
            item: "https://getsendport.com/vs/aws-ses-alternative",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "AWS SES Alternative",
            item: "https://getsendport.com/vs/aws-ses-alternative",
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
            <span>Looking for an AWS SES Alternative Without the DevOps Pain?</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Stop Fighting the AWS SES Sandbox. <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              Send Production Emails in 60 Seconds.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            AWS SES requires days of waiting for approval tickets, complex IAM permissions, SNS topics for bounces, and manual IP warmup. Sendport gives developers built-in automated 30-day warmup, live spam diagnostics, and 90,000 monthly emails for just $20.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl hover:bg-amber-400 transition-all hover:scale-105 active:scale-95"
            >
              <span>Start Sending in 60 Seconds</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-3.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <span>Explore Quickstart Guide</span>
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Zero Sandbox Review Delays</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Automated 30-Day Domain Warmup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>90,000 Emails for $20 All-Inclusive</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-slate-900/30 border-y border-slate-800/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Head-to-Head: Sendport vs. AWS SES
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Why modern engineering teams choose Sendport over managing complex AWS email infrastructure.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4 sm:p-5">Feature & Experience</th>
                    <th className="p-4 sm:p-5 text-amber-400 bg-amber-500/5 font-black">Sendport</th>
                    <th className="p-4 sm:p-5 text-slate-400">AWS SES</th>
                    <th className="p-4 sm:p-5 hidden sm:table-cell">Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-slate-800/60">
                  {comparison.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 sm:p-5 font-bold text-white">{row.feature}</td>
                      <td className="p-4 sm:p-5 font-bold text-amber-300 bg-amber-500/5">{row.sendport}</td>
                      <td className="p-4 sm:p-5 text-slate-400">{row.awsSes}</td>
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
              Frequently Asked Questions: Replacing AWS SES
            </h2>
            <p className="mt-2 text-xs text-slate-400">Save developer hours and improve inbox deliverability.</p>
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
                Never Deal with AWS Sandbox Requests Again.
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                Join startups and modern developers using Sendport for zero-friction transactional email delivery.
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
                  <span>Explore Pricing Tiers</span>
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
