import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { code, orderAmount } = await request.json();
    const [coupon] = await db.select().from(coupons).where(
      and(eq(coupons.code, code.toUpperCase()), eq(coupons.isActive, true))
    );

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "الكوبون غير صالح" });
    }

    if (coupon.maxUses && (coupon.usedCount || 0) >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "تم استنفاذ الكوبون" });
    }

    if (coupon.startDate && new Date(coupon.startDate) > new Date()) {
      return NextResponse.json({ valid: false, error: "الكوبون لم يبدأ بعد" });
    }

    if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
      return NextResponse.json({ valid: false, error: "انتهت صلاحية الكوبون" });
    }

    if (coupon.minOrderAmount && orderAmount < parseFloat(coupon.minOrderAmount)) {
      return NextResponse.json({ valid: false, error: `الحد الأدنى للطلب: ${coupon.minOrderAmount}` });
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (orderAmount * parseFloat(coupon.value)) / 100;
    } else {
      discount = parseFloat(coupon.value);
    }

    return NextResponse.json({
      valid: true,
      discount,
      type: coupon.type,
      value: coupon.value,
      code: coupon.code,
    });
  } catch (error) {
    return NextResponse.json({ valid: false, error: "خطأ في التحقق" }, { status: 500 });
  }
}
