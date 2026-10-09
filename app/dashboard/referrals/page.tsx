"use client";

import React, { useState, useEffect } from "react";
import {
  Gift,
  Copy,
  Check,
  Share2,
  DollarSign,
  Users,
  CreditCard,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Clock,
  HelpCircle,
  ExternalLink,
  MessageCircle,
  Send,
  AlertCircle
} from "lucide-react";

interface ReferralStats {
  totalReferrals: number;
  payingCustomers: number;
  totalEarned: number;
  unpaidBalance: number;
  paidOut: number;
}

interface ReferralReward {
  id: string;
  referredEmail?: string | null;
  code: string;
  commissionRate: number;
  amountEarned: number;
  currency: string;
  status: string;
  createdAt: string;
}

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("PORT-USER");
  const [referralLink, setReferralLink] = useState("https://getsendport.com?ref=PORT-USER");
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    payingCustomers: 0,
    totalEarned: 0,
    unpaidBalance: 0,
    paidOut: 0,
  });
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [copied, setCopied] = useState(false);

  // Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState("EASYPAISA");
  const [payoutAccount, setPayoutAccount] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/referrals");
      if (res.ok) {
        const data = await res.json();
        setReferralCode(data.referralCode || "PORT-USER");
        setReferralLink(data.referralLink || `https://getsendport.com?ref=${data.referralCode}`);
        setStats(data.stats || {
          totalReferrals: 0,
          payingCustomers: 0,
          totalEarned: 0,
          unpaidBalance: 0,
          paidOut: 0,
        });
        setRewards(data.rewards || []);
      }
    } catch (err) {
      console.error("Failed to load referral data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `Hey! I'm using Sendport for high-speed transactional email delivery and newsletters with 99.9% inbox placement. Check it out: ${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareTwitter = () => {
    const text = `Supercharge your app's transactional emails with Sendport. High deliverability, custom DKIM, and generous free tier: ${referralLink}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAccount.trim()) {
      showToast("Please provide your account number or wallet address.", "error");
      return;
    }

    try {
      setPayoutSubmitting(true);
      const res = await fetch("/api/v1/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REQUEST_PAYOUT",
          payoutMethod,
          payoutAccount: payoutAccount.trim(),
          amount: payoutAmount ? parseFloat(payoutAmount) : stats.unpaidBalance,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Payout requested successfully!");
        setShowPayoutModal(false);
        setPayoutAccount("");
        setPayoutAmount("");
        fetchReferralData();
      } else {
        showToast(data.error || "Failed to submit payout request.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error submitting payout.", "error");
    } finally {
      setPayoutSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-400/20 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sendport Partner & Affiliate Program</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Earn <span className="text-indigo-400">20% Recurring</span> Lifetime Commission
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Invite fellow developers, SaaS founders, or agencies to Sendport. You earn 20% of their subscription every single month as long as they stay subscribed.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Referrals</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalReferrals}</div>
          <div className="text-xs text-slate-500 font-medium">Friends & clients signed up</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Paying Customers</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{stats.payingCustomers}</div>
          <div className="text-xs text-emerald-700/80 font-medium">Upgraded to paid plans</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Earned</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-600">${stats.totalEarned.toFixed(2)}</div>
          <div className="text-xs text-slate-500 font-medium">All-time lifetime earnings</div>
        </div>

        <div className="p-5 rounded-2xl bg-linear-to-br from-indigo-50 to-white border border-indigo-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-950">Unpaid Balance</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-900">${stats.unpaidBalance.toFixed(2)}</div>
          <button
            onClick={() => setShowPayoutModal(true)}
            className="w-full mt-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            Request Payout <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Referral Link & Sharing Box */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Your Unique Referral Link</h2>
          <p className="text-xs text-slate-500 mt-1">
            Share this link via social media, YouTube tutorials, blogs, or direct messaging to start earning.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 px-4 text-xs font-mono font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                Code: {referralCode}
              </span>
            </div>
          </div>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3.5 text-xs font-bold text-white transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </button>
        </div>

        {/* Quick Social Share Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500">Quick Share:</span>
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
          </button>
          <button
            onClick={handleShareTwitter}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-600" /> Twitter / X
          </button>
        </div>
      </div>

      {/* How it Works / 3 Tiers */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm">
            1
          </div>
          <h3 className="text-sm font-bold text-slate-900">Share Your Link</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Send your unique referral link to startup teams, freelance clients, or developers building web applications.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm">
            2
          </div>
          <h3 className="text-sm font-bold text-slate-900">They Upgrade to Pro</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            When they subscribe to the Growth Plan ($29/mo) or Scale Pro ($79/mo), your 20% recurring commission activates immediately.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-black text-sm">
            3
          </div>
          <h3 className="text-sm font-bold text-slate-900">Get Paid Every Month</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Receive monthly payouts straight to Easypaisa, JazzCash, USDT TRC-20, or your local Pakistani bank account.
          </p>
        </div>
      </div>

      {/* Commission Earnings History Table */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Referral Activity & Earnings</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time tracker of referred signups and generated commissions.</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {rewards.length} recorded events
          </span>
        </div>

        {rewards.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Gift className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No referrals yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Share your link above to begin earning passive monthly commissions from Sendport subscribers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">User / Referral</th>
                  <th className="py-3 px-6">Commission Rate</th>
                  <th className="py-3 px-6">Earned ($)</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rewards.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium">
                      {r.referredEmail || "Anonymous Signup"}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-indigo-600">
                      {(r.commissionRate * 100).toFixed(0)}% Recurring
                    </td>
                    <td className="py-3.5 px-6 font-bold text-emerald-600">
                      ${r.amountEarned.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Request Commission Payout</h3>
              </div>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payout Method
                </label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="EASYPAISA">Easypaisa (Pakistan)</option>
                  <option value="JAZZCASH">JazzCash (Pakistan)</option>
                  <option value="USDT">Binance USDT (TRC-20)</option>
                  <option value="BANK">Pakistani Bank Account / IBAN</option>
                  <option value="WISE">Wise (USD / EUR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Number / Phone / Wallet Address
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    payoutMethod === "EASYPAISA" || payoutMethod === "JAZZCASH"
                      ? "e.g. 0300-1234567 (Title: Your Name)"
                      : payoutMethod === "USDT"
                      ? "e.g. Txyz... (TRC-20 Wallet Address)"
                      : "e.g. PK36MEZN... (Meezan Bank IBAN)"
                  }
                  value={payoutAccount}
                  onChange={(e) => setPayoutAccount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Amount ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={`Available: $${stats.unpaidBalance.toFixed(2)}`}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave blank to withdraw entire unpaid balance of ${stats.unpaidBalance.toFixed(2)}. Minimum threshold: $10.00.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {payoutSubmitting ? "Submitting..." : "Confirm & Withdraw"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
