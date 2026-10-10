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
          </div>

          {/* Features / Product */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Product</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/features" className="hover:text-white transition-colors">Features Overview</Link></li>
              <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing & Plans</Link></li>

              <li><Link href="/dashboard/audiences" className="hover:text-white transition-colors">Audiences & Contacts</Link></li>
              <li><Link href="/dashboard/link-checker" className="hover:text-white transition-colors">Pre-Flight Link Checker</Link></li>
              <li><Link href="/dashboard/templates" className="hover:text-white transition-colors">React Email Templates</Link></li>
              <li><Link href="/status" className="hover:text-white transition-colors">Live Platform Status</Link></li>
            </ul>
          </div>

          {/* Developer Resources */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Developers</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link href="/blog" className="hover:text-white transition-colors">Engineering & Guides Blog</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">REST API Reference</Link></li>
              <li><Link href="/dashboard/smtp" className="hover:text-white transition-colors">SMTP Relay Credentials</Link></li>
              <li><Link href="/dashboard/playground" className="hover:text-white transition-colors">Interactive API Playground</Link></li>
              <li><Link href="/vs/resend-alternative" className="hover:text-white transition-colors">Sendport vs Resend</Link></li>
              <li><Link href="/vs/sendgrid-alternative" className="hover:text-white transition-colors">Sendport vs SendGrid</Link></li>
              <li><Link href="/vs/postmark-alternative" className="hover:text-white transition-colors">Sendport vs Postmark</Link></li>
              <li><Link href="/vs/mailgun-alternative" className="hover:text-white transition-colors">Sendport vs Mailgun</Link></li>
              <li><Link href="/vs/aws-ses-alternative" className="hover:text-white transition-colors">Sendport vs AWS SES</Link></li>
              <li><Link href="/vs/brevo-alternative" className="hover:text-white transition-colors">Sendport vs Brevo</Link></li>
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
          <p>© {new Date().getFullYear()} Sendport Technologies Inc. All rights reserved.</p>
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
