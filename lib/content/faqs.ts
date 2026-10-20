export interface FaqItem {
  q: string;
  a: string;
}

export const HOMEPAGE_FAQS: FaqItem[] = [
  {
    q: "How does Sendport optimize for high Primary Inbox delivery?",
    a: "Sendport automatically enforces 2048-bit RSA DKIM signing, SPF and DMARC alignment, and reverse DNS records on clean static IPs with sub-10ms API dispatch queues.",
  },
  {
    q: "Can I use Sendport with WordPress, WooCommerce, and Laravel?",
    a: "Yes! In addition to REST API, Sendport provides instant SMTP relay credentials (Host: smtp.getsendport.com, Port: 587/465) that connect with any WordPress SMTP plugin or backend framework.",
  },
  {
    q: "Can I write email templates using React and Tailwind?",
    a: "Absolutely. Sendport provides first-class support for React Email (@react-email/components). You can build type-safe, reusable email components and preview them live in your browser.",
  },
  {
    q: "What payment methods are supported for international and regional clients?",
    a: "We support global Credit/Debit Cards via Stripe, PayPal, Wise, Payoneer, direct Bank Wire (IBAN/SWIFT), regional mobile wallets (Easypaisa, JazzCash, Raast), and Crypto USDT (TRC-20 / BEP-20) with instant receipt verification.",
  },
  {
    q: "Is there a free tier for developers?",
    a: "Yes! Our Starter plan is 100% Free Forever, giving you 100 emails/day (3,000/month), 1 verified custom domain, 2048-bit DKIM signing, live open/click tracking, and full REST API access.",
  },
];
