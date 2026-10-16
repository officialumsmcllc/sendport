"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SendportLogo } from "@/components/brand/Logo";
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
  SlidersHorizontal,
  Command,
  FileText,
  MessageSquare,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ id: string; email: string; name?: string; role: string } | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [pendingSlipsCount, setPendingSlipsCount] = useState<number>(0);
  const [newTicketsCount, setNewTicketsCount] = useState<number>(0);

  // Command Palette State
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");
  const [paletteSelectedIndex, setPaletteSelectedIndex] = useState(0);

  const navSections = [
    {
      title: "OPERATIONS",
      items: [
        { label: "Executive Mission Control", href: "/admin", icon: ShieldAlert, description: "System throughput, KPIs & health", category: "Operations" },
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
        if (u && u.role === "ADMIN") {
          setAdminUser(u);
          setVerifying(false);
        }
      }
    } catch (e) {}

    // 2. Validate in background with server session
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login?redirect=/admin");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          if (data.user.role !== "ADMIN") {
            router.push("/dashboard?error=unauthorized_admin_access");
          } else {
            setAdminUser(data.user);
            try {
              localStorage.setItem("sendport_user", JSON.stringify(data.user));
            } catch (e) {}
          }
        }
      })
      .catch(() => {
        router.push("/login?redirect=/admin");
      })
      .finally(() => {
        setVerifying(false);
      });

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
  }, [router, pathname]);

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
      item.description?.toLowerCase().includes(paletteSearch.toLowerCase())
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

  if (verifying) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent mb-4" />
        <p className="text-xs font-mono uppercase tracking-wider text-amber-400">Verifying Admin Credentials...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* COMMAND PALETTE MODAL */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950/80">
              <Search className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search admin module or use ↑ ↓ to navigate, ↵ to jump..."
                value={paletteSearch}
                onChange={(e) => {
                  setPaletteSearch(e.target.value);
                  setPaletteSelectedIndex(0);
                }}
                onKeyDown={handlePaletteKeyDown}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  ↑↓ Navigate
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  ↵ Jump
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  ESC
                </span>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              <div className="flex items-center justify-between px-3 py-1.5">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  Platform Administration Modules
                </p>
                <span className="text-[10px] font-mono text-amber-400">
                  {filteredPaletteItems.length} available
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
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                        isSelected
                          ? "bg-amber-500/15 border border-amber-500/40 text-white shadow-sm"
                          : "hover:bg-slate-800/60 text-slate-300 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg border transition-colors ${
                            isSelected
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                              : "bg-slate-950 border-slate-800 text-amber-400"
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
                                {item.badge} pending
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

      {/* DESKTOP ADMIN SIDEBAR */}
      <aside className="hidden lg:flex w-72 h-screen sticky top-0 flex-col justify-between border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl shrink-0 z-30 shadow-2xl">
        {/* Top Header & Superadmin Context */}
        <div className="p-4 pb-3 space-y-3 shrink-0 border-b border-slate-900">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <SendportLogo size={28} dark={true} />
            </Link>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-amber-400 border border-amber-500/25 tracking-wider">
                ROOT ADMIN
              </span>
            </div>
          </div>

          {/* Superadmin Context Box */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5 flex items-center justify-between">
            <div className="min-w-0 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Root Access</p>
                <p className="text-[11px] font-mono text-slate-200 truncate font-semibold">
                  {adminUser?.email || "admin@getsendport.com"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Command Palette Button */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-900 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs">Quick Search...</span>
            </div>
            <kbd className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Scrollable Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-2.5 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                {section.title}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-l-2 border-amber-400 text-white font-bold shadow-sm"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            : "text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-900"
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

        {/* Pinned Bottom Footer Actions */}
        <div className="p-3 border-t border-slate-900 bg-slate-950/80 shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold transition-colors"
            >
              <span className="flex items-center gap-1.5 text-[11px]">
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" /> Customer App
              </span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>

            <Link
              href="/"
              className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold transition-colors"
              title="Visit Public Website"
            >
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">Site</span>
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out Root Admin
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-slate-950 p-4 border-r border-slate-800 justify-between">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <SendportLogo size={26} dark={true} />
                  <button onClick={() => setMobileNavOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="mt-4 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
                  {navSections.map((section) => (
                    <div key={section.title} className="space-y-1">
                      <p className="px-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
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
                                : "text-slate-300 hover:bg-slate-800"
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

              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-300 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-300 text-xs font-semibold"
                  >
                    <Globe2 className="w-3.5 h-3.5" /> Site
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-semibold"
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
        {/* Top Header Bar with Command Palette Trigger */}
        <header className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-white">Sendport Platform Root</span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                PostgreSQL Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 hover:text-white hover:border-slate-700 transition-colors shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Search modules or press</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                ⌘K
              </span>
            </button>
            <span className="text-[11px] font-mono text-slate-400 truncate max-w-[160px] hidden md:inline">
              {adminUser?.email}
            </span>
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
