"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Terminal,
  Copy,
  Check,
  Code2,
  Key,
  ShieldCheck,
  Send,
  Globe,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function DocsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<"curl" | "node" | "python" | "go">("curl");

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const curlExample = `curl -X POST https://api.getsendport.com/v1/emails \\
  -H "Authorization: Bearer sp_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "Acme <hello@yourdomain.com>",
    "to": ["alex@example.com"],
    "subject": "Welcome to Acme SaaS",
    "html": "<strong>Your account has been activated!</strong>",
    "trackOpens": true,
    "trackClicks": true
  }'`;

  const nodeExample = `import { Sendport } from 'sendport';

const sendport = new Sendport({ apiKey: process.env.SENDPORT_API_KEY });

const { data, error } = await sendport.emails.send({
  from: 'Acme <hello@yourdomain.com>',
  to: ['alex@example.com'],
  subject: 'Welcome to Acme SaaS',
  html: '<strong>Your account has been activated!</strong>',
  tags: [
    { name: 'category', value: 'onboarding' }
  ]
});

console.log('Dispatched Message ID:', data.id);`;

  const pythonExample = `import sendport

client = sendport.Client(api_key="sp_live_your_api_key")

response = client.emails.send({
    "from": "Acme <hello@yourdomain.com>",
    "to": ["alex@example.com"],
    "subject": "Welcome to Acme SaaS",
    "html": "<strong>Your account has been activated!</strong>"
})

print("Message status:", response["status"])`;

  const goExample = `package main

import (
  "context"
  "fmt"
  "github.com/sendport/sendport-go"
)

func main() {
  client := sendport.NewClient("sp_live_your_api_key")
  
  params := &sendport.SendEmailRequest{
    From:    "Acme <hello@yourdomain.com>",
    To:      []string{"alex@example.com"},
    Subject: "Welcome to Acme SaaS",
    Html:    "<strong>Your account has been activated!</strong>",
  }
  
  res, err := client.Emails.Send(context.Background(), params)
  if err != nil {
    panic(err)
  }
  fmt.Println("Message ID:", res.Id)
}`;

  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-slate-800/80 bg-slate-950/40 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-400 mb-3">
              <BookOpen className="w-4 h-4" /> Developer Documentation & Reference
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Sendport REST API v1
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Dispatch transactional & marketing emails, manage DNS records, check links, and configure webhooks with predictable JSON responses.
            </p>
          </div>
        </section>

        {/* Documentation Content */}
        <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Table of contents sidebar */}
            <div className="hidden lg:block lg:col-span-3 space-y-6">
              <div className="sticky top-24 space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-2">Getting Started</h4>
                  <ul className="space-y-1.5 text-slate-400">
                    <li><a href="#quickstart" className="hover:text-white transition-colors">Quickstart (5 min)</a></li>
                    <li><a href="#authentication" className="hover:text-white transition-colors">Authentication</a></li>
                    <li><a href="#base-url" className="hover:text-white transition-colors">Base URL & Versioning</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-2">Core Endpoints</h4>
                  <ul className="space-y-1.5 text-slate-400">
                    <li><a href="#send-email" className="hover:text-white transition-colors">POST /v1/emails</a></li>
                    <li><a href="#domains-api" className="hover:text-white transition-colors">POST /v1/domains/verify</a></li>
                    <li><a href="#audiences-api" className="hover:text-white transition-colors">POST /v1/audiences</a></li>
                    <li><a href="#link-checker-api" className="hover:text-white transition-colors">POST /v1/tools/link-checker</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-2">Integration SDKs</h4>
                  <ul className="space-y-1.5 text-slate-400">
                    <li><span className="text-emerald-400">Node.js / TypeScript</span></li>
                    <li><span className="text-emerald-400">Python 3.8+</span></li>
                    <li><span className="text-emerald-400">Go 1.18+</span></li>
                    <li><span className="text-emerald-400">PHP / Laravel</span></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Main Documentation Body */}
            <div className="lg:col-span-9 space-y-12">
              {/* Quickstart */}
              <div id="quickstart" className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary-400" /> Quickstart: Dispatch Your First Email
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Send your first email in under 30 seconds using standard cURL or your favorite language SDK.
                </p>

                {/* Code tabs */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-2">
                    <div className="flex items-center gap-2">
                      {(["curl", "node", "python", "go"] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setActiveLang(lang)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                            activeLang === lang
                              ? "bg-white text-black shadow-sm"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const code =
                          activeLang === "curl"
                            ? curlExample
                            : activeLang === "node"
                            ? nodeExample
                            : activeLang === "python"
                            ? pythonExample
                            : goExample;
                        copyCode(activeLang, code);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1 font-mono"
                    >
                      {copiedId === activeLang ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === activeLang ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre className="p-5 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed bg-[#06080e]">
                    <code>
                      {activeLang === "curl" && curlExample}
                      {activeLang === "node" && nodeExample}
                      {activeLang === "python" && pythonExample}
                      {activeLang === "go" && goExample}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Authentication */}
              <div id="authentication" className="space-y-4 pt-6 border-t border-slate-800/80">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" /> Authentication
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Authenticate your requests by including your secret API key in the <code className="text-primary-300 font-mono">Authorization: Bearer</code> header. You can generate new keys with full or sending-only scopes in your Sendport Dashboard.
                </p>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 font-mono text-xs text-slate-300 flex items-center justify-between">
                  <span>Authorization: Bearer sp_live_9a7f82b1c4e6...</span>
                  <Link href="/dashboard/api-keys" className="text-primary-400 text-[11px] hover:underline flex items-center gap-1 font-sans">
                    Generate Key <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Endpoints Table */}
              <div id="send-email" className="space-y-4 pt-6 border-t border-slate-800/80">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" /> Key Endpoints
                </h2>
                <div className="space-y-3">
                  {[
                    { method: "POST", path: "/v1/emails", desc: "Dispatch single or batched emails with HTML, React, or plaintext" },
                    { method: "POST", path: "/v1/audiences", desc: "Create an audience and import subscribers via bulk JSON" },
                    { method: "POST", path: "/v1/tools/link-checker", desc: "Pre-flight scan all URLs inside email HTML for 404s and phishing flags" },
                    { method: "POST", path: "/v1/domains/verify", desc: "Trigger instant DNS lookup to verify 2048-bit RSA DKIM & SPF records" },
                    { method: "GET", path: "/v1/usage", desc: "Retrieve active plan quota, daily limit, and total emails sent" },
                  ].map((ep) => (
                    <div key={ep.path} className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-extrabold ${ep.method === "POST" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-sky-500/20 text-sky-400 border border-sky-500/30"}`}>
                          {ep.method}
                        </span>
                        <code className="text-xs font-mono text-white font-bold">{ep.path}</code>
                      </div>
                      <span className="text-xs text-slate-400">{ep.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Playground CTA */}
              <div className="p-6 rounded-2xl border border-primary-500/30 bg-gradient-to-r from-primary-950/40 to-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-400" /> Try It in the Interactive Playground
                  </h3>
                  <p className="text-xs text-slate-400">
                    Send test emails right inside your browser without touching code.
                  </p>
                </div>
                <Link
                  href="/dashboard/playground"
                  className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-slate-200 transition-all shrink-0"
                >
                  Open Playground
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer dark={true} />
    </div>
  );
}
