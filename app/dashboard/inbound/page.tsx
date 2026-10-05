"use client";

import React, { useState } from "react";
import { Inbox, Webhook, Plus, Copy, Check, ArrowRight, ShieldCheck } from "lucide-react";

export default function InboundPage() {
  const [inboundDomain, setInboundDomain] = useState("inbound.getsendport.com");
  const [webhookUrl, setWebhookUrl] = useState("https://myapp.com/api/webhooks/incoming-email");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`MX 10 ${inboundDomain}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Inbound Email Routing</h1>
        <p className="text-sm text-slate-500">
          Receive incoming emails sent to your domain, automatically parse the payload (text, HTML, attachments), and forward JSON to your webhook.
        </p>
      </div>

      {/* MX INSTRUCTIONS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Inbox className="w-4 h-4 text-primary-600" />
          Step 1: Point your Inbound MX Record
        </h3>
        <p className="text-xs text-slate-600">
          Add the following MX record to your custom domain or subdomain (e.g. <code>reply.yourcompany.com</code>):
        </p>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between font-mono text-xs">
          <div>
            <span className="text-slate-500">Type:</span> <strong>MX</strong> •{" "}
            <span className="text-slate-500">Priority:</span> <strong>10</strong> •{" "}
            <span className="text-slate-500">Host:</span> <strong>{inboundDomain}</strong>
          </div>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* WEBHOOK FORWARDER */}
      <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Webhook className="w-4 h-4 text-primary-600" />
          Step 2: Forwarding Destination Webhook URL
        </h3>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Webhook Target Endpoint (POST)</label>
          <input
            type="url"
            required
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Webhook endpoint updated!
            </span>
          ) : (
            <span className="text-xs text-slate-400">Payload signed with HMAC-SHA256 signature.</span>
          )}
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm"
          >
            Save Webhook Route
          </button>
        </div>
      </form>

      {/* SAMPLE PAYLOAD */}
      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white font-mono shadow-card space-y-2">
        <span className="text-xs text-slate-400 block font-sans font-bold">Sample Parsed JSON Payload</span>
        <pre className="text-xs text-slate-300 leading-relaxed overflow-x-auto">
{`{
  "from": "user@clientcompany.com",
  "to": ["support@yourdomain.com"],
  "subject": "Re: Ticket #8942 inquiry",
  "text": "Thank you for the quick reply! Everything is resolved.",
  "html": "<p>Thank you for the quick reply! Everything is resolved.</p>",
  "attachments": [],
  "headers": {
    "Message-ID": "<abc@clientcompany.com>",
    "Date": "2026-10-05T03:30:00Z"
  }
}`}
        </pre>
      </div>
    </div>
  );
}
