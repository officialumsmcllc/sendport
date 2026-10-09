"use client";

import React, { useState, useEffect } from "react";
import { Inbox, Webhook, Plus, Copy, Check, ArrowRight, ShieldCheck, RefreshCw, Send, AlertCircle, Globe } from "lucide-react";

export default function InboundPage() {
  const [inboundDomain, setInboundDomain] = useState("inbound.getsendport.com");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    statusCode: number;
    latencyMs: number;
    responseSummary?: string;
  } | null>(null);
  const [domains, setDomains] = useState<Array<{ id: string; name: string; isMxValid: boolean }>>([]);

  const fetchInboundSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/inbound");
      if (res.ok) {
        const data = await res.json();
        if (data.webhook) {
          setWebhookUrl(data.webhook.url || "");
          setWebhookSecret(data.webhook.secret || null);
        }
        if (data.domains && data.domains.length > 0) {
          setDomains(data.domains);
          setInboundDomain(`inbound.${data.domains[0].name}`);
        }
      }
    } catch (err) {
      console.error("Failed to fetch inbound settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInboundSettings();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(`MX 10 ${inboundDomain}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySecret = () => {
    if (!webhookSecret) return;
    navigator.clipboard.writeText(webhookSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;

    try {
      setSaving(true);
      const res = await fetch("/api/v1/inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setWebhookSecret(data.webhook.secret);
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      } else {
        alert("Failed to save inbound webhook URL");
      }
    } catch {
      alert("Network error saving webhook URL");
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      alert("Please enter a webhook URL first");
      return;
    }
    try {
      setTesting(true);
      setTestResult(null);
      const res = await fetch("/api/v1/inbound/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl.trim() }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({
        success: false,
        statusCode: 500,
        latencyMs: 0,
        responseSummary: "Failed to dispatch request to webhook URL",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Inbox className="w-6 h-6 text-primary-600" />
          Inbound Email Routing &amp; Webhook Engine
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Receive incoming emails sent to your domain, automatically parse the payload (text, HTML, attachments), and forward JSON to your webhook.
        </p>
      </div>

      {/* MX INSTRUCTIONS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary-600" />
            Step 1: Point your Inbound MX Record
          </h3>
          {domains.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Domain:</span>
              <select
                onChange={(e) => setInboundDomain(`inbound.${e.target.value}`)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none"
              >
                {domains.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600">
          Add the following MX record to your DNS provider (Cloudflare, Namecheap, Route 53) to receive incoming emails:
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
          Step 2: Forwarding Destination Webhook URL (PostgreSQL Backed)
        </h3>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Webhook Target Endpoint (POST)</label>
          <input
            type="url"
            required
            placeholder="https://yourdomain.com/api/webhooks/incoming-email"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {webhookSecret && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block font-sans font-semibold">HMAC Signature Secret:</span>
              <span className="text-slate-800 font-bold">{webhookSecret}</span>
            </div>
            <button
              type="button"
              onClick={handleCopySecret}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-sm"
              title="Copy Secret"
            >
              {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* TEST RESULT FEEDBACK */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
              testResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>
                {testResult.success
                  ? `Webhook responded with HTTP ${testResult.statusCode} OK in ${testResult.latencyMs}ms!`
                  : `Webhook failed with HTTP ${testResult.statusCode} (${testResult.responseSummary || "Error"})`}
              </span>
            </div>
            <span className="font-mono text-[11px]">Logged in WebhookDeliveryLog</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {saved ? (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Webhook endpoint saved in PostgreSQL database!
            </span>
          ) : (
            <span className="text-xs text-slate-400">Payload signed with HMAC-SHA256 signature in production.</span>
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={testing || !webhookUrl}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {testing ? "Testing URL..." : "Send Test Ping"}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm disabled:opacity-50"
            >
              {saving ? "Saving to DB..." : "Save Webhook Route"}
            </button>
          </div>
        </div>
      </form>

      {/* SAMPLE PAYLOAD */}
      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white font-mono shadow-card space-y-2">
        <span className="text-xs text-slate-400 block font-sans font-bold">Sample Parsed JSON Payload Forwarded to Webhook</span>
        <pre className="text-xs text-slate-300 leading-relaxed overflow-x-auto">
{`{
  "event": "inbound.email",
  "from": "user@clientcompany.com",
  "to": ["support@${domains[0]?.name || "yourdomain.com"}"],
  "subject": "Re: Inquiry #8942",
  "text": "Thank you for the quick reply! Everything is resolved.",
  "html": "<p>Thank you for the quick reply! Everything is resolved.</p>",
  "messageId": "msg_89f41b2c",
  "attachments": [],
  "timestamp": "2026-10-09T18:30:00Z"
}`}
        </pre>
      </div>
    </div>
  );
}
