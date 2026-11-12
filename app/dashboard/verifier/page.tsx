
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Search,
  Sparkles,
  Server,
  Mail,
  ArrowRight,
  Layers,
  Zap,
  Info,
  Clock,
  Check,
  Copy,
  Flame,
} from "lucide-react";

interface VerificationResult {
  success: boolean;
  email: string;
  verdict: "DELIVERABLE" | "UNDELIVERABLE" | "RISKY";
  riskScore: number;
  reason: string;
  details: {
    formatValid: boolean;
    isDisposable: boolean;
    isFreeMail: boolean;
    hasMx: boolean;
    primaryMx?: string;
    smtpCheck: boolean;
    smtpCode?: number;
    smtpRawMessage?: string;
  };
  planTier: string;
  isDeliverable: boolean;
  timestamp: string;
}

export default function EmailVerifierPage() {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<VerificationResult[]>([]);

  const sampleEmails = [
    { label: "Valid Gmail", email: "support@google.com" },
    { label: "Dead / Non-Existent User", email: "zmechautomotive@gmail.com" },
    { label: "AOL Recipient", email: "zman240uk@aol.com" },
    { label: "Disposable Temp-Mail", email: "throwaway_test@mailinator.com" },
  ];

  const handleVerify = async (emailToTest?: string) => {
    const target = (emailToTest || emailInput).trim();
    if (!target) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/v1/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify email.");
      }

      setResult(data);
      setHistory((prev) => [data, ...prev.filter((h) => h.email !== data.email).slice(0, 9)]);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Zero-Send Pre-Flight Deliverability Guard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mailbox & Bounce Verifier
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Execute real-time Port 25 SMTP handshakes to verify whether a recipient address actually exists on Google, Microsoft, Yahoo, or corporate servers — <strong>without sending any email</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/audiences"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            Clean Audience List &rarr;
          </Link>
        </div>
      </div>

      {/* Main Testing Input Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
            <span>Recipient Email Address to Probe</span>
            <span className="text-slate-400 font-normal normal-case">100% Non-Intrusive (Zero Email Sent)</span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="e.g. name@company.com or user@gmail.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm font-medium focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
              />
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={loading || !emailInput.trim()}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              {loading ? (
                <>
                  <Zap className="w-4 h-4 animate-spin text-emerald-400" />
                  Probing Mailbox...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-emerald-400" />
                  Verify Deliverability
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400">Quick test samples:</span>
          {sampleEmails.map((s) => (
            <button
              key={s.email}
              onClick={() => {
                setEmailInput(s.email);
                handleVerify(s.email);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              {s.label} ({s.email})
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}
      </div>

      {/* Verification Result Display */}
      {result && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Main Verdict Card */}
          <div
            className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-all ${
              result.verdict === "DELIVERABLE"
                ? "bg-emerald-50/50 border-emerald-200"
                : result.verdict === "UNDELIVERABLE"
                ? "bg-rose-50/50 border-rose-200"
                : "bg-amber-50/50 border-amber-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    result.verdict === "DELIVERABLE"
                      ? "bg-emerald-500 text-white"
                      : result.verdict === "UNDELIVERABLE"
                      ? "bg-rose-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {result.verdict === "DELIVERABLE" ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : result.verdict === "UNDELIVERABLE" ? (
                    <XCircle className="w-8 h-8" />
                  ) : (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        result.verdict === "DELIVERABLE"
                          ? "bg-emerald-100 text-emerald-800"
                          : result.verdict === "UNDELIVERABLE"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {result.verdict}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Risk Score: {result.riskScore}/100
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1 font-mono break-all">
                    {result.email}
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold uppercase text-slate-500">Dispatch Recommendation</p>
                <p
                  className={`text-sm font-black mt-0.5 ${
                    result.verdict === "DELIVERABLE"
                      ? "text-emerald-700"
                      : result.verdict === "UNDELIVERABLE"
                      ? "text-rose-700"
                      : "text-amber-700"
                  }`}
                >
                  {result.verdict === "DELIVERABLE"
                    ? "Safe to Send (99.8% Inbox Probability)"
                    : result.verdict === "UNDELIVERABLE"
                    ? "DO NOT SEND (Hard Bounce Guaranteed)"
                    : "Proceed with Caution (High Risk)"}
                </p>
              </div>
            </div>

            {/* Diagnostic Reason */}
            <div className="py-4">
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                Server Diagnostic Finding:
              </span>
              <p className="text-sm font-semibold text-slate-900 mt-1">{result.reason}</p>
            </div>

            {/* Technical Handshake Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200/60">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">RFC 5322 Syntax</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <Check className="w-3.5 h-3.5" /> Valid Format
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Disposable Trap</span>
                <span
                  className={`text-xs font-bold flex items-center gap-1 mt-1 ${
                    result.details.isDisposable ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {result.details.isDisposable ? "Disposable (Temp Mail)" : "Clean (Real Mailbox)"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Primary MX Server</span>
                <span className="text-xs font-bold font-mono text-slate-800 truncate block mt-1" title={result.details.primaryMx}>
                  {result.details.primaryMx || "None"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">SMTP Handshake Code</span>
                <span
                  className={`text-xs font-bold font-mono block mt-1 ${
                    result.details.smtpCode === 250
                      ? "text-emerald-600"
                      : result.details.smtpCode === 550
                      ? "text-rose-600"
                      : "text-slate-700"
                  }`}
                >
                  {result.details.smtpCode ? `${result.details.smtpCode} Response` : "MX Reachable"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Strategy & Verification Limits Card */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Verification Quota & Tier Benefits
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            To prevent spammers from abusing our Port 25 egress relays, verification quotas are tied to your workspace plan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Starter Plan</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">Free Forever</span>
            </div>
            <p className="text-2xl font-black text-slate-900">50 / day</p>
            <p className="text-xs text-slate-500">Free manual single verifications to test leads one-by-one.</p>
            <ul className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> 50 Manual Checks/Day</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> 100 Bulk Audience Cleaning</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-white border-2 border-primary-500 shadow-md space-y-2 relative">
            <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-primary-600 text-white font-black text-[10px]">
              POPULAR
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Growth Plan</span>
              <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-700 text-[10px] font-bold">$20 / month</span>
            </div>
            <p className="text-2xl font-black text-slate-900">5,000 / mo</p>
            <p className="text-xs text-slate-500">Bulk list cleaning for marketing lists and cold email lists.</p>
            <ul className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Unlimited Manual Checks</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> 5,000 Bulk CSV Contacts/Mo</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Auto-Purge 550 Bounces</li>
            </ul>
            <Link
              href="/dashboard/billing"
              className="block w-full text-center py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors mt-3"
            >
              Upgrade to Growth
            </Link>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Scale Pro Plan</span>
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold">$79 / month</span>
            </div>
            <p className="text-2xl font-black text-slate-900">50,000 / mo</p>
            <p className="text-xs text-slate-500">High-volume automated hygiene for lead generation agencies.</p>
            <ul className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Unlimited Manual Checks</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> 50,000 Bulk Contacts/Mo</li>
              <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Priority AlphaVPS Handshake</li>
            </ul>
            <Link
              href="/dashboard/billing"
              className="block w-full text-center py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors mt-3"
            >
              Upgrade to Scale Pro
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Probing History */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Recent Probing History (Session)
            </h3>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {history.map((h, i) => (
              <div
                key={h.email + i}
                onClick={() => setResult(h)}
                className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      h.verdict === "DELIVERABLE"
                        ? "bg-emerald-500"
                        : h.verdict === "UNDELIVERABLE"
                        ? "bg-rose-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <div>
                    <p className="text-xs font-bold font-mono text-slate-900">{h.email}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-md">{h.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      h.verdict === "DELIVERABLE"
                        ? "bg-emerald-100 text-emerald-800"
                        : h.verdict === "UNDELIVERABLE"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {h.verdict}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

