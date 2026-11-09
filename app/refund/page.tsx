// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, RefreshCcw, CheckCircle2, Mail, Clock, HelpCircle } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Customer Protection & Billing
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Refund & Cancellation Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Last updated: November 2026 • Official Policy for GetSendport (Sendport Technologies Inc.)
            </p>
          </div>

          {/* Quick Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <RefreshCcw className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">14-Day Guarantee</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full 14-day money-back guarantee for all first-time subscription plan upgrades (Growth & Scale Pro).
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">24-48h Processing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Refund requests are audited and processed by our finance team within 24 to 48 business hours.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Cancel Anytime</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No locked-in contracts. You can downgrade or cancel renewal with one click in your billing settings.
              </p>
            </div>
          </div>

          {/* Detailed Policy Text */}
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 space-y-8 text-xs sm:text-sm leading-relaxed border-t border-slate-800/80 pt-8">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400 font-mono">1.</span> Monthly Subscription Plans (Growth & Scale Pro)
              </h2>
              <p>
                We want you to be completely satisfied with GetSendport&apos;s deliverability, throughput, and developer APIs. If you purchase a monthly subscription (Growth $20/mo or Scale Pro $79/mo) and find that our platform does not suit your operational needs, you are eligible for a <strong>100% full refund within 14 calendar days</strong> of your initial upgrade payment.
              </p>
              <p>
                After the 14-day window, subscriptions are non-refundable for the elapsed period, but you may cancel future billings anytime without penalty.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400 font-mono">2.</span> Pay-As-You-Go Burst Credit Packs
              </h2>
              <p>
                Non-expiring reserve credit packs ($5 for 10,000, $15 for 50,000, $45 for 200,000 emails) never expire and remain in your workspace balance until consumed.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>If the credits have <strong>not been consumed</strong>, a full refund may be issued within 14 days of purchase.</li>
                <li>If a portion of the credits has already been dispatched through our SMTP/API relays, a prorated refund for the unconsumed credits may be granted upon request.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400 font-mono">3.</span> Cryptocurrency & Web3 Payments (Cryptomus)
              </h2>
              <p>
                For payments settled in cryptocurrency via Cryptomus (USDT TRC20/BEP20/Polygon, Bitcoin, Ethereum, TON, Solana, USDC):
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>Refunds for crypto transactions are issued in the exact equivalent USD value at the time of payment confirmation, or in USDT/USDC directly to the sender&apos;s verified wallet address.</li>
                <li>Network blockchain gas fees (miner fees) required for outbound transfers are deducted from the refunded amount where applicable.</li>
                <li>Cryptocurrency refunds require providing the original Transaction Hash (TxHash) for proof of ownership.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400 font-mono">4.</span> Cancellation Procedure
              </h2>
              <p>
                You can cancel your subscription plan at any time:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-400">
                <li>Log in to your SendPort Dashboard at <Link href="/login" className="text-sky-400 hover:underline">getsendport.com/login</Link>.</li>
                <li>Navigate to <strong>Billing &amp; Subscriptions</strong> in the sidebar.</li>
                <li>Click <strong>Downgrade to Starter</strong> or <strong>Cancel Renewal</strong>.</li>
              </ol>
              <p>
                Your active daily limits and features will continue until the end of your prepaid 30-day period, after which your workspace will automatically revert to the Starter tier with zero unexpected charges.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400 font-mono">5.</span> How to Request a Refund
              </h2>
              <p>
                To initiate a refund request, simply reach out to our billing team with your account email address and transaction reference:
              </p>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 font-semibold">Direct Billing Support:</span>
                  <a href="mailto:support@getsendport.com" className="text-sky-400 font-mono hover:underline">
                    support@getsendport.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 font-semibold">Live Ticket Desk:</span>
                  <Link href="/contact" className="text-sky-400 hover:underline">
                    getsendport.com/contact
                  </Link>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Please include your registered email, workspace name, and payment invoice or Transaction ID. Our team will acknowledge and resolve your request within 24 to 48 business hours.
              </p>
            </section>

            <section className="space-y-3 border-t border-slate-800/80 pt-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400 font-mono">6.</span> Policy Exceptions & Abuse Protection
              </h2>
              <p>
                Accounts found to be violating our Anti-Spam Policy (sending unsolicited bulk emails, phishing, malware distribution, or exceeding 0.08% Spamhaus abuse thresholds) that result in immediate suspension are not eligible for refunds.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer dark={true} />
    </div>
  );
}

