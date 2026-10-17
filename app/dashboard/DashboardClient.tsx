"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  Mail,
  Eye,
  MousePointer,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Globe,
  Key,
  Plus,
  RefreshCw,
  Sparkles,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Zap,
  ExternalLink,
  ChevronDown,
  X,
} from "lucide-react";
import type { DashboardInitialData } from "@/lib/data/dashboard-overview";

export default function DashboardClient({ initialData }: { initialData?: DashboardInitialData | null }) {
  const safeStats = initialData?.stats || {
    sent: 0,
    delivered: 0,
    deliveredRate: "0%",
    opened: 0,
    openRate: "0%",
    clicked: 0,
    clickRate: "0%",
    bounced: 0,
    bounceRate: "0%",
    quotaToday: 0,
    quotaTotal: 100,
    plan: "STARTER",
  };

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(safeStats);
  const [user, setUser] = useState<any>(initialData?.user || null);
  const [domains, setDomains] = useState<any[]>(initialData?.domains || []);
  const [apiKeysCount, setApiKeysCount] = useState<number>(initialData?.apiKeysCount || 0);
  const [recentEvents, setRecentEvents] = useState<any[]>(initialData?.recentEmails || []);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  // Onboarding Wizard State
  const [wizardDismissed, setWizardDismissed] = useState(false);
  const [codeLang, setCodeLang] = useState<"curl" | "node" | "python" | "php">("curl");
  const [copiedCode, setCopiedCode] = useState(false);

  // Quick Test Dispatch Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testTo, setTestTo] = useState(initialData?.user?.email || "");
  const [testSubject, setTestSubject] = useState("Hello from Sendport! 🚀 Your deliverability is active");
  const [sendingTest, setSendingTest] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Optimistic client cache initialization
  useEffect(() => {
    try {
      const cached = localStorage.getItem("sendport_user");
      if (cached) {
        const u = JSON.parse(cached);
        if (u?.email) {
          if (!user) setUser(u);
          if (!testTo) setTestTo(u.email);
        }
      }
    } catch (_) {}
    fetchDashboardData(true);
  }, []);

  // Silent Background Poller for real-time live data
  const fetchDashboardData = async (silent = true) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          if (!testTo) setTestTo(data.user.email);
        }
        if (data.domains) setDomains(data.domains || []);
        if (data.apiKeysCount !== undefined) setApiKeysCount(data.apiKeysCount);

        if (data.stats) {
          setStats({
            sent: (data.stats.delivered || 0) + (data.stats.bounced || 0),
            delivered: data.stats.delivered || 0,
            deliveredRate: data.stats.deliveredRate || "0%",
            opened: data.stats.opened || 0,
            openRate: data.stats.openRate || "0%",
            clicked: data.stats.clicked || 0,
            clickRate: data.stats.clickRate || "0%",
            bounced: data.stats.bounced || 0,
            bounceRate: data.stats.bounceRate || "0%",
            quotaToday: data.stats.usedToday || 0,
            quotaTotal: data.stats.dailyQuota || 100,
            plan: data.stats.plan || "STARTER",
          });
        }
        if (data.recentEmails) {
          setRecentEvents(data.recentEmails || []);
        }
        setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    } catch (e) {
      console.error("Dashboard refresh error:", e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 15-second silent background poller
  useEffect(() => {
    const timer = setInterval(() => {
      fetchDashboardData(true);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTo) return;

    try {
      setSendingTest(true);
      setTestFeedback(null);

      // Identify verified domain sender or use sandbox test sender
      const verifiedDomain = (domains || []).find((d) => d?.status?.toUpperCase() === "VERIFIED");
      const fromEmail = verifiedDomain
        ? `verify@${verifiedDomain.name}`
        : `Sendport Demo <hello@getsendport.com>`;

      const res = await fetch("/api/v1/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromEmail,
          to: testTo,
          subject: testSubject,
          html: `<div style="font-family:sans-serif;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;">
            <h2 style="color:#0f172a;margin-top:0;">Welcome to High Deliverability with Sendport!</h2>
            <p style="color:#475569;font-size:14px;line-height:1.6;">
              Congratulations! Your email dispatch stream is 100% operational. This test message was cryptographically signed with 2048-bit RSA DKIM and delivered via Sendport's ultra-fast Edge MTA.
            </p>
            <div style="margin:20px 0;padding:12px;background:#f8fafc;border-radius:8px;font-family:monospace;font-size:12px;color:#0f172a;">
              Status: DELIVERED | Port: 587 / 465 | Security: TLS 1.3
            </div>
            <p style="color:#94a3b8;font-size:12px;margin-bottom:0;">Sendport Technologies Inc.</p>
          </div>`,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setTestFeedback({
          success: true,
          message: `Email dispatched successfully! Check ${testTo} inbox. (Message ID: ${json.id || json.messageId || "msg_live"})`,
        });
        fetchDashboardData(true);
      } else {
        setTestFeedback({
          success: false,
          message: json.error || "Failed to dispatch test email. Please check your domain configuration.",
        });
      }
    } catch (e: any) {
      setTestFeedback({ success: false, message: e.message || "Network error sending test email." });
    } finally {
      setSendingTest(false);
    }
  };

  // Check Onboarding Steps Completion
  const step1 = true;
  const step2 = (apiKeysCount || 0) > 0;
  const step3 = (domains || []).some((d) => d?.status === "VERIFIED");
  const step4 = (stats?.delivered || 0) > 0 || (recentEvents || []).length > 0;

  const completedStepsCount = [step1, step2, step3, step4].filter(Boolean).length;
  const progressPercent = Math.round((completedStepsCount / 4) * 100);

  // Sample code snippets for Quickstart
  const senderDomain = (domains || []).find((d) => d?.status === "VERIFIED")?.name || "yourdomain.com";

  const codeSnippets = {
    curl: `curl -X POST https://getsendport.com/api/v1/emails/send \\
  -H "Authorization: Bearer sk_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "hello@${senderDomain}",
    "to": "${user?.email || "developer@example.com"}",
    "subject": "Hello from Sendport",
    "html": "<p>My first email via Sendport API!</p>"
  }'`,
    node: `// Using Node.js Native Fetch
const res = await fetch("https://getsendport.com/api/v1/emails/send", {
  method: "POST",
  headers: {
    "Authorization": "Bearer sk_live_your_api_key_here",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    from: "hello@${senderDomain}",
    to: "${user?.email || "developer@example.com"}",
    subject: "Hello from Sendport",
    html: "<p>My first email via Sendport API!</p>"
  })
});
const data = await res.json();
console.log(data);`,
    python: `import requests

res = requests.post(
    "https://getsendport.com/api/v1/emails/send",
    headers={"Authorization": "Bearer sk_live_your_api_key_here"},
    json={
        "from": "hello@${senderDomain}",
        "to": "${user?.email || "developer@example.com"}",
        "subject": "Hello from Sendport",
        "html": "<p>My first email via Sendport API!</p>"
    }
)
print(res.json())`,
    php: `<?php
$ch = curl_init("https://getsendport.com/api/v1/emails/send");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  "Authorization: Bearer sk_live_your_api_key_here",
  "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  "from" => "hello@${senderDomain}",
  "to" => "${user?.email || "developer@example.com"}",
  "subject" => "Hello from Sendport",
  "html" => "<p>My first email via Sendport API!</p>"
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
echo $response;`,
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* PAGE HEADER & LIVE TELEMETRY STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Dashboard Overview</h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Telemetry</span>
              {lastRefreshed && <span className="text-emerald-600 font-normal hidden sm:inline">• {lastRefreshed}</span>}
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">Live deliverability metrics, sending quota, and recent email events.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchDashboardData(false)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
            title="Force immediate telemetry refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
          <button
            onClick={() => {
              setTestModalOpen(true);
              setTestFeedback(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" /> 1-Click Test Email
          </button>
          <Link
            href="/dashboard/domains"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Globe className="w-3.5 h-3.5 text-primary-600" /> Manage Domains
          </Link>
          <Link
            href="/dashboard/playground"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <Send className="w-3.5 h-3.5" /> Compose Email
          </Link>
        </div>
      </div>

      {/* 🚀 60-SECOND DEVELOPER ONBOARDING & ACTIVATION WIZARD */}
      {!wizardDismissed && (
        <div className="rounded-3xl border border-primary-200/90 bg-gradient-to-br from-primary-50/40 via-white to-slate-50 p-6 sm:p-7 shadow-sm relative overflow-hidden">
          {/* Header & Progress */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-primary-600 animate-pulse" />
                <h3 className="text-base font-black text-slate-900">
                  60-Second Developer Quickstart
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary-50 text-primary-700 border border-primary-200">
                  {completedStepsCount} of 4 Complete ({progressPercent}%)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Complete these 4 rapid steps to unlock high-deliverability production dispatch.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-36 sm:w-48 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-600 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <button
                onClick={() => setWizardDismissed(true)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* 4 Interactive Step Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
            {/* Step 1: Claim Free Quota */}
            <div className={`p-4 rounded-2xl border transition-all ${
              step1 ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 1</span>
                {step1 ? (
                  <span className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900">Free Tier Activated</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Starter tier provides 100 high-speed transactional emails daily.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <Check className="w-3.5 h-3.5" /> 100/day active
              </div>
            </div>

            {/* Step 2: Create API Key */}
            <div className={`p-4 rounded-2xl border transition-all ${
              step2 ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-slate-200 hover:border-primary-300"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 2</span>
                {step2 ? (
                  <span className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900">Generate API Key</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Authenticate your app securely using SHA-256 encrypted bearer keys.
              </p>
              <div className="mt-3">
                {step2 ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                    <Check className="w-3.5 h-3.5" /> Key Created
                  </span>
                ) : (
                  <Link
                    href="/dashboard/api-keys"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 hover:text-primary-700"
                  >
                    Create Key <ArrowUpRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>

            {/* Step 3: Verify Custom Domain */}
            <div className={`p-4 rounded-2xl border transition-all ${
              step3 ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-slate-200 hover:border-primary-300"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 3</span>
                {step3 ? (
                  <span className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900">Add & Verify Domain</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Configure DKIM, SPF, & DMARC for 99.8% inbox placement.
              </p>
              <div className="mt-3">
                {step3 ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                    <Check className="w-3.5 h-3.5" /> Domain Verified
                  </span>
                ) : (
                  <Link
                    href="/dashboard/domains"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 hover:text-primary-700"
                  >
                    Add Domain <ArrowUpRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>

            {/* Step 4: Dispatch First Email */}
            <div className={`p-4 rounded-2xl border transition-all ${
              step4 ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-slate-200 hover:border-primary-300"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 4</span>
                {step4 ? (
                  <span className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900">Send First Email</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Dispatch via 1-click modal, REST API, or SMTP relay.
              </p>
              <div className="mt-3">
                {step4 ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                    <Check className="w-3.5 h-3.5" /> Sent & Delivered
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setTestModalOpen(true);
                      setTestFeedback(null);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 hover:text-primary-700 cursor-pointer"
                  >
                    Send Test Now <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quickstart Code Snippet Embed */}
          <div className="mt-5 pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-primary-600" /> Instant Code Snippet:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                {(["curl", "node", "python", "php"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCodeLang(lang)}
                    className={`px-2.5 py-1 rounded-md transition-all uppercase text-[10px] font-bold cursor-pointer ${
                      codeLang === lang
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto shadow-inner">
              <button
                onClick={() => copyCode(codeSnippets[codeLang])}
                className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
              <pre className="pr-16 text-[11px] leading-relaxed whitespace-pre overflow-x-auto">
                {codeSnippets[codeLang]}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Delivered Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Delivered</span>
            <span className="rounded-md bg-emerald-50 p-1.5 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats?.delivered ?? 0}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {stats?.deliveredRate ?? "0%"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">100% 2048-bit RSA DKIM signed</p>
        </div>

        {/* Opens Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Unique Opens</span>
            <span className="rounded-md bg-blue-50 p-1.5 text-blue-600 border border-blue-100">
              <Eye className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats?.opened ?? 0}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              {stats?.openRate ?? "0%"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Tracked via 1x1 transparent pixel</p>
        </div>

        {/* Clicks Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Link Clicks</span>
            <span className="rounded-md bg-purple-50 p-1.5 text-purple-600 border border-purple-100">
              <MousePointer className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats?.clicked ?? 0}</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
              {stats?.clickRate ?? "0%"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">HMAC-signed click proxy redirects</p>
        </div>

        {/* Bounces Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Bounces</span>
            <span className="rounded-md bg-amber-50 p-1.5 text-amber-600 border border-amber-100">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats?.bounced ?? 0}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              {stats?.bounceRate ?? "0%"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Target &lt; 2.0% bounce threshold</p>
        </div>
      </div>

      {/* DAILY SENDING CAPACITY GAUGE CARD */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">24-Hour Sending Quota</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary-100 text-primary-800">
                {stats?.plan || "STARTER"} TIER
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Used {(stats?.quotaToday ?? 0).toLocaleString()} of {(stats?.quotaTotal ?? 100).toLocaleString()} emails today. Quota resets daily at 00:00 UTC.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Upgrade Capacity
          </Link>
        </div>
        <div className="mt-4">
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (stats?.quotaToday ?? 0) >= (stats?.quotaTotal || 100) * 0.9
                  ? "bg-rose-500"
                  : (stats?.quotaToday ?? 0) >= (stats?.quotaTotal || 100) * 0.75
                  ? "bg-amber-500"
                  : "bg-primary-600"
              }`}
              style={{
                width: `${Math.min(100, Math.round(((stats?.quotaToday ?? 0) / (stats?.quotaTotal || 100)) * 100))}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-mono">
            <span>{Math.round(((stats?.quotaToday ?? 0) / (stats?.quotaTotal || 100)) * 100)}% Consumed</span>
            <span>{Math.max(0, (stats?.quotaTotal ?? 100) - (stats?.quotaToday ?? 0)).toLocaleString()} Remaining</span>
          </div>
        </div>
      </div>

      {/* RECENT OUTBOUND EMAIL LOGS STREAM */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Live Email Activity</h2>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <Link
            href="/dashboard/logs"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View All Logs <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(recentEvents || []).length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Mail className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">No Email Activity Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your transactional email stream is ready. Send your first test email or generate an API key to start delivering emails.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setTestModalOpen(true);
                  setTestFeedback(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" /> 1-Click Test Email
              </button>
              <Link
                href="/dashboard/api-keys"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Key className="w-3.5 h-3.5" /> Generate API Key
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Recipient</th>
                  <th className="px-6 py-3.5">Domain</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">DKIM</th>
                  <th className="px-6 py-3.5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(recentEvents || []).map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{evt.to}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-700 border border-slate-200">
                        <Globe className="w-3 h-3 text-slate-500" />
                        {evt.domain || "custom"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{evt.subject}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          evt.status === "CLICKED"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : evt.status === "OPENED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : evt.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <ShieldCheck className="w-3.5 h-3.5" /> 2048-bit
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono" suppressHydrationWarning>
                      {evt.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ⚡ 1-CLICK INTERACTIVE TEST DISPATCH MODAL */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary-50 text-primary-600">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Send 1-Click Verification Test</h3>
                  <p className="text-xs text-slate-500">Test live inbox delivery in 5 seconds.</p>
                </div>
              </div>
              <button
                onClick={() => setTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {testFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium ${
                  testFeedback.success
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {testFeedback.message}
              </div>
            )}

            <form onSubmit={handleQuickSend} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient Email (Your Inbox):
                </label>
                <input
                  type="email"
                  required
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Line:</label>
                <input
                  type="text"
                  required
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                />
              </div>

              {!(domains || []).some((d) => d?.status === "VERIFIED") && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-[11px]">No verified domain found. Add and verify your domain to dispatch emails.</span>
                  </div>
                  <Link
                    href="/dashboard/domains"
                    className="font-bold underline text-amber-800 hover:text-amber-950 shrink-0 text-[11px]"
                  >
                    Verify Domain &rarr;
                  </Link>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                <strong>Sender:</strong>{" "}
                <span className="font-mono text-slate-800 font-bold">
                  {(domains || []).find((d) => d?.status === "VERIFIED")
                    ? `verify@${(domains || []).find((d) => d?.status === "VERIFIED").name}`
                    : "Pending Domain Verification"}
                </span>{" "}
                {(domains || []).some((d) => d?.status === "VERIFIED") && "(2048-bit RSA DKIM Authenticated)"}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingTest || !(domains || []).some((d) => d?.status === "VERIFIED")}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title={!(domains || []).some((d) => d?.status === "VERIFIED") ? "Please verify your custom domain in Domains first" : ""}
                >
                  {sendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{sendingTest ? "Sending Live..." : "Send Test Now"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
