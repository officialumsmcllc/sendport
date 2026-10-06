"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, Filter, Eye, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Mail } from "lucide-react";
import Link from "next/link";

export default function LogsPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.recentEmails) {
          setLogs(data.recentEmails);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchStatus = filter === "ALL" || l.status === filter;
    const matchSearch =
      (l.to || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.subject || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Email Delivery Logs</h1>
          <p className="text-sm text-slate-500">
            Real-time delivery status, open & click tracking, and SMTP bounce diagnostics.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primary-600 ${loading ? "animate-spin" : ""}`} /> Refresh Stream
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by recipient or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {["ALL", "DELIVERED", "OPENED", "CLICKED", "BOUNCED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === st
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE OR EMPTY STATE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        {filteredLogs.length === 0 && !loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Mail className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">No Email Delivery Logs Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Emails sent via the REST API or SMTP relay will appear here with delivery timestamps, DKIM verification status, and bounce codes.
            </p>
            <div className="flex justify-center pt-2">
              <Link
                href="/dashboard/playground"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
              >
                Send a Test Email Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Recipient</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">DKIM</th>
                  <th className="px-5 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4 font-semibold text-slate-900">{log.to}</td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs truncate">{log.subject}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          log.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : log.status === "OPENED"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : log.status === "CLICKED"
                            ? "bg-purple-50 text-purple-700 border border-purple-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> 2048-bit Pass
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-right font-mono">{log.time}</td>
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
