"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Rocket,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Flame,
  Code2,
  Users,
  Globe,
  Terminal,
  Clock,
  Send,
  Loader2,
  Mail,
  AlertCircle,
} from "lucide-react";

export default function StartupsPage() {
  const [email, setEmail] = useState("");
  const [startupName, setStartupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Submit to waitlist
    try {
      await fetch("/api/startups/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupName: startupName || "Waitlist Applicant",
          website: "https://waitlist.pending",
          founderEmail: email,
          currentProvider: "Waitlist",
          useCase: "Waitlist - Program Paused",
        }),
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30">
      <Navbar dark={true} />

      {/* HERO SECTION - INACTIVE / PAUSED STATUS */}
      <section className="relative overflow-hidden pt-32 pb-24 border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.1),rgba(255,255,255,0))] pointer-events-none" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Status Badge: PAUSED / CLOSED */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 mb-8 backdrop-blur-md">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Applications Currently Paused • Cohort Closed</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
            Sendport for Startups Program
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl leading-relaxed">
            The $1,000 credit startup acceleration program is currently at capacity and temporarily paused. 
            We are not accepting active credit applications at this moment.
          </p>

          {/* PAUSED BANNER NOTICE */}
          <div className="mt-10 mx-auto max-w-2xl rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 text-left flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-white">Program Status: Inactive</h3>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                Our founders cohort review is closed. You can still use Sendport's permanent free tier 
                (500 emails/day free forever) or join the waitlist below to get notified when the next credit batch opens.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span>Start with Free Tier (500 emails/day)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/#pricing"
                  className="inline-flex items-center gap-2 text-xs font-medium border border-slate-700 hover:bg-slate-800 text-slate-300 px-4 py-2 rounded-lg transition-colors"
                >
                  View Standard Pricing
                </Link>
              </div>
            </div>
          </div>

          {/* WAITLIST LEAD CAPTURE */}
          <div className="mt-14 max-w-xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Join Next Cohort Waitlist</h3>
            <p className="text-xs text-slate-400 mb-6">
              Drop your email to receive priority invitation when the next startup booster batch reopens.
            </p>

            {submitted ? (
              <div className="py-6 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-white">You're on the priority waitlist!</h4>
                <p className="text-xs text-slate-400">
                  We will notify you via email as soon as new accelerator spots open up.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Company / Project Name</label>
                  <input
                    type="text"
                    required
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    placeholder="e.g. Acme Tech"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@acme.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 text-sm transition-colors"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="h-4 w-4 text-amber-400" />
                      <span>Notify Me When Program Reopens</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer dark={true} />
    </div>
  );
}
