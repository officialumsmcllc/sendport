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
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ id: string; email: string; name?: string; role: string } | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [pendingSlipsCount, setPendingSlipsCount] = useState<number>(0);

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

  const navItems = [
    { label: "Executive Mission Control", href: "/admin", icon: ShieldAlert },
    { label: "Payment Slip Approvals", href: "/admin/payments", icon: CreditCard, badge: pendingSlipsCount },
    { label: "Global Analytics & Revenue", href: "/admin/analytics", icon: BarChart3 },
    { label: "Customer Domains", href: "/admin/domains", icon: Globe2 },
    { label: "Global Email Logs", href: "/admin/logs", icon: Mail },
    { label: "User Accounts & Quotas", href: "/admin/users", icon: Users },
    { label: "Manual Subscriptions", href: "/admin/subscriptions", icon: Sparkles },
    { label: "Infrastructure & SMTP", href: "/admin/system", icon: Server },
    { label: "Promo Codes & Discounts", href: "/admin/coupons", icon: Tag },
    { label: "Platform Broadcasts", href: "/admin/broadcasts", icon: Megaphone },
    { label: "Security & Audit Logs", href: "/admin/audit", icon: ShieldCheck },
  ];

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
      {/* DESKTOP ADMIN SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-slate-800 bg-slate-900/90 p-4 shrink-0 shadow-2xl backdrop-blur-xl">
        <div className="space-y-4">
          {/* Logo & Administration Tag */}
          <div className="px-2 pt-1">
            <div className="flex items-center justify-between">
              <Link href="/admin">
                <SendportLogo size={28} dark={true} />
              </Link>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-amber-400 border border-amber-500/30 tracking-wider">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-1.5">Platform Administration</p>
          </div>

          {/* Superadmin Context Box */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5">
            <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-0.5">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Lock className="w-3 h-3" /> Root Access
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] font-mono text-slate-300 truncate font-medium">
              {adminUser?.email || "admin@getsendport.com"}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-0.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
            <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Management Modules
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? "bg-slate-950 text-amber-400" : "bg-amber-500 text-slate-950"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-800/80 pt-3 space-y-2 px-1">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold transition-colors"
          >
            <span className="flex items-center gap-1.5 text-[11px]">
              <ArrowLeft className="w-3.5 h-3.5" /> Customer Dashboard
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" /> Admin Sign Out
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-slate-950 p-4 border-r border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <SendportLogo size={26} dark={true} />
              <button onClick={() => setMobileNavOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="mt-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
                      isActive ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-amber-400" />
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
            </nav>
          </div>
        </div>
      )}

      {/* MAIN ADMIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="flex lg:hidden items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <SendportLogo size={24} dark={true} />
            <span className="text-[10px] font-bold text-amber-400 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 rounded">
              ADMIN
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 truncate max-w-[150px]">
            {adminUser?.email}
          </span>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
