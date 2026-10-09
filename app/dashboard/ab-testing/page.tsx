"use client";

import React, { useState, useEffect } from "react";
import { Split, Plus, Trash2, CheckCircle2, TrendingUp, X, RefreshCw, Play, Pause, Award } from "lucide-react";

interface DbExperiment {
  id: string;
  title: string;
  subjectA: string;
  subjectB: string;
  split: number;
  status: string;
  opensA: number;
  opensB: number;
  clicksA: number;
  clicksB: number;
  createdAt: string;
}

export default function AbTestingPage() {
  const [experiments, setExperiments] = useState<DbExperiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [subjectA, setSubjectA] = useState("");
  const [subjectB, setSubjectB] = useState("");
  const [splitRatio, setSplitRatio] = useState(50);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchExperiments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/experiments");
      if (res.ok) {
        const json = await res.json();
        if (json.data) setExperiments(json.data);
      }
    } catch (err) {
      console.error("Failed to load experiments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectA.trim() || !subjectB.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subjectA: subjectA.trim(),
          subjectB: subjectB.trim(),
          split: splitRatio,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setExperiments([json.experiment, ...experiments]);
        setTitle("");
        setSubjectA("");
        setSubjectB("");
        setShowModal(false);
        showToast("A/B Experiment saved to database successfully!");
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to create experiment", "error");
      }
    } catch {
      showToast("Network error creating experiment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (exp: DbExperiment) => {
    const nextStatus = exp.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch(`/api/v1/experiments/${exp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setExperiments((prev) =>
          prev.map((item) => (item.id === exp.id ? { ...item, status: nextStatus } : item))
        );
        showToast(`Experiment ${nextStatus === "ACTIVE" ? "resumed" : "paused"} successfully.`);
      }
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (id: string, expTitle: string) => {
    if (!confirm(`Are you sure you want to delete experiment "${expTitle}"?`)) return;
    try {
      const res = await fetch(`/api/v1/experiments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setExperiments(experiments.filter((e) => e.id !== id));
        showToast("Experiment deleted from database.");
      }
    } catch {
      showToast("Failed to delete experiment", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* TOAST FEEDBACK */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl transition-all ${
            toast.type === "success"
              ? "bg-slate-900 text-white border border-slate-800"
              : "bg-rose-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Split className="w-6 h-6 text-primary-600" />
            A/B Subject Variant Testing &amp; Winner Optimizer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Split-test multiple subject lines. Persistent benchmark telemetry with automated winner selection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchExperiments}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary-600" : ""}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Create Experiment
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 font-medium">
          Loading experiments from PostgreSQL database...
        </div>
      ) : experiments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-card space-y-3">
          <Split className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Active A/B Experiments</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t started any split tests yet. Click below to test two subject lines and boost your open rates.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Start Your First A/B Test
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiments.map((exp) => {
            const isWinnerB = exp.opensB > exp.opensA;
            const isWinnerA = exp.opensA > exp.opensB;

            return (
              <div
                key={exp.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-4 transition-all hover:border-slate-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                        exp.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {exp.status}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{exp.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(exp)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      {exp.status === "ACTIVE" ? (
                        <>
                          <Pause className="w-3 h-3 text-amber-600" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-emerald-600" /> Resume
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id, exp.title)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                      title="Delete Experiment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* VARIANT A */}
                  <div
                    className={`rounded-xl border p-4 transition-all ${
                      isWinnerA
                        ? "border-emerald-300 bg-emerald-50/40"
                        : "border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        Variant A ({exp.split}%)
                        {isWinnerA && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-200">
                            <Award className="w-2.5 h-2.5" /> Winning
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-900">
                        {exp.opensA} Opens • {exp.clicksA} Clicks
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs font-mono text-slate-800 break-words shadow-sm">
                      {exp.subjectA}
                    </div>
                  </div>

                  {/* VARIANT B */}
                  <div
                    className={`rounded-xl border p-4 transition-all ${
                      isWinnerB
                        ? "border-emerald-300 bg-emerald-50/40"
                        : "border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        Variant B ({100 - exp.split}%)
                        {isWinnerB && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-200">
                            <Award className="w-2.5 h-2.5" /> Winning
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-900">
                        {exp.opensB} Opens • {exp.clicksB} Clicks
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs font-mono text-slate-800 break-words shadow-sm">
                      {exp.subjectB}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
                  <span>Created: {new Date(exp.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 text-primary-600 font-sans font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" /> Dynamic 50/50 Multi-Arm Bandit Split Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE EXPERIMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Split className="w-4 h-4 text-primary-600" />
                New A/B Subject Line Experiment
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Experiment Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Q4 Black Friday Subject Line Test"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Variant A Subject Line *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Don't miss our biggest sale of the year 🎁"
                  value={subjectA}
                  onChange={(e) => setSubjectA(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Variant B Subject Line *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Your 50% discount expires at midnight ⏳"
                  value={subjectB}
                  onChange={(e) => setSubjectB(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Audience Split Ratio</span>
                <span className="font-mono text-primary-600">{splitRatio}% / {100 - splitRatio}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={splitRatio}
                onChange={(e) => setSplitRatio(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Start Experiment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
