import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Postmark Alternative: Transactional & Broadcast Email in One API | Sendport",
  description:
    "Looking for a Postmark alternative? Sendport gives you 90,000 emails/mo for $20 (vs 10k on Postmark), supports both transactional & marketing broadcasts, and features automated 30-day warmup.",
  keywords: [
    "Postmark alternative",
    "Postmark competitor",
    "Postmark vs Sendport",
    "Transactional email with marketing broadcasts",
    "Cheaper alternative to Postmark",
    "Postmark newsletter ban alternative",
    "High deliverability email API",
  ],
  alternates: {
    canonical: "https://getsendport.com/vs/postmark-alternative",
  },
  openGraph: {
    title: "Looking for a Postmark Alternative? Switch to Sendport",
    description:
      "Send both transactional and broadcast emails without account bans. 90,000 emails/mo for $20, automated warmup, and 2048-bit DKIM.",
    url: "https://getsendport.com/vs/postmark-alternative",
    siteName: "Sendport",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Postmark Alternative in 2026 | Sendport",
    description: "90,000 emails for $20 with zero newsletter bans and built-in 30-day warmup.",
  },
};

export default function PostmarkAlternativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
