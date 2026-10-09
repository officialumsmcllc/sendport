import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & Compliance: 2048-bit RSA DKIM, DMARC & TLS 1.3 | Sendport",
  description:
    "Enterprise-grade email security: 2048-bit RSA DKIM cryptographic signatures, SPF alignment, DMARC enforcement, 2FA protection, and TLS 1.3 encryption in transit.",
  keywords: [
    "Email Security",
    "2048-bit RSA DKIM",
    "SPF and DMARC Enforcement",
    "TLS 1.3 Email Encryption",
    "CAN-SPAM Compliance",
    "GDPR Email API",
  ],
  alternates: {
    canonical: "https://getsendport.com/security",
  },
  openGraph: {
    title: "Sendport Security & Compliance Architecture",
    description: "Cryptographically verified email delivery, zero data leakage, and automated anti-spoofing.",
    url: "https://getsendport.com/security",
    siteName: "Sendport",
    type: "website",
  },
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
