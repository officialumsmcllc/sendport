import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.CLOUDFLARE_CLIENT_ID || "86333fde52ca339731b8f6593ecc3c40";
  const clientSecret = process.env.CLOUDFLARE_CLIENT_SECRET || "cfoc_rXUaIBdIyrg3xd74QSiqKQIcBaG2kqZZBkvtBVzi20336754";
  const isConfigured = Boolean(clientId && clientSecret);
  return NextResponse.json({
    configured: isConfigured,
    clientId,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "https://getsendport.com"}/api/auth/cloudflare/callback`,
  });
}
