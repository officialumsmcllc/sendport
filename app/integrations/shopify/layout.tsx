import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopify Email Delivery & Transactional API Integration | GetSendport",
  description:
    "Built for high primary inbox delivery for Shopify order confirmations, shipping updates, and abandoned carts. 2048-bit RSA DKIM signing, instant webhooks, and sub-10ms API dispatch.",
  keywords: [
    "Shopify email delivery",
    "Shopify SMTP",
    "Shopify transactional email API",
    "Shopify order confirmation email in spam",
    "GetSendport Shopify integration",
    "Shopify DKIM setup",
    "Shopify webhooks email",
    "Headless Shopify email API",
    "Hydrogen email delivery",
  ],
  alternates: {
    canonical: "https://getsendport.com/integrations/shopify",
  },
  openGraph: {
    title: "Supercharge Shopify Email Delivery with GetSendport",
    description:
      "Prevent Shopify customer emails from landing in spam. Automated 2048-bit DKIM, instant order webhooks, and zero contact list fees.",
    url: "https://getsendport.com/integrations/shopify",
    siteName: "GetSendport",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopify Email Delivery & Transactional API | GetSendport",
    description: "Connect your Shopify store in 60 seconds for 99.9% inbox placement with 2048-bit DKIM.",
  },
};

export default function ShopifyIntegrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
