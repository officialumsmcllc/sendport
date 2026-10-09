"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, Upload, ShieldCheck, ArrowRight, Zap, Check } from "lucide-react";
import { CURRENCIES, SupportedCurrency, formatPrice } from "@/lib/payments/currencies";

export default function BillingPage() {
  const [currency, setCurrency] = useState<SupportedCurrency>("USD");
  const [selectedPlan, setSelectedPlan] = useState<"STARTER" | "GROWTH" | "SCALE_PRO">("GROWTH");
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "MANUAL">("STRIPE");

  // Live workspace quota & usage
  const [workspaceStats, setWorkspaceStats] = useState({
    plan: "STARTER",
    usedToday: 0,
    dailyQuota: 100,
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stats) {
          setWorkspaceStats({
            plan: data.stats.plan || "STARTER",
            usedToday: data.stats.usedToday || 0,
            dailyQuota: data.stats.dailyQuota || 100,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Manual payment form states
  const [manualMethod, setManualMethod] = useState("EASYPAISA");
  const [txId, setTxId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittingManual, setSubmittingManual] = useState(false);
  const [manualError, setManualError] = useState("");

  const plans = [
    {
      id: "STARTER",
      name: "Starter",
      usdPrice: 0,
      quota: "100 emails / day",
      domains: "1 Domain",
      features: ["2048-bit RSA DKIM", "REST API & SMTP Relay", "3 Days Log Retention"],
    },
    {
      id: "GROWTH",
      name: "Growth",
      usdPrice: 20,
      quota: "3,000 emails / day",
      domains: "Up to 5 Domains",
      features: ["Automated 30-Day Warmup", "Audience Contact Manager", "30 Days Log Retention"],
      popular: true,
    },
    {
      id: "SCALE_PRO",
      name: "Scale Pro",
      usdPrice: 79,
      quota: "25,000 emails / day",
      domains: "Unlimited Domains",
      features: ["Managed Dedicated IP", "BIMI & VMC Checkmark", "90 Days Log Retention"],
    },
  ];

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId.trim()) return;
    try {
      setSubmittingManual(true);
      setManualError("");
      const activePlanObj = plans.find((p) => p.id === selectedPlan) || plans[1];
      const res = await fetch("/api/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          amount: activePlanObj.usdPrice,
          currency,
          method: manualMethod,
          referenceId: txId.trim(),
          senderName: senderName.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setManualError(data.error || "Failed to submit payment transaction.");
      }
    } catch (err: any) {
      setManualError(err.message || "Network error. Please try again.");
    } finally {
      setSubmittingManual(false);
    }
  };

  const usagePercent = Math.min(
    100,
    Math.round((workspaceStats.usedToday / (workspaceStats.dailyQuota || 1)) * 100)
  );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Billing & Subscriptions</h1>
          <p className="text-sm text-slate-500">
            Manage your sending quota, upgrade plans, and pay with global cards or manual transfers.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold">
          <span className="text-slate-500 px-2">Currency:</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
            className="bg-slate-50 rounded-lg px-2.5 py-1 text-slate-800 outline-none font-bold"
          >
            {Object.keys(CURRENCIES).map((c) => (
              <option key={c} value={c}>{c} ({CURRENCIES[c as SupportedCurrency].symbol})</option>
            ))}
          </select>
        </div>
      </div>

      {/* CURRENT USAGE SUMMARY */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Current Plan</span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            {workspaceStats.plan === "GROWTH"
              ? `Growth Plan (${workspaceStats.dailyQuota.toLocaleString()} emails/day)`
              : workspaceStats.plan === "SCALE_PRO"
              ? `Scale Pro Plan (${workspaceStats.dailyQuota.toLocaleString()} emails/day)`
              : `Starter Plan (${workspaceStats.dailyQuota.toLocaleString()} emails/day)`}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Daily quota resets automatically at 00:00 UTC.</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Today&apos;s Usage</span>
          <span className="text-2xl font-black text-slate-900 font-mono">
            {workspaceStats.usedToday.toLocaleString()} / {workspaceStats.dailyQuota.toLocaleString()}
          </span>
          <div className="w-48 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-primary-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.max(2, usagePercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* PLAN SELECTOR CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isSelected = selectedPlan === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id as any)}
              className={`rounded-2xl border p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 relative ${
                isSelected
                  ? "border-primary-600 bg-primary-50/20 shadow-md ring-2 ring-primary-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Popular
                </span>
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">
                    {formatPrice(p.usdPrice, currency)}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-700">{p.quota}</div>

                <ul className="mt-5 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {p.domains}
                  </li>
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`mt-6 w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {isSelected ? "Selected" : "Select Plan"}
              </button>
            </div>
          );
        })}
      </div>

      {/* CHECKOUT METHODS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-6">
        <h3 className="text-base font-bold text-slate-900">Payment Method</h3>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaymentMethod("STRIPE")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold border ${
              paymentMethod === "STRIPE"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <CreditCard className="w-4 h-4" /> Credit / Debit Card (Stripe)
          </button>
          <button
            onClick={() => setPaymentMethod("MANUAL")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold border ${
              paymentMethod === "MANUAL"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Upload className="w-4 h-4" /> Manual Slip / Mobile Wallet (Easypaisa / USDT)
          </button>
        </div>

        {paymentMethod === "STRIPE" ? (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <p className="text-xs text-slate-600">
              Instant activation via encrypted Stripe checkout. Supports Visa, Mastercard, Apple Pay, and Google Pay.
            </p>
            <button
              onClick={() => alert("Redirecting to Stripe secure checkout...")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-xs font-semibold text-white hover:bg-primary-700 shadow-md"
            >
              Proceed to Stripe Checkout
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Proof submitted! Admin will verify and activate your quota within 15 minutes.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Transfer Gateway</label>
                    <select
                      value={manualMethod}
                      onChange={(e) => setManualMethod(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 bg-white text-xs"
                    >
                      <option value="EASYPAISA">Easypaisa (0300-1234567)</option>
                      <option value="JAZZCASH">JazzCash (0300-7654321)</option>
                      <option value="RAAST">Raast Instant IBAN</option>
                      <option value="USDT">Crypto USDT TRC-20 (Wallet: TXYZ...)</option>
                      <option value="BANK">Bank Wire (Meezan Bank IBAN)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Transaction ID / TxHash *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TID-894204812 or 0x9f..."
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sender Name / Phone</label>
                  <input
                    type="text"
                    placeholder="Muhammad Umar / 0300..."
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white"
                  />
                </div>

                {manualError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {manualError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingManual}
                  className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 shadow-sm transition-all"
                >
                  {submittingManual ? "Submitting Proof..." : "Submit Payment Slip"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
