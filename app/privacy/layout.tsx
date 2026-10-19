import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy & GDPR Compliance | GetSendport",
  description:
    "Read GetSendport's privacy policy, data protection commitments, zero-contact-selling guarantee, and GDPR compliance policies.",
  alternates: {
    canonical: "https://getsendport.com/privacy",
  },
  openGraph: {
    title: "GetSendport Privacy Policy & Data Commitment",
    description: "Enterprise data privacy: zero contact selling, 30-day auto-purge, and TLS 1.3 encryption.",
    url: "https://getsendport.com/privacy",
    siteName: "GetSendport",
    type: "website",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
