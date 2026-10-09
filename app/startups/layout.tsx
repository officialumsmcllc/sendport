import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sendport for Startups — $1,000 Email Credits & Accelerator Program",
  description:
    "Accelerate your early-stage venture with $1,000 in free Sendport email credits, automated domain warmup, 2048-bit RSA DKIM deliverability, dedicated IP pools, and zero contact list fees.",
  keywords: [
    "Startup Email Credits",
    "Sendport Startup Program",
    "$1,000 Email Grant",
    "Resend Alternative for Startups",
    "SendGrid Startup Credits",
    "Transactional Email API",
    "Automated Domain Warmup",
    "Next.js Email Infrastructure",
  ],
  alternates: {
    canonical: "https://getsendport.com/startups",
  },
  openGraph: {
    title: "Sendport for Startups — $1,000 Free Credits & Acceleration",
    description:
      "Get $1,000 in email credits, sub-10ms API dispatch, and 99.98% Primary Inbox deliverability for your early-stage startup.",
    url: "https://getsendport.com/startups",
    siteName: "Sendport",
    type: "website",
    images: [
      {
        url: "https://getsendport.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sendport $1,000 Startup Program",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sendport for Startups — $1,000 Free Email Credits",
    description:
      "Scale your startup without email bills. $1,000 credit grant, 25k emails/day, automated warmup, and 2048-bit DKIM.",
    images: ["https://getsendport.com/og-image.png"],
  },
};

export default function StartupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
