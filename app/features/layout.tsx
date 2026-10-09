import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sendport Features: Edge Email API, 2048-bit DKIM & Warmup Engine",
  description:
    "Explore Sendport's transactional email features: sub-10ms edge dispatch, 2048-bit RSA DKIM key signing, automated 30-day warmup, live spam tester, and SMTP relay.",
  keywords: [
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
    title: "Sendport Email Infrastructure Features",
    description: "Sub-10ms latency, automated warmup, 2048-bit DKIM, and modern developer SDKs.",
    url: "https://getsendport.com/features",
    siteName: "Sendport",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sendport Features & Architecture",
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
