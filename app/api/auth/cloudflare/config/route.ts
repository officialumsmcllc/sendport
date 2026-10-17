import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.CLOUDFLARE_CLIENT_ID;
  const clientSecret = process.env.CLOUDFLARE_CLIENT_SECRET;
  const isCustomConfigured = Boolean(
    clientId &&
    clientSecret &&
    !clientId.startsWith("86333fde52ca339731b8f6593edc3e40")
  );

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("0.0.0.0"))
    ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
    : "https://getsendport.com";

  return NextResponse.json({
    configured: isCustomConfigured,
    clientId: isCustomConfigured ? clientId : null,
    redirectUri: `${appUrl}/api/auth/cloudflare/callback`,
  });
}
