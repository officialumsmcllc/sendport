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
  AlertCircle
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
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "MANUAL">("STRIPE");

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
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select Payment Method</h4>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("STRIPE")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold border transition-all cursor-pointer ${
                  paymentMethod === "STRIPE"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <CreditCard className="w-4 h-4" /> Credit / Debit Card (Stripe)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("MANUAL")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold border transition-all cursor-pointer ${
                  paymentMethod === "MANUAL"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Upload className="w-4 h-4" /> Easypaisa / JazzCash / USDT / Bank Wire
              </button>
            </div>

            {paymentMethod === "STRIPE" ? (
              <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instant activation via encrypted Stripe checkout. Supports Visa, Mastercard, Apple Pay, and Google Pay worldwide.
                </p>
                <button
                  onClick={() => alert(`Redirecting to Stripe secure checkout for ${purchaseMode === "CREDITS" ? selectedCreditPack.name : targetPlanObj?.name}...`)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
                >
                  <span>
                    Proceed to Stripe Checkout (
                    {formatPrice(
                      purchaseMode === "CREDITS" ? selectedCreditPack.usdPrice : (targetPlanObj?.usdPrice || 0),
                      currency
                    )}
                    )
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleManualSubmit}
                className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4 text-xs"
              >
                {submitted ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      Payment slip submitted successfully! Our billing team verifies and activates your quota within 15 minutes.
                    </span>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Select Payment Channel</label>
                      <select
                        value={manualMethod}
                        onChange={(e) => setManualMethod(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-2.5 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {availableGateways.length > 0 ? (
                          availableGateways.map((gw) => (
                            <option key={gw.code} value={gw.code}>
                              {gw.name} ({gw.currency}) — {gw.accountTitle}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="EASYPAISA">Easypaisa (Pakistan)</option>
                            <option value="JAZZCASH">JazzCash (Pakistan)</option>
                            <option value="RAAST">Raast Instant IBAN</option>
                            <option value="USDT">Binance USDT (TRC-20)</option>
                            <option value="BANK">Bank Wire / IBAN</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* DYNAMIC ACCOUNT DETAILS CARD */}
                    {(() => {
                      const activeGw =
                        availableGateways.find((g) => g.code === manualMethod) || availableGateways[0];
                      if (!activeGw) return null;
                      return (
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{activeGw.name}</span>
                              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {activeGw.currency}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-500">
                              Account Title: <strong className="text-slate-900">{activeGw.accountTitle}</strong>
                            </span>
                          </div>

                          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <div className="min-w-0 pr-2">
                              <div className="text-[10px] uppercase font-bold text-slate-400">
                                Account / IBAN / Wallet Address
                              </div>
                              <div className="font-mono text-xs font-bold text-slate-900 truncate select-all">
                                {activeGw.accountNumber}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(activeGw.accountNumber);
                                setCopiedText(true);
                                setTimeout(() => setCopiedText(false), 2000);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shrink-0 shadow-xs cursor-pointer"
                            >
                              {copiedText ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>

                          {activeGw.instructions && (
                            <div className="text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed">
                              <strong className="text-amber-900 font-semibold">Instructions: </strong>
                              {activeGw.instructions}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Transaction ID / TxHash *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. TID-9823412 or 0x4f..."
                          value={txId}
                          onChange={(e) => setTxId(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Sender Name / Phone Number</label>
                        <input
                          type="text"
                          placeholder="e.g. Muhammad Umar (0300-1234567)"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>

                    {manualError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{manualError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submittingManual}
                      className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 shadow-xs transition-colors cursor-pointer"
                    >
                      {submittingManual ? "Submitting Slip..." : "Submit Payment Receipt"}
                    </button>
                  </>
                )}
              </form>
            )}
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
