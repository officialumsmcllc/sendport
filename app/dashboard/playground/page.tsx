"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Terminal,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Key,
  Globe,
  Code2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  token?: string;
  scope?: string;
}

interface DomainItem {
  id: string;
  name: string;
  status: string;
}

const EMAIL_TEMPLATES = [
  {
    id: "welcome",
    name: "🚀 Welcome Onboarding",
    subject: "Welcome to Sendport — Let's build something fast!",
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
  <div style="margin-bottom: 24px;">
    <span style="background: #eef2ff; color: #4f46e5; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">High-Speed Email</span>
  </div>
  <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 16px 0;">Welcome to Sendport! 🚀</h1>
  <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
    Your email infrastructure is now supercharged with sub-10ms dispatch latency, automated DKIM 2048-bit rotation, and 99.98% deliverability.
  </p>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
    <p style="margin: 0; font-family: monospace; font-size: 13px; color: #0f172a;">⚡ Dispatched via Sendport In-Browser Interactive Playground</p>
  </div>
  <a href="https://getsendport.com/docs" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px;">Explore API Docs →</a>
</div>`,
  },
  {
    id: "otp",
    name: "🔐 Security OTP Code",
    subject: "Your Sendport Verification Code: 849201",
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;">
  <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-bottom: 8px;">Verify Your Identity</h2>
  <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Enter this 6-digit code to securely confirm your authentication request.</p>
  <div style="background: #f1f5f9; padding: 18px 32px; border-radius: 12px; display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: 900; color: #0f172a; font-family: monospace; border: 1px dashed #cbd5e1;">
    849201
  </div>
  <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">Code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
</div>`,
  },
  {
    id: "receipt",
    name: "🧾 Payment Receipt",
    subject: "Receipt for Sendport Scale Plan ($19.00 USD)",
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
  <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px;">
    <div>
      <h3 style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 800;">Payment Confirmed ✅</h3>
      <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">Invoice #INV-2026-0894</p>
    </div>
    <div style="text-align: right;">
      <span style="font-size: 20px; font-weight: 800; color: #059669;">$19.00</span>
    </div>
  </div>
  <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155; margin-bottom: 20px;">
    <tr><td style="padding: 8px 0; border-bottom: 1px solid #f8fafc;">Plan</td><td style="text-align: right; font-weight: 600;">Scale (150,000 Emails/mo)</td></tr>
    <tr><td style="padding: 8px 0; border-bottom: 1px solid #f8fafc;">Status</td><td style="text-align: right; color: #059669; font-weight: 600;">Paid</td></tr>
    <tr><td style="padding: 8px 0;">Method</td><td style="text-align: right; font-weight: 600;">Automated Billing</td></tr>
  </table>
  <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Thank you for using Sendport.</p>
</div>`,
  },
];

export default function PlaygroundPage() {
  const [from, setFrom] = useState("Muhammad Umar <hello@getsendport.com>");
  const [to, setTo] = useState("delivered@getsendport.com");
  const [subject, setSubject] = useState("Live Test from Sendport Playground 🚀");
  const [html, setHtml] = useState(EMAIL_TEMPLATES[0].html);
  const [selectedTemplate, setSelectedTemplate] = useState("welcome");

  // Auth & Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("session");
  const [customKeyInput, setCustomKeyInput] = useState<string>("");
  const [domains, setDomains] = useState<DomainItem[]>([]);

  // Sending & Response
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"response" | "curl" | "nodejs" | "python">("response");
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    // 1. Fetch user info to auto-fill name & recipient
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((userData) => {
        const user = userData?.user;
        const displayName = user?.name || "Muhammad Umar";
        if (user?.email) {
          setTo(user.email);
        }

        // 2. Fetch Verified Domains to auto-fill From
        fetch("/api/v1/domains")
          .then((res) => res.json())
          .then((domainData) => {
            if (domainData.domains && domainData.domains.length > 0) {
              setDomains(domainData.domains);
              const verified = domainData.domains.find((d: DomainItem) => d.status === "VERIFIED");
              if (verified) {
                setFrom(`${displayName} <hello@${verified.name}>`);
              } else {
                setFrom(`${displayName} <hello@${domainData.domains[0].name}>`);
              }
            } else {
              setFrom(`${displayName} <hello@getsendport.com>`);
            }
          })
          .catch((err) => console.error("Could not fetch domains:", err));
      })
      .catch((err) => console.error("Could not fetch user:", err));

    // 3. Fetch available API Keys
    fetch("/api/v1/api-keys")
      .then((res) => res.json())
      .then((data) => {
        if (data.apiKeys && data.apiKeys.length > 0) {
          setApiKeys(data.apiKeys);
          const firstKey = data.apiKeys[0];
          setSelectedKey(firstKey.token || firstKey.keyPrefix || "session");
        }
      })
      .catch((err) => console.error("Could not fetch API keys:", err));
  }, []);


  const handleTemplateChange = (templateId: string) => {
    const t = EMAIL_TEMPLATES.find((item) => item.id === templateId);
    if (t) {
      setSelectedTemplate(templateId);
      setSubject(t.subject);
      setHtml(t.html);
    }
  };

  const getEffectiveApiKey = () => {
    if (selectedKey === "custom") return customKeyInput.trim();
    if (selectedKey === "session") return "";
    return selectedKey;
  };

  const handleSend = async () => {
    setSending(true);
    setResponse(null);
    const startTime = performance.now();

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const keyToUse = getEffectiveApiKey();
      if (keyToUse) {
        headers["Authorization"] = `Bearer ${keyToUse}`;
      }

      const res = await fetch("/api/v1/emails/send", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
          track_opens: true,
          track_clicks: true,
        }),
      });

      const latency = Math.round(performance.now() - startTime);
      const json = await res.json();

      setResponse({
        status: res.status,
        statusText: res.statusText || (res.status === 200 ? "OK" : "Error"),
        latency_ms: latency,
        data: json,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      const latency = Math.round(performance.now() - startTime);
      setResponse({
        status: 500,
        statusText: "Network Error",
        latency_ms: latency,
        data: { error: err.message || "Failed to communicate with API server" },
        timestamp: new Date().toISOString(),
      });
    } finally {
      setSending(false);
    }
  };

  const generateCurlCode = () => {
    const key = getEffectiveApiKey() || "sk_live_your_api_key_here";
    return `curl -X POST "https://getsendport.com/api/v1/emails/send" \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "${from.replace(/"/g, '\\"')}",
    "to": ["${to}"],
    "subject": "${subject.replace(/"/g, '\\"')}",
    "html": "${html.replace(/\n/g, "").replace(/"/g, '\\"')}",
    "track_opens": true,
    "track_clicks": true
  }'`;
  };

  const generateNodeCode = () => {
    const key = getEffectiveApiKey() || "sk_live_your_api_key_here";
    return `import { Sendport } from "sendport";

const sendport = new Sendport("${key}");

async function main() {
  const data = await sendport.emails.send({
    from: "${from}",
    to: ["${to}"],
    subject: "${subject}",
    html: "${html.replace(/\n/g, "\\n").replace(/"/g, '\\"')}",
  });

  console.log("Dispatched:", data);
}

main();`;
  };

  const generatePythonCode = () => {
    const key = getEffectiveApiKey() || "sk_live_your_api_key_here";
    return `import requests

url = "https://getsendport.com/api/v1/emails/send"
headers = {
    "Authorization": "Bearer ${key}",
    "Content-Type": "application/json"
}

payload = {
    "from": "${from}",
    "to": ["${to}"],
    "subject": "${subject}",
    "html": "${html.replace(/\n/g, "\\n").replace(/"/g, '\\"')}",
    "track_opens": True,
    "track_clicks": True
}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code, response.json())`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Send className="w-6 h-6 text-primary-600" />
            API Playground
          </h1>
          <p className="text-sm text-slate-500">
            Dispatch real test emails, experiment with HTML templates, and inspect raw HTTP API responses in sub-10ms.
          </p>
        </div>

        {/* AUTH SELECTOR */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 px-2 font-semibold text-slate-600">
            <Key className="w-3.5 h-3.5 text-primary-600" />
            <span>Auth:</span>
          </div>

          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="session">⚡ Active Dashboard Session (Automatic)</option>
            {apiKeys.map((k) => (
              <option key={k.id} value={k.token || k.keyPrefix}>
                🔑 {k.name} ({k.keyPrefix})
              </option>
            ))}
            <option value="custom">✏️ Enter Custom sk_live_... key</option>
          </select>

          {selectedKey === "custom" && (
            <input
              type="password"
              placeholder="sk_live_..."
              value={customKeyInput}
              onChange={(e) => setCustomKeyInput(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-800 outline-none w-36"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COMPOSE PANEL (7 COLS) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Email Payload Builder
            </h3>

            {/* PRESET TEMPLATE SELECTOR */}
            <div className="flex items-center gap-1">
              {EMAIL_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    selectedTemplate === t.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t.name.split(" ")[0]} {t.name.split(" ")[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* FROM */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">From (Sender)</label>
                {domains.length > 0 && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-500" />
                    {domains.filter((d) => d.status === "VERIFIED").length} Verified Domain(s)
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Muhammad Umar <hello@getsendport.com>"
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              {domains.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-400 self-center">Quick pick:</span>
                  <button
                    type="button"
                    onClick={() => setFrom("Sendport Demo <hello@getsendport.com>")}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
                  >
                    hello@getsendport.com (Sandbox)
                  </button>
                  {domains
                    .filter((d) => d.status === "VERIFIED")
                    .map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setFrom(`Support <hello@${d.name}>`)}
                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-mono flex items-center gap-1"
                      >
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                        hello@{d.name}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* TO */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">To (Recipient)</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="delivered@getsendport.com"
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {/* SUBJECT */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email Subject..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {/* HTML BODY */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">HTML Content</label>
                <span className="text-[11px] font-mono text-slate-400">{html.length} chars</span>
              </div>
              <textarea
                rows={7}
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 font-mono text-[11px] text-slate-800 leading-relaxed focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {sending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-400" />
                Dispatching through SMTP Relays...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                Send Test Email
              </>
            )}
          </button>
        </div>

        {/* RESPONSE & CODE INSPECTOR (6 COLS) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-card flex flex-col justify-between text-white font-mono">
          <div>
            {/* TABS */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("response")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === "response"
                      ? "bg-slate-800 text-emerald-400 border border-slate-700"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Live Response
                </button>
                <button
                  onClick={() => setActiveTab("curl")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === "curl"
                      ? "bg-slate-800 text-blue-400 border border-slate-700"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveTab("nodejs")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === "nodejs"
                      ? "bg-slate-800 text-amber-400 border border-slate-700"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Node.js
                </button>
                <button
                  onClick={() => setActiveTab("python")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === "python"
                      ? "bg-slate-800 text-cyan-400 border border-slate-700"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Python
                </button>
              </div>

              {/* STATUS BADGE */}
              {activeTab === "response" && response && (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                      response.status === 200
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-slate-400 text-[11px]">{response.latency_ms}ms</span>
                </div>
              )}

              {activeTab !== "response" && (
                <button
                  onClick={() =>
                    handleCopy(
                      activeTab === "curl"
                        ? generateCurlCode()
                        : activeTab === "nodejs"
                        ? generateNodeCode()
                        : generatePythonCode()
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? "Copied" : "Copy Code"}
                </button>
              )}
            </div>

            {/* CONTENT VIEWER */}
            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800/80 overflow-x-auto max-h-[420px] overflow-y-auto">
              {activeTab === "response" && (
                <pre className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {response
                    ? JSON.stringify(response.data, null, 2)
                    : `// Click "Send Test Email" to dispatch payload\n//\n// Expected Live 200 OK Response:\n{\n  "id": "msg_98a71f04b8",\n  "from": "${from}",\n  "to": ["${to}"],\n  "status": "delivered",\n  "createdAt": "${new Date().toISOString()}"\n}`}
                </pre>
              )}

              {activeTab === "curl" && (
                <pre className="text-xs text-blue-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {generateCurlCode()}
                </pre>
              )}

              {activeTab === "nodejs" && (
                <pre className="text-xs text-amber-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {generateNodeCode()}
                </pre>
              )}

              {activeTab === "python" && (
                <pre className="text-xs text-cyan-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {generatePythonCode()}
                </pre>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              POST https://getsendport.com/api/v1/emails/send
            </span>
            <span className="text-slate-500 font-mono">
              Auth: {selectedKey === "session" ? "Cookie Session" : selectedKey.substring(0, 16) + "..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
