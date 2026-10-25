"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SendportLogo } from "@/components/brand/Logo";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import {
  CreditCard,
  Users,
  ShieldCheck,
  BarChart3,
  Server,
  Tag,
  Megaphone,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Lock,
  Globe2,
  Mail,
  Sparkles,
  ShieldAlert,
  Search,
  BookUser,
  FileText,
  MessageSquare,
  Activity,
  Terminal,
  Cpu,
  Layers,
  ChevronDown,
  Send,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ id: string; email: string; name?: string; role: string } | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("sendport_user");
        if (cached) {
          const u = JSON.parse(cached);
          if (u && isSuperAdminUser(u.email, u.role)) return u;
        }
      } catch (_) {}
    }
    return null;
  });
  const [pendingSlipsCount, setPendingSlipsCount] = useState<number>(0);
  const [newTicketsCount, setNewTicketsCount] = useState<number>(0);

  // Command Palette State
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");
  const [paletteSelectedIndex, setPaletteSelectedIndex] = useState(0);

  const navSections = [
    {
      title: "OPERATIONS & CONTROL",
      items: [
        { label: "Executive Mission Control", href: "/admin", icon: ShieldAlert, description: "Live cluster throughput, KPIs & real-time telemetry", category: "Operations" },
        { label: "Support Tickets & Inbox", href: "/admin/support", icon: MessageSquare, badge: newTicketsCount, description: "Customer inquiries & direct DKIM email replies", category: "Action Required" },
        { label: "Payment Slip Approvals", href: "/admin/payments", icon: CreditCard, badge: pendingSlipsCount, description: "Review manual bank & crypto transfers", category: "Action Required" },
        { label: "Global Analytics & Revenue", href: "/admin/analytics", icon: BarChart3, description: "Platform revenue & volume projections", category: "Operations" },
      ],
    },
    {
      title: "TENANTS & AUDIENCES",
      items: [
        { label: "User Accounts & Quotas", href: "/admin/users", icon: Users, description: "Plan switches, RBAC & custom send limits", category: "Tenants" },
        { label: "Customer Contacts & Lists", href: "/admin/contacts", icon: BookUser, description: "Global directory of customer audiences & leads", category: "Audience" },
        { label: "Customer Domains & DKIM", href: "/admin/domains", icon: Globe2, description: "DKIM, SPF and DoH verification records", category: "Infrastructure" },
        { label: "User Email Templates", href: "/admin/templates", icon: FileText, description: "Audit & inspect customer HTML templates", category: "Content" },
      ],
    },
    {
      title: "DELIVERY & INFRASTRUCTURE",
      items: [
        { label: "Global Campaigns & Blasts", href: "/admin/campaigns", icon: Send, description: "Bulk campaigns, sent & remaining telemetry", category: "Delivery" },
        { label: "Global Email Logs", href: "/admin/logs", icon: Mail, description: "Inspect message IDs, latency & bounces", category: "Delivery" },
        { label: "Infrastructure & SMTP", href: "/admin/system", icon: Server, description: "SMTP relay daemon & node diagnostics", category: "Infrastructure" },
        { label: "Platform Broadcasts", href: "/admin/broadcasts", icon: Megaphone, description: "Announcements & system notifications", category: "Delivery" },
      ],
    },
    {
      title: "BILLING & GOVERNANCE",
      items: [
        { label: "Manual Subscriptions", href: "/admin/subscriptions", icon: Sparkles, description: "Active recurring subscriptions ledger", category: "Billing" },
        { label: "Promo Codes & Discounts", href: "/admin/coupons", icon: Tag, description: "Promotional credit codes & vouchers", category: "Billing" },
        { label: "Security & Audit Logs", href: "/admin/audit", icon: ShieldCheck, description: "Immutable root access & login journal", category: "Security" },
      ],
    },
  ];

  const navItems = navSections.flatMap((s) => s.items);

  // Derive current breadcrumb label
  const currentNavItem = navItems.find((item) => item.href === pathname);
  const pageTitle = currentNavItem?.label || "Mission Control";

  // Cmd+K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
        setPaletteSelectedIndex(0);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    // 1. Instant optimistic auth check from localStorage cache
    try {
      const cached = localStorage.getItem("sendport_user");
      if (cached) {
        const u = JSON.parse(cached);
        if (u && isSuperAdminUser(u.email, u.role)) {
          setAdminUser(u);
        }
      }
    } catch (e) {}

    // 2. Validate in background with server session without kicking user out
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          const isSuper = isSuperAdminUser(data.user.email, data.user.role);
          if (!isSuper) {
            window.location.href = "/dashboard?error=unauthorized_admin_access";
          } else {
            setAdminUser(data.user);
            try {
              localStorage.setItem("sendport_user", JSON.stringify(data.user));
            } catch (e) {}
          }
        }
      })
      .catch(() => {});

    // 3. Fetch pending payment slips count for live badge
    fetch("/api/admin/payments")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.transactions) {
          const pending = data.transactions.filter((t: any) => t.status === "PENDING").length;
          setPendingSlipsCount(pending);
        }
      })
      .catch(() => {});

    // 4. Fetch new support tickets count for live badge
    fetch("/api/admin/support")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.counts?.new !== undefined) {
          setNewTicketsCount(data.counts.new);
        }
      })
      .catch(() => {});
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    try {
      localStorage.removeItem("sendport_user");
    } catch (e) {}
    router.push("/login");
    router.refresh();
  };

  const filteredPaletteItems = navItems.filter(
    (item) =>
      item.label.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      item.description?.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(paletteSearch.toLowerCase())
  );

  const handlePaletteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredPaletteItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setPaletteSelectedIndex((prev) => (prev + 1) % filteredPaletteItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setPaletteSelectedIndex((prev) => (prev - 1 + filteredPaletteItems.length) % filteredPaletteItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filteredPaletteItems[paletteSelectedIndex];
      if (target) {
        router.push(target.href);
        setPaletteOpen(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200 antialiased">
      {/* COMMAND PALETTE MODAL */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d1424] shadow-2xl overflow-hidden ring-1 ring-white/10">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-[#080d19]">
              <Search className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search admin modules..."
                value={paletteSearch}
                onChange={(e) => {
                  setPaletteSearch(e.target.value);
                  setPaletteSelectedIndex(0);
                }}
                onKeyDown={handlePaletteKeyDown}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  ↑↓ Navigate
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  ↵ Select
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  ESC
                </span>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              <div className="flex items-center justify-between px-3 py-1.5">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  Platform Navigation
                </p>
                <span className="text-[10px] font-mono text-amber-400">
                  {filteredPaletteItems.length} results
                </span>
              </div>

              {filteredPaletteItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No matching admin modules found for &quot;{paletteSearch}&quot;.
                </div>
              ) : (
                filteredPaletteItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === paletteSelectedIndex;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setPaletteOpen(false);
                      }}
                      onMouseEnter={() => setPaletteSelectedIndex(index)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                        isSelected
                          ? "bg-amber-500/15 border border-amber-500/40 text-white shadow-sm"
                          : "hover:bg-slate-800/40 text-slate-300 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg border transition-colors ${
                            isSelected
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                              : "bg-[#080d19] border-white/5 text-amber-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-200"}`}>
                              {item.label}
                            </span>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-sm">{item.description}</div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-colors ${
                          isSelected ? "text-amber-400 translate-x-0.5" : "text-slate-600"
                        }`}
                      />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODERN DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 h-screen sticky top-0 flex-col justify-between border-r border-white/5 bg-[#090f1d] shrink-0 z-30 shadow-2xl">
        {/* Top Header & Superadmin Context */}
        <div className="p-4 pb-3 space-y-3 shrink-0 border-b border-white/5">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <SendportLogo size={28} dark={true} showText={false} />
              <div>
                <span className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                  Sendport <span className="text-amber-400 font-mono text-[10px] tracking-widest uppercase px-1 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">Admin</span>
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-emerald-400 border border-emerald-500/20">
                PROD
              </span>
            </div>
          </div>

          {/* Superadmin Context Card */}
          <div className="rounded-xl border border-white/5 bg-[#0e1629] p-2.5 flex items-center justify-between shadow-inner" suppressHydrationWarning>
            <div className="min-w-0 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm" suppressHydrationWarning>
                {adminUser?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate" suppressHydrationWarning>
                    {adminUser?.name || "Root Admin"}
                  </span>
                  <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                    SU
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 truncate" suppressHydrationWarning>
                  {adminUser?.email || "admin@getsendport.com"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Command Palette Button */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#0e1629] border border-white/5 text-xs text-slate-400 hover:text-white hover:border-amber-500/30 hover:bg-[#121c33] transition-all shadow-sm cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-amber-400/80 group-hover:text-amber-400" />
              <span className="text-xs font-medium">Quick Find...</span>
            </div>
            <kbd className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-white/5 group-hover:border-white/10">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Scrollable Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-2.5 text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                {section.title}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-l-2 border-amber-400 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-xs"
                            : "text-slate-400 group-hover:text-amber-400 group-hover:bg-[#0e1629]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-500 text-slate-950 animate-pulse shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Pinned Bottom Node Telemetry & Footer Actions */}
        <div className="p-3 border-t border-white/5 bg-[#070c18] shrink-0 space-y-2.5">
          {/* Active Sending Node Micro-Widget */}
          <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-mono font-bold text-emerald-400 truncate">
                  NYC1 Droplet • Active
                </p>
                <p className="text-[9px] font-mono text-slate-400 truncate">
                  142.93.120.58 (MTA Node)
                </p>
              </div>
            </div>
            <span className="text-[9px] font-mono text-emerald-300/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
              2048 RSA
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-white/5 bg-[#0e1629] text-slate-300 hover:bg-[#141f38] hover:text-white text-xs font-semibold transition-colors"
            >
              <span className="flex items-center gap-1.5 text-[11px]">
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" /> Customer App
              </span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg border border-white/5 bg-[#0e1629] text-slate-300 hover:bg-[#141f38] hover:text-white text-xs font-semibold transition-colors"
              title="Visit Public Website"
            >
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">Site</span>
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out Root
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-[#090f1d] p-4 border-r border-white/10 justify-between">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <SendportLogo size={26} dark={true} />
                  <button onClick={() => setMobileNavOpen(false)} className="p-1 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="mt-4 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
                  {navSections.map((section) => (
                    <div key={section.title} className="space-y-1">
                      <p className="px-2 text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                        {section.title}
                      </p>
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileNavOpen(false)}
                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
                              isActive
                                ? "bg-amber-500 text-slate-950 font-bold"
                                : "text-slate-300 hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="border-t border-white/10 pt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-white/10 bg-[#0e1629] text-slate-300 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg border border-white/10 bg-[#0e1629] text-slate-300 text-xs font-semibold"
                  >
                    <Globe2 className="w-3.5 h-3.5" /> Site
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-300 text-xs font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN ADMIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar with Breadcrumbs & Global Controls */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/5 bg-[#090f1d]/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-400">Admin</span>
              <span className="text-slate-600">/</span>
              <span className="font-bold text-white flex items-center gap-1.5">
                {pageTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Infrastructure Status */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cluster Live • NYC1</span>
            </div>

            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e1629] border border-white/5 text-xs text-slate-400 hover:text-white hover:border-white/10 transition-colors shadow-sm cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-xs">Search</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-white/5">
                ⌘K
              </span>
            </button>

            <Link
              href="/dashboard"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all"
            >
              <span>Buyer View</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
