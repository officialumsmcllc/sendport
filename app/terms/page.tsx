// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Legal Terms</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Terms of Service</h1>
            <p className="text-xs text-slate-400 mt-1">Last updated: November 2026 • Sendport Technologies Inc.</p>
          </div>

          <div className="prose prose-invert prose-sm text-slate-300 space-y-6 text-xs sm:text-sm leading-relaxed border-t border-slate-800/80 pt-6">
            <h2 className="text-base font-bold text-white">1. Acceptance of Terms & Services Description</h2>
            <p>
              By creating an account, accessing the dashboard, or dispatching traffic via GetSendport APIs and SMTP relays, you agree to be legally bound by these Terms of Service. GetSendport provides developer-first transactional email delivery, dedicated SMTP infrastructure, email verification tools, and REST API services operated by Sendport Technologies Inc.
            </p>

            <h2 className="text-base font-bold text-white">2. Acceptable Use & Anti-Spam Compliance</h2>
            <p>
              GetSendport operates a zero-tolerance policy against spam, phishing, credential harvesting, malware, and illegal commercial solicitations. All users must comply with the CAN-SPAM Act, GDPR, and CASL regulations:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Purchased, rented, scraped, or third-party email lists are strictly prohibited.</li>
              <li>Outbound emails must include valid recipient opt-in consent and a working one-click unsubscribe mechanism.</li>
              <li>Spam complaint thresholds must remain below 0.08%. Excessive abuse will result in immediate suspension without prior notice.</li>
            </ul>

            <h2 className="text-base font-bold text-white">3. Payments, Billing & Cryptocurrency (Web3) Gateway</h2>
            <p>
              GetSendport supports credit cards (via Stripe) and automated cryptocurrency settlements (via Cryptomus, supporting USDT TRC20/BEP20/Polygon, BTC, ETH, TON, and Solana).
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Monthly plans (Growth and Scale Pro) renew automatically every 30 days unless canceled by the user.</li>
              <li>Pay-as-you-go credit packs never expire and are added to your workspace reserve immediately upon blockchain payment confirmation.</li>
              <li>All prices are quoted and billed in USD, with real-time conversion rates applied for cryptocurrency deposits.</li>
            </ul>

            <h2 className="text-base font-bold text-white">4. Refund & Cancellation Rights</h2>
            <p>
              We provide a full <strong>14-Day Money-Back Guarantee</strong> on all first-time subscription plan purchases. You may cancel your subscription at any time without fees or penalties directly through your Billing Dashboard. For comprehensive details on crypto and fiat refunds, please review our official <Link href="/refund" className="text-emerald-400 font-semibold hover:underline">Refund &amp; Cancellation Policy</Link>.
            </p>

            <h2 className="text-base font-bold text-white">5. Service Level Agreement (SLA) & Uptime</h2>
            <p>
              We commit to a 99.99% monthly uptime guarantee for all API and SMTP delivery relays on paid plans. Scheduled maintenance windows will be communicated via our Status page at <Link href="/status" className="text-sky-400 hover:underline">getsendport.com/status</Link>.
            </p>

            <h2 className="text-base font-bold text-white">6. Limitation of Liability</h2>
            <p>
              Sendport Technologies Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the email relay services.
            </p>

            <h2 className="text-base font-bold text-white">7. Contact & Support</h2>
            <p>
              For legal, abuse, or billing inquiries, please contact our team at <a href="mailto:support@getsendport.com" className="text-sky-400 hover:underline">support@getsendport.com</a> or visit our <Link href="/contact" className="text-sky-400 hover:underline">Developer Support Desk</Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer dark={true} />
    </div>
  );
}
