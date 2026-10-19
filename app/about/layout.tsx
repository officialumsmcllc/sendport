import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us: Reimagining Email for Developers | GetSendport",
  description:
    "Learn about GetSendport's mission to provide the ultra-fast, high-deliverability email delivery and transactional API platform for modern software builders.",
  alternates: {
    canonical: "https://getsendport.com/about",
  },
  openGraph: {
    title: "About GetSendport — The Developer-First Email Platform",
    description: "Our mission: single-digit latency, cryptographic 2048-bit DKIM trust, and accessible global developer tooling.",
    url: "https://getsendport.com/about",
    siteName: "GetSendport",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
