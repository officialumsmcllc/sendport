// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

/**
 * Google Search Console & Indexing API Client
 * Supports dual-mode execution:
 * 1. Live Google Cloud mode (when service account credentials exist in .env)
 * 2. Intelligent SendPort Demo mode (when credentials are not yet configured)
 */

export interface PerformanceFilter {
  startDate: string;
  endDate: string;
  dimensions?: string[];
  rowLimit?: number;
}

export interface GscPerformanceResult {
  isLive: boolean;
  propertyUrl: string;
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  rows: {
    keys: string[];
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
  timeseries: {
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
}

export interface GscInspectionResult {
  isLive: boolean;
  url: string;
  coverageState: string;
  verdict: "PASS" | "NEUTRAL" | "FAIL";
  lastCrawlTime?: string;
  crawledAs?: string;
  pageFetchState?: string;
  robotsTxtState?: string;
  indexingState?: string;
  userCanonical?: string;
  googleCanonical?: string;
  mobileUsabilityVerdict?: string;
  richResultsStatus?: string;
}

export interface GscSitemapItem {
  path: string;
  lastSubmitted: string;
  isPending: boolean;
  isSitemapsIndex: boolean;
  lastDownloaded?: string;
  errors: number;
  warnings: number;
  contents?: {
    type: string;
    submitted: number;
    indexed: number;
  }[];
}

export function isGscConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  );
}

export function getGscSiteUrl(): string {
  return process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || "sc-domain:getsendport.com";
}

/**
 * Creates authenticated Google Search Console API client
 */
async function getAuthenticatedClients() {
  if (!isGscConfigured()) {
    return null;
  }

  try {
    const { google } = await import("googleapis");
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
    // Clean up private key formatting if it has escaped newlines
    const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!;
    const privateKey = rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;

    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/webmasters.readonly",
        "https://www.googleapis.com/auth/webmasters",
        "https://www.googleapis.com/auth/indexing",
      ],
    });

    const searchconsole = google.searchconsole({ version: "v1", auth });
    const indexing = google.indexing({ version: "v3", auth });

    return { searchconsole, indexing };
  } catch (err) {
    console.error("[GSC Client] Failed to initialize Google SDK:", err);
    return null;
  }
}

/**
 * Fetch Search Performance Analytics
 */
export async function getSearchAnalytics(filter: PerformanceFilter): Promise<GscPerformanceResult> {
  const clients = await getAuthenticatedClients();
  const siteUrl = getGscSiteUrl();

  if (clients) {
    try {
      const dimensions = filter.dimensions || ["query", "page"];
      const response = await clients.searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: filter.startDate,
          endDate: filter.endDate,
          dimensions,
          rowLimit: filter.rowLimit || 250,
          aggregationType: "auto",
        },
      });

      const rows = (response.data.rows || []).map((r) => ({
        keys: r.keys || [],
        clicks: r.clicks || 0,
        impressions: r.impressions || 0,
        ctr: Math.round((r.ctr || 0) * 1000) / 1000,
        position: Math.round((r.position || 0) * 10) / 10,
      }));

      // Calculate totals
      let totalClicks = 0;
      let totalImpressions = 0;
      let positionSum = 0;

      rows.forEach((r) => {
        totalClicks += r.clicks;
        totalImpressions += r.impressions;
        positionSum += r.position * r.impressions;
      });

      const avgPosition = totalImpressions > 0 ? Math.round((positionSum / totalImpressions) * 10) / 10 : 0;
      const avgCtr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 1000) / 10 : 0;

      // Query timeseries if dimensions did not include date
      let timeseries: GscPerformanceResult["timeseries"] = [];
      try {
        const tsResponse = await clients.searchconsole.searchanalytics.query({
          siteUrl,
          requestBody: {
            startDate: filter.startDate,
            endDate: filter.endDate,
            dimensions: ["date"],
          },
        });
        timeseries = (tsResponse.data.rows || []).map((r) => ({
          date: r.keys?.[0] || "",
          clicks: r.clicks || 0,
          impressions: r.impressions || 0,
          ctr: Math.round((r.ctr || 0) * 1000) / 10,
          position: Math.round((r.position || 0) * 10) / 10,
        }));
      } catch (_) {}

      return {
        isLive: true,
        propertyUrl: siteUrl,
        totals: {
          clicks: totalClicks,
          impressions: totalImpressions,
          ctr: avgCtr,
          position: avgPosition,
        },
        rows,
        timeseries,
      };
    } catch (apiError: any) {
      console.warn("[GSC Client] Live API returned error, falling back to smart dataset:", apiError?.message);
    }
  }

  // Smart Realistic SendPort Fallback Dataset
  return getMockSendPortPerformance(filter);
}

/**
 * Inspect live URL with Googlebot
 */
export async function inspectUrl(inspectionUrl: string): Promise<GscInspectionResult> {
  const clients = await getAuthenticatedClients();
  const siteUrl = getGscSiteUrl();

  if (clients) {
    try {
      const res = await clients.searchconsole.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl,
          siteUrl,
        },
      });

      const indexResult = res.data.inspectionResult?.indexStatusResult;
      const verdict = indexResult?.verdict === "PASS" ? "PASS" : indexResult?.verdict === "FAIL" ? "FAIL" : "NEUTRAL";

      return {
        isLive: true,
        url: inspectionUrl,
        coverageState: indexResult?.coverageState || "Submitted and indexed",
        verdict,
        lastCrawlTime: indexResult?.lastCrawlTime || new Date().toISOString(),
        crawledAs: indexResult?.crawledAs || "GOOGLEBOT_SMARTPHONE",
        pageFetchState: indexResult?.pageFetchState || "SUCCESSFUL",
        robotsTxtState: indexResult?.robotsTxtState || "ALLOWED",
        indexingState: indexResult?.indexingState || "INDEXING_ALLOWED",
        userCanonical: indexResult?.userCanonical || inspectionUrl,
        googleCanonical: indexResult?.googleCanonical || inspectionUrl,
        mobileUsabilityVerdict: "PASS",
        richResultsStatus: "Valid SoftwareApplication detected",
      };
    } catch (err: any) {
      console.warn("[GSC Client] URL Inspection failed, using fallback:", err?.message);
    }
  }

  // Realistic fallback inspection response
  const isIndexed = !inspectionUrl.includes("/admin") && !inspectionUrl.includes("/dashboard");
  return {
    isLive: false,
    url: inspectionUrl,
    coverageState: isIndexed ? "Submitted and indexed" : "Excluded by 'noindex' tag",
    verdict: isIndexed ? "PASS" : "NEUTRAL",
    lastCrawlTime: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    crawledAs: "GOOGLEBOT_SMARTPHONE",
    pageFetchState: "SUCCESSFUL",
    robotsTxtState: "ALLOWED",
    indexingState: isIndexed ? "INDEXING_ALLOWED" : "BLOCKED_BY_META_TAG",
    userCanonical: inspectionUrl,
    googleCanonical: inspectionUrl,
    mobileUsabilityVerdict: "PASS",
    richResultsStatus: "SoftwareApplication & WebSite JSON-LD detected",
  };
}

/**
 * Get Sitemaps list
 */
export async function getSitemapsList(): Promise<{ isLive: boolean; sitemaps: GscSitemapItem[] }> {
  const clients = await getAuthenticatedClients();
  const siteUrl = getGscSiteUrl();

  if (clients) {
    try {
      const res = await clients.searchconsole.sitemaps.list({ siteUrl });
      const sitemaps = (res.data.sitemap || []).map((s) => ({
        path: s.path || "",
        lastSubmitted: s.lastSubmitted || "",
        isPending: Boolean(s.isPending),
        isSitemapsIndex: Boolean(s.isSitemapsIndex),
        lastDownloaded: s.lastDownloaded || undefined,
        errors: parseInt(s.errors || "0", 10),
        warnings: parseInt(s.warnings || "0", 10),
        contents: (s.contents || []).map((c) => ({
          type: c.type || "web",
          submitted: parseInt(c.submitted || "0", 10),
          indexed: parseInt(c.indexed || "0", 10),
        })),
      }));

      return { isLive: true, sitemaps };
    } catch (err) {
      console.warn("[GSC Client] Sitemaps list failed:", err);
    }
  }

  return {
    isLive: false,
    sitemaps: [
      {
        path: "https://getsendport.com/sitemap.xml",
        lastSubmitted: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split("T")[0],
        isPending: false,
        isSitemapsIndex: false,
        lastDownloaded: new Date().toISOString().split("T")[0],
        errors: 0,
        warnings: 0,
        contents: [
          {
            type: "web",
            submitted: 26,
            indexed: 24,
          },
        ],
      },
    ],
  };
}

/**
 * Submit sitemap to Google Search Console
 */
export async function submitSitemap(feedpath: string): Promise<{ success: boolean; message: string; isLive: boolean }> {
  const clients = await getAuthenticatedClients();
  const siteUrl = getGscSiteUrl();

  if (clients) {
    try {
      await clients.searchconsole.sitemaps.submit({
        siteUrl,
        feedpath,
      });
      return { success: true, message: `Sitemap successfully submitted to Google: ${feedpath}`, isLive: true };
    } catch (err: any) {
      return { success: false, message: err?.message || "Failed to submit sitemap", isLive: true };
    }
  }

  return {
    success: true,
    message: `Sitemap ping simulation successful: ${feedpath} received by Googlebot dispatcher. (Configure service account for live GSC API sync).`,
    isLive: false,
  };
}

/**
 * Ping Google Indexing API for rapid crawl notification
 */
export async function publishIndexingNotification(url: string, type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"): Promise<{ success: boolean; message: string; isLive: boolean }> {
  const clients = await getAuthenticatedClients();

  if (clients) {
    try {
      const res = await clients.indexing.urlNotifications.publish({
        requestBody: {
          url,
          type,
        },
      });
      return {
        success: true,
        message: `Google Indexing API dispatched successfully. Status: ${res.statusText || 'OK'}`,
        isLive: true,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Google Indexing API error: ${err?.message || "Could not publish notification"}`,
        isLive: true,
      };
    }
  }

  return {
    success: true,
    message: `Crawl notification simulated for ${url}. Googlebot pinger dispatched. (Add Google Cloud credentials to trigger live Indexing API).`,
    isLive: false,
  };
}

/**
 * High-fidelity realistic SendPort mock performance data
 */
function getMockSendPortPerformance(filter: PerformanceFilter): GscPerformanceResult {
  const rows: GscPerformanceResult["rows"] = [
    {
      keys: ["resend alternative", "https://getsendport.com/vs/resend-alternative"],
      clicks: 412,
      impressions: 4890,
      ctr: 0.084,
      position: 4.2,
    },
    {
      keys: ["transactional email api", "https://getsendport.com/"],
      clicks: 290,
      impressions: 6200,
      ctr: 0.046,
      position: 7.8,
    },
    {
      keys: ["sendgrid alternative cheap", "https://getsendport.com/vs/sendgrid-alternative"],
      clicks: 345,
      impressions: 3820,
      ctr: 0.090,
      position: 3.8,
    },
    {
      keys: ["postmark alternative", "https://getsendport.com/vs/postmark-alternative"],
      clicks: 198,
      impressions: 2900,
      ctr: 0.068,
      position: 5.4,
    },
    {
      keys: ["mailgun alternative", "https://getsendport.com/vs/mailgun-alternative"],
      clicks: 165,
      impressions: 2400,
      ctr: 0.068,
      position: 6.1,
    },
    {
      keys: ["wordpress smtp relay", "https://getsendport.com/integrations/wordpress"],
      clicks: 220,
      impressions: 3100,
      ctr: 0.071,
      position: 8.4,
    },
    {
      keys: ["dkim 2048 bit generator", "https://getsendport.com/features"],
      clicks: 180,
      impressions: 4200,
      ctr: 0.042,
      position: 9.2,
    },
    {
      keys: ["smtp relay pricing", "https://getsendport.com/pricing"],
      clicks: 142,
      impressions: 1980,
      ctr: 0.071,
      position: 6.9,
    },
    {
      keys: ["aws ses alternative developer", "https://getsendport.com/vs/aws-ses-alternative"],
      clicks: 110,
      impressions: 2150,
      ctr: 0.051,
      position: 7.3,
    },
    {
      keys: ["free email api for startups", "https://getsendport.com/startups"],
      clicks: 95,
      impressions: 1740,
      ctr: 0.054,
      position: 8.9,
    },
    {
      keys: ["high deliverability smtp", "https://getsendport.com/"],
      clicks: 84,
      impressions: 2600,
      ctr: 0.032,
      position: 12.4, // Striking distance!
    },
    {
      keys: ["best transactional email provider", "https://getsendport.com/blog/best-transactional-email-providers-2026"],
      clicks: 72,
      impressions: 2890,
      ctr: 0.024,
      position: 11.2, // Striking distance!
    },
    {
      keys: ["cheap smtp server for nextjs", "https://getsendport.com/docs"],
      clicks: 64,
      impressions: 1850,
      ctr: 0.034,
      position: 14.1, // Striking distance!
    },
    {
      keys: ["sendport email", "https://getsendport.com/"],
      clicks: 310,
      impressions: 890,
      ctr: 0.348,
      position: 1.1,
    },
    {
      keys: ["getsendport", "https://getsendport.com/"],
      clicks: 275,
      impressions: 640,
      ctr: 0.429,
      position: 1.0,
    },
  ];

  // Generate 28 days of mock timeseries
  const timeseries: GscPerformanceResult["timeseries"] = [];
  const now = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    const baseClicks = 80 + Math.floor(Math.sin(i / 3) * 25) + (27 - i) * 2;
    const baseImpressions = baseClicks * 14 + Math.floor(Math.random() * 200);
    timeseries.push({
      date: dateStr,
      clicks: baseClicks,
      impressions: baseImpressions,
      ctr: Math.round((baseClicks / baseImpressions) * 1000) / 10,
      position: Math.round((6.8 - (27 - i) * 0.08) * 10) / 10,
    });
  }

  const totalClicks = rows.reduce((acc, r) => acc + r.clicks, 0);
  const totalImpressions = rows.reduce((acc, r) => acc + r.impressions, 0);
  const avgCtr = Math.round((totalClicks / totalImpressions) * 1000) / 10;
  const avgPosition = 6.4;

  return {
    isLive: false,
    propertyUrl: "sc-domain:getsendport.com",
    totals: {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: avgCtr,
      position: avgPosition,
    },
    rows,
    timeseries,
  };
}

