"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, MessageSquare, Send, CheckCircle2, Terminal } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-slate-300">
              Developer Support & Inquiries
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Get in Touch with Engineering
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Have questions about deliverability, high-volume enterprise limits, or custom payment setups? We typically reply in under 15 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Form */}
            <div className="md:col-span-7 rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-xl">
              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Message Dispatched!</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Our lead deliverability engineer has received your message and will respond directly to <span className="text-white font-mono">{email}</span>.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                    }}
                    className="mt-4 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Work Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Topic</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Dedicated IP warmup for 2M emails/month"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Message Details</label>
                    <textarea
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your architecture, current sending volume, or any custom requirements..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-white py-3 text-xs font-semibold text-black hover:bg-slate-200 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Request
                  </button>
                </form>
              )}
            </div>

            {/* Quick channels */}
            <div className="md:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-2">
                <div className="flex items-center gap-2.5 text-white font-bold text-xs">
                  <Mail className="w-4 h-4 text-primary-400" /> Direct Support Email
                </div>
                <p className="text-xs text-slate-400">
                  Email us directly for security disclosures, API partnerships, and billing questions:
                </p>
                <a href="mailto:support@getsendport.com" className="text-xs font-mono text-primary-400 hover:underline block pt-1">
                  support@getsendport.com
                </a>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-2">
                <div className="flex items-center gap-2.5 text-white font-bold text-xs">
                  <Terminal className="w-4 h-4 text-emerald-400" /> Interactive Playground
                </div>
                <p className="text-xs text-slate-400">
                  Want to verify sending capabilities immediately? Use our in-browser playground.
                </p>
                <Link href="/dashboard/playground" className="text-xs font-semibold text-white hover:underline block pt-1">
                  Launch Playground →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer dark={true} />
    </div>
  );
}
