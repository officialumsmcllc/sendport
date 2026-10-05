"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, X, ArrowRight, Zap, ShieldCheck, DollarSign, Sparkles } from "lucide-react";

export default function SendgridAlternativePage() {
  const comparison = [
    { feature: "API Speed & Latency", sendport: "< 10ms Global Edge", sendgrid: "150ms - 400ms Legacy Queue" },
    { feature: "Modern React Email", sendport: "Native First-Class Support", sendgrid: "Legacy Handlebars / Raw HTML" },
    { feature: "Free Domain DKIM Verification", sendport: "Instant 1-Click DNS Lookup", sendgrid: "Complex Multi-Step CNAME setup" },
    { feature: "Developer UI / UX", sendport: "Clean Dark Resend Aesthetic", sendgrid: "Cluttered Legacy Twilio Console" },
    { feature: "Link Health Diagnostic", sendport: "Built-in Pre-Flight Scanner", sendgrid: "Paid 3rd party add-on" },
    { feature: "Regional Payment Rails", sendport: "Easypaisa, Raast, Crypto USDT, Cards", sendgrid: "Credit Card Only" },
    { feature: "Account Setup Time", sendport: "< 60 seconds (Instant)", sendgrid: "24-48h manual account review" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="px-3 py-1 rounded-full border border-primary-500/30 bg-primary-500/10 text-xs font-semibold text-primary-400">
              Modern Email vs Legacy Twilio
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Looking for a SendGrid Alternative?
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Tired of slow legacy API queues, account suspensions, and complex pricing? Discover why engineering teams are leaving SendGrid for Sendport.
            </p>
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

          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950 text-center space-y-4">
            <h3 className="text-xl font-bold text-white">Ready for a 10x better email experience?</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Set up your first domain and send your first API email in less than 2 minutes.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-xs font-semibold text-black hover:bg-slate-200 transition-all shadow-md"
            >
              Start Free (No Credit Card Required)
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer dark={true} />
    </div>
  );
}
