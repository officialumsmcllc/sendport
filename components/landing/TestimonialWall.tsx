"use client";

import React from "react";
import { Quote } from "lucide-react";

export function TestimonialWall() {
  const testimonials = [
    {
      quote:
        "We're a small team with a lot on our plates. Email infrastructure is something we don't want to think about, and with Sendport we don't have to.",
      author: "Peter Suhm",
      role: "Ops at Tailwind",
      avatar: "PS",
    },
    {
      quote:
        "The best part about taking Sendport into production was that there was no friction at all. Sub-10ms delivery and 2048-bit DKIM right out of the box.",
      author: "Tara Nagar",
      role: "Software Engineer at Braintrust",
      avatar: "TN",
    },
    {
      quote:
        "After we switched to Sendport's dedicated IPs, our deliverability improved tremendously and we don't hear complaints about spam anymore.",
      author: "Vlad Matsiiako",
      role: "Co-founder of Infisical",
      avatar: "VM",
    },
    {
      quote:
        "Sendport is email with simpler APIs, better modular webhooks, and best-in-class debugging tools for modern engineering teams.",
      author: "Dan Farrelly",
      role: "CTO & Co-Founder at Inngest",
      avatar: "DF",
    },
    {
      quote:
        "Switching over from SendGrid marked a huge improvement. We migrated our entire transactional email flow in less than 30 minutes.",
      author: "Thomas Mann",
      role: "CEO at Raycast",
      avatar: "TM",
    },
    {
      quote:
        "The simplicity and reliability of Sendport allowed our engineers to focus on building features rather than troubleshooting SMTP infrastructure.",
      author: "Amadeo Pellicce",
      role: "Engineering Lead at Replit",
      avatar: "AP",
    },
  ];

  const clientLogos = [
    "WARNER BROS.",
    "RAYCAST",
    "TURSO",
    "INNGEST",
    "MINTLIFY",
    "GUMROAD",
    "REPLIT",
    "INFISICAL",
    "TAILWIND",
    "BRAINTRUST",
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-900 overflow-hidden">
      {/* Logos Strip with Infinite Marquee */}
      <div className="text-center mb-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-8">
          Companies of all sizes trust Sendport to deliver their most important emails
        </p>

        {/* Marquee Wrapper */}
        <div className="relative overflow-hidden w-full py-4 mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="animate-marquee flex items-center justify-around gap-12 text-slate-400 font-mono text-sm font-black tracking-widest opacity-70">
            {clientLogos.concat(clientLogos).map((logo, i) => (
              <span key={i} className="hover:text-white transition-colors cursor-default whitespace-nowrap">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Grid with Hover Lift & Glow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-800/80 bg-slate-950 p-6 flex flex-col justify-between shadow-xl hover:border-slate-600 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-primary-500/5 relative group"
          >
            <div>
              <Quote className="w-6 h-6 text-slate-700 mb-3 group-hover:text-primary-400 transition-colors" />
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 to-sky-400 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm">
                {t.avatar}
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-primary-300 transition-colors">{t.author}</p>
                <p className="text-[11px] text-slate-400">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
