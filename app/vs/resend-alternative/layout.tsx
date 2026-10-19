import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Resend Alternative in 2026: Compare Pricing, Warmup & Limits | GetSendport",
  description:
    "Looking for a Resend alternative? GetSendport delivers 3,000 emails/day for $20, automated 30-day domain warmup, live spam diagnostics, and global/local payment rails.",
  keywords: [
    "Resend alternative",
    "GetSendport",
    "getsendport",
    "Resend competitor",
    "Transactional email API",
    "React Email alternative",
    "Email delivery without credit card",
    "Cheaper alternative to Resend",
    "Resend vs GetSendport",
  ],
  alternates: {
    canonical: "https://getsendport.com/vs/resend-alternative",
  },
  openGraph: {
    title: "Looking for a Resend Alternative? Switch to GetSendport in 2026",
    description:
      "Compare GetSendport vs Resend. 3,000 emails/day for $20, automated 30-day warmup, live spam diagnostics, and multi-currency billing.",
    url: "https://getsendport.com/vs/resend-alternative",
    siteName: "GetSendport",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Top Resend Alternative in 2026 | GetSendport",
    description: "Compare GetSendport vs Resend for developer-friendly email delivery, automated warmup, and fair pricing.",
  },
};

export default function ResendAlternativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
