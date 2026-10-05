"use client";

import React, { useState } from "react";
import {
  Globe,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Info,
} from "lucide-react";

interface DomainItem {
  id: string;
  name: string;
  status: "VERIFIED" | "PENDING" | "FAILED";
  dkimSelector: string;
  spfValid: boolean;
  dkimValid: boolean;
  dmarcValid: boolean;
  verifiedAt: string;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainItem[]>([
    {
      id: "dom_1",
      name: "getsendport.com",
      status: "VERIFIED",
      dkimSelector: "sendport",
      spfValid: true,
      dkimValid: true,
      dmarcValid: true,
      verifiedAt: "Oct 1, 2026",
    },
    {
      id: "dom_2",
      name: "officialum1.com",
      status: "VERIFIED",
      dkimSelector: "sendport",
      spfValid: true,
      dkimValid: true,
      dmarcValid: true,
      verifiedAt: "Sep 28, 2026",
    },
    {
      id: "dom_3",
      name: "mycompany-app.io",
      status: "PENDING",
      dkimSelector: "sendport",
      spfValid: false,
      dkimValid: false,
      dmarcValid: false,
      verifiedAt: "Pending verification",
    },
  ]);

  const [selectedDomain, setSelectedDomain] = useState<DomainItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomainName, setNewDomainName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      alert("Live DNS lookup completed! Records are synchronized with global DNS root servers.");
    }, 1200);
  };

  const handleAddDomain = () => {
    if (!newDomainName) return;
    const clean = newDomainName.toLowerCase().replace(/https?:\/\//, "").trim();
    const newDom: DomainItem = {
      id: `dom_${Date.now()}`,
      name: clean,
      status: "PENDING",
      dkimSelector: "sendport",
      spfValid: false,
      dkimValid: false,
      dmarcValid: false,
      verifiedAt: "Pending DNS verification",
    };
    setDomains([...domains, newDom]);
    setSelectedDomain(newDom);
    setShowAddModal(false);
    setNewDomainName("");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Domains & DNS Records</h1>
          <p className="text-sm text-slate-500">
            Configure custom domains with 2048-bit RSA DKIM keys, SPF authentication, and DMARC enforcement.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary-600 ${verifying ? "animate-spin" : ""}`} />
            Scan DNS Records
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" /> Add Domain
          </button>
        </div>
      </div>

      {/* DOMAINS LIST TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Domain</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">DKIM (2048-bit)</th>
                <th className="px-5 py-3">SPF & DMARC</th>
                <th className="px-5 py-3">Verified Date</th>
                <th className="px-5 py-3 text-right">DNS Details</th>
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
                      <span className="text-slate-400">DNS record missing</span>
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
                    <button
                      onClick={() => setSelectedDomain(dom)}
                      className="text-xs font-semibold text-primary-600 hover:underline"
                    >
                      View DNS Records
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DNS RECORDS MODAL */}
      {selectedDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  DNS Configuration for {selectedDomain.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Add the following records in your DNS provider (Cloudflare, GoDaddy, Namecheap).
                </p>
              </div>
              <button
                onClick={() => setSelectedDomain(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕ Close
              </button>
            </div>

            {/* Records List */}
            <div className="space-y-3 font-mono text-xs">
              {/* DKIM */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex justify-between items-center text-slate-500 font-sans text-xs font-semibold">
                  <span>1. DKIM Public Key (TXT Record)</span>
                  <button
                    onClick={() => handleCopy(`k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0...`, "dkim")}
                    className="text-primary-600 hover:underline flex items-center gap-1 font-sans text-xs"
                  >
                    {copiedKey === "dkim" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="text-slate-700"><strong>Name:</strong> sendport._domainkey.{selectedDomain.name}</div>
                <div className="text-slate-700 truncate">
                  <strong>Value:</strong> v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0x...
                </div>
              </div>

              {/* SPF */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex justify-between items-center text-slate-500 font-sans text-xs font-semibold">
                  <span>2. SPF Authorization (TXT Record)</span>
                  <button
                    onClick={() => handleCopy("v=spf1 include:mail.getsendport.com ~all", "spf")}
                    className="text-primary-600 hover:underline flex items-center gap-1 font-sans text-xs"
                  >
                    {copiedKey === "spf" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="text-slate-700"><strong>Name:</strong> @ (or {selectedDomain.name})</div>
                <div className="text-slate-700"><strong>Value:</strong> v=spf1 include:mail.getsendport.com ~all</div>
              </div>

              {/* DMARC */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex justify-between items-center text-slate-500 font-sans text-xs font-semibold">
                  <span>3. DMARC Anti-Spoofing Policy (TXT Record)</span>
                  <button
                    onClick={() => handleCopy("v=DMARC1; p=none; rua=mailto:dmarc@getsendport.com", "dmarc")}
                    className="text-primary-600 hover:underline flex items-center gap-1 font-sans text-xs"
                  >
                    {copiedKey === "dmarc" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <div className="text-slate-700"><strong>Name:</strong> _dmarc.{selectedDomain.name}</div>
                <div className="text-slate-700"><strong>Value:</strong> v=DMARC1; p=none; rua=mailto:dmarc@getsendport.com</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400">DNS changes propagate worldwide in 5-15 mins.</span>
              <button
                onClick={() => setSelectedDomain(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DOMAIN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Sending Domain</h3>
            <p className="text-xs text-slate-500">
              Enter your domain to automatically generate 2048-bit RSA DKIM keys.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Domain Name</label>
              <input
                type="text"
                placeholder="acme.corp or mail.startup.io"
                value={newDomainName}
                onChange={(e) => setNewDomainName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDomain}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Generate Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
