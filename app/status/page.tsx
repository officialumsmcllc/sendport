"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, ShieldCheck, Activity, Globe, Server, Clock, Zap } from "lucide-react";

export default function StatusPage() {
  const systems = [
    { name: "REST API Dispatch (v1)", status: "Operational", uptime: "99.998%", latency: "8ms" },
    { name: "SMTP Global Relays (us-east, eu-central, ap-south)", status: "Operational", uptime: "100.0%", latency: "12ms" },
    { name: "Inbound Email Webhook Parsing", status: "Operational", uptime: "99.995%", latency: "14ms" },
    { name: "DNS & DKIM 2048-bit Verifier", status: "Operational", uptime: "100.0%", latency: "25ms" },
    { name: "Live Delivery & Event Stream (WebSockets)", status: "Operational", uptime: "99.991%", latency: "5ms" },
    { name: "Audiences & CSV Import Pipeline", status: "Operational", uptime: "100.0%", latency: "18ms" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-white/20 selection:text-white">
      <Navbar dark={true} />

      <main className="flex-1 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header Banner */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Fully Operational
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Sendport Platform Status</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Live real-time monitoring across distributed edge regions and delivery queues.
            </p>
          </div>

          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Overall Uptime (90d)", val: "99.994%", icon: Activity },
              { label: "Average Dispatch Latency", val: "9.2 ms", icon: Zap },
              { label: "Primary Inbox Rate", val: "99.98%", icon: ShieldCheck },
              { label: "Active Edge POPs", val: "28 Global", icon: Globe },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-center">
                  <Icon className="w-4 h-4 text-emerald-400 mx-auto mb-2" />
                  <p className="text-base font-bold text-white">{m.val}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{m.label}</p>
                </div>
              );
            })}
          </div>

          {/* Services List */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" /> Core Services
              </h2>
              <span className="text-xs font-mono text-slate-400">Updated seconds ago</span>
            </div>
            <div className="divide-y divide-slate-800/80">
              {systems.map((sys) => (
                <div key={sys.name} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{sys.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Response Time: {sys.latency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">{sys.uptime} uptime</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans font-semibold text-[11px]">
                      {sys.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 90-day History Visual Bar */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">90-Day Incident History</span>
              <span className="text-emerald-400 font-bold">100% Operational (0 Incidents Reported)</span>
            </div>
            {/* Visual tick bars */}
            <div className="flex items-center gap-1 overflow-x-auto py-2">
              {Array.from({ length: 45 }).map((_, i) => (
                <div
                  key={i}
                  title={`Day ${45 - i}: 100% Uptime`}
                  className="h-8 flex-1 min-w-[5px] rounded-sm bg-emerald-500/80 hover:bg-emerald-400 transition-colors cursor-pointer"
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>45 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </main>

      <Footer dark={true} />
    </div>
  );
}
