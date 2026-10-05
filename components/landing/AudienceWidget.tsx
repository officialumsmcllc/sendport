"use client";

import React from "react";
import { Users, BarChart3, TrendingUp, CheckCircle, Mail, Sparkles } from "lucide-react";

export function AudienceWidget() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-900/60 px-3.5 py-1 text-xs font-semibold text-slate-300 backdrop-blur mb-4">
          <Users className="w-3.5 h-3.5 text-sky-400" />
          <span>Audiences & Analytics</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Go <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">beyond editing</span>
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Group and control your contacts in a simple and intuitive way. Straightforward analytics and reporting tools that will help you send better emails.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Audience Contact Management */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between shadow-xl">
          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Audience</div>
                  <div className="text-base font-bold text-white">Newsletter Subscribers</div>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Active List
              </span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">ALL CONTACTS</div>
                <div className="text-2xl font-black text-white mt-1">1,034</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">UNSUBSCRIBED</div>
                <div className="text-2xl font-black text-rose-400 mt-1">5</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">ENGAGEMENT</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">92%</div>
              </div>
            </div>

            {/* Mock Contacts List */}
            <div className="space-y-2">
              {[
                { email: "sarah.connor@cyberdyne.com", status: "Subscribed", tag: "Enterprise" },
                { email: "john.wick@continental.hotel", status: "Subscribed", tag: "VIP" },
                { email: "tony.stark@starkindustries.io", status: "Subscribed", tag: "SaaS Pro" },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs">
                  <span className="font-mono text-slate-300">{c.email}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">{c.tag}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <h4 className="text-base font-semibold text-white mb-1">Contact Management</h4>
            <p className="text-xs text-slate-400">
              Import your list in minutes, regardless the size of your audience. Get full visibility of each contact and their personal attributes.
            </p>
          </div>
        </div>

        {/* Right: Broadcast & Deliverability Analytics */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Broadcast Report</div>
                  <div className="text-base font-bold text-white">Product Launch Update #4</div>
                </div>
              </div>
              <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                Completed
              </span>
            </div>

            {/* Big Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20">
                <div className="text-xs text-slate-400">DELIVERABILITY</div>
                <div className="text-3xl font-black text-emerald-400 mt-1">98.9%</div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-2">
                  <span className="text-emerald-400">● 3,204 Delivered</span>
                  <span className="text-rose-400">● 6 Bounced</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-b from-sky-500/10 to-transparent border border-sky-500/20">
                <div className="text-xs text-slate-400">ENGAGEMENT</div>
                <div className="text-3xl font-black text-sky-400 mt-1">41.8%</div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-2">
                  <span className="text-sky-400">● 1,340 Opened</span>
                  <span className="text-indigo-400">● 584 Clicked</span>
                </div>
              </div>
            </div>

            {/* Sparkline visualization */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Sending Velocity (sub-10ms)</span>
                <span className="text-emerald-400 font-bold">100% On Time</span>
              </div>
              <div className="h-10 flex items-end gap-1">
                {[40, 65, 80, 55, 90, 75, 100, 85, 95, 70, 88, 92, 100, 96].map((val, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${val}%` }}
                    className="flex-1 bg-gradient-to-t from-primary-600 to-sky-400 rounded-t-sm opacity-90 hover:opacity-100 transition-opacity"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <h4 className="text-base font-semibold text-white mb-1">Broadcast Analytics</h4>
            <p className="text-xs text-slate-400">
              Unlock powerful insights and understand exactly how your audience is interacting with your broadcast and transactional emails.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
