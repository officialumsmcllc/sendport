"use client";

import React, { useState, useEffect } from "react";
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
  ArrowRight,
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

          // Keep selectedDomain synced with latest data if modal is open
          if (selectedDomain) {
            const updatedSelected = mapped.find((m) => m.id === selectedDomain.id);
            if (updatedSelected) {
              setSelectedDomain(updatedSelected);
            }
          }
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
        const isNowVerified = data.status === "VERIFIED" || (data.spfValid && data.dkimValid);
        setBannerNotice({
          type: isNowVerified ? "success" : "error",
          message: data.message || (isNowVerified ? `Domain '${dom.name}' verified successfully!` : "DNS records are still propagating or incomplete."),
        });
        await fetchDomains();
      } else {
        setBannerNotice({
          type: "error",
          message: data.error || "Failed to verify DNS records.",
        });
      }
    } catch {
      setBannerNotice({
        type: "error",
        message: "Network error checking DNS verification.",
      });
    } finally {
      setVerifyingId(null);
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
        setBannerNotice({
          type: "success",
          message: `Domain '${dom.name}' was removed.`,
        });
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
            Configure custom domains with 2048-bit RSA DKIM keys, SPF authentication, and DMARC alignment.
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
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-slate-200 rounded-full" />
                  <div className="h-4 w-36 bg-slate-200 rounded" />
                </div>
                <div className="h-5 w-24 bg-slate-100 rounded-full" />
                <div className="h-4 w-28 bg-slate-100 rounded" />
                <div className="h-7 w-20 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : domains.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Globe className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">No Sending Domains Added Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your domain to generate 2048-bit DKIM keys, SPF authentication, and DMARC records.
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
                      {dom.status === "VERIFIED" || dom.dkimValid ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> 2048-bit RSA Active
                        </span>
                      ) : (
                        <span className="text-slate-400">DNS record pending</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {dom.status === "VERIFIED" || dom.spfValid ? (
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
                          onClick={() => setSelectedDomain(dom)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline px-2 py-1 rounded hover:bg-primary-50"
                        >
                          View DNS Records
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

      {/* DEDICATED MANUAL DNS RECORDS MODAL */}
      {selectedDomain && (() => {
        const cleanSelectedDomainName = selectedDomain.name.replace(/\/+$/, "");

        const dkimHost = `sendport._domainkey.${cleanSelectedDomainName}`;
        const dkimVal = selectedDomain.dkimPublicKey
          ? (selectedDomain.dkimPublicKey.startsWith("v=DKIM1") ? selectedDomain.dkimPublicKey : `v=DKIM1; k=rsa; p=${selectedDomain.dkimPublicKey}`)
          : "v=DKIM1; k=rsa; p=...";

        const spfHost = cleanSelectedDomainName;
        const spfVal = selectedDomain.spfRecord || "v=spf1 include:mail.getsendport.com ~all";

        const dmarcHost = `_dmarc.${cleanSelectedDomainName}`;
        const dmarcVal = selectedDomain.dmarcRecord || "v=DMARC1; p=none; rua=mailto:dmarc@getsendport.com";

        const mxHost = cleanSelectedDomainName;
        const mxVal = "inbound.getsendport.com";

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-slate-100">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      DNS Records for <span className="font-mono text-primary-600">{cleanSelectedDomainName}</span>
                    </h3>
                    {selectedDomain.status === "VERIFIED" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Verification Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Add the following DNS records in your domain provider (e.g. Cloudflare, GoDaddy, Namecheap, Route53, Hostinger).
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDomain(null)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕ Close
                </button>
              </div>

              {/* RECORDS LIST */}
              <div className="space-y-4">
                {/* 1. DKIM RECORD */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-mono font-bold text-[11px]">
                        TXT
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        1. DKIM Public Key (2048-bit Authentication)
                      </span>
                    </div>
                    {selectedDomain.dkimValid || selectedDomain.status === "VERIFIED" ? (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Pending check
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span>Host / Name</span>
                        <button
                          onClick={() => handleCopy(dkimHost, "dkim-name")}
                          className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 text-[11px]"
                        >
                          {copiedKey === "dkim-name" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          Copy Host
                        </button>
                      </div>
                      <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-800 break-all select-all">
                        {dkimHost}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span>TTL</span>
                      </div>
                      <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-800">
                        Auto (or 300 / 3600)
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>Value / Content</span>
                      <button
                        onClick={() => handleCopy(dkimVal, "dkim-val")}
                        className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 text-[11px]"
                      >
                        {copiedKey === "dkim-val" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        Copy Full Value
                      </button>
                    </div>
                    <div className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 break-all select-all max-h-24 overflow-y-auto leading-relaxed">
                      {dkimVal}
                    </div>
                  </div>
                </div>

                {/* 2. SPF RECORD */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-mono font-bold text-[11px]">
                        TXT
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        2. SPF Authorization (Sender Policy Framework)
                      </span>
                    </div>
                    {selectedDomain.spfValid || selectedDomain.status === "VERIFIED" ? (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Pending check
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span>Host / Name</span>
                        <button
                          onClick={() => handleCopy(spfHost, "spf-name")}
                          className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 text-[11px]"
                        >
                          {copiedKey === "spf-name" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          Copy Host
                        </button>
                      </div>
                      <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-800 break-all select-all">
                        @ (or {cleanSelectedDomainName})
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span>TTL</span>
                      </div>
                      <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-800">
                        Auto (or 300 / 3600)
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>Value / Content</span>
                      <button
                        onClick={() => handleCopy(spfVal, "spf-val")}
                        className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 text-[11px]"
                      >
                        {copiedKey === "spf-val" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        Copy Value
                      </button>
                    </div>
                    <div className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 break-all select-all leading-relaxed">
                      {spfVal}
                    </div>
                  </div>
                </div>

                {/* 3. DMARC RECORD */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-mono font-bold text-[11px]">
                        TXT
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        3. DMARC Anti-Spoofing Alignment
                      </span>
                    </div>
                    {selectedDomain.dmarcValid || selectedDomain.status === "VERIFIED" ? (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Pending check
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span>Host / Name</span>
                        <button
                          onClick={() => handleCopy(dmarcHost, "dmarc-name")}
                          className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 text-[11px]"
                        >
                          {copiedKey === "dmarc-name" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          Copy Host
                        </button>
                      </div>
                      <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-800 break-all select-all">
                        {dmarcHost}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span>TTL</span>
                      </div>
                      <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-800">
                        Auto (or 300 / 3600)
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>Value / Content</span>
                      <button
                        onClick={() => handleCopy(dmarcVal, "dmarc-val")}
                        className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 text-[11px]"
                      >
                        {copiedKey === "dmarc-val" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        Copy Value
                      </button>
                    </div>
                    <div className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 break-all select-all leading-relaxed">
                      {dmarcVal}
                    </div>
                  </div>
                </div>

                {/* 4. MX RECORD (OPTIONAL) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-mono font-bold text-[11px]">
                        MX
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        4. Inbound Routing (Optional)
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Optional
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Only configure if you want Sendport to receive and forward incoming replies sent to your domain.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 mb-1">Host / Name</div>
                      <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-800">
                        @ (or {cleanSelectedDomainName})
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 mb-1">Priority</div>
                      <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-800">
                        10
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                        <span>Server Value</span>
                        <button
                          onClick={() => handleCopy(mxVal, "mx-val")}
                          className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 text-[11px]"
                        >
                          {copiedKey === "mx-val" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                      </div>
                      <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-800">
                        {mxVal}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-200">
                <span className="text-xs text-slate-500">
                  DNS updates typically propagate within 5-15 minutes.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerifyDomain(selectedDomain)}
                    disabled={verifyingId === selectedDomain.id}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {verifyingId === selectedDomain.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying DNS...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" /> Check & Verify DNS
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedDomain(null)}
                    className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ADD DOMAIN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Add Sending Domain</h3>
            <p className="text-xs text-slate-500">
              Enter your domain name to generate unique 2048-bit RSA DKIM keys, SPF, and DMARC authentication records.
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
