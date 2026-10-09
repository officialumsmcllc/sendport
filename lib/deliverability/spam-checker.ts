/**
 * Comprehensive Deliverability & Spam Heuristic Engine (2026 Edition)
 * Aligned with SpamAssassin 4.x, Google Workspace, Yahoo, and Microsoft Defender standards.
 */

const SPAM_TRIGGER_WORDS = [
  "100% free", "act now", "apply now", "as seen on", "bargain", "be your own boss",
  "best price", "billion dollars", "bonus", "buy direct", "call now", "cash bonus",
  "cash prize", "certified", "cheap", "claims", "clearance", "click below",
  "click here", "compare rates", "credit card offers", "cures", "deal", "dear friend",
  "direct email", "direct marketing", "discount", "double your income", "earn extra cash",
  "earn money", "eliminate debt", "exclusive deal", "expect to earn", "extra income",
  "fast cash", "financial freedom", "free consultation", "free gift", "free hosting",
  "free info", "free membership", "free money", "free preview", "free sample",
  "free trial", "get out of debt", "get paid", "giveaway", "guaranteed", "hidden assets",
  "income from home", "increase sales", "instant cash", "investment scheme", "join millions",
  "limited time", "make money online", "millionaire", "miracle", "money back guarantee", "multi-level marketing",
  "no catch", "no cost", "no credit check", "no experience", "no fees", "no gimmicks",
  "no hidden costs", "no obligation", "no purchase necessary", "no risk", "no strings attached",
  "not spam", "obligation", "once in a lifetime", "one time offer", "online marketing riches",
  "open immediately", "order now", "passwords", "pennies a day", "potential earnings",
  "prize winner", "pure profit", "risk free", "save big", "save money",
  "score", "special promotion", "terms and conditions", "this isn't spam", "time limited",
  "unlimited profit", "urgent response required", "valuable offer", "viagra", "vicodin", "warranty expired",
  "while supplies last", "winner notification", "you have been selected", "crypto pump", "forex signals",
  "wire transfer urgent", "beneficiary claim", "inheritance fund"
];

const BLACKLISTED_SHORTENERS = [
  "bit.ly", "tinyurl.com", "cutt.ly", "is.gd", "t.co", "ow.ly", "buff.ly", "adf.ly"
];

export interface SpamCheckResult {
  score: number; // 0 to 100 (100 is cleanest, 0 is severe spam)
  isSpamLikely: boolean;
  detectedTriggers: string[];
  suggestions: string[];
  details: {
    keywordPenalty: number;
    subjectPenalty: number;
    linkPenalty: number;
    ratioPenalty: number;
    hasUnsubscribeLink: boolean;
    hasRawIpLinks: boolean;
    hasShortenedLinks: boolean;
    textLength: number;
    htmlLength: number;
  };
}

/**
 * Strips HTML tags and decodes entities into clean, readable text
 */
export function generatePlainTextFromHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Analyzes email deliverability heuristics and returns a score from 0 to 100
 */
export function analyzeEmailDeliverability(subject: string, htmlContent: string): SpamCheckResult {
  const combinedText = `${subject || ""} ${htmlContent || ""}`.toLowerCase();
  const detectedTriggers: string[] = [];
  const suggestions: string[] = [];

  let keywordPenalty = 0;
  let subjectPenalty = 0;
  let linkPenalty = 0;
  let ratioPenalty = 0;

  // 1. Keyword check
  for (const phrase of SPAM_TRIGGER_WORDS) {
    if (combinedText.includes(phrase)) {
      detectedTriggers.push(phrase);
    }
  }
  keywordPenalty = Math.min(45, detectedTriggers.length * 7);

  // 2. Subject Line Checks
  const trimmedSubject = (subject || "").trim();
  if (trimmedSubject.length > 0 && trimmedSubject === trimmedSubject.toUpperCase() && trimmedSubject.length > 5) {
    suggestions.push("Avoid using ALL CAPS in the subject line (triggers SpamAssassin SUBJ_ALL_CAPS).");
    subjectPenalty += 15;
  }
  if ((trimmedSubject.match(/[!?]/g) || []).length > 2) {
    suggestions.push("Avoid multiple exclamation or question marks in the subject line.");
    subjectPenalty += 10;
  }
  if (trimmedSubject.includes("$") || trimmedSubject.includes("€") || trimmedSubject.includes("£")) {
    suggestions.push("Avoid currency symbols ($/€/£) directly in the subject line.");
    subjectPenalty += 10;
  }
  if (trimmedSubject.length > 85) {
    suggestions.push("Subject line is too long (>85 chars). Keep it between 30 and 60 characters for best engagement.");
    subjectPenalty += 5;
  } else if (trimmedSubject.length < 5 && trimmedSubject.length > 0) {
    suggestions.push("Subject line is very short (<5 chars). Mailbox filters may treat it as suspicious.");
    subjectPenalty += 5;
  }

  // 3. Link Inspection
  let hasRawIpLinks = false;
  let hasShortenedLinks = false;

  // Raw IP regex (e.g., http://192.168.1.1/ or http://104.28...)
  const rawIpMatch = htmlContent.match(/href=["']https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i);
  if (rawIpMatch) {
    hasRawIpLinks = true;
    suggestions.push("Remove links with raw IP addresses (e.g. http://192.168.x.x). Mailbox providers flag this as phishing.");
    linkPenalty += 25;
  }

  // Blacklisted link shorteners
  for (const shortener of BLACKLISTED_SHORTENERS) {
    if (htmlContent.toLowerCase().includes(shortener)) {
      hasShortenedLinks = true;
      suggestions.push(`Avoid using URL shortener "${shortener}". Spam filters penalize shorteners because they hide destination domains.`);
      linkPenalty += 15;
      break;
    }
  }

  // 4. HTML to Text Ratio
  const plainText = generatePlainTextFromHtml(htmlContent);
  const textLen = plainText.length;
  const htmlLen = htmlContent.length;

  if (htmlLen > 300 && textLen < 50) {
    suggestions.push("Very low text-to-HTML ratio. Add meaningful written text content alongside images and styling.");
    ratioPenalty += 15;
  }

  // 5. Unsubscribe Link Check
  const hasUnsubscribeLink =
    combinedText.includes("unsubscribe") ||
    combinedText.includes("opt-out") ||
    combinedText.includes("manage preferences");

  if (!hasUnsubscribeLink && textLen > 200) {
    suggestions.push("Include a clear unsubscribe link in the footer. Google and Yahoo mandate easy opt-outs for bulk senders.");
  }

  // Final score calculation
  const totalDeductions = keywordPenalty + subjectPenalty + linkPenalty + ratioPenalty;
  const score = Math.max(0, Math.min(100, 100 - totalDeductions));

  return {
    score,
    isSpamLikely: score < 65,
    detectedTriggers,
    suggestions,
    details: {
      keywordPenalty,
      subjectPenalty,
      linkPenalty,
      ratioPenalty,
      hasUnsubscribeLink,
      hasRawIpLinks,
      hasShortenedLinks,
      textLength: textLen,
      htmlLength: htmlLen,
    },
  };
}
