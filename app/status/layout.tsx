import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real-Time System Status & Uptime | GetSendport",
  description:
    "Live uptime and latency metrics for GetSendport's global email dispatch nodes, SMTP relays, DKIM DNS verifier, and webhook pipelines.",
  alternates: {
    canonical: "https://getsendport.com/status",
  },
  openGraph: {
    title: "GetSendport Live Platform Status & Uptime",
    description: "99.99% monthly availability across global API dispatch regions and delivery relays.",
    url: "https://getsendport.com/status",
    siteName: "GetSendport",
    type: "website",
  },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
