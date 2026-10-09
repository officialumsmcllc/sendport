"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Zap,
  Wand2,
  Check,
  HelpCircle,
  FileText,
} from "lucide-react";

interface SpamReport {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "F";
  isSpamLikely: boolean;
  detectedTriggers: string[];
  suggestions: string[];
  details: {
    keywordPenalty: number;
    subjectPenalty: number;
    linkPenalty: number;
    ratioPenalty: number;
    hasUnsubscribeLink: boolean;
    hasRawIpLinks: boolean;
    hasShortenedLinks: boolean;
    textLength: number;
    htmlLength: number;
  };
}

export default function AiAssistantPage() {
  const [subject, setSubject] = useState("Exclusive 50% discount! Act now before it expires");
  const [content, setContent] = useState(
    "Hey there,\n\nWe have a special 100% free deal for you! Click here now to claim your free gift before tonight.\n\nBest regards,\nSendport Team"
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<SpamReport | null>(null);

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      const res = await fetch("/api/v1/tools/spam-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content }),
      });

      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error("Spam check error", err);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const handleApplyCleanSubject = () => {
    const cleaned = "Exclusive preview: Your invitation to the upcoming Sendport release";
    setSubject(cleaned);
    // Remove spam words from content
    let cleanedContent = content
      .replace(/100% free/gi, "complimentary")
      .replace(/free gift/gi, "welcome bonus")
      .replace(/Click here now/gi, "Review your account");
    setContent(cleanedContent);

    setTimeout(() => {
      fetch("/api/v1/tools/spam-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: cleaned, content: cleanedContent }),
      })
        .then((r) => r.json())
        .then((d) => setReport(d));
    }, 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-700 bg-emerald-100 border-emerald-300";
    if (score >= 75) return "text-blue-700 bg-blue-100 border-blue-300";
    if (score >= 60) return "text-amber-700 bg-amber-100 border-amber-300";
    return "text-rose-700 bg-rose-100 border-rose-300";
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-600" />
            AI Spam Score & Deliverability Heuristic Analyzer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time ISP spam barrier diagnostic against SpamAssassin 4.x, Google Workspace, Yahoo Postmaster, and Outlook filters.
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all disabled:opacity-50"
        >
          {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
          {analyzing ? "Running 2026 Engine..." : "Re-Analyze Content"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUT EDITOR */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Email Subject Line</label>
                <span className="text-[11px] text-slate-400 font-mono">{subject.length} chars</span>
              </div>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject line..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-primary-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Email Body (Plain Text or HTML)</label>
                <span className="text-[11px] text-slate-400 font-mono">{content.length} characters</span>
              </div>
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your email message body..."
                className="w-full rounded-xl border border-slate-300 p-3.5 text-xs text-slate-800 focus:border-primary-500 focus:outline-none resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={handleApplyCleanSubject}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" /> Auto-Clean Spam Keywords &amp; Tone
              </button>

              <button
                onClick={runAnalysis}
                disabled={analyzing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2 text-xs font-bold text-white hover:bg-primary-700 shadow-sm transition-all disabled:opacity-50"
              >
                {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                {analyzing ? "Evaluating..." : "Run Live Evaluation"}
              </button>
            </div>
          </div>
        </div>

        {/* AUDIT REPORT */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Deliverability Score
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {report?.isSpamLikely ? "High Risk of Spam Folder" : "Optimal Primary Inbox Placement"}
                </span>
              </div>
              {report ? (
                <div className={`px-3 py-1.5 rounded-xl border text-sm font-black ${getScoreColor(report.score)}`}>
                  {report.score}/100 • Grade {report.grade}
                </div>
              ) : (
                <div className="px-3 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-mono">Calculating...</div>
              )}
            </div>

            {/* DETECTED TRIGGERS */}
            {report && report.detectedTriggers.length > 0 ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  {report.detectedTriggers.length} Spam Trigger Phrases Detected:
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {report.detectedTriggers.map((trig) => (
                    <span
                      key={trig}
                      className="inline-block px-2 py-0.5 rounded-md bg-white text-rose-700 border border-rose-200 font-mono text-[11px] font-bold"
                    >
                      &quot;{trig}&quot;
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-rose-700 mt-1">
                  These phrases heavily penalize your sender reputation on SpamAssassin &amp; Outlook algorithms.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Zero Blacklisted Spam Phrases Found
                </div>
                <p className="text-[11px] text-emerald-700">
                  Your vocabulary is clean and passes strict NLP inbox filters without keyword penalties.
                </p>
              </div>
            )}

            {/* ACTIONABLE RECOMMENDATIONS */}
            {report && report.suggestions.length > 0 && (
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-600" /> Deliverability Action Items:
                </h4>
                <div className="space-y-1.5">
                  {report.suggestions.map((sug, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-start gap-2"
                    >
                      <span className="text-primary-600 font-bold shrink-0">•</span>
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HEURISTIC BREAKDOWN */}
            {report && (
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Keyword Penalty</span>
                  <span className="font-mono font-bold text-slate-800">-{report.details.keywordPenalty} pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Subject Penalty</span>
                  <span className="font-mono font-bold text-slate-800">-{report.details.subjectPenalty} pts</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
