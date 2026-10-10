"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SendportLogo } from "@/components/brand/Logo";
import { ArrowRight, Menu, X, Globe, Terminal, ShieldCheck, LogOut } from "lucide-react";
import { CURRENCIES, SupportedCurrency } from "@/lib/payments/currencies";

export function Navbar({
  activeCurrency = "USD",
  onCurrencyChange,
  dark = true,
}: {
  activeCurrency?: SupportedCurrency;
  onCurrencyChange?: (c: SupportedCurrency) => void;
  dark?: boolean;
}) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id?: string; email: string; name?: string; role: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // 1. Check local storage first to eliminate layout shift or button flash
    try {
      const cached = localStorage.getItem("sendport_user");
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch (e) {}

    // 2. Verify with server session
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setUser(data.user);
          try {
            localStorage.setItem("sendport_user", JSON.stringify(data.user));
          } catch (e) {}
        } else {
          setUser(null);
          try {
            localStorage.removeItem("sendport_user");
          } catch (e) {}
        }
      })
      .catch(() => {})
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    try {
      localStorage.removeItem("sendport_user");
    } catch (e) {}
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all backdrop-blur-md ${
        dark
          ? "border-b border-slate-800/80 bg-slate-950/80 text-white"
          : "border-b border-slate-200/80 bg-white/95 text-slate-900"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <SendportLogo size={32} dark={dark} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className={`hidden md:flex items-center gap-7 text-sm font-medium ${
            dark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          <Link href="/features" className="hover:text-primary-400 transition-colors">
            Features
          </Link>
          <Link href="/#pricing" className="hover:text-primary-400 transition-colors">
            Pricing
          </Link>
          <Link
            href="/docs"
            className="hover:text-primary-400 transition-colors flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-primary-400" />
            Docs
          </Link>
          <Link href="/features#audiences" className="hover:text-primary-400 transition-colors">
            Audiences
          </Link>
          <Link href="/features#link-checker" className="hover:text-primary-400 transition-colors">
            Link Checker
          </Link>
          <Link href="/blog" className="hover:text-primary-400 transition-colors">
            Blog
          </Link>

          <Link
            href="/status"
            className="hover:text-primary-400 transition-colors flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Status
          </Link>

        </nav>

        {/* Action Controls & Dynamic CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Currency Switcher */}
          {onCurrencyChange && (
            <div
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold border ${
                dark
                  ? "border-slate-800 bg-slate-900 text-slate-300"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <select
                aria-label="Select Currency"
                value={activeCurrency}
                onChange={(e) => onCurrencyChange(e.target.value as SupportedCurrency)}
                className={`bg-transparent text-xs font-semibold outline-none cursor-pointer ${
                  dark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                {Object.keys(CURRENCIES).map((code) => (
                  <option key={code} value={code} className={dark ? "bg-slate-900 text-white" : ""}>
                    {code} ({CURRENCIES[code as SupportedCurrency].symbol})
                  </option>
                ))}
              </select>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2.5">
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Portal</span>
                </Link>
              )}
              <Link
                href="/dashboard"
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all shadow-sm ${
                  dark
                    ? "bg-white text-black hover:bg-slate-200"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={handleLogout}
                title="Log out"
                className={`p-2 rounded-xl border text-xs transition-colors ${
                  dark
                    ? "border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:border-rose-900/50"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:text-rose-600 hover:border-rose-200"
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`text-xs font-semibold px-2.5 py-1.5 transition-colors ${
                  dark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Log in
              </Link>

              <Link
                href="/signup"
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all shadow-sm ${
                  dark
                    ? "bg-white text-black hover:bg-slate-200"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                Sign up
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user ? (
            <Link
              href="/dashboard"
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                dark ? "bg-white text-black" : "bg-slate-900 text-white"
              }`}
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className={`rounded-lg px-2 py-1.5 text-xs font-semibold ${
                  dark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  dark ? "bg-white text-black" : "bg-slate-900 text-white"
                }`}
              >
                Sign up
              </Link>
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 ${dark ? "text-slate-300" : "text-slate-600"}`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className={`border-b px-4 py-5 md:hidden space-y-3 ${
            dark ? "border-slate-800 bg-slate-950 text-slate-200" : "border-slate-200 bg-white text-slate-800"
          }`}
        >
          <Link href="/features" className="block text-sm py-1 font-medium hover:text-primary-400">
            Features
          </Link>
          <Link href="/#pricing" className="block text-sm py-1 font-medium hover:text-primary-400">
            Pricing
          </Link>
          <Link href="/docs" className="block text-sm py-1 font-medium hover:text-primary-400">
            API Documentation
          </Link>
          <Link href="/features#audiences" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-1 font-medium hover:text-primary-400">
            Audiences & Contacts
          </Link>
          <Link href="/features#link-checker" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-1 font-medium hover:text-primary-400">
            Link Checker
          </Link>
          <Link href="/blog" className="block text-sm py-1 font-medium hover:text-primary-400">
            Blog & Guides
          </Link>

          <Link href="/status" className="block text-sm py-1 font-medium hover:text-primary-400">

            Uptime Status
          </Link>
          {user ? (
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 truncate max-w-[150px]">{user.email}</span>
              <div className="flex items-center gap-2">
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="text-xs font-bold text-amber-400">
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-xs font-bold text-black bg-white px-3 py-1.5 rounded-lg"
                >
                  Dashboard &rarr;
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-400 font-semibold px-2 py-1 rounded hover:bg-rose-500/10"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <Link href="/login" className="text-xs font-semibold text-white">Log in</Link>
              <Link href="/signup" className="text-xs font-semibold text-emerald-400">Create Account</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
