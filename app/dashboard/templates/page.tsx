"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCode,
  Plus,
  Copy,
  Check,
  FolderPlus,
  Eye,
  Trash2,
  Tag,
  Search,
  Sparkles,
  Link2,
  RefreshCw,
  Folder,
  Layers,
  X,
  Code2,
} from "lucide-react";

interface TemplateItem {
  id: string;
  name: string;
  slug: string;
  subject: string;
  folder: string;
  folderId?: string | null;
  htmlContent: string;
  textContent?: string | null;
  variables: string[];
  updatedAt: string;
}

interface FolderItem {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export default function TemplatesPage() {
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newFolderId, setNewFolderId] = useState("");
  const [newHtml, setNewHtml] = useState(`<div style="font-family: sans-serif; padding: 24px; max-width: 580px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
  <h2>Hello {{first_name}},</h2>
  <p>Thank you for reaching out to us. We have processed your request successfully.</p>
  <a href="https://getsendport.com" style="display: inline-block; background: #0f172a; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">View Account &rarr;</a>
</div>`);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/templates");
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setTemplates(data.data);
        }
      }
    } catch (err) {
      console.error("Failed to load templates", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/v1/folders");
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setFolders(data.data);
        }
      }
    } catch (err) {
      console.error("Failed to load folders", err);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchFolders();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSubject.trim() || !newHtml.trim()) {
      showToast("Please fill in template name, subject, and HTML content", "error");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/v1/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          subject: newSubject.trim(),
          htmlContent: newHtml,
          folderId: newFolderId || null,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setTemplates((prev) => [json.template, ...prev]);
        setShowCreateModal(false);
        setNewName("");
        setNewSubject("");
        showToast("Template saved to database successfully!");
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to create template", "error");
      }
    } catch {
      showToast("Network error creating template", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (tpl: TemplateItem) => {
    try {
      const res = await fetch(`/api/v1/templates/${tpl.id}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        fetchTemplates();
        showToast("Template duplicated successfully!");
      }
    } catch {
      showToast("Failed to duplicate template", "error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete template "${name}"?`)) return;
    try {
      const res = await fetch(`/api/v1/templates/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        showToast(`Template "${name}" deleted from database.`);
      } else {
        showToast("Failed to delete template", "error");
      }
    } catch {
      showToast("Network error deleting template", "error");
    }
  };

  const handleCopySlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filtered = templates.filter((t) => {
    const matchesFolder = activeFolder === "all" || t.folder === activeFolder || t.folder.toLowerCase() === activeFolder.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const folderNames = ["all", ...Array.from(new Set([...folders.map((f) => f.name), ...templates.map((t) => t.folder)]))];

  return (
    <div className="space-y-6">
      {/* TOAST FEEDBACK */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl transition-all ${
            toast.type === "success"
              ? "bg-slate-900 text-white border border-slate-800"
              : "bg-rose-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileCode className="w-6 h-6 text-primary-600" />
            Email Templates
          </h1>
          <p className="text-sm text-slate-500">
            Database-backed responsive email templates with automated <code className="text-primary-600 font-mono">&#123;&#123;tags&#125;&#125;</code> extraction and 1-click duplication.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/link-checker"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5 text-primary-600" /> Pre-Flight Link Scanner
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create Template
          </button>
        </div>
      </div>

      {/* FOLDER TABS BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 pb-3 gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {folderNames.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                activeFolder === f
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search templates or slugs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <button
            onClick={fetchTemplates}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
            title="Refresh templates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* TEMPLATES GRID */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-medium bg-white rounded-2xl border border-slate-200">
          Loading email templates from database...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileCode className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Email Templates Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first production email template with merge tags to dispatch through our API or Broadcast Engine.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-700"
          >
            <Plus className="w-3.5 h-3.5" /> New Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 border border-slate-200">
                    {tpl.folder}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(tpl.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{tpl.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-1.5">
                  <span className="text-slate-400">Slug:</span> {tpl.slug}
                  <button
                    onClick={() => handleCopySlug(tpl.slug)}
                    className="text-slate-400 hover:text-slate-700 p-0.5"
                    title="Copy slug for API"
                  >
                    {copiedSlug === tpl.slug ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </p>

                <div className="mt-3 text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <span className="font-semibold text-slate-700">Subject: </span>
                  {tpl.subject}
                </div>

                {/* Variables */}
                {tpl.variables && tpl.variables.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-400">TAGS:</span>
                    {tpl.variables.map((v) => (
                      <span
                        key={v}
                        className="font-mono text-[10px] rounded bg-primary-50 text-primary-700 px-1.5 py-0.5 border border-primary-100"
                      >
                        &#123;&#123;{v}&#125;&#125;
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Bar */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setPreviewTemplate(tpl)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview HTML
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDuplicate(tpl)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                    title="1-Click Duplicate in Database"
                  >
                    <Copy className="w-3 h-3" /> Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(tpl.id, tpl.name)}
                    className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-primary-600" />
                Create New Email Template
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Newsletter"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Folder Organization</label>
                <select
                  value={newFolderId}
                  onChange={(e) => setNewFolderId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-primary-500 focus:outline-none"
                >
                  <option value="">General (No Folder)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Subject Line *</label>
              <input
                type="text"
                required
                placeholder="e.g. Welcome {{first_name}} to Sendport!"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-primary-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">HTML Template Body *</label>
                <span className="text-[11px] text-slate-400">Use {"{{tag}}"} for dynamic variables</span>
              </div>
              <textarea
                rows={9}
                required
                value={newHtml}
                onChange={(e) => setNewHtml(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono focus:border-primary-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
              >
                {creating ? "Saving to Database..." : "Save Template"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{previewTemplate.name}</h3>
                <p className="text-xs text-slate-500 font-mono">Slug: {previewTemplate.slug}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs space-y-2">
              <div className="font-semibold text-slate-700">Subject: {previewTemplate.subject}</div>
              <div
                className="p-4 rounded-lg bg-white border border-slate-200 font-sans shadow-sm"
                dangerouslySetInnerHTML={{ __html: previewTemplate.htmlContent }}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
