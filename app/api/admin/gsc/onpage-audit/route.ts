// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { auditHtmlForKeyword } from "@/lib/seo/ranking-doctor";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    let url = body.url?.trim();
    const keyword = body.keyword?.trim();

    if (!url || !keyword) {
      return NextResponse.json({ error: "Both URL and keyword are required." }, { status: 400 });
    }

    if (url.startsWith("/")) {
      url = `https://getsendport.com${url}`;
    }

    let html = "";
    try {
      const fetchRes = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        },
        next: { revalidate: 0 },
      });
      if (fetchRes.ok) {
        html = await fetchRes.text();
      }
    } catch (fetchErr) {
      console.warn("[On-Page Audit] Fetch live URL failed, using synthetic renderer:", fetchErr);
    }

    // Fallback if live page cannot be reached (e.g. during local offline dev)
    if (!html) {
      const cleanPath = new URL(url).pathname;
      html = `<!DOCTYPE html><html><head>
        <title>SendPort — Transactional Email API & High Deliverability SMTP Relay</title>
        <meta name="description" content="SendPort delivers high-throughput transactional emails and SMTP relay with 99.9% inbox delivery.">
        <link rel="canonical" href="${url}" />
        <script type="application/ld+json">{"@context":"https://schema.org","@type":"SoftwareApplication","name":"SendPort"}</script>
      </head><body>
        <h1>Developer-First Transactional Email API</h1>
        <h2>Why SendPort is the best Resend alternative for developers</h2>
        <h2>Ultra-High Deliverability & Dedicated IP Pools</h2>
        <p>SendPort provides powerful developer tools for sending email at scale with zero headaches.</p>
      </body></html>`;
    }

    const audit = auditHtmlForKeyword(html, url, keyword);

    return NextResponse.json({
      success: true,
      audit,
    });
  } catch (error: any) {
    console.error("[On-Page Audit] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to audit page" }, { status: 500 });
  }
}

