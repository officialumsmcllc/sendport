"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SendportLogo } from "@/components/brand/Logo";
import { ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account.");
        return;
      }

      // Registration successful -> go to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-primary-500 to-sky-400" />

        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 mb-1">
            <Sparkles className="w-3 h-3" /> Starter Free Tier (500/day)
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create your account</h1>
          <p className="text-xs text-slate-400">
            Start dispatching emails in seconds. No credit card required.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Connor"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@company.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white py-3 text-xs font-bold text-black hover:bg-slate-200 transition-all shadow-md flex items-center justify-center gap-2 mt-5 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span>Creating your workspace...</span>
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-white font-bold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 500 Free Emails / Day
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 3 Custom Domains
        </span>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <div className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="inline-block">
          <SendportLogo size={32} dark={true} />
        </Link>
        <Link
          href="/login"
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          Already have an account? <span className="text-white underline">Log in</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Suspense fallback={<div className="text-xs text-slate-400">Loading signup form...</div>}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
