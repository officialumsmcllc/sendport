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
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ id: string; email: string; name?: string; role: string } | null>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
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
            // Not an admin - kick back to customer dashboard
            router.push("/dashboard?error=unauthorized_admin_access");
          } else {
            setAdminUser(data.user);
          }
        }
      })
      .catch(() => {
        router.push("/login?redirect=/admin");
      })
      .finally(() => {
        setVerifying(false);
      });
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

  const navItems = [
    { label: "Payment Slip Approvals", href: "/admin", icon: CreditCard },
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
            <p className="text-xs font-bold text-white truncate">{adminUser?.email || "admin@getsendport.com"}</p>
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
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                  <span className="truncate">{item.label}</span>
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
            <nav className="mt-4 space-y-1 overflow-y-auto max-h-[70vh]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold ${
                      isActive ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto pt-4 border-t border-slate-800 space-y-2">
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Customer Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-2 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-semibold"
              >
                Admin Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN ADMIN CONTENT */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="text-amber-400 font-bold">Admin Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white capitalize">
                {pathname === "/admin"
                  ? "Payment Slip Verification"
                  : pathname.split("/")[2]?.replace(/-/g, " ") || "Overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Customer View
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> System Live
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
