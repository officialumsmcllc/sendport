// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

/**
 * AI SEO Rank Doctor & Growth Engine
 * Analyzes GSC performance data (query + page tuples) to find:
 * 1. "Striking Distance" keywords (positions 4.0 - 20.0 with high impressions)
 * 2. "CTR Optimizers" (page 1 keywords with low click-through-rates)
 * 3. "Keyword Cannibalization" (multiple URLs fighting for the same keyword)
 * 4. "On-Page SEO Auditor" (analyzes live HTML structure for target keywords)
 */

export interface GscRow {
  keys: string[]; // [query, page] or [query] or [page]
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface StrikingDistanceOpportunity {
  id: string;
  query: string;
  page: string;
  currentPosition: number;
  impressions: number;
  clicks: number;
  ctr: number;
  potentialTrafficLift: string;
  urgency: "HIGH" | "MEDIUM" | "OPPORTUNITY";
  actionSteps: {
    headingSuggestion: string;
    contentTopic: string;
    internalLinkTip: string;
  };
}

export interface CtrOpportunity {
  id: string;
  query: string;
  page: string;
  currentPosition: number;
  impressions: number;
  clicks: number;
  ctr: number;
  expectedCtr: number;
  missedClicksPerMonth: number;
  titleSuggestions: string[];
  metaDescriptionSuggestion: string;
}

export interface CannibalizationIssue {
  id: string;
  query: string;
  competingPages: {
    page: string;
    clicks: number;
    impressions: number;
    position: number;
  }[];
  recommendation: string;
}

export interface OnPageAuditResult {
  url: string;
  keyword: string;
  score: number; // 0 - 100
  verdict: "EXCELLENT" | "GOOD" | "NEEDS_OPTIMIZATION" | "POOR";
  checks: {
    name: string;
    passed: boolean;
    importance: "CRITICAL" | "HIGH" | "MEDIUM";
    details: string;
    recommendation: string;
  }[];
  extractedTags: {
    title?: string;
    metaDescription?: string;
    h1Tags: string[];
    h2Tags: string[];
    hasSchema: boolean;
    canonical?: string;
  };
}

/**
 * Identifies keywords in striking distance (positions 4 to 20 with impressions > 50).
 * Moving these into the top 3 yields immediate 5x to 15x traffic increases.
 */
export function findStrikingDistanceKeywords(rows: GscRow[]): StrikingDistanceOpportunity[] {
  const results: StrikingDistanceOpportunity[] = [];

  for (const row of rows) {
    if (row.keys.length < 2) continue;
    const [query, page] = row.keys;

    // Filter striking distance: position between 4 and 20, meaningful impressions
    if (row.position >= 4.0 && row.position <= 20.0 && row.impressions >= 50) {
      // Calculate estimated potential traffic lift if it moves to position 2 (~15% CTR)
      const potentialClicks = Math.round(row.impressions * 0.15);
      const lift = Math.max(1, potentialClicks - row.clicks);

      let urgency: "HIGH" | "MEDIUM" | "OPPORTUNITY" = "OPPORTUNITY";
      if (row.position <= 10 && row.impressions > 200) {
        urgency = "HIGH";
      } else if (row.position <= 12 || row.impressions > 100) {
        urgency = "MEDIUM";
      }

      // Format clean topic name
      const cleanQuery = query.trim();
      const capQuery = cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1);

      results.push({
        id: `sd-${encodeURIComponent(query)}-${Math.round(row.position)}`,
        query,
        page,
        currentPosition: Math.round(row.position * 10) / 10,
        impressions: row.impressions,
        clicks: row.clicks,
        ctr: Math.round(row.ctr * 1000) / 10, // formatted percentage e.g. 2.4%
        potentialTrafficLift: `+${lift} clicks/mo`,
        urgency,
        actionSteps: {
          headingSuggestion: `Add an H2: "Why SendPort is the best choice for ${capQuery}"`,
          contentTopic: `Address user intent: Explain DKIM setup, pricing advantage, and 99.9% inbox deliverability for "${cleanQuery}".`,
          internalLinkTip: `Add an internal link with anchor text "${cleanQuery}" from the SendPort homepage or comparison articles.`,
        },
      });
    }
  }

  // Sort by highest impression opportunity first
  return results.sort((a, b) => b.impressions - a.impressions).slice(0, 15);
}

/**
 * Finds high-impression page-1 keywords that have abnormally low CTR.
 * These are screaming for title tag and meta description rewriting.
 */
export function findLowCtrOpportunities(rows: GscRow[]): CtrOpportunity[] {
  const results: CtrOpportunity[] = [];

  for (const row of rows) {
    if (row.keys.length < 2) continue;
    const [query, page] = row.keys;

    // Expected CTR benchmark:
    // Pos 1: ~28%, Pos 2: ~15%, Pos 3: ~11%, Pos 4-6: ~6%, Pos 7-10: ~3%
    let expectedCtr = 3.0;
    if (row.position <= 2) expectedCtr = 18.0;
    else if (row.position <= 4) expectedCtr = 10.0;
    else if (row.position <= 7) expectedCtr = 5.0;

    const actualCtrPercent = row.ctr * 100;

    // If ranking on page 1 (<= 10), impressions >= 100, but CTR is below benchmark
    if (row.position <= 10.0 && row.impressions >= 100 && actualCtrPercent < expectedCtr * 0.6) {
      const missedClicks = Math.round(row.impressions * ((expectedCtr - actualCtrPercent) / 100));

      const capQuery = query.charAt(0).toUpperCase() + query.slice(1);

      results.push({
        id: `ctr-${encodeURIComponent(query)}`,
        query,
        page,
        currentPosition: Math.round(row.position * 10) / 10,
        impressions: row.impressions,
        clicks: row.clicks,
        ctr: Math.round(actualCtrPercent * 10) / 10,
        expectedCtr,
        missedClicksPerMonth: Math.max(5, missedClicks),
        titleSuggestions: [
          `${capQuery}: 10x Faster & 50% Cheaper | SendPort`,
          `Best ${capQuery} for Developers (Free Tier & High Deliverability)`,
          `Why Switch to SendPort for ${capQuery}? [2026 Comparison]`,
        ],
        metaDescriptionSuggestion: `Looking for ${query}? SendPort offers high-throughput SMTP & API email delivery with guaranteed 99.9% inbox placement. Start free today.`,
      });
    }
  }

  return results.sort((a, b) => b.missedClicksPerMonth - a.missedClicksPerMonth).slice(0, 10);
}

/**
 * Detects keyword cannibalization where 2 or more distinct pages
 * are split-testing or competing for the same query.
 */
export function detectCannibalization(rows: GscRow[]): CannibalizationIssue[] {
  const queryMap = new Map<string, { page: string; clicks: number; impressions: number; position: number }[]>();

  for (const row of rows) {
    if (row.keys.length < 2) continue;
    const [query, page] = row.keys;

    if (row.impressions < 30) continue;

    const list = queryMap.get(query) || [];
    list.push({
      page,
      clicks: row.clicks,
      impressions: row.impressions,
      position: Math.round(row.position * 10) / 10,
    });
    queryMap.set(query, list);
  }

  const issues: CannibalizationIssue[] = [];

  queryMap.forEach((competingPages, query) => {
    if (competingPages.length >= 2) {
      // Sort pages by clicks then impressions
      competingPages.sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);
      const winner = competingPages[0];
      const competitor = competingPages[1];

      issues.push({
        id: `cannibal-${encodeURIComponent(query)}`,
        query,
        competingPages,
        recommendation: `Consolidate authority: Set '${winner.page}' as the primary target. On '${competitor.page}', add an internal link pointing to '${winner.page}' using anchor text '${query}'.`,
      });
    }
  });

  return issues.slice(0, 5);
}

/**
 * Audits a page's HTML structure against a target keyword
 * and produces a 0-100% SEO readiness score with specific recommendations.
 */
export function auditHtmlForKeyword(html: string, pageUrl: string, targetKeyword: string): OnPageAuditResult {
  const kw = targetKeyword.toLowerCase().trim();
  const lowerHtml = html.toLowerCase();

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract meta description
  const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                    html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  const metaDescription = metaMatch ? metaMatch[1].trim() : "";

  // Extract H1s
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  const h1Tags: string[] = [];
  let h1M: RegExpExecArray | null;
  while ((h1M = h1Regex.exec(html)) !== null) {
    const text = h1M[1].replace(/<[^>]+>/g, "").trim();
    if (text) h1Tags.push(text);
  }

  // Extract H2s
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const h2Tags: string[] = [];
  let h2M: RegExpExecArray | null;
  while ((h2M = h2Regex.exec(html)) !== null) {
    const text = h2M[1].replace(/<[^>]+>/g, "").trim();
    if (text) h2Tags.push(text);
  }

  // Extract canonical
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : undefined;

  // Schema presence
  const hasSchema = html.includes('type="application/ld+json"');

  const checks: OnPageAuditResult["checks"] = [];
  let score = 0;

  // Check 1: Title contains keyword (25 points)
  const titleHasKw = title.toLowerCase().includes(kw);
  if (titleHasKw) {
    score += 25;
    checks.push({
      name: "Title Tag Keyword Presence",
      passed: true,
      importance: "CRITICAL",
      details: `Target keyword '${targetKeyword}' found in title: "${title.slice(0, 60)}..."`,
      recommendation: "Title tag is properly targeted.",
    });
  } else {
    checks.push({
      name: "Title Tag Keyword Presence",
      passed: false,
      importance: "CRITICAL",
      details: `Target keyword '${targetKeyword}' is missing from the title tag.`,
      recommendation: `Add '${targetKeyword}' near the beginning of your <title> tag for maximum ranking weight.`,
    });
  }

  // Check 2: H1 contains keyword (20 points)
  const h1HasKw = h1Tags.some((h1) => h1.toLowerCase().includes(kw));
  if (h1HasKw) {
    score += 20;
    checks.push({
      name: "H1 Heading Alignment",
      passed: true,
      importance: "CRITICAL",
      details: `Target keyword is present in primary H1 heading.`,
      recommendation: "H1 heading clearly communicates topic to search engines.",
    });
  } else {
    checks.push({
      name: "H1 Heading Alignment",
      passed: false,
      importance: "CRITICAL",
      details: `H1 does not contain '${targetKeyword}'. Found: "${h1Tags[0] || 'No H1 found'}"`,
      recommendation: `Include '${targetKeyword}' in your primary H1 tag.`,
    });
  }

  // Check 3: Meta description contains keyword (15 points)
  const metaHasKw = metaDescription.toLowerCase().includes(kw);
  if (metaHasKw) {
    score += 15;
    checks.push({
      name: "Meta Description Target",
      passed: true,
      importance: "HIGH",
      details: `Keyword is present in meta description.`,
      recommendation: "Meta description will be bolded by Google when searchers query this keyword.",
    });
  } else {
    checks.push({
      name: "Meta Description Target",
      passed: false,
      importance: "HIGH",
      details: `Meta description is missing '${targetKeyword}'.`,
      recommendation: `Add '${targetKeyword}' naturally into the meta description to boost click-through rates.`,
    });
  }

  // Check 4: H2 Subheadings (15 points)
  const h2Count = h2Tags.filter((h2) => h2.toLowerCase().includes(kw)).length;
  if (h2Count > 0) {
    score += 15;
    checks.push({
      name: "H2 Subheading Optimization",
      passed: true,
      importance: "HIGH",
      details: `${h2Count} H2 subheading(s) contain the target keyword or variations.`,
      recommendation: "Subheadings properly reinforce topical authority.",
    });
  } else {
    checks.push({
      name: "H2 Subheading Optimization",
      passed: false,
      importance: "HIGH",
      details: `None of the ${h2Tags.length} H2 tags contain '${targetKeyword}'.`,
      recommendation: `Add at least one H2 addressing search intent: e.g. "Why SendPort is the Top ${targetKeyword}".`,
    });
  }

  // Check 5: Canonical Tag (10 points)
  if (canonical) {
    score += 10;
    checks.push({
      name: "Canonical URL Set",
      passed: true,
      importance: "MEDIUM",
      details: `Canonical tag verified: ${canonical}`,
      recommendation: "Prevents duplicate content dilution.",
    });
  } else {
    checks.push({
      name: "Canonical URL Set",
      passed: false,
      importance: "MEDIUM",
      details: `No explicit canonical tag detected.`,
      recommendation: `Set canonical tag in <head> to prevent duplicate indexation.`,
    });
  }

  // Check 6: JSON-LD Structured Data (15 points)
  if (hasSchema) {
    score += 15;
    checks.push({
      name: "Structured Data (Schema.org)",
      passed: true,
      importance: "HIGH",
      details: `JSON-LD structured data detected.`,
      recommendation: "Rich snippets can be rendered in Google SERP.",
    });
  } else {
    checks.push({
      name: "Structured Data (Schema.org)",
      passed: false,
      importance: "HIGH",
      details: `No JSON-LD schema detected on this page.`,
      recommendation: `Add SoftwareApplication or FAQPage schema to stand out in Google results.`,
    });
  }

  let verdict: OnPageAuditResult["verdict"] = "POOR";
  if (score >= 85) verdict = "EXCELLENT";
  else if (score >= 70) verdict = "GOOD";
  else if (score >= 50) verdict = "NEEDS_OPTIMIZATION";

  return {
    url: pageUrl,
    keyword: targetKeyword,
    score,
    verdict,
    checks,
    extractedTags: {
      title,
      metaDescription,
      h1Tags,
      h2Tags,
      hasSchema,
      canonical,
    },
  };
}

