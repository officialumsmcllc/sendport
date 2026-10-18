"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  RefreshCw,
  Percent,
  Calendar,
  Layers,
  Users,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles
} from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Coupon Form
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("30");
  const [planRestriction, setPlanRestriction] = useState("ALL");
  const [maxUses, setMaxUses] = useState("100");
  const [expiresAt, setExpiresAt] = useState("2026-12-31");
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    try {
      setCreating(true);
      setErrorMsg("");
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discountPercent,
          planRestriction,
          maxUses,
          expiresAt,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        setCode("");
        fetchCoupons();
      } else {
        setErrorMsg(data.error || "Failed to create coupon");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      fetchCoupons();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      fetchCoupons();
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              Marketing & Incentive Campaigns
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Dynamic Discount Rules</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 mt-1.5">
            <Tag className="w-6 h-6 text-amber-400" />
            Promo Codes & Discounts Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create promotional codes for subscription checkout discounts, flash sales, and partner incentives.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCoupons}
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
            New Promo Code
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1424] shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-[#080d19] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active Discount Codes ({loading ? "Loading..." : coupons.length})
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Checkout Reductions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/5 bg-[#080d19] text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Promo Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Applicable Plan</th>
                <th className="px-4 py-3">Redemptions</th>
                <th className="px-4 py-3">Expires At</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading discount codes...</span>
                  </td>
                </tr>
              ) : coupons.length > 0 ? (
                coupons.map((cp) => (
                  <tr key={cp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-amber-400 bg-[#080d19] px-2.5 py-1 rounded-lg border border-white/10 text-xs">
                          {cp.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(cp.code, cp.id)}
                          className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
                          title="Copy Code"
                        >
                          {copiedId === cp.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-black font-mono text-emerald-400">
                      {cp.discountPercent}% OFF
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 border border-white/10">
                        {cp.planRestriction}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">
                      {cp.usedCount} / {cp.maxUses}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                      {cp.expiresAt}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleActive(cp.id, cp.isActive)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border transition-all ${
                          cp.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-white/5 text-slate-500 border-white/10"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cp.isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                          }`}
                        />
                        {cp.isActive ? "ACTIVE" : "DISABLED"}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(cp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 text-xs">
                    No promo codes created yet. Click "New Promo Code" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating New Coupon */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1424] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                Create New Promo Code
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH50"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3.5 py-2 text-white font-mono font-bold uppercase focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Discount %</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3.5 py-2 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3.5 py-2 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Plan Restriction</label>
                <select
                  value={planRestriction}
                  onChange={(e) => setPlanRestriction(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3.5 py-2 text-white focus:border-amber-400 focus:outline-none font-semibold transition-colors"
                >
                  <option value="ALL">All Subscription Plans</option>
                  <option value="GROWTH">Growth Tier Only</option>
                  <option value="SCALE_PRO">Scale Enterprise Only</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3.5 py-2 text-white font-mono focus:border-amber-400 focus:outline-none transition-colors"
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
                  disabled={creating}
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
