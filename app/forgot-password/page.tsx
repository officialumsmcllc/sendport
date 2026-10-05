"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SendportLogo } from "@/components/brand/Logo";
import { ArrowRight, Lock, Mail, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [step, setStep] = useState<"REQUEST" | "RESET">("REQUEST");
  const [email, setEmail] = useState(initialEmail);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to find account.");
        return;
      }

      setRecoveryCode(data.recoveryCode || "123456");
      setSuccessMsg(`Recovery code generated: ${data.recoveryCode}`);
      setStep("RESET");
    } catch (err: any) {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }

      setSuccessMsg("Password successfully reset! You can now log in.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError("Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-primary-500 to-sky-400" />

        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {step === "REQUEST" ? "Reset your password" : "Enter new password"}
          </h1>
          <p className="text-xs text-slate-400">
            {step === "REQUEST"
              ? "Enter your registered email address to receive password recovery instructions."
              : `Set a new secure password for ${email}.`}
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success notification */}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === "REQUEST" ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white py-3 text-xs font-bold text-black hover:bg-slate-200 transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-50"
            >
              {loading ? <span>Verifying...</span> : <span>Send Recovery Code</span>}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Recovery Code:</span>
              <span className="font-mono font-bold text-emerald-400 tracking-widest">{recoveryCode}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white py-3 text-xs font-bold text-black hover:bg-slate-200 transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-50"
            >
              {loading ? <span>Updating password...</span> : <span>Update Password & Log In</span>}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
          <Link href="/login" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
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
          Remember your password? <span className="text-white underline">Log in</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Suspense fallback={<div className="text-xs text-slate-400">Loading recovery form...</div>}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
