// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Server,
  Zap,
  Lock,
  ExternalLink,
  Sliders,
  Database,
  ArrowRight
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Cryptomus Settings
  const [merchantId, setMerchantId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [cryptomusActive, setCryptomusActive] = useState(true);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Platform Cluster Settings
  const [rateLimit, setRateLimit] = useState("250");
  const [maintenance, setMaintenance] = useState(false);
  const [strictDkim, setStrictDkim] = useState(true);
  const [inbound, setInbound] = useState(true);

  const webhookUrl = "https://getsendport.com/api/payments/cryptomus/webhook";
  const verificationFileUrl = "https://getsendport.com/cryptomus_167b0546.html";

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        const s = data.settings || {};
        setMerchantId(s.cryptomus_merchant_id || "");
        setApiKey(s.cryptomus_api_key || "");
        setCryptomusActive(s.cryptomus_is_active !== "false");
        setRateLimit(s.global_rate_limit_per_sec || "250");
        setMaintenance(s.maintenance_mode === "true");
        setStrictDkim(s.strict_dkim_enforcement !== "false");
        setInbound(s.inbound_processing !== "false");
      }
    } catch (e) {
      console.error("Error loading settings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setSaveToast(null);

      const payload = {
        cryptomus_merchant_id: merchantId.trim(),
        cryptomus_api_key: apiKey.trim(),
        cryptomus_is_active: cryptomusActive ? "true" : "false",
        global_rate_limit_per_sec: rateLimit,
        maintenance_mode: maintenance ? "true" : "false",
        strict_dkim_enforcement: strictDkim ? "true" : "false",
        inbound_processing: inbound ? "true" : "false",
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload, category: "SYSTEM" }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveToast({
          message: "All settings saved directly to PostgreSQL Database successfully!",
          type: "success",
        });
        setTimeout(() => setSaveToast(null), 4000);
      } else {
        setSaveToast({
          message: data.error || "Failed to persist settings in database.",
          type: "error",
        });
      }
    } catch (err: any) {
      setSaveToast({ message: err.message || "Network error.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-1/4" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-600" /> PostgreSQL Auto-Sync Active
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gateway & System Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Cryptomus crypto keys, webhook endpoints, and platform delivery configurations in database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Reload
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save to Database</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveToast && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xs ${
            saveToast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {saveToast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{saveToast.message}</span>
          </div>
          <button
            onClick={() => setSaveToast(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* CRYPTOMUS CONFIGURATION CARD */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Coins className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">Cryptomus Web3 Payment Gateway</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Instant Auto-Activation
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated cryptocurrency invoices & blockchain webhook confirmations (USDT, BTC, ETH, TON, SOL).
              </p>
            </div>
          </div>

          {/* Active Gateway Toggle */}
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200/80">
            <span className="text-xs font-bold text-slate-700">Gateway Status:</span>
            <button
              type="button"
              onClick={() => setCryptomusActive(!cryptomusActive)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                cryptomusActive
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              {cryptomusActive ? "Active (Online)" : "Disabled"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Merchant ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Cryptomus Merchant ID (UUID) *
              </label>
              {!merchantId && (
                <button
                  type="button"
                  onClick={() => setMerchantId("167b0546-3978-437c-90f4-2336cf51b015")}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Paste Detected ID: 167b0546...
                </button>
              )}
            </div>
            <input
              type="text"
              required
              placeholder="e.g. 167b0546-3978-437c-90f4-2336cf51b015"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Found on your Cryptomus Business dashboard under <strong>Merchants &gt; Settings</strong>.
            </p>
          </div>

          {/* Payment API Key */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Cryptomus Payment API Key *
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                required
                placeholder="Enter your Cryptomus Payment API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 pr-10 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used for generating and verifying cryptographic MD5 signatures. Never exposed to clients.
            </p>
          </div>

          {/* Webhook Callback URL */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-600" /> Official Webhook URL (For Cryptomus Settings)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(webhookUrl)}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                {copiedWebhook ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy URL
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-indigo-200/60 font-mono text-xs text-indigo-900 select-all truncate">
              {webhookUrl}
            </div>
            <p className="text-[11px] text-indigo-800/80">
              Paste this URL in your Cryptomus Merchant settings as your <strong>url_callback</strong>.
            </p>
          </div>

          {/* Domain Verification File Status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">HTML Domain Verification File</h4>
                <p className="text-[11px] text-slate-500 font-mono">cryptomus_167b0546.html</p>
              </div>
            </div>
            <a
              href={verificationFileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
            >
              <span>Test Live File</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? "Saving Changes..." : "Save Cryptomus Configuration to Database"}
            </button>
          </div>
        </form>
      </div>

      {/* CLUSTER & SMTP PLATFORM RULES */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Cluster & SMTP Delivery Rules</h2>
            <p className="text-xs text-slate-500">
              Global throughput throttles and server security policies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Global Rate Limit (Emails / Second)
            </label>
            <input
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Strict DKIM-2048 Enforce</span>
              <span className="text-[11px] text-slate-500">Reject outbound mail without valid DKIM</span>
            </div>
            <button
              type="button"
              onClick={() => setStrictDkim(!strictDkim)}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                strictDkim ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              {strictDkim ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Inbound MX Processing</span>
              <span className="text-[11px] text-slate-500">Parse incoming webhook replies</span>
            </div>
            <button
              type="button"
              onClick={() => setInbound(!inbound)}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                inbound ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              {inbound ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Maintenance Mode</span>
              <span className="text-[11px] text-slate-500">Block public customer API dispatch</span>
            </div>
            <button
              type="button"
              onClick={() => setMaintenance(!maintenance)}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                maintenance ? "bg-rose-600 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              {maintenance ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
}

