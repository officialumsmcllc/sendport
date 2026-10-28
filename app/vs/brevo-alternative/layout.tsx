// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Brevo (Sendinblue) Alternative for Developers & Fast Email Delivery | GetSendport",
  description:
    "Looking for a faster, developer-first Brevo alternative? Switch to GetSendport for sub-10ms transactional dispatch, modern React Email, automated 30-day warmup, and zero subscriber penalty fees.",
  keywords: [
    "Brevo alternative",
    "Sendinblue alternative",
    "Brevo competitor",
    "Brevo transactional email alternative",
    "GetSendport",
    "getsendport",
    "transactional email API",
    "fast SMTP relay",
    "developer email platform",
  ],
  alternates: {
    canonical: "https://getsendport.com/vs/brevo-alternative",
  },
  openGraph: {
    title: "Looking for a Brevo Alternative? Switch to GetSendport",
    description:
      "Modern transactional email platform built for software developers. Fast edge routing, instant 1-click DKIM setup, and transparent pricing without hidden subscriber fees.",
    url: "https://getsendport.com/vs/brevo-alternative",
    siteName: "GetSendport",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Brevo Alternative in 2026 | GetSendport",
    description: "Sub-10ms transactional dispatch, React Email support, and automated deliverability tools.",
  },
};

export default function BrevoAlternativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
