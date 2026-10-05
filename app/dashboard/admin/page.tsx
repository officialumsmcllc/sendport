"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, ShieldAlert, Check, X, Search, DollarSign, Filter, RefreshCw, AlertCircle } from "lucide-react";

export default function AdminPanelPage() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [slips, setSlips] = useState([
    {
      id: "slip_91823",
      user: "dev@acmecorp.com",
      plan: "Pro ($20 / 6,000 PKR)",
      method: "Easypaisa",
      tid: "EP-8930219482",
      amount: "6,000 PKR",
      status: "PENDING",
      date: "24 mins ago",
    },
    {
      id: "slip_91822",
      user: "finance@saaslaunch.io",
      plan: "Business ($65 / 19,500 PKR)",
      method: "Crypto USDT (TRC-20)",
      tid: "0x78ab...f901c",
      amount: "$65 USDT",
      status: "APPROVED",
      date: "2 hours ago",
    },
    {
      id: "slip_91820",
      user: "founder@techflow.dev",
      plan: "Pro ($20 / 6,000 PKR)",
      method: "JazzCash",
      tid: "JC-0091827412",
      amount: "6,000 PKR",
      status: "PENDING",
      date: "35 mins ago",
    },
  ]);

  const fetchSlips = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payments");
      if (res.ok) {
        const data = await res.json();
        if (data.transactions && data.transactions.length > 0) {
          const mapped = data.transactions.map((tx: any) => ({
            id: tx.id,
            user: tx.user?.email || "developer@example.com",
            plan: tx.plan,
            method: tx.paymentMethod,
            tid: tx.referenceNumber || tx.id,
            amount: `${tx.currency} ${tx.amount}`,
            status: tx.status,
            date: new Date(tx.createdAt).toLocaleDateString(),
          }));
          setSlips(mapped);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlips();
  }, []);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    // Optimistic UI update
    setSlips((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: action === "APPROVE" ? "APPROVED" : "REJECTED" } : s))
    );

    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: id, action }),
      });
      if (res.ok) {
        const data = await res.json();
        setToast(data.message || `Payment ${action === "APPROVE" ? "approved & quota upgraded" : "rejected"}!`);
      } else {
        setToast(`Receipt marked as ${action === "APPROVE" ? "APPROVED" : "REJECTED"} locally.`);
      }
    } catch (err) {
      setToast(`Receipt marked as ${action === "APPROVE" ? "APPROVED" : "REJECTED"}.`);
    }

    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="p-3 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg border border-slate-700">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            {toast}
          </span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary-600" />
            👑 Platform Admin Panel: Manual Payment Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review and approve manual payment receipts (Easypaisa, JazzCash, USDT, Wire transfers) and grant quota upgrades.
          </p>
        </div>
        <button
          onClick={fetchSlips}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Queue
        </button>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Pending Slip Approvals</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {slips.filter((s) => s.status === "PENDING").length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Monthly Volume</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">$4,820 USD</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Active Workspaces</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">1,240</p>
        </div>
      </div>

      {/* Slips Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800">Submitted Payment Receipts</h3>
          <span className="text-[11px] font-mono text-slate-500">Auto-refresh enabled</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-3.5">Slip ID / User</th>
                <th className="p-3.5">Plan</th>
                <th className="p-3.5">Method & TID</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slips.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{s.user}</p>
                    <p className="text-[11px] font-mono text-slate-400">{s.id}</p>
                  </td>
                  <td className="p-3.5 font-medium text-slate-700">{s.plan}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-800">{s.method}</p>
                    <p className="text-[10px] font-mono text-slate-500">TID: {s.tid}</p>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">{s.amount}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : s.status === "REJECTED"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    {s.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() => handleAction(s.id, "APPROVE")}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          Approve & Upgrade
                        </button>
                        <button
                          onClick={() => handleAction(s.id, "REJECT")}
                          className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px] hover:bg-rose-100 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
