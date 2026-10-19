import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Documentation & REST API Reference | getsendport",
  description:
    "Complete technical reference for getsendport's REST API, Node.js SDK, React Email components, SMTP relay configuration, and webhook event payloads.",
  keywords: [
    "getsendport",
    "getsendport API Docs",
    "Sendport API Docs",
    "Email API Reference",
    "React Email Documentation",
    "SMTP Configuration Docs",
    "Webhook Payload Reference",
  ],
  alternates: {
    canonical: "https://getsendport.com/docs",
  },
  openGraph: {
    title: "getsendport Developer Documentation & API Reference",
    description: "Build, test, and dispatch transactional emails with sub-10ms latency in minutes.",
    url: "https://getsendport.com/docs",
    siteName: "getsendport",
    type: "website",
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
