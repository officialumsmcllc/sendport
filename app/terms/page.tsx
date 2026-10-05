"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-xs font-semibold text-primary-400">Legal Agreement</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Terms of Service</h1>
            <p className="text-xs text-slate-400 mt-1">Last updated: October 2026</p>
          </div>

          <div className="prose prose-invert prose-sm text-slate-300 space-y-6 text-xs sm:text-sm leading-relaxed">
            <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Sendport APIs, dashboard, or SMTP relays, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.
            </p>

            <h2 className="text-base font-bold text-white">2. Acceptable Use & Anti-Spam Policy</h2>
            <p>
              Sendport maintains a strict zero-tolerance policy towards unsolicited commercial emails (spam), phishing, malware distribution, and purchased email lists. Senders exceeding a 0.08% complaint rate or high hard bounce rate may have sending privileges temporarily suspended.
            </p>

            <h2 className="text-base font-bold text-white">3. API Service Level Agreement (SLA)</h2>
            <p>
              We guarantee 99.99% monthly API availability for paid subscription tiers. Service credits apply in the event of unscheduled downtime as defined in our SLA.
            </p>

            <h2 className="text-base font-bold text-white">4. Billing & Refund Policy</h2>
            <p>
              Subscriptions renew automatically. You may cancel your plan at any time through your dashboard billing portal. Refunds are evaluated on a prorated basis upon support review.
            </p>
          </div>
        </div>
      </main>

      <Footer dark={true} />
    </div>
  );
}
