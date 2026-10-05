"use client";

import React, { useState } from "react";
import { Ban, Plus, Trash2, Search, UserX, AlertOctagon, MailCheck } from "lucide-react";

export default function SuppressionsPage() {
  const [suppressions, setSuppressions] = useState([
    { email: "bounced-user@invalid-inbox.com", reason: "HARD_BOUNCE", date: "Oct 2, 2026" },
    { email: "unsubscribe-demo@company.org", reason: "UNSUBSCRIBE", date: "Sep 29, 2026" },
    { email: "spam-reported@targetdomain.net", reason: "COMPLAINT", date: "Sep 15, 2026" },
  ]);

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newReason, setNewReason] = useState("MANUAL");

  const handleAdd = () => {
    if (!newEmail) return;
    setSuppressions([
      { email: newEmail.trim(), reason: newReason, date: "Just now" },
      ...suppressions,
    ]);
    setShowAddModal(false);
    setNewEmail("");
  };

  const handleRemove = (email: string) => {
    setSuppressions(suppressions.filter((s) => s.email !== email));
  };

  const filtered = suppressions.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Suppression List</h1>
          <p className="text-sm text-slate-500">
            Automatically prevents repeated sending to hard-bounced addresses, spam complainants, and unsubscribed recipients.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          <Plus className="w-3.5 h-3.5" /> Suppress Email
        </button>
      </div>

      {/* SUPPRESSION TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search suppressed emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">{filtered.length} suppressed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Suppressed Email Address</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Added Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-mono font-medium text-slate-900">{s.email}</td>
                  <td className="px-5 py-3.5">
                    {s.reason === "HARD_BOUNCE" && (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-100">
                        <AlertOctagon className="w-3 h-3" /> Hard Bounce
                      </span>
                    )}
                    {s.reason === "UNSUBSCRIBE" && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-100">
                        <UserX className="w-3 h-3" /> Unsubscribe
                      </span>
                    )}
                    {s.reason === "COMPLAINT" && (
                      <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-100">
                        <Ban className="w-3 h-3" /> Spam Complaint
                      </span>
                    )}
                    {s.reason === "MANUAL" && (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
                        Manual Suppression
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{s.date}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleRemove(s.email)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add to Suppression List</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="recipient@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason</label>
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 bg-white"
                >
                  <option value="MANUAL">Manual Suppression</option>
                  <option value="HARD_BOUNCE">Hard Bounce</option>
                  <option value="UNSUBSCRIBE">Unsubscribe</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Add Suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
