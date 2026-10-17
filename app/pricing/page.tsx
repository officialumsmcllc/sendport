"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { formatPrice, SupportedCurrency, CURRENCIES } from "@/lib/payments/currencies";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Coins,
  Globe,
  Layers,
  Server,
  Lock,
} from "lucide-react";

export default function PricingPage() {
  const [currency, setCurrency] = useState<SupportedCurrency>("USD");

  const plans = [
    {
      id: "STARTER",
      name: "Starter",
      badge: "Free Forever",
      description: "Perfect for indie hackers, side projects, and early stage MVPs.",
      usdPrice: 0,
      dailyQuota: "100 emails / day",
      monthlyTotal: "3,000 emails / mo",
      features: [
        "1 Verified Sending Domain",
        "2048-bit RSA DKIM Signing",
        "Instant SMTP Relay (Port 587/465)",
        "Developer REST API & Webhooks",
        "Real-time Open & Click Tracking",
        "3 Days Email Logs Retention",
        "Community & Discord Support",
      ],
      ctaText: "Get Started Free",
      ctaHref: "/signup",
      popular: false,
    },
    {
      id: "GROWTH",
      name: "Growth",
      badge: "Most Popular",
      description: "Ideal for growing SaaS applications, startups, and e-commerce stores.",
      usdPrice: 20,
      dailyQuota: "3,000 emails / day",
      monthlyTotal: "90,000 emails / mo",
      features: [
        "Up to 5 Verified Custom Domains",
        "Automated 30-Day Domain Warmup",
        "Audience & Contacts Manager (10,000 leads)",
        "Pre-Flight Broken Link Scanner",
        "AI Spam Content Optimizer",
        "30 Days Email Logs Retention",
        "Priority 24/7 Developer Support",
      ],
      ctaText: "Start Growth Plan",
      ctaHref: "/signup",
      popular: true,
    },
    {
      id: "SCALE_PRO",
      name: "Scale Pro",
      badge: "Maximum Throughput",
      description: "For high-volume production platforms, agencies, and enterprise apps.",
      usdPrice: 79,
      dailyQuota: "25,000 emails / day",
      monthlyTotal: "750,000 emails / mo",
      features: [
        "Unlimited Verified Domains",
        "Managed Dedicated Clean IP",
        "BIMI & VMC Blue Checkmark Setup",
        "Spamhaus Blocklist Proactive Alerts",
        "Inbound Webhook Custom Parsers",
        "90 Days Email Logs Retention",
        "99.99% SLA & Dedicated Slack Channel",
      ],
      ctaText: "Start Scale Pro",
      ctaHref: "/signup",
      popular: false,
    },
  ];

  const creditPacks = [
    { name: "Starter Boost", credits: 10000, price: 10, popular: false },
    { name: "Volume Pack", credits: 30000, price: 25, popular: true },
    { name: "Scale Pack", credits: 100000, price: 75, popular: false },
  ];

  const faqs = [
    {
      q: "Can I use Sendport completely free forever?",
      a: "Yes! Our Starter plan provides 100 transactional emails every single day (3,000 emails/month) with zero credit card required. It includes 2048-bit RSA DKIM signing, SMTP relay, and full REST API access.",
    },
    {
      q: "What happens if I exceed my daily limit?",
      a: "If you hit your daily allowance, additional sends can draw from your non-expiring Top-Up Credits balance. Alternatively, you can upgrade your plan anytime from your dashboard for instant capacity increases.",
    },
    {
      q: "Do you support WordPress, WooCommerce, and Shopify?",
      a: "Yes! Sendport provides an official WordPress plugin and instant SMTP credentials (Port 587 / 465) that work drop-in with any WordPress SMTP plugin, WooCommerce store, or custom backend.",
    },
    {
      q: "How does the 30-Day Domain Warmup work?",
      a: "On Growth and Scale Pro tiers, our system automatically paces your volume across our warm IP pool according to RFC deliverability best practices, ensuring fresh domains establish high sender reputation with Gmail, Yahoo, and Outlook.",
    },
    {
      q: "What payment methods do you support?",
      a: "We support major credit/debit cards, as well as direct local bank transfers and Crypto (USDT TRC20/BEP20) for global customers. Pricing is automatically localized into USD, EUR, GBP, AED, SAR, and PKR.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} activeCurrency={currency} onCurrencyChange={setCurrency} />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-xs font-semibold text-primary-400">
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              Transparent, Developer-First Pricing
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Start Free. Scale Without Limits.
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              No surprise overage bills. Generous daily limits, 2048-bit DKIM authentication, and localized multi-currency billing.
            </p>

            {/* Currency Switcher */}
            <div className="pt-4 flex items-center justify-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Billing Currency:</span>
              <div className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold border border-slate-800 bg-slate-900 text-slate-200">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
                  className="bg-transparent text-xs font-semibold outline-none cursor-pointer text-white"
                  aria-label="Select currency"
                >
                  {Object.keys(CURRENCIES).map((code) => (
                    <option key={code} value={code} className="bg-slate-900 text-white">
                      {code} ({CURRENCIES[code as SupportedCurrency].symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl bg-slate-950 p-8 flex flex-col justify-between shadow-2xl transition-all relative ${
                  p.popular
                    ? "border-2 border-primary-500 shadow-primary-500/10"
                    : "border border-slate-800 hover:border-slate-700"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-4 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                    {p.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">{p.name}</h2>
                    {!p.popular && (
                      <span className="text-[10px] font-semibold text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{p.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">
                      {p.usdPrice === 0 ? "Free" : formatPrice(p.usdPrice, currency)}
                    </span>
                    <span className="text-xs text-slate-500">/ month</span>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Daily Allowance:</span>
                    <span className="font-bold text-emerald-400">{p.dailyQuota}</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-slate-300">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={p.ctaHref}
                  className={`mt-8 block w-full py-3.5 rounded-xl text-center text-xs font-bold transition-all shadow-md ${
                    p.popular
                      ? "bg-white text-black hover:bg-slate-200"
                      : "border border-slate-800 bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {p.ctaText} →
                </Link>
              </div>
            ))}
          </div>

          {/* Pay-As-You-Go Credits Section */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 sm:p-12 max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                  <Coins className="w-3.5 h-3.5" /> Never Expiring Top-Up Credits
                </div>
                <h2 className="text-2xl font-extrabold text-white">Need Occasional Spike Volume?</h2>
                <p className="text-xs text-slate-400 max-w-xl">
                  Purchase standalone credit packs that stay in your reserve balance forever. Whenever you exceed your daily plan limit, sends automatically draw from your credits without interruptions.
                </p>
              </div>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors whitespace-nowrap"
              >
                Top Up from Dashboard →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              {creditPacks.map((pack) => (
                <div
                  key={pack.name}
                  className={`p-5 rounded-2xl border text-center relative ${
                    pack.popular
                      ? "border-amber-500/50 bg-amber-500/5"
                      : "border-slate-800 bg-slate-900/40"
                  }`}
                >
                  {pack.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                      Best Value
                    </span>
                  )}
                  <p className="text-sm font-bold text-white">{pack.name}</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">
                    +{pack.credits.toLocaleString()} <span className="text-xs text-slate-400 font-normal">credits</span>
                  </p>
                  <p className="text-base font-extrabold text-white mt-2">
                    {formatPrice(pack.price, currency)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Non-expiring reserve</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
              <p className="text-xs sm:text-sm text-slate-400">Everything you need to know about Sendport billing and plans.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((f, i) => (
                <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary-400 shrink-0" />
                    {f.q}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">{f.a}</p>
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
