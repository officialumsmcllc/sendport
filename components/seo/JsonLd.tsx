import React from "react";
import { siteConfig } from "@/lib/config/site";

export function SendportJsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.svg`,
    founder: {
      "@type": "Person",
      name: siteConfig.founder.name,
      jobTitle: siteConfig.founder.role,
    },
    sameAs: [
      siteConfig.social.twitter,
      siteConfig.social.github,
      siteConfig.social.linkedin,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.supportEmail,
      contactType: "Customer Support",
      availableLanguage: ["English", "Urdu", "Arabic"],
    },
    knowsAbout: [
      "Email Delivery API",
      "Transactional Email Infrastructure",
      "2048-bit RSA DKIM Authentication",
      "SPF & DMARC Validation",
      "SMTP Relay Servers",
      "Email Deliverability & Inbox Optimization",
      "Inbound Email Webhook Parsing",
    ],
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Sendport Email Delivery & Transactional API",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Cloud, Linux, Windows, macOS",
    offers: siteConfig.pricingTiers.map((tier) => ({
      "@type": "Offer",
      name: tier.name,
      price: tier.price.USD,
      priceCurrency: "USD",
      description: tier.description,
      availability: "https://schema.org/InStock",
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "2840",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "2048-bit RSA DKIM Key Generation & Signing",
      "Sub-10ms REST API Gateway",
      "Live DNS SPF & DMARC Resolver",
      "Instant SMTP Relay (Port 587 / 465)",
      "Real-time Open & Click Tracking",
      "AI Email Spam Optimizer",
      "Inbound Webhook Routing",
      "Multi-Currency Billing (USD, EUR, GBP, AED, SAR, PKR)",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/docs?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How is Sendport different from Resend and SendGrid?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sendport offers 2048-bit RSA DKIM signing, sub-10ms latency REST APIs, instant SMTP relay credentials for WordPress/Shopify, and localized multi-currency payments including direct bank transfers and crypto USDT.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to verify my domain to send emails on Sendport?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, to ensure 100% inbox delivery and zero spam warnings, Sendport requires automated DNS verification for DKIM (2048-bit RSA) and SPF records before live sending.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use Sendport with WordPress, WooCommerce, and Laravel?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Sendport provides instant SMTP credentials (Host: smtp.getsendport.com, Port: 587/465) that connect directly with WordPress SMTP plugins, Laravel, Ghost, and custom apps without writing code.",
        },
      },
      {
        "@type": "Question",
        name: "What payment methods are supported on Sendport?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sendport supports global Credit/Debit Cards via Stripe, PayPal, Wise, Payoneer, direct Bank Wire (IBAN/SWIFT), regional mobile wallets (Easypaisa, JazzCash, Raast), and Crypto USDT (TRC-20 / BEP-20).",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
