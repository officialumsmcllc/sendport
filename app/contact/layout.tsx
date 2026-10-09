import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Sendport: Global Developer Support & Enterprise Sales",
  description:
    "Get in touch with Sendport infrastructure engineers and enterprise sales. Fast technical responses, high-volume onboarding, and dedicated IP setups.",
  alternates: {
    canonical: "https://getsendport.com/contact",
  },
  openGraph: {
    title: "Contact Sendport Support & Sales",
    description: "Connect with our infrastructure team for technical assistance or custom volume pricing.",
    url: "https://getsendport.com/contact",
    siteName: "Sendport",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
