// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

/**
 * Automated Googlebot URL Inspection & Auto-Healer Engine
 * Continuously iterates through all SendPort public pages.
 * If any page is detected as NOT INDEXED, it automatically
 * dispatches an instant Googlebot crawl notification via the Google Indexing API.
 */

import { BLOG_POSTS } from "@/lib/blog/posts";
import { inspectUrl, publishIndexingNotification, isGscConfigured } from "./gsc-client";

export interface AutoIndexItem {
  url: string;
  isIndexed: boolean;
  coverageState: string;
  lastCrawlTime?: string;
  lastChecked: string;
  actionTaken: "VERIFIED_INDEXED" | "AUTO_INDEXED" | "NOINDEX_POLICY" | "ERROR";
  actionMessage: string;
  priority: "CRITICAL" | "HIGH" | "NORMAL";
}

export interface AutoIndexScanReport {
  lastRun: string;
  isLive: boolean;
  totalUrls: number;
  indexedCount: number;
  unindexedCount: number;
  autoDispatchedCount: number;
  items: AutoIndexItem[];
}

// In-memory cache for fast repeated views in the Admin UI
let cachedReport: AutoIndexScanReport | null = null;
let isScanning = false;

/**
 * Returns complete catalog of all public pages for SendPort
 */
export function getAllSiteUrls(): { url: string; priority: "CRITICAL" | "HIGH" | "NORMAL" }[] {
  const corePages = [
    { path: "/", priority: "CRITICAL" },
    { path: "/vs/resend-alternative", priority: "CRITICAL" },
    { path: "/vs/sendgrid-alternative", priority: "CRITICAL" },
    { path: "/vs/postmark-alternative", priority: "CRITICAL" },
    { path: "/vs/mailgun-alternative", priority: "CRITICAL" },
    { path: "/vs/aws-ses-alternative", priority: "CRITICAL" },
    { path: "/vs/brevo-alternative", priority: "CRITICAL" },
    { path: "/features", priority: "HIGH" },
    { path: "/pricing", priority: "CRITICAL" },
    { path: "/integrations/wordpress", priority: "HIGH" },
    { path: "/integrations/shopify", priority: "HIGH" },
    { path: "/blog", priority: "HIGH" },
    { path: "/docs", priority: "HIGH" },
    { path: "/startups", priority: "NORMAL" },
    { path: "/security", priority: "NORMAL" },
    { path: "/about", priority: "NORMAL" },
    { path: "/contact", priority: "NORMAL" },
    { path: "/status", priority: "NORMAL" },
    { path: "/privacy", priority: "NORMAL" },
    { path: "/terms", priority: "NORMAL" },
  ];

  const blogPages = BLOG_POSTS.map((post) => ({
    path: `/blog/${post.slug}`,
    priority: "HIGH" as const,
  }));

  const all = [...corePages, ...blogPages];

  return all.map((item) => ({
    url: `https://getsendport.com${item.path === "/" ? "" : item.path}`,
    priority: item.priority as "CRITICAL" | "HIGH" | "NORMAL",
  }));
}

/**
 * Executes a full scan of all site pages:
 * 1. Checks Googlebot index status
 * 2. If NOT indexed, automatically pings Google Indexing API to request crawl
 */
export async function runAutoIndexScan(): Promise<AutoIndexScanReport> {
  if (isScanning && cachedReport) {
    return cachedReport;
  }

  isScanning = true;
  const siteUrls = getAllSiteUrls();
  const items: AutoIndexItem[] = [];
  const isLive = isGscConfigured();

  let indexedCount = 0;
  let unindexedCount = 0;
  let autoDispatchedCount = 0;

  for (const { url, priority } of siteUrls) {
    try {
      // 1. Inspect live Googlebot coverage
      const inspection = await inspectUrl(url);

      const coverage = (inspection.coverageState || "").toLowerCase();
      const verdict = inspection.verdict;

      // Determine if properly indexed
      const isIndexed =
        verdict === "PASS" &&
        !coverage.includes("not indexed") &&
        !coverage.includes("excluded") &&
        !coverage.includes("unknown");

      let actionTaken: AutoIndexItem["actionTaken"] = "VERIFIED_INDEXED";
      let actionMessage = "Googlebot has verified and indexed this URL.";

      if (!isIndexed) {
        unindexedCount++;

        // 2. AUTOMATIC REMEDIATION: Auto-dispatch to Googlebot!
        const pingRes = await publishIndexingNotification(url, "URL_UPDATED");
        autoDispatchedCount++;
        actionTaken = "AUTO_INDEXED";
        actionMessage = `Auto-Healed: Googlebot crawl ping dispatched (${pingRes.message})`;
      } else {
        indexedCount++;
      }

      items.push({
        url,
        isIndexed,
        coverageState: inspection.coverageState || (isIndexed ? "Submitted and indexed" : "Discovered - currently not indexed"),
        lastCrawlTime: inspection.lastCrawlTime,
        lastChecked: new Date().toISOString(),
        actionTaken,
        actionMessage,
        priority,
      });

      // Small 30ms throttle between API calls to prevent flooding
      await new Promise((resolve) => setTimeout(resolve, 30));
    } catch (err: any) {
      items.push({
        url,
        isIndexed: false,
        coverageState: "Error inspecting",
        lastChecked: new Date().toISOString(),
        actionTaken: "ERROR",
        actionMessage: `Failed to inspect: ${err?.message || "Unknown error"}`,
        priority,
      });
      unindexedCount++;
    }
  }

  const report: AutoIndexScanReport = {
    lastRun: new Date().toISOString(),
    isLive,
    totalUrls: siteUrls.length,
    indexedCount,
    unindexedCount,
    autoDispatchedCount,
    items,
  };

  cachedReport = report;
  isScanning = false;
  return report;
}

/**
 * Returns latest cached report or runs a quick initial scan
 */
export async function getLatestAutoIndexReport(): Promise<AutoIndexScanReport> {
  if (cachedReport) {
    return cachedReport;
  }
  return runAutoIndexScan();
}

