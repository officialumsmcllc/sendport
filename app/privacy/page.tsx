"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-xs font-semibold text-primary-400">Legal & Compliance</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Privacy Policy</h1>
            <p className="text-xs text-slate-400 mt-1">Last updated: October 2026</p>
          </div>

          <div className="prose prose-invert prose-sm text-slate-300 space-y-6 text-xs sm:text-sm leading-relaxed">
            <p>
              Sendport Technologies Inc. (&ldquo;Sendport&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) is committed to protecting your privacy and ensuring the security of transactional and marketing email data.
            </p>

            <h2 className="text-base font-bold text-white">1. Data We Process</h2>
            <p>
              When you use Sendport APIs, we process email metadata (recipient addresses, sender domain, timestamp, delivery status, and bounce events) strictly to provide deliverability routing and telemetry.
            </p>

            <h2 className="text-base font-bold text-white">2. Data Retention & Zero-Data-Selling Guarantee</h2>
            <p>
              We never sell or monetize your contact lists, audience subscribers, or email body contents. Raw email bodies are automatically purged after 30 days unless extended log retention is enabled on your plan.
            </p>

            <h2 className="text-base font-bold text-white">3. GDPR & CAN-SPAM Compliance</h2>
            <p>
              Sendport provides automated 1-click unsubscribe headers (<code className="text-primary-300 font-mono">List-Unsubscribe</code>), suppression list enforcement, and full data deletion APIs compliant with European Union GDPR articles.
            </p>

            <h2 className="text-base font-bold text-white">4. Encryption Standards</h2>
            <p>
              All data in transit is encrypted using TLS 1.3. API keys and SMTP credentials are stored using salted cryptographic hashes.
            </p>
          </div>
        </div>
      </main>

      <Footer dark={true} />
    </div>
  );
}
