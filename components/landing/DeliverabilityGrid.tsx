"use client";

import React from "react";
import {
  Ban,
  Inbox,
  ShieldCheck,
  Server,
  UserX,
  Activity,
  CheckCircle2,
  Lock,
  Layers,
} from "lucide-react";

export function DeliverabilityGrid() {
  const features = [
    {
      icon: Ban,
      title: "Proactive blocklist tracking",
      description:
        "Be the first to know if your domain is added to DNSBLs such as Spamhaus with automated removal assistance.",
    },
    {
      icon: Inbox,
      title: "Faster time to inbox",
      description:
        "Send emails from the region closest to your users. Sub-10ms delivery latency with North American, European, and Asian routing.",
    },
    {
      icon: ShieldCheck,
      title: "Build confidence with BIMI",
      description:
        "Showcase your verified brand logo in supported inbox providers and receive guidance to obtain a VMC checkmark.",
    },
    {
      icon: Server,
      title: "Managed dedicated IPs",
      description:
        "Get a fully managed dedicated IP that automatically warms up and autoscales based on your sending volume with zero waiting period.",
    },
    {
      icon: UserX,
      title: "Dynamic suppression list",
      description:
        "Prevent repeated sending to recipients who bounce or unsubscribe to comply with global CAN-SPAM and GDPR standards.",
    },
    {
      icon: Activity,
      title: "IP and domain monitoring",
      description:
        "Monitor your DNS configuration for any errors or regressions. Be notified immediately of changes that could hurt deliverability.",
    },
    {
      icon: CheckCircle2,
      title: "Verify DNS records in seconds",
      description:
        "Protect your sender reputation with 2048-bit RSA DKIM keys and SPF records verified in a single click.",
    },
    {
      icon: Layers,
      title: "Battle-tested infrastructure",
      description:
        "Rely on a platform of trustworthy sender IPs with distributed workloads and isolated traffic pools.",
    },
    {
      icon: Lock,
      title: "Prevent spoofing with DMARC",
      description:
        "Avoid domain impersonation by configuring strict DMARC policies and instructing inbox providers on how to treat unauthenticated email.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Reach humans,{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            not spam folders
          </span>
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Built-in deliverability intelligence so your critical transactional and marketing emails land directly in the primary inbox.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800/80 bg-slate-950 p-6 flex flex-col justify-start hover:border-slate-700 transition-all hover:bg-slate-900/60 group shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 mb-4 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
