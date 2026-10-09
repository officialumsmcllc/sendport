import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best SendGrid Alternative: Sub-10ms API, React Email & Zero Delays | Sendport",
  description:
    "Tired of slow legacy SendGrid queues, account suspensions, and complex consoles? Migrate to Sendport in 60 seconds with instant SMTP & modern developer APIs.",
  keywords: [
    "SendGrid alternative",
    "SendGrid competitor",
    "Twilio SendGrid alternative",
    "Fast transactional email API",
    "WordPress SMTP alternative to SendGrid",
    "SendGrid pricing alternative",
    "Migrate from SendGrid",
  ],
  alternates: {
    canonical: "https://getsendport.com/vs/sendgrid-alternative",
  },
  openGraph: {
    title: "Looking for a SendGrid Alternative? Switch to Sendport",
    description:
      "Sub-10ms latency, native React Email support, instant 1-click DKIM setup, and 90,000 emails/mo for $20. Migrate in 60 seconds.",
    url: "https://getsendport.com/vs/sendgrid-alternative",
    siteName: "Sendport",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best SendGrid Alternative for Developers | Sendport",
    description: "Modern edge email delivery API with instant account setup and sub-10ms latency.",
  },
};

export default function SendgridAlternativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
