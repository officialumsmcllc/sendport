"use client";

import React, { useState } from "react";
import { ShieldCheck, Search, Filter, Eye, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";

export default function LogsPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const logs = [
    {
      id: "msg_90a1b2c3",
      recipient: "sarah.connor@cyberdyne.com",
      subject: "Welcome to Acme Corp 🚀",
      status: "OPENED",
      opens: 3,
      clicks: 1,
      latency: "6.8ms",
      dkim: "Pass (2048-bit)",
      time: "2 mins ago",
    },
    {
      id: "msg_89f41b2c",
      recipient: "founder@startup.io",
      subject: "Your Monthly Cloud Invoice #1042",
      status: "DELIVERED",
      opens: 1,
      clicks: 0,
      latency: "8.2ms",
      dkim: "Pass (2048-bit)",
      time: "8 mins ago",
    },
    {
      id: "msg_77c2d3e4",
      recipient: "invalid-user@deadmailbox.xyz",
      subject: "Password Reset Code",
      status: "BOUNCED",
      opens: 0,
      clicks: 0,
      latency: "14.1ms",
      dkim: "Pass",
      time: "42 mins ago",
    },
    {
      id: "msg_66b1a0f9",
      recipient: "devops@megacorp.com",
      subject: "Weekly Performance Digest",
      status: "CLICKED",
      opens: 2,
      clicks: 2,
      latency: "7.1ms",
      dkim: "Pass (2048-bit)",
      time: "1 hour ago",
    },
  ];

  const filteredLogs = logs.filter((l) => {
    const matchStatus = filter === "ALL" || l.status === filter;
    const matchSearch =
      l.recipient.toLowerCase().includes(search.toLowerCase()) ||
      l.subject.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Live Delivery Logs</h1>
          <p className="text-sm text-slate-500">
            Real-time delivery lifecycle tracking, DKIM verification, open/click counts, and bounce diagnostic logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Stream Active
          </span>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "DELIVERED", "OPENED", "CLICKED", "BOUNCED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === st
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs by email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs w-60 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Message ID</th>
                <th className="px-5 py-3">Recipient</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Engagement</th>
                <th className="px-5 py-3">Latency</th>
                <th className="px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{log.id}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-700">{log.recipient}</td>
                  <td className="px-5 py-3.5 text-slate-800">{log.subject}</td>
                  <td className="px-5 py-3.5">
                    {log.status === "DELIVERED" && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" /> Delivered
                      </span>
                    )}
                    {log.status === "OPENED" && (
                      <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 border border-sky-100">
                        <Eye className="w-3 h-3" /> Opened
                      </span>
                    )}
                    {log.status === "CLICKED" && (
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-100">
                        <CheckCircle2 className="w-3 h-3" /> Clicked
                      </span>
                    )}
                    {log.status === "BOUNCED" && (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-100">
                        <XCircle className="w-3 h-3" /> Bounced
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono">
                    {log.opens} opens • {log.clicks} clicks
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-500">{log.latency}</td>
                  <td className="px-5 py-3.5 text-slate-400">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
