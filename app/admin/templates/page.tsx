"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Smartphone,
  Monitor,
  ShieldAlert,
  Building2,
  Mail,
  FolderOpen,
  Calendar,
  Grid,
  List,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Code,
  Tag,
} from "lucide-react";

interface UserTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  htmlContent: string;
  textContent?: string | null;
  variables: string[];
  createdAt: string;
  updatedAt: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    user: {
      id: string;
      name?: string | null;
      email: string;
    };
  };
  folder?: {
    id: string;
    name: string;
    color?: string | null;
  } | null;
  safety: {
    score: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    flags: string[];
    hasUnsubscribe: boolean;
  };
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<UserTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalTemplates: 0, totalWorkspaces: 0 });
  const [filterRisk, setFilterRisk] = useState<string>("ALL");

  // Preview Modal State
  const [selectedTemplate, setSelectedTemplate] = useState<UserTemplate | null>(null);
  const [previewTab, setPreviewTab] = useState<"render" | "code" | "safety">("render");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "18",
        q: searchTerm.trim(),
      });
      const res = await fetch(`/api/admin/templates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setStats(data.stats || { totalTemplates: 0, totalWorkspaces: 0 });
      } else {
        showToast("Failed to fetch user templates", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error connecting to server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTemplates();
  };

  const handleCopyHtml = (html: string) => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("Template HTML copied to clipboard");
  };

  const handleDeleteTemplate = async (template: UserTemplate) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete template "${template.name}" from workspace "${template.workspace?.name}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(template.id);
      const res = await fetch(`/api/admin/templates?id=${template.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Template "${template.name}" deleted successfully.`);
        if (selectedTemplate?.id === template.id) {
          setSelectedTemplate(null);
        }
        fetchTemplates();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to delete template", "error");
      }
    } catch (e) {
      showToast("Network error deleting template", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter templates by risk in view if needed
  const displayedTemplates = templates.filter((t) => {
    if (filterRisk === "ALL") return true;
    return t.safety?.riskLevel === filterRisk;
  });

  const highRiskCount = templates.filter((t) => t.safety?.riskLevel === "HIGH").length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-bold shadow-2xl transition-all ${
            toast.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border border-emerald-800"
              : "bg-rose-950/90 text-rose-300 border border-rose-800"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Customer Content Auditing • User Templates</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            User-Created Email Templates
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global directory of all email templates created by users across every workspace with live HTML sandbox inspection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTemplates}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total User Templates</span>
          <div className="text-2xl font-black text-white mt-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            {loading ? "..." : stats.totalTemplates.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Created by active customers</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tenant Workspaces</span>
          <div className="text-2xl font-black text-white mt-2 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            {loading ? "..." : stats.totalWorkspaces.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active tenant organizations</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Flagged Risk Templates</span>
          <div className="text-2xl font-black text-amber-400 mt-2 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            {loading ? "..." : highRiskCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Urgent / high penalty triggers</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inspection Engine</span>
          <div className="text-2xl font-black text-emerald-400 mt-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Sandboxed
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Zero script execution security</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search template name, subject, workspace name, or creator email..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </form>

        <div className="flex items-center gap-2">
          {/* Risk Filter */}
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/30"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Risk Levels</option>
            <option value="LOW" className="bg-slate-900 text-emerald-400">Low Risk Only</option>
            <option value="MEDIUM" className="bg-slate-900 text-amber-400">Medium Risk</option>
            <option value="HIGH" className="bg-slate-900 text-rose-400">High Risk Alert</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950/80 p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-slate-800 bg-slate-900/30">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-300">Loading user email templates...</p>
        </div>
      ) : displayedTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-slate-800 bg-slate-900/30">
          <FileText className="w-10 h-10 text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-white">No user templates found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {searchTerm ? `No templates matched your query "${searchTerm}".` : "No templates have been saved by users yet."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTemplates.map((template) => (
            <div
              key={template.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 hover:border-slate-700 transition-all group shadow-sm hover:shadow-indigo-950/20"
            >
              <div className="space-y-3">
                {/* Workspace & Risk Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-300 truncate" title={template.workspace?.name}>
                      {template.workspace?.name || "Workspace"}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {template.workspace?.plan}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                      template.safety.riskLevel === "HIGH"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : template.safety.riskLevel === "MEDIUM"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {template.safety.riskLevel} RISK
                  </span>
                </div>

                {/* Template Name & Subject */}
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {template.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    <span className="font-semibold text-slate-500">Subject:</span> {template.subject || "No subject set"}
                  </p>
                </div>

                {/* Creator & Folder */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate" title={template.workspace?.user?.email}>
                    {template.workspace?.user?.email || "Unknown user"}
                  </span>
                  <span className="shrink-0 text-slate-500 font-mono text-[10px]">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setPreviewTab("render");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Inspect HTML
                </button>

                <button
                  onClick={() => handleDeleteTemplate(template)}
                  disabled={deletingId === template.id}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Moderate / Delete Template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="p-4">Template & Subject</th>
                  <th className="p-4">Owner / Workspace</th>
                  <th className="p-4">Safety Score</th>
                  <th className="p-4">Variables</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {displayedTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{template.name}</div>
                      <div className="text-slate-400 text-[11px] truncate max-w-xs">{template.subject}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-300">{template.workspace?.name}</div>
                      <div className="text-slate-500 text-[10px]">{template.workspace?.user?.email}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          template.safety.riskLevel === "HIGH"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : template.safety.riskLevel === "MEDIUM"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {template.safety.score}/100 • {template.safety.riskLevel}
                      </span>
                    </td>
                    <td className="p-4">
                      {template.variables && template.variables.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {template.variables.slice(0, 3).map((v) => (
                            <span key={v} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-indigo-300">
                              {`{{${v}}}`}
                            </span>
                          ))}
                          {template.variables.length > 3 && (
                            <span className="text-[10px] text-slate-500 font-mono">+{template.variables.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setPreviewTab("render");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-xs font-bold transition-colors"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete Template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 font-bold hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 font-bold hover:bg-slate-800 disabled:opacity-40"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* FULL SCREEN / LARGE MODAL FOR LIVE SANDBOXED HTML EMAIL PREVIEW */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md">
          <div className="w-full max-w-5xl h-[90vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-black text-white truncate flex items-center gap-2">
                    <span>{selectedTemplate.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">
                      ({selectedTemplate.slug})
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 truncate">
                    Owner: <span className="text-slate-200 font-semibold">{selectedTemplate.workspace?.name}</span> •{" "}
                    {selectedTemplate.workspace?.user?.email}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Subheader: Tabs & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-800/80 bg-slate-900/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTab("render")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    previewTab === "render"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Rendered Preview
                </button>
                <button
                  onClick={() => setPreviewTab("code")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    previewTab === "code"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  HTML Source
                </button>
                <button
                  onClick={() => setPreviewTab("safety")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    previewTab === "safety"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Safety & Spam Audit ({selectedTemplate.safety.riskLevel})
                </button>
              </div>

              <div className="flex items-center gap-3">
                {previewTab === "render" && (
                  <div className="flex items-center border border-slate-800 rounded-xl bg-slate-900 p-0.5">
                    <button
                      onClick={() => setPreviewDevice("desktop")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        previewDevice === "desktop" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" /> Desktop
                    </button>
                    <button
                      onClick={() => setPreviewDevice("mobile")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        previewDevice === "mobile" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Mobile
                    </button>
                  </div>
                )}

                <button
                  onClick={() => handleCopyHtml(selectedTemplate.htmlContent)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                >
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  {copied ? "Copied!" : "Copy HTML"}
                </button>

                <button
                  onClick={() => handleDeleteTemplate(selectedTemplate)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>

            {/* Subject Banner */}
            <div className="px-6 py-2.5 bg-slate-900/50 border-b border-slate-800/60 flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-400">Subject:</span>
              <span className="font-semibold text-white truncate">{selectedTemplate.subject || "(No Subject Set)"}</span>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col items-center justify-start">
              {previewTab === "render" ? (
                <div
                  className={`w-full transition-all duration-300 h-full flex flex-col items-center ${
                    previewDevice === "mobile" ? "max-w-[390px]" : "max-w-4xl"
                  }`}
                >
                  <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
                    <iframe
                      title="User Email Sandbox Preview"
                      srcDoc={selectedTemplate.htmlContent || "<p style='color:#666;font-family:sans-serif;padding:20px;'>Empty email template body</p>"}
                      sandbox="allow-same-origin"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              ) : previewTab === "code" ? (
                <div className="w-full max-w-4xl h-full flex flex-col">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-xs text-indigo-200 overflow-auto flex-1 leading-relaxed selection:bg-indigo-600">
                    <pre className="whitespace-pre-wrap">{selectedTemplate.htmlContent}</pre>
                  </div>
                </div>
              ) : (
                /* Safety & Spam Audit Tab */
                <div className="w-full max-w-3xl space-y-6">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Content Safety & Anti-Spam Analysis
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[11px] text-slate-400 font-bold uppercase">Spam Risk Score</span>
                        <div
                          className={`text-2xl font-black mt-1 ${
                            selectedTemplate.safety.score >= 50
                              ? "text-rose-400"
                              : selectedTemplate.safety.score >= 25
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {selectedTemplate.safety.score}/100
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {selectedTemplate.safety.riskLevel} Probability of Spam Flag
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[11px] text-slate-400 font-bold uppercase">Unsubscribe Tag</span>
                        <div className="text-lg font-black mt-1 flex items-center gap-2">
                          {selectedTemplate.safety.hasUnsubscribe ? (
                            <span className="text-emerald-400 flex items-center gap-1 text-sm font-bold">
                              <CheckCircle2 className="w-4 h-4" /> Detected
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1 text-sm font-bold">
                              <AlertTriangle className="w-4 h-4" /> Missing Tag
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          CAN-SPAM & GDPR compliance requirement
                        </span>
                      </div>
                    </div>

                    {/* Detected Risk Flags */}
                    {selectedTemplate.safety.flags.length > 0 ? (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                        <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Detected High-Risk Triggers:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-xs text-rose-300">
                          {selectedTemplate.safety.flags.map((flag, idx) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        No known spam keywords or disallowed script tags detected in this template.
                      </div>
                    )}

                    {/* Variables in Template */}
                    <div className="pt-4 border-t border-slate-800">
                      <span className="text-xs font-bold text-slate-300 block mb-2">
                        Template Dynamic Variables ({selectedTemplate.variables.length}):
                      </span>
                      {selectedTemplate.variables.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate.variables.map((variable) => (
                            <span
                              key={variable}
                              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300"
                            >
                              {`{{${variable}}}`}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No dynamic variables mapped in this template.</p>
                      )}
                    </div>
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
