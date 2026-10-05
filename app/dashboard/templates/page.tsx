"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface TemplateItem {
  id: string;
  name: string;
  slug: string;
  subject: string;
  folder: string;
  htmlContent: string;
  variables: string[];
  updatedAt: string;
}

export default function TemplatesPage() {
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Modals
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);

  const [templates, setTemplates] = useState<TemplateItem[]>([
    {
      id: "tpl_welcome",
      name: "Welcome Onboarding Email",
      slug: "welcome-email",
      subject: "Welcome to {{company_name}} 🚀",
      folder: "Transactional",
      htmlContent: `<div style="font-family: sans-serif; padding: 24px; background: #090d16; color: #fff; border-radius: 12px;">
  <h2>Welcome to {{company_name}}, {{first_name}}!</h2>
  <p>We are thrilled to have you onboard. Get started by exploring your dashboard below:</p>
  <a href="https://getsendport.com/dashboard" style="background: #3b82f6; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-block;">Go to Dashboard</a>
</div>`,
      variables: ["company_name", "first_name"],
      updatedAt: "Today",
    },
    {
      id: "tpl_reset",
      name: "Password Reset Request",
      slug: "password-reset",
      subject: "Reset your {{company_name}} password",
      folder: "Security",
      htmlContent: `<div style="font-family: sans-serif; padding: 24px;">
  <h3>Password Reset</h3>
  <p>Hi {{first_name}}, click the button below to reset your password. Link expires in 15 minutes.</p>
  <a href="https://getsendport.com/auth/reset?token={{reset_token}}" style="background: #ef4444; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Reset Password</a>
</div>`,
      variables: ["first_name", "reset_token"],
      updatedAt: "2 days ago",
    },
    {
      id: "tpl_invoice",
      name: "SaaS Payment Invoice",
      slug: "invoice-receipt",
      subject: "Invoice #{{invoice_number}} Paid ✅",
      folder: "Billing",
      htmlContent: `<div style="font-family: sans-serif; padding: 24px;">
  <h3>Payment Receipt</h3>
  <p>Total Paid: <strong>\${{amount}}</strong></p>
  <p>Invoice ID: {{invoice_number}}</p>
</div>`,
      variables: ["amount", "invoice_number"],
      updatedAt: "5 days ago",
    },
    {
      id: "tpl_newsletter",
      name: "Product Changelog Update",
      slug: "weekly-changelog",
      subject: "What's new in Sendport this month ✨",
      folder: "Marketing",
      htmlContent: `<div style="font-family: sans-serif; padding: 24px;">
  <h2>New Feature Releases</h2>
  <p>Discover our brand new Link Checker and Audiences API!</p>
</div>`,
      variables: ["first_name"],
      updatedAt: "1 week ago",
    },
  ]);

  const folders = ["all", "Transactional", "Security", "Billing", "Marketing"];

  const handleDuplicate = async (tpl: TemplateItem) => {
    try {
      const res = await fetch(`/api/v1/templates/${tpl.id}/duplicate`, {
        method: "POST",
      });
      // Fallback local duplicate for seamless UI
      const shortId = Math.random().toString(36).substring(2, 6);
      const cloned: TemplateItem = {
        ...tpl,
        id: `tpl_${shortId}`,
        name: `${tpl.name} (Copy)`,
        slug: `${tpl.slug}-copy-${shortId}`,
        updatedAt: "Just now",
      };
      setTemplates([cloned, ...templates]);
    } catch {
      const shortId = Math.random().toString(36).substring(2, 6);
      const cloned: TemplateItem = {
        ...tpl,
        id: `tpl_${shortId}`,
        name: `${tpl.name} (Copy)`,
        slug: `${tpl.slug}-copy-${shortId}`,
        updatedAt: "Just now",
      };
      setTemplates([cloned, ...templates]);
    }
  };

  const handleCopySlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filtered = templates.filter((t) => {
    const matchesFolder = activeFolder === "all" || t.folder === activeFolder;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Email Templates</h1>
          <p className="text-sm text-slate-500">
            Create reusable React and HTML templates with dynamic tags and folder organization.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/link-checker"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Link2 className="w-3.5 h-3.5 text-primary-600" /> Link Checker
          </Link>
          <button
            onClick={() => {
              const newTpl: TemplateItem = {
                id: `tpl_${Date.now()}`,
                name: "Untitled Template",
                slug: `custom-tpl-${Math.random().toString(36).substring(2, 6)}`,
                subject: "Subject here...",
                folder: "Transactional",
                htmlContent: "<p>Hello {{name}}!</p>",
                variables: ["name"],
                updatedAt: "Just now",
              };
              setTemplates([newTpl, ...templates]);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" /> New Template
          </button>
        </div>
      </div>

      {/* FOLDER TABS BAR */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                activeFolder === f
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      {/* TEMPLATES GRID */}
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
                <span className="text-[11px] text-slate-400">{tpl.updatedAt}</span>
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
                  title="1-Click Duplicate"
                >
                  <Copy className="w-3 h-3" /> Duplicate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs">
              <div className="font-semibold text-slate-700 mb-2">Subject: {previewTemplate.subject}</div>
              <div
                className="p-4 rounded-lg bg-white border border-slate-200 font-sans"
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
