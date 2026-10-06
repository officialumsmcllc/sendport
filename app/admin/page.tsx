"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Check,
  X,
  RefreshCw,
  Search,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Users,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payments");
      if (res.ok) {
        const data = await res.json();
        if (data.transactions) {
          setTransactions(data.transactions);
        }
      } else {
        const err = await res.json();
        setToast({ message: err.error || "Failed to load payment queue.", type: "error" });
      }
    } catch (e: any) {
      console.error(e);
      setToast({ message: "Network error loading transactions.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: id, action }),
      });

      const data = await res.json();

      if (res.ok) {
        setToast({
          message: data.message || `Payment ${action === "APPROVE" ? "Approved & Quota Upgraded" : "Rejected"} successfully!`,
          type: "success",
        });
        // Update local state
        setTransactions((prev) =>
          prev.map((tx) =>
            tx.id === id
              ? {
                  ...tx,
                  status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                  adminNotes: action === "APPROVE" ? "Verified & activated by Admin." : "Rejected by Admin.",
                }
              : tx
          )
        );
      } else {
        setToast({ message: data.error || "Failed to process transaction.", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: "Network error processing transaction.", type: "error" });
    }

    setTimeout(() => setToast(null), 5000);
  };

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      (tx.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.referenceId || tx.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.senderName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.method || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "ALL") return matchesSearch;
    return matchesSearch && tx.status === filterStatus;
  });

  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;
  const approvedCount = transactions.filter((t) => t.status === "APPROVED").length;
  const totalVolume = transactions
    .filter((t) => t.status === "APPROVED")
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-2xl transition-all ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/30 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-amber-400" />
            Manual Payment Slip Verification Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review manual subscription receipts (Easypaisa, JazzCash, USDT, Wire) and automatically activate customer daily quotas.
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? "animate-spin" : ""}`} />
          Refresh Queue
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <span className="rounded-lg bg-amber-500/20 p-1.5 text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-amber-400">{pendingCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting administrator verification</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Approved Transactions</span>
            <span className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-400">{approvedCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Quotas activated on workspace</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Approved Volume</span>
            <span className="rounded-lg bg-sky-500/20 p-1.5 text-sky-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-white">${totalVolume.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-1">Processed platform revenue</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search email, TID, method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === st
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl overflow-hidden backdrop-blur">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Payment Receipts Queue ({filtered.length})
          </h2>
          <span className="text-[11px] font-mono text-amber-400">Platform Superadmin Mode</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CreditCard className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No payment receipts found in queue</p>
            <p className="text-xs">When users submit Easypaisa, JazzCash, USDT, or Wire slips in billing, they appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4">Customer Email</th>
                  <th className="p-4">Plan & Amount</th>
                  <th className="p-4">Payment Method & Reference</th>
                  <th className="p-4">Proof / Slip</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-white">{tx.user?.email || "Unknown Customer"}</p>
                      <p className="text-[11px] font-mono text-slate-400">{tx.user?.name || "Customer"}</p>
                      <p className="text-[10px] text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-amber-400 block">{tx.plan}</span>
                      <span className="font-mono text-white text-xs">
                        {tx.currency} {tx.amount}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-200">{tx.method}</p>
                      <p className="text-[11px] font-mono text-slate-400">Ref: {tx.referenceId || "N/A"}</p>
                      {tx.senderPhone && (
                        <p className="text-[10px] text-slate-500">Phone: {tx.senderPhone}</p>
                      )}
                    </td>
                    <td className="p-4">
                      {tx.receiptUrl ? (
                        <a
                          href={tx.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline"
                        >
                          View Receipt Slip <ArrowUpRight className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500">Reference Check</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          tx.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : tx.status === "REJECTED"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {tx.status}
                      </span>
                      {tx.adminNotes && (
                        <p className="text-[10px] text-slate-400 mt-1 max-w-xs">{tx.adminNotes}</p>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {tx.status === "PENDING" ? (
                        <>
                          <button
                            onClick={() => handleAction(tx.id, "APPROVE")}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                          >
                            Approve & Upgrade
                          </button>
                          <button
                            onClick={() => handleAction(tx.id, "REJECT")}
                            className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs transition-all active:scale-95"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-mono text-slate-500">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
