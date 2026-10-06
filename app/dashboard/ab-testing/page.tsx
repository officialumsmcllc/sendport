"use client";

import React, { useState } from "react";
import { Split, Plus, Trash2, CheckCircle2, TrendingUp, X } from "lucide-react";

interface Variant {
  id: string;
  name: string;
  subject: string;
  split: number;
  opens: number;
  openRate: string;
}

interface Experiment {
  id: string;
  title: string;
  active: boolean;
  variants: Variant[];
}

export default function AbTestingPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [subjectA, setSubjectA] = useState("");
  const [subjectB, setSubjectB] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subjectA || !subjectB) return;

    const newExp: Experiment = {
      id: "exp_" + Date.now(),
      title,
      active: true,
      variants: [
        {
          id: "va",
          name: "Variant A",
          subject: subjectA,
          split: 50,
          opens: 0,
          openRate: "0.0%",
        },
        {
          id: "vb",
          name: "Variant B",
          subject: subjectB,
          split: 50,
          opens: 0,
          openRate: "0.0%",
        },
      ],
    };

    setExperiments([newExp, ...experiments]);
    setTitle("");
    setSubjectA("");
    setSubjectB("");
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setExperiments(experiments.filter((e) => e.id !== id));
  };

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
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Create New Experiment
        </button>
      </div>

      {experiments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-3">
          <Split className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Active A/B Experiments</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t started any split tests yet. Click below to test two subject lines and boost your open rates.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Start Your First A/B Test
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiments.map((exp) => (
            <div key={exp.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800">{exp.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active Test
                  </span>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {exp.variants.map((v) => (
                  <div key={v.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {v.name}
                        </span>
                        <span className="text-xs text-slate-500">{v.split}% Traffic</span>
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
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-900">New A/B Experiment</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. November Product Launch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Variant A Subject Line</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introducing our new features"
                  value={subjectA}
                  onChange={(e) => setSubjectA(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Variant B Subject Line</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Try these 3 new superpowers today"
                  value={subjectB}
                  onChange={(e) => setSubjectB(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary-600 text-xs font-semibold text-white hover:bg-primary-700"
                >
                  Start Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
