"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Zap,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Form State
  const [selectedUserId, setSelectedUserId] = useState("");
  const [plan, setPlan] = useState("GROWTH");
  const [dailyLimit, setDailyLimit] = useState(5000);
  const [billingCycle, setBillingCycle] = useState("MONTHLY");
  const [amount, setAmount] = useState("20");
  const [expiryDays, setExpiryDays] = useState("30");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/subscriptions");
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
        setUsers(data.users || []);
        if (data.users?.length > 0 && !selectedUserId) {
          setSelectedUserId(data.users[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePlanChange = (p: string) => {
    setPlan(p);
    if (p === "SCALE_PRO") {
      setDailyLimit(25000);
      setAmount("79");
    } else if (p === "GROWTH") {
      setDailyLimit(3000);
      setAmount("20");
    } else {
      setDailyLimit(100);
      setAmount("0");
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      setSaving(true);
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          plan,
          dailyLimit: Number(dailyLimit),
          billingCycle,
          amount: Number(amount),
          expiryDays: Number(expiryDays),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        setToastMsg(data.message || "Subscription updated successfully!");
        setTimeout(() => setToastMsg(""), 3500);
        fetchData();
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
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              Commercial Tier Provisioning
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Manual Overrides & Recurring Quotas</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 mt-1.5">
            <CreditCard className="w-6 h-6 text-amber-400" />
            Manual Subscriptions & Plan Provisions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manually upgrade or downgrade customer plans, adjust sending capacity boosts, and assign custom billing periods.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
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
            Manual Upgrade / Provision
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-xs text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1424] shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-[#080d19] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active Subscriptions ({loading ? "Loading..." : subscriptions.length})
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Manual & Automated Tier Upgrades</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No active manual subscription records yet. Click "Manual Upgrade / Provision" to assign a plan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 bg-[#080d19] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4">Customer Account</th>
                  <th className="p-4">Assigned Plan Tier</th>
                  <th className="p-4">Daily Sending Limit</th>
                  <th className="p-4">Billing Cycle</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Started / Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white">{sub.user?.email || "Unknown"}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{sub.user?.name || "Customer"}</p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          sub.plan === "SCALE_PRO"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : sub.plan === "GROWTH"
                            ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            : "bg-white/5 text-slate-300 border border-white/10"
                        }`}
                      >
                        {sub.plan}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-400">
                      {(sub.dailyLimit || 500).toLocaleString()} emails/day
                    </td>
                    <td className="p-4 text-slate-300 font-medium">
                      {sub.billingCycle} (${sub.amount || 0})
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          sub.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/5 text-slate-400 border border-white/10"
                        }`}
                      >
                        ● {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-[11px] font-mono text-slate-400" suppressHydrationWarning>
                      <p>{new Date(sub.startedAt).toLocaleDateString()}</p>
                      {sub.expiresAt && (
                        <p className="text-[10px] text-amber-400 mt-0.5">
                          Exp: {new Date(sub.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Provision Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1424] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                Manual Upgrade / Downgrade Provision
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Customer Account</label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3.5 py-2 text-white font-bold focus:border-amber-400 focus:outline-none transition-colors"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email} ({u.workspaces?.[0]?.workspace?.plan || "STARTER"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Target Plan Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "STARTER", name: "Starter", sub: "100/day" },
                    { id: "GROWTH", name: "Growth", sub: "3K/day ($20)" },
                    { id: "SCALE_PRO", name: "Scale Pro", sub: "25K/day ($79)" },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => handlePlanChange(tier.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        plan === tier.id
                          ? "border-amber-500 bg-amber-500/10 text-amber-400 shadow-sm"
                          : "border-white/5 bg-[#080d19] text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="font-bold text-xs">{tier.name}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{tier.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Daily Sending Quota</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3 py-2 text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3 py-2 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Billing Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="LIFETIME">Lifetime / Permanent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3 py-2 text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
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
                  disabled={saving}
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Provisioning..." : "Apply Plan Upgrade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
