// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Mailgun Alternative: Modern Transactional Email API & 3x Cheaper | GetSendport",
  description:
    "Tired of Mailgun steep $35/mo minimums and unpredictable overage billing? GetSendport offers 90,000 emails/mo for $20, automated 30-day warmup, sub-10ms API dispatch, and 1-click DKIM.",
  keywords: [
    "Mailgun alternative",
    "Mailgun competitor",
    "Mailgun pricing alternative",
    "cheap Mailgun alternative",
    "GetSendport",
    "getsendport",
    "transactional email API",
    "Mailgun vs Sendport",
    "WordPress SMTP alternative to Mailgun",
    "Next.js email API",
  ],
  alternates: {
    canonical: "https://getsendport.com/vs/mailgun-alternative",
  },
  openGraph: {
    title: "Looking for a Mailgun Alternative? Migrate to GetSendport",
    description:
      "Save over 55% monthly. Sub-10ms edge dispatch, automated domain warmup, live AI spam analyzer, and zero overage fee penalties.",
    url: "https://getsendport.com/vs/mailgun-alternative",
    siteName: "GetSendport",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Mailgun Alternative for Developers & Startups | GetSendport",
    description: "Modern transactional email delivery with predictable pricing and automated deliverability tools.",
  },
};

export default function MailgunAlternativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
