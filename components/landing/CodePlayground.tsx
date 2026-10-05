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
  const [activeLang, setActiveLang] = useState<Language>("node");
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
    { id: "node", label: "Node.js", icon: "JS" },
    { id: "next", label: "Next.js", icon: "▲" },
    { id: "python", label: "Python", icon: "Py" },
    { id: "go", label: "Go", icon: "Go" },
    { id: "rust", label: "Rust", icon: "Rs" },
    { id: "php", label: "PHP", icon: "PHP" },
    { id: "ruby", label: "Ruby", icon: "Rb" },
    { id: "curl", label: "cURL", icon: ">_" },
    { id: "smtp", label: "SMTP", icon: "✉" },
  ];

  const getCodeSnippet = (): string => {
    switch (activeLang) {
      case "next":
        return `// app/api/send/route.ts (Next.js App Router)
import { Sendport } from 'sendport';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { NextResponse } from 'next/server';

const sendport = new Sendport(process.env.SENDPORT_API_KEY!);

export async function POST() {
  try {
    const data = await sendport.emails.send({
      from: 'Muhammad Umar <hello@getsendport.com>',
      to: ['client@targetdomain.com'],
      subject: 'Welcome to our platform 🚀',
      react: WelcomeEmail({ firstName: 'Steve' }),
      track_opens: true,
      track_clicks: true,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}`;

      case "node":
        return `import { Sendport } from 'sendport';

const sendport = new Sendport('sk_live_8f9a2b4c6e7d8f9a');

async function main() {
  const { data, error } = await sendport.emails.send({
    from: 'Sendport <onboarding@getsendport.com>',
    to: ['alex@company.com'],
    subject: 'Your 2FA Security Code: 849-204',
    html: '<strong>Your verification code is 849-204</strong> (expires in 10 mins)',
    headers: {
      'X-Entity-Ref-ID': 'auth_user_9921',
    },
  });

  if (error) {
    return console.error({ error });
  }

  console.log('Delivered successfully:', data.id);
}

main();`;

      case "python":
        return `import sendport

client = sendport.Client(api_key="sk_live_8f9a2b4c6e7d8f9a")

response = client.emails.send(
    params={
        "from": "Billing <invoices@getsendport.com>",
        "to": ["finance@enterprise.com"],
        "subject": "Invoice #1049 for Cloud Services",
        "html": "<h1>Invoice Paid</h1><p>Amount: $249.00 USD</p>",
        "tags": [
            {"name": "category", "value": "invoices"}
        ]
    }
)

print("Email dispatched with Message ID:", response["id"])`;

      case "go":
        return `package main

import (
	"context"
	"fmt"
	"github.com/sendport/sendport-go"
)

func main() {
	client := sendport.NewClient("sk_live_8f9a2b4c6e7d8f9a")

	params := &sendport.SendEmailRequest{
		From:    "Umar <support@getsendport.com>",
		To:      []string{"user@domain.com"},
		Subject: "Account Password Reset",
		Html:    "<p>Click here to reset your password securely.</p>",
	}

	sent, err := client.Emails.SendWithContext(context.Background(), params)
	if err != nil {
		panic(err)
	}

	fmt.Printf("Message ID: %s (Latency: 8.2ms)\n", sent.Id)
}`;

      case "rust":
        return `use sendport::{Sendport, CreateEmailOptions};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let sendport = Sendport::new("sk_live_8f9a2b4c6e7d8f9a");

    let email = CreateEmailOptions::new(
        "alerts@getsendport.com",
        vec!["devops@acme.corp"],
        "Production Alert: CPU Spike > 90%",
    ).with_html("<strong>Cluster node-east-1 load is 94%</strong>");

    let response = sendport.emails.send(email).await?;
    println!("Dispatched: {}", response.id);
    Ok(())
}`;

      case "php":
        return `<?php
require_once __DIR__ . '/vendor/autoload.php';

$sendport = new Sendport\\Client('sk_live_8f9a2b4c6e7d8f9a');

$result = $sendport->emails->send([
    'from' => 'Muhammad Umar <hello@getsendport.com>',
    'to' => ['client@targetdomain.com'],
    'subject' => 'Order #9821 Confirmed',
    'html' => '<p>Thank you for your order! Your tracking number is SP-9842.</p>',
    'track_opens' => true,
]);

echo "Dispatched with ID: " . $result->id;
?>`;

      case "ruby":
        return `require "sendport"

sendport = Sendport::Client.new(api_key: "sk_live_8f9a2b4c6e7d8f9a")

response = sendport.emails.send(
  from: "Acme Team <team@getsendport.com>",
  to: ["founder@startup.io"],
  subject: "Welcome to Sendport Ruby Gem",
  html: "<p>Lightning-fast delivery with 2048-bit DKIM.</p>"
)

puts "Delivered: #{response.id}"`;

      case "curl":
        return `curl -X POST https://api.getsendport.com/v1/emails/send \\
  -H "Authorization: Bearer sk_live_8f9a2b4c6e7d8f9a" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "Muhammad Umar <hello@getsendport.com>",
    "to": ["recipient@targetdomain.com"],
    "subject": "Sub-10ms Transactional Email",
    "html": "<h1>Hello from Sendport REST API</h1><p>High deliverability at scale.</p>",
    "track_opens": true,
    "track_clicks": true
  }'`;

      case "smtp":
        return `# Standard SMTP Relay Configuration (WordPress / Laravel / Shopify)
Host:     smtp.getsendport.com
Port:     587 (TLS / STARTTLS) or 465 (SSL)
Username: api
Password: sk_live_8f9a2b4c6e7d8f9a
Auth:     PLAIN / LOGIN

# Example PHPMailer / Laravel .env:
MAIL_MAILER=smtp
MAIL_HOST=smtp.getsendport.com
MAIL_PORT=587
MAIL_USERNAME=api
MAIL_PASSWORD=sk_live_8f9a2b4c6e7d8f9a
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
          A simple, elegant interface so you can start sending emails in minutes. It fits right into your code with SDKs for your favourite programming languages.
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
            HTTP 200 OK • Latency: 7.8ms • 2048-bit RSA DKIM Signed
          </span>
          <span className="text-slate-500">api.getsendport.com/v1/emails/send</span>
        </div>
      </div>
    </section>
  );
}
