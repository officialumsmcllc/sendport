import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sendport for Startups: Scalable Email Infrastructure & Free Tier",
  description:
    "Launch and scale your startup with Sendport. Get 100 emails/day free forever, sub-10ms API dispatch, automated warmup, and transparent pricing as you scale.",
  keywords: [
    "Email API for Startups",
    "Transactional Email Free Tier",
    "SaaS Email Infrastructure",
    "Sendport Startup Program",
    "Developer Email Service",
  ],
  alternates: {
    canonical: "https://getsendport.com/startups",
  },
  openGraph: {
    title: "Sendport for Startups: Infrastructure That Grows With You",
    description: "Launch faster with developer-first email infrastructure. Free tier, instant API keys, and automated warmup.",
    url: "https://getsendport.com/startups",
    siteName: "Sendport",
    type: "website",
  },
};

export default function StartupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
