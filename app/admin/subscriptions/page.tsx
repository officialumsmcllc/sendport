"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Building2,
  Clock,
  User,
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
  const [amount, setAmount] = useState("19");
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
      setAmount("59");
    } else if (p === "GROWTH") {
      setDailyLimit(5000);
      setAmount("19");
    } else {
      setDailyLimit(500);
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
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
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
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-3.5 py-2 text-xs font-black text-slate-950 transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Manual Upgrade / Provision
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {toastMsg}
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active Subscriptions ({subscriptions.length})
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Manual & Automated Tier Upgrades</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-4">Customer Account</th>
                <th className="p-4">Assigned Plan Tier</th>
                <th className="p-4">Daily Sending Limit</th>
                <th className="p-4">Billing Cycle</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Started / Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white">{sub.user?.email || "Unknown"}</p>
                      <p className="text-[11px] text-slate-400">{sub.user?.name || "Customer"}</p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          sub.plan === "SCALE_PRO"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : sub.plan === "GROWTH"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-slate-800 text-slate-300 border-slate-700"
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
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        ● {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-[11px] font-mono text-slate-400">
                      <p>{new Date(sub.startedAt).toLocaleDateString()}</p>
                      {sub.expiresAt && (
                        <p className="text-[10px] text-amber-400">
                          Exp: {new Date(sub.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No active manual subscription records yet. Click "Manual Upgrade / Provision" to assign a plan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Provision Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                Manual Upgrade / Downgrade Provision
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Select Customer Account</label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-bold focus:border-amber-500 focus:outline-none"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email} ({u.workspaces?.[0]?.workspace?.plan || "STARTER"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Target Plan Tier</label>
                <select
                  value={plan}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-bold focus:border-amber-500 focus:outline-none"
                >
                  <option value="STARTER">STARTER (Free - 500 emails/day)</option>
                  <option value="GROWTH">GROWTH PRO ($19/mo - 5,000 emails/day)</option>
                  <option value="SCALE_PRO">SCALE ENTERPRISE ($59/mo - 25,000 emails/day)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Daily Sending Quota</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Validity Period (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Billing Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="LIFETIME">Lifetime / Permanent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Recorded Amount ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-colors shadow-lg shadow-amber-500/20"
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
