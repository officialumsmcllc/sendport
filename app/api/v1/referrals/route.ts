import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

async function ensureReferralTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ReferralReward" (
        "id" TEXT NOT NULL,
        "referrerId" TEXT NOT NULL,
        "referredEmail" TEXT,
        "code" TEXT NOT NULL,
        "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
        "amountEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "currency" TEXT NOT NULL DEFAULT 'USD',
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "payoutMethod" TEXT,
        "payoutAccount" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ReferralReward_pkey" PRIMARY KEY ("id")
      );
    `);
  } catch (e) {
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ReferralReward" (
          id TEXT PRIMARY KEY,
          referrerId TEXT,
          referredEmail TEXT,
          code TEXT,
          commissionRate REAL DEFAULT 0.20,
          amountEarned REAL DEFAULT 0,
          currency TEXT DEFAULT 'USD',
          status TEXT DEFAULT 'PENDING',
          payoutMethod TEXT,
          payoutAccount TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (e2) {}
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureReferralTable();

    // User's referral code is derived deterministically or stored
    const userId = auth.user.id;
    const cleanId = userId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
    const referralCode = `PORT-${cleanId}`;

    const rewards = await prisma.referralReward.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: "desc" },
    });

    const totalReferrals = rewards.length;
    const totalEarned = rewards.reduce((sum, r) => sum + (r.amountEarned || 0), 0);
    const unpaidBalance = rewards
      .filter((r) => r.status === "PENDING")
      .reduce((sum, r) => sum + (r.amountEarned || 0), 0);
    const paidOut = rewards
      .filter((r) => r.status === "PAID")
      .reduce((sum, r) => sum + (r.amountEarned || 0), 0);
    const payingCustomers = rewards.filter((r) => (r.amountEarned || 0) > 0).length;

    const origin = req.nextUrl.origin || "https://getsendport.com";
    const referralLink = `${origin}?ref=${referralCode}`;

    return NextResponse.json({
      referralCode,
      referralLink,
      commissionRate: "20% Lifetime Recurring",
      stats: {
        totalReferrals,
        payingCustomers,
        totalEarned: Number(totalEarned.toFixed(2)),
        unpaidBalance: Number(unpaidBalance.toFixed(2)),
        paidOut: Number(paidOut.toFixed(2)),
      },
      rewards,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureReferralTable();

    const body = await req.json();
    const { action, payoutMethod, payoutAccount, amount } = body;

    if (action === "REQUEST_PAYOUT") {
      if (!payoutMethod || !payoutAccount) {
        return NextResponse.json(
          { error: "Payout method and account details are required." },
          { status: 422 }
        );
      }

      // Check current unpaid rewards
      const pendingRewards = await prisma.referralReward.findMany({
        where: {
          referrerId: auth.user.id,
          status: "PENDING",
        },
      });

      const totalPending = pendingRewards.reduce((sum, r) => sum + (r.amountEarned || 0), 0);
      const requestedAmt = amount ? parseFloat(amount) : totalPending;

      if (totalPending <= 0 && (!amount || requestedAmt <= 0)) {
        return NextResponse.json(
          { error: "Minimum payout threshold is $10.00 and you currently have $0.00 unpaid balance." },
          { status: 400 }
        );
      }

      // Record a payout audit log so admin can review and disburse
      await prisma.auditLog.create({
        data: {
          userId: auth.user.id,
          action: "AFFILIATE_PAYOUT_REQUESTED",
          details: JSON.stringify({
            payoutMethod,
            payoutAccount,
            amount: requestedAmt,
            requestedAt: new Date().toISOString(),
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Payout request for $${requestedAmt.toFixed(2)} via ${payoutMethod} submitted successfully! Our finance team reviews and transfers within 24 hours.`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
