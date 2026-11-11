// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

export interface DnsVerificationResult {
  domain: string;
  isDkimValid: boolean;
  isSpfValid: boolean;
  isDmarcValid: boolean;
  isMxValid: boolean;
  allValid: boolean;
  multipleSpfDetected?: boolean;
  spfWarning?: string;
  suggestedMergedSpf?: string;
  multipleDmarcDetected?: boolean;
  dmarcWarning?: string;
  suggestedMergedDmarc?: string;
  recordsFound: {
    dkim?: string[];
    spf?: string[];
    dmarc?: string[];
    mx?: string[];
  };
  errors?: string[];
}

export interface DnsDiagnosticReport {
  domain: string;
  dnsProvider: { name: string; icon: string };
  healthScore: number;
  healthStatus: "EXCELLENT" | "CRITICAL_CONFLICT" | "ACTION_REQUIRED";
  hasFatalConflict: boolean;
  rootTxtRecords: string[];
  spf: {
    status: "PASS" | "CONFLICT_MULTIPLE" | "MISSING" | "UNAUTHORIZED";
    recordsFound: string[];
    multipleDetected: boolean;
    authorized: boolean;
    suggestedMergedRecord: string;
    warningMessage?: string;
    stepByStepFix: string[];
  };
  dkim: {
    status: "PASS" | "MISSING" | "MISMATCH";
    selector: string;
    hostname: string;
    recordsFound: string[];
    publicKeyMatches: boolean;
    warningMessage?: string;
    stepByStepFix: string[];
  };
  dmarc: {
    status: "PASS" | "CONFLICT_MULTIPLE" | "MISSING";
    hostname: string;
    recordsFound: string[];
    multipleDetected: boolean;
    policy: string;
    suggestedMergedRecord: string;
    warningMessage?: string;
    stepByStepFix: string[];
  };
  mx: {
    status: "CONFIGURED" | "OPTIONAL_PENDING";
    recordsFound: string[];
  };
  summary: string;
}

