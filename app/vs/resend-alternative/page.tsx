"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, X, ArrowRight, Zap, ShieldCheck, DollarSign, Globe, Sparkles } from "lucide-react";

export default function ResendAlternativePage() {
  const comparison = [
    { feature: "Free Tier Allowance", sendport: "500 emails / day (15,000/mo)", resend: "100 emails / day (3,000/mo)", note: "5x more free volume" },
    { feature: "Verified Domains (Free)", sendport: "3 Custom Domains", resend: "1 Domain", note: "Multi-project flexibility" },
    { feature: "Pre-Flight Broken Link Checker", sendport: "Built-in (Automated)", resend: "Not Available", note: "Stops 404 links before sending" },
    { feature: "Multi-Currency & Global Payments", sendport: "USD, PKR, EUR, GBP, INR, USDT", resend: "USD Only (Stripe)", note: "Local Easypaisa, Raast & Crypto" },
    { feature: "2048-bit RSA DKIM & DMARC", sendport: "Automatic 1-Click DNS", resend: "Supported", note: "Equal cryptographic strength" },
    { feature: "React Email & Tailwind Support", sendport: "Full Support (@react-email)", resend: "Full Support", note: "Drop-in code compatibility" },
    { feature: "Inbound Email Webhook Parsing", sendport: "Included Free", resend: "Supported", note: "Receive replies as JSON" },
    { feature: "Built-in Contact Audiences", sendport: "Unlimited CSV Import", resend: "Basic Audiences", note: "Full marketing contacts management" },
    { feature: "Dedicated IP Warmup Engine", sendport: "30-Day Automated Schedule", resend: "Manual / Enterprise", note: "Step-by-step deliverability" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Hero */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="px-3 py-1 rounded-full border border-primary-500/30 bg-primary-500/10 text-xs font-semibold text-primary-400">
              Honest Side-by-Side Comparison
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Looking for a Resend Alternative?
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Why fast-growing startups and global developer teams choose Sendport over Resend for superior deliverability, higher free limits, and localized billing.
            </p>
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
                  <div className="col-span-3 sm:col-span-4 text-slate-400 flex items-center gap-1.5">
                    {item.resend.includes("Not Available") ? (
                      <X className="w-4 h-4 text-rose-500 shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span>{item.resend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Migration Ease Banner */}
          <div className="p-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-lg font-bold text-white">100% Drop-In Compatible Migration</h3>
              <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                Sendport implements the exact same REST payload schemas and React Email helpers. Switch from Resend by simply changing your API base URL or SDK key.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-xl bg-white px-6 py-3 text-xs font-semibold text-black hover:bg-slate-200 transition-all shadow-md shrink-0 flex items-center gap-2"
            >
              Get Started with 500 Free/Day
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer dark={true} />
    </div>
  );
}
