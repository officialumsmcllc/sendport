"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Terminal,
  Sparkles,
  CreditCard,
  Heart,
} from "lucide-react";
import { siteConfig } from "@/lib/config/site";

export function TestimonialWall() {
  const pillars = [
    {
      icon: ShieldCheck,
      badge: "Cryptographic Trust",
      title: "2048-bit RSA DKIM & DMARC",
      desc: "Every domain configured on Sendport is automatically provisioned with 2048-bit RSA keys and strict SPF alignment to protect inbox reputation.",
    },
    {
      icon: Zap,
      badge: "Edge Architecture",
      title: "Sub-10ms API & Direct SMTP",
      desc: "Send transactional dispatches through clean edge nodes. Supports both modern REST endpoints and standard SMTP on ports 587/465.",
    },
    {
      icon: CreditCard,
      badge: "Frictionless Billing",
      title: "Global & Regional Payment Rails",
      desc: "Built for international developers. In addition to Stripe cards, we support direct bank transfers, USDT crypto, and regional mobile wallets.",
    },
    {
      icon: Lock,
      badge: "Developer Freedom",
      title: "Zero Contact Penalties",
      desc: "Store contacts and manage marketing audiences without surprise penalty bills. Transactional and broadcast emails live together seamlessly.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-900 overflow-hidden">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 px-3.5 py-1 text-xs font-semibold text-primary-400 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Sendport Commitment</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Built for builders. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            No compromises, no hidden gotchas.
          </span>
        </h2>
        <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
          We founded Sendport because modern developers deserve fast, reliable email infrastructure with transparent pricing, generous volume, and direct engineering support.
        </p>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {pillars.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800/80 bg-slate-950 p-6 flex flex-col justify-between shadow-xl hover:border-slate-700 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-primary-400 group-hover:border-primary-500/40 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                    {p.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Founder Guarantee & Public Beta Callout Card */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950 p-8 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-3 text-center lg:text-left max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Public Beta · Open to all developers
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Direct access to the core engineering team
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Have a question about DNS records, deliverability warmup, or high-volume sending? 
            Reach out directly to <span className="text-white font-semibold">{siteConfig.founder.name}</span> and the engineering team at{" "}
            <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary-400 hover:underline font-mono">
              {siteConfig.supportEmail}
            </a>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-semibold text-black hover:bg-slate-200 transition-all shadow-md"
          >
            <span>Start Free (100 sends/day)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/docs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-6 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>Read API Reference</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
