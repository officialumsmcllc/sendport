"use client";

import React, { useState, useEffect } from "react";
import { Key, Plus, Copy, Check, Trash2, Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  scope: string;
  createdAt: string;
  lastUsedAt?: string | null;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState("FULL_ACCESS");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/api-keys");
      if (res.ok) {
        const data = await res.json();
        if (data.apiKeys) {
          setKeys(data.apiKeys);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim(), scope: newKeyScope }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedKey(data.token);
        setKeys((prev) => [
          {
            id: data.id,
            name: data.name,
            keyPrefix: data.keyPrefix,
            scope: data.scope,
            createdAt: data.created_at,
            lastUsedAt: null,
          },
          ...prev,
        ]);
        setNewKeyName("");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create API key.");
      }
    } catch {
      alert("Network error creating API key.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Applications using this key will immediately lose access.")) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/api-keys?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setKeys((prev) => prev.filter((k) => k.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to revoke key.");
      }
    } catch {
      alert("Network error revoking API key.");
    }
  };

  const handleCopyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      {/* KEYS TABLE OR EMPTY STATE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        {keys.length === 0 && !loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Key className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">No API Keys Generated Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create a secret API key to authenticate your REST API requests and SMTP relay connections from your web application.
            </p>
            <button
              onClick={() => {
                setGeneratedKey(null);
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Create Your First Key
            </button>
          </div>
        ) : (
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
                    <td className="px-5 py-4 font-semibold text-slate-900">{k.name}</td>
                    <td className="px-5 py-4 font-mono text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-200">
                        {k.keyPrefix}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-100">
                        <Shield className="w-3 h-3" /> {k.scope.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-medium">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "Never"}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            {!generatedKey ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Create New API Key</h3>
                  <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Key Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Production Backend, WordPress SMTP"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Scope</label>
                    <select
                      value={newKeyScope}
                      onChange={(e) => setNewKeyScope(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    >
                      <option value="FULL_ACCESS">Full Access (Sending + Domains + Templates)</option>
                      <option value="SEND_ONLY">Send Only (Strict SMTP & Transactional REST API)</option>
                      <option value="INBOUND_ONLY">Inbound Webhooks Only</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateKey}
                    disabled={submitting || !newKeyName.trim()}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50"
                  >
                    {submitting ? "Generating..." : "Generate Key"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3 text-center">
                  <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">API Key Generated!</h3>
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-left">
                    ⚠️ <strong>Save this key now!</strong> For security reasons, this key will never be shown again in full.
                  </p>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 border border-slate-200">
                    <input
                      type="text"
                      readOnly
                      value={generatedKey}
                      className="bg-transparent font-mono text-xs text-slate-900 flex-1 outline-none select-all"
                    />
                    <button
                      onClick={handleCopyKey}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1 shadow-sm"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
                  >
                    Done & Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
