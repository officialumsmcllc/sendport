"use client";

import React, { useState } from "react";
import { Ban, Plus, Trash2, Search, UserX, AlertOctagon, MailCheck, ShieldCheck } from "lucide-react";

export default function SuppressionsPage() {
  const [suppressions, setSuppressions] = useState<{ email: string; reason: string; date: string }[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newReason, setNewReason] = useState("MANUAL");

  const handleAdd = () => {
    if (!newEmail.trim()) return;
    setSuppressions([
      { email: newEmail.trim().toLowerCase(), reason: newReason, date: "Just now" },
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

      {/* SUPPRESSION TABLE OR EMPTY STATE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500/80" />
            <h3 className="text-sm font-bold text-slate-800">Your Suppression List is Clean</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No recipients have hard-bounced or unsubscribed. Addresses that bounce will automatically be placed here to protect your domain reputation.
            </p>
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Manually Add Suppression
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search suppressed emails..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Suppressed Email</th>
                    <th className="px-5 py-3">Reason</th>
                    <th className="px-5 py-3">Date Suppressed</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((item) => (
                    <tr key={item.email} className="hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-semibold text-slate-900">{item.email}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.reason === "HARD_BOUNCE"
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : item.reason === "COMPLAINT"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {item.reason}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{item.date}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleRemove(item.email)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Manually Suppress Email</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Suppression Reason</label>
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                >
                  <option value="MANUAL">Manual Suppression</option>
                  <option value="UNSUBSCRIBE">Unsubscribe Request</option>
                  <option value="HARD_BOUNCE">Hard Bounce / Dead Mailbox</option>
                  <option value="COMPLAINT">Spam Complaint</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newEmail.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50"
              >
                Add to Suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
