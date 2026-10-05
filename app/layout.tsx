import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/config/site";
import { SendportJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Sendport",
    "Email Delivery API",
    "Resend alternative",
    "SendGrid alternative",
    "Postmark alternative",
    "Transactional Email API",
    "DKIM 2048-bit generator",
    "SMTP Relay service",
    "Inbound Email Webhook",
    "WordPress SMTP",
  ],
  authors: [{ name: siteConfig.founder.name }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    creator: "@getsendport",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <SendportJsonLd />
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-primary-100 selection:text-primary-900">
        {children}
      </body>
    </html>
  );
}
