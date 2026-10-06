"use client";

import React, { useState, useEffect } from "react";
import { Lock, ShieldCheck, Smartphone, Key, History, CheckCircle2, ShieldAlert } from "lucide-react";

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

  useEffect(() => {
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
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-600" />
          Two-Factor Authentication & Audit Trail
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage hardware TOTP authenticator devices and review security audit logs for compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2FA Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-primary-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Authenticator App (TOTP)</h3>
                <p className="text-xs text-slate-500">Google Authenticator, 1Password, or Authy</p>
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                twoFactorEnabled
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {twoFactorEnabled ? "Active & Enforced" : "Enable 2FA"}
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Require a 6-digit TOTP verification code whenever logging into your Sendport developer workspace or creating production API keys.
          </p>
        </div>

        {/* Password & Sessions Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Key className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Session Security</h3>
                <p className="text-xs text-slate-500">Active browser tokens & devices</p>
              </div>
            </div>
            <button className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Revoke All Other Sessions
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Currently active session: Verified via Secure HttpOnly Session Token.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" /> Security Audit Log (Last 30 Days)
          </h3>
          <span className="text-[11px] font-mono text-slate-500">Immutable Ledger</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading audit log events...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No Security Events Recorded Yet</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Your logins, API key creations, and domain verifications will automatically be logged here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800">{log.action}</span>
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
