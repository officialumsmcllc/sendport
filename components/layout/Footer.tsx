import React from "react";
import Link from "next/link";
import { SendportLogo } from "@/components/brand/Logo";
import { siteConfig } from "@/lib/config/site";
import { ShieldCheck, Lock, Sparkles } from "lucide-react";

export function Footer({ dark = true }: { dark?: boolean }) {
  return (
    <footer
      className={`border-t transition-colors ${
        dark
          ? "border-slate-800/80 bg-slate-950 text-slate-400"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <SendportLogo size={32} dark={dark} />
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 font-medium pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> 2048-bit RSA DKIM
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-2.5 py-1 text-sky-400 border border-sky-500/20">
                <Lock className="w-3.5 h-3.5" /> GDPR & CAN-SPAM
              </span>
            </div>

            {/* Verified Official Social Media Links */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Official Channels</p>
              <div className="flex items-center gap-2">
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label="Sendport on LinkedIn"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-850 transition-all group"
                >
                  <svg className="w-4 h-4 fill-current group-hover:text-[#0A66C2] transition-colors" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.54a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z"/>
                  </svg>
                </a>
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label="Sendport on Facebook"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-850 transition-all group"
                >
                  <svg className="w-4 h-4 fill-current group-hover:text-[#1877F2] transition-colors" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href={siteConfig.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label="Sendport on X (Twitter)"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-850 transition-all group"
                >
                  <svg className="w-3.5 h-3.5 fill-current group-hover:text-white transition-colors" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Features / Product */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Product</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/features" className="hover:text-white transition-colors">Features Overview</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
              <li><Link href="/features#audiences" className="hover:text-white transition-colors">Audiences & Segments</Link></li>
              <li><Link href="/features#link-checker" className="hover:text-white transition-colors">Pre-Flight Link Checker</Link></li>
              <li><Link href="/startups" className="hover:text-white transition-colors">Startups Program ($1,000)</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Security & 2048-bit DKIM</Link></li>
              <li><Link href="/status" className="hover:text-white transition-colors">Live Platform Status</Link></li>
            </ul>
          </div>

          {/* Developer Resources */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Developers</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/blog" className="hover:text-white transition-colors">Engineering & Guides Blog</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">REST API Reference</Link></li>
              <li><Link href="/integrations/shopify" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1">Shopify Webhooks & Email <span className="text-[10px] bg-emerald-500/20 px-1 rounded">New</span></Link></li>
              <li><Link href="/integrations/wordpress" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors flex items-center gap-1">WordPress SMTP Plugin <span className="text-[10px] bg-sky-500/20 px-1 rounded">New</span></Link></li>
              <li><Link href="/vs/resend-alternative" className="hover:text-white transition-colors">GetSendport vs Resend</Link></li>
              <li><Link href="/vs/sendgrid-alternative" className="hover:text-white transition-colors">GetSendport vs SendGrid</Link></li>
              <li><Link href="/vs/postmark-alternative" className="hover:text-white transition-colors">GetSendport vs Postmark</Link></li>
              <li><Link href="/vs/mailgun-alternative" className="hover:text-white transition-colors">GetSendport vs Mailgun</Link></li>
              <li><Link href="/vs/aws-ses-alternative" className="hover:text-white transition-colors">GetSendport vs AWS SES</Link></li>
              <li><Link href="/vs/brevo-alternative" className="hover:text-white transition-colors">GetSendport vs Brevo</Link></li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Legal & Company</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Developer Support</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Security & 2FA</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-12 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p suppressHydrationWarning>© {new Date().getFullYear()} Sendport Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
