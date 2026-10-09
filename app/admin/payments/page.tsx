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
  Image as ImageIcon,
  Eye,
  CheckCircle2,
  Filter,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [filterMethod, setFilterMethod] = useState<string>("ALL");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

    const matchesStatus = filterStatus === "ALL" || tx.status === filterStatus;
    const matchesMethod = filterMethod === "ALL" || tx.method === filterMethod;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;
  const approvedCount = transactions.filter((t) => t.status === "APPROVED").length;
  const totalVolume = transactions
    .filter((t) => t.status === "APPROVED")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-xl px-5 py-3 shadow-2xl text-xs font-bold border flex items-center gap-3 backdrop-blur-xl ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/40 text-rose-200"
          }`}
        >
          {toast.type === "success" ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* RECEIPT IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" /> Payment Slip / Proof of Transfer
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-black/40 min-h-[300px] max-h-[70vh] overflow-auto">
              <img
                src={previewImage}
                alt="Payment Receipt Slip"
                className="max-h-[65vh] max-w-full object-contain rounded-lg border border-slate-800"
              />
            </div>
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
              <a
                href={previewImage}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <span>Open Original in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Approvals</span>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-amber-400 font-mono">{pendingCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting administrator verification</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Approved Transactions</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-400 font-mono">{approvedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Quotas activated on workspace</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Approved Volume</span>
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-sky-400 font-mono">${totalVolume.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-1">Processed platform revenue</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search email, TID, method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Method Filter */}
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-semibold focus:outline-none"
          >
            <option value="ALL">All Payment Rails</option>
            <option value="EASYPAISA">Easypaisa</option>
            <option value="JAZZCASH">JazzCash</option>
            <option value="RAAST">Raast Instant</option>
            <option value="BANK_TRANSFER">Bank Wire</option>
            <option value="CRYPTO_USDT">Crypto USDT</option>
            <option value="STRIPE">Stripe</option>
          </select>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  filterStatus === status
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Transactions Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Payment Receipts Queue ({filtered.length})
          </h2>
          <span className="text-[10px] text-amber-400 font-mono font-semibold">
            Platform Superadmin Mode
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
            <p className="text-xs text-slate-400">Loading verification queue...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <CreditCard className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No payment receipts found in queue</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When users submit Easypaisa, JazzCash, USDT, or Wire slips in billing, they appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">User / Account</th>
                  <th className="py-3 px-4">Plan & Amount</th>
                  <th className="py-3 px-4">Method & Reference</th>
                  <th className="py-3 px-4">Proof / Slip</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* User */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{tx.user?.name || "Anonymous User"}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{tx.user?.email}</div>
                    </td>

                    {/* Plan & Amount */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary-500/10 text-primary-400 border border-primary-500/20">
                        {tx.plan}
                      </span>
                      <div className="font-mono text-white font-bold mt-1">
                        {tx.currency} {tx.amount?.toLocaleString()}
                      </div>
                    </td>

                    {/* Method & Ref */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-300">{tx.method}</div>
                      <div className="text-[11px] text-amber-400/90 font-mono truncate max-w-[150px]">
                        TID: {tx.referenceId || "N/A"}
                      </div>
                      {tx.senderPhone && (
                        <div className="text-[10px] text-slate-500">Phone: {tx.senderPhone}</div>
                      )}
                    </td>

                    {/* Proof Slip Preview */}
                    <td className="py-3 px-4">
                      {tx.receiptUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(tx.receiptUrl)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-[11px] font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Slip</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600 italic">No image file</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString()}{" "}
                      <span className="text-slate-600 block text-[10px]">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          tx.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : tx.status === "REJECTED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {tx.status === "APPROVED" && <Check className="w-3 h-3" />}
                        {tx.status === "REJECTED" && <X className="w-3 h-3" />}
                        {tx.status === "PENDING" && <Clock className="w-3 h-3" />}
                        {tx.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      {tx.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(tx.id, "APPROVE")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-sm active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Upgrade</span>
                          </button>
                          <button
                            onClick={() => handleAction(tx.id, "REJECT")}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:border-rose-500/40 border border-slate-700 text-slate-300 hover:text-rose-400 font-semibold transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          {tx.adminNotes || "Action completed"}
                        </span>
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
