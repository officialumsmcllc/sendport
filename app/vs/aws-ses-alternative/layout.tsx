// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best AWS SES Alternative: No Sandbox Delays, Instant Setup & High Deliverability | GetSendport",
  description:
    "Stop fighting AWS SES sandbox delays, manual approval tickets, and complex IAM roles. Send production emails in 60 seconds with GetSendport's sub-10ms API, instant SMTP, and automated warmup.",
  keywords: [
    "AWS SES alternative",
    "Amazon SES alternative",
    "AWS SES sandbox alternative",
    "simple AWS SES replacement",
    "GetSendport",
    "getsendport",
    "transactional email API",
    "SES competitor",
    "instant SMTP relay",
    "developer email API",
  ],
  alternates: {
    canonical: "https://getsendport.com/vs/aws-ses-alternative",
  },
  openGraph: {
    title: "Looking for an AWS SES Alternative? Escape the Sandbox with GetSendport",
    description:
      "Send production emails in under 60 seconds. Instant API keys, 1-click 2048-bit DKIM verification, automated warmup, and developer-friendly dashboards.",
    url: "https://getsendport.com/vs/aws-ses-alternative",
    siteName: "GetSendport",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best AWS SES Alternative for Developers | GetSendport",
    description: "Skip complex AWS IAM policies and days of waiting for sandbox approval. Instant production email API.",
  },
};

export default function AwsSesAlternativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
