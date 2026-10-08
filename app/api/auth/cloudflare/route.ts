import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/workspace-auth";

/**
 * GET /api/auth/cloudflare?domainId=...
 * Redirects user to Cloudflare OAuth authorization consent screen.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const { searchParams } = new URL(req.url);
    const domainId = searchParams.get("domainId");

    const clientId = process.env.CLOUDFLARE_CLIENT_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (req.headers.get("host") ? `https://${req.headers.get("host")}` : "https://getsendport.com");
    const redirectUri = `${appUrl}/api/auth/cloudflare/callback`;

    if (!clientId) {
      return NextResponse.json({
        configured: false,
        error: "CLOUDFLARE_CLIENT_ID is not configured in environment variables. Please use the Cloudflare API Token method or configure OAuth credentials.",
      }, { status: 400 });
    }

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
    authUrl.searchParams.set("scope", "zone:read dns:edit");
    authUrl.searchParams.set("state", state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
