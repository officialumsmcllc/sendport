"use client";

import React, { useState } from "react";
import { Server, Copy, Check, ShieldCheck, Terminal, Globe } from "lucide-react";

export default function SmtpPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const smtpDetails = [
    { label: "SMTP Host", value: "smtp.getsendport.com", key: "host" },
    { label: "Port (TLS / STARTTLS)", value: "587", key: "port587" },
    { label: "Port (SSL)", value: "465", key: "port465" },
    { label: "Username", value: "api", key: "user" },
    { label: "Password", value: "Your active API Key (sk_live_...)", key: "pass" },
    { label: "Authentication", value: "PLAIN or LOGIN", key: "auth" },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">SMTP Relay Credentials</h1>
        <p className="text-sm text-slate-500">
          Connect Sendport with WordPress, WooCommerce, Laravel, Ghost, or any application using standard SMTP.
        </p>
      </div>

      {/* CREDENTIALS CARD */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 text-xs text-slate-500 font-semibold">
          <Server className="w-4 h-4 text-primary-600" />
          <span>Connection Parameters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {smtpDetails.map((item) => (
            <div key={item.key} className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">{item.label}</span>
                <span className="font-mono text-xs font-bold text-slate-900 mt-0.5 block">{item.value}</span>
              </div>
              <button
                onClick={() => handleCopy(item.value, item.key)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-sm"
                title="Copy"
              >
                {copiedField === item.key ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* INTEGRATION EXAMPLES */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Quick Integration Snippets</h3>

        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-1">Laravel (.env)</span>
            <pre className="p-3 rounded-xl bg-slate-900 text-white font-mono text-xs overflow-x-auto leading-relaxed">
{`MAIL_MAILER=smtp
MAIL_HOST=smtp.getsendport.com
MAIL_PORT=587
MAIL_USERNAME=api
MAIL_PASSWORD=sk_live_your_api_key_here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="hello@yourdomain.com"
MAIL_FROM_NAME="Your Company"`}
            </pre>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-1">WordPress / WP Mail SMTP</span>
            <p className="text-xs text-slate-500">
              Select <strong>&quot;Other SMTP&quot;</strong>, set Host to <code>smtp.getsendport.com</code>, Port to <code>587</code>, Encryption to <code>TLS</code>, Username to <code>api</code>, and Password to your Sendport API Key.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
