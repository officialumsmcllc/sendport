"use client";

import React, { useState } from "react";
import {
  Link2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
} from "lucide-react";
import { scanEmailLinks, PreFlightScanReport } from "@/lib/deliverability/link-checker";

export default function LinkCheckerPage() {
  const [sampleHtml, setSampleHtml] = useState(`<div style="font-family: sans-serif; padding: 20px;">
  <h2>Welcome to Sendport 🚀</h2>
  <p>Please confirm your account by clicking below:</p>
  <p><a href="https://getsendport.com/verify?token=8942">Verify Account</a></p>
  <p>Read our documentation at <a href="https://getsendport.com/docs">Sendport Docs</a></p>
  <p>Or check our test environment: <a href="http://example.com/test">Insecure Link</a></p>
  <p>Follow us on <a href="#">Twitter</a></p>
  <p><a href="mailto:support@getsendport.com">Contact Support</a></p>
</div>`);

  const [report, setReport] = useState<PreFlightScanReport | null>(null);

  const handleScan = () => {
    const res = scanEmailLinks(sampleHtml);
    setReport(res);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pre-Flight Link & URL Scanner</h1>
          <p className="text-sm text-slate-500">
            Catch broken, missing, insecure HTTP, and placeholder links before you send a broadcast or publish a template.
          </p>
        </div>
        <button
          onClick={handleScan}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-700 transition-all"
        >
          <Search className="w-3.5 h-3.5" /> Scan HTML Links
        </button>
      </div>

      {/* INPUT EDITOR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Email HTML Content
        </label>
        <textarea
          rows={7}
          value={sampleHtml}
          onChange={(e) => setSampleHtml(e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-4 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Paste your email HTML template here..."
        />
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>Scans for <code>href=&quot;...&quot;</code>, missing HTTPS, placeholder hashes (#), and spam links.</span>
          <button
            onClick={handleScan}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm"
          >
            Run Pre-Flight Scan
          </button>
        </div>
      </div>

      {/* SCAN RESULTS */}
      {report && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-6 animate-in fade-in duration-300">
          {/* Score Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border ${
                  report.score >= 80
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                    : report.score >= 50
                    ? "bg-amber-50 text-amber-600 border-amber-200"
                    : "bg-rose-50 text-rose-600 border-rose-200"
                }`}
              >
                {report.score}%
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {report.score >= 80 ? "High Link Quality" : "Link Issues Detected"}
                </h3>
                <p className="text-xs text-slate-500">{report.recommendation}</p>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                {report.validLinks} Valid
              </span>
              <span className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                {report.warningsCount} Warnings
              </span>
              <span className="rounded-xl bg-rose-50 border border-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700">
                {report.errorsCount} Errors
              </span>
            </div>
          </div>

          {/* Table of Findings */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Detected Link URL</th>
                  <th className="px-4 py-2.5">Diagnostic Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.findings.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      {item.type === "valid" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      ) : item.type === "warning" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-100">
                          <AlertTriangle className="w-3 h-3" /> Warning
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-100">
                          <XCircle className="w-3 h-3" /> Broken Link
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-800">{item.url}</td>
                    <td className="px-4 py-3 text-slate-600">{item.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
