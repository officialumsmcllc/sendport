"use client";

import React, { useState } from "react";
import { Sparkles, AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, Zap } from "lucide-react";

export default function AiAssistantPage() {
  const [subject, setSubject] = useState("Exclusive 50% discount! Act now before it expires");
  const [content, setContent] = useState(
    "Hey there,\n\nWe have a special 100% free deal for you! Click here now to claim your free gift before tonight."
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState<number | null>(68);

  const runAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setScore(94);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            AI Spam Score & Subject Line Optimizer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-screen subject lines and body copy against 200+ ISP spam filter triggers (SpamAssassin, Gmail, Outlook).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Body Content</label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-primary-500 focus:outline-none resize-none font-sans"
              />
            </div>

            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-700 shadow-sm transition-all"
            >
              {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {analyzing ? "Auditing Spam Factors..." : "Analyze with AI Deliverability Engine"}
            </button>
          </div>
        </div>

        {/* Audit results */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Inbox Health Score</span>
              <span
                className={`text-sm font-extrabold px-2.5 py-1 rounded-full ${
                  (score || 0) >= 90
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {score}/100 Grade {(score || 0) >= 90 ? "A+" : "B-"}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Spam Trigger Words Detected
                </div>
                <p className="text-[11px] text-amber-800">
                  Phrases like &ldquo;100% free&rdquo; and excessive exclamation marks trigger heuristic filters in Microsoft Outlook.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Recommended AI Improvement
                </div>
                <p className="text-[11px] text-emerald-800 font-mono">
                  &ldquo;Exclusive preview: Your invitation to the upcoming release&rdquo;
                </p>
                <button
                  onClick={() => {
                    setSubject("Exclusive preview: Your invitation to the upcoming release");
                    setScore(98);
                  }}
                  className="mt-1 text-[11px] text-primary-600 font-bold hover:underline"
                >
                  Apply Suggested Subject →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
