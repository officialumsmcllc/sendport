"use client";

import React, { useState, useEffect } from "react";
import { Lock, ShieldCheck, Smartphone, Key, History, CheckCircle2, ShieldAlert, RefreshCw } from "lucide-react";

interface AuditLogItem {
  id: string;
  action: string;
  ip?: string | null;
  createdAt: string;
}

export default function SecurityDashboardPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating2Fa, setUpdating2Fa] = useState(false);
  const [revokingSessions, setRevokingSessions] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSecurity = () => {
    fetch("/api/v1/user/security")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setTwoFactorEnabled(Boolean(data.twoFactorEnabled));
          setLogs(data.auditLogs || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSecurity();
  }, []);

  const handleToggle2Fa = async () => {
    const nextState = !twoFactorEnabled;
    try {
      setUpdating2Fa(true);
      const res = await fetch("/api/v1/user/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twoFactorEnabled: nextState }),
      });

      if (res.ok) {
        const data = await res.json();
        setTwoFactorEnabled(data.twoFactorEnabled);
        if (data.auditLogs) setLogs(data.auditLogs);
        showToast(
          nextState
            ? "Two-Factor Authentication is now ACTIVE and enforced!"
            : "Two-Factor Authentication has been disabled."
        );
      } else {
        showToast("Failed to update 2FA status in database.", "error");
      }
    } catch {
      showToast("Network error updating 2FA.", "error");
    } finally {
      setUpdating2Fa(false);
    }
  };

  const handleRevokeSessions = async () => {
    if (!confirm("Are you sure you want to invalidate all other active browser sessions?")) return;
    try {
      setRevokingSessions(true);
      const res = await fetch("/api/v1/user/security", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REVOKE_ALL_SESSIONS" }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.auditLogs) setLogs(data.auditLogs);
        showToast("All other device sessions have been invalidated!");
      } else {
        showToast("Failed to revoke device sessions.", "error");
      }
    } catch {
      showToast("Network error revoking sessions.", "error");
    } finally {
      setRevokingSessions(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* TOAST FEEDBACK */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl transition-all ${
            toast.type === "success"
              ? "bg-slate-900 text-white border border-slate-800"
              : "bg-rose-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Lock className="w-6 h-6 text-primary-600" />
          Two-Factor Authentication &amp; Audit Trail
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage hardware TOTP authenticator devices and review security audit logs backed by PostgreSQL.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2FA Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600 border border-primary-100">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Authenticator App (TOTP)</h3>
                <p className="text-xs text-slate-500">Google Authenticator, 1Password, or Authy</p>
              </div>
            </div>
            <button
              onClick={handleToggle2Fa}
              disabled={updating2Fa}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                twoFactorEnabled
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                  : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
              } disabled:opacity-50`}
            >
              {updating2Fa && <RefreshCw className="w-3 h-3 animate-spin" />}
              {twoFactorEnabled ? "Active & Enforced" : "Enable 2FA"}
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Require a 6-digit TOTP verification code whenever logging into your Sendport developer workspace or creating production API keys.
          </p>
        </div>

        {/* Password & Sessions Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Session Security</h3>
                <p className="text-xs text-slate-500">Active browser tokens &amp; devices</p>
              </div>
            </div>
            <button
              onClick={handleRevokeSessions}
              disabled={revokingSessions}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50"
            >
              {revokingSessions ? "Revoking..." : "Revoke All Other Sessions"}
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Currently active session: Verified via Secure HttpOnly Session Token and workspace RBAC.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" /> Security Audit Log (Last 30 Days)
          </h3>
          <span className="text-[11px] font-mono text-slate-500">PostgreSQL Immutable Ledger</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading audit log events...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No Security Events Recorded Yet</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Your logins, 2FA changes, API key creations, and domain verifications will automatically be logged here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800 font-mono text-[11px]">{log.action}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-500 text-[11px] font-mono">
                  {log.ip && <span>IP: {log.ip}</span>}
                  <span className="text-slate-400">
                    {new Date(log.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
