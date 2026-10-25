// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Flame,
  Radio,
  Layers,
  ArrowUpRight,
  Filter,
  BarChart2,
  ChevronRight,
  ShieldCheck,
  Building,
  Mail,
  Zap,
} from "lucide-react";

interface CampaignItem {
  id: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  remainingCount: number;
  progressPercent: number;
  status: "SENDING" | "COMPLETED" | "FAILED" | string;
  workspaceId: string;
  workspaceName: string;
  ownerName: string;
  ownerEmail: string;
  audienceId: string;
  audienceName: string;
  createdAt: string;
}

interface CampaignMetrics {
  totalCampaigns: number;
  totalTargeted: number;
  totalSent: number;
  totalRemaining: number;
  totalFailed: number;
  activeSendingCount: number;
}

export default function AdminCampaignsPage() {
  const [metrics, setMetrics] = useState<CampaignMetrics>({
    totalCampaigns: 0,
    totalTargeted: 0,
    totalSent: 0,
    totalRemaining: 0,
    totalFailed: 0,
    activeSendingCount: 0,
  });
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleResend = async (blastId: string) => {
    try {
      setRetryingId(blastId);
      setActionMessage("Initiating campaign resend via Autonomous MTA...");
      const res = await fetch("/api/admin/campaigns/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blastId }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`🚀 Dispatched! ${data.message || "Sending live..."}`);
        fetchCampaignsData(false);
      } else {
        setActionMessage(`❌ Error: ${data.error || "Failed to resend"}`);
      }
    } catch (err: any) {
      setActionMessage(`❌ Network error: ${err.message}`);
    } finally {
      setRetryingId(null);
      setTimeout(() => setActionMessage(null), 8000);
    }
  };

  const fetchCampaignsData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await fetch("/api/admin/campaigns");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics || {
          totalCampaigns: 0,
          totalTargeted: 0,
          totalSent: 0,
          totalRemaining: 0,
          totalFailed: 0,
          activeSendingCount: 0,
        });
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error("Failed to load campaigns telemetry:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCampaignsData();
  }, []);

  // Live background polling every 10 seconds if autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchCampaignsData(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      searchQuery === "" ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.fromEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.workspaceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.audienceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || c.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Bulk Telemetry
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-mono">Autonomous MTA Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Send className="w-7 h-7 text-emerald-400" />
            Global Campaigns & Blasts
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time monitoring of all customer broadcasts, queued batches, sent deliveries, and remaining recipients.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              autoRefresh
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                : "bg-zinc-900/60 text-zinc-400 border-white/10 hover:text-white"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? "animate-pulse text-emerald-400" : ""}`} />
            Auto-Sync (10s)
          </button>

          <button
            onClick={() => fetchCampaignsData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-lg border border-white/10 text-xs font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
            Refresh Feed
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Campaigns */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Campaigns</p>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-black tracking-tight text-white">{metrics.totalCampaigns.toLocaleString()}</p>
            <span className="text-xs text-zinc-500 font-medium">broadcasts</span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Targeting <span className="text-zinc-200 font-semibold">{metrics.totalTargeted.toLocaleString()}</span> total recipients
          </div>
        </div>

        {/* Total Emails Sent */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Emails Delivered</p>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-black tracking-tight text-emerald-400">{metrics.totalSent.toLocaleString()}</p>
            <span className="text-xs text-emerald-500/70 font-medium">delivered</span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Directly dispatched over Port 25 via Autonomous MTA
          </div>
        </div>

        {/* In-Flight Remaining */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Remaining / Queue</p>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-black tracking-tight text-amber-400">{metrics.totalRemaining.toLocaleString()}</p>
            <span className="text-xs text-amber-500/70 font-medium">pending</span>
          </div>
          <div className="mt-2 text-xs text-zinc-400 flex items-center gap-1.5">
            {metrics.activeSendingCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {metrics.activeSendingCount} active campaign{metrics.activeSendingCount > 1 ? "s" : ""} sending now
              </span>
            ) : (
              <span>Queue clear & idle</span>
            )}
          </div>
        </div>

        {/* Failed / Dropped */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Failed / Dropouts</p>
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-black tracking-tight text-rose-400">{metrics.totalFailed.toLocaleString()}</p>
            <span className="text-xs text-rose-500/70 font-medium">errors</span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Bounced, invalid MX, or rejected recipients
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-medium flex items-center justify-between shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-zinc-400 hover:text-white px-2 py-0.5 rounded text-xs transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-900/50 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by subject, sender, workspace, or audience..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-950/80 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-lg border border-white/5">
          {["ALL", "SENDING", "COMPLETED", "FAILED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === tab
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab === "SENDING" ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Sending
                </span>
              ) : (
                tab
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Telemetry Table */}
      <div className="rounded-xl border border-white/10 bg-zinc-900/30 overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Campaigns Roster & Live Telemetry ({filteredCampaigns.length})
            </h2>
          </div>
          <span className="text-xs text-zinc-500">Auto-calculated progress & in-queue remaining</span>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">Loading global campaigns from database...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-white/10 flex items-center justify-center mx-auto mb-3 text-zinc-500">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No campaigns found</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto mt-1">
              {searchQuery || statusFilter !== "ALL"
                ? "No campaigns match the current filter or search criteria."
                : "No email campaigns have been dispatched yet. When customers launch broadcasts from their Audiences dashboard, they will stream here in real time."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/60 text-zinc-400 border-b border-white/5 uppercase font-mono tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Campaign Subject & Sender</th>
                  <th className="py-3.5 px-4 font-semibold">Workspace & Owner</th>
                  <th className="py-3.5 px-4 font-semibold">Audience List</th>
                  <th className="py-3.5 px-4 font-semibold min-w-[200px]">Live Progress & Counters</th>
                  <th className="py-3.5 px-4 font-semibold">Remaining</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Launched</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {filteredCampaigns.map((c) => {
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Campaign Subject & Sender */}
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-lg bg-zinc-800/80 border border-white/10 text-emerald-400 shrink-0 mt-0.5">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm line-clamp-1">{c.subject}</div>
                            <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>From:</span>
                              <span className="text-zinc-300">{c.fromName ? `${c.fromName} <${c.fromEmail}>` : c.fromEmail}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Workspace & Owner */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <div>
                            <div className="font-medium text-white">{c.workspaceName}</div>
                            <div className="text-[11px] text-zinc-400">{c.ownerEmail}</div>
                          </div>
                        </div>
                      </td>

                      {/* Audience List */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="font-medium text-zinc-200">{c.audienceName}</span>
                        </div>
                      </td>

                      {/* Live Progress & Counters */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-white">
                              {c.sentCount.toLocaleString()} <span className="text-zinc-500">/ {c.totalRecipients.toLocaleString()} sent</span>
                            </span>
                            <span className="font-mono text-emerald-400 font-bold">{c.progressPercent}%</span>
                          </div>
                          {/* Progress bar track */}
                          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden border border-white/5">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                c.status === "SENDING"
                                  ? "bg-gradient-to-r from-amber-500 to-emerald-400 animate-pulse"
                                  : c.status === "FAILED"
                                  ? "bg-rose-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.max(5, c.progressPercent)}%` }}
                            />
                          </div>
                          {c.failedCount > 0 && (
                            <div className="text-[10px] text-rose-400 flex items-center gap-1 font-mono">
                              <AlertTriangle className="w-3 h-3" />
                              {c.failedCount} failed delivery attempts
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Remaining Count */}
                      <td className="py-4 px-4">
                        {c.remainingCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                            <Clock className="w-3 h-3 animate-spin" />
                            {c.remainingCount.toLocaleString()} left
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {c.status === "SENDING" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Sending Live
                          </span>
                        ) : c.status === "FAILED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-white/10">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Delivered
                          </span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-4 text-right font-mono text-zinc-400 text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        <span className="text-zinc-500">
                          {new Date(c.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleResend(c.id)}
                          disabled={retryingId === c.id || c.status === "SENDING"}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 disabled:opacity-50 hover:scale-105 active:scale-95 shadow-sm"
                          title="Resend this campaign over live Autonomous MTA"
                        >
                          {retryingId === c.id || c.status === "SENDING" ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Resend</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
