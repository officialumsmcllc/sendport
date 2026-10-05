export interface ManualPaymentChannel {
  id: string;
  name: string;
  badge: string;
  instructions: {
    accountTitle: string;
    accountNumber: string;
    bankOrNetwork: string;
    ibanOrAddress?: string;
    swiftCode?: string;
    extraNote?: string;
  };
}

export const MANUAL_PAYMENT_METHODS: ManualPaymentChannel[] = [
  {
    id: "BANK_TRANSFER",
    name: "Direct Bank Wire / SWIFT (Global & Local)",
    badge: "Instant Approval",
    instructions: {
      accountTitle: "Sendport Technologies",
      accountNumber: "01082910283019",
      bankOrNetwork: "Meezan Bank Ltd / Standard Chartered",
      ibanOrAddress: "PK64MEZN0001082910283019",
      swiftCode: "MEZNPKKA",
      extraNote: "Transfer from any banking app globally and enter your Transaction Reference / Reference ID.",
    },
  },
  {
    id: "EASYPAISA",
    name: "Easypaisa (Mobile Wallet)",
    badge: "Zero Fee",
    instructions: {
      accountTitle: "Sendport Enterprise",
      accountNumber: "0312-3456789",
      bankOrNetwork: "Easypaisa / Telenor Microfinance",
      extraNote: "Send payment and upload screenshot of the receipt or enter the 11-digit TRX ID.",
    },
  },
  {
    id: "JAZZCASH",
    name: "JazzCash / Raast Instant",
    badge: "24/7 Instant",
    instructions: {
      accountTitle: "Sendport Enterprise",
      accountNumber: "0300-1234567",
      bankOrNetwork: "JazzCash / Raast ID: 03001234567",
      extraNote: "Raast instant transfers are settled immediately with zero interbank charges.",
    },
  },
  {
    id: "CRYPTO_USDT",
    name: "Crypto USDT (TRC-20 / BEP-20)",
    badge: "Worldwide",
    instructions: {
      accountTitle: "Sendport Web3 Treasury",
      accountNumber: "TX8sK9LmQ2vBwN7Z4rP1yH5cXaJ3uE6dF",
      bankOrNetwork: "USDT (Tether) on TRON (TRC20) or Binance Smart Chain (BEP20)",
      ibanOrAddress: "TX8sK9LmQ2vBwN7Z4rP1yH5cXaJ3uE6dF",
      extraNote: "Submit your Blockchain Transaction Hash (TxHash). Verified automatically.",
    },
  },
  {
    id: "WISE_PAYONEER",
    name: "Wise & Payoneer Transfer",
    badge: "International Devs",
    instructions: {
      accountTitle: "Sendport Global LLC",
      accountNumber: "billing@getsendport.com",
      bankOrNetwork: "Wise / Payoneer Direct Email Transfer",
      extraNote: "Direct Wise/Payoneer transfer in USD, EUR, or GBP.",
    },
  },
];
