import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { autoConfigureCloudflareDns } from "@/lib/dns/cloudflare";

/**
 * GET /api/auth/cloudflare/callback
 * Handles OAuth callback from Cloudflare, exchanges code for access token,
 * automatically provisions DKIM/SPF/DMARC records, and verifies domain.
 */
export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (req.headers.get("host") ? `https://${req.headers.get("host")}` : "https://getsendport.com");
  const redirectUri = `${appUrl}/api/auth/cloudflare/callback`;

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (oauthError) {
      return NextResponse.redirect(
        new URL(`/dashboard/domains?cf_error=${encodeURIComponent(errorDescription || oauthError)}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard/domains?cf_error=Missing+authorization+code+or+state", req.url)
      );
    }

    // Decode state
    let stateData: { domainId?: string; workspaceId?: string; userId?: string } = {};
    try {
      const stateJson = Buffer.from(state, "base64url").toString("utf-8");
      stateData = JSON.parse(stateJson);
    } catch {
      return NextResponse.redirect(
        new URL("/dashboard/domains?cf_error=Invalid+OAuth+state+parameter", req.url)
      );
    }

    const clientId = process.env.CLOUDFLARE_CLIENT_ID || "86333fde52ca339731b8f6593edc3e40";
    const clientSecret = process.env.CLOUDFLARE_CLIENT_SECRET || "cfoc_rXUaIBdIyrg3xd74QSiqKQIcBaG2kqZZBkvtBVzi20336754";

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL("/dashboard/domains?cf_error=Cloudflare+OAuth+credentials+not+configured+on+server", req.url)
      );
    }

    // Exchange authorization code for access token
    const tokenParams = new URLSearchParams();
    tokenParams.set("grant_type", "authorization_code");
    tokenParams.set("code", code);
    tokenParams.set("redirect_uri", redirectUri);
    tokenParams.set("client_id", clientId);
    tokenParams.set("client_secret", clientSecret);

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenRes = await fetch("https://dash.cloudflare.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`,
      },
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Cloudflare OAuth token error:", errText);
      return NextResponse.redirect(
        new URL(`/dashboard/domains?cf_error=Token+exchange+failed:+${encodeURIComponent(errText.substring(0, 80))}`, req.url)
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(
        new URL("/dashboard/domains?cf_error=No+access+token+returned+from+Cloudflare", req.url)
      );
    }

    // If domainId was provided in state, provision DNS immediately
    if (stateData.domainId && stateData.workspaceId) {
      const domain = await prisma.domain.findFirst({
        where: {
          id: stateData.domainId,
          workspaceId: stateData.workspaceId,
        },
      });

      if (domain) {
        const dkimValue = `v=DKIM1; k=rsa; p=${domain.dkimPublicKey}`;
        const syncResult = await autoConfigureCloudflareDns(
          accessToken,
          domain.name,
          dkimValue,
          domain.spfRecord,
          domain.dmarcRecord,
          domain.dkimSelector || "sendport"
        );

        if (syncResult.success) {
          await prisma.domain.update({
            where: { id: domain.id },
            data: {
              status: "VERIFIED",
              isDkimValid: true,
              isSpfValid: true,
              isDmarcValid: true,
              isMxValid: true,
              verifiedAt: new Date(),
              lastCheckedAt: new Date(),
            },
          });

          return NextResponse.redirect(
            new URL(`/dashboard/domains?cf_verified=true&domain=${encodeURIComponent(domain.name)}`, req.url)
          );
        } else {
          return NextResponse.redirect(
            new URL(`/dashboard/domains?cf_error=${encodeURIComponent(syncResult.error || "DNS Provisioning failed")}`, req.url)
          );
        }
      }
    }

    return NextResponse.redirect(new URL("/dashboard/domains?cf_connected=true", req.url));
  } catch (error: any) {
    console.error("Cloudflare callback error:", error);
    return NextResponse.redirect(
      new URL(`/dashboard/domains?cf_error=${encodeURIComponent(error.message || "OAuth callback error")}`, req.url)
    );
  }
}
