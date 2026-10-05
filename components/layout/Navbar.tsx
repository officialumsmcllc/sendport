"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SendportLogo } from "@/components/brand/Logo";
import { ArrowRight, Menu, X, Globe, Terminal, Sparkles } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <Link href="#pricing" className="hover:text-primary-400 transition-colors">
            Pricing
          </Link>
          <Link
            href="/docs"
            className="hover:text-primary-400 transition-colors flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-primary-400" />
            Docs
          </Link>
          <Link href="/dashboard/audiences" className="hover:text-primary-400 transition-colors">
            Audiences
          </Link>
          <Link href="/dashboard/link-checker" className="hover:text-primary-400 transition-colors">
            Link Checker
          </Link>
          <Link
            href="/status"
            className="hover:text-primary-400 transition-colors flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Status
          </Link>
        </nav>

        {/* Action Controls & Dashboard CTA */}
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

          <Link
            href="/login"
            className={`text-xs font-semibold px-2 py-1.5 transition-colors ${
              dark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Log in
          </Link>

          <Link
            href="/signup"
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all border ${
              dark
                ? "border-slate-700 bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:text-white"
                : "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
          >
            Sign up
          </Link>

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
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/login"
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
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
          <Link href="#pricing" className="block text-sm py-1 font-medium hover:text-primary-400">
            Pricing
          </Link>
          <Link href="/docs" className="block text-sm py-1 font-medium hover:text-primary-400">
            API Documentation
          </Link>
          <Link href="/dashboard/audiences" className="block text-sm py-1 font-medium hover:text-primary-400">
            Audiences & Contacts
          </Link>
          <Link href="/dashboard/link-checker" className="block text-sm py-1 font-medium hover:text-primary-400">
            Link Checker
          </Link>
          <Link href="/status" className="block text-sm py-1 font-medium hover:text-primary-400">
            Uptime Status
          </Link>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <Link href="/login" className="text-xs font-semibold text-white">Log in</Link>
            <Link href="/signup" className="text-xs font-semibold text-emerald-400">Create Account</Link>
          </div>
        </div>
      )}
    </header>
  );
}
