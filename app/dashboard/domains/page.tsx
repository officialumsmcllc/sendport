"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Globe,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Trash2,
  Zap,
  ExternalLink,
  Layers,
  ArrowRight,
  HelpCircle,
  Key,
  Sparkles,
} from "lucide-react";

interface DomainItem {
  id: string;
  name: string;
  status: "VERIFIED" | "PENDING" | "FAILED";
  dkimSelector: string;
  dkimPublicKey?: string;
  spfRecord?: string;
  dmarcRecord?: string;
  spfValid: boolean;
  dkimValid: boolean;
  dmarcValid: boolean;
  verifiedAt: string;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<DomainItem | null>(null);
  const [modalTab, setModalTab] = useState<"cloudflare" | "manual">("cloudflare");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [planInfo, setPlanInfo] = useState<{ plan: string; limit: number; count: number; canAddMore: boolean }>({
    plan: "STARTER",
    limit: 1,
    count: 0,
    canAddMore: true,
  });
  const [newDomainName, setNewDomainName] = useState("");
  const [addingDomain, setAddingDomain] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [scanAllVerifying, setScanAllVerifying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Cloudflare automated setup state
  const [cfToken, setCfToken] = useState("");
  const [cfSyncing, setCfSyncing] = useState(false);
  const [cfSuccessMsg, setCfSuccessMsg] = useState<string | null>(null);
  const [oauthConfigured, setOauthConfigured] = useState<boolean | null>(null);
  const [showOauthSetupModal, setShowOauthSetupModal] = useState(false);
  const tokenInputRef = useRef<HTMLInputElement>(null);

  // URL Banner feedback
  const [bannerNotice, setBannerNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/domains");
      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          setPlanInfo({
            plan: data.plan,
            limit: data.limit || 1,
            count: data.count || data.domains?.length || 0,
            canAddMore: Boolean(data.canAddMore),
          });
        }
        if (data.domains) {
          const mapped: DomainItem[] = data.domains.map((d: any) => ({
            id: d.id,
            name: d.name,
            status: d.status || "PENDING",
            dkimSelector: d.dkimSelector || "sendport",
            dkimPublicKey: d.dkimPublicKey || "",
            spfRecord: d.spfRecord || "v=spf1 include:mail.getsendport.com ~all",
            dmarcRecord: d.dmarcRecord || "v=DMARC1; p=none; rua=mailto:dmarc@getsendport.com",
            spfValid: d.isSpfValid || false,
            dkimValid: d.isDkimValid || false,
            dmarcValid: d.isDmarcValid || false,
            verifiedAt: d.verifiedAt ? new Date(d.verifiedAt).toLocaleDateString() : "Pending DNS",
          }));
          setDomains(mapped);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();

    // Check Cloudflare OAuth configuration status
    fetch("/api/auth/cloudflare/config")
      .then((res) => res.json())
      .then((data) => setOauthConfigured(Boolean(data.configured)))
      .catch(() => setOauthConfigured(false));

    // Check URL parameters for Cloudflare callback results
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("cf_verified") === "true") {
        const dom = params.get("domain") || "your domain";
        setBannerNotice({
          type: "success",
          message: `🎉 Success! Domain '${dom}' was automatically configured and verified via Cloudflare. DKIM, SPF, and DMARC are now 100% active!`,
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (params.get("cf_error")) {
        setBannerNotice({
          type: "error",
          message: `Cloudflare Notice: ${params.get("cf_error")}`,
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleVerifyDomain = async (dom: DomainItem) => {
    setVerifyingId(dom.id);
    try {
      const res = await fetch("/api/v1/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: dom.id }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "DNS verification check complete!");
        await fetchDomains();
      } else {
        alert(data.error || "Failed to verify DNS.");
      }
    } catch {
      alert("Network error checking DNS.");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleCloudflareOAuthClick = () => {
    if (!selectedDomain) return;
    if (oauthConfigured) {
      window.location.href = `/api/auth/cloudflare?domainId=${selectedDomain.id}`;
    } else {
      setShowOauthSetupModal(true);
    }
  };

  const handleCloudflareSync = async () => {
    if (!selectedDomain || !cfToken.trim()) return;
    setCfSyncing(true);
    setCfSuccessMsg(null);
    try {
      const res = await fetch("/api/v1/domains/cloudflare-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: selectedDomain.id,
          cloudflareApiToken: cfToken.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCfSuccessMsg(data.message || "Cloudflare DNS records configured and domain verified!");
        setDomains((prev) =>
          prev.map((d) =>
            d.id === selectedDomain.id
              ? {
                  ...d,
                  status: "VERIFIED",
                  spfValid: true,
                  dkimValid: true,
                  dmarcValid: true,
                  verifiedAt: new Date().toLocaleDateString(),
                }
              : d
          )
        );
        setTimeout(() => {
          setSelectedDomain(null);
          setCfSuccessMsg(null);
          setCfToken("");
        }, 2200);
      } else {
        alert(data.error || "Cloudflare sync failed.");
      }
    } catch {
      alert("Network error communicating with Cloudflare.");
    } finally {
      setCfSyncing(false);
    }
  };

  const handleScanAll = async () => {
    setScanAllVerifying(true);
    await fetchDomains();
    setScanAllVerifying(false);
  };

  const handleDeleteDomain = async (dom: DomainItem) => {
    if (!confirm(`Are you sure you want to remove domain "${dom.name}" from your workspace?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/domains?id=${dom.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDomains((prev) => prev.filter((d) => d.id !== dom.id));
        if (selectedDomain?.id === dom.id) {
          setSelectedDomain(null);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete domain.");
      }
    } catch {
      alert("Network error removing domain.");
    }
  };

  const handleAddDomain = async () => {
    if (!newDomainName.trim() || addingDomain) return;
    const clean = newDomainName.toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "").trim();
    try {
      setAddingDomain(true);
      const res = await fetch("/api/v1/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean }),
      });
      if (res.ok) {
        const data = await res.json();
        const dkimRec = data.records?.find((r: any) => r.type === "TXT" && r.name?.includes("_domainkey"));
        const spfRec = data.records?.find((r: any) => r.type === "TXT" && r.priority?.includes("SPF"));
        const dmarcRec = data.records?.find((r: any) => r.type === "TXT" && r.name?.includes("_dmarc"));
        const newDom: DomainItem = {
          id: data.id || `dom_${Date.now()}`,
          name: clean,
          status: "PENDING",
          dkimSelector: "sendport",
          dkimPublicKey: dkimRec?.value || "",
          spfRecord: spfRec?.value || "v=spf1 include:mail.getsendport.com ~all",
          dmarcRecord: dmarcRec?.value || "v=DMARC1; p=none; rua=mailto:dmarc@getsendport.com",
          spfValid: false,
          dkimValid: false,
          dmarcValid: false,
          verifiedAt: "Pending DNS verification",
        };
        setDomains((prev) => [newDom, ...prev]);
        setSelectedDomain(newDom);
        setShowAddModal(false);
        setNewDomainName("");
        fetchDomains();
      } else {
        const err = await res.json();
        if (res.status === 403 || err.code === "DOMAIN_LIMIT_REACHED") {
          setShowAddModal(false);
          setShowUpgradeModal(true);
        } else {
          alert(err.error || "Failed to add domain.");
        }
      }
    } catch {
      alert("Network error adding domain.");
    } finally {
      setAddingDomain(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* BANNER NOTICE */}
      {bannerNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            bannerNotice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerNotice.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <span>{bannerNotice.message}</span>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-slate-400 hover:text-slate-600 text-xs ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900">Domains & DNS Records</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
              {domains.length} / {planInfo.limit >= 999 ? "∞" : planInfo.limit} Domains Connected
              {planInfo.plan === "STARTER" && <span className="text-slate-400 font-normal ml-0.5">(Free Plan)</span>}
            </span>
            {domains.length >= planInfo.limit && planInfo.plan === "STARTER" && (
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-0.5 text-[11px] font-bold hover:bg-primary-100 transition-all shadow-xs"
              >
                <Zap className="w-3 h-3 text-primary-600" /> Upgrade for more
              </Link>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure custom domains with 2048-bit RSA DKIM keys, SPF authentication, and 1-Click Cloudflare Login.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleScanAll}
            disabled={scanAllVerifying}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary-600 ${scanAllVerifying ? "animate-spin" : ""}`} />
            Scan DNS Records
          </button>
          <button
            onClick={() => {
              if (domains.length >= planInfo.limit && planInfo.plan === "STARTER") {
                setShowUpgradeModal(true);
              } else {
                setShowAddModal(true);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" /> Add Domain
          </button>
        </div>
      </div>

      {/* DOMAINS LIST TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        {domains.length === 0 && !loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Globe className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">No Sending Domains Added Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your domain to generate 2048-bit DKIM keys, SPF authentication, or auto-configure via Cloudflare in 1 click.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Your First Domain
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Domain</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">DKIM (2048-bit)</th>
                  <th className="px-5 py-3">SPF & DMARC</th>
                  <th className="px-5 py-3">Verified Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {domains.map((dom) => (
                  <tr key={dom.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span>{dom.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      {dom.status === "VERIFIED" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-100">
                          <AlertTriangle className="w-3 h-3" /> Pending DNS
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {dom.status === "VERIFIED" ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> 2048-bit RSA Active
                        </span>
                      ) : (
                        <span className="text-slate-400">DNS record pending</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {dom.status === "VERIFIED" ? (
                        <span className="text-slate-700 font-mono text-[11px]">v=spf1 ~all (Pass)</span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">v=spf1 pending</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{dom.verifiedAt}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {dom.status !== "VERIFIED" && (
                          <button
                            onClick={() => {
                              setSelectedDomain(dom);
                              setModalTab("cloudflare");
                            }}
                            className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors shadow-sm"
                            title="Auto configure via Cloudflare"
                          >
                            <Zap className="w-3 h-3 text-[#F6821F] fill-[#F6821F]" /> Cloudflare
                          </button>
                        )}
                        {dom.status !== "VERIFIED" && (
                          <button
                            onClick={() => handleVerifyDomain(dom)}
                            disabled={verifyingId === dom.id}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                            title="Verify DNS records now"
                          >
                            <RefreshCw className={`w-3 h-3 ${verifyingId === dom.id ? "animate-spin" : ""}`} />
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedDomain(dom);
                            setModalTab("manual");
                          }}
                          className="text-xs font-semibold text-primary-600 hover:underline"
                        >
                          DNS Details
                        </button>
                        <button
                          onClick={() => handleDeleteDomain(dom)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Delete domain"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DNS RECORDS & CLOUDFLARE 1-CLICK MODAL */}
      {selectedDomain && (() => {
        const cleanSelectedDomainName = selectedDomain.name.replace(/\/+$/, "");

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>DNS Setup for</span>
                    <span className="font-mono text-primary-600">{cleanSelectedDomainName}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose 1-Click Cloudflare automated setup or configure records manually.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedDomain(null);
                    setCfSuccessMsg(null);
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕ Close
                </button>
              </div>

              {/* TAB SELECTOR */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <button
                  onClick={() => setModalTab("cloudflare")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    modalTab === "cloudflare"
                      ? "bg-[#F6821F] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" /> 1-Click Cloudflare
                </button>
                <button
                  onClick={() => setModalTab("manual")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    modalTab === "manual"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> Manual DNS Records
                </button>
              </div>

              {/* TAB CONTENT: CLOUDFLARE AUTO */}
              {modalTab === "cloudflare" ? (
                <div className="space-y-4">
                  {cfSuccessMsg ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{cfSuccessMsg}</span>
                    </div>
                  ) : (
                    <>
                      {/* PRIMARY: DIRECT API TOKEN (INSTANT & 100% RELIABLE) */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>Instant Cloudflare DNS Automation (API Token)</span>
                            </span>
                            <span className="text-[11px] font-normal text-slate-500">
                              (Zone:DNS:Edit permission)
                            </span>
                          </label>
                          <input
                            ref={tokenInputRef}
                            type="password"
                            placeholder="Paste your Cloudflare API Token here (e.g. 7abc89...)"
                            value={cfToken}
                            onChange={(e) => setCfToken(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none shadow-sm"
                          />
                        </div>

                        <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/70 text-[11px] text-slate-700 space-y-1">
                          <p className="font-bold text-amber-950 flex items-center gap-1">
                            <Key className="w-3.5 h-3.5 text-amber-700" />
                            How to get your Cloudflare API Token in 15 seconds:
                          </p>
                          <ol className="list-decimal pl-4 space-y-0.5 text-slate-600">
                            <li>
                              Open Cloudflare in a new tab:{" "}
                              <a
                                href="https://dash.cloudflare.com/profile/api-tokens"
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary-600 hover:underline font-bold inline-flex items-center gap-0.5"
                              >
                                My Profile → API Tokens <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </li>
                            <li>Click <strong>&quot;Create Token&quot;</strong> and select the <strong>&quot;Edit zone DNS&quot;</strong> template.</li>
                            <li>Under Zone Resources, select <strong>{cleanSelectedDomainName}</strong>, click Continue to summary, and copy your token here.</li>
                          </ol>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={handleCloudflareSync}
                            disabled={cfSyncing || !cfToken.trim()}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                          >
                            {cfSyncing ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Auto-Configuring Records...
                              </>
                            ) : (
                              <>
                                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Auto-Configure & Verify Now
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* DIVIDER */}
                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Alternative: Cloudflare OAuth
                        </span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      {/* SECONDARY: CLOUDFLARE OAUTH */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-[#F6821F] flex items-center justify-center text-white shadow-sm font-black text-sm">
                              ☁️
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <span>Sign in with Cloudflare OAuth</span>
                                <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${oauthConfigured ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                  {oauthConfigured ? "Configured" : "Requires App Setup"}
                                </span>
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Authorize Sendport directly via your Cloudflare account consent screen.
                              </p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleCloudflareOAuthClick}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-[#F6821F] fill-[#F6821F]" />
                          <span>{oauthConfigured ? "Authorize with Cloudflare" : "Configure Cloudflare OAuth Client"}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1 text-slate-400" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* TAB CONTENT: MANUAL DNS */
                <div className="space-y-3 font-mono text-xs">
                  {(() => {
                    const dkimVal = selectedDomain.dkimPublicKey
                      ? (selectedDomain.dkimPublicKey.startsWith("v=DKIM1") ? selectedDomain.dkimPublicKey : `v=DKIM1; k=rsa; p=${selectedDomain.dkimPublicKey}`)
                      : "v=DKIM1; k=rsa; p=...";
                    const spfVal = selectedDomain.spfRecord || "v=spf1 include:mail.getsendport.com ~all";
                    const dmarcVal = selectedDomain.dmarcRecord || "v=DMARC1; p=none; rua=mailto:dmarc@getsendport.com";

                    return (
                      <>
                        {/* DKIM */}
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                          <div className="flex justify-between items-center text-slate-500 font-sans text-xs font-semibold">
                            <span>1. DKIM Public Key (TXT Record)</span>
                            <button
                              onClick={() => handleCopy(dkimVal, "dkim")}
                              className="text-primary-600 hover:underline flex items-center gap-1 font-sans text-xs font-bold"
                            >
                              {copiedKey === "dkim" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              Copy Value
                            </button>
                          </div>
                          <div className="text-slate-700"><strong>Name:</strong> sendport._domainkey.{cleanSelectedDomainName}</div>
                          <div className="text-slate-700 break-all select-all font-mono text-[11px] bg-white p-2 rounded border border-slate-200 max-h-24 overflow-y-auto">
                            {dkimVal}
                          </div>
                        </div>

                        {/* SPF */}
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                          <div className="flex justify-between items-center text-slate-500 font-sans text-xs font-semibold">
                            <span>2. SPF Authorization (TXT Record)</span>
                            <button
                              onClick={() => handleCopy(spfVal, "spf")}
                              className="text-primary-600 hover:underline flex items-center gap-1 font-sans text-xs font-bold"
                            >
                              {copiedKey === "spf" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              Copy Value
                            </button>
                          </div>
                          <div className="text-slate-700"><strong>Name:</strong> @ (or {cleanSelectedDomainName})</div>
                          <div className="text-slate-700 break-all select-all font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                            {spfVal}
                          </div>
                        </div>

                        {/* DMARC */}
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                          <div className="flex justify-between items-center text-slate-500 font-sans text-xs font-semibold">
                            <span>3. DMARC Anti-Spoofing Policy (TXT Record)</span>
                            <button
                              onClick={() => handleCopy(dmarcVal, "dmarc")}
                              className="text-primary-600 hover:underline flex items-center gap-1 font-sans text-xs font-bold"
                            >
                              {copiedKey === "dmarc" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              Copy Value
                            </button>
                          </div>
                          <div className="text-slate-700"><strong>Name:</strong> _dmarc.{cleanSelectedDomainName}</div>
                          <div className="text-slate-700 break-all select-all font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                            {dmarcVal}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-400">DNS changes propagate worldwide in 5-15 mins.</span>
                <div className="flex items-center gap-2">
                  {selectedDomain.status !== "VERIFIED" && modalTab === "manual" && (
                    <button
                      onClick={() => handleVerifyDomain(selectedDomain)}
                      disabled={verifyingId === selectedDomain.id}
                      className="rounded-xl border border-emerald-600 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      Check & Verify DNS
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedDomain(null);
                      setCfSuccessMsg(null);
                    }}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CLOUDFLARE OAUTH APP SETUP HELP MODAL */}
      {showOauthSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="text-lg">☁️</span>
                <span>Cloudflare 1-Click OAuth Setup</span>
              </h3>
              <button
                onClick={() => setShowOauthSetupModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                To enable the direct <strong>&quot;Sign in with Cloudflare&quot;</strong> button for all users on your platform, add these two environment variables to your deployment settings:
              </p>

              <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-[11px] space-y-1">
                <div>CLOUDFLARE_CLIENT_ID=&quot;your_oauth_client_id&quot;</div>
                <div>CLOUDFLARE_CLIENT_SECRET=&quot;your_oauth_client_secret&quot;</div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <p className="font-bold">How to create a Cloudflare OAuth Client:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
                  <li>Go to Cloudflare Dashboard → <strong>Manage Account</strong> → <strong>OAuth clients</strong>.</li>
                  <li>Click <strong>Create client</strong>.</li>
                  <li>Set the Redirect URI to: <code className="bg-amber-100 px-1 rounded">https://getsendport.com/api/auth/cloudflare/callback</code></li>
                  <li>Select the required scopes: <code className="bg-amber-100 px-1 rounded">#dns_records:edit</code> and <code className="bg-amber-100 px-1 rounded">#zone:read</code>.</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[11px]">Want instant verification right now without any server setup?</p>
                  <p className="text-[11px] text-emerald-800">Paste your Cloudflare API Token to configure all records in 10 seconds!</p>
                </div>
                <button
                  onClick={() => {
                    setShowOauthSetupModal(false);
                    tokenInputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-[11px] hover:bg-emerald-800 shrink-0 ml-2 cursor-pointer"
                >
                  Use Token
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowOauthSetupModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DOMAIN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Add Sending Domain</h3>
            <p className="text-xs text-slate-500">
              Enter your domain to generate 2048-bit RSA DKIM keys or auto-connect with Cloudflare.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Domain Name</label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. acme.corp or mail.startup.io"
                value={newDomainName}
                onChange={(e) => setNewDomainName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDomain();
                  }
                }}
                style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 font-bold focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:outline-none shadow-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={addingDomain || !newDomainName.trim()}
                onClick={handleAddDomain}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                {addingDomain ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Records"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE PLAN MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold border border-primary-100">
                <Sparkles className="w-3.5 h-3.5 text-primary-600" /> Growth Plan Required
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">
                Domain Limit Reached ({domains.length} / {planInfo.limit >= 999 ? "∞" : planInfo.limit})
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The free <strong>Starter Plan</strong> allows 1 verified custom domain. To connect multiple domains, send up to 3,000 emails/day, and access 30-day logs, upgrade to the <strong>Growth Plan</strong>.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Growth Plan Features</span>
                <span className="text-primary-600 font-extrabold">$20 / month</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Up to 5 Custom Verified Domains
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 3,000 Emails / Day (90,000 / month)
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Automated 30-Day Domain Warmup
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Audience Contact Manager & 30-Day Logs
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Maybe Later
              </button>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
              >
                Upgrade to Growth <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
