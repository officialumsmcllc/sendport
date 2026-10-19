import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service & Acceptable Use Policy | GetSendport",
  description:
    "Review GetSendport's Terms of Service, Acceptable Use Policy, 99.99% SLA commitment, and anti-spam deliverability standards.",
  alternates: {
    canonical: "https://getsendport.com/terms",
  },
  openGraph: {
    title: "GetSendport Terms of Service",
    description: "Terms of Service, acceptable use guidelines, and SLA policies for GetSendport customers.",
    url: "https://getsendport.com/terms",
    siteName: "GetSendport",
    type: "website",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
