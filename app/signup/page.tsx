// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// Sendport Signup & 6-Digit Email Verification Flow (Option B)
// ==============================================================

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SendportLogo } from "@/components/brand/Logo";
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  KeyRound,
  RotateCw,
  ArrowLeft,
} from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || searchParams.get("verify") || "";
  const initialVerify = Boolean(searchParams.get("verify"));
  const planParam = searchParams.get("plan");

  const [step, setStep] = useState<"SIGNUP" | "VERIFY">(initialVerify ? "VERIFY" : "SIGNUP");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Session check
  useEffect(() => {
    if (step === "VERIFY") return;
    const handleRedirect = () => {
      if (planParam && planParam !== "starter") {
        window.location.href = `/dashboard/billing?plan=${encodeURIComponent(planParam)}`;
      } else {
        window.location.href = "/dashboard";
      }
    };

    try {
      const cached = localStorage.getItem("sendport_user");
      if (cached) {
        handleRedirect();
        return;
      }
    } catch (_) {}

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user?.emailVerified) {
          handleRedirect();
        }
      })
      .catch(() => {});
  }, [planParam, step]);

  const getPlanDetails = () => {
    if (planParam === "growth") {
      return {
        label: "Growth Plan (90,000 sends/mo · 5 Domains)",
        badgeClass: "bg-primary-500/10 border-primary-500/30 text-primary-400",
        btnText: "Create Account & Verify",
      };
    }
    if (planParam === "scale_pro" || planParam === "scale-pro") {
      return {
        label: "Scale Pro Plan (750,000 sends/mo · Dedicated IP)",
        badgeClass: "bg-sky-500/10 border-sky-500/30 text-sky-400",
        btnText: "Create Account & Verify",
      };
    }
    return {
      label: "Starter Free Tier (100/day · 1 Domain · Free Forever)",
      badgeClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      btnText: "Create Free Account",
    };
  };

  const planInfo = getPlanDetails();

  // 1. Initial Registration -> Trigger 6-Digit Email Verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

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

      // Transition to 6-Digit Verification Screen (Option B)
      setStep("VERIFY");
      setResendCooldown(60);
      setSuccessMsg(`Confirmation code sent to ${email}. Please check your inbox.`);

      if (data.verificationCode) {
        setDevCodeHint(data.verificationCode);
      }
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit 6-Digit Verification Code -> Activate Workspace & Issue Session
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanCode = verificationCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setError("Please enter the full 6-digit verification code.");
      return;
    }

    setVerifyLoading(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code: cleanCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid verification code.");
        return;
      }

      setSuccessMsg("Account verified successfully! Launching your workspace...");

      // Cache session in localStorage
      try {
        if (data.user) {
          localStorage.setItem("sendport_user", JSON.stringify(data.user));
        }
      } catch (e) {}

      setTimeout(() => {
        if (planParam && planParam !== "starter") {
          window.location.href = `/dashboard/billing?plan=${encodeURIComponent(planParam)}`;
        } else {
          window.location.href = "/dashboard";
        }
      }, 1200);
    } catch (err: any) {
      setError("Failed to verify code. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  // 3. Resend Verification Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setError(null);
    setResendLoading(true);

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend code.");
        return;
      }

      setResendCooldown(60);
      setSuccessMsg("A new 6-digit verification code has been dispatched to your inbox.");

      if (data.verificationCode) {
        setDevCodeHint(data.verificationCode);
      }
    } catch (err: any) {
      setError("Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-primary-500 to-sky-400" />

        {/* STEP 1: INITIAL REGISTRATION FORM */}
        {step === "SIGNUP" ? (
          <>
            <div className="space-y-2 mb-6">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold mb-1 ${planInfo.badgeClass}`}
              >
                <Sparkles className="w-3 h-3" /> {planInfo.label}
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Create your account</h1>
              <p className="text-xs text-slate-400">
                Start dispatching emails in seconds. Real-time inbox verification required.
              </p>
            </div>

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
                  <span>Sending verification code...</span>
                ) : (
                  <>
                    <span>{planInfo.btnText}</span>
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
          </>
        ) : (
          /* STEP 2: 6-DIGIT EMAIL VERIFICATION (OPTION B) */
          <>
            <div className="space-y-2 mb-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Mail className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Verify your email</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                We sent a 6-digit confirmation code to:
                <br />
                <span className="font-mono font-bold text-sky-400">{email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {devCodeHint && (
              <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
                <span>Dev Preview Code: <strong className="font-mono">{devCodeHint}</strong></span>
                <button
                  type="button"
                  onClick={() => setVerificationCode(devCodeHint)}
                  className="text-[11px] underline font-bold hover:text-white"
                >
                  Auto Fill
                </button>
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 text-center">
                  Enter 6-Digit Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold rounded-xl border border-slate-800 bg-slate-900/90 py-3.5 text-white placeholder-slate-700 focus:border-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={verifyLoading || verificationCode.length < 6}
                className="w-full rounded-xl bg-sky-500 py-3 text-xs font-bold text-white hover:bg-sky-400 transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-50"
              >
                {verifyLoading ? (
                  <span>Verifying code...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify &amp; Launch Workspace</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setStep("SIGNUP")}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back / Edit Email
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || resendLoading}
                className="flex items-center gap-1 font-bold text-sky-400 hover:text-sky-300 transition-colors disabled:opacity-40"
              >
                <RotateCw className={`w-3.5 h-3.5 ${resendLoading ? "animate-spin" : ""}`} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100 Free Emails / Day
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 1 Custom Domain
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
