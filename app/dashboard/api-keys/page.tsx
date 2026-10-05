"use client";

import React, { useState } from "react";
import { Key, Plus, Copy, Check, Trash2, Shield, Eye, EyeOff } from "lucide-react";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  scope: string;
  created: string;
  lastUsed: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([
    {
      id: "key_1",
      name: "Production Web Server",
      keyPrefix: "sk_live_8f9a2b...",
      scope: "Full Access",
      created: "Oct 1, 2026",
      lastUsed: "2 mins ago",
    },
    {
      id: "key_2",
      name: "Staging & CI/CD",
      keyPrefix: "sk_live_3c4d5e...",
      scope: "Send Only",
      created: "Sep 25, 2026",
      lastUsed: "1 day ago",
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState("Full Access");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateKey = () => {
    if (!newKeyName) return;
    const rawKey = `sk_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const newEntry: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      keyPrefix: `${rawKey.substring(0, 14)}...`,
      scope: newKeyScope,
      created: "Just now",
      lastUsed: "Never",
    };
    setKeys([newEntry, ...keys]);
    setGeneratedKey(rawKey);
  };

  const handleCopyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = (id: string) => {
    if (confirm("Are you sure you want to revoke this API key? Applications using it will immediately be rejected.")) {
      setKeys(keys.filter((k) => k.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">API Keys</h1>
          <p className="text-sm text-slate-500">
            Authenticate REST API requests and SMTP connections using secret tokens.
          </p>
        </div>
        <button
          onClick={() => {
            setGeneratedKey(null);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          <Plus className="w-3.5 h-3.5" /> Create API Key
        </button>
      </div>

      {/* API KEYS TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Key Token</th>
                <th className="px-5 py-3">Permission Scope</th>
                <th className="px-5 py-3">Last Used</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4 font-bold text-slate-900">{k.name}</td>
                  <td className="px-5 py-4 font-mono text-slate-700">{k.keyPrefix}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 rounded bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700 border border-primary-100">
                      <Shield className="w-3 h-3" /> {k.scope}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{k.lastUsed}</td>
                  <td className="px-5 py-4 text-slate-400">{k.created}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE API KEY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {generatedKey ? "API Key Generated" : "Create Secret API Key"}
            </h3>

            {!generatedKey ? (
              <>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Key Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Production Backend or Mobile App"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Scope</label>
                    <select
                      value={newKeyScope}
                      onChange={(e) => setNewKeyScope(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs bg-white"
                    >
                      <option value="Full Access">Full Access (Send, Inbound, Manage)</option>
                      <option value="Send Only">Send Only (Restricted to emails.send)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateKey}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Create Key
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Please save this secret key now. You will not be able to view it again.
                </p>
                <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-xs flex items-center justify-between">
                  <span className="truncate pr-2">{generatedKey}</span>
                  <button
                    onClick={handleCopyKey}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
