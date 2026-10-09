"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SendportLogo } from "@/components/brand/Logo";
import {
  LayoutDashboard,
  Globe,
  Server,
  Key,
  Send,
  Sparkles,
  FileCode,
  Split,
  Inbox,
  ShieldCheck,
  Ban,
  CreditCard,
  Lock,
  Menu,
  X,
  ShieldAlert,
  ArrowUpRight,
  LogOut,
  ChevronRight,
  Activity,
  Flame,
  UserCheck,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  const [user, setUser] = useState<{
    id: string;
    email: string;
    name?: string | null;
    role: string;
    workspaces?: {
      workspace: {
        id: string;
        name: string;
        plan: string;
        dailyQuota: number;
        usedToday: number;
      };
    }[];
  } | null>(null);

  React.useEffect(() => {
    const fetchUser = () => {
      fetch("/api/auth/me")
        .then((res) => {
          if (!res.ok) {
            router.push("/login");
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
          }
        })
        .catch(() => {});
    };

    fetchUser();
    const interval = setInterval(fetchUser, 15000);
    return () => clearInterval(interval);
  }, [router, pathname]);

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Audiences & Contacts", href: "/dashboard/audiences", icon: Activity },
    { label: "Domains & DKIM", href: "/dashboard/domains", icon: Globe },
    { label: "Email Templates", href: "/dashboard/templates", icon: FileCode },
    { label: "Pre-Flight Link Checker", href: "/dashboard/link-checker", icon: Sparkles },
    { label: "SMTP Credentials", href: "/dashboard/smtp", icon: Server },
    { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
    { label: "API Playground", href: "/dashboard/playground", icon: Send },
    { label: "AI Spam Cleaner", href: "/dashboard/ai-assistant", icon: Sparkles },
    { label: "A/B Testing", href: "/dashboard/ab-testing", icon: Split },
    { label: "Inbound Routing", href: "/dashboard/inbound", icon: Inbox },
    { label: "Deliverability & Warmup", href: "/dashboard/deliverability", icon: Flame },
    { label: "Suppression List", href: "/dashboard/suppressions", icon: Ban },
    { label: "Live Delivery Logs", href: "/dashboard/logs", icon: ShieldCheck },
    { label: "Billing & Plans", href: "/dashboard/billing", icon: CreditCard },
    { label: "2FA & Audit Logs", href: "/dashboard/security", icon: Lock },
  ];

  const currentWs = user?.workspaces?.[0]?.workspace;
  const quotaUsed = currentWs?.usedToday || 0;
  const quotaLimit = currentWs?.dailyQuota || 100;
  const quotaPct = Math.min(100, Math.round((quotaUsed / quotaLimit) * 100));

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-slate-200 bg-white p-4 shrink-0 shadow-subtle">
        <div className="space-y-6">
          {/* Logo & Home Link */}
          <div className="px-2 pt-1 flex items-center justify-between">
            <Link href="/">
              <SendportLogo size={28} />
            </Link>
            <span className="rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-bold uppercase text-primary-700 border border-primary-200">
              v1.0
            </span>
          </div>

          {/* Workspace Pill */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
              <span>Workspace</span>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                {currentWs?.plan || "STARTER"} ACTIVE
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 truncate">
              {currentWs?.name || (user?.name ? `${user.name}'s Workspace` : "My Workspace")}
            </p>
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
              <span>Daily Quota:</span>
              <span className="font-bold text-slate-800">
                {quotaUsed.toLocaleString()} / {quotaLimit.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all"
                style={{ width: `${Math.max(2, quotaPct)}%` }}
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-400" : "text-slate-400"}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 space-y-2.5 px-2">
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition-colors font-bold text-[11px]"
            >
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-700" /> Platform Admin Portal
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
            </Link>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-600 truncate max-w-[130px]" title={user?.email || "Workspace"}>
              {user?.email || "Active User"}
            </span>
            <Link href="/" className="text-primary-600 hover:underline flex items-center gap-0.5 text-[11px]">
              Website <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-white p-4 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <SendportLogo size={26} />
              <button onClick={() => setMobileNavOpen(false)} className="p-1 text-slate-500">
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
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                      isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto pt-4 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors text-xs font-semibold"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Sendport Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 capitalize">
                {pathname.split("/")[2]?.replace(/-/g, " ") || "Overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/docs"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <FileCode className="w-3.5 h-3.5 text-primary-600" /> API Documentation
            </Link>

            <Link
              href="/dashboard/playground"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-700 transition-all"
            >
              <Send className="w-3.5 h-3.5" /> Send Test Email
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
