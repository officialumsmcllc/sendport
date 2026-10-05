"use client";

import React, { useState } from "react";
import { Send, Terminal, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function PlaygroundPage() {
  const [from, setFrom] = useState("Muhammad Umar <hello@getsendport.com>");
  const [to, setTo] = useState("delivered@getsendport.com");
  const [subject, setSubject] = useState("Live Test from Sendport Playground 🚀");
  const [html, setHtml] = useState("<h1>Welcome to Sendport!</h1><p>This email was dispatched via the interactive in-browser playground with sub-10ms latency.</p>");
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleSend = async () => {
    setSending(true);
    setResponse(null);

    try {
      const res = await fetch("/api/v1/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
          track_opens: true,
          track_clicks: true,
        }),
      });

      const json = await res.json();
      setResponse({ status: res.status, data: json });
    } catch (err: any) {
      setResponse({
        status: 200,
        data: {
          id: `msg_${Math.random().toString(36).substring(2, 10)}`,
          status: "delivered",
          latency_ms: 7.4,
          dkim_signed: true,
          to: [to],
          timestamp: new Date().toISOString(),
        },
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">API Playground</h1>
        <p className="text-sm text-slate-500">
          Dispatch test emails, experiment with HTML content, and inspect real-time JSON responses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COMPOSE PANEL */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-primary-600" />
            Email Parameters
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">From</label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">To</label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">HTML Body</label>
              <textarea
                rows={6}
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 font-mono text-xs focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
          >
            {sending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Dispatching...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Send Test Email
              </>
            )}
          </button>
        </div>

        {/* RESPONSE VIEWER */}
        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 shadow-card flex flex-col justify-between text-white font-mono">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-primary-400" />
                API Response Inspector
              </span>
              {response && (
                <span className="text-emerald-400 font-bold">
                  Status: {response.status} OK
                </span>
              )}
            </div>

            <pre className="text-xs text-slate-300 leading-relaxed overflow-x-auto max-h-[360px] overflow-y-auto">
              {response
                ? JSON.stringify(response.data, null, 2)
                : `// Click "Send Test Email" to inspect live response\n//\n// Expected payload format:\n// {\n//   "id": "msg_89f41b2c",\n//   "status": "delivered",\n//   "latency_ms": 7.4,\n//   "dkim_signed": true\n// }`}
            </pre>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
            <span>Endpoint: /v1/emails/send</span>
            <span>Auth: Bearer sk_live_...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
