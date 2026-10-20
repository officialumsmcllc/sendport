"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";

export type Language =
  | "node"
  | "next"
  | "python"
  | "go"
  | "rust"
  | "php"
  | "ruby"
  | "curl"
  | "smtp";

export type Framework =
  | "Next.js"
  | "Node.js"
  | "Express"
  | "Hono"
  | "Remix"
  | "Nuxt"
  | "Bun"
  | "Astro";

export function CodePlayground() {
  const [activeLang, setActiveLang] = useState<Language>("curl");
  const [activeFramework, setActiveFramework] = useState<Framework>("Next.js");
  const [copied, setCopied] = useState(false);

  const frameworks: Framework[] = [
    "Next.js",
    "Node.js",
    "Express",
    "Hono",
    "Remix",
    "Nuxt",
    "Bun",
    "Astro",
  ];

  const languages: { id: Language; label: string; icon: string }[] = [
    { id: "curl", label: "cURL", icon: ">_" },
    { id: "node", label: "Node.js (Fetch)", icon: "JS" },
    { id: "next", label: "Next.js", icon: "▲" },
    { id: "python", label: "Python", icon: "Py" },
    { id: "go", label: "Go", icon: "Go" },
    { id: "php", label: "PHP", icon: "PHP" },
    { id: "ruby", label: "Ruby", icon: "Rb" },
    { id: "smtp", label: "SMTP Relay", icon: "✉" },
  ];

  const getCodeSnippet = (): string => {
    switch (activeLang) {
      case "curl":
        return `curl -X POST https://api.getsendport.com/v1/emails/send \\
  -H "Authorization: Bearer \${SENDPORT_API_KEY:-sk_live_your_api_key_here}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "Muhammad Umar <hello@getsendport.com>",
    "to": ["recipient@example.com"],
    "subject": "Sub-10ms Transactional Email",
    "html": "<h1>Hello from Sendport REST API</h1><p>High deliverability at scale.</p>",
    "track_opens": true,
    "track_clicks": true
  }'`;

      case "node":
        return `// Native fetch (Node.js 18+ / Zero dependencies)
const response = await fetch("https://api.getsendport.com/v1/emails/send", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.SENDPORT_API_KEY || 'sk_live_your_api_key_here'}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "Sendport <onboarding@getsendport.com>",
    to: ["alex@example.com"],
    subject: "Your 2FA Security Code: 849-204",
    html: "<strong>Your verification code is 849-204</strong> (expires in 10 mins)",
    track_opens: true,
  }),
});

const data = await response.json();
console.log("Delivered successfully:", data.id);`;

      case "next":
        return `// app/api/send/route.ts (Next.js 15 App Router)
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const res = await fetch('https://api.getsendport.com/v1/emails/send', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${process.env.SENDPORT_API_KEY || 'sk_live_your_api_key_here'}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Muhammad Umar <hello@getsendport.com>',
        to: ['client@example.com'],
        subject: 'Welcome to our platform 🚀',
        html: '<p>Welcome! High deliverability and sub-10ms dispatch.</p>',
        track_opens: true,
        track_clicks: true,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to dispatch email" }, { status: 500 });
  }
}`;

      case "python":
        return `import os
import requests

response = requests.post(
    "https://api.getsendport.com/v1/emails/send",
    headers={
        "Authorization": f"Bearer {os.environ.get('SENDPORT_API_KEY', 'sk_live_your_api_key_here')}",
        "Content-Type": "application/json",
    },
    json={
        "from": "Billing <invoices@getsendport.com>",
        "to": ["finance@example.com"],
        "subject": "Invoice #1049 for Cloud Services",
        "html": "<h1>Invoice Paid</h1><p>Amount: $249.00 USD</p>",
        "track_opens": True,
    },
)

print("Dispatched:", response.json())`;

      case "go":
        return `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

func main() {
	apiKey := os.Getenv("SENDPORT_API_KEY")
	if apiKey == "" {
		apiKey = "sk_live_your_api_key_here"
	}

	payload, _ := json.Marshal(map[string]interface{}{
		"from":    "Umar <support@getsendport.com>",
		"to":      []string{"user@example.com"},
		"subject": "Account Password Reset",
		"html":    "<p>Click here to reset your password securely.</p>",
	})

	req, _ := http.NewRequest("POST", "https://api.getsendport.com/v1/emails/send", bytes.NewBuffer(payload))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	fmt.Printf("Status: %s\\n", resp.Status)
}`;

      case "rust":
        return `// HTTP POST using standard reqwest
let client = reqwest::Client::new();
let res = client.post("https://api.getsendport.com/v1/emails/send")
    .bearer_auth(std::env::var("SENDPORT_API_KEY").unwrap_or("sk_live_your_api_key_here".into()))
    .json(&serde_json::json!({
        "from": "alerts@getsendport.com",
        "to": ["devops@example.com"],
        "subject": "Production Alert: High Traffic",
        "html": "<strong>Cluster status: Healthy</strong>"
    }))
    .send()
    .await?;`;

      case "php":
        return `<?php
$apiKey = getenv('SENDPORT_API_KEY') ?: 'sk_live_your_api_key_here';

$ch = curl_init('https://api.getsendport.com/v1/emails/send');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'from' => 'Muhammad Umar <hello@getsendport.com>',
        'to' => ['client@example.com'],
        'subject' => 'Order #9821 Confirmed',
        'html' => '<p>Thank you for your order! Your tracking number is SP-9842.</p>',
        'track_opens' => true
    ])
]);

$response = curl_exec($ch);
curl_close($ch);
echo "Response: " . $response;
?>`;

      case "ruby":
        return `require 'net/http'
require 'uri'
require 'json'

uri = URI.parse('https://api.getsendport.com/v1/emails/send')
req = Net::HTTP::Post.new(uri)
req['Authorization'] = "Bearer #{ENV['SENDPORT_API_KEY'] || 'sk_live_your_api_key_here'}"
req['Content-Type'] = 'application/json'
req.body = {
  from: 'Acme Team <team@getsendport.com>',
  to: ['founder@example.com'],
  subject: 'Welcome to Sendport',
  html: '<p>Lightning-fast delivery with 2048-bit DKIM.</p>'
}.to_json

res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
  http.request(req)
end

puts res.body`;

      case "smtp":
        return `# Standard SMTP Relay Configuration (WordPress / Laravel / Shopify)
Host:     smtp.getsendport.com
Port:     587 (TLS / STARTTLS) or 465 (SSL)
Username: api
Password: sk_live_your_api_key_here
Auth:     PLAIN / LOGIN

# Example PHPMailer / Laravel .env:
MAIL_MAILER=smtp
MAIL_HOST=smtp.getsendport.com
MAIL_PORT=587
MAIL_USERNAME=api
MAIL_PASSWORD=sk_live_your_api_key_here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="hello@getsendport.com"
MAIL_FROM_NAME="Sendport"`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-900/60 px-3.5 py-1 text-xs font-semibold text-slate-300 backdrop-blur mb-4">
          <Terminal className="w-3.5 h-3.5 text-primary-400" />
          <span>Integrate this morning in minutes</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Integrate <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">this morning</span>
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          A simple, high-speed REST API and SMTP relay so you can start sending emails in minutes. Fits directly into your stack using standard HTTP requests in any language.
        </p>
      </div>

      {/* Language Pills Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setActiveLang(lang.id)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border ${
              activeLang === lang.id
                ? "bg-slate-900 text-white border-slate-700 shadow-md ring-2 ring-primary-500/20 dark:bg-white dark:text-slate-950 dark:border-white"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            <span className="font-mono text-[11px] opacity-70">{lang.icon}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>

      {/* Code Window */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-3">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* Framework Pills */}
            <div className="hidden md:flex items-center gap-1 rounded-lg bg-slate-950/60 p-1 border border-slate-800/60">
              {frameworks.map((fw) => (
                <button
                  key={fw}
                  onClick={() => {
                    setActiveFramework(fw);
                    if (fw === "Next.js") setActiveLang("next");
                    else if (fw === "Node.js" || fw === "Express" || fw === "Hono" || fw === "Bun") setActiveLang("node");
                  }}
                  className={`rounded-md px-2.5 py-0.5 text-[11px] font-medium transition-all ${
                    activeFramework === fw
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {fw}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-6 font-mono text-xs sm:text-[13px] text-slate-200 overflow-x-auto leading-relaxed bg-slate-950">
          <pre className="text-slate-300">{getCodeSnippet()}</pre>
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800/60 bg-slate-950/90 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            HTTP 200 OK • Example response (API response time: ~8ms) • 2048-bit RSA DKIM Signed
          </span>
          <span className="text-slate-500">api.getsendport.com/v1/emails/send</span>
        </div>
      </div>
    </section>
  );
}
