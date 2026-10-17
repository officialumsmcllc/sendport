import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans — Free Starter, Growth, and Scale Pro",
  description: "Transparent, developer-friendly email delivery pricing. Start 100% free with 100 emails/day, 1 verified domain, and 2048-bit DKIM. Upgrade to Growth (90,000 emails/mo) for $20.",
  alternates: {
    canonical: "https://getsendport.com/pricing",
  },
  openGraph: {
    title: "Sendport Pricing — Predictable & Transparent Email Delivery Plans",
    description: "Send 100 emails/day free forever. High volume plans from $20/month with zero hidden overage fees.",
    url: "https://getsendport.com/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
