import { NextResponse } from "next/server";

export async function GET() {
  const isConfigured = Boolean(process.env.CLOUDFLARE_CLIENT_ID && process.env.CLOUDFLARE_CLIENT_SECRET);
  return NextResponse.json({
    configured: isConfigured,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "https://getsendport.com"}/api/auth/cloudflare/callback`,
  });
}
