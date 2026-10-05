"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SendportLogo } from "@/components/brand/Logo";
import { ArrowRight, ShieldCheck, Heart, Sparkles, Globe, Terminal } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-slate-300">
              Our Mission
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Reimagining email for the next generation of builders
            </h1>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
              Email is the backbone of the internet, yet the tools developers used were built decades ago. We founded Sendport to build an uncompromisingly fast, developer-first email platform that pairs modern aesthetics with 99.99% deliverability.
            </p>
          </div>

          {/* Core Values Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            {[
              {
                title: "Obsessive Speed",
                desc: "Every API call should resolve in single-digit milliseconds. No queuing bottlenecks, no sluggish dashboards.",
                icon: Sparkles,
              },
              {
                title: "Cryptographic Trust",
                desc: "We enforce 2048-bit RSA DKIM, DMARC, and SPF by default, guaranteeing pristine inbox reputation for every sender.",
                icon: ShieldCheck,
              },
              {
                title: "Global Accessibility",
                desc: "Developers worldwide should have access to world-class email infrastructure with localized currencies and payment rails.",
                icon: Globe,
              },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400 mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{v.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Join CTA */}
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-white">Ready to join thousands of developers?</h3>
              <p className="text-xs text-slate-400 mt-1">Get started for free today. No credit card required.</p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-xl bg-white px-6 py-2.5 text-xs font-semibold text-black hover:bg-slate-200 transition-all shrink-0"
            >
              Launch Dashboard
            </Link>
          </div>
        </div>
      </main>

      <Footer dark={true} />
    </div>
  );
}
