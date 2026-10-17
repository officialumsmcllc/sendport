import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/workspace-auth";

function getPublicAppUrl(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("0.0.0.0")) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }
  const xForwardedHost = req.headers.get("x-forwarded-host");
  const host = xForwardedHost || req.headers.get("host");
  if (host && !host.includes("0.0.0.0") && !host.includes("10000")) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  }
  return "https://getsendport.com";
}

/**
 * GET /api/auth/cloudflare?domainId=...
 * Redirects user to Cloudflare OAuth authorization consent screen.
 */
export async function GET(req: NextRequest) {
  const appUrl = getPublicAppUrl(req);

  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.redirect(`${appUrl}/login`);
    }

    const { searchParams } = new URL(req.url);
    const domainId = searchParams.get("domainId");

    const clientId = process.env.CLOUDFLARE_CLIENT_ID;
    const clientSecret = process.env.CLOUDFLARE_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId.startsWith("86333fde52ca339731b8f6593edc3e40")) {
      const errorMsg = "Cloudflare 1-Click OAuth requires CLOUDFLARE_CLIENT_ID and CLOUDFLARE_CLIENT_SECRET in server environment variables. Please use the instant Cloudflare API Token sync below.";
      return NextResponse.redirect(
        `${appUrl}/dashboard/domains?cf_error=${encodeURIComponent(errorMsg)}`
      );
    }

    const redirectUri = `${appUrl}/api/auth/cloudflare/callback`;

    const stateObj = {
      domainId,
      workspaceId: auth.workspace.id,
      userId: auth.user.id,
      timestamp: Date.now(),
    };
    const state = Buffer.from(JSON.stringify(stateObj)).toString("base64url");

    // Cloudflare OAuth 2.0 Authorization Endpoint
    const authUrl = new URL("https://dash.cloudflare.com/oauth2/auth");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", process.env.CLOUDFLARE_OAUTH_SCOPES || "#dns_records:edit #zone:read");
    authUrl.searchParams.set("state", state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/domains?cf_error=${encodeURIComponent(error.message || "Failed to initiate Cloudflare OAuth")}`
    );
  }
}
