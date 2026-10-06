"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SendportLogo } from "@/components/brand/Logo";
import { ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowSignupPrompt(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to log in.");
        if (data.error && data.error.includes("registering first")) {
          setShowSignupPrompt(true);
        }
        return;
      }

      // Successful login - redirect based on role or explicit redirect param
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirectTarget = params?.get("redirect");

      if (redirectTarget && redirectTarget.startsWith("/")) {
        router.push(redirectTarget);
      } else if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      {/* Top Header */}
      <div className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="inline-block">
          <SendportLogo size={32} dark={true} />
        </Link>
        <Link
          href="/signup"
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          Don&apos;t have an account? <span className="text-white underline">Sign up</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-500 via-sky-400 to-emerald-400" />

            <div className="space-y-2 mb-6">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Log in to Sendport</h1>
              <p className="text-xs text-slate-400">
                Enter your credentials to access your API keys, domains, and analytics.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
                {showSignupPrompt && (
                  <Link
                    href={`/signup?email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-rose-500/30 px-3 py-1.5 rounded-lg hover:bg-rose-500/50 transition-colors w-full justify-center"
                  >
                    Click here to Register Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <Link
                    href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                    className="text-[11px] text-primary-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-white py-3 text-xs font-bold text-black hover:bg-slate-200 transition-all shadow-md flex items-center justify-center gap-2 mt-6 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Log in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                New to Sendport?{" "}
                <Link href="/signup" className="text-white font-bold hover:underline">
                  Create an account (500 free emails/day)
                </Link>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 2048-bit RSA DKIM
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-sky-400" /> TLS 1.3 Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
