import { Metadata } from "next";
import Link from "next/link";
import { 
  Rocket, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  Code2, 
  Users, 
  Globe, 
  Award,
  Terminal
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sendport for Startups — $1,000 Free Credits & Growth Acceleration",
  description: "Accelerate your startup with up to $1,000 in email credits, automated domain warmup, 2048-bit DKIM deliverability, and developer-first Next.js APIs.",
  openGraph: {
    title: "Sendport for Startups — $1,000 Free Credits",
    description: "Power your transactional emails, auth flows, and customer outreach with zero upfront cost.",
  },
};

export default function StartupsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-primary-500/30">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-28 pb-20 border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-8 backdrop-blur-md animate-pulse">
            <Rocket className="h-3.5 w-3.5" />
            <span>Sendport Startup Booster Program 2026</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Scale your startup with{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              $1,000 in Email Credits
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
            Everything early-stage teams need to ship auth emails, onboarding sequences, and product notifications with 99.98% primary inbox deliverability.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup?ref=startup_program"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-5 w-5" />
              Apply for Startup Credits
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-8 py-4 text-base font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <Terminal className="h-5 w-5 text-emerald-400" />
              View Next.js SDK Docs
            </Link>
          </div>

          {/* QUICK PERKS BAR */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto text-left">
            <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-emerald-400">$1,000</div>
              <div className="text-xs text-slate-400 mt-1">Free Sending Credits</div>
            </div>
            <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-cyan-400">100k/mo</div>
              <div className="text-xs text-slate-400 mt-1">Emails for 6 Months</div>
            </div>
            <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-teal-400">30-Day</div>
              <div className="text-xs text-slate-400 mt-1">Automated Warmup</div>
            </div>
            <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-400">$0</div>
              <div className="text-xs text-slate-400 mt-1">Contact Audience Fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY STARTUPS CHOOSE SENDPORT */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Engineered for Modern Startup Velocity
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Traditional email providers lock critical features behind enterprise walls. Sendport gives startups enterprise infrastructure on day one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* PERK 1 */}
          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/80 to-slate-950 p-8 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
              <Flame className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Automated Domain Warmup</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              New startup domains get flagged by Gmail if they blast high volumes. Sendport automatically ramps up your sending velocity over 30 days to build bulletproof domain reputation.
            </p>
          </div>

          {/* PERK 2 */}
          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/80 to-slate-950 p-8 relative overflow-hidden group hover:border-teal-500/40 transition-all">
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-6">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">One-Click Next.js & React Email</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Plug-and-play templates for magic links, password resets, team invites, and Stripe invoice receipts. Copy 4 lines of code and go live in minutes.
            </p>
          </div>

          {/* PERK 3 */}
          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/80 to-slate-950 p-8 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Unlimited Team Workspaces</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Invite your co-founders, frontend engineers, and growth marketers with role-based access control. Zero per-seat surcharges.
            </p>
          </div>
        </div>
      </section>

      {/* ELIGIBILITY & HOW IT WORKS */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Program Eligibility</h2>
            <p className="mt-3 text-slate-400">Simple criteria designed to help builders ship faster.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-5 rounded-xl border border-slate-800 bg-slate-950">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Early-Stage / Bootstrapped</h4>
                <p className="text-xs text-slate-400 mt-1">Incorporated or operating under 3 years, with under $2M in total funding.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl border border-slate-800 bg-slate-950">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Active Product / Website</h4>
                <p className="text-xs text-slate-400 mt-1">A live website or working beta product with a custom domain name.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl border border-slate-800 bg-slate-950">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">No Spam / Cold Scraping Policy</h4>
                <p className="text-xs text-slate-400 mt-1">Sending opt-in transactional, onboarding, and legitimate product updates.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl border border-slate-800 bg-slate-950">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Instant Credit Approval</h4>
                <p className="text-xs text-slate-400 mt-1">Applications are reviewed and approved within 24 hours with credits added directly to your workspace.</p>
              </div>
            </div>
          </div>

          {/* APPLICATION CTA */}
          <div className="mt-14 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 p-8 sm:p-10 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to claim your $1,000 startup package?
            </h3>
            <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm sm:text-base">
              Create your account on Sendport, submit your startup domain, and get instant access to high-deliverability email infrastructure.
            </p>
            <Link
              href="/signup?ref=startup_program"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-emerald-400 transition-all"
            >
              <Rocket className="h-5 w-5" />
              Apply for Startup Credits Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
