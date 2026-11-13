"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  Upload,
  ShieldCheck,
  ArrowRight,
  Zap,
  Check,
  Copy,
  Sparkles,
  Layers,
  AlertCircle,
  Coins
} from "lucide-react";
import { CURRENCIES, SupportedCurrency, formatPrice } from "@/lib/payments/currencies";

interface PaymentGateway {
  id: string;
  code: string;
  name: string;
  accountTitle: string;
  accountNumber: string;
  instructions: string | null;
  qrCodeUrl: string | null;
  currency: string;
}

function BillingContent() {
  const [mounted, setMounted] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [currency, setCurrency] = useState<SupportedCurrency>("USD");
  const [paymentMethod, setPaymentMethod] = useState<"CRYPTOMUS" | "STRIPE" | "MANUAL">("CRYPTOMUS");
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [cryptoError, setCryptoError] = useState("");

  // Dynamic admin-configured gateways
  const [availableGateways, setAvailableGateways] = useState<PaymentGateway[]>([]);
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [copiedText, setCopiedText] = useState(false);

  // Live workspace quota & active plan from real database
  const [workspaceStats, setWorkspaceStats] = useState<{
    plan: string;
    usedToday: number;
    dailyQuota: number;
    credits: number;
    planExpiresAt?: string | null;
    isPlanExpired?: boolean;
  }>({
    plan: "STARTER",
    usedToday: 0,
    dailyQuota: 100,
    credits: 0,
    planExpiresAt: null,
    isPlanExpired: false,
  });

  // Purchase Mode: Monthly Subscription Plan vs Pay-As-You-Go Credits
  const [purchaseMode, setPurchaseMode] = useState<"PLAN" | "CREDITS">("PLAN");

  // Selected upgrade target (null if viewing active plan)
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<"STARTER" | "GROWTH" | "SCALE_PRO" | null>(null);

  // Credit Packs for pay-as-you-go top-ups
  const creditPacks = [
    {
      id: "PACK_10K",
      name: "10,000 Emails Pack",
      credits: 10000,
      usdPrice: 5,
      desc: "Instant burst capacity for small blasts & test campaigns.",
      popular: false,
    },
    {
      id: "PACK_50K",
      name: "50,000 Emails Pack",
      credits: 50000,
      usdPrice: 15,
      desc: "Most popular for product launches, newsletters & SaaS bursts.",
      popular: true,
    },
    {
      id: "PACK_200K",
      name: "200,000 Emails Pack",
      credits: 200000,
      usdPrice: 45,
      desc: "High-volume reserve quota. Credits never expire.",
      popular: false,
    },
  ];
  const [selectedCreditPack, setSelectedCreditPack] = useState(creditPacks[1]);

  // Manual payment form states
  const [manualMethod, setManualMethod] = useState("EASYPAISA");
  const [txId, setTxId] = useState("");
  const [senderName, setSenderName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittingManual, setSubmittingManual] = useState(false);
  const [manualError, setManualError] = useState("");

  const searchParams = useSearchParams();
  const planQuery = searchParams.get("plan");

  useEffect(() => {
    if (planQuery) {
      const normalized = planQuery.toLowerCase();
      if (normalized === "growth") {
        setSelectedUpgradePlan("GROWTH");
        setPurchaseMode("PLAN");
      } else if (normalized === "scale_pro" || normalized === "scale-pro" || normalized === "scalepro") {
        setSelectedUpgradePlan("SCALE_PRO");
        setPurchaseMode("PLAN");
      }
    }
  }, [planQuery]);

  useEffect(() => {
    setMounted(true);

    // Fetch authentic user profile & workspace plan
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stats) {
          const userPlan = data.stats.plan || "STARTER";
          setWorkspaceStats({
            plan: userPlan,
            usedToday: data.stats.usedToday || 0,
            dailyQuota: data.stats.dailyQuota || 100,
            credits: data.stats.credits || 0,
            planExpiresAt: data.stats.planExpiresAt || null,
            isPlanExpired: Boolean(data.stats.isPlanExpired),
          });

          // Set sensible upgrade recommendation based on current active plan if not explicitly passed
          if (!planQuery) {
            if (userPlan === "STARTER") {
              setSelectedUpgradePlan("GROWTH");
            } else if (userPlan === "GROWTH") {
              setSelectedUpgradePlan("SCALE_PRO");
            } else {
              setSelectedUpgradePlan(null);
            }
          }
        }
      })
      .catch((err) => console.error("Error fetching billing stats:", err))
      .finally(() => setLoadingStats(false));

    // Fetch live active gateways configured by Admin
    fetch("/api/payments/methods")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.methods && data.methods.length > 0) {
          setAvailableGateways(data.methods);
          setManualMethod(data.methods[0].code);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingGateways(false));
  }, []);

  const plans = [
    {
      id: "STARTER",
      name: "Starter",
      usdPrice: 0,
      defaultQuota: "100 emails / day",
      domains: "1 Domain",
      features: ["2048-bit RSA DKIM", "REST API & SMTP Relay", "3 Days Log Retention"],
    },
    {
      id: "GROWTH",
      name: "Growth",
      usdPrice: 20,
      defaultQuota: "3,000 emails / day",
      domains: "Up to 5 Domains",
      features: ["Automated 30-Day Warmup", "Audience Contact Manager", "30 Days Log Retention"],
      popular: true,
    },
    {
      id: "SCALE_PRO",
      name: "Scale Pro",
      usdPrice: 79,
      defaultQuota: "25,000 emails / day",
      domains: "Unlimited Domains",
      features: ["Managed Dedicated IP", "BIMI & VMC Checkmark", "90 Days Log Retention"],
    },
  ];

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId.trim()) return;

    const isCredit = purchaseMode === "CREDITS";
    const targetPlan = selectedUpgradePlan || "GROWTH";
    const activePlanObj = plans.find((p) => p.id === targetPlan) || plans[1];
    const amountToCharge = isCredit ? selectedCreditPack.usdPrice : activePlanObj.usdPrice;

    try {
      setSubmittingManual(true);
      setManualError("");
      const res = await fetch("/api/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: isCredit ? `CREDITS_${selectedCreditPack.credits}` : targetPlan,
          amount: amountToCharge,
          currency,
          method: manualMethod,
          referenceId: txId.trim(),
          senderName: senderName.trim(),
          isCreditTopup: isCredit,
          creditsPurchased: isCredit ? selectedCreditPack.credits : null,
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

  const handleCryptomusCheckout = async () => {
    const isCredit = purchaseMode === "CREDITS";
    const targetPlan = selectedUpgradePlan || "GROWTH";

    try {
      setCryptoLoading(true);
      setCryptoError("");

      const res = await fetch("/api/payments/cryptomus/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: isCredit ? undefined : targetPlan,
          creditPackId: isCredit ? selectedCreditPack.id : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.paymentUrl) {
        throw new Error(data.error || "Failed to initialize Cryptomus crypto checkout.");
      }

      window.location.href = data.paymentUrl;
    } catch (err: any) {
      setCryptoError(err.message || "Failed to connect to Cryptomus payment gateway.");
    } finally {
      setCryptoLoading(false);
    }
  };

  const usagePercent = Math.min(
    100,
    Math.round((workspaceStats.usedToday / (workspaceStats.dailyQuota || 1)) * 100)
  );

  // Prevent flash hydration: show skeleton until mounted and stats resolved
  if (!mounted || loadingStats) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
        <div className="h-28 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200 rounded-2xl" />
          <div className="h-80 bg-slate-200 rounded-2xl" />
          <div className="h-80 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const currentPlan = workspaceStats.plan;
  const targetPlanObj = plans.find((p) => p.id === selectedUpgradePlan) || null;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Subscriptions</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your daily email sending quota, view your current active tier, and upgrade anytime.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-xs">
          <span className="text-slate-500 px-2">Currency:</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
            className="bg-slate-50 rounded-lg px-2.5 py-1 text-slate-800 outline-none font-bold cursor-pointer"
          >
            {Object.keys(CURRENCIES).map((c) => (
              <option key={c} value={c}>
                {c} ({CURRENCIES[c as SupportedCurrency].symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cryptomus Checkout Return Banner */}
      {searchParams.get("payment") === "completed" && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950">
                Cryptomus Order Submitted — Awaiting Blockchain Confirmation
              </h4>
              <p className="text-[11px] text-emerald-800">
                Your payment order has been submitted. SendPort's automated Cryptomus webhook will activate your plan/credits as soon as blockchain confirmation arrives (typically 1-3 minutes).
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = "/dashboard/billing"}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            Refresh Status
          </button>
        </div>
      )}

      {/* CURRENT USAGE SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Current Active Plan: {currentPlan}
              </div>

              {/* LIVE DAYS REMAINING COUNTDOWN BADGE */}
              {workspaceStats.planExpiresAt ? (
                (() => {
                  const daysLeft = Math.ceil(
                    (new Date(workspaceStats.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  const isExp = daysLeft <= 0 || workspaceStats.isPlanExpired;
                  if (isExp) {
                    return (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-[11px] font-black uppercase tracking-wider">
                        🚨 Plan Expired
                      </span>
                    );
                  }
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        daysLeft <= 3
                          ? "bg-amber-100 border border-amber-300 text-amber-900 animate-pulse"
                          : "bg-sky-50 border border-sky-200 text-sky-800"
                      }`}
                    >
                      ⏳ {daysLeft} Days Remaining ({new Date(workspaceStats.planExpiresAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })})
                    </span>
                  );
                })()
              ) : currentPlan !== "STARTER" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-black uppercase tracking-wider">
                  ⏳ 30 Days Active
                </span>
              ) : null}
            </div>

            <h2 className="text-xl font-black text-slate-900">
              {currentPlan === "GROWTH"
                ? `Growth Plan (${(workspaceStats.dailyQuota || 3000).toLocaleString()} emails/day)`
                : currentPlan === "SCALE_PRO"
                ? `Scale Pro Plan (${(workspaceStats.dailyQuota || 25000).toLocaleString()} emails/day)`
                : `Starter Plan (${(currentPlan === "STARTER" && workspaceStats.dailyQuota > 100 ? 100 : workspaceStats.dailyQuota).toLocaleString()} emails/day)`}
            </h2>

            {workspaceStats.planExpiresAt ? (
              (() => {
                const daysLeft = Math.ceil(
                  (new Date(workspaceStats.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                const isExp = daysLeft <= 0 || workspaceStats.isPlanExpired;
                if (isExp) {
                  return (
                    <div className="pt-2 flex items-center gap-2">
                      <p className="text-xs text-rose-600 font-bold">
                        Your monthly plan has expired. Daily quota has been reset to Starter (100/day).
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUpgradePlan(currentPlan as any);
                          const el = document.getElementById("payment-section");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg shadow-sm"
                      >
                        Renew Plan Now →
                      </button>
                    </div>
                  );
                }
                return (
                  <p className="text-xs text-slate-500">
                    Plan valid until <strong className="text-slate-800 font-semibold">{new Date(workspaceStats.planExpiresAt).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}</strong> ({daysLeft} days remaining). Daily quota resets automatically at 00:00 UTC.
                  </p>
                );
              })()
            ) : (
              <p className="text-xs text-slate-500">Daily quota resets automatically at 00:00 UTC.</p>
            )}
          </div>

          <div className="text-right w-full sm:w-auto">
            <span className="text-xs text-slate-400 block font-semibold">Today&apos;s Usage</span>
            <span className="text-2xl font-black text-slate-900 font-mono">
              {workspaceStats.usedToday.toLocaleString()} / {workspaceStats.dailyQuota.toLocaleString()}
            </span>
            <div className="w-full sm:w-44 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200/50">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  usagePercent > 90 ? "bg-rose-500" : usagePercent > 75 ? "bg-amber-500" : "bg-indigo-600"
                }`}
                style={{ width: `${Math.max(3, usagePercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Reserve Overdraft Credits Card */}
        <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/60 to-indigo-50/60 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-100 border border-sky-300 text-sky-800 text-[10px] font-extrabold uppercase tracking-wider">
              <Zap className="w-3 h-3 text-sky-600" /> Reserve Overdraft Credits
            </div>
            <h3 className="text-xs text-slate-600 font-medium pt-1">Non-Expiring Top-Up Balance</h3>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {(workspaceStats.credits || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">emails</span>
            </p>
          </div>
          <button
            onClick={() => setPurchaseMode("CREDITS")}
            className="mt-3 text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
          >
            Buy Additional Credits →
          </button>
        </div>
      </div>

      {/* MODE SELECTOR */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPurchaseMode("PLAN")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              purchaseMode === "PLAN"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Monthly Subscriptions
          </button>
          <button
            type="button"
            onClick={() => setPurchaseMode("CREDITS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              purchaseMode === "CREDITS"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" /> Pay-As-You-Go Credits (Never Expire)
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          {purchaseMode === "PLAN" ? "Elevated daily recurring sending quotas" : "One-time burst protection packs that never expire"}
        </p>
      </div>

      {/* PLAN CARDS OR CREDIT PACKS */}
      {purchaseMode === "PLAN" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrentPlan = currentPlan === p.id;
          const isSelectedForUpgrade = selectedUpgradePlan === p.id && !isCurrentPlan;

          // Determine quota display: if it's the current plan, show actual assigned quota
          const displayQuota = isCurrentPlan
            ? (p.id === "STARTER" ? "100 emails / day (Active)" : `${workspaceStats.dailyQuota.toLocaleString()} emails / day (Active)`)
            : p.defaultQuota;

          return (
            <div
              key={p.id}
              onClick={() => {
                if (!isCurrentPlan) {
                  setSelectedUpgradePlan(p.id as any);
                }
              }}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 relative ${
                isCurrentPlan
                  ? "border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/20"
                  : isSelectedForUpgrade
                  ? "border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/20 cursor-pointer"
                  : "border-slate-200 bg-white hover:border-slate-300 cursor-pointer"
              }`}
            >
              {/* Badges */}
              {isCurrentPlan ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Check className="w-3 h-3" /> Current Plan
                </span>
              ) : isSelectedForUpgrade ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Upgrade Target
                </span>
              ) : p.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Popular
                </span>
              ) : null}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                  {isCurrentPlan && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg">
                      {workspaceStats.planExpiresAt ? (
                        (() => {
                          const daysLeft = Math.ceil(
                            (new Date(workspaceStats.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                          );
                          return daysLeft > 0 ? `Active · ${daysLeft}d left` : "Expired";
                        })()
                      ) : (
                        "Active"
                      )}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">
                    {formatPrice(p.usdPrice, currency)}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <div
                  className={`mt-2 text-xs font-semibold ${
                    isCurrentPlan ? "text-emerald-700 font-bold" : "text-slate-700"
                  }`}
                >
                  {displayQuota}
                </div>

                <ul className="mt-5 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${isCurrentPlan ? "text-emerald-600" : "text-indigo-600"}`}
                    />
                    <span>{p.domains}</span>
                  </li>
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${isCurrentPlan ? "text-emerald-600" : "text-indigo-600"}`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Current Active Plan
                  </button>
                ) : isSelectedForUpgrade ? (
                  <button className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
                    <Check className="w-3.5 h-3.5" /> Selected for Upgrade
                  </button>
                ) : (
                  <button className="w-full py-2.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                    {p.id === "STARTER" ? "Downgrade to Starter" : `Upgrade to ${p.name}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      ) : (
        /* CREDIT PACK CARDS */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPacks.map((pack) => {
            const isSelected = selectedCreditPack.id === pack.id;
            return (
              <div
                key={pack.id}
                onClick={() => setSelectedCreditPack(pack)}
                className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 relative cursor-pointer ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {pack.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    BEST VALUE
                  </span>
                )}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-indigo-600" /> {pack.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{pack.desc}</p>

                  <div className="mt-4 mb-4">
                    <span className="text-3xl font-black text-slate-900">
                      {formatPrice(pack.usdPrice, currency)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium"> / one-time</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{pack.credits.toLocaleString()} Guaranteed Delivery Credits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Credits Never Expire</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Overdraft Automatic Activation</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  {isSelected ? (
                    <button className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
                      <Check className="w-3.5 h-3.5" /> Selected for Top-Up
                    </button>
                  ) : (
                    <button className="w-full py-2.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                      Select {pack.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CHECKOUT / UPGRADE SECTION */}
      {purchaseMode === "CREDITS" || (selectedUpgradePlan && selectedUpgradePlan !== currentPlan) ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> {purchaseMode === "CREDITS" ? "Credit Top-Up Summary" : "Upgrade Order Summary"}
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                {purchaseMode === "CREDITS" ? `Top Up ${selectedCreditPack.name}` : `Switch from ${currentPlan} to ${targetPlanObj?.name} Plan`}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {purchaseMode === "CREDITS"
                  ? `${selectedCreditPack.credits.toLocaleString()} non-expiring credits will be added to your workspace balance immediately.`
                  : `Your daily quota will instantly upgrade to ${targetPlanObj?.defaultQuota} upon payment confirmation.`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Total Due Today</span>
              <span className="text-3xl font-black text-indigo-600">
                {formatPrice(purchaseMode === "CREDITS" ? selectedCreditPack.usdPrice : (targetPlanObj?.usdPrice || 0), currency)}
                <span className="text-xs text-slate-500 font-normal"> {purchaseMode === "CREDITS" ? "/ one-time" : "/ month"}</span>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>Active Payment Rail:</span>
                <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" /> Cryptomus Web3 Gateway (Automated)
                </span>
              </h4>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Instant Blockchain Auto-Activation
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/50 shadow-lg space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/40 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
                      <Coins className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Cryptomus Web3 Payment Gateway
                        <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          Instant Auto-Activation
                        </span>
                      </h4>
                      <p className="text-xs text-indigo-200/80">
                        Pay with USDT, Bitcoin, Ethereum, TON, Solana, TRON, or Polygon with zero friction.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-indigo-300 block">Total Due</span>
                    <span className="text-2xl font-black text-white font-mono">
                      ${(purchaseMode === "CREDITS" ? selectedCreditPack.usdPrice : (targetPlanObj?.usdPrice || 0)).toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Supported crypto badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] text-indigo-300 font-semibold mr-1">Accepted Coins:</span>
                  {[
                    "USDT (TRC20)",
                    "USDT (BEP20)",
                    "USDT (Polygon)",
                    "Bitcoin (BTC)",
                    "Ethereum (ETH)",
                    "TON",
                    "Solana (SOL)",
                    "USDC",
                  ].map((coin) => (
                    <span
                      key={coin}
                      className="px-2.5 py-1 rounded-lg bg-indigo-900/60 border border-indigo-700/50 text-[11px] font-mono text-indigo-100"
                    >
                      {coin}
                    </span>
                  ))}
                </div>

                {/* Benefit pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-indigo-200/90 pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant Blockchain Webhook</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>No KYC / International Freedom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Lowest Network Gas Fees</span>
                  </div>
                </div>

                {cryptoError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{cryptoError}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCryptomusCheckout}
                    disabled={cryptoLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 px-6 py-3.5 text-xs font-black text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {cryptoLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Secure Cryptomus Invoice...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          Proceed to Cryptomus Secure Checkout ($
                          {(purchaseMode === "CREDITS" ? selectedCreditPack.usdPrice : (targetPlanObj?.usdPrice || 0)).toFixed(2)}
                          )
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-indigo-300/80 flex items-center justify-center sm:justify-start gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    Encrypted via Cryptomus Merchant Protocol
                  </span>
                </div>
              </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Need higher sending limits?</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Click on any tier above (Growth or Scale Pro) to upgrade your sending limits immediately.
            </p>
          </div>
          {currentPlan !== "SCALE_PRO" && (
            <button
              onClick={() => setSelectedUpgradePlan("GROWTH")}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Explore Growth Tier
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Loading billing interface...</div>}>
      <BillingContent />
    </Suspense>
  );
}
