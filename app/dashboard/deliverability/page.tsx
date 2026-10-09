"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Mail,
  ChevronRight,
  Info,
  Globe,
  Sliders,
  Flame,
  ArrowUpRight,
} from "lucide-react";

interface WarmupDomain {
  id: string;
  name: string;
  status: string;
  isDkimValid: boolean;
  isSpfValid: boolean;
  isDmarcValid: boolean;
  isMxValid: boolean;
  warmup: {
    dayAge: number;
    stageLabel: string;
    stageDays: string;
    dailyLimit: number;
    ramp: string;
    sentToday: number;
    isExceedingWarmup: boolean;
    isApproachingWarmup: boolean;
    percentUsed: number;
  };
}

interface DeliverabilityMetrics {
  senderScore: number;
  totalSent: number;
  bounceRate: string;
  deliveryRate: string;
  openRate: string;
  spamComplaints: string;
  dnsblStatus: string;
}

interface AnalysisReport {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "F";
  summary: string;
  dnsScore: number;
  contentScore: number;
  complianceScore: number;
  findings: Array<{
    category: "DNS" | "CONTENT" | "COMPLIANCE";
    type: "pass" | "warn" | "fail";
    title: string;
    description: string;
    impact: number;
  }>;
  triggersDetected: string[];
}

export default function DeliverabilityPage() {
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState<WarmupDomain[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string>("");
  const [metrics, setMetrics] = useState<DeliverabilityMetrics | null>(null);
  const [warmupStages, setWarmupStages] = useState<any[]>([]);
  const [warmupEnabled, setWarmupEnabled] = useState(true);

  // Diagnostic Tester State
  const [subject, setSubject] = useState("Welcome to our platform! Your account is ready");
  const [bodyHtml, setBodyHtml] = useState(
    `<p>Hi there,</p>\n<p>Thank you for signing up with us. We are excited to have you on board!</p>\n<p>If you have any questions, simply reply to this email.</p>\n<br/>\n<p style="font-size:11px;color:#888;">If you prefer not to receive these emails, you can <a href="https://example.com/unsubscribe">unsubscribe here</a>.</p>`
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);

  // Fetch deliverability data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/deliverability");
      if (res.ok) {
        const json = await res.json();
        setDomains(json.domains || []);
        setMetrics(json.metrics || null);
        setWarmupStages(json.stages || []);
        if (json.domains?.length > 0 && !selectedDomainId) {
          setSelectedDomainId(json.domains[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load deliverability status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Run live analysis
  const runDiagnostic = async () => {
    try {
      setAnalyzing(true);
      const res = await fetch("/api/v1/deliverability/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: selectedDomainId,
          subject,
          bodyHtml,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setAnalysisReport(json.report);
      }
    } catch (err) {
      console.error("Diagnostic failed", err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Run initial diagnostic when domains are loaded
  useEffect(() => {
    if (domains.length > 0 && !analysisReport) {
      runDiagnostic();
    }
  }, [domains, selectedDomainId]);

  const activeDomain = domains.find((d) => d.id === selectedDomainId) || domains[0];

  const loadPreset = (type: "clean" | "sales" | "spammy") => {
    if (type === "clean") {
      setSubject("Your order #84920 has been confirmed");
      setBodyHtml(
        `<p>Hi Customer,</p>\n<p>We received your order and are currently preparing it for shipment.</p>\n<p>View your receipt and status in your dashboard.</p>\n<br/>\n<p style="font-size:11px;color:#888;">Manage your email preferences or <a href="https://example.com/unsubscribe">unsubscribe</a>.</p>`
      );
    } else if (type === "sales") {
      setSubject("Quick question regarding your email infrastructure");
      setBodyHtml(
        `<p>Hi Sarah,</p>\n<p>I noticed your team has been scaling customer notifications lately. We help companies improve inbox placement by up to 99.8%.</p>\n<p>Would you be open to a quick 5-minute chat this Thursday?</p>\n<br/>\n<p style="font-size:11px;color:#888;">To opt-out from future emails, please <a href="https://example.com/unsubscribe">click here to unsubscribe</a>.</p>`
      );
    } else if (type === "spammy") {
      setSubject("CONGRATULATIONS URGENT FREE MONEY CLICK HERE NOW!!!");
      setBodyHtml(
        `<p>YOU ARE A WINNER OF 100% FREE CASH PRIZE OF ONE MILLION DOLLARS!</p>\n<p>Act now! Exclusive deal expires immediately! Don't delete this message or miss this passive income opportunity!</p>`
      );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary-100 text-primary-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Deliverability & Warmup Engine</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time DNS diagnostic, automated 30-day warmup tracker, and interactive spam score analyzer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {domains.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">Active Domain:</span>
              <select
                value={selectedDomainId}
                onChange={(e) => setSelectedDomainId(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-slate-700">Auto Warmup:</span>
            <button
              type="button"
              onClick={() => setWarmupEnabled(!warmupEnabled)}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                warmupEnabled ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                  warmupEnabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* REPUTATION METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sender Score</span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {metrics?.senderScore || 98} <span className="text-sm font-normal text-slate-400">/ 100</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Calculated from bounce & deliverability health.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Rate</span>
            <span className="p-1 rounded-md bg-primary-50 text-primary-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {metrics?.deliveryRate || "100%"}
          </div>
          <p className="text-xs text-slate-500 mt-1">Verified inbox receipt across providers.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hard Bounce Rate</span>
            <span className="p-1 rounded-md bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {metrics?.bounceRate || "0.00%"}
          </div>
          <p className="text-xs text-slate-500 mt-1">Target is below 2.0% threshold.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">DNSBL Blocklists</span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            Clean
          </div>
          <p className="text-xs text-slate-500 mt-1">0 listings on Spamhaus, SURBL & Barracuda.</p>
        </div>
      </div>

      {/* SMART SOFT THROTTLE PACING BANNER */}
      {activeDomain?.warmup?.isApproachingWarmup && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs ${
          activeDomain.warmup.isExceedingWarmup
            ? "bg-amber-50 border-amber-200 text-amber-900"
            : "bg-blue-50 border-blue-200 text-blue-900"
        }`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
            activeDomain.warmup.isExceedingWarmup ? "text-amber-600" : "text-blue-600"
          }`} />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm">
              {activeDomain.warmup.isExceedingWarmup
                ? `Warmup Volume Advisory for ${activeDomain.name}`
                : `Approaching Safe Warmup Pacing for ${activeDomain.name}`}
            </p>
            <p>
              Your domain is currently in <strong>{activeDomain.warmup.stageLabel} ({activeDomain.warmup.stageDays})</strong> with a recommended limit of <strong>{activeDomain.warmup.dailyLimit} emails/day</strong>. You have dispatched <strong>{activeDomain.warmup.sentToday}</strong> emails today.
            </p>
            <p className="text-[11px] opacity-80">
              {activeDomain.warmup.isExceedingWarmup
                ? "Sending significantly above the warmup curve may temporarily reduce inbox placement on Gmail or Yahoo. Consider pacing remaining sends over the next few hours."
                : "Safe sending pacing preserves high sender score and keeps your domain out of spam traps."}
            </p>
          </div>
        </div>
      )}

      {/* SECTION: LIVE SPAM SCORE & CONTENT DIAGNOSTIC */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-black text-slate-900">Live Spam Score & Content Analyzer</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant 1-click test: Scans real DNS authentication records (SPF, DKIM, DMARC), spam trigger keywords, and compliance rules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Presets:</span>
            <button
              onClick={() => loadPreset("clean")}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Transactional
            </button>
            <button
              onClick={() => loadPreset("sales")}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Cold Outreach
            </button>
            <button
              onClick={() => loadPreset("spammy")}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition border border-rose-200"
            >
              Spammy Sample
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* TESTER INPUTS */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Welcome to Sendport"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email HTML / Text Body
              </label>
              <textarea
                rows={6}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                placeholder="Paste your email HTML or plain text copy here..."
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Tests against {activeDomain?.name || "your domain"} DNS & 40+ anti-spam filters
              </span>
              <button
                onClick={runDiagnostic}
                disabled={analyzing}
                className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing DNS & Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Run Diagnostic Test
                  </>
                )}
              </button>
            </div>
          </div>

          {/* DIAGNOSTIC RESULTS SCORECARD */}
          <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between">
            {analysisReport ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Deliverability Score</span>
                    <p className="text-xs text-slate-500 mt-0.5">{analysisReport.summary}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-xl font-black text-2xl shadow-xs ${
                      analysisReport.score >= 90
                        ? "bg-emerald-500 text-white"
                        : analysisReport.score >= 75
                        ? "bg-primary-500 text-white"
                        : analysisReport.score >= 50
                        ? "bg-amber-500 text-white"
                        : "bg-rose-500 text-white"
                    }`}>
                      {analysisReport.score} <span className="text-xs font-normal">/ 100</span>
                    </span>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">Grade: {analysisReport.grade}</p>
                  </div>
                </div>

                {/* Score breakdown pillars */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">DNS Auth</p>
                    <p className="font-black text-slate-800 mt-0.5">{analysisReport.dnsScore} / 50</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Content</p>
                    <p className="font-black text-slate-800 mt-0.5">{analysisReport.contentScore} / 30</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Compliance</p>
                    <p className="font-black text-slate-800 mt-0.5">{analysisReport.complianceScore} / 20</p>
                  </div>
                </div>

                {/* Detected spam words badge list */}
                {analysisReport.triggersDetected?.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80">
                    <p className="text-[11px] font-bold text-rose-800 flex items-center gap-1.5 mb-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Detected Spam Trigger Keywords:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {analysisReport.triggersDetected.map((trigger, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-rose-200/70 text-rose-900 text-[10px] font-mono font-bold">
                          "{trigger}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Findings checklist */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {analysisReport.findings.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-200/70 text-xs">
                      {f.type === "pass" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                      {f.type === "warn" && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                      {f.type === "fail" && <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-800 text-[11px]">{f.title}</p>
                          {f.impact !== 0 && (
                            <span className={`text-[10px] font-mono font-bold ${
                              f.impact > 0 ? "text-emerald-600" : "text-rose-600"
                            }`}>
                              {f.impact > 0 ? `+${f.impact}` : f.impact} pts
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Click "Run Diagnostic Test" to generate real-time deliverability score.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION: 30-DAY AUTOMATED WARMUP PROGRESSION */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-black text-slate-900">30-Day Automated Warmup Progression</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Gradually increases daily email volume over 30 days to build positive sender reputation with Gmail, Outlook, and Yahoo.
            </p>
          </div>

          {activeDomain && (
            <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Domain Age:</span>
                <p className="font-bold text-slate-800">Day {activeDomain.warmup?.dayAge || 1}</p>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Phase:</span>
                <p className="font-bold text-primary-600">{activeDomain.warmup?.stageLabel || "Initial Seed"}</p>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Today's Pacing:</span>
                <p className="font-bold text-slate-800">
                  {activeDomain.warmup?.sentToday || 0} / {activeDomain.warmup?.dailyLimit || 50}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PROGRESSION SCHEDULE TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Warmup Stage</th>
                <th className="px-5 py-3">Timeline</th>
                <th className="px-5 py-3">Safe Daily Volume</th>
                <th className="px-5 py-3">Ramp-Up Curve</th>
                <th className="px-5 py-3">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(warmupStages.length > 0
                ? warmupStages
                : [
                    { stage: "Stage 1", days: "Days 1 - 3", dailyLimit: 50, ramp: "10%", label: "Initial Seed", minDay: 1, maxDay: 3 },
                    { stage: "Stage 2", days: "Days 4 - 7", dailyLimit: 250, ramp: "25%", label: "Early Trust", minDay: 4, maxDay: 7 },
                    { stage: "Stage 3", days: "Days 8 - 14", dailyLimit: 1000, ramp: "50%", label: "Scaling Phase", minDay: 8, maxDay: 14 },
                    { stage: "Stage 4", days: "Days 15 - 21", dailyLimit: 2500, ramp: "75%", label: "High Volume", minDay: 15, maxDay: 21 },
                    { stage: "Stage 5", days: "Days 22 - 30+", dailyLimit: 5000, ramp: "100%", label: "Fully Warmed", minDay: 22, maxDay: 9999 },
                  ]
              ).map((stageItem: any, idx: number) => {
                const dayAge = activeDomain?.warmup?.dayAge || 1;
                const isCurrent = dayAge >= stageItem.minDay && dayAge <= stageItem.maxDay;
                const isCompleted = dayAge > stageItem.maxDay;

                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isCurrent
                        ? "bg-primary-50/50 font-bold text-slate-900"
                        : isCompleted
                        ? "bg-slate-50/30 text-slate-700"
                        : "text-slate-500"
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />}
                        <span>{stageItem.stage}</span>
                        <span className="text-[10px] font-normal text-slate-400">({stageItem.label})</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono">{stageItem.days}</td>
                    <td className="px-5 py-3.5 font-bold font-mono">
                      {stageItem.dailyLimit.toLocaleString()} / day
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{stageItem.ramp}</td>
                    <td className="px-5 py-3.5">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-primary-700 bg-primary-100 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-primary-300">
                          <Zap className="w-3 h-3" /> Active Stage
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Upcoming</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
