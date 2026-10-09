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
  const [activeTab, setActiveTab] = useState<"SLIPS" | "GATEWAYS">("SLIPS");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [filterMethod, setFilterMethod] = useState<string>("ALL");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const fetchGateways = async () => {
    try {
      setLoadingGateways(true);
      const res = await fetch("/api/admin/payment-methods");
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

  useEffect(() => {
    fetchTransactions();
    fetchGateways();
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
        // PATCH
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
        // POST
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
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-800"
              : "bg-rose-950/90 text-rose-200 border-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
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

      {/* ADD / EDIT GATEWAY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>{editingGateway ? "Edit Payment Method" : "Add New Payment Method"}</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGateway} className="p-5 space-y-4 text-xs">
              {!editingGateway && (
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Presets (Click to autofill):</div>
                  <div className="flex flex-wrap gap-1.5">
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
                        className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-800/80 text-slate-300 hover:bg-amber-400/20 hover:text-amber-300 transition-colors border border-slate-700/60"
                      >
                        + {preset.name.split(" ")[0]}
                      </button>
                    ))}
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 disabled:opacity-50 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Account Holder / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Umar or Official UM1 LLC"
                  value={formAccountTitle}
                  onChange={(e) => setFormAccountTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Currency</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-800"
                />
                <label htmlFor="isActiveToggle" className="text-slate-300 font-semibold cursor-pointer">
                  Activate this method immediately for all customers
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all disabled:opacity-50"
                >
                  {submittingForm ? "Saving..." : editingGateway ? "Update Method" : "Create Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-amber-400" />
            Financial Management & Payment Controls
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure dynamic payment gateways (Easypaisa, JazzCash, USDT, Banks) and approve customer manual subscription slips.
          </p>
        </div>

        {/* TABS SWITCHER */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab("SLIPS")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === "SLIPS"
                ? "bg-amber-500 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Slip Approvals</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-extrabold animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("GATEWAYS")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === "GATEWAYS"
                ? "bg-amber-500 text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Manage Gateways ({gateways.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SLIPS APPROVAL VIEW */}
      {activeTab === "SLIPS" && (
        <>
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[11px] font-semibold">Total Slips Submitted</p>
                <p className="text-2xl font-black text-white mt-1">{transactions.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
              <div>
                <p className="text-amber-300 text-[11px] font-semibold">Pending Verification</p>
                <p className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
              <div>
                <p className="text-emerald-300 text-[11px] font-semibold">Approved & Activated</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">{approvedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Check className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[11px] font-semibold">Active Payment Gateways</p>
                <p className="text-2xl font-black text-white mt-1">{activeGatewaysCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filtering Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search user, ref ID, or sender name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e: any) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <button
                onClick={fetchTransactions}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Refresh Table"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Slips Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading payment verification records...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No payment slips match your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Plan & Amount</th>
                      <th className="py-3 px-4">Gateway</th>
                      <th className="py-3 px-4">Reference / TID</th>
                      <th className="py-3 px-4">Proof Slip</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filtered.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-white">{tx.user?.name || "Customer"}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{tx.user?.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-amber-400">{tx.plan}</span>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {tx.currency} {tx.amount}
                          </p>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-300">{tx.method}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-white select-all">
                          {tx.referenceId || "—"}
                          {tx.senderName && <p className="text-[10px] text-slate-400">By: {tx.senderName}</p>}
                        </td>
                        <td className="py-3 px-4">
                          {tx.receiptUrl ? (
                            <button
                              onClick={() => setPreviewImage(tx.receiptUrl)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>View Slip</span>
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px]">TID Only</span>
                          )}
                        </td>
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
                        <td className="py-3 px-4 text-right">
                          {tx.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleAction(tx.id, "APPROVE")}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-sm active:scale-95"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleAction(tx.id, "REJECT")}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 border border-slate-700 text-slate-300 hover:text-rose-400 font-semibold"
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
        </>
      )}

      {/* TAB 2: CONFIGURE PAYMENT GATEWAYS VIEW */}
      {activeTab === "GATEWAYS" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                Active Payment Gateways & Receiving Accounts
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                These are the accounts shown to users on their Billing page. You can edit numbers, change account titles, or add new gateways anytime.
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Payment Gateway</span>
            </button>
          </div>

          {loadingGateways ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading payment gateways...</span>
            </div>
          ) : gateways.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs rounded-2xl border border-slate-800 bg-slate-900/40">
              No payment gateways configured. Click "Add New Payment Gateway" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {gateways.map((g) => (
                <div
                  key={g.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                    g.isActive
                      ? "border-slate-800 bg-slate-900/70 hover:border-slate-700"
                      : "border-slate-800/50 bg-slate-950/40 opacity-60"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
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
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{g.isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Title:</span>
                        <span className="text-white font-bold">{g.accountTitle}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Account / No:</span>
                        <span className="text-amber-400 font-mono font-bold text-right truncate max-w-[180px]">
                          {g.accountNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Currency:</span>
                        <span className="text-slate-300 font-bold">{g.currency}</span>
                      </div>
                    </div>

                    {g.instructions && (
                      <p className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
                        "{g.instructions}"
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(g)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
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
    </div>
  );
}
