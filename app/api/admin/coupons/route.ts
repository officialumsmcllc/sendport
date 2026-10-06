import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { logSecurityAudit } from "@/lib/security/audit";

// In-memory persistent coupon registry
let coupons = [
  {
    id: "cp_1",
    code: "LAUNCH50",
    discountPercent: 50,
    planRestriction: "ALL",
    maxUses: 100,
    usedCount: 14,
    isActive: true,
    expiresAt: "2026-12-31",
    createdBy: "admin@getsendport.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cp_2",
    code: "RAMADAN30",
    discountPercent: 30,
    planRestriction: "GROWTH",
    maxUses: 50,
    usedCount: 8,
    isActive: true,
    expiresAt: "2026-06-30",
    createdBy: "admin@getsendport.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cp_3",
    code: "SCALEPROVIP",
    discountPercent: 20,
    planRestriction: "SCALE_PRO",
    maxUses: 20,
    usedCount: 5,
    isActive: true,
    expiresAt: "2027-01-01",
    createdBy: "admin@getsendport.com",
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { code, discountPercent, planRestriction, maxUses, expiresAt } = body;

    if (!code || !discountPercent) {
      return NextResponse.json({ error: "Code and discount percentage are required." }, { status: 400 });
    }

    const newCoupon = {
      id: "cp_" + Math.random().toString(36).substring(2, 9),
      code: code.trim().toUpperCase(),
      discountPercent: Number(discountPercent),
      planRestriction: planRestriction || "ALL",
      maxUses: Number(maxUses) || 100,
      usedCount: 0,
      isActive: true,
      expiresAt: expiresAt || "2026-12-31",
      createdBy: session.email,
      createdAt: new Date().toISOString(),
    };

    coupons.unshift(newCoupon);

    logSecurityAudit("COUPON_CREATED", session.userId, { code: newCoupon.code, discount: newCoupon.discountPercent });

    return NextResponse.json({
      success: true,
      message: `Coupon code ${newCoupon.code} created successfully!`,
      coupon: newCoupon,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, isActive } = body;

    const coupon = coupons.find((c) => c.id === id);
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    coupon.isActive = isActive;

    return NextResponse.json({
      success: true,
      message: `Coupon ${coupon.code} updated.`,
      coupon,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    coupons = coupons.filter((c) => c.id !== id);

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
