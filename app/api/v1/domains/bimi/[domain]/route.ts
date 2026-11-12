import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";
import { sanitizeAndValidateBimiSvg } from "@/lib/bimi/sanitizer";
import { siteConfig } from "@/lib/config/site";
import { ensureDbSchema } from "@/lib/db/ensure-schema";

interface RouteParams {
  params: Promise<{ domain: string }>;
}

/**
 * Generates an elegant fallback SVG Tiny PS badge for a domain
 */
function generateDefaultBimiSvg(domain: string): string {
  const initial = (domain.charAt(0) || "S").toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny-ps" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#g)" />
  <circle cx="256" cy="256" r="180" fill="none" stroke="#ffffff" stroke-width="12" stroke-opacity="0.25" />
  <text x="256" y="325" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="210" font-weight="900" fill="#ffffff" text-anchor="middle">${initial}</text>
</svg>`.trim();
}

/**
 * GET /api/v1/domains/bimi/[domain]
 * Public endpoint for mailbox crawlers (Google, Yahoo, Apple Mail) to fetch the verified BIMI SVG logo.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await ensureDbSchema();
    const { domain: rawDomain } = await params;
    const cleanDomain = (rawDomain || "").toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").replace(/\.svg$/i, "").trim();

    if (!cleanDomain) {
      return new Response("Domain parameter required", { status: 400 });
    }

    const domain = await prisma.domain.findFirst({
      where: { name: cleanDomain },
      select: { bimiSvgContent: true, name: true },
    });

    const svgContent = domain?.bimiSvgContent || generateDefaultBimiSvg(cleanDomain);

    return new Response(svgContent, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=604800, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    return new Response(`Error retrieving BIMI SVG: ${error.message}`, { status: 500 });
  }
}

/**
 * POST /api/v1/domains/bimi/[domain]
 * Uploads, sanitizes, and verifies a brand's SVG logo for BIMI compliance.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    await ensureDbSchema();
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized. Please log in or provide an API key." }, { status: 401 });
    }

    const { domain: rawDomain } = await params;
    const cleanDomain = (rawDomain || "").toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").trim();

    const domain = await prisma.domain.findFirst({
      where: {
        name: cleanDomain,
        OR: [
          { workspaceId: auth.workspace.id },
          { userId: auth.user.id },
        ],
      },
    });

    if (!domain) {
      return NextResponse.json({ error: `Domain '${cleanDomain}' not found in your workspace.` }, { status: 404 });
    }

    const body = await req.json();
    let rawSvg = body.svg || "";

    // Support Base64 SVG input
    if (body.base64) {
      try {
        const decoded = Buffer.from(body.base64.replace(/^data:image\/svg\+xml;base64,/, ""), "base64").toString("utf8");
        rawSvg = decoded;
      } catch {
        return NextResponse.json({ error: "Invalid base64 payload provided." }, { status: 400 });
      }
    }

    if (!rawSvg) {
      return NextResponse.json({ error: "SVG content is required." }, { status: 400 });
    }

    // Run through strict SVG Tiny 1.2 PS sanitizer
    const sanitizeResult = sanitizeAndValidateBimiSvg(rawSvg);
    if (!sanitizeResult.valid || !sanitizeResult.svg) {
      return NextResponse.json({
        error: sanitizeResult.error || "SVG failed BIMI compliance check.",
        warnings: sanitizeResult.warnings,
      }, { status: 422 });
    }

    const baseUrl = siteConfig.url || "https://getsendport.com";
    const logoUrl = `${baseUrl}/api/v1/domains/bimi/${cleanDomain}/logo.svg`;
    const bimiRecord = `v=BIMI1; l=${logoUrl};`;

    await prisma.domain.update({
      where: { id: domain.id },
      data: {
        bimiSvgContent: sanitizeResult.svg,
        bimiRecord,
        bimiStatus: "READY_FOR_DNS",
      },
    });

    return NextResponse.json({
      success: true,
      message: "BIMI logo sanitized and stored successfully.",
      logoUrl,
      bimiRecord,
      selector: "default",
      host: `default._bimi.${cleanDomain}`,
      warnings: sanitizeResult.warnings,
      dimensions: sanitizeResult.dimensions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/domains/bimi/[domain]
 * Removes custom BIMI logo for a domain
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await ensureDbSchema();
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { domain: rawDomain } = await params;
    const cleanDomain = (rawDomain || "").toLowerCase().trim();

    await prisma.domain.updateMany({
      where: {
        name: cleanDomain,
        OR: [
          { workspaceId: auth.workspace.id },
          { userId: auth.user.id },
        ],
      },
      data: {
        bimiSvgContent: null,
        bimiRecord: null,
        bimiStatus: "NOT_CONFIGURED",
        isBimiValid: false,
      },
    });

    return NextResponse.json({ success: true, message: "BIMI logo removed." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
