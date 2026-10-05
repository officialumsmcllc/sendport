"use client";

import React, { useState } from "react";
import { ShieldCheck, Zap, Terminal, CheckCircle2, AlertTriangle, XCircle, Send, Webhook } from "lucide-react";

export function WebhookSimulator() {
  const [testEmail, setTestEmail] = useState("delivered@getsendport.com");
  const [activeTab, setActiveTab] = useState<"delivered" | "bounced" | "complained">("delivered");
  const [sentCount, setSentCount] = useState(4);

  const mockEvents = [
    {
      id: "evt_1",
      type: "Complained",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      time: "Just now",
      to: "olivia@gmail.com",
      feedback: "Spam mark",
      agent: "Gmail",
      os: "Windows",
      icon: AlertTriangle,
    },
    {
      id: "evt_2",
      type: "Bounced",
      color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      time: "12s ago",
      to: "liam@domain-invalid.org",
      feedback: "550 User not found",
      agent: "Outlook",
      os: "macOS",
      icon: XCircle,
    },
    {
      id: "evt_3",
      type: "Delivered",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      time: "45s ago",
      to: "sarah@techcorp.io",
      feedback: "250 2.0.0 OK",
      agent: "Apple Mail",
      os: "iOS",
      icon: CheckCircle2,
    },
    {
      id: "evt_4",
      type: "Opened",
      color: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      time: "2m ago",
      to: "michael@startup.co",
      feedback: "1x1 pixel rendered",
      agent: "Superhuman",
      os: "macOS",
      icon: Zap,
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-900/60 px-3.5 py-1 text-xs font-semibold text-slate-300 backdrop-blur mb-4">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Developer Tooling</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          First-class <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 bg-clip-text text-transparent">developer experience</span>
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          We are a team of engineers building tools for other engineers. Our goal is to create the email platform we always wished we had.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Test Mode Simulator */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  SANDBOX
                </span>
                <span className="text-sm font-semibold text-slate-200">Test Mode</span>
              </div>
              <span className="text-xs text-slate-500">No real emails sent</span>
            </div>

            {/* Test Email Selector */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Mock Send
                </span>
                <span className="text-xs font-mono text-slate-300">{testEmail}</span>
              </div>
              <button
                onClick={() => setSentCount((c) => c + 1)}
                className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-black hover:bg-slate-200 transition-all active:scale-95"
              >
                <Send className="w-3 h-3" />
                <span>Test</span>
              </button>
            </div>

            {/* Simulated HTTP Responses */}
            <div className="space-y-2 font-mono text-xs text-slate-400 bg-black/60 rounded-xl p-4 border border-slate-900">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-emerald-400 font-bold">HTTP 200</span>
                <span>&#123; &quot;id&quot;: &quot;msg_{Math.random().toString(36).substring(2, 10)}&quot;, &quot;status&quot;: &quot;delivered&quot; &#125;</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 opacity-80">
                <span className="text-emerald-400 font-bold">HTTP 200</span>
                <span>&#123; &quot;id&quot;: &quot;msg_8f92ab1c&quot;, &quot;latency_ms&quot;: 6.2 &#125;</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 opacity-60">
                <span className="text-emerald-400 font-bold">HTTP 200</span>
                <span>&#123; &quot;id&quot;: &quot;msg_3e81cb02&quot;, &quot;dkim&quot;: &quot;valid&quot; &#125;</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <h4 className="text-base font-semibold text-white mb-1">Simulate with zero risk</h4>
            <p className="text-xs text-slate-400">
              Simulate events and experiment with our API without the risk of accidentally sending real emails to real people.
            </p>
          </div>
        </div>

        {/* Right: Modular Webhooks Visual Stream */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Webhook className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-semibold text-slate-200">Modular Webhooks</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Stream
              </span>
            </div>

            {/* Event Cards */}
            <div className="space-y-2.5">
              {mockEvents.map((evt) => {
                const Icon = evt.icon;
                return (
                  <div
                    key={evt.id}
                    className="flex flex-wrap items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold ${evt.color}`}>
                        <Icon className="w-3 h-3" />
                        <span>{evt.type}</span>
                      </span>
                      <span className="font-mono text-slate-300">{evt.to}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                        {evt.agent}
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                        {evt.os}
                      </span>
                      <span className="text-slate-500 text-[10px]">{evt.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6">
            <h4 className="text-base font-semibold text-white mb-1">Real-time Delivery Insights</h4>
            <p className="text-xs text-slate-400">
              Receive real-time notifications directly to your server. Every time an email is delivered, opened, bounced, or a link is clicked.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
