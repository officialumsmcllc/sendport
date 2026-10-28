import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["nodemailer", "googleapis"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/resend-alternative",
        destination: "/vs/resend-alternative",
        permanent: true,
      },
      {
        source: "/sendgrid-alternative",
        destination: "/vs/sendgrid-alternative",
        permanent: true,
      },
      {
        source: "/postmark-alternative",
        destination: "/vs/postmark-alternative",
        permanent: true,
      },
      {
        source: "/mailgun-alternative",
        destination: "/vs/mailgun-alternative",
        permanent: true,
      },
      {
        source: "/aws-ses-alternative",
        destination: "/vs/aws-ses-alternative",
        permanent: true,
      },
      {
        source: "/brevo-alternative",
        destination: "/vs/brevo-alternative",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
