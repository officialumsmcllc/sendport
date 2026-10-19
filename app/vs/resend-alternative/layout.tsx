import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Resend Alternative in 2026: Compare Pricing, Warmup & Limits | getsendport",
  description:
    "Looking for a Resend alternative? getsendport delivers 3,000 emails/day for $20, automated 30-day domain warmup, live spam diagnostics, and global/local payment rails.",
  keywords: [
    "Resend alternative",
    "getsendport",
    "Resend competitor",
    "Transactional email API",
    "React Email alternative",
    "Email delivery without credit card",
    "Cheaper alternative to Resend",
    "Resend vs getsendport",
  ],
  alternates: {
    canonical: "https://getsendport.com/vs/resend-alternative",
  },
  openGraph: {
    title: "Looking for a Resend Alternative? Switch to getsendport in 2026",
    description:
      "Compare getsendport vs Resend. 3,000 emails/day for $20, automated 30-day warmup, live spam diagnostics, and multi-currency billing.",
    url: "https://getsendport.com/vs/resend-alternative",
    siteName: "getsendport",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Top Resend Alternative in 2026 | getsendport",
    description: "Compare getsendport vs Resend for developer-friendly email delivery, automated warmup, and fair pricing.",
  },
};

export default function ResendAlternativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
