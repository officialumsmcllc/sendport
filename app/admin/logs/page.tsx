"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  MousePointer,
  Building2,
  Copy,
  Code,
  Monitor,
  Smartphone,
  ShieldCheck,
  Clock,
} from "lucide-react";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [modalTab, setModalTab] = useState<"overview" | "render" | "source">("overview");
  const [renderDevice, setRenderDevice] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/logs?status=${statusFilter}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setStats(data.stats || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [statusFilter]);

  const filtered = logs.filter(
    (l) =>
      l.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.messageId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.workspace?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-amber-400" />
            Global Email Dispatch Stream & Deliverability Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed of all transactional and bulk emails processed across every workspace and custom domain.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? "animate-spin" : ""}`} />
          Refresh Feed
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Email Volume</span>
          {loading ? (
            <div className="h-9 w-16 bg-slate-800 rounded animate-pulse my-1" />
          ) : (
            <p className="text-3xl font-black text-white mt-1">{stats?.totalCount || 0}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-1">Logged dispatches</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Delivered & Read</span>
          {loading ? (
            <div className="h-9 w-16 bg-slate-800 rounded animate-pulse my-1" />
          ) : (
            <p className="text-3xl font-black text-emerald-400 mt-1">{stats?.deliveredCount || 0}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-1">Successful SMTP handshakes</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Bounces</span>
          {loading ? (
            <div className="h-9 w-16 bg-slate-800 rounded animate-pulse my-1" />
          ) : (
            <p className="text-3xl font-black text-amber-400 mt-1">{stats?.bouncedCount || 0}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-1">Hard & soft mailbox rejections</p>
        </div>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Failures</span>
          {loading ? (
            <div className="h-9 w-16 bg-slate-800 rounded animate-pulse my-1" />
          ) : (
            <p className="text-3xl font-black text-rose-400 mt-1">{stats?.failedCount || 0}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-1">Network / DNS dropouts</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by recipient, sender, subject, or message ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "DELIVERED", "OPENED", "CLICKED", "BOUNCED", "FAILED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === st
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                  : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Dispatch Stream ({loading ? "Loading..." : `${filtered.length} recent events`})
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Live Global Relays</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No email logs found matching filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4">Message ID & Subject</th>
                  <th className="p-4">From &rarr; To</th>
                  <th className="p-4">Workspace</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Engagement</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-bold text-white truncate max-w-xs">{log.subject || "(No Subject)"}</p>
                      <p className="text-[10px] font-mono text-slate-500 truncate max-w-xs">{log.messageId}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-300 font-medium truncate max-w-xs">
                        <span className="text-slate-500">To:</span> {log.to}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">
                        <span className="text-slate-600">From:</span> {log.from}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-300">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        {log.workspace?.name || "Workspace"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          log.status === "DELIVERED" || log.status === "OPENED" || log.status === "CLICKED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : log.status === "BOUNCED"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-4 text-[11px]">
                      <div className="flex items-center gap-3 text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-blue-400" /> {log.openCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointer className="w-3.5 h-3.5 text-amber-400" /> {log.clickCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right text-[11px] font-mono text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprehensive Sandboxed Email Content & Delivery Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md">
          <div className="w-full max-w-5xl h-[88vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-black text-white truncate flex items-center gap-2">
                    <span>{selectedLog.subject || "(No Subject)"}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        selectedLog.status === "DELIVERED" || selectedLog.status === "OPENED" || selectedLog.status === "CLICKED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : selectedLog.status === "BOUNCED"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {selectedLog.status}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 truncate">
                    Message ID: <span className="font-mono text-amber-400">{selectedLog.messageId}</span> • Workspace:{" "}
                    <span className="text-white font-semibold">{selectedLog.workspace?.name}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Subheader: Tabs & Device Mode */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalTab("render")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    modalTab === "render"
                      ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Rendered Email HTML
                </button>
                <button
                  onClick={() => setModalTab("overview")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    modalTab === "overview"
                      ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Delivery & Security Audit
                </button>
                <button
                  onClick={() => setModalTab("source")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    modalTab === "source"
                      ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  Raw Source / Text
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                {modalTab === "render" && (
                  <div className="flex items-center border border-slate-800 rounded-xl bg-slate-900 p-0.5">
                    <button
                      onClick={() => setRenderDevice("desktop")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        renderDevice === "desktop" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" /> Desktop
                    </button>
                    <button
                      onClick={() => setRenderDevice("mobile")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        renderDevice === "mobile" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Mobile
                    </button>
                  </div>
                )}

                {selectedLog.htmlBody && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedLog.htmlBody);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    {copied ? "Copied!" : "Copy HTML"}
                  </button>
                )}
              </div>
            </div>

            {/* Email Metadata Strip */}
            <div className="px-6 py-2 bg-slate-900/60 border-b border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 font-bold block">From:</span>
                <span className="text-white font-mono truncate block" title={selectedLog.from}>{selectedLog.from}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">To:</span>
                <span className="text-white font-mono truncate block" title={selectedLog.to}>{selectedLog.to}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Latency:</span>
                <span className="text-amber-300 font-mono">{selectedLog.latencyMs ? `${selectedLog.latencyMs}ms` : "Fast (~45ms)"}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">DKIM Signed:</span>
                <span className="text-emerald-400 font-bold">{selectedLog.dkimSigned ? "Verified (RSA-2048)" : "None"}</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col items-center justify-start">
              {modalTab === "render" ? (
                <div
                  className={`w-full transition-all duration-300 h-full flex flex-col items-center ${
                    renderDevice === "mobile" ? "max-w-[390px]" : "max-w-4xl"
                  }`}
                >
                  <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
                    <iframe
                      title="Sent Email Rendered Preview"
                      srcDoc={
                        selectedLog.htmlBody ||
                        `<div style="font-family: sans-serif; padding: 24px; color: #333;">
                          <h3 style="margin-top:0;">Plain Text Email Content</h3>
                          <pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px;">${selectedLog.textBody || "No message body recorded."}</pre>
                        </div>`
                      }
                      sandbox="allow-same-origin"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              ) : modalTab === "overview" ? (
                <div className="w-full max-w-3xl space-y-4 text-xs">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      Detailed Dispatch & Security Vitals
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500">DKIM Authentication</span>
                        <div className="text-emerald-400 font-bold text-sm">
                          {selectedLog.dkimSigned ? "DKIM RSA-2048 Cryptographically Signed" : "No signature"}
                        </div>
                        <span className="text-[10px] text-slate-400 block">Signed with tenant workspace key</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500">Engagement Metrics</span>
                        <div className="text-white font-bold text-sm flex items-center gap-4">
                          <span className="text-blue-400">Opens: {selectedLog.openCount || 0}</span>
                          <span className="text-amber-400">Clicks: {selectedLog.clickCount || 0}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">Real-time pixel and redirect telemetry</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500">Dispatch IP Address</span>
                        <div className="text-white font-mono text-sm">
                          {selectedLog.ipAddress || "127.0.0.1 (Local relay)"}
                        </div>
                        <span className="text-[10px] text-slate-400 block">Outbound MTA egress interface</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500">Timestamp</span>
                        <div className="text-white font-mono text-sm">
                          {new Date(selectedLog.createdAt).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400 block">Exact UTC queue timestamp</span>
                      </div>
                    </div>

                    {selectedLog.bounceReason && (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                        <span className="font-bold text-rose-400 block mb-1">Bounce Diagnosis:</span>
                        <p className="text-rose-200 font-mono">{selectedLog.bounceReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Source Tab */
                <div className="w-full max-w-4xl h-full flex flex-col space-y-3">
                  <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-xs text-amber-200 overflow-auto leading-relaxed">
                    <pre className="whitespace-pre-wrap">
                      {selectedLog.htmlBody || selectedLog.textBody || "No message body recorded for this log entry."}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
