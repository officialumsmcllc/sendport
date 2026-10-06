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
    quotaTotal: 500,
    plan: "STARTER",
  });

  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
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

  const quotaPct = Math.min(
    100,
    Math.round(((stats.quotaToday || 0) / (stats.quotaTotal || 500)) * 100)
  );

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">Live deliverability metrics, sending quota, and recent email events.</p>
        </div>
        <div className="flex items-center gap-2.5">
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
            <h2 className="text-base font-bold text-slate-900">Today&apos;s Sending Quota</h2>
            <p className="text-xs text-slate-500">Resets daily at 00:00 UTC. Upgrades take effect instantly.</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-black text-slate-900">
              {stats.quotaToday.toLocaleString()} / {stats.quotaTotal.toLocaleString()} emails
            </span>
            <span className="text-xs text-slate-500 block uppercase font-semibold">
              {stats.plan} Plan ({stats.quotaTotal.toLocaleString()}/day)
            </span>
          </div>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-brand-500 rounded-full transition-all"
            style={{ width: `${Math.max(stats.quotaToday > 0 ? 2 : 0, quotaPct)}%` }}
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
              <Link
                href="/dashboard/playground"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
              >
                <Send className="w-3.5 h-3.5" /> Send Test Email
              </Link>
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
    </div>
  );
}
