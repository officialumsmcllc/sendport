"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  CreditCard,
  Mail,
  Globe2,
  Server,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Lock,
  ExternalLink,
  ShieldCheck,
  FileText,
} from "lucide-react";
import type { AdminInitialData } from "@/lib/data/admin-overview";

export default function AdminDashboardClient({ initialData }: { initialData: AdminInitialData }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(initialData);
  const [autoSync, setAutoSync] = useState(true);
  const [lastSynced, setLastSynced] = useState<string>("");

  const fetchOverview = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastSynced(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } catch (e) {
      console.error("Failed to load admin overview:", e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // 10-second silent background poller
  useEffect(() => {
    if (!autoSync) return;
    const timer = setInterval(() => {
      fetchOverview(false);
    }, 10000);
    return () => clearInterval(timer);
  }, [autoSync]);

  const metrics = data?.metrics || initialData.metrics;
  const health = data?.systemHealth || initialData.systemHealth;

  return (
    <div className="space-y-8">
      {/* EXECUTIVE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Mission Control • Platform Superadmin</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Sendport Executive Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Real-time aggregate delivery throughput, platform earnings, and cluster telemetry.</span>
            {lastSynced && (
              <span className="text-slate-500 font-mono hidden sm:inline" suppressHydrationWarning>
                • Synced at {lastSynced}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Telemetry Auto-Sync Toggle */}
          <button
            onClick={() => setAutoSync(!autoSync)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              autoSync
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
            title="Toggle automatic 10-second live background refresh"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                autoSync ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
              }`}
            />
            <span>{autoSync ? "Live (10s Sync)" : "Paused"}</span>
          </button>

          <Link
            href="/dashboard"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <span>Customer View</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <button
            onClick={() => fetchOverview(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* PENDING ACTIONS ALERT BANNER */}
      {metrics.pendingPaymentsCount > 0 ? (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 animate-pulse">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Action Required: Payment Verification Queue</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-slate-950">
                  {metrics.pendingPaymentsCount} Pending
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Customers have submitted manual transfer slips (Easypaisa / JazzCash / USDT). 
                Verify their transaction IDs and activate their high-volume quotas immediately.
              </p>
            </div>
          </div>
          <Link
            href="/admin/payments"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-lg transition-all shrink-0 active:scale-95"
          >
            <span>Review Slips Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-300 font-medium">
              All payment verification queues are currently cleared. Zero pending slips.
            </span>
          </div>
          <Link
            href="/admin/payments"
            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View Payment Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* TOP 6 MISSION CONTROL KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* REVENUE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Approved Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">${metrics.revenueUsd.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-1 font-mono">PKR {metrics.revenuePkr.toLocaleString()}</p>
        </div>

        {/* WORKSPACES & USERS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tenants</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">{metrics.totalWorkspaces.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">{metrics.totalUsers.toLocaleString()} User Accounts</p>
        </div>

        {/* EMAILS SENT */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sent</span>
            <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">{metrics.totalEmails.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">{metrics.todayEmails.toLocaleString()} Today</p>
        </div>

        {/* DELIVERY RATE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Rate</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-3">{metrics.deliveryRate}</p>
          <p className="text-xs text-slate-400 mt-1">Bounce {metrics.bounceRate}</p>
        </div>

        {/* DOMAINS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Domains</span>
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">{metrics.totalDomains.toLocaleString()}</p>
          <p className="text-xs text-purple-400 mt-1">{metrics.verifiedDomains.toLocaleString()} Verified DNS</p>
        </div>

        {/* AUDIENCES / CONTACTS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Leads</span>
            <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-3">{metrics.totalContacts.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">{metrics.totalAudiences.toLocaleString()} Audiences</p>
        </div>
      </div>

      {/* CLUSTER HEALTH & ENGINE DIAGNOSTICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">REST API Gateway</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Global Cluster</h4>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {health.api}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">MTA & SMTP Daemons</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Port 587 / 465</h4>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {health.smtp}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Database Connection</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Supabase Pooler</h4>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {health.database}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">DKIM Signing Vault</span>
            <h4 className="text-sm font-bold text-white mt-0.5">OpenSSL SHA-256</h4>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {health.dkim}
          </span>
        </div>
      </div>

      {/* PLAN BREAKDOWN & RECENT CUSTOMER SIGNUPS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Breakdown Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Subscription Tier Breakdown
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-300">STARTER Tier</span>
                  <span className="font-mono text-white">{metrics.planCounts?.STARTER || 0} workspaces</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-slate-600 rounded-full"
                    style={{
                      width: `${
                        metrics.totalWorkspaces > 0
                          ? Math.round(((metrics.planCounts?.STARTER || 0) / metrics.totalWorkspaces) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-primary-400">GROWTH Tier ($29/mo)</span>
                  <span className="font-mono text-white">{metrics.planCounts?.GROWTH || 0} workspaces</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{
                      width: `${
                        metrics.totalWorkspaces > 0
                          ? Math.round(((metrics.planCounts?.GROWTH || 0) / metrics.totalWorkspaces) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-amber-400">SCALE PRO Tier ($99/mo)</span>
                  <span className="font-mono text-white">{metrics.planCounts?.SCALE_PRO || 0} workspaces</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${
                        metrics.totalWorkspaces > 0
                          ? Math.round(((metrics.planCounts?.SCALE_PRO || 0) / metrics.totalWorkspaces) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between">
            <Link
              href="/admin/subscriptions"
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1.5"
            >
              <span>Manage Subscriptions Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-slate-400 hover:text-white"
            >
              Users Directory &rarr;
            </Link>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Recent User Registrations
            </h2>
            <Link href="/admin/users" className="text-xs font-bold text-indigo-400 hover:underline">
              View All Users &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(data?.recentSignups || initialData.recentSignups || []).map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {u.name || "Anonymous User"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {u.email}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          u.role === "ADMIN"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]" suppressHydrationWarning>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AUDIT LOG RECENT SNIPPETS */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Real-Time Security Audit Stream
              </span>
              <Link href="/admin/audit" className="text-[11px] text-amber-400 hover:underline">
                Full Audit Trail &rarr;
              </Link>
            </div>
            <div className="space-y-2">
              {(data?.recentAuditLogs || initialData.recentAuditLogs || []).slice(0, 4).map((log: any) => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono font-bold text-amber-400 text-[10px]">
                      {log.action}
                    </span>
                    <span className="text-slate-300 truncate max-w-xs">
                      {log.user?.email || "System"}
                    </span>
                  </div>
                  <span className="text-slate-500 font-mono text-[10px]" suppressHydrationWarning>
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* USER CONTENT & EMAIL TEMPLATES ACTIVITY STREAM */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Customer Email Templates & Content Stream
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Recently drafted or updated email templates across all tenant workspaces
            </p>
          </div>
          <Link
            href="/admin/templates"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
          >
            <span>View All Templates & Audit HTML</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(!data?.recentTemplates || data.recentTemplates.length === 0) ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/60">
            <p className="text-xs text-slate-400">No user email templates created yet. Users can build HTML templates from customer dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.recentTemplates.map((t: any) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300 truncate max-w-[150px]">
                      {t.workspace?.name || "Workspace"}
                    </span>
                    <span className="font-mono text-slate-500 text-[10px]" suppressHydrationWarning>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{t.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    Subject: {t.subject || "(No subject)"}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 truncate max-w-[140px] text-[10px]">
                    {t.workspace?.members?.[0]?.user?.email || t.workspace?.user?.email || "Tenant Owner"}
                  </span>
                  <Link
                    href="/admin/templates"
                    className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
