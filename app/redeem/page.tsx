"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Shield, Zap, Sparkles, ArrowRight } from "lucide-react";

export default function RedeemPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setStatus({
            success: false,
            message: "Please sign in or create an account first before redeeming your code.",
          });
        } else {
          setStatus({ success: false, message: data.error || "Failed to redeem code." });
        }
      } else {
        setStatus({ success: true, message: data.message });
        setCode("");
      }
    } catch (err: any) {
      setStatus({ success: false, message: err.message || "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Sendport
            </span>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
              LTD Partner
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-slate-400 hover:text-white transition">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 flex-1 w-full flex flex-col items-center justify-center">
        <div className="text-center max-w-xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" /> AppSumo Lifetime Deal Activation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Redeem Your AppSumo Code
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Enter your AppSumo voucher code below to instantly activate lifetime sending limits on your Sendport workspace.
          </p>
        </div>

        {/* Card */}
        <div className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">
                AppSumo Redemption Code
              </label>
              <input
                type="text"
                placeholder="e.g. SP-LTD-XXXX-XXXX-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono text-sm transition uppercase"
                required
              />
            </div>

            {status && (
              <div
                className={`p-4 rounded-xl text-sm border ${
                  status.success
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/30 text-rose-300"
                }`}
              >
                {status.success ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{status.message}</p>
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 mt-2 font-medium"
                      >
                        Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p>{status.message}</p>
                    {status.message.includes("sign in") && (
                      <div className="mt-2.5 flex items-center gap-3 text-xs">
                        <Link href="/login" className="text-amber-400 underline font-medium">
                          Sign In
                        </Link>
                        <span className="text-slate-600">•</span>
                        <Link href="/signup" className="text-amber-400 underline font-medium">
                          Create Free Account
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              {loading ? "Activating Code..." : "Activate Lifetime License"}
            </button>
          </form>

          {/* Stacking Guide */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Stacking instructions:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li>1 Code = Tier 1 (100 emails/day, 1 domain)</li>
              <li>2 Codes = Tier 2 (3,000 emails/day, 5 domains)</li>
              <li>3 Codes = Tier 3 (25,000 emails/day, unlimited domains)</li>
            </ul>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500" /> 2048-Bit RSA DKIM
          </span>
          <span>•</span>
          <span>Sub-10ms Global Delivery</span>
          <span>•</span>
          <span>Permanent Lifetime Access</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Sendport Inc. All rights reserved.
      </footer>
    </div>
  );
}
