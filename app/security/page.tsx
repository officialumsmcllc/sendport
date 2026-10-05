"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Lock, Key, Server, CheckCircle2, ArrowRight } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-400">
              Enterprise Trust & Compliance
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Security at Sendport
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              We treat security as our highest engineering priority. Learn how we safeguard your customer data, deliverability reputation, and API keys.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: "2048-Bit RSA DKIM Signatures",
                desc: "Every email is cryptographically signed at the edge using industry-standard 2048-bit RSA keys with full SHA-256 hash validation.",
                icon: ShieldCheck,
              },
              {
                title: "End-to-End TLS 1.3 Encryption",
                desc: "All SMTP transmissions and REST API requests are encrypted in flight using TLS 1.3 with modern forward-secret cipher suites.",
                icon: Lock,
              },
              {
                title: "Role-Based Scoped API Keys",
                desc: "Generate granular API credentials limited to sending only, template management, or domain administration to minimize blast radius.",
                icon: Key,
              },
              {
                title: "Two-Factor Authentication (2FA TOTP)",
                desc: "Protect team accounts with mandatory time-based one-time password (TOTP) hardware tokens and Google Authenticator.",
                icon: Server,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-base font-bold text-white">Manage 2FA & Audit Logs in Dashboard</h3>
              <p className="text-xs text-slate-400 mt-1">Review live sign-in attempts and rotate your authentication keys.</p>
            </div>
            <Link
              href="/dashboard/security"
              className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-slate-200 transition-all shrink-0"
            >
              Open Security Settings →
            </Link>
          </div>
        </div>
      </main>

      <Footer dark={true} />
    </div>
  );
}
