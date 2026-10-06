"use client";

import React, { useState, useEffect } from "react";
import {
  Globe2,
  Search,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
  Building2,
  Mail,
  Sliders,
  Check,
} from "lucide-react";

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/domains");
      if (res.ok) {
        const data = await res.json();
        setDomains(data.domains || []);
        setStats(data.stats || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleForceVerify = async (domain: any) => {
    if (!confirm(`Force verify all DNS records (DKIM, SPF, DMARC, MX) for ${domain.name}?`)) return;
    try {
      setVerifyingId(domain.id);
      const res = await fetch("/api/admin/domains", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: domain.id, forceVerify: true }),
      });
      if (res.ok) {
        setToastMsg(`Domain ${domain.name} verified successfully!`);
        setTimeout(() => setToastMsg(""), 3500);
        fetchDomains();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVerifyingId(null);
    }
  };

  const filtered = domains.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.workspace?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Globe2 className="w-6 h-6 text-amber-400" />
            Customer Sending Domains Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global directory of all customer custom sender domains, RSA-2048 DKIM records, SPF alignments, and verification statuses.
          </p>
        </div>
        <button
          onClick={fetchDomains}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? "animate-spin" : ""}`} />
          Refresh Domains
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {toastMsg}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Added Domains</span>
          {loading ? (
            <div className="h-9 w-16 bg-slate-800 rounded animate-pulse my-1" />
          ) : (
            <p className="text-3xl font-black text-white mt-1">{stats?.totalDomains || 0}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-1">Configured across all workspaces</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Verified & Live</span>
          {loading ? (
            <div className="h-9 w-16 bg-slate-800 rounded animate-pulse my-1" />
          ) : (
            <p className="text-3xl font-black text-emerald-400 mt-1">{stats?.verifiedDomains || 0}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-1">DKIM & SPF DNS valid</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pending DNS</span>
          {loading ? (
            <div className="h-9 w-16 bg-slate-800 rounded animate-pulse my-1" />
          ) : (
            <p className="text-3xl font-black text-amber-400 mt-1">{stats?.pendingDomains || 0}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-1">Awaiting DNS propagation</p>
        </div>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Failed / Unreachable</span>
          {loading ? (
            <div className="h-9 w-16 bg-slate-800 rounded animate-pulse my-1" />
          ) : (
            <p className="text-3xl font-black text-rose-400 mt-1">{stats?.failedDomains || 0}</p>
          )}
          <p className="text-[11px] text-slate-400 mt-1">DNS record errors detected</p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by domain name, user email, or workspace..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Domains Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Domains Directory ({loading ? "Loading..." : filtered.length})
          </h2>
          <span className="text-[11px] font-mono text-slate-400">DKIM • SPF • DMARC • MX Records</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No customer domains found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4">Sender Domain</th>
                  <th className="p-4">Owner / Workspace</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4">DNS Records Check</th>
                  <th className="p-4">Emails Dispatched</th>
                  <th className="p-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white text-sm">{d.name}</p>
                          <p className="text-[10px] font-mono text-slate-500">Selector: {d.dkimSelector}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-white">{d.user?.email || "Unknown"}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        {d.workspace?.name || "Default Workspace"}
                      </p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          d.status === "VERIFIED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : d.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            d.status === "VERIFIED" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                          }`}
                        />
                        {d.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            d.isDkimValid ? "bg-emerald-500/20 text-emerald-300 font-bold" : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          DKIM {d.isDkimValid ? "✓" : "✗"}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            d.isSpfValid ? "bg-emerald-500/20 text-emerald-300 font-bold" : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          SPF {d.isSpfValid ? "✓" : "✗"}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            d.isDmarcValid ? "bg-emerald-500/20 text-emerald-300 font-bold" : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          DMARC {d.isDmarcValid ? "✓" : "✗"}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            d.isMxValid ? "bg-emerald-500/20 text-emerald-300 font-bold" : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          MX {d.isMxValid ? "✓" : "✗"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-400">
                      {(d._count?.emails || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      {d.status !== "VERIFIED" ? (
                        <button
                          onClick={() => handleForceVerify(d)}
                          disabled={verifyingId === d.id}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] transition-all inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {verifyingId === d.id ? "Verifying..." : "Force Verify"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Live
                        </span>
                      )}
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
