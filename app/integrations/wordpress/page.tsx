"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Download,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Server,
  Lock,
  Globe,
  Terminal,
} from "lucide-react";

export default function WordPressIntegrationPage() {
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(`// In wp-config.php (Optional constant definition)
define('SENDPORT_API_KEY', 'sk_live_your_api_key_here');`);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Hero Section */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/10 text-xs font-semibold text-sky-400">
              <Zap className="w-3.5 h-3.5" /> Official WordPress & WooCommerce Integration
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Fix WordPress Email Delivery in <span className="text-sky-400">60 Seconds</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Tired of WooCommerce order emails, password resets, and Contact Form 7 messages landing in spam? Replace unreliable native <code className="text-sky-400 font-mono">wp_mail()</code> with Sendport&apos;s 2048-bit RSA DKIM API relay.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a
                href="/downloads/sendport-smtp.zip"
                download="sendport-smtp.zip"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-7 py-3.5 text-xs font-bold text-black hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
              >
                <Download className="w-4 h-4 text-sky-600" />
                Download Plugin (.ZIP) — v1.0.0
              </a>

              <Link
                href="/dashboard/api-keys"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-3.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-850 transition-colors"
              >
                Get API Key <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Core Problem & Value Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-950 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">2048-bit RSA DKIM</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google and Yahoo require strict DKIM, SPF, and DMARC alignment. Sendport cryptographically signs every WordPress email automatically.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-950 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Sub-10ms REST API</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Traditional SMTP plugins freeze WooCommerce checkout pages while connecting to slow mail hosts. Sendport uses non-blocking HTTP REST dispatch.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-950 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Zero Server Port Blocks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cloud hosts (AWS EC2, DigitalOcean, Hetzner, Vultr) block outbound SMTP Port 25. Sendport delivers over standard secure HTTPS (Port 443).
              </p>
            </div>
          </div>

          {/* 3-Step Setup Guide */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8 sm:p-12 space-y-8">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Simple Installation</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Setup in 3 Simple Steps</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-full bg-white text-black font-extrabold text-sm flex items-center justify-center">
                  1
                </div>
                <h4 className="text-sm font-bold text-white">Download & Install</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Download <span className="text-white font-mono">sendport-smtp.php</span> and drop it into your WordPress site&apos;s <code className="text-slate-300 font-mono">wp-content/plugins/</code> directory, then activate it in WP Admin.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-8 h-8 rounded-full bg-white text-black font-extrabold text-sm flex items-center justify-center">
                  2
                </div>
                <h4 className="text-sm font-bold text-white">Paste Sendport API Key</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Go to **Settings &gt; Sendport SMTP** in your WordPress admin dashboard and paste your live API key (<code className="text-slate-300 font-mono">sk_live_...</code>).
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-8 h-8 rounded-full bg-white text-black font-extrabold text-sm flex items-center justify-center">
                  3
                </div>
                <h4 className="text-sm font-bold text-white">Verify Inbox Placement</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your email into the built-in diagnostic test box and click **Send Test Email**. Check your inbox — 100% delivered!
                </p>
              </div>
            </div>
          </div>

          {/* Code Configuration Box */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Optional: Configure via wp-config.php</h3>
                <p className="text-xs text-slate-400">You can also define your API key as an environment constant in your codebase:</p>
              </div>

              <button
                onClick={copyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-slate-300 hover:text-white transition-colors"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSnippet ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-black border border-slate-850 text-xs font-mono text-sky-300 overflow-x-auto">
              <code>{`// In your wp-config.php file:
define('SENDPORT_API_KEY', 'sk_live_9f81a7b...');
define('SENDPORT_FROM_EMAIL', 'hello@yourstore.com');`}</code>
            </pre>
          </div>

          {/* Bottom CTA Banner */}
          <div className="p-8 sm:p-12 rounded-3xl border border-sky-500/20 bg-gradient-to-r from-sky-950/40 via-slate-950 to-indigo-950/40 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white">Start Sending with 100 Free Sends Daily</h3>
              <p className="text-xs sm:text-sm text-slate-400">No credit card required. Upgrade or buy top-up credits whenever you scale.</p>
            </div>

            <a
              href="/downloads/sendport-smtp.php"
              download="sendport-smtp.php"
              className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-200 transition-all shrink-0"
            >
              Download Plugin
            </a>
          </div>
        </div>
      </main>

      <Footer dark={true} />
    </div>
  );
}
