"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Building2,
  FolderOpen,
  ArrowUpRight,
  ExternalLink,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Layers,
  Sparkles
} from "lucide-react";

interface ContactItem {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  unsubscribed: boolean;
  tags: string[];
  createdAt: string;
  audienceName: string;
  audienceId: string;
  workspaceId: string;
  workspaceName: string;
  workspacePlan: string;
}

interface WorkspaceOption {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [metrics, setMetrics] = useState({
    totalContacts: 0,
    subscribedCount: 0,
    unsubscribedCount: 0,
    totalAudiences: 0,
  });

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
        workspaceId: selectedWorkspace,
        status: statusFilter,
        q: search.trim(),
      });

      const res = await fetch(`/api/admin/contacts?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setContacts(json.contacts || []);
        setWorkspaces(json.workspaces || []);
        if (json.metrics) setMetrics(json.metrics);
        if (json.pagination) setTotalPages(json.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load admin contacts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, selectedWorkspace, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchContacts();
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete contact "${email}" from this customer's workspace?`)) return;

    try {
      const res = await fetch(`/api/admin/contacts?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        showToast(`Contact "${email}" deleted successfully.`);
      } else {
        showToast("Failed to delete contact.", "error");
      }
    } catch {
      showToast("Network error deleting contact.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* TOAST FEEDBACK */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-xs font-bold shadow-2xl transition-all backdrop-blur-xl ${
            toast.type === "success"
              ? "bg-amber-500 text-slate-950 shadow-amber-500/20"
              : "bg-rose-950/90 text-rose-200 border border-rose-500/30"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              Audience Data Warehouse
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Global Leads Directory</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 mt-1.5">
            <Users className="w-6 h-6 text-amber-400" />
            Customer Contacts &amp; Audiences
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global directory of all contact lists and leads uploaded across every customer workspace in Sendport.
          </p>
        </div>

        <button
          onClick={fetchContacts}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0d1424] border border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* METRIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Contacts</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{metrics.totalContacts.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500">All workspaces</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Active Subscribed</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">{metrics.subscribedCount.toLocaleString()}</span>
            <span className="text-[11px] text-emerald-400/80">Deliverable</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Unsubscribed</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400 font-mono">{metrics.unsubscribedCount.toLocaleString()}</span>
            <span className="text-[11px] text-amber-400/80">Suppressed</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Audiences</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-400 font-mono">{metrics.totalAudiences.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500">Distinct lists</span>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search contacts by email, first name, last name, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#080d19] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {/* Workspace Filter */}
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedWorkspace}
              onChange={(e) => {
                setSelectedWorkspace(e.target.value);
                setPage(1);
              }}
              className="rounded-xl bg-[#080d19] border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Client Workspaces ({workspaces.length})</option>
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.plan})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl bg-[#080d19] border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBSCRIBED">Subscribed Only</option>
            <option value="UNSUBSCRIBED">Unsubscribed Only</option>
          </select>
        </div>
      </div>

      {/* CONTACTS TABLE */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1424] shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-[#080d19] flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" /> Uploaded Customer Leads
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Page {page} of {totalPages}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
            Loading contacts from database...
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No Contacts Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No contacts matched your search query or workspace filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080d19] border-b border-white/5 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <tr>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Client Workspace</th>
                  <th className="py-3 px-4">Audience List</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{c.email}</div>
                      {(c.firstName || c.lastName) && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {c.firstName || ""} {c.lastName || ""}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {c.workspaceName}
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-white/5 text-slate-400 border border-white/10">
                        {c.workspacePlan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
                        {c.audienceName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {c.tags.length > 0 ? (
                          c.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-white/5 text-slate-300 font-mono text-[10px] border border-white/10"
                            >
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {c.unsubscribed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" /> Unsubscribed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Subscribed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]" suppressHydrationWarning>
                      {new Date(c.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.email)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION BAR */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 bg-[#080d19] flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <span className="text-xs font-mono text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
