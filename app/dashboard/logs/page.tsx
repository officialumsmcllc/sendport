
"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, RefreshCw, Mail, Globe, CheckCircle2, AlertCircle, RotateCw, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface DomainItem {
  id: string;
  name: string;
  status: string;
}

export default function LogsPage() {
  const [filter, setFilter] = useState("ALL");
  const [domainFilter, setDomainFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryingAll, setRetryingAll] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchLogs = async (dom?: string) => {
    try {
      setLoading(true);
      const activeDomain = dom !== undefined ? dom : domainFilter;
      const url = activeDomain && activeDomain !== "ALL"
        ? `/api/auth/me?domain=${encodeURIComponent(activeDomain)}`
        : "/api/auth/me";

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.recentEmails) {
          setLogs(data.recentEmails);
        }
        if (data.domains) {
          setDomains(data.domains);
        }
        if (data.workspace?.name) {
          setWorkspaceName(data.workspace.name);
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

  const handleDomainFilterChange = (dom: string) => {
    setDomainFilter(dom);
    fetchLogs(dom);
  };

  const handleRetrySingle = async (emailId: string) => {
    try {
      setRetryingId(emailId);
      const res = await fetch("/api/v1/emails/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId }),
      });
      const data = await res.json();
      if (res.ok && data.deliveredCount > 0) {
        showToast("Email re-delivered successfully in real-time!", "success");
      } else if (res.ok) {
        showToast("Retry attempted: Destination server still enforcing policy check.", "info");
      } else {
        showToast(data.error || "Retry failed", "error");
      }
      await fetchLogs();
    } catch (err: any) {
      showToast("Network error retrying email", "error");
    } finally {
      setRetryingId(null);
    }
  };

  const handleRetryAllBounced = async () => {
    try {
      setRetryingAll(true);
      const res = await fetch("/api/v1/emails/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allBounced: true }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          `Processed ${data.retriedCount} emails: ${data.deliveredCount} delivered successfully!`,
          data.deliveredCount > 0 ? "success" : "info"
        );
      } else {
        showToast(data.error || "Bulk retry failed", "error");
      }
      await fetchLogs();
    } catch {
      showToast("Network error executing bulk retry", "error");
    } finally {
      setRetryingAll(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchStatus = filter === "ALL" || l.status === filter;
    const matchDomain =
      domainFilter === "ALL" ||
      (l.domain || "").toLowerCase() === domainFilter.toLowerCase() ||
      (l.from || "").toLowerCase().includes(domainFilter.toLowerCase());
    const matchSearch =
      (l.to || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.from || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.subject || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchDomain && matchSearch;
  });

  const bouncedCount = logs.filter((l) => l.status === "BOUNCED").length;

  return (
    <div className="space-y-6">
      {/* TOAST ALERT */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold text-white shadow-xl transition-all ${
            toast.type === "success"
              ? "bg-emerald-600"
              : toast.type === "error"
              ? "bg-rose-600"
              : "bg-slate-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Email Delivery Logs</h1>
            {workspaceName && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                Workspace: {workspaceName}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time delivery status, DKIM verification, and open/click telemetry strictly isolated for your verified domains.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/domains"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Globe className="w-3.5 h-3.5 text-primary-600" /> Manage Domains
          </Link>
          <button
            onClick={() => fetchLogs()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary-600 ${loading ? "animate-spin" : ""}`} /> Refresh Stream
          </button>
        </div>
      </div>

      {/* BOUNCE RETRY BANNER */}
      {bouncedCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                {bouncedCount} Bounced Email{bouncedCount > 1 ? "s" : ""} Recorded
              </h4>
              <p className="text-xs text-rose-600 mt-0.5">
                Sendport Engine has been updated with Hostinger Enterprise cascade and DoH fallback. Re-dispatch them now.
              </p>
            </div>
          </div>
          <button
            onClick={handleRetryAllBounced}
            disabled={retryingAll}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            <RotateCw className={`w-3.5 h-3.5 ${retryingAll ? "animate-spin" : ""}`} />
            {retryingAll ? "Retrying..." : `Retry All Bounced (${bouncedCount})`}
          </button>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2.5 items-center flex-1">
          {/* SEARCH */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recipient, sender or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none shadow-sm"
            />
          </div>

          {/* DOMAIN FILTER DROPDOWN */}
          <div className="w-full sm:w-auto">
            <select
              value={domainFilter}
              onChange={(e) => handleDomainFilterChange(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-slate-900 focus:outline-none shadow-sm"
            >
              <option value="ALL">All Domains ({domains.length > 0 ? `${domains.length} added` : "No domains"})</option>
              {domains.map((dom) => (
                <option key={dom.id} value={dom.name}>
                  {dom.name} {dom.status === "VERIFIED" ? "✓" : "⏳"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STATUS FILTER TABS */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["ALL", "DELIVERED", "OPENED", "CLICKED", "BOUNCED", "FAILED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
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
            <h3 className="text-sm font-bold text-slate-800">
              {domainFilter !== "ALL"
                ? `No Delivery Logs for "${domainFilter}" Yet`
                : "No Email Delivery Logs Recorded Yet"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {domainFilter !== "ALL"
                ? `Emails sent from ${domainFilter} via the REST API or SMTP relay will appear here with delivery timestamps and DKIM signatures.`
                : "Emails dispatched from your verified domains will appear here in real-time. Logs are strictly isolated to your account."}
            </p>
            <div className="flex justify-center pt-2 gap-2">
              <Link
                href="/dashboard/playground"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
              >
                Send a Test Email
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Recipient</th>
                  <th className="px-5 py-3">Sender Domain</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">DKIM</th>
                  <th className="px-5 py-3 text-right">Time</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-900">{log.to}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-700 border border-slate-200">
                        <Globe className="w-3 h-3 text-slate-500" />
                        {log.domain || "custom"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs truncate">{log.subject}</td>
                    <td className="px-5 py-4">
                      <span
                        title={log.bounceReason || undefined}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          log.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : log.status === "OPENED"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : log.status === "CLICKED"
                            ? "bg-purple-50 text-purple-700 border border-purple-100"
                            : log.status === "BOUNCED"
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {log.dkim ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> 2048-bit Pass
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Standard</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-right font-mono">
                      {log.date ? `${log.date} ${log.time}` : log.time}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {(log.status === "BOUNCED" || log.status === "FAILED") ? (
                        <button
                          onClick={() => handleRetrySingle(log.id)}
                          disabled={retryingId === log.id}
                          title="Retry delivery in real-time"
                          className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 px-2 py-1 text-[11px] font-bold transition-all disabled:opacity-50"
                        >
                          <RotateCw className={`w-3 h-3 ${retryingId === log.id ? "animate-spin" : ""}`} />
                          {retryingId === log.id ? "Sending..." : "Retry"}
                        </button>
                      ) : (
                        <span className="text-slate-300">-</span>
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
