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
  "income from home", "increase sales", "instant", "investment", "join millions",
  "limited time", "make money", "millionaire", "miracle", "money back", "multi-level",
  "no catch", "no cost", "no credit check", "no experience", "no fees", "no gimmicks",
  "no hidden costs", "no obligation", "no purchase necessary", "no risk", "no strings attached",
  "not spam", "obligation", "offer", "once in a lifetime", "one time", "online marketing",
  "open immediately", "opportunity", "order now", "passwords", "pennies a day", "potential earnings",
  "prize", "promise", "pure profit", "quote", "refund", "risk free", "save big", "save money",
  "score", "special promotion", "terms and conditions", "this isn't spam", "time limited",
  "unlimited", "urgent", "valuable", "viagra", "vicodin", "warranty", "while supplies last",
  "win", "winner", "winning", "work from home", "you have been selected"
];

export interface SpamCheckResult {
  score: number; // 0 to 100 (100 is cleanest, 0 is severe spam)
  isSpamLikely: boolean;
  detectedTriggers: string[];
  suggestions: string[];
}

export function analyzeEmailDeliverability(subject: string, htmlContent: string): SpamCheckResult {
  const combinedText = `${subject} ${htmlContent}`.toLowerCase();
  const detectedTriggers: string[] = [];

  for (const phrase of SPAM_TRIGGER_WORDS) {
    if (combinedText.includes(phrase)) {
      detectedTriggers.push(phrase);
    }
  }

  // Subject line checks
  const suggestions: string[] = [];
  if (subject === subject.toUpperCase() && subject.length > 5) {
    suggestions.push("Avoid using ALL CAPS in the subject line.");
  }
  if ((subject.match(/!/g) || []).length > 1) {
    suggestions.push("Avoid multiple exclamation marks in the subject.");
  }
  if (subject.includes("$") || subject.includes("€") || subject.includes("£")) {
    suggestions.push("Avoid currency symbols in the subject line.");
  }

  // Calculate score (start at 100, deduct per violation)
  let score = 100 - (detectedTriggers.length * 8) - (suggestions.length * 10);
  if (score < 0) score = 0;

  return {
    score,
    isSpamLikely: score < 60,
    detectedTriggers,
    suggestions,
  };
}
