"use client";

import React, { useState, useEffect } from "react";
import {
  Inbox,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  User,
  ShieldCheck,
  AlertCircle,
  Trash2,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check,
  Headphones,
  AtSign
} from "lucide-react";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  name: string | null;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "OPEN" | "REPLIED" | "CLOSED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  replyText: string | null;
  repliedAt: string | null;
  repliedBy: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TicketCounts {
  total: number;
  new: number;
  open: number;
  replied: number;
  closed: number;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [counts, setCounts] = useState<TicketCounts>({ total: 0, new: 0, open: 0, replied: 0, closed: 0 });
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Reply Studio State
  const [replyContent, setReplyContent] = useState("");
  const [responderName, setResponderName] = useState("Muhammad Umar (Founder)");
  const [sendingReply, setSendingReply] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "ALL") params.append("status", filterStatus);
      if (searchTerm.trim()) params.append("q", searchTerm.trim());

      const res = await fetch(`/api/admin/support?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        if (data.counts) setCounts(data.counts);

        if (!selectedTicketId && data.tickets?.length > 0) {
          setSelectedTicketId(data.tickets[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  // Handle quick reply template selection
  const handleSelectTemplate = (templateType: string) => {
    if (!selectedTicket) return;
    const customerName = selectedTicket.name || "there";

    if (templateType === "WELCOME") {
      setReplyContent(
        `Hi ${customerName},\n\nThank you for reaching out to Sendport Support. We have received your inquiry regarding "${selectedTicket.subject}".\n\nYou can start sending transactional emails immediately with our 100 free sends/day tier or connect your custom domain in Dashboard > Domains.\n\nPlease let us know if you need any assistance getting started!\n\nBest regards,\nSendport Team`
      );
    } else if (templateType === "DEDICATED_IP") {
      setReplyContent(
        `Hi ${customerName},\n\nThanks for inquiring about dedicated IP options. On our Scale Pro plan, we offer managed dedicated IPs with automated 30-day warmup algorithms to ensure 99.9% inbox placement with Google and Microsoft.\n\nCould you share your estimated monthly sending volume and primary sending domains so we can customize your warmup schedule?\n\nBest regards,\nSendport Infrastructure Engineering`
      );
    } else if (templateType === "PAYMENT") {
      setReplyContent(
        `Hi ${customerName},\n\nThank you for choosing Sendport. We support global payments alongside direct local bank rails (Raast, Easypaisa, JazzCash) and Crypto USDT.\n\nOnce your transaction receipt is submitted in Dashboard > Billing, our team activates your elevated quotas within minutes.\n\nLet us know if you have any questions!\n\nBest regards,\nSendport Billing Team`
      );
    } else if (templateType === "RESOLVED") {
      setReplyContent(
        `Hi ${customerName},\n\nWe have reviewed and resolved the item you reported regarding "${selectedTicket.subject}". All systems and delivery queues are operating with optimal throughput.\n\nPlease verify on your end and let us know if everything is running smoothly.\n\nBest regards,\nSendport Support`
      );
    }
  };

  // Submit direct email reply to customer
  const handleSendReply = async () => {
    if (!selectedTicket || !replyContent.trim()) return;

    try {
      setSendingReply(true);
      setToast(null);

      const res = await fetch("/api/admin/support/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          replyText: replyContent.trim(),
          adminName: responderName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.emailDelivered) {
          setToast({
            message: `Official email dispatched to ${selectedTicket.email} (Message ID: ${data.deliveryMessageId})`,
            type: "success",
          });
        } else {
          setToast({
            message: data.deliveryWarning || "Reply saved in database. Direct MX dispatch was queued.",
            type: "warning",
          });
        }

        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id
              ? {
                  ...t,
                  status: "REPLIED",
                  replyText: replyContent.trim(),
                  repliedAt: new Date().toISOString(),
                  repliedBy: responderName,
                }
              : t
          )
        );
        setReplyContent("");
      } else {
        setToast({ message: data.error || "Failed to dispatch reply.", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message || "Network error submitting reply.", type: "error" });
    } finally {
      setSendingReply(false);
    }
  };

  // Update ticket status
  const handleUpdateStatus = async (newStatus: "NEW" | "OPEN" | "REPLIED" | "CLOSED") => {
    if (!selectedTicket) return;

    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status: newStatus,
        }),
      });

      if (res.ok) {
        setTickets((prev) =>
          prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: newStatus } : t))
        );
        setToast({ message: `Ticket marked as ${newStatus}`, type: "success" });
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Delete ticket
  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;
    if (!confirm(`Are you sure you want to delete ticket #${selectedTicket.ticketNumber}?`)) return;

    try {
      const res = await fetch(`/api/admin/support?ticketId=${selectedTicket.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTickets((prev) => prev.filter((t) => t.id !== selectedTicket.id));
        setSelectedTicketId(null);
        setToast({ message: "Ticket removed successfully.", type: "success" });
      }
    } catch (err) {
      console.error("Failed to delete ticket", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-1.5 font-mono">
            <Headphones className="w-3.5 h-3.5" /> Native Support Helpdesk & Direct Dispatch
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-amber-400" />
            Support Inquiries & Customer Communications
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Incoming inquiries from <span className="text-white font-mono">/contact</span>. Reply directly from <span className="text-amber-400 font-mono">support@getsendport.com</span> with 2048-bit DKIM direct MTA delivery.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-[#0d1424] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors self-start md:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          Refresh Queue
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Inquiries", count: counts.total, color: "text-white", bg: "bg-[#0d1424] border-white/5" },
          { label: "New & Unread", count: counts.new, color: "text-amber-400", bg: "bg-amber-500/[0.08] border-amber-500/20" },
          { label: "In Progress / Open", count: counts.open, color: "text-sky-400", bg: "bg-sky-500/[0.08] border-sky-500/20" },
          { label: "Replied", count: counts.replied, color: "text-emerald-400", bg: "bg-emerald-500/[0.08] border-emerald-500/20" },
          { label: "Closed / Resolved", count: counts.closed, color: "text-slate-500", bg: "bg-[#0d1424] border-white/5" },
        ].map((kpi) => (
          <div key={kpi.label} className={`p-4 rounded-2xl border ${kpi.bg} space-y-1 shadow-sm`}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{kpi.label}</p>
            <p className={`text-2xl font-black font-mono ${kpi.color}`}>{kpi.count}</p>
          </div>
        ))}
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all backdrop-blur-xl ${
            toast.type === "success"
              ? "border-emerald-500/30 bg-emerald-950/80 text-emerald-200"
              : toast.type === "warning"
              ? "border-amber-500/30 bg-amber-950/80 text-amber-200"
              : "border-rose-500/30 bg-rose-950/80 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />}
            <span className="font-medium">{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white text-xs ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Main Split-Pane Helpdesk Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left Pane: Tickets List */}
        <div className="lg:col-span-5 rounded-2xl border border-white/5 bg-[#0d1424] p-4 flex flex-col space-y-3 shadow-xl">
          {/* Search & Filters */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by email, name, or #SPT-..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#080d19] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </form>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {["ALL", "NEW", "OPEN", "REPLIED", "CLOSED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors shrink-0 text-[10px] uppercase tracking-wider ${
                  filterStatus === s
                    ? "bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black shadow-sm"
                    : "bg-[#080d19] text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[560px]">
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-500 space-y-2">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin text-amber-400" />
                <p>Loading support queue...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-500 space-y-2">
                <Inbox className="w-8 h-8 mx-auto text-slate-600" />
                <p>No support inquiries found in this view.</p>
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-amber-500/50 bg-gradient-to-r from-amber-500/[0.08] to-transparent shadow-lg"
                        : "border-white/5 bg-[#080d19]/60 hover:border-white/15 hover:bg-[#080d19]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-amber-400">#{t.ticketNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wide uppercase ${
                          t.status === "NEW"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                            : t.status === "REPLIED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : t.status === "OPEN"
                            ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            : "bg-white/5 text-slate-400 border border-white/5"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate">{t.subject}</h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{t.message}</p>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5 text-[10px] text-slate-500">
                      <span className="truncate max-w-[150px] font-medium text-slate-400">{t.name || t.email}</span>
                      <span className="font-mono">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Ticket Conversation & Direct Email Reply */}
        <div className="lg:col-span-7 rounded-2xl border border-white/5 bg-[#0d1424] p-6 flex flex-col justify-between space-y-6 shadow-xl">
          {selectedTicket ? (
            <div className="space-y-6">
              {/* Ticket Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-amber-400">#{selectedTicket.ticketNumber}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-slate-400 font-mono" suppressHydrationWarning>
                      Logged on {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedTicket.subject}</h2>
                </div>

                {/* Status Switcher & Controls */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(e.target.value as any)}
                    className="bg-[#080d19] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-semibold"
                  >
                    <option value="NEW">Mark as NEW</option>
                    <option value="OPEN">Mark as OPEN</option>
                    <option value="REPLIED">Mark as REPLIED</option>
                    <option value="CLOSED">Mark as CLOSED</option>
                  </select>

                  <button
                    onClick={handleDeleteTicket}
                    title="Delete ticket"
                    className="p-1.5 rounded-xl border border-white/10 bg-[#080d19] text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="p-3.5 rounded-xl border border-white/5 bg-[#080d19] flex flex-wrap items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    {(selectedTicket.name || selectedTicket.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white">{selectedTicket.name || "Customer"}</p>
                    <a href={`mailto:${selectedTicket.email}`} className="text-slate-400 hover:text-amber-400 font-mono text-[11px] transition-colors">
                      {selectedTicket.email}
                    </a>
                  </div>
                </div>

                {selectedTicket.ipAddress && (
                  <span className="font-mono text-[11px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                    IP: {selectedTicket.ipAddress}
                  </span>
                )}
              </div>

              {/* Customer Original Message */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-amber-400" /> Customer Inquiry Message:
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-[#080d19] text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedTicket.message}
                </div>
              </div>

              {/* Previous Reply History (if replied) */}
              {selectedTicket.replyText && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Official Reply Sent:
                    </span>
                    <span className="text-slate-500 font-mono text-[10px] lowercase">
                      {selectedTicket.repliedAt ? new Date(selectedTicket.repliedAt).toLocaleString() : ""} by {selectedTicket.repliedBy || "Admin"}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap border-l-4 border-l-emerald-500">
                    {selectedTicket.replyText}
                  </div>
                </div>
              )}

              {/* Direct Reply Composer */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-white flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    Dispatch Official Reply from <span className="font-mono text-amber-400">support@getsendport.com</span>
                  </label>

                  <input
                    type="text"
                    value={responderName}
                    onChange={(e) => setResponderName(e.target.value)}
                    placeholder="Responder Title"
                    className="bg-[#080d19] border border-white/10 rounded-xl px-2.5 py-1 text-[11px] text-slate-300 w-48 text-right focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Quick Templates Toolbar */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-slate-500 font-medium">Quick Template:</span>
                  {[
                    { label: "Welcome & Onboarding", key: "WELCOME" },
                    { label: "Dedicated IP Warmup", key: "DEDICATED_IP" },
                    { label: "Payment & Upgrade", key: "PAYMENT" },
                    { label: "Issue Resolved", key: "RESOLVED" },
                  ].map((tpl) => (
                    <button
                      key={tpl.key}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl.key)}
                      className="px-2.5 py-1 rounded-lg border border-white/5 bg-[#080d19] text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors text-[10px] font-semibold"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>

                {/* Reply Editor */}
                <textarea
                  rows={5}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Write your direct response to ${selectedTicket.name || selectedTicket.email}... When dispatched, an official DKIM-signed email will arrive in their inbox.`}
                  className="w-full rounded-xl border border-white/10 bg-[#080d19] p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed resize-none transition-colors"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 2048-bit RSA DKIM Signed • Direct MX Node
                  </span>

                  <button
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyContent.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20 active:scale-95"
                  >
                    {sendingReply ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Delivering to Customer...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Reply to Customer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-32 text-center text-slate-500 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
              <p>Select a ticket from the left queue to view details and send replies.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
