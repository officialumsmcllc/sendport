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

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
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
  });

  const [user, setUser] = useState<any>(null);
  const [domains, setDomains] = useState<any[]>([]);
  const [apiKeysCount, setApiKeysCount] = useState<number>(0);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  // Onboarding Wizard State
  const [wizardDismissed, setWizardDismissed] = useState(false);
  const [codeLang, setCodeLang] = useState<"curl" | "node" | "python" | "php">("curl");
  const [copiedCode, setCopiedCode] = useState(false);

  // Quick Test Dispatch Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testSubject, setTestSubject] = useState("Hello from Sendport! 🚀 Your deliverability is active");
  const [sendingTest, setSendingTest] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        if (data.user?.email && !testTo) {
          setTestTo(data.user.email);
        }
        setDomains(data.domains || []);
        setApiKeysCount(data.apiKeysCount || 0);

        if (data.stats) {
          setStats({
            sent: data.stats.delivered + data.stats.bounced,
            delivered: data.stats.delivered,
            deliveredRate: data.stats.deliveredRate,
            opened: data.stats.opened,
            openRate: data.stats.openRate,
            clicked: data.stats.clicked,
            clickRate: data.stats.clickRate,
            bounced: data.stats.bounced,
            bounceRate: data.stats.bounceRate,
            quotaToday: data.stats.usedToday,
            quotaTotal: data.stats.dailyQuota,
            plan: data.stats.plan || "STARTER",
          });
        }
        if (data.recentEmails) {
          setRecentEvents(data.recentEmails);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTo) return;

    try {
      setSendingTest(true);
      setTestFeedback(null);

      // Identify sender
      const verifiedDomain = domains.find((d) => d.status === "VERIFIED");
      const fromEmail = verifiedDomain
        ? `verify@${verifiedDomain.name}`
        : "onboarding@getsendport.com";

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
        fetchDashboardData();
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
  const step1 = true; // Claimed 100 daily quota
  const step2 = apiKeysCount > 0;
  const step3 = domains.some((d) => d.status === "VERIFIED");
  const step4 = stats.delivered > 0 || recentEvents.length > 0;

  const completedStepsCount = [step1, step2, step3, step4].filter(Boolean).length;
  const progressPercent = Math.round((completedStepsCount / 4) * 100);

  // Sample code snippets for Quickstart
  const senderDomain = domains.find((d) => d.status === "VERIFIED")?.name || "yourdomain.com";

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
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">Live deliverability metrics, sending quota, and recent email events.</p>
        </div>
        <div className="flex items-center gap-2.5">
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
              {progressPercent === 100 && (
                <button
                  onClick={() => setWizardDismissed(true)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Dismiss ✕
                </button>
              )}
            </div>
          </div>

          {/* 4 Interactive Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {/* Step 1: Free Daily Quota Claimed */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Step 1</span>
                  <span className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">100 Free Daily Emails</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Starter sandbox quota automatically allocated to your workspace.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Claimed Free
                </span>
              </div>
            </div>

            {/* Step 2: Secret API Key */}
            <div
              className={`p-4 rounded-2xl bg-white border shadow-xs flex flex-col justify-between ${
                step2 ? "border-slate-200/80" : "border-primary-200 ring-1 ring-primary-200/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Step 2</span>
                  {step2 ? (
                    <span className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-full bg-primary-50 text-primary-600">
                      <Key className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900">Generate API Key</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Create a live secret key (`sk_live_...`) to connect your app or SDK.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {step2 ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {apiKeysCount} Active Key{apiKeysCount > 1 ? "s" : ""}
                  </span>
                ) : (
                  <Link
                    href="/dashboard/api-keys"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700"
                  >
                    <span>Create API Key</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Step 3: Verified Domain */}
            <div
              className={`p-4 rounded-2xl bg-white border shadow-xs flex flex-col justify-between ${
                step3 ? "border-slate-200/80" : step2 ? "border-primary-200 ring-1 ring-primary-200/50" : "border-slate-200/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Step 3</span>
                  {step3 ? (
                    <span className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-full bg-blue-100 text-blue-700">
                      <Globe className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900">Add Sender Domain</h4>
                <p className="text-xs text-slate-500 mt-1">
                  1-Click Cloudflare DNS sync for 2048-bit RSA DKIM & SPF records.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {step3 ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Domain Verified
                  </span>
                ) : (
                  <Link
                    href="/dashboard/domains"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800"
                  >
                    <span>Add Domain</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Step 4: Dispatch First Email */}
            <div
              className={`p-4 rounded-2xl bg-white border shadow-xs flex flex-col justify-between ${
                step4 ? "border-slate-200/80" : step3 ? "border-primary-200 ring-1 ring-primary-200/50" : "border-slate-200/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Step 4</span>
                  {step4 ? (
                    <span className="p-1 rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-full bg-primary-50 text-primary-600">
                      <Send className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900">Send First Live Email</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Test your inbox landing in under 5 seconds with zero code.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {step4 ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setTestModalOpen(true);
                      setTestFeedback(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 cursor-pointer"
                  >
                    <span>1-Click Test Dispatch</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Developer Quick-Copy Code Accordion */}
          <div className="mt-6 pt-5 border-t border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary-600" />
                Integrate into your codebase in 30 seconds:
              </span>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(["curl", "node", "python", "php"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCodeLang(lang)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                      codeLang === lang
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {lang === "node" ? "Node.js" : lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner border border-slate-800">
              <button
                onClick={() => copyCode(codeSnippets[codeLang])}
                className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold transition-all border border-slate-700 cursor-pointer"
              >
                <Copy className="w-3 h-3 text-slate-300" />
                <span>{copiedCode ? "Copied!" : "Copy"}</span>
              </button>
              <pre className="pr-16 whitespace-pre font-mono text-[11px] leading-relaxed">{codeSnippets[codeLang]}</pre>
            </div>
          </div>
        </div>
      )}

      {/* METRIC STAT CARDS */}
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
            <span className="text-2xl font-black text-slate-900">{stats.delivered}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {stats.deliveredRate}
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
            <span className="text-2xl font-black text-slate-900">{stats.opened}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              {stats.openRate}
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
            <span className="text-2xl font-black text-slate-900">{stats.clicked}</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
              {stats.clickRate}
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
            <span className="text-2xl font-black text-slate-900">{stats.bounced}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              {stats.bounceRate}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Auto-suppressed hard bounces</p>
        </div>
      </div>

      {/* DAILY QUOTA PROGRESS BAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Today&apos;s Dispatch Quota</h3>
            <p className="text-xs text-slate-500">Resets daily at 00:00 UTC. Plan: <strong className="text-slate-800">{stats.plan}</strong></p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-slate-900 font-mono">
              {stats.quotaToday} / {stats.quotaTotal}
            </span>
            <span className="text-xs text-slate-400 ml-1">emails today</span>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.round(((stats.quotaToday || 0) / (stats.quotaTotal || 100)) * 100))}%` }}
          />
        </div>
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
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

        {recentEvents.length === 0 && !loading ? (
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
                {recentEvents.map((evt) => (
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
                    <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono">{evt.time}</td>
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

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                <strong>Sender:</strong>{" "}
                <span className="font-mono text-slate-800">
                  {domains.find((d) => d.status === "VERIFIED")
                    ? `verify@${domains.find((d) => d.status === "VERIFIED").name}`
                    : "onboarding@getsendport.com"}
                </span>{" "}
                (2048-bit RSA DKIM Authenticated)
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
                  disabled={sendingTest}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-extrabold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
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
