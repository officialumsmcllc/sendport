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
  Award,
  Terminal,
  Server,
  Layers,
  ChevronDown,
  Check,
  X,
  HelpCircle,
  Clock,
  DollarSign,
  Send,
  Loader2,
  Building,
  Mail,
  ExternalLink,
} from "lucide-react";

export default function StartupsPage() {
  // Form state
  const [formData, setFormData] = useState({
    startupName: "",
    website: "",
    founderEmail: "",
    founderName: "",
    currentProvider: "None / Starting Fresh",
    techStack: "Next.js 15 (React)",
    monthlyVolume: "< 25k emails/mo",
    useCase: "Auth OTP & Transactional",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/startups/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: "How does the $1,000 Startup Credit Grant work?",
      a: "Approved startups receive $1,000 USD in sending credits applied directly to their Sendport workspace. These credits cover 100% of your usage across high-speed API queues, dedicated IP routing, and 25,000 emails/day for up to 12 months.",
    },
    {
      q: "Do I need to submit a credit card to apply?",
      a: "No! There is zero credit card required to apply or claim your $1,000 grant. You can build, test, and ship your entire production email flow completely free.",
    },
    {
      q: "What types of startups qualify?",
      a: "Early-stage founders, bootstrapped indiemakers, and venture-backed companies operating for less than 3 years with under $2M in funding qualify. You must have a working website/MVP and comply with standard opt-in anti-spam guidelines.",
    },
    {
      q: "How fast is the grant approval turnaround?",
      a: "Our founder review team reviews submissions within 24 hours. Once verified, your workspace is upgraded to Scale Pro with the $1,000 credit balance immediately unlocked.",
    },
    {
      q: "Can I use Sendport with Next.js 15, React Email, and Tailwind?",
      a: "Yes! Sendport is engineered natively for modern TypeScript stacks. We provide official SDKs for Next.js, React Email components, Node.js, Python, PHP, and standard SMTP relays for WordPress or Laravel.",
    },
    {
      q: "Does Sendport charge for storing contact lists?",
      a: "Never. Unlike legacy providers like Mailchimp or Klaviyo that charge aggressive 'subscriber taxes', Sendport gives you unlimited contact lists and audiences for $0. You only consume credits when you actually dispatch emails.",
    },
  ];

  const comparisonRows = [
    {
      feature: "Free Startup Credit Grant",
      sendport: "$1,000 USD (All Founders)",
      resend: "$0 (Free tier only)",
      sendgrid: "Select VCs only",
    },
    {
      feature: "Automated 30-Day Domain Warmup",
      sendport: "Built-in 1-Click (Free)",
      resend: "Manual / Paid tools",
      sendgrid: "Enterprise ($1,000+/mo)",
    },
    {
      feature: "Live Spam Score & Content Tester",
      sendport: "Included Free",
      resend: "Not available",
      sendgrid: "Paid add-on",
    },
    {
      feature: "Contact Audience Fees (Storage)",
      sendport: "$0 (Unlimited Free)",
      resend: "Volume-based charges",
      sendgrid: "Audience surcharge",
    },
    {
      feature: "DKIM 2048-bit RSA & DMARC Alignment",
      sendport: "Instant Auto-Generation",
      resend: "Supported",
      sendgrid: "Complex CNAMEs",
    },
    {
      feature: "Global Edge Dispatch Latency",
      sendport: "< 10ms",
      resend: "< 25ms",
      sendgrid: "150ms - 350ms",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30">
      <Navbar dark={true} />

      {/* JSON-LD MICRODATA SCHEMAS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                name: "Sendport for Startups",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Cloud, Web, API",
                description:
                  "Scale your startup with $1,000 in free email credits, 25k emails/day, automated domain warmup, and 99.98% Primary Inbox deliverability.",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  name: "$1,000 Startup Credit Grant",
                  description: "12 months of high-deliverability email infrastructure for early-stage ventures.",
                },
              },
              {
                "@type": "FAQPage",
                mainEntity: faqs.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: f.a,
                  },
                })),
              },
            ],
          }),
        }}
      />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-32 pb-24 border-b border-slate-900">
        {/* Glow ambient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.18),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-8 backdrop-blur-md shadow-lg shadow-emerald-500/10">
            <Rocket className="h-3.5 w-3.5 text-emerald-400 animate-bounce" />
            <span>Sendport Founders Accelerator • 2026 Cohort Open</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-white">
            Scale your startup with{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              $1,000 in Free Email Credits
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300 sm:text-xl leading-relaxed">
            Stop worrying about email bills or landing in spam. Get $1,000 in credits, 
            <strong className="text-white font-medium"> 25,000 emails/day</strong>, automated 30-day domain warmup, 
            and 2048-bit RSA cryptographic deliverability — zero credit card required.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#apply-form"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="h-5 w-5" />
              Claim $1,000 Startup Grant
              <ArrowRight className="h-4 w-4" />
            </a>

            <Link
              href="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/90 px-8 py-4 text-base font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow-md"
            >
              <Terminal className="h-5 w-5 text-emerald-400" />
              Explore Next.js SDK & API
            </Link>
          </div>

          {/* QUICK PERKS VALUE BAR */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-5xl mx-auto text-left">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md hover:border-emerald-500/40 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-emerald-400 group-hover:scale-105 transition-transform">$1,000</span>
                <DollarSign className="h-5 w-5 text-emerald-400/60" />
              </div>
              <div className="text-sm font-semibold text-white mt-1">Free Sending Balance</div>
              <div className="text-xs text-slate-400 mt-0.5">Scale Pro tier for 12 months</div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md hover:border-cyan-500/40 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-cyan-400 group-hover:scale-105 transition-transform">25k/day</span>
                <Zap className="h-5 w-5 text-cyan-400/60" />
              </div>
              <div className="text-sm font-semibold text-white mt-1">High-Speed API Quota</div>
              <div className="text-xs text-slate-400 mt-0.5">Sub-10ms delivery queues</div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md hover:border-teal-500/40 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-teal-400 group-hover:scale-105 transition-transform">30-Day</span>
                <Flame className="h-5 w-5 text-teal-400/60" />
              </div>
              <div className="text-sm font-semibold text-white mt-1">Automated Warmup</div>
              <div className="text-xs text-slate-400 mt-0.5">Build domain trust with Gmail</div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md hover:border-purple-500/40 transition-all group">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-purple-400 group-hover:scale-105 transition-transform">99.98%</span>
                <ShieldCheck className="h-5 w-5 text-purple-400/60" />
              </div>
              <div className="text-sm font-semibold text-white mt-1">Inbox Placement</div>
              <div className="text-xs text-slate-400 mt-0.5">2048-bit RSA DKIM & DMARC</div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE APPLICATION FORM & VALUE PROPOSITION */}
      <section id="apply-form" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: VALUE HIGHLIGHTS & BREAKDOWN */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 mb-4">
                <Award className="h-3.5 w-3.5" />
                <span>What's Inside The $1,000 Package</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Everything your engineering team needs to go live today.
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed text-base">
                Legacy email providers hit early-stage companies with sudden invoice spikes, restrictive contact caps, and painful IP warmups. We remove every friction point.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-base">30-Day Algorithmic Warmup Engine</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Prevent immediate spam flagging on new startup domains. Sendport automatically ramps up dispatch volume day-by-day to establish authentic sender reputation with Google and Yahoo.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-base">Automated 2048-bit RSA DKIM & DMARC</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    One-click DNS record verification for Cloudflare, Route53, and Vercel. We generate cryptographic keys that prevent spoofing and guarantee SPF alignment.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-base">TypeScript & Next.js 15 Ready</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Zero-dependency SDK with full type-safety. Render transactional emails with React Email, React Server Components, or plain HTML in under 4 lines of code.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-base">$0 Audience Contact List Tax</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Import 10,000 or 100,000 users without paying a single dollar for storage. You only spend credits when emails leave your queue.
                  </p>
                </div>
              </div>
            </div>

            {/* Grant Value Breakdown Box */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6">
              <div className="flex items-center justify-between text-sm text-emerald-300 font-semibold mb-3">
                <span>Total Combined Value</span>
                <span className="text-lg text-emerald-400 font-bold">$1,528+ USD</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Scale Pro 12-Month Access:</span>
                  <span className="text-slate-400">$588 value</span>
                </div>
                <div className="flex justify-between">
                  <span>Automated Domain Warmup:</span>
                  <span className="text-slate-400">$300 value</span>
                </div>
                <div className="flex justify-between">
                  <span>Spam Tester & Content Placement:</span>
                  <span className="text-slate-400">$240 value</span>
                </div>
                <div className="flex justify-between">
                  <span>Unlimited Contact Storage:</span>
                  <span className="text-slate-400">$400+ value</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-500/20 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Granted 100% Free to Accepted Startups</span>
              </div>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE APPLICATION FORM */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {submitted ? (
                /* SUCCESS CELEBRATION CARD */
                <div className="py-12 text-center space-y-6">
                  <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                      Application Received! 🎉
                    </h3>
                    <p className="text-slate-300 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                      We have received your startup submission for{" "}
                      <strong className="text-emerald-400">{formData.startupName}</strong>. 
                      Our engineering team reviews and approves grants within 24 hours.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 max-w-md mx-auto text-left space-y-2">
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Grant Status
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Grant Allocated:</span>
                      <span className="text-emerald-400 font-bold">$1,000 USD Credits</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Review Timeline:</span>
                      <span className="text-cyan-400 font-semibold">&lt; 24 Hours</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Registered Email:</span>
                      <span className="text-slate-400 font-mono text-xs">{formData.founderEmail}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/signup?ref=startup_program"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 transition-all"
                    >
                      Create Your Sendport Workspace Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950 px-6 py-3.5 text-sm font-medium text-slate-400 hover:text-white transition-all"
                    >
                      Submit Another Startup
                    </button>
                  </div>
                </div>
              ) : (
                /* FORM INPUTS */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-white">Apply for $1,000 Startup Credits</h3>
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                        Zero Card Needed
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-400">
                      Fill out your startup details below. Applications are reviewed within 24 hours.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/30 text-sm text-red-300 flex items-start gap-2.5">
                      <X className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Startup Name */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Startup / Company Name <span className="text-emerald-400">*</span>
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={formData.startupName}
                          onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                          placeholder="e.g. Acme AI, PayFlow"
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Domain / Website */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Website / Domain <span className="text-emerald-400">*</span>
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="e.g. https://acme.io"
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Founder Email */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Founder Work Email <span className="text-emerald-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={formData.founderEmail}
                          onChange={(e) => setFormData({ ...formData, founderEmail: e.target.value })}
                          placeholder="alex@acme.io"
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Founder Name */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Founder Name
                      </label>
                      <input
                        type="text"
                        value={formData.founderName}
                        onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                        placeholder="e.g. Alex Rivera"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Current Provider */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Current Email Provider
                      </label>
                      <select
                        value={formData.currentProvider}
                        onChange={(e) => setFormData({ ...formData, currentProvider: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      >
                        <option value="None / Starting Fresh">None / Starting Fresh</option>
                        <option value="Resend">Resend</option>
                        <option value="SendGrid">Twilio SendGrid</option>
                        <option value="Postmark">Postmark</option>
                        <option value="AWS SES">Amazon Web Services (SES)</option>
                        <option value="Mailgun / Brevo">Mailgun / Brevo</option>
                        <option value="Mailchimp">Mailchimp</option>
                      </select>
                    </div>

                    {/* Primary Tech Stack */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Primary Tech Stack
                      </label>
                      <select
                        value={formData.techStack}
                        onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      >
                        <option value="Next.js 15 (React)">Next.js 15 (React App Router)</option>
                        <option value="React / Vite / Remix">React / Vite / Remix</option>
                        <option value="Node.js / Express / NestJS">Node.js / Express / NestJS</option>
                        <option value="Python / FastAPI / Django">Python / FastAPI / Django</option>
                        <option value="PHP / Laravel / WordPress">PHP / Laravel / WordPress</option>
                        <option value="Go / Rust">Go / Rust Backend</option>
                        <option value="Mobile (React Native / Flutter)">Mobile (React Native / Flutter)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Monthly Volume */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Expected Monthly Sending
                      </label>
                      <select
                        value={formData.monthlyVolume}
                        onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      >
                        <option value="< 25k emails/mo">&lt; 25,000 emails / month</option>
                        <option value="25k - 100k emails/mo">25,000 - 100,000 emails / month</option>
                        <option value="100k - 500k emails/mo">100,000 - 500,000 emails / month</option>
                        <option value="500k+ emails/mo">500,000+ emails / month</option>
                      </select>
                    </div>

                    {/* Primary Use Case */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Primary Use Case
                      </label>
                      <select
                        value={formData.useCase}
                        onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                      >
                        <option value="Auth OTP & Transactional">Auth OTP, Magic Links & Passwords</option>
                        <option value="Billing & Invoices">Stripe Invoices & Receipts</option>
                        <option value="User Onboarding Sequences">User Onboarding & Lifecycle Drips</option>
                        <option value="Product Updates & Newsletters">Product Updates & Newsletters</option>
                        <option value="High-Volume Alerts">Realtime System Alerts & Webhooks</option>
                      </select>
                    </div>
                  </div>

                  {/* Submission Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>Submit Application for $1,000 Credits</span>
                        </>
                      )}
                    </button>
                    <p className="mt-3 text-center text-xs text-slate-500">
                      By submitting, you agree to Sendport's Acceptable Use Policy. Strictly no spam or purchased lists.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* HEAD-TO-HEAD COMPARISON TABLE: SENDPORT VS RESEND VS SENDGRID */}
      <section className="py-24 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-400 mb-4">
              <Zap className="h-3.5 w-3.5" />
              <span>Competitive Feature Audit</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Why High-Growth Startups Choose Sendport
            </h2>
            <p className="mt-4 text-slate-400">
              See how Sendport stacks up against traditional and legacy developer email providers.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <th className="py-5 px-6">Capability / Feature</th>
                  <th className="py-5 px-6 text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <span>Sendport</span>
                    </div>
                  </th>
                  <th className="py-5 px-6 text-slate-400">Resend</th>
                  <th className="py-5 px-6 text-slate-400">Twilio SendGrid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-white flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                      {row.sendport}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {row.resend}
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {row.sendgrid}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CODE INTEGRATION SNIPPET (60 SECONDS TO SHIP) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
              <Terminal className="h-3.5 w-3.5" />
              <span>Developer Experience First</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ship your first email in under 60 seconds.
            </h2>
            <p className="text-slate-400 leading-relaxed text-base">
              Copy-paste our type-safe SDK into your Next.js route handlers, Server Actions, or Supabase edge functions. Zero boilerplate, zero headache.
            </p>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>Full TypeScript autocompletion and schema validation</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>React Email component rendering with zero compilation lag</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>Sub-10ms global edge dispatch with instant delivery webhook receipts</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>Read the Complete API Reference</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-green-500/80 inline-block" />
                  <span className="ml-2 text-slate-400 text-xs font-sans">app/api/auth/magic-link/route.ts</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-sans font-semibold">TypeScript</span>
              </div>
              <div className="p-5 sm:p-6 text-slate-300 overflow-x-auto leading-relaxed space-y-1">
                <div><span className="text-purple-400">import</span> &#123; Sendport &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">"@sendport/sdk"</span>;</div>
                <div><span className="text-purple-400">import</span> &#123; NextResponse &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">"next/server"</span>;</div>
                <div className="text-slate-600">// Initialize client with startup API key</div>
                <div><span className="text-blue-400">const</span> sendport = <span className="text-blue-400">new</span> <span className="text-yellow-300">Sendport</span>&#40;process.env.<span className="text-teal-300">SENDPORT_API_KEY</span>&#41;;</div>
                <br />
                <div><span className="text-purple-400">export async function</span> <span className="text-blue-300">POST</span>&#40;req: Request&#41; &#123;</div>
                <div className="pl-4"><span className="text-blue-400">const</span> &#123; email, token &#125; = <span className="text-purple-400">await</span> req.<span className="text-blue-300">json</span>&#40;&#41;;</div>
                <br />
                <div className="pl-4 text-slate-600">// Dispatch with sub-10ms latency and 2048-bit DKIM</div>
                <div className="pl-4"><span className="text-blue-400">const</span> &#123; data, error &#125; = <span className="text-purple-400">await</span> sendport.emails.<span className="text-blue-300">send</span>&#40;&#123;</div>
                <div className="pl-8">from: <span className="text-emerald-300">"Acme Security &lt;auth@acme.io&gt;"</span>,</div>
                <div className="pl-8">to: [email],</div>
                <div className="pl-8">subject: <span className="text-emerald-300">"Your Secure Login Link"</span>,</div>
                <div className="pl-8">html: <span className="text-emerald-300">`&lt;p&gt;Click to sign in: https://acme.io/auth?token=$&#123;token&#125;&lt;/p&gt;`</span>,</div>
                <div className="pl-8">tags: [&#123; name: <span className="text-emerald-300">"type"</span>, value: <span className="text-emerald-300">"magic_link"</span> &#125;],</div>
                <div className="pl-4">&#125;&#41;;</div>
                <br />
                <div className="pl-4"><span className="text-purple-400">return</span> NextResponse.<span className="text-blue-300">json</span>&#40;&#123; success: <span className="text-yellow-300">true</span>, id: data?.id &#125;&#41;;</div>
                <div>&#125;</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ELIGIBILITY CRITERIA */}
      <section className="py-20 bg-slate-900/30 border-y border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Program Eligibility Criteria</h2>
            <p className="mt-3 text-slate-400">Designed to be founder-friendly and friction-free.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-emerald-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-base">Early-Stage / Bootstrapped Founders</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Companies incorporated or active under 3 years, with under $2M in total funding or completely bootstrapped indiemakers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-emerald-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-base">Active Website or Working Beta</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  You must have a live domain or functional web/mobile application with your custom domain name configured.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-emerald-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-base">Zero-Spam & Opt-In Guarantee</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Sending legitimate transactional notifications, password resets, onboarding flows, and customer updates with strict opt-in.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-emerald-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-base">24-Hour Express Review</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Our engineering team approves applications within 24 hours. The $1,000 credit grant is immediately provisioned to your workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-400 mb-4">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything You Need To Know
          </h2>
          <p className="mt-3 text-slate-400">Clear answers for startup founders and lead developers.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left font-semibold text-white hover:text-emerald-400 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 shrink-0 ml-4 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-emerald-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm sm:text-base text-slate-400 border-t border-slate-800/60 pt-4 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM CALL TO ACTION BANNER */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 p-10 sm:p-14 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to claim your $1,000 startup package?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-base sm:text-lg">
              Join hundreds of high-growth founders and engineering teams shipping with Sendport today. 
              Zero credit card required, instant onboarding, and 24-hour grant approval.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#apply-form"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-xl hover:bg-emerald-400 transition-all hover:scale-[1.02]"
              >
                <Rocket className="h-5 w-5" />
                Fill Out 60-Second Application
              </a>
              <Link
                href="/signup?ref=startup_program"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-8 py-4 text-base font-semibold text-slate-200 hover:bg-slate-800 transition-all"
              >
                Create Account First
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer dark={true} />
    </div>
  );
}
