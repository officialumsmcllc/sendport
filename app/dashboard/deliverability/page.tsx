"use client";

import React, { useState } from "react";
import { Activity, ShieldCheck, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

function WarmupScheduleTable() {
  const days = [
    { day: "Day 1 - 3", volume: "50 / day", ramp: "10%", status: "COMPLETED" },
    { day: "Day 4 - 7", volume: "250 / day", ramp: "25%", status: "COMPLETED" },
    { day: "Day 8 - 14", volume: "1,000 / day", ramp: "50%", status: "IN_PROGRESS" },
    { day: "Day 15 - 21", volume: "2,500 / day", ramp: "75%", status: "SCHEDULED" },
    { day: "Day 22 - 30", volume: "5,000+ / day", ramp: "100%", status: "SCHEDULED" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase">
          <tr>
            <th className="px-4 py-2.5">Schedule</th>
            <th className="px-4 py-2.5">Recommended Daily Volume</th>
            <th className="px-4 py-2.5">Ramp Up</th>
            <th className="px-4 py-2.5">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {days.map((d, i) => (
            <tr key={i} className="hover:bg-slate-50/60">
              <td className="px-4 py-3 font-semibold text-slate-800">{d.day}</td>
              <td className="px-4 py-3 font-mono text-slate-700">{d.volume}</td>
              <td className="px-4 py-3 text-slate-500">{d.ramp}</td>
              <td className="px-4 py-3">
                {d.status === "COMPLETED" && (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-100">
                    Completed
                  </span>
                )}
                {d.status === "IN_PROGRESS" && (
                  <span className="text-primary-700 bg-primary-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-primary-100">
                    Active Phase
                  </span>
                )}
                {d.status === "SCHEDULED" && (
                  <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded text-[11px]">
                    Upcoming
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DeliverabilityPage() {
  const [warmupEnabled, setWarmupEnabled] = useState(true);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Deliverability & Warmup Engine</h1>
          <p className="text-sm text-slate-500">
            Automated 30-day IP/domain warmup schedule, reputation monitoring, and Spamhaus blocklist protection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Auto Warmup:</span>
          <button
            onClick={() => setWarmupEnabled(!warmupEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              warmupEnabled ? "bg-primary-600" : "bg-slate-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                warmupEnabled ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* REPUTATION METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Sender Score</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">99 / 100</div>
          <p className="text-xs text-slate-500 mt-1">Excellent reputation across Gmail & Outlook.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">DNSBL Blocklists</div>
          <div className="text-3xl font-black text-slate-900 mt-2">0 Listed</div>
          <p className="text-xs text-slate-500 mt-1">Clean on Spamhaus, Barracuda, and SURBL.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Spam Complaint Rate</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">0.01%</div>
          <p className="text-xs text-slate-500 mt-1">Well below the 0.10% industry threshold.</p>
        </div>
      </div>

      {/* 30-DAY WARMUP SCHEDULE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">30-Day Automated Warmup Progression</h3>
          <span className="text-xs text-primary-600 font-semibold">Stage: Day 10 (Ramping to 1,000/day)</span>
        </div>
        <WarmupScheduleTable />
      </div>
    </div>
  );
}
