"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, MessageSquare, Send, CheckCircle2, Terminal, Globe } from "lucide-react";
import { siteConfig } from "@/lib/config/site";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setTicketNumber(data.ticketNumber || "");
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || "Failed to submit request. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-xs font-semibold my-1">
                    Ticket Ref: {ticketNumber}
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Your request has been logged in our engineering queue. Our lead deliverability engineer will respond directly to <span className="text-white font-mono">{email}</span> from <span className="text-sky-400 font-mono">support@getsendport.com</span>.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setSubject("");
                      setMessage("");
                      setTicketNumber("");
                    }}
                    className="mt-4 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
                      <span>⚠️</span> {errorMessage}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Name (Optional)</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                      />
                    </div>
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
                    disabled={submitting}
                    className="w-full rounded-xl bg-white py-3 text-xs font-semibold text-black hover:bg-slate-200 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Dispatching to Engineering...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Submit Request
                      </>
                    )}
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
                <Link href="/docs" className="text-xs font-semibold text-emerald-400 hover:underline block pt-1">
                  Explore Documentation & Playground →
                </Link>
              </div>

              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-3">
                <div className="flex items-center gap-2.5 text-white font-bold text-xs">
                  <Globe className="w-4 h-4 text-sky-400" /> Official Channels & Community
                </div>
                <p className="text-xs text-slate-400">
                  Follow official product announcements, changelog updates, and engineering deep dives:
                </p>
                <div className="space-y-2 pt-1">
                  <a
                    href={siteConfig.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-850 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900 transition-all text-xs text-slate-300 hover:text-white group"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <svg className="w-4 h-4 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.54a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z"/>
                      </svg>
                      LinkedIn Company Page
                    </span>
                    <span className="text-[11px] text-slate-500 group-hover:text-slate-300">Follow →</span>
                  </a>
                  <a
                    href={siteConfig.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-850 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900 transition-all text-xs text-slate-300 hover:text-white group"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <svg className="w-4 h-4 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook Community
                    </span>
                    <span className="text-[11px] text-slate-500 group-hover:text-slate-300">Join →</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer dark={true} />
    </div>
  );
}
