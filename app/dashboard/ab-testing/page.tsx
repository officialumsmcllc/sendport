"use client";

import React, { useState } from "react";
import { Split, Plus, Trash2, Play, CheckCircle2, TrendingUp, BarChart2 } from "lucide-react";

export default function AbTestingPage() {
  const [variants, setVariants] = useState([
    { id: 1, name: "Variant A", subject: "Introducing Sendport 2.0: Lightning-fast email", split: 50, opens: 1420, openRate: "42.8%" },
    { id: 2, name: "Variant B", subject: "Stop landing in spam: Try Sendport today", split: 50, opens: 1890, openRate: "54.2%" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Split className="w-5 h-5 text-primary-600" />
            A/B Subject Variant Testing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Split-test multiple subject lines or templates. Automatically route remaining volume to the winning variant after 2 hours.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-700 shadow-sm transition-all">
          <Plus className="w-4 h-4" /> Create New Experiment
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">Active Test: October Product Launch Campaign</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Variant B Winning (+26.6% Opens)
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {variants.map((v) => (
            <div key={v.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {v.name}
                  </span>
                  <span className="text-xs text-slate-500">{v.split}% Traffic Allocation</span>
                </div>
                <p className="text-xs font-semibold text-slate-900">{v.subject}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Total Opens</p>
                  <p className="text-sm font-bold text-slate-800">{v.opens}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Open Rate</p>
                  <p className="text-sm font-bold text-emerald-600">{v.openRate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
