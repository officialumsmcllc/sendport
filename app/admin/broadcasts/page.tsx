"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Bell,
  AlertTriangle,
  Info,
  ShieldAlert,
  Send,
  Sparkles,
  Radio
} from "lucide-react";

export default function AdminBroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Broadcast Form
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("INFO");
  const [publishing, setPublishing] = useState(false);

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/broadcasts");
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data.broadcasts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    try {
      setPublishing(true);
      const res = await fetch("/api/admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, type }),
      });
      if (res.ok) {
        setShowModal(false);
        setTitle("");
        setMessage("");
        fetchBroadcasts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPublishing(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await fetch("/api/admin/broadcasts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      fetchBroadcasts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this broadcast?")) return;
    try {
      await fetch(`/api/admin/broadcasts?id=${id}`, { method: "DELETE" });
      fetchBroadcasts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              System Wide Telemetry
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Live In-App Notifications</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 mt-1.5">
            <Megaphone className="w-6 h-6 text-amber-400" />
            Platform Broadcasts & Announcements
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish global notification banners, system maintenance notices, and major update alerts to all customer dashboards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBroadcasts}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d1424] px-3.5 py-2 text-xs font-bold text-white hover:bg-white/5 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 px-4 py-2 text-xs font-black text-slate-950 transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>
      </div>

      {/* Broadcasts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading announcements...</span>
          </div>
        ) : broadcasts.length > 0 ? (
          broadcasts.map((bc) => (
            <div
              key={bc.id}
              className={`rounded-2xl border p-5 transition-all shadow-xl ${
                bc.isActive
                  ? bc.type === "CRITICAL"
                    ? "border-rose-500/40 bg-gradient-to-r from-rose-500/[0.08] to-[#0d1424]"
                    : bc.type === "WARNING"
                    ? "border-amber-500/40 bg-gradient-to-r from-amber-500/[0.08] to-[#0d1424]"
                    : bc.type === "SUCCESS"
                    ? "border-emerald-500/40 bg-gradient-to-r from-emerald-500/[0.08] to-[#0d1424]"
                    : "border-sky-500/40 bg-gradient-to-r from-sky-500/[0.08] to-[#0d1424]"
                  : "border-white/5 bg-[#0d1424]/60 opacity-60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        bc.type === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : bc.type === "WARNING"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : bc.type === "SUCCESS"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      }`}
                    >
                      {bc.type}
                    </span>
                    <h3 className="text-sm font-bold text-white">{bc.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{bc.message}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => handleToggle(bc.id, bc.isActive)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border transition-all ${
                      bc.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm"
                        : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        bc.isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                      }`}
                    />
                    {bc.isActive ? "LIVE ON DASHBOARDS" : "HIDDEN / DRAFT"}
                  </button>

                  <button
                    onClick={() => handleDelete(bc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-12 text-center text-slate-500 text-xs">
            No platform broadcasts published yet.
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1424] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-400" />
                Publish Platform Announcement
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Notice Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New NYC1 High-Speed SMTP Node Deployed"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3.5 py-2 text-white font-bold focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Banner Type / Severity</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3.5 py-2 text-white focus:border-amber-400 focus:outline-none font-semibold transition-colors"
                >
                  <option value="INFO">Information (Sky Blue)</option>
                  <option value="SUCCESS">Success / Major Feature (Green)</option>
                  <option value="WARNING">Maintenance / Heads Up (Amber)</option>
                  <option value="CRITICAL">Critical / Action Required (Red)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Detailed Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details shown to all logged in customer workspaces..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3.5 py-2 text-white focus:border-amber-400 focus:outline-none resize-none leading-relaxed transition-colors"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {publishing ? "Publishing..." : "Broadcast Live"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
