"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, RefreshCw, Search, Lock, AlertTriangle, Eye } from "lucide-react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/audit");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.auditLogs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      (l.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.ip || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.details || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            Platform Security & Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable record of all administrative approvals, user logins, API key generations, and security events.
          </p>
        </div>
        <button
          onClick={fetchAuditLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? "animate-spin" : ""}`} />
          Refresh Audit Trail
        </button>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search action, email, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Recorded Events ({filtered.length})
          </h2>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Encrypted Audit Storage
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <ShieldCheck className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No audit events recorded yet</p>
            <p className="text-xs">Security operations and administrative actions will automatically log here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">User</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Payload Details</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{log.user?.email || "System Service"}</p>
                      <p className="text-[10px] text-slate-500">{log.user?.role || "SYSTEM"}</p>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{log.ip || "127.0.0.1"}</td>
                    <td className="p-4">
                      <div className="max-w-md overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-slate-400 bg-slate-950 p-1.5 rounded border border-slate-800">
                        {log.details || "{}"}
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono text-[11px] text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
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
