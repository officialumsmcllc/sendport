"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Terminal, Sparkles } from "lucide-react";

export function EmailReimaginedCta() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 border-t border-slate-900 bg-black text-center">
      {/* Radial lighting spotlight */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[400px] w-[600px] rounded-full bg-gradient-to-t from-primary-950/40 via-sky-950/20 to-transparent blur-3xl pointer-events-none" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
          Email reimagined. <br />
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Available today.
          </span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-xl mx-auto">
          Start sending transactional and marketing emails in minutes. Generous free tier with 3 custom verified domains.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-black shadow-xl hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/docs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-8 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-all shadow-sm"
          >
            <Terminal className="w-4 h-4 text-slate-400" />
            Documentation
          </Link>
        </div>
      </div>
    </section>
  );
}
