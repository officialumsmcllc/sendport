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
} from "lucide-react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load admin overview:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const metrics = data?.metrics || {
    totalUsers: 0,
    totalWorkspaces: 0,
    planCounts: { STARTER: 0, GROWTH: 0, SCALE_PRO: 0 },
    revenueUsd: 0,
    revenuePkr: 0,
    pendingPaymentsCount: 0,
    totalEmails: 0,
    todayEmails: 0,
    deliveryRate: "99.98%",
    bounceRate: "0.02%",
    totalDomains: 0,
    verifiedDomains: 0,
  };

  const health = data?.systemHealth || {
    api: "OPERATIONAL",
    smtp: "LISTENING (Port 587 / 465)",
    database: "CONNECTED",
    dkim: "ACTIVE (RSA-2048)",
  };

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
          <p className="text-xs text-slate-400 mt-1">
            Real-time aggregate delivery throughput, platform earnings, subscription breakdowns, and system health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <span>Customer View</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Live Metrics</span>
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

      {/* TOP 4 MISSION CONTROL KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* REVENUE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Approved Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-white font-mono">
            ${metrics.revenueUsd.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>~PKR {metrics.revenuePkr.toLocaleString()}</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Stripe + Manual
            </span>
          </div>
        </div>

        {/* WORKSPACES & USERS */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Accounts</span>
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-white font-mono">
            {metrics.totalUsers.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 truncate">
            {metrics.totalWorkspaces} Workspaces (G: {metrics.planCounts.GROWTH} | P: {metrics.planCounts.SCALE_PRO})
          </div>
        </div>

        {/* EMAILS TODAY */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Dispatch</span>
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-white font-mono">
            {metrics.todayEmails.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold">Inbox Rate: {metrics.deliveryRate}</span>
            <span className="text-slate-500">{metrics.totalEmails.toLocaleString()} total</span>
          </div>
        </div>

        {/* DOMAINS & DKIM */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Domains</span>
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-white font-mono">
            {metrics.verifiedDomains} / {metrics.totalDomains}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>2048-bit RSA DKIM Active</span>
          </div>
        </div>
      </div>

      {/* QUICK COMMAND SHORTCUTS */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Superadmin Quick Action Center
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/payments"
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-amber-500/40 hover:bg-slate-900 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <CreditCard className="w-5 h-5 text-amber-400" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-white">Payment Approvals</div>
              <div className="text-[10px] text-slate-500">Verify manual slips</div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-sky-500/40 hover:bg-slate-900 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Users className="w-5 h-5 text-sky-400" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 transition-colors" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-white">User Accounts & Quotas</div>
              <div className="text-[10px] text-slate-500">Upgrade customer plans</div>
            </div>
          </Link>

          <Link
            href="/admin/domains"
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-emerald-500/40 hover:bg-slate-900 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Globe2 className="w-5 h-5 text-emerald-400" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-white">Customer Domains</div>
              <div className="text-[10px] text-slate-500">Inspect DNS & DKIM</div>
            </div>
          </Link>

          <Link
            href="/admin/broadcasts"
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-purple-500/40 hover:bg-slate-900 transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 transition-colors" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-white">Platform Broadcast</div>
              <div className="text-[10px] text-slate-500">Announce system updates</div>
            </div>
          </Link>
        </div>
      </div>

      {/* SYSTEM INFRASTRUCTURE MONITOR & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: SYSTEM HEALTH MONITOR */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                Infrastructure Health
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </span>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Edge REST API</div>
                  <div className="text-[10px] text-slate-500">Next.js Global Dispatch</div>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  {health.api}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">SMTP Relay Service</div>
                  <div className="text-[10px] text-slate-500">smtp.getsendport.com</div>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  {health.smtp}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">PostgreSQL Database</div>
                  <div className="text-[10px] text-slate-500">Prisma Connection Pool</div>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  {health.database}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Cryptographic DKIM</div>
                  <div className="text-[10px] text-slate-500">RSA-2048 Digital Signatures</div>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  {health.dkim}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-6 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Primary Datacenter</span>
            <span className="font-mono text-slate-400">Frankfurt / AWS Edge</span>
          </div>
        </div>

        {/* RIGHT: RECENT PLATFORM SIGNUPS & AUDIT TRAIL */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" />
              Recent Platform Signups & Activity
            </h2>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>View All Users</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(data?.recentSignups || []).map((u: any) => (
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
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
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
              {(data?.recentAuditLogs || []).slice(0, 4).map((log: any) => (
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
                  <span className="text-slate-500 font-mono text-[10px]">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
