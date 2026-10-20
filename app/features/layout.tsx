import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GetSendport Features: Edge Email API, 2048-bit DKIM & Warmup Engine",
  description:
    "Explore GetSendport's transactional email features: sub-10ms edge dispatch, 2048-bit RSA DKIM key signing, automated 30-day warmup, live spam tester, and SMTP relay.",
  keywords: [
    "GetSendport",
    "getsendport",
    "Email API Features",
    "DKIM 2048-bit generator",
    "Transactional Email Infrastructure",
    "Automated Domain Warmup",
    "Next.js Email API",
    "WordPress SMTP Relay",
    "Inbound Email Webhook",
  ],
  alternates: {
    canonical: "https://getsendport.com/features",
  },
  openGraph: {
    title: "GetSendport Email Infrastructure Features",
    description: "Sub-10ms latency, automated warmup, 2048-bit DKIM, and high-speed REST API.",
    url: "https://getsendport.com/features",
    siteName: "GetSendport",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GetSendport Features & Architecture",
    description: "Enterprise email infrastructure engineered for developer speed and high inbox deliverability.",
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
