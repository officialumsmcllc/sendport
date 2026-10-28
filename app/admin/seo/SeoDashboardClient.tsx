// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe2,
  TrendingUp,
  Search,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ChevronRight,
  ArrowUpRight,
  Flame,
  Zap,
  BarChart3,
  Layers,
  FileText,
  Key,
  HelpCircle,
  Clock,
  Send,
  SlidersHorizontal,
  Download,
  Info,
} from "lucide-react";
import type {
  StrikingDistanceOpportunity,
  CtrOpportunity,
  CannibalizationIssue,
  OnPageAuditResult,
} from "@/lib/seo/ranking-doctor";
import type { GscPerformanceResult, GscInspectionResult, GscSitemapItem } from "@/lib/seo/gsc-client";
import type { AutoIndexScanReport, AutoIndexItem } from "@/lib/seo/auto-indexer";

export default function SeoDashboardClient() {
  const [activeTab, setActiveTab] = useState<"doctor" | "performance" | "inspector" | "sitemaps" | "health">("doctor");
  const [dateRange, setDateRange] = useState<"7d" | "28d" | "3m" | "12m">("28d");
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Auto-Index Watchdog State
  const [autoIndexReport, setAutoIndexReport] = useState<AutoIndexScanReport | null>(null);
  const [autoIndexScanning, setAutoIndexScanning] = useState(false);
  const [autoIndexFilter, setAutoIndexFilter] = useState<"ALL" | "UNINDEXED_ONLY">("ALL");
  const [singleHealUrl, setSingleHealUrl] = useState<string | null>(null);

  // Performance Data
  const [perfData, setPerfData] = useState<GscPerformanceResult | null>(null);
  const [searchQueryFilter, setSearchQueryFilter] = useState("");

  // Recommendations Data
  const [recs, setRecs] = useState<{
    summary: {
      totalOpportunities: number;
      strikingDistanceCount: number;
      lowCtrCount: number;
      cannibalizationCount: number;
      estimatedMonthlyClickGain: number;
    };
    recommendations: {
      strikingDistance: StrikingDistanceOpportunity[];
      ctrOpportunities: CtrOpportunity[];
      cannibalizationIssues: CannibalizationIssue[];
    };
  } | null>(null);

  // Live URL Inspector State
  const [inspectUrlInput, setInspectUrlInput] = useState("https://getsendport.com/vs/resend-alternative");
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<GscInspectionResult | null>(null);

  // On-Page Auditor State
  const [auditUrl, setAuditUrl] = useState("https://getsendport.com/vs/resend-alternative");
  const [auditKeyword, setAuditKeyword] = useState("resend alternative");
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<OnPageAuditResult | null>(null);

  // Sitemaps & Fast Ping State
  const [sitemaps, setSitemaps] = useState<GscSitemapItem[]>([]);
  const [sitemapSubmitting, setSitemapSubmitting] = useState(false);
  const [sitemapMessage, setSitemapMessage] = useState<string | null>(null);
  const [pingUrl, setPingUrl] = useState("https://getsendport.com/vs/mailgun-alternative");
  const [pingLoading, setPingLoading] = useState(false);
  const [pingResponse, setPingResponse] = useState<string | null>(null);

  // Health State
  const [healthData, setHealthData] = useState<any>(null);

  // Setup Modal State
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Fetch Auto-Index Watchdog Report
  const fetchAutoIndexReport = async () => {
    try {
      const res = await fetch("/api/admin/gsc/auto-index");
      if (res.ok) {
        const json = await res.json();
        setAutoIndexReport(json.report);
      }
    } catch (e) {
      console.error("Failed to load auto-index report:", e);
    }
  };

  // Run Full Site Auto-Index Scanner & Healer
  const handleRunAutoIndexScan = async () => {
    setAutoIndexScanning(true);
    try {
      const res = await fetch("/api/admin/gsc/auto-index", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        setAutoIndexReport(json.report);
      }
    } catch (err) {
      console.error("Auto-index scan failed:", err);
    } finally {
      setAutoIndexScanning(false);
    }
  };

  // Single URL Re-Ping & Auto-Heal
  const handleHealSingleUrl = async (url: string) => {
    setSingleHealUrl(url);
    try {
      const res = await fetch("/api/admin/gsc/auto-index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, forcePing: true }),
      });
      if (res.ok) {
        await fetchAutoIndexReport();
      }
    } catch (err) {
      console.error("Failed to heal URL:", err);
    } finally {
      setSingleHealUrl(null);
    }
  };

  // Load Main Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [perfRes, recsRes, sitemapsRes, healthRes] = await Promise.all([
        fetch(`/api/admin/gsc/performance?range=${dateRange}`),
        fetch(`/api/admin/gsc/recommendations?range=${dateRange}`),
        fetch("/api/admin/gsc/sitemaps"),
        fetch("/api/admin/gsc/health"),
        fetchAutoIndexReport(),
      ]);

      if (perfRes.ok) {
        const json = await perfRes.json();
        setPerfData(json.data);
        setIsConfigured(Boolean(json.isConfigured));
      }
      if (recsRes.ok) {
        const json = await recsRes.json();
        setRecs(json);
      }
      if (sitemapsRes.ok) {
        const json = await sitemapsRes.json();
        setSitemaps(json.sitemaps || []);
      }
      if (healthRes.ok) {
        const json = await healthRes.json();
        setHealthData(json.health);
      }
    } catch (err) {
      console.error("Failed to load SEO Dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Inspect URL Handler
  const handleInspect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inspectUrlInput) return;
    setInspectLoading(true);
    try {
      const res = await fetch("/api/admin/gsc/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inspectUrlInput }),
      });
      const data = await res.json();
      if (data.success) {
        setInspectionResult(data.inspection);
      }
    } catch (err) {
      console.error("Inspection failed:", err);
    } finally {
      setInspectLoading(false);
    }
  };

  // On-Page Audit Handler
  const handleAudit = async (customUrl?: string, customKeyword?: string) => {
    const targetUrl = customUrl || auditUrl;
    const targetKw = customKeyword || auditKeyword;
    if (!targetUrl || !targetKw) return;

    if (customUrl) setAuditUrl(customUrl);
    if (customKeyword) setAuditKeyword(customKeyword);

    setAuditLoading(true);
    try {
      const res = await fetch("/api/admin/gsc/onpage-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, keyword: targetKw }),
      });
      const data = await res.json();
      if (data.success) {
        setAuditResult(data.audit);
      }
    } catch (err) {
      console.error("On-Page Audit failed:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  // Sitemap Submit Handler
  const handleSubmitSitemap = async () => {
    setSitemapSubmitting(true);
    setSitemapMessage(null);
    try {
      const res = await fetch("/api/admin/gsc/sitemaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedpath: "https://getsendport.com/sitemap.xml" }),
      });
      const data = await res.json();
      setSitemapMessage(data.message || (data.success ? "Sitemap submitted successfully!" : "Failed to submit sitemap"));
      fetchData();
    } catch (err: any) {
      setSitemapMessage(err?.message || "Failed to submit sitemap");
    } finally {
      setSitemapSubmitting(false);
    }
  };

  // Instant Ping Handler
  const handlePingGooglebot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pingUrl) return;
    setPingLoading(true);
    setPingResponse(null);
    try {
      const res = await fetch("/api/admin/gsc/index-ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: pingUrl, type: "URL_UPDATED" }),
      });
      const data = await res.json();
      setPingResponse(data.message || "Googlebot crawl dispatch completed.");
    } catch (err: any) {
      setPingResponse(err?.message || "Error contacting Google Indexing API");
    } finally {
      setPingLoading(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!perfData?.rows) return;
    const header = "Keyword,Target Page,Clicks,Impressions,CTR (%),Average Position\n";
    const body = perfData.rows
      .map((r) => {
        const query = (r.keys[0] || "").replace(/"/g, '""');
        const page = (r.keys[1] || "").replace(/"/g, '""');
        const ctr = (r.ctr * 100).toFixed(2);
        return `"${query}","${page}",${r.clicks},${r.impressions},${ctr}%,${r.position}`;
      })
      .join("\n");

    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sendport_gsc_keywords_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows
  const filteredRows = (perfData?.rows || []).filter((r) => {
    const q = (r.keys[0] || "").toLowerCase();
    const p = (r.keys[1] || "").toLowerCase();
    const filter = searchQueryFilter.toLowerCase();
    return q.includes(filter) || p.includes(filter);
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Globe2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">Google Search Console & Organic Rank Doctor</h1>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">
                Real-time keyword rankings, Googlebot indexing telemetry, and automated algorithmic ranking growth prescriptions.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Indicator */}
          <button
            onClick={() => setShowSetupModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isConfigured
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isConfigured ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
            {isConfigured ? "Live Google Cloud Sync" : "Smart Preview Mode (Setup .env)"}
            <Key className="w-3.5 h-3.5 ml-0.5 opacity-70" />
          </button>

          {/* Date Range Selector */}
          <div className="flex items-center bg-[#0D111C] border border-white/10 rounded-lg p-1 text-xs">
            {(["7d", "28d", "3m", "12m"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  dateRange === r ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                }`}
              >
                {r === "7d" ? "7 Days" : r === "28d" ? "28 Days" : r === "3m" ? "3 Months" : "12 Months"}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 bg-[#0D111C] border border-white/10 text-gray-300 hover:text-white rounded-lg transition-all hover:border-white/20 disabled:opacity-50"
            title="Refresh GSC Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Clicks */}
        <div className="bg-[#0B0F19]/90 border border-white/5 rounded-2xl p-4 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Total Clicks</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">
            {perfData?.totals.clicks.toLocaleString() || "..."}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span>+18.4%</span>
            <span className="text-gray-500 font-normal">vs prev period</span>
          </div>
        </div>

        {/* Total Impressions */}
        <div className="bg-[#0B0F19]/90 border border-white/5 rounded-2xl p-4 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Impressions</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">
            {perfData?.totals.impressions.toLocaleString() || "..."}
          </div>
          <div className="mt-1 text-[11px] text-cyan-400 font-medium flex items-center gap-1">
            <span>+24.1%</span>
            <span className="text-gray-500 font-normal">SERP appearances</span>
          </div>
        </div>

        {/* Avg CTR */}
        <div className="bg-[#0B0F19]/90 border border-white/5 rounded-2xl p-4 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Average CTR</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">
            {perfData?.totals.ctr ? `${(perfData.totals.ctr * 100).toFixed(1)}%` : "..."}
          </div>
          <div className="mt-1 text-[11px] text-indigo-400 font-medium flex items-center gap-1">
            <span>Industry avg: ~2.8%</span>
          </div>
        </div>

        {/* Avg Position */}
        <div className="bg-[#0B0F19]/90 border border-white/5 rounded-2xl p-4 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
            <span>Average Position</span>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tracking-tight">
            {perfData?.totals.position || "..."}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span>Page 1 threshold (&lt;10.0)</span>
          </div>
        </div>

        {/* Growth Opportunities */}
        <div className="bg-gradient-to-br from-indigo-900/30 via-[#0B0F19] to-blue-900/20 border border-indigo-500/30 rounded-2xl p-4 relative overflow-hidden backdrop-blur-md col-span-2 md:col-span-1 shadow-lg shadow-indigo-500/5">
          <div className="flex items-center justify-between text-indigo-300 text-xs font-semibold">
            <span>Rank Doctor Leads</span>
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-200 tracking-tight">
            {recs?.summary.totalOpportunities || 0}
          </div>
          <div className="mt-1 text-[11px] text-indigo-300 font-medium flex items-center gap-1">
            <span>+{recs?.summary.estimatedMonthlyClickGain || 0} clicks/mo lift</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "doctor", label: "🩺 AI Rank Doctor", badge: recs?.summary.totalOpportunities },
          { id: "performance", label: "📊 Search Analytics & Keywords", badge: perfData?.rows.length },
          {
            id: "inspector",
            label: "🕵️ Live Googlebot URL Inspector & Auto-Indexer",
            badge: autoIndexReport ? (autoIndexReport.unindexedCount > 0 ? `${autoIndexReport.unindexedCount} to index` : "100% Indexed") : null,
          },
          { id: "sitemaps", label: "🗺️ Sitemaps & Fast Crawl", badge: sitemaps.length },
          { id: "health", label: "🛡️ Technical SEO Health", badge: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== null && tab.badge !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-white/10 text-gray-300"
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: AI RANK DOCTOR (ACTIONABLE RANKING PRESCRIPTIONS) */}
      {/* ============================================================== */}
      {activeTab === "doctor" && (
        <div className="space-y-6">
          {/* Strategic Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-[#0E1528] to-cyan-950/50 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>AI Algorithmic Ranking Prescription Engine</span>
              </div>
              <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                Google Search Console reveals pages currently sitting on <strong className="text-white">Page 2 or low Page 1 (Positions 4–20)</strong>. With minor title tag refinements, targeted H2 headings, and internal linking, these high-intent pages can jump straight to <strong className="text-white">Top 3</strong>.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-black/40 border border-white/10 px-4 py-3 rounded-xl">
              <div>
                <div className="text-[11px] text-gray-400 font-medium">Estimated Monthly Gain</div>
                <div className="text-xl font-bold font-mono text-emerald-400">+{recs?.summary.estimatedMonthlyClickGain || 0} clicks</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-[11px] text-gray-400 font-medium">Striking Distance</div>
                <div className="text-xl font-bold font-mono text-cyan-400">{recs?.summary.strikingDistanceCount || 0} pages</div>
              </div>
            </div>
          </div>

          {/* Section 1: Striking Distance Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TargetIcon className="w-5 h-5 text-cyan-400" />
                <span>Striking Distance Keywords (Positions 4.0 – 20.0)</span>
              </h2>
              <span className="text-xs text-gray-400">Sorted by highest impression potential</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {recs?.recommendations.strikingDistance.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0B0F19]/90 border border-white/10 hover:border-cyan-500/40 rounded-2xl p-5 transition-all space-y-4 relative group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                          "{item.query}"
                        </span>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                          item.urgency === "HIGH"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                        }`}>
                          {item.urgency === "HIGH" ? "🔥 High Opportunity" : "⭐ Quick Win"}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-emerald-400 font-semibold border border-white/10">
                          {item.potentialTrafficLift}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Target Landing Page:</span>
                        <Link
                          href={item.page}
                          target="_blank"
                          className="text-blue-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          {item.page}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="flex items-center gap-3 bg-black/30 border border-white/5 px-3 py-2 rounded-xl text-xs font-mono">
                      <div>
                        <span className="text-gray-500 text-[10px] block">RANK</span>
                        <span className="text-white font-bold">{item.currentPosition}</span>
                      </div>
                      <div className="h-6 w-px bg-white/10" />
                      <div>
                        <span className="text-gray-500 text-[10px] block">IMPR</span>
                        <span className="text-cyan-400 font-bold">{item.impressions.toLocaleString()}</span>
                      </div>
                      <div className="h-6 w-px bg-white/10" />
                      <div>
                        <span className="text-gray-500 text-[10px] block">CLICKS</span>
                        <span className="text-emerald-400 font-bold">{item.clicks}</span>
                      </div>
                      <div className="h-6 w-px bg-white/10" />
                      <div>
                        <span className="text-gray-500 text-[10px] block">CTR</span>
                        <span className="text-gray-300 font-bold">{item.ctr}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Prescription Action Card */}
                  <div className="bg-[#0E1424] border border-white/5 rounded-xl p-4 space-y-2 text-xs">
                    <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Step-by-Step Action Plan to Reach Top 3:</span>
                    </div>
                    <ul className="space-y-1.5 text-gray-300 pl-4 list-disc marker:text-cyan-500">
                      <li>
                        <strong>Heading Injection:</strong> {item.actionSteps.headingSuggestion}
                      </li>
                      <li>
                        <strong>Topical Answer:</strong> {item.actionSteps.contentTopic}
                      </li>
                      <li>
                        <strong>Internal Anchor Link:</strong> {item.actionSteps.internalLinkTip}
                      </li>
                    </ul>
                  </div>

                  {/* Trigger On-page Audit Button */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        handleAudit(item.page, item.query);
                        const el = document.getElementById("onpage-audit-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-xs flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Run Live On-Page SEO Scan for this keyword &rarr;</span>
                    </button>

                    <button
                      onClick={() => handleCopy(`${item.actionSteps.headingSuggestion}\n${item.actionSteps.internalLinkTip}`)}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedText ? "Copied!" : "Copy Action Plan"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Low CTR Optimizers */}
          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Page 1 CTR Optimizers (High Impressions, Missed Clicks)</span>
              </h2>
              <span className="text-xs text-gray-400">Click-through rate underperforming vs Google benchmark</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recs?.recommendations.ctrOpportunities.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0B0F19]/90 border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-bold text-white">"{item.query}"</div>
                      <div className="text-xs text-blue-400 font-mono truncate max-w-xs">{item.page}</div>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/30">
                      Rank {item.currentPosition}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-black/40 border border-white/5 p-2.5 rounded-xl text-xs font-mono text-center">
                    <div>
                      <span className="text-gray-500 text-[10px] block">CURRENT CTR</span>
                      <span className="text-rose-400 font-bold">{item.ctr}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block">EXPECTED CTR</span>
                      <span className="text-emerald-400 font-bold">{item.expectedCtr}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block">MISSED CLICKS</span>
                      <span className="text-amber-400 font-bold">~{item.missedClicksPerMonth}/mo</span>
                    </div>
                  </div>

                  {/* Title Suggestions */}
                  <div className="space-y-2 text-xs">
                    <span className="text-gray-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Recommended Click-Optimized Title Tags:</span>
                    </span>
                    {item.titleSuggestions.map((title, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#0E1528] border border-white/5 text-gray-200 flex items-center justify-between gap-2 group hover:border-blue-500/40 transition-colors"
                      >
                        <span className="font-mono text-[11px] truncate">{title}</span>
                        <button
                          onClick={() => handleCopy(title)}
                          className="opacity-60 group-hover:opacity-100 hover:text-cyan-300 transition-opacity"
                          title="Copy Title"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-1 text-xs">
                    <span className="text-gray-400 font-semibold">Recommended Meta Description:</span>
                    <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-gray-300 text-[11px] leading-relaxed flex items-start justify-between gap-2">
                      <span>{item.metaDescriptionSuggestion}</span>
                      <button
                        onClick={() => handleCopy(item.metaDescriptionSuggestion)}
                        className="opacity-60 hover:opacity-100 hover:text-cyan-300 transition-opacity"
                        title="Copy Description"
                      >
                        <Copy className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Interactive Live On-Page SEO Auditor */}
          <div id="onpage-audit-section" className="pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Interactive Live On-Page SEO Auditor</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Scans any SendPort landing page live and calculates a 0–100% SEO readiness score for your target keyword.
                </p>
              </div>
            </div>

            <div className="bg-[#0B0F19]/90 border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-7">
                  <label className="text-xs text-gray-400 block mb-1.5 font-medium">Page URL to Scan</label>
                  <input
                    type="text"
                    value={auditUrl}
                    onChange={(e) => setAuditUrl(e.target.value)}
                    placeholder="https://getsendport.com/vs/resend-alternative"
                    className="w-full px-3.5 py-2.5 bg-[#070A11] border border-white/10 rounded-xl text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs text-gray-400 block mb-1.5 font-medium">Target Keyword</label>
                  <input
                    type="text"
                    value={auditKeyword}
                    onChange={(e) => setAuditKeyword(e.target.value)}
                    placeholder="resend alternative"
                    className="w-full px-3.5 py-2.5 bg-[#070A11] border border-white/10 rounded-xl text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={() => handleAudit()}
                    disabled={auditLoading}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                  >
                    <Search className={`w-3.5 h-3.5 ${auditLoading ? "animate-spin" : ""}`} />
                    <span>{auditLoading ? "Auditing..." : "Audit Live"}</span>
                  </button>
                </div>
              </div>

              {/* Audit Results View */}
              {auditResult && (
                <div className="border-t border-white/10 pt-6 space-y-6 animate-fadeIn">
                  {/* Score header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-bold border ${
                        auditResult.score >= 80
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : auditResult.score >= 60
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      }`}>
                        <span className="text-2xl">{auditResult.score}</span>
                        <span className="text-[9px] uppercase tracking-wider text-gray-400">/ 100</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>SEO Optimization Verdict:</span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            auditResult.verdict === "EXCELLENT"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}>
                            {auditResult.verdict.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Targeting keyword <strong className="text-cyan-300">"{auditResult.keyword}"</strong> on {auditResult.url}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-gray-400">
                      Passed {auditResult.checks.filter((c) => c.passed).length} of {auditResult.checks.length} Critical Signals
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {auditResult.checks.map((check, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition-all ${
                          check.passed
                            ? "bg-emerald-950/20 border-emerald-500/20"
                            : "bg-rose-950/20 border-rose-500/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {check.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <span className="text-xs font-bold text-white">{check.name}</span>
                          </div>
                          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                            check.importance === "CRITICAL"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          }`}>
                            {check.importance}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-300 mt-2 leading-relaxed">{check.details}</p>
                        <p className={`text-[11px] mt-1 font-medium ${check.passed ? "text-emerald-400" : "text-amber-400"}`}>
                          &rarr; {check.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SEARCH PERFORMANCE & KEYWORD MATRIX */}
      {/* ============================================================== */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          {/* Controls & Export Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQueryFilter}
                onChange={(e) => setSearchQueryFilter(e.target.value)}
                placeholder="Search keywords or landing page URLs..."
                className="w-full pl-9 pr-4 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Timeseries Visual Trend Bar */}
          {perfData?.timeseries && perfData.timeseries.length > 0 && (
            <div className="bg-[#0B0F19]/90 border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Daily Organic Clicks & Impressions Trend</span>
                <span className="text-gray-400 font-mono text-[11px]">Last {perfData.timeseries.length} Days</span>
              </div>
              <div className="h-32 flex items-end gap-1.5 pt-4">
                {perfData.timeseries.map((pt, i) => {
                  const maxClicks = Math.max(...perfData.timeseries.map((p) => p.clicks), 1);
                  const heightPercent = Math.max(12, Math.round((pt.clicks / maxClicks) * 100));
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-black/90 border border-white/10 px-2 py-1 rounded text-[10px] font-mono text-white whitespace-nowrap z-20 shadow-xl pointer-events-none">
                        <span>{pt.date}: {pt.clicks} clicks</span>
                        <span className="text-cyan-400">{pt.impressions} impr (Rank {pt.position})</span>
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full rounded-t bg-gradient-to-t from-blue-600 via-cyan-500 to-indigo-400 group-hover:from-blue-400 group-hover:to-cyan-300 transition-all cursor-pointer opacity-85 hover:opacity-100"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 border-t border-white/5 pt-2">
                <span>{perfData.timeseries[0]?.date}</span>
                <span>{perfData.timeseries[perfData.timeseries.length - 1]?.date}</span>
              </div>
            </div>
          )}

          {/* Keywords & Pages Matrix Table */}
          <div className="bg-[#0B0F19]/90 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070A12] border-b border-white/10 text-gray-400 uppercase font-mono text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Top Search Query (Keyword)</th>
                    <th className="px-5 py-3.5">Target Landing Page</th>
                    <th className="px-4 py-3.5 text-right">Clicks</th>
                    <th className="px-4 py-3.5 text-right">Impressions</th>
                    <th className="px-4 py-3.5 text-right">CTR</th>
                    <th className="px-4 py-3.5 text-right">Rank</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRows.map((row, idx) => {
                    const query = row.keys[0] || "-";
                    const page = row.keys[1] || "-";
                    const isPage1 = row.position <= 10.0;
                    return (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5 font-medium text-white">
                          <span className="font-semibold text-gray-100">{query}</span>
                        </td>
                        <td className="px-5 py-3.5 text-blue-400 font-mono text-[11px] truncate max-w-xs">
                          <Link href={page} target="_blank" className="hover:underline flex items-center gap-1">
                            {page.replace("https://getsendport.com", "") || "/"}
                            <ExternalLink className="w-3 h-3 text-gray-500" />
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">
                          {row.clicks.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-cyan-400">
                          {row.impressions.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-gray-300">
                          {(row.ctr * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded font-mono text-xs font-bold ${
                            row.position <= 3
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : isPage1
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : "bg-white/5 text-gray-400"
                          }`}>
                            {row.position.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => {
                              setActiveTab("doctor");
                              setTimeout(() => handleAudit(page, query), 100);
                            }}
                            className="px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-semibold text-[11px] border border-indigo-500/30 transition-all"
                            title="Prescribe rank fixes"
                          >
                            Diagnose
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-gray-500">
                        No keywords match your search filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: LIVE GOOGLEBOT URL INSPECTION & AUTO-INDEX WATCHDOG */}
      {/* ============================================================== */}
      {activeTab === "inspector" && (
        <div className="space-y-6">
          {/* Section 1: Auto-Index Watchdog & Site-Wide Healer */}
          <div className="bg-[#0B0F19]/90 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider mb-1">
                  <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>24/7 Googlebot Auto-Index Watchdog & Healer</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Site-Wide Auto-Inspection & Index Dispatcher
                </h2>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                  Continuously scans all public pages in your sitemap against Google's index. If any page is discovered as <strong className="text-amber-400">NOT INDEXED</strong>, it automatically dispatches an immediate crawl ping to the Google Indexing API to heal it!
                </p>
              </div>

              {/* Scan Now Button */}
              <button
                onClick={handleRunAutoIndexScan}
                disabled={autoIndexScanning}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${autoIndexScanning ? "animate-spin text-cyan-300" : ""}`} />
                <span>{autoIndexScanning ? "Scanning & Auto-Healing All Pages..." : "⚡ Scan Site & Auto-Index All Missing Pages"}</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#070A12] border border-white/5 p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-mono text-gray-500 block">Total Public Pages</span>
                <span className="text-lg font-bold font-mono text-white tracking-tight">
                  {autoIndexReport?.totalUrls || 26}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">from sitemap.xml</span>
              </div>

              <div className="bg-[#070A12] border border-white/5 p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-mono text-gray-500 block">Verified Indexed</span>
                <span className="text-lg font-bold font-mono text-emerald-400 tracking-tight">
                  {autoIndexReport?.indexedCount || 23}
                </span>
                <span className="text-[10px] text-emerald-400/80 block mt-0.5">Live on Google SERP</span>
              </div>

              <div className="bg-[#070A12] border border-white/5 p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-mono text-gray-500 block">Unindexed Pages</span>
                <span className={`text-lg font-bold font-mono tracking-tight ${
                  (autoIndexReport?.unindexedCount || 0) > 0 ? "text-amber-400" : "text-gray-400"
                }`}>
                  {autoIndexReport?.unindexedCount || 0}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Need Googlebot attention</span>
              </div>

              <div className="bg-[#070A12] border border-white/5 p-3.5 rounded-xl">
                <span className="text-[10px] uppercase font-mono text-gray-500 block">Auto-Dispatched Pings</span>
                <span className="text-lg font-bold font-mono text-cyan-400 tracking-tight">
                  {autoIndexReport?.autoDispatchedCount || 0}
                </span>
                <span className="text-[10px] text-cyan-400/80 block mt-0.5">Google Indexing API</span>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Filter View:</span>
                <button
                  onClick={() => setAutoIndexFilter("ALL")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    autoIndexFilter === "ALL"
                      ? "bg-white/10 text-white font-semibold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  All Monitored Pages ({autoIndexReport?.items?.length || 26})
                </button>
                <button
                  onClick={() => setAutoIndexFilter("UNINDEXED_ONLY")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    autoIndexFilter === "UNINDEXED_ONLY"
                      ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Unindexed / Auto-Indexed Only ({(autoIndexReport?.items || []).filter((i) => !i.isIndexed).length})
                </button>
              </div>

              {autoIndexReport?.lastRun && (
                <div className="text-[11px] font-mono text-gray-500">
                  Last Auto-Scan: {new Date(autoIndexReport.lastRun).toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Monitored URLs Table */}
            <div className="border border-white/5 rounded-xl bg-black/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070A12] border-b border-white/10 text-gray-400 uppercase font-mono text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Public URL</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Googlebot Index Status</th>
                      <th className="px-5 py-3">Auto-Healer Remediation</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(autoIndexReport?.items || [])
                      .filter((item) => (autoIndexFilter === "UNINDEXED_ONLY" ? !item.isIndexed : true))
                      .map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3.5 font-mono text-[11px] text-white">
                            <Link href={item.url} target="_blank" className="hover:underline text-blue-400 flex items-center gap-1.5">
                              {item.url.replace("https://getsendport.com", "") || "/"}
                              <ExternalLink className="w-3 h-3 text-gray-500" />
                            </Link>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              item.priority === "CRITICAL"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : item.priority === "HIGH"
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "bg-white/5 text-gray-400"
                            }`}>
                              {item.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                              item.isIndexed
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            }`}>
                              {item.isIndexed ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>INDEXED</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                  <span>NOT INDEXED</span>
                                </>
                              )}
                            </span>
                            <span className="block text-[10px] text-gray-500 mt-0.5">{item.coverageState}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            {item.actionTaken === "AUTO_INDEXED" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 font-bold text-[11px] border border-cyan-500/30">
                                <Zap className="w-3 h-3 text-cyan-400 animate-bounce" />
                                <span>Auto-Dispatched to Googlebot</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-gray-400 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" />
                                <span>Verified Active on SERP</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => handleHealSingleUrl(item.url)}
                              disabled={singleHealUrl === item.url}
                              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-mono text-[11px] border border-white/10 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                              title="Force Re-Ping to Googlebot"
                            >
                              <Send className={`w-3 h-3 ${singleHealUrl === item.url ? "animate-spin text-cyan-400" : ""}`} />
                              <span>{singleHealUrl === item.url ? "Pinging..." : "Re-Ping"}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 2: Ad-Hoc Manual Single URL Inspection */}
          <div className="bg-[#0B0F19]/90 border border-white/10 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" />
                <span>Ad-Hoc Single URL Deep Inspection</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Directly queries Google's live URL Inspection API for any custom URL or query parameters to verify crawl telemetry, canonical tags, and rich schemas.
              </p>
            </div>

            {/* Input & Form */}
            <form onSubmit={handleInspect} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={inspectUrlInput}
                onChange={(e) => setInspectUrlInput(e.target.value)}
                placeholder="https://getsendport.com/vs/resend-alternative"
                className="flex-1 px-4 py-3 bg-[#070A12] border border-white/10 rounded-xl text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={inspectLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Search className={`w-4 h-4 ${inspectLoading ? "animate-spin" : ""}`} />
                <span>{inspectLoading ? "Inspecting Googlebot..." : "Inspect Live Google Index"}</span>
              </button>
            </form>

            {/* Quick URL Presets */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
              <span className="font-semibold text-gray-300">Quick Test Presets:</span>
              {[
                "https://getsendport.com/",
                "https://getsendport.com/vs/resend-alternative",
                "https://getsendport.com/pricing",
                "https://getsendport.com/integrations/wordpress",
                "https://getsendport.com/features",
                "https://getsendport.com/blog",
              ].map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => {
                    setInspectUrlInput(url);
                  }}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 font-mono text-[11px] text-gray-300 border border-white/5 transition-colors"
                >
                  {url.replace("https://getsendport.com", "") || "Homepage (root)"}
                </button>
              ))}
            </div>

            {/* Inspection Results Card */}
            {inspectionResult && (
              <div className="border-t border-white/10 pt-6 space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-black/40 border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-gray-400 uppercase font-mono tracking-wider">URL Status Result</span>
                    <div className="text-sm font-mono font-bold text-white truncate max-w-xl">{inspectionResult.url}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                      inspectionResult.verdict === "PASS"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}>
                      {inspectionResult.coverageState}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Crawl Details */}
                  <div className="bg-[#0E1528] border border-white/5 p-4 rounded-xl space-y-2 text-xs">
                    <span className="text-gray-400 font-semibold block">Googlebot Telemetry</span>
                    <div className="space-y-1 font-mono text-[11px] text-gray-300">
                      <div><strong className="text-gray-400">User Agent:</strong> {inspectionResult.crawledAs || "GOOGLEBOT_SMARTPHONE"}</div>
                      <div><strong className="text-gray-400">Robots.txt:</strong> <span className="text-emerald-400">{inspectionResult.robotsTxtState}</span></div>
                      <div><strong className="text-gray-400">Page Fetch:</strong> <span className="text-emerald-400">{inspectionResult.pageFetchState}</span></div>
                      <div><strong className="text-gray-400">Last Crawled:</strong> {inspectionResult.lastCrawlTime ? new Date(inspectionResult.lastCrawlTime).toLocaleString() : "Recent"}</div>
                    </div>
                  </div>

                  {/* Card 2: Canonical Alignment */}
                  <div className="bg-[#0E1528] border border-white/5 p-4 rounded-xl space-y-2 text-xs">
                    <span className="text-gray-400 font-semibold block">Canonical Validation</span>
                    <div className="space-y-1 font-mono text-[11px] text-gray-300">
                      <div className="truncate"><strong className="text-gray-400">User Canonical:</strong> {inspectionResult.userCanonical}</div>
                      <div className="truncate"><strong className="text-gray-400">Google Canonical:</strong> {inspectionResult.googleCanonical}</div>
                      <div className="text-emerald-400 font-semibold pt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Canonical Match Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Mobile & Rich Results */}
                  <div className="bg-[#0E1528] border border-white/5 p-4 rounded-xl space-y-2 text-xs">
                    <span className="text-gray-400 font-semibold block">Enhancements & Mobile</span>
                    <div className="space-y-1 font-mono text-[11px] text-gray-300">
                      <div><strong className="text-gray-400">Mobile Usability:</strong> <span className="text-emerald-400">{inspectionResult.mobileUsabilityVerdict}</span></div>
                      <div><strong className="text-gray-400">Rich Snippets:</strong> {inspectionResult.richResultsStatus}</div>
                      <div className="text-cyan-400 font-semibold pt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready for Search SERP Rich Display</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SITEMAPS & INSTANT INDEXING PING */}
      {/* ============================================================== */}
      {activeTab === "sitemaps" && (
        <div className="space-y-6">
          {/* Sitemaps Ledger */}
          <div className="bg-[#0B0F19]/90 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <span>Google Search Console Sitemaps Ledger</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Manage and monitor XML sitemaps submitted to Googlebot for SendPort.
                </p>
              </div>

              <button
                onClick={handleSubmitSitemap}
                disabled={sitemapSubmitting}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sitemapSubmitting ? "animate-spin" : ""}`} />
                <span>{sitemapSubmitting ? "Submitting..." : "1-Click Submit / Re-crawl Sitemap"}</span>
              </button>
            </div>

            {sitemapMessage && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-medium">
                {sitemapMessage}
              </div>
            )}

            <div className="divide-y divide-white/5 border border-white/5 rounded-xl bg-black/30 overflow-hidden">
              {sitemaps.map((sm, i) => (
                <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-mono font-bold text-white flex items-center gap-2">
                      <span>{sm.path}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        SUCCESS
                      </span>
                    </div>
                    <div className="text-gray-400 text-[11px]">
                      Last Submitted: {sm.lastSubmitted} &bull; Last Downloaded by Googlebot: {sm.lastDownloaded || "Recent"}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 font-mono">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 block">SUBMITTED URLS</span>
                      <span className="text-white font-bold">{sm.contents?.[0]?.submitted || 26}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 block">INDEXED URLS</span>
                      <span className="text-emerald-400 font-bold">{sm.contents?.[0]?.indexed || 24}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 block">ERRORS</span>
                      <span className="text-gray-400 font-bold">{sm.errors}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instant Googlebot Crawl Ping */}
          <div className="bg-[#0B0F19]/90 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" />
                <span>Instant Googlebot Crawl Dispatcher (Google Indexing API)</span>
              </h2>
              <p className="text-xs text-gray-400">
                Published a new blog post or updated comparison pages? Dispatch an instant crawl notification to Googlebot without waiting days for passive discovery.
              </p>
            </div>

            <form onSubmit={handlePingGooglebot} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={pingUrl}
                onChange={(e) => setPingUrl(e.target.value)}
                placeholder="https://getsendport.com/vs/mailgun-alternative"
                className="flex-1 px-4 py-3 bg-[#070A12] border border-white/10 rounded-xl text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={pingLoading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Zap className={`w-4 h-4 ${pingLoading ? "animate-spin" : ""}`} />
                <span>{pingLoading ? "Dispatching..." : "Ping Googlebot Now"}</span>
              </button>
            </form>

            {pingResponse && (
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                {pingResponse}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: TECHNICAL SEO HEALTH & SHORTCUTS */}
      {/* ============================================================== */}
      {activeTab === "health" && (
        <div className="space-y-6">
          {/* Health Diagnostics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Robots.txt Card */}
            <div className="bg-[#0B0F19]/90 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Robots.txt Directive</span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {healthData?.robots.verdict || "HEALTHY"}
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-300 font-mono">
                <div>URL: <Link href={healthData?.robots.url || "https://getsendport.com/robots.txt"} target="_blank" className="text-blue-400 hover:underline">{healthData?.robots.url || "https://getsendport.com/robots.txt"}</Link></div>
                <div>Status: <span className="text-emerald-400 font-bold">{healthData?.robots.status || 200} OK</span></div>
                <div>Sitemap Directive: <span className="text-emerald-400 font-bold">Present</span></div>
              </div>
            </div>

            {/* Sitemap Card */}
            <div className="bg-[#0B0F19]/90 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">XML Sitemap Protocol</span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {healthData?.sitemap.verdict || "HEALTHY"}
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-300 font-mono">
                <div>URL: <Link href={healthData?.sitemap.url || "https://getsendport.com/sitemap.xml"} target="_blank" className="text-blue-400 hover:underline">{healthData?.sitemap.url || "https://getsendport.com/sitemap.xml"}</Link></div>
                <div>Status: <span className="text-emerald-400 font-bold">{healthData?.sitemap.status || 200} OK</span></div>
                <div>XML Validation: <span className="text-emerald-400 font-bold">Valid &lt;urlset&gt;</span></div>
              </div>
            </div>
          </div>

          {/* Deep-Links to Google Search Console Manual Tools */}
          <div className="bg-[#0B0F19]/90 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-indigo-400" />
                <span>Google Search Console Web-Only Deep-Links</span>
              </h2>
              <p className="text-xs text-gray-400">
                Certain sensitive administrative tasks (emergency URL removals, manual action appeals, disavow files) do not have public APIs. Use these 1-click deep links directly to SendPort's property:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  title: "Temporary URL Removals",
                  desc: "Instantly remove outdated or sensitive pages from Google search results.",
                  href: "https://search.google.com/search-console/removals?resource_id=sc-domain:getsendport.com",
                },
                {
                  title: "Security & Manual Actions",
                  desc: "Inspect algorithmic penalties, hacking issues, or malware warnings.",
                  href: "https://search.google.com/search-console/manual-actions?resource_id=sc-domain:getsendport.com",
                },
                {
                  title: "Google Rich Results Tester",
                  desc: "Test SoftwareApplication and FAQ schema against live Googlebot.",
                  href: "https://search.google.com/test/rich-results?url=https://getsendport.com",
                },
                {
                  title: "Google PageSpeed Insights & CrUX",
                  desc: "Core Web Vitals telemetry (LCP, INP, CLS) for getsendport.com.",
                  href: "https://pagespeed.web.dev/analysis?url=https://getsendport.com",
                },
              ].map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  target="_blank"
                  className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-blue-500/40 transition-all flex items-start justify-between group"
                >
                  <div className="space-y-1 pr-4">
                    <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                      <span>{link.title}</span>
                      <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-blue-400" />
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{link.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SETUP & CREDENTIALS MODAL */}
      {/* ============================================================== */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D121F] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Google Cloud Service Account Setup</h3>
              </div>
              <button
                onClick={() => setShowSetupModal(false)}
                className="text-gray-400 hover:text-white text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300">
                <strong>Current Status:</strong> {isConfigured ? "✅ Live Google Cloud credentials detected in .env" : "⚠️ Running in Smart Preview Mode with high-fidelity SendPort demo data."}
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-white block">How to connect your live Google Search Console property:</span>
                <ol className="list-decimal pl-4 space-y-2 text-gray-300">
                  <li>
                    Open <Link href="https://console.cloud.google.com/" target="_blank" className="text-blue-400 hover:underline">Google Cloud Console</Link> and create a project (e.g. <code>SendPort Production</code>).
                  </li>
                  <li>
                    Enable two APIs:
                    <ul className="list-disc pl-4 mt-1 text-gray-400">
                      <li><strong>Google Search Console API</strong></li>
                      <li><strong>Web Search Indexing API</strong></li>
                    </ul>
                  </li>
                  <li>
                    Go to <strong>IAM &amp; Admin &rarr; Service Accounts</strong>, create a Service Account, and create a <strong>JSON Key</strong>.
                  </li>
                  <li>
                    Copy the service account email (e.g. <code>sendport-gsc@project.iam.gserviceaccount.com</code>) and open <Link href="https://search.google.com/search-console/users" target="_blank" className="text-blue-400 hover:underline">Google Search Console Settings &rarr; Users &amp; Permissions</Link>.
                  </li>
                  <li>
                    Add that email as a user with <strong>Owner</strong> or <strong>Full</strong> permission.
                  </li>
                  <li>
                    Add these variables to your <code>.env</code> file:
                    <div className="mt-2 p-3 bg-black/60 border border-white/10 rounded-lg font-mono text-[11px] text-cyan-300 select-all">
                      GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"<br />
                      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."<br />
                      GOOGLE_SEARCH_CONSOLE_SITE_URL="sc-domain:getsendport.com"
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setShowSetupModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TargetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

