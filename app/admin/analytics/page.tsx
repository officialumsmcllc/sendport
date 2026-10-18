"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Mail,
  CheckCircle2,
  DollarSign,
  Users,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Building2,
  Globe2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  Activity,
  Layers
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              Executive Intelligence
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Real-Time Platform KPI Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 mt-1.5">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            Global Platform Analytics & Revenue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time aggregate delivery throughput, platform earnings, subscription breakdowns, and workspace activity.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d1424] px-3.5 py-2 text-xs font-bold text-white hover:bg-white/5 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Platform Revenue */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Volume Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {loading ? (
              <div className="h-9 w-24 bg-white/5 rounded animate-pulse" />
            ) : (
              <span className="text-3xl font-black text-white font-mono">
                ${(metrics?.totalRevenueUSD || 0).toLocaleString()}
              </span>
            )}
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> USD
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics?.pendingTransactionsCount || 0} manual approvals pending
          </p>
        </div>

        {/* Global Delivered Emails */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Emails Processed</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {loading ? (
              <div className="h-9 w-20 bg-white/5 rounded animate-pulse" />
            ) : (
              <span className="text-3xl font-black text-white font-mono">
                {(metrics?.totalEmails || 0).toLocaleString()}
              </span>
            )}
            <span className="text-xs font-semibold text-sky-400">Sent</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics?.deliveryRate || "99.8"}% Platform Deliverability
          </p>
        </div>

        {/* Active Workspaces & Users */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Accounts</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {loading ? (
              <div className="h-9 w-16 bg-white/5 rounded animate-pulse" />
            ) : (
              <span className="text-3xl font-black text-white font-mono">
                {(metrics?.totalUsers || 0).toLocaleString()}
              </span>
            )}
            <span className="text-xs font-semibold text-amber-400">Users</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics?.totalWorkspaces || 0} Workspaces • {metrics?.totalAdmins || 1} Admins
          </p>
        </div>

        {/* Verified Custom Sending Domains */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sending Domains</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {loading ? (
              <div className="h-9 w-16 bg-white/5 rounded animate-pulse" />
            ) : (
              <span className="text-3xl font-black text-white font-mono">
                {(metrics?.totalDomains || 0).toLocaleString()}
              </span>
            )}
            <span className="text-xs font-semibold text-purple-400">Total</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics?.verifiedDomains || 0} DKIM & SPF Verified
          </p>
        </div>
      </div>

      {/* Deliverability & Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deliverability Health Radar */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Delivery Health Metrics
            </h3>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              Optimal
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-semibold">
                <span className="text-slate-400">Successful Delivery Rate</span>
                <span className="text-emerald-400 font-mono font-bold">{metrics?.deliveryRate || "99.8"}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#080d19] overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${Math.min(Number(metrics?.deliveryRate || 99.8), 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-semibold">
                <span className="text-slate-400">Open Tracking Rate</span>
                <span className="text-sky-400 font-mono font-bold">{metrics?.openRate || "0.0"}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#080d19] overflow-hidden border border-white/5">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${Math.min(Number(metrics?.openRate || 0), 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-semibold">
                <span className="text-slate-400">Click Through Rate</span>
                <span className="text-amber-400 font-mono font-bold">{metrics?.clickRate || "0.0"}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#080d19] overflow-hidden border border-white/5">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(Number(metrics?.clickRate || 0), 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-semibold">
                <span className="text-slate-400">Global Bounce Rate</span>
                <span className="text-rose-400 font-mono font-bold">{metrics?.bounceRate || "0.15"}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#080d19] overflow-hidden border border-white/5">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${Math.min(Number(metrics?.bounceRate || 0.15) * 10, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plan Tier Distribution */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-400" />
              Active Subscription Tiers
            </h3>
            <span className="text-[11px] font-mono text-slate-400">{metrics?.totalWorkspaces || 0} Total</span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-[#080d19]">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-slate-400" />
                <div>
                  <p className="text-xs font-bold text-white">Starter Free</p>
                  <p className="text-[10px] text-slate-400">100 emails/day</p>
                </div>
              </div>
              <span className="text-sm font-black text-white font-mono">{metrics?.plans?.starter || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/5">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-sky-400" />
                <div>
                  <p className="text-xs font-bold text-sky-300">Growth Pro</p>
                  <p className="text-[10px] text-slate-400">3,000 emails/day ($20/mo)</p>
                </div>
              </div>
              <span className="text-sm font-black text-sky-400 font-mono">{metrics?.plans?.growth || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div>
                  <p className="text-xs font-bold text-amber-300">Scale Enterprise</p>
                  <p className="text-[10px] text-slate-400">25,000 emails/day ($79/mo)</p>
                </div>
              </div>
              <span className="text-sm font-black text-amber-400 font-mono">{metrics?.plans?.scale || 0}</span>
            </div>
          </div>
        </div>

        {/* Global Relay Speed & SLA */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              SLA & Dispatch Latency
            </h3>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              99.99% SLA
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-white/5 bg-[#080d19] text-center">
              <p className="text-2xl font-black text-emerald-400 font-mono">18ms</p>
              <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Median Dispatch</p>
            </div>
            <div className="p-3.5 rounded-xl border border-white/5 bg-[#080d19] text-center">
              <p className="text-2xl font-black text-sky-400 font-mono">100%</p>
              <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">DKIM Sign Rate</p>
            </div>
            <div className="p-3.5 rounded-xl border border-white/5 bg-[#080d19] text-center">
              <p className="text-2xl font-black text-amber-400 font-mono">250/s</p>
              <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Peak Capacity</p>
            </div>
            <div className="p-3.5 rounded-xl border border-white/5 bg-[#080d19] text-center">
              <p className="text-2xl font-black text-purple-400 font-mono">0</p>
              <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Relay Queue Lag</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Sending Workspaces Table */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1424] overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#080d19]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            Top Active Workspaces by Volume
          </h3>
          <span className="text-xs text-slate-400 font-mono">Live 24h Activity</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/5 bg-[#080d19] text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Workspace</th>
                <th className="px-4 py-3">Plan Tier</th>
                <th className="px-4 py-3">Daily Quota Usage</th>
                <th className="px-4 py-3">Domains</th>
                <th className="px-4 py-3 text-right">Total Emails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {metrics?.topWorkspaces?.length > 0 ? (
                metrics.topWorkspaces.map((ws: any) => {
                  const pct = Math.round((ws.usedToday / (ws.dailyQuota || 1)) * 100);
                  return (
                    <tr key={ws.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {ws.name}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            ws.plan === "SCALE_PRO"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : ws.plan === "GROWTH"
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                              : "bg-white/5 text-slate-300 border border-white/10"
                          }`}
                        >
                          {ws.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-medium font-mono">
                            {ws.usedToday} / {ws.dailyQuota.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">({pct}%)</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 font-mono">{ws._count?.domains || 0}</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-amber-400 text-right">
                        {(ws._count?.emails || 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No active workspaces found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
