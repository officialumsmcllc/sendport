/**
 * Automated Domain & IP Warmup Engine
 * Protects domain sender reputation and prevents sudden traffic spikes that trigger mailbox spam quarantines.
 */

export interface WarmupScheduleStep {
  day: number;
  dailyLimit: number;
  phase: "SEED" | "RAMP_UP" | "STABILIZATION" | "FULL_SCALE";
  recommendation: string;
}

export const WARMUP_30_DAY_CURVE: WarmupScheduleStep[] = [
  { day: 1, dailyLimit: 50, phase: "SEED", recommendation: "Send only to high-engagement internal test addresses or verified opted-in users." },
  { day: 2, dailyLimit: 100, phase: "SEED", recommendation: "Maintain low volume to establish consistent SPF/DKIM validation history." },
  { day: 3, dailyLimit: 175, phase: "SEED", recommendation: "Check open and bounce rates in live delivery logs." },
  { day: 4, dailyLimit: 300, phase: "RAMP_UP", recommendation: "Gradually introduce transactional notifications and sign-up confirmations." },
  { day: 5, dailyLimit: 500, phase: "RAMP_UP", recommendation: "Keep spam complaint rate strictly under 0.10%." },
  { day: 6, dailyLimit: 800, phase: "RAMP_UP", recommendation: "Monitor Gmail Postmaster Tools / Yahoo feedback loops." },
  { day: 7, dailyLimit: 1200, phase: "RAMP_UP", recommendation: "End of Week 1: Mailbox providers register domain reputation." },
  { day: 10, dailyLimit: 2500, phase: "STABILIZATION", recommendation: "Clean bounce lists immediately to avoid reputation degradation." },
  { day: 14, dailyLimit: 5000, phase: "STABILIZATION", recommendation: "Midway checkpoint: Stable deliverability across Outlook and Gmail." },
  { day: 21, dailyLimit: 12000, phase: "STABILIZATION", recommendation: "Ready for large targeted audience segments." },
  { day: 30, dailyLimit: 25000, phase: "FULL_SCALE", recommendation: "Domain fully warmed. Unlimited scale within workspace plan limits." },
];

/**
 * Calculates domain warmup stats based on domain creation/verification date
 */
export function calculateDomainWarmupStatus(
  domainStartDate: Date,
  sentToday: number = 0
): {
  warmupDay: number;
  dailyLimit: number;
  remainingToday: number;
  progressPercent: number;
  currentPhase: string;
  recommendation: string;
  isWarmupCompleted: boolean;
} {
  const now = new Date();
  const start = new Date(domainStartDate);
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);

  if (diffDays >= 30) {
    return {
      warmupDay: 30,
      dailyLimit: 25000,
      remainingToday: Math.max(0, 25000 - sentToday),
      progressPercent: 100,
      currentPhase: "FULL_SCALE",
      recommendation: "Domain is fully warmed up and recognized by major mailbox providers.",
      isWarmupCompleted: true,
    };
  }

  // Find exact step or interpolate
  let activeStep = WARMUP_30_DAY_CURVE[0];
  for (const step of WARMUP_30_DAY_CURVE) {
    if (diffDays >= step.day) {
      activeStep = step;
    }
  }

  const remainingToday = Math.max(0, activeStep.dailyLimit - sentToday);
  const progressPercent = Math.min(100, Math.round((diffDays / 30) * 100));

  return {
    warmupDay: diffDays,
    dailyLimit: activeStep.dailyLimit,
    remainingToday,
    progressPercent,
    currentPhase: activeStep.phase,
    recommendation: activeStep.recommendation,
    isWarmupCompleted: false,
  };
}
