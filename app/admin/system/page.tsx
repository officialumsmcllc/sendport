"use client";

import React, { useState, useEffect } from "react";
import {
  Server,
  Cpu,
  Zap,
  ShieldCheck,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Radio,
  CheckCircle2,
  HardDrive,
  Clock,
  Send,
  Lock,
} from "lucide-react";

export default function AdminSystemPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rateLimit, setRateLimit] = useState(250);
  const [maintenance, setMaintenance] = useState(false);
  const [dkimEnforce, setDkimEnforce] = useState(true);
  const [inbound, setInbound] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/system");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.config) {
          setRateLimit(json.config.globalRateLimitPerSec || 250);
          setMaintenance(json.config.maintenanceMode || false);
          setDkimEnforce(json.config.strictDkimEnforcement ?? true);
          setInbound(json.config.inboundProcessing ?? true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      setSaveMsg("");
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          globalRateLimitPerSec: Number(rateLimit),
          maintenanceMode: maintenance,
          strictDkimEnforcement: dkimEnforce,
          inboundProcessing: inbound,
        }),
      });
      if (res.ok) {
        setSaveMsg("Configuration synced to live cluster!");
        setTimeout(() => setSaveMsg(""), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Server className="w-6 h-6 text-amber-400" />
            Infrastructure & SMTP Relay Cluster
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of Sendport outbound MTA nodes, fallback relays, rate limiting throttle, and runtime diagnostics.
          </p>
        </div>
        <button
          onClick={fetchSystemData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? "animate-spin" : ""}`} />
          Check Relays
        </button>
      </div>

      {saveMsg && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {saveMsg}
        </div>
      )}

      {/* Relays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.relays?.map((relay: any, idx: number) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl relative overflow-hidden space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-400" />
                  {relay.name}
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{relay.host}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                  relay.status === "HEALTHY" || relay.status === "ACTIVE" || relay.status === "ONLINE"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }`}
              >
                ● {relay.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
              <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Latency</p>
                <p className="text-xs font-mono font-bold text-emerald-400">{relay.latencyMs}ms</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Reputation</p>
                <p className="text-xs font-mono font-bold text-blue-400">{relay.reputation}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Queue</p>
                <p className="text-xs font-mono font-bold text-white">{relay.queueSize} items</p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Dedicated IPs: {relay.activeIps?.join(", ")}</span>
              <span className="text-emerald-400 font-medium">SSL/TLS 1.3</span>
            </div>
          </div>
        ))}
      </div>

      {/* Global Cluster Controls & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Throttle & Security Controls */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            Global Throughput & Sending Throttle
          </h3>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Global Rate Limit (Emails / Second)</span>
                <span className="text-amber-400 font-mono font-bold">{rateLimit} msgs/sec</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={rateLimit}
                onChange={(e) => setRateLimit(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Controls the maximum concurrent dispatch capacity to prevent recipient ISP rate-limiting.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-white">Strict RSA-2048 DKIM Enforcement</p>
                  <p className="text-[11px] text-slate-400">Reject unsigned custom domain dispatches</p>
                </div>
                <input
                  type="checkbox"
                  checked={dkimEnforce}
                  onChange={(e) => setDkimEnforce(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-white">Inbound MX Mail Routing Engine</p>
                  <p className="text-[11px] text-slate-400">Process incoming emails and trigger webhooks</p>
                </div>
                <input
                  type="checkbox"
                  checked={inbound}
                  onChange={(e) => setInbound(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-rose-400">Maintenance Mode</p>
                  <p className="text-[11px] text-slate-400">Pause customer dashboard access for upgrades</p>
                </div>
                <input
                  type="checkbox"
                  checked={maintenance}
                  onChange={(e) => setMaintenance(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-rose-500 focus:ring-rose-500"
                />
              </label>
            </div>

            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-amber-500/20"
            >
              {saving ? "Updating Live Configuration..." : "Apply Cluster Configuration"}
            </button>
          </div>
        </div>

        {/* Runtime Diagnostics */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Runtime Environment & Host Specs
          </h3>

          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Node Runtime</span>
              <span className="font-mono text-white font-bold">{data?.nodeVersion || "v20.x"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Process Uptime</span>
              <span className="font-mono text-emerald-400 font-bold">
                {Math.floor((data?.uptimeSeconds || 1200) / 60)} minutes
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Heap Memory Usage</span>
              <span className="font-mono text-white">
                {Math.round(((data?.memoryUsage?.heapUsed || 50000000) / 1024 / 1024))} MB /{" "}
                {Math.round(((data?.memoryUsage?.heapTotal || 90000000) / 1024 / 1024))} MB
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">DKIM Algorithm</span>
              <span className="font-mono text-amber-400 font-bold">RSA-2048 SHA-256</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Database Engine</span>
              <span className="font-mono text-blue-400 font-bold">PostgreSQL via Prisma ORM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
