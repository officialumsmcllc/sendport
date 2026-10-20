import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Documentation & REST API Reference | GetSendport",
  description:
    "Complete technical reference for GetSendport's REST API, React Email components, SMTP relay configuration, and webhook event payloads.",
  keywords: [
    "GetSendport",
    "getsendport",
    "GetSendport API Docs",
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
    title: "GetSendport Developer Documentation & API Reference",
    description: "Build, test, and dispatch transactional emails with sub-10ms latency in minutes.",
    url: "https://getsendport.com/docs",
    siteName: "GetSendport",
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
