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
  Plus,
  Edit2,
  Trash2,
  Power,
  Copy,
  Wallet,
  Settings,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Receipt,
  Layers,
  ArrowRight,
  Coins,
  EyeOff,
  Save,
  Zap
} from "lucide-react";

interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  accountTitle: string;
  accountNumber: string;
  instructions: string | null;
  currency: string;
  isActive: boolean;
  displayOrder: number;
}

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"SLIPS" | "GATEWAYS" | "CRYPTOMUS">("CRYPTOMUS");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [filterMethod, setFilterMethod] = useState<string>("ALL");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewSlip, setPreviewSlip] = useState<any | null>(null);
  const [slipZoom, setSlipZoom] = useState<number>(1);
  const [copiedTid, setCopiedTid] = useState(false);

  // Cryptomus Gateway States
  const [cryptomusMerchantId, setCryptomusMerchantId] = useState("");
  const [cryptomusApiKey, setCryptomusApiKey] = useState("");
  const [cryptomusActive, setCryptomusActive] = useState(true);
  const [showCryptomusKey, setShowCryptomusKey] = useState(false);
  const [savingCryptomus, setSavingCryptomus] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Slips state
  const [transactions, setTransactions] = useState<any[]>([]);

  // Gateways state
  const [gateways, setGateways] = useState<PaymentMethod[]>([]);
  const [loadingGateways, setLoadingGateways] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentMethod | null>(null);

  // Form states for Add/Edit
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formAccountTitle, setFormAccountTitle] = useState("");
  const [formAccountNumber, setFormAccountNumber] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formCurrency, setFormCurrency] = useState("PKR");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [submittingForm, setSubmittingForm] = useState(false);

  const fetchTransactions = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch("/api/admin/payments", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.transactions) {
          setTransactions(data.transactions);
        }
      } else {
        const err = await res.json();
        if (showLoading) setToast({ message: err.error || "Failed to load payment queue.", type: "error" });
      }
    } catch (e: any) {
      if (showLoading) {
        console.error(e);
        setToast({ message: "Network error loading transactions.", type: "error" });
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchGateways = async () => {
    try {
      setLoadingGateways(true);
      const res = await fetch("/api/admin/payment-methods", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        if (data.methods) {
          setGateways(data.methods);
        }
      } else {
        console.warn("fetchGateways warning:", data.error);
      }
    } catch (e: any) {
      console.error("fetchGateways error:", e);
    } finally {
      setLoadingGateways(false);
    }
  };

  const fetchCryptomusSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        const s = data.settings || {};
        setCryptomusMerchantId(s.cryptomus_merchant_id || "");
        setCryptomusApiKey(s.cryptomus_api_key || "");
        setCryptomusActive(s.cryptomus_is_active !== "false");
      }
    } catch (_) {}
  };

  const handleSaveCryptomus = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSavingCryptomus(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            cryptomus_merchant_id: cryptomusMerchantId.trim(),
            cryptomus_api_key: cryptomusApiKey.trim(),
            cryptomus_is_active: cryptomusActive ? "true" : "false",
          },
          category: "PAYMENT",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: "Cryptomus configuration saved to database successfully!", type: "success" });
      } else {
        setToast({ message: data.error || "Failed to save Cryptomus settings.", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message || "Network error.", type: "error" });
    } finally {
      setSavingCryptomus(false);
    }
  };

  useEffect(() => {
    fetchTransactions(true);
    fetchGateways();
    fetchCryptomusSettings();
    const timer = setInterval(() => {
      fetchTransactions(false);
    }, 12000);
    return () => clearInterval(timer);
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

  const handleToggleGateway = async (gateway: PaymentMethod) => {
    try {
      const res = await fetch("/api/admin/payment-methods", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: gateway.id,
          isActive: !gateway.isActive,
        }),
      });

      if (res.ok) {
        setGateways((prev) =>
          prev.map((g) => (g.id === gateway.id ? { ...g, isActive: !g.isActive } : g))
        );
        setToast({
          message: `${gateway.name} ${!gateway.isActive ? "Activated" : "Deactivated"} successfully!`,
          type: "success",
        });
      } else {
        const err = await res.json();
        setToast({ message: err.error || "Failed to update gateway status.", type: "error" });
      }
    } catch (e: any) {
      setToast({ message: "Network error updating gateway status.", type: "error" });
    }
    setTimeout(() => setToast(null), 3500);
  };

  const handleDisableAllGateways = async () => {
    try {
      const res = await fetch("/api/admin/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DISABLE_ALL" }),
      });
      if (res.ok) {
        setGateways((prev) => prev.map((g) => ({ ...g, isActive: false })));
        setToast({
          message: "All manual deposit accounts disabled! Only Cryptomus is active.",
          type: "success",
        });
      } else {
        const err = await res.json();
        setToast({ message: err.error || "Failed to disable gateways.", type: "error" });
      }
    } catch {
      setToast({ message: "Network error disabling gateways.", type: "error" });
    }
    setTimeout(() => setToast(null), 3500);
  };

  const openAddModal = () => {
    setEditingGateway(null);
    setFormCode("");
    setFormName("");
    setFormAccountTitle("");
    setFormAccountNumber("");
    setFormInstructions("");
    setFormCurrency("PKR");
    setFormIsActive(true);
    setFormDisplayOrder(gateways.length + 1);
    setShowAddModal(true);
  };

  const openEditModal = (g: PaymentMethod) => {
    setEditingGateway(g);
    setFormCode(g.code);
    setFormName(g.name);
    setFormAccountTitle(g.accountTitle);
    setFormAccountNumber(g.accountNumber);
    setFormInstructions(g.instructions || "");
    setFormCurrency(g.currency || "PKR");
    setFormIsActive(g.isActive);
    setFormDisplayOrder(g.displayOrder || 0);
    setShowAddModal(true);
  };

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAccountTitle.trim() || !formAccountNumber.trim()) {
      setToast({ message: "Please fill in all required fields.", type: "error" });
      return;
    }

    try {
      setSubmittingForm(true);

      if (editingGateway) {
        const res = await fetch("/api/admin/payment-methods", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingGateway.id,
            name: formName,
            accountTitle: formAccountTitle,
            accountNumber: formAccountNumber,
            instructions: formInstructions,
            currency: formCurrency,
            isActive: formIsActive,
            displayOrder: formDisplayOrder,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setToast({ message: "Payment method updated successfully!", type: "success" });
          setShowAddModal(false);
          fetchGateways();
        } else {
          setToast({ message: data.error || "Failed to update payment method.", type: "error" });
        }
      } else {
        const res = await fetch("/api/admin/payment-methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: formCode || formName.toUpperCase().replace(/[^A-Z0-9]/g, "_"),
            name: formName,
            accountTitle: formAccountTitle,
            accountNumber: formAccountNumber,
            instructions: formInstructions,
            currency: formCurrency,
            isActive: formIsActive,
            displayOrder: formDisplayOrder,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setToast({ message: "Payment method created successfully!", type: "success" });
          setShowAddModal(false);
          fetchGateways();
        } else {
          setToast({ message: data.error || "Failed to create payment method.", type: "error" });
        }
      }
    } catch (e: any) {
      setToast({ message: "Network error saving payment method.", type: "error" });
    } finally {
      setSubmittingForm(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const handleDeleteGateway = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete payment method "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/payment-methods?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setGateways((prev) => prev.filter((g) => g.id !== id));
        setToast({ message: `Payment method "${name}" deleted.`, type: "success" });
      } else {
        const err = await res.json();
        setToast({ message: err.error || "Failed to delete payment method.", type: "error" });
      }
    } catch (e: any) {
      setToast({ message: "Network error deleting payment method.", type: "error" });
    }
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      (tx.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.referenceId || tx.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.senderName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.method || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "ALL" ? true : tx.status === filterStatus;
    const matchesMethod = filterMethod === "ALL" ? true : tx.method === filterMethod;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;
  const approvedCount = transactions.filter((t) => t.status === "APPROVED").length;
  const activeGatewaysCount = gateways.filter((g) => g.isActive).length;

  return (
    <div className="space-y-6">
      {/* TOAST ALERT */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold border transition-all animate-in slide-in-from-bottom ${
            toast.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/30 shadow-emerald-950/50"
              : "bg-rose-950/90 text-rose-200 border-rose-500/30 shadow-rose-950/50"
          } backdrop-blur-xl`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Finance & Settlements
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Ledger & Gateway Management</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 mt-1.5">
            <CreditCard className="w-6 h-6 text-amber-400" />
            Payments & Gateways
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review customer payment slips, manage deposit bank accounts, and configure automated crypto gateways.
          </p>
        </div>

        {/* TABS SWITCHER */}
        <div className="flex items-center bg-[#0d1424] border border-white/10 p-1 rounded-xl text-xs font-bold shadow-lg">
          <button
            onClick={() => setActiveTab("CRYPTOMUS")}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "CRYPTOMUS"
                ? "bg-indigo-600 text-white font-black shadow-sm"
                : "text-slate-400 hover:text-indigo-300"
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Cryptomus Web3 (Active)</span>
          </button>
          <button
            onClick={() => setActiveTab("GATEWAYS")}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "GATEWAYS"
                ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Deposit Accounts ({gateways.length})</span>
            {activeGatewaysCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {activeGatewaysCount} ON
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-white/10 text-slate-400">
                Disabled
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("SLIPS")}
            className={`px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "SLIPS"
                ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Slip Archive</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === "SLIPS" ? "bg-slate-950 text-amber-400" : "bg-rose-500 text-white animate-pulse"
              }`}>
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: SLIPS APPROVAL VIEW */}
      {activeTab === "SLIPS" && (
        <div className="space-y-6">
          {/* Top KPI Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-white/5 bg-[#0d1424] flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Total Slips</p>
                <p className="text-2xl font-black text-white mt-1 font-mono">{transactions.length}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Historical submissions</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-300">
                <Receipt className="w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] to-transparent flex items-center justify-between">
              <div>
                <p className="text-amber-300 text-[11px] font-semibold uppercase tracking-wider">Pending Audit</p>
                <p className="text-2xl font-black text-amber-400 mt-1 font-mono">{pendingCount}</p>
                <p className="text-[10px] text-amber-400/80 mt-0.5">Requires verification</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] to-transparent flex items-center justify-between">
              <div>
                <p className="text-emerald-300 text-[11px] font-semibold uppercase tracking-wider">Approved & Quota Set</p>
                <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">{approvedCount}</p>
                <p className="text-[10px] text-emerald-400/80 mt-0.5">Active subscribers</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-white/5 bg-[#0d1424] flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Active Rails</p>
                <p className="text-2xl font-black text-white mt-1 font-mono">{activeGatewaysCount}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Ready for checkout</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-300">
                <Wallet className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Filtering & Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-white/5 bg-[#0d1424]">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search user, ref ID, or sender..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#080d19] border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e: any) => setFilterStatus(e.target.value)}
                className="bg-[#080d19] border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none font-semibold focus:border-amber-400"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <button
                onClick={() => fetchTransactions(true)}
                className="p-2 rounded-xl bg-[#080d19] border border-white/10 hover:bg-white/5 text-slate-300 transition-colors"
                title="Refresh Table"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Slips Table */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1424] overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading settlement ledger...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <Receipt className="w-8 h-8 text-slate-600" />
                <span>No payment slips match your filters.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#080d19] text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/5">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Plan & Target Amount</th>
                      <th className="py-3 px-4">Deposit Rail</th>
                      <th className="py-3 px-4">Reference / TID</th>
                      <th className="py-3 px-4">Proof Slip</th>
                      <th className="py-3 px-4">Audit Status</th>
                      <th className="py-3 px-4 text-right">Settlement Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {filtered.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white">{tx.user?.name || "Customer"}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{tx.user?.email}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-amber-400">{tx.plan}</span>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {tx.currency} {tx.amount}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-slate-300">
                            {tx.method}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-white select-all">
                          <div className="font-bold">{tx.referenceId || "—"}</div>
                          {tx.senderName && <p className="text-[10px] text-slate-400 font-sans mt-0.5">By: {tx.senderName}</p>}
                        </td>
                        <td className="py-3.5 px-4">
                          {tx.receiptUrl ? (
                            <button
                              onClick={() => {
                                setPreviewSlip(tx);
                                setSlipZoom(1);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors shadow-sm text-xs font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>View Slip</span>
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px] font-mono">TID Only</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
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
                        <td className="py-3.5 px-4 text-right">
                          {tx.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleAction(tx.id, "APPROVE")}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs transition-all shadow-sm active:scale-95"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleAction(tx.id, "REJECT")}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-rose-950/60 border border-white/10 text-slate-300 hover:text-rose-400 font-semibold text-xs transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-medium">
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
      )}

      {/* TAB 2: CONFIGURE PAYMENT GATEWAYS VIEW */}
      {activeTab === "GATEWAYS" && (
        <div className="space-y-6">
          {/* Policy Banner: Cryptomus Exclusive */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 shrink-0">
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Checkout Policy: Cryptomus Web3 Only</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active & Running
                  </span>
                </h4>
                <p className="text-[11px] text-indigo-200/80 mt-0.5">
                  Customer billing checkout exclusively processes automated Web3 crypto transactions via Cryptomus. All manual bank/wallet deposit rails remain disabled.
                </p>
              </div>
            </div>
            {activeGatewaysCount > 0 && (
              <button
                type="button"
                onClick={handleDisableAllGateways}
                className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Disable All ({activeGatewaysCount} Active)</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/5 bg-[#0d1424]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  Payment Endpoints
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeGatewaysCount > 0 ? `${activeGatewaysCount} Active` : "All Disabled (Standby)"}
                </span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mt-1.5">
                <Wallet className="w-5 h-5 text-amber-400" />
                Deposit Accounts Ledger
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manual bank and wallet endpoints. When disabled, customers are not shown manual slips and checkout only via Cryptomus.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Gateway</span>
              </button>
            </div>
          </div>

          {loadingGateways ? (
            <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading payment gateways...</span>
            </div>
          ) : gateways.length === 0 ? (
            <div className="p-16 text-center text-slate-500 text-xs rounded-2xl border border-white/5 bg-[#0d1424]">
              No payment gateways configured. Click "Add New Payment Gateway" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {gateways.map((g) => (
                <div
                  key={g.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                    g.isActive
                      ? "border-white/10 bg-[#0d1424] hover:border-amber-500/30 shadow-lg"
                      : "border-white/5 bg-[#0a0f1b]/60 opacity-60"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                          {g.code}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1.5">{g.name}</h3>
                      </div>
                      <button
                        onClick={() => handleToggleGateway(g)}
                        title={g.isActive ? "Click to Deactivate" : "Click to Activate"}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-all ${
                          g.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30"
                            : "bg-white/5 text-slate-400 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{g.isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#080d19] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Account Title:</span>
                        <span className="text-white font-bold">{g.accountTitle}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Account / No:</span>
                        <span className="text-amber-400 font-mono font-bold text-right truncate max-w-[190px]">
                          {g.accountNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Currency:</span>
                        <span className="text-slate-300 font-mono font-bold">{g.currency}</span>
                      </div>
                    </div>

                    {g.instructions && (
                      <p className="text-[11px] text-slate-400 leading-relaxed italic bg-[#080d19]/60 p-2.5 rounded-xl border border-white/5">
                        "{g.instructions}"
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(g)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
                    >
                      <Edit2 className="w-3 h-3 text-amber-400" />
                      <span>Edit Details</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGateway(g.id, g.name)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Delete Gateway"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CRYPTOMUS WEB3 GATEWAY CONFIGURATION */}
      {activeTab === "CRYPTOMUS" && (
        <div className="space-y-6 max-w-4xl">
          {/* Header Card */}
          <div className="p-6 rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-400 shadow-lg shadow-indigo-500/20 shrink-0">
                <Coins className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white">Cryptomus Web3 Gateway</h2>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    cryptomusMerchantId
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}>
                    {cryptomusMerchantId ? "Connected & Automated" : "Setup Required"}
                  </span>
                </div>
                <p className="text-xs text-indigo-200/80 mt-1">
                  100% Automated cryptocurrency payments with instant plan activation on blockchain confirmation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#080d19] p-2 rounded-2xl border border-white/10 shrink-0">
              <span className="text-xs font-bold text-slate-300">Gateway Status:</span>
              <button
                type="button"
                onClick={() => setCryptomusActive(!cryptomusActive)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  cryptomusActive
                    ? "bg-emerald-500 text-slate-950 shadow-xs"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {cryptomusActive ? "Active (Online)" : "Disabled"}
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#0d1424] shadow-xl space-y-6">
            <form onSubmit={handleSaveCryptomus} className="space-y-5">
              {/* Merchant ID */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Cryptomus Merchant ID (UUID) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setCryptomusMerchantId("167b0546-3978-437c-90f4-2336cf51b015")}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Paste Detected: 167b0546-3978...</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. 167b0546-3978-437c-90f4-2336cf51b015"
                  value={cryptomusMerchantId}
                  onChange={(e) => setCryptomusMerchantId(e.target.value)}
                  className="w-full bg-[#080d19] border border-white/10 rounded-xl p-3 text-xs font-mono text-white outline-none focus:border-amber-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Copy from your Cryptomus Dashboard (shown on your screen under Merchant ID).
                </p>
              </div>

              {/* Payment API Key */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Cryptomus Payment API Key *
                </label>
                <div className="relative">
                  <input
                    type={showCryptomusKey ? "text" : "password"}
                    required
                    placeholder="Enter your Cryptomus Payment API Key"
                    value={cryptomusApiKey}
                    onChange={(e) => setCryptomusApiKey(e.target.value)}
                    className="w-full bg-[#080d19] border border-white/10 rounded-xl p-3 pr-10 text-xs font-mono text-white outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCryptomusKey(!showCryptomusKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showCryptomusKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Generated in Cryptomus Business &gt; Merchants &gt; API Integration tab.
                </p>
              </div>

              {/* Webhook Callback URL Box */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Webhook URL (Paste this in Cryptomus Settings)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("https://getsendport.com/api/payments/cryptomus/webhook");
                      setCopiedWebhook(true);
                      setTimeout(() => setCopiedWebhook(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    {copiedWebhook ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy URL
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-[#080d19] border border-white/10 font-mono text-xs text-white select-all truncate">
                  https://getsendport.com/api/payments/cryptomus/webhook
                </div>
                <p className="text-[11px] text-slate-400">
                  Cryptomus will send instant blockchain transaction notifications to this URL.
                </p>
              </div>

              {/* Domain Verification File */}
              <div className="p-4 rounded-2xl bg-[#080d19] border border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Domain Verification File Deployed</h4>
                    <p className="text-[11px] text-slate-400 font-mono">cryptomus_167b0546.html</p>
                  </div>
                </div>
                <a
                  href="https://getsendport.com/cryptomus_167b0546.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <span>Test File Online</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={savingCryptomus}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {savingCryptomus ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Cryptomus Keys to Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT GATEWAY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-[#0d1424] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#080d19]">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>{editingGateway ? "Edit Payment Method" : "Add New Payment Method"}</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGateway} className="p-5 space-y-4 text-xs">
              {!editingGateway && (
                <div className="space-y-3">
                  {/* Cryptomus Direct Quick Action Banner */}
                  <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-[#080d19] p-3.5 rounded-xl border border-indigo-500/40 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-white flex items-center gap-1.5">
                          ⚡ Looking for Cryptomus Web3 Setup?
                        </span>
                        <span className="text-[10px] text-indigo-200 block">
                          Automated zero-admin blockchain activation (USDT, BTC, ETH, TON, SOL)
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setActiveTab("CRYPTOMUS");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors shrink-0 shadow-md cursor-pointer"
                    >
                      Configure Cryptomus &rarr;
                    </button>
                  </div>

                  <div className="bg-[#080d19] p-3 rounded-xl border border-white/5 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Manual Presets (Click to autofill):</div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          setActiveTab("CRYPTOMUS");
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-indigo-600/30 text-amber-400 hover:bg-indigo-600/50 hover:text-white transition-colors border border-indigo-500/30 flex items-center gap-1 cursor-pointer"
                      >
                        <Coins className="w-3 h-3 text-amber-400" />
                        <span>⚡ Cryptomus (Automated)</span>
                      </button>
                    {[
                      { name: "Easypaisa Wallet", code: "EASYPAISA", currency: "PKR", instructions: "Transfer exact PKR amount via Easypaisa App or *786#. Paste Transaction ID / TID below." },
                      { name: "JazzCash Account", code: "JAZZCASH", currency: "PKR", instructions: "Send via JazzCash App or USSD *786#. Enter the 12-digit TID in the form." },
                      { name: "Raast Instant IBAN", code: "RAAST", currency: "PKR", instructions: "Use Raast Instant Payment from any Pakistani bank app without transfer fees." },
                      { name: "Bank Wire (Meezan Bank)", code: "BANK_TRANSFER", currency: "PKR", instructions: "Transfer to bank account. Enter reference ID or Tx screenshot." },
                      { name: "SadaPay Personal / Business", code: "SADAPAY", currency: "PKR", instructions: "Send via SadaPay App or IBAN transfer. Enter the SadaPay transaction ID in the field." },
                      { name: "NayaPay Digital Wallet", code: "NAYAPAY", currency: "PKR", instructions: "Transfer to NayaPay wallet or IBAN. Enter your NayaPay Reference ID below." },
                      { name: "Crypto USDT (TRC-20)", code: "USDT_TRC20", currency: "USD", instructions: "Send only TRC-20 USDT. Enter your 64-character TxHash." },
                      { name: "Wise / Payoneer Transfer", code: "WISE_PAYONEER", currency: "USD", instructions: "Transfer via Wise or Payoneer directly. Enter Wise transfer reference number." },
                    ].map((preset) => (
                      <button
                        key={preset.code}
                        type="button"
                        onClick={() => {
                          setFormName(preset.name);
                          setFormCode(preset.code);
                          setFormCurrency(preset.currency);
                          setFormInstructions(preset.instructions);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/5 text-slate-300 hover:bg-amber-400/20 hover:text-amber-300 transition-colors border border-white/5"
                      >
                        + {preset.name.split(" ")[0]}
                      </button>
                    ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Method Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Easypaisa Account"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#080d19] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Gateway Code *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingGateway}
                    placeholder="e.g. EASYPAISA"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full bg-[#080d19] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 disabled:opacity-50 uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Account Holder / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sendport Technologies LLC or Account Title"
                  value={formAccountTitle}
                  onChange={(e) => setFormAccountTitle(e.target.value)}
                  className="w-full bg-[#080d19] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Account Number / IBAN / Wallet Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0300-1234567 or PK00MEZN... or TXYZ..."
                  value={formAccountNumber}
                  onChange={(e) => setFormAccountNumber(e.target.value)}
                  className="w-full bg-[#080d19] border border-white/10 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Currency</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full bg-[#080d19] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  >
                    <option value="PKR">PKR (Pakistani Rupee)</option>
                    <option value="USD">USD (US Dollar / Crypto USDT)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                    <option value="AED">AED (UAE Dirham)</option>
                    <option value="SAR">SAR (Saudi Riyal)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full bg-[#080d19] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Deposit Instructions for Customer</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Send exact PKR amount and paste the 12-digit TID below..."
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="w-full bg-[#080d19] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-[#080d19] border-white/10"
                />
                <label htmlFor="isActiveToggle" className="text-slate-300 font-semibold cursor-pointer">
                  Activate this method immediately for all customers
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black transition-all disabled:opacity-50"
                >
                  {submittingForm ? "Saving..." : editingGateway ? "Update Method" : "Create Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT INSPECTION LIGHTBOX MODAL */}
      {previewSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-4xl max-h-[92vh] bg-[#0d1424] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-[#080d19]">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">Payment Receipt Audit</span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    previewSlip.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : previewSlip.status === "REJECTED"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {previewSlip.status}
                </span>
              </div>
              <button
                onClick={() => setPreviewSlip(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
              {/* Image Inspection Left Pane */}
              <div className="lg:col-span-8 p-4 bg-black/40 flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-white/5">
                {/* Zoom Controls */}
                <div className="w-full flex items-center justify-between pb-3 text-xs text-slate-400">
                  <span className="text-[11px] font-mono">Proof Image Viewport</span>
                  <div className="flex items-center gap-1 bg-[#080d19] border border-white/10 rounded-lg p-0.5">
                    <button
                      onClick={() => setSlipZoom((prev) => Math.max(0.75, prev - 0.25))}
                      className="p-1.5 hover:text-white hover:bg-white/10 rounded"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1.5 text-[10px] font-mono font-bold text-slate-300">
                      {Math.round(slipZoom * 100)}%
                    </span>
                    <button
                      onClick={() => setSlipZoom((prev) => Math.min(2.5, prev + 0.25))}
                      className="p-1.5 hover:text-white hover:bg-white/10 rounded"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSlipZoom(1)}
                      className="p-1.5 hover:text-white hover:bg-white/10 rounded"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Image Viewport */}
                <div className="w-full flex-1 max-h-[500px] overflow-auto flex items-center justify-center p-2 rounded-xl bg-[#080d19]/60 border border-white/5">
                  <img
                    src={previewSlip.receiptUrl}
                    alt="Payment Slip Proof"
                    style={{ transform: `scale(${slipZoom})`, transformOrigin: "center center" }}
                    className="max-h-[460px] w-auto object-contain rounded-lg shadow-lg transition-transform duration-150 cursor-zoom-in"
                    onClick={() => setSlipZoom((prev) => (prev >= 2 ? 1 : prev + 0.5))}
                  />
                </div>

                <div className="w-full pt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Click image to toggle zoom</span>
                  <a
                    href={previewSlip.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open Raw Fullscreen</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Transaction Metadata & Actions Right Pane */}
              <div className="lg:col-span-4 p-5 flex flex-col justify-between space-y-5 bg-[#0d1424]">
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Customer</span>
                    <p className="font-bold text-white text-sm mt-0.5">{previewSlip.user?.name || "Customer"}</p>
                    <p className="text-slate-400 font-mono text-xs">{previewSlip.user?.email}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#080d19] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Target Plan:</span>
                      <span className="font-bold text-amber-400">{previewSlip.plan}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Amount Due:</span>
                      <span className="font-bold text-white font-mono">
                        {previewSlip.currency} {previewSlip.amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Deposit Rail:</span>
                      <span className="text-slate-200 font-mono">{previewSlip.method}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        Transaction TID / Ref ID
                      </span>
                      {previewSlip.referenceId && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(previewSlip.referenceId);
                            setCopiedTid(true);
                            setTimeout(() => setCopiedTid(false), 2000);
                          }}
                          className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                        >
                          {copiedTid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedTid ? "Copied" : "Copy"}</span>
                        </button>
                      )}
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#080d19] border border-white/5 text-white font-mono font-bold select-all break-all text-xs">
                      {previewSlip.referenceId || "No Reference ID Provided"}
                    </div>
                    {previewSlip.senderName && (
                      <p className="text-[11px] text-slate-400 mt-1">Sender Account: {previewSlip.senderName}</p>
                    )}
                  </div>
                </div>

                {/* Modal Inline Action Triggers */}
                <div className="pt-4 border-t border-white/5 space-y-2">
                  {previewSlip.status === "PENDING" ? (
                    <>
                      <button
                        onClick={async () => {
                          await handleAction(previewSlip.id, "APPROVE");
                          setPreviewSlip((prev: any) => (prev ? { ...prev, status: "APPROVED" } : null));
                        }}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Upgrade Workspace</span>
                      </button>
                      <button
                        onClick={async () => {
                          await handleAction(previewSlip.id, "REJECT");
                          setPreviewSlip((prev: any) => (prev ? { ...prev, status: "REJECTED" } : null));
                        }}
                        className="w-full py-2 rounded-xl bg-white/5 hover:bg-rose-950/60 border border-white/10 text-slate-300 hover:text-rose-400 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject Transaction</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#080d19] border border-white/5 text-center">
                      <p className="text-xs font-bold text-slate-300">Transaction Status: {previewSlip.status}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {previewSlip.adminNotes || "Action completed by superadmin."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
