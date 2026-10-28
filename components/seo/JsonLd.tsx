// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================
import React from "react";
import { siteConfig } from "@/lib/config/site";

import { HOMEPAGE_FAQS } from "@/lib/content/faqs";

export function SendportJsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    alternateName: ["getsendport", "Sendport", "getsendport.com", "Getsendport"],
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.svg`,
    brand: {
      "@type": "Brand",
      name: "GetSendport",
      logo: `${siteConfig.url}/icon.svg`,
    },
    founder: {
      "@type": "Person",
      name: siteConfig.founder.name,
      jobTitle: siteConfig.founder.role,
    },
    sameAs: [
      siteConfig.social.twitter,
      siteConfig.social.github,
      siteConfig.social.linkedin,
      siteConfig.social.facebook,
      "https://www.crunchbase.com/organization/getsendport",
      "https://www.producthunt.com/products/getsendport",
      "https://alternativeto.net/software/getsendport",
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
    name: "GetSendport Email Delivery & Transactional API",
    alternateName: "Sendport",
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
    alternateName: ["getsendport", "Sendport", "getsendport.com", "Getsendport"],
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
    mainEntity: HOMEPAGE_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
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
