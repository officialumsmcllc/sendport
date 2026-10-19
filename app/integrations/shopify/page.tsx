"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ShoppingBag,
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
  Code2,
  HelpCircle,
  TrendingDown,
  Layers,
  Webhook,
} from "lucide-react";

export default function ShopifyIntegrationPage() {
  const [apiKey, setApiKey] = useState("sk_live_your_api_key_here");
  const [senderEmail, setSenderEmail] = useState("orders@yourstoredomain.com");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<"webhook" | "headless" | "flow">("webhook");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const generatedWebhookUrl = `https://getsendport.com/api/v1/integrations/shopify?apiKey=${apiKey.trim()}&from=${encodeURIComponent(senderEmail.trim())}`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(generatedWebhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2200);
  };

  const headlessCode = `// Headless Shopify (Next.js / Hydrogen / Remix) Order Confirmation
import { SendportClient } from "@/lib/sendport";

export async function sendOrderConfirmation({ order, customer }) {
  const response = await fetch("https://getsendport.com/api/v1/emails/send", {
    method: "POST",
    headers: {
      "Authorization": "Bearer ${apiKey.trim()}",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "${senderEmail.trim()}",
      to: customer.email,
      subject: \`Order Confirmation #\${order.number} — Thank you!\`,
      html: \`
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h1>Thank you for your order, \${customer.firstName}!</h1>
          <p>Your order #\${order.number} has been received.</p>
          <p><strong>Total:</strong> \${order.currency} \${order.totalPrice}</p>
        </div>
      \`,
      track_opens: true,
      track_clicks: true,
    }),
  });

  return await response.json();
}`;

  const copyHeadlessCode = () => {
    navigator.clipboard.writeText(headlessCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const faqs = [
    {
      q: "Why do Shopify store order emails land in customer spam folders?",
      a: "When you send emails from a custom domain (e.g., support@mystore.com) without strict 2048-bit RSA DKIM cryptographic signatures and SPF alignment, Gmail and Yahoo flag the emails as unauthenticated spoofing. GetSendport automatically signs every outgoing message with 2048-bit DKIM to guarantee 99.9% Primary Inbox delivery.",
    },
    {
      q: "How does the Shopify Webhook integration work?",
      a: "Shopify sends an automated HTTPS POST webhook whenever an order is paid or fulfilled. GetSendport's webhook gateway receives the event in sub-10ms, parses line items and customer details, and dispatches an authentic 2048-bit DKIM signed order confirmation directly to the customer.",
    },
    {
      q: "Does GetSendport charge for stored contact lists like Klaviyo or Omnisend?",
      a: "No! Traditional e-commerce email platforms trap merchants by charging $50 to $200+ every month just for having contacts on your subscriber list, even if you never email them. GetSendport has ZERO contact penalties — you only pay for what you actually deliver.",
    },
    {
      q: "Does this work with Headless Shopify and Hydrogen?",
      a: "Yes! GetSendport offers a modern sub-10ms REST API and Node.js SDK with native React Email support (@react-email/components). You can build dynamic, high-converting checkout and order templates in pure React.",
    },
    {
      q: "What DNS records do I need to add for my Shopify store domain?",
      a: "Inside your GetSendport Dashboard, add your store domain (e.g. yourstore.com). GetSendport provides a 2048-bit RSA DKIM TXT record and an SPF include record. Once verified, all Shopify store emails sent through GetSendport achieve 100% SPF/DKIM alignment.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-24">
          
          {/* HERO SECTION */}
          <div className="text-center space-y-5 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-400">
              <ShoppingBag className="w-3.5 h-3.5" /> Official Shopify & Shopify Plus Integration
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Fix Shopify Email Delivery in <span className="text-emerald-400">60 Seconds</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Tired of order confirmations, shipping updates, and abandoned carts landing in your customers&apos; spam folders? Connect your Shopify store to GetSendport&apos;s 2048-bit RSA DKIM delivery engine with sub-10ms edge dispatch.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <Link
                href="/dashboard/domains"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-emerald-500 px-7 py-3.5 text-xs font-bold text-black hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
              >
                <ShieldCheck className="w-4 h-4 text-black" />
                Verify Store Domain (2048-bit DKIM)
              </Link>

              <Link
                href="/dashboard/api-keys"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-3.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-850 transition-colors"
              >
                Get API Key <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* VALUE HIGHLIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-950 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">99.9% Primary Inbox</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google and Yahoo enforce strict DKIM authentication for e-commerce. GetSendport signs every Shopify notification with 2048-bit RSA keys.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-950 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Webhook className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Automated Webhooks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your store via Shopify Admin Webhooks in 1 click. Instant trigger for order receipts, tracking codes, and customer registrations.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-950 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Zero Contact Penalties</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stop paying Klaviyo $100+/month for dormant subscribers. Start 100% free with 3,000 emails/month and scale on transparent pay-as-you-go.
              </p>
            </div>
          </div>

          {/* INTERACTIVE WEBHOOK GENERATOR & INTEGRATION TABS */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">Choose Your Shopify Integration Method</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Connect via zero-code native webhooks, modern headless APIs, or Shopify Flow.
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 shrink-0">
                <button
                  onClick={() => setActiveTab("webhook")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "webhook" ? "bg-emerald-500 text-black shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Native Webhooks (No-Code)
                </button>
                <button
                  onClick={() => setActiveTab("headless")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "headless" ? "bg-emerald-500 text-black shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Headless & Hydrogen API
                </button>
                <button
                  onClick={() => setActiveTab("flow")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "flow" ? "bg-emerald-500 text-black shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Shopify Flow & SMTP
                </button>
              </div>
            </div>

            {/* TAB 1: WEBHOOK GENERATOR */}
            {activeTab === "webhook" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Your GetSendport API Key</label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk_live_..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Sender Email (Verified Domain)</label>
                    <input
                      type="text"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="orders@yourstore.com"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Generated Webhook URL Display */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Your Shopify Webhook Endpoint URL</span>
                    <button
                      onClick={copyWebhookUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedUrl ? "Copied Endpoint!" : "Copy URL"}
                    </button>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-black/60 font-mono text-xs text-emerald-400 break-all select-all">
                    {generatedWebhookUrl}
                  </div>
                </div>

                {/* 3 Step Setup Instructions */}
                <div className="border-t border-slate-800/80 pt-6 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> 3 Steps to Setup in Shopify Admin:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
                    <div className="p-4 rounded-2xl border border-slate-850 bg-slate-900/40 space-y-2">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px]">1</span>
                        Go to Webhooks
                      </div>
                      <p>In your Shopify Admin, click <strong>Settings</strong> &gt; <strong>Notifications</strong> &gt; scroll down to <strong>Webhooks</strong>.</p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-850 bg-slate-900/40 space-y-2">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px]">2</span>
                        Create Webhook
                      </div>
                      <p>Select Event: <strong>Order creation</strong> (or <strong>Order payment</strong>). Format: <strong>JSON</strong>.</p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-850 bg-slate-900/40 space-y-2">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px]">3</span>
                        Paste & Save
                      </div>
                      <p>Paste the generated URL above into the <strong>URL field</strong> and click <strong>Save webhook</strong>.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: HEADLESS & HYDROGEN */}
            {activeTab === "headless" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Hydrogen / Next.js Commerce Server Action</span>
                  <button
                    onClick={copyHeadlessCode}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? "Copied Code!" : "Copy Code"}
                  </button>
                </div>
                <pre className="p-4 rounded-2xl border border-slate-800 bg-black/80 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                  <code>{headlessCode}</code>
                </pre>
              </div>
            )}

            {/* TAB 3: SHOPIFY FLOW & SMTP */}
            {activeTab === "flow" && (
              <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
                <p>
                  If you use <strong>Shopify Flow</strong> or third-party store apps (such as custom checkout forms, contact widgets, or inventory alerts), you can connect via GetSendport&apos;s high-speed SMTP Relay:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1.5">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">SMTP Hostname</span>
                    <p className="font-mono text-white text-sm">smtp.getsendport.com</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1.5">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Supported Ports</span>
                    <p className="font-mono text-emerald-400 text-sm">587 (STARTTLS) or 465 (SSL/TLS)</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1.5">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Username</span>
                    <p className="font-mono text-white text-sm">api</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-1.5">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Password</span>
                    <p className="font-mono text-emerald-400 text-sm">Your GetSendport API Key</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COMPARISON: GETSENDPORT VS KLAVIYO & SHOPIFY NATIVE */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Compare GetSendport vs Traditional Platforms</h2>
              <p className="text-xs sm:text-sm text-slate-400">Why top Shopify merchants are switching their transactional layer.</p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="p-4 sm:p-5">Feature</th>
                    <th className="p-4 sm:p-5 text-emerald-400 font-bold">GetSendport</th>
                    <th className="p-4 sm:p-5 text-slate-400">Klaviyo / Omnisend</th>
                    <th className="p-4 sm:p-5 text-slate-400">Shopify Native Mail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">DKIM Cryptographic Standard</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold">2048-bit Dedicated RSA</td>
                    <td className="p-4 sm:p-5 text-slate-400">Shared 1024-bit Pool</td>
                    <td className="p-4 sm:p-5 text-slate-400">Generic SPF</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">Contact List Surcharge</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold">ZERO ($0 forever)</td>
                    <td className="p-4 sm:p-5 text-rose-400">$45 - $300+/month penalty</td>
                    <td className="p-4 sm:p-5 text-slate-400">Included</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">Dispatch Latency</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold">&lt; 10ms Edge Queue</td>
                    <td className="p-4 sm:p-5 text-slate-400">1 - 5 minutes delay</td>
                    <td className="p-4 sm:p-5 text-slate-400">Unpredictable queues</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">Free Developer / Starter Tier</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold">3,000 emails/mo FREE</td>
                    <td className="p-4 sm:p-5 text-slate-400">500 emails cap</td>
                    <td className="p-4 sm:p-5 text-slate-400">Basic</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">Headless / React Email Support</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold">First-class (@react-email)</td>
                    <td className="p-4 sm:p-5 text-slate-400">Complex drag & drop only</td>
                    <td className="p-4 sm:p-5 text-slate-400">Rigid Liquid templates</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ SECTION */}
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
              <p className="text-xs sm:text-sm text-slate-400">Everything you need to know about connecting your Shopify store.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-sm font-bold text-white hover:text-emerald-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-emerald-400 text-lg ml-4 font-mono">
                      {openFaq === idx ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-850 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM CTA */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-black p-8 sm:p-12 text-center space-y-5">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to guarantee 100% Primary Inbox for your store?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Join thousands of e-commerce brands who trust GetSendport for cryptographically verified transactional email delivery.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-3.5 text-xs font-bold text-black hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
              >
                Create Free Account <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-6 py-3.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                Explore API Docs
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer dark={true} />
    </div>
  );
}
