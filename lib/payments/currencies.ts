export type SupportedCurrency = "USD" | "EUR" | "GBP" | "AED" | "SAR" | "PKR";

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  rateAgainstUSD: number; // For dynamic conversion
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", rateAgainstUSD: 1.0 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rateAgainstUSD: 0.92 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rateAgainstUSD: 0.79 },
  AED: { code: "AED", symbol: "AED", name: "UAE Dirham", rateAgainstUSD: 3.67 },
  SAR: { code: "SAR", symbol: "SAR", name: "Saudi Riyal", rateAgainstUSD: 3.75 },
  PKR: { code: "PKR", symbol: "Rs", name: "Pakistani Rupee", rateAgainstUSD: 280.0 },
};

export function formatPrice(amountInUSD: number, currency: SupportedCurrency = "USD"): string {
  const curr = CURRENCIES[currency] || CURRENCIES.USD;
  const converted = Math.round(amountInUSD * curr.rateAgainstUSD);
  if (converted === 0) return "Free";
  return `${curr.symbol} ${converted.toLocaleString()}`;
}
