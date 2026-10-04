import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allCoupons = await db.select().from(coupons);
    return NextResponse.json({ coupons: allCoupons });
  } catch (error) {
    return NextResponse.json({ coupons: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [coupon] = await db.insert(coupons).values({
      code: body.code.toUpperCase(),
      type: body.type,
      value: String(body.value),
      minOrderAmount: body.minOrderAmount ? String(body.minOrderAmount) : null,
      maxUses: body.maxUses || null,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      isActive: body.isActive !== false,
    }).returning();
    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rawData } = body;
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    const updateObj: Record<string, unknown> = {};
    if (rawData.code !== undefined) updateObj.code = rawData.code.toUpperCase();
    if (rawData.type !== undefined) updateObj.type = rawData.type;
    if (rawData.value !== undefined) updateObj.value = String(rawData.value);
    if (rawData.minOrderAmount !== undefined) updateObj.minOrderAmount = rawData.minOrderAmount ? String(rawData.minOrderAmount) : null;
    if (rawData.maxUses !== undefined) updateObj.maxUses = rawData.maxUses;
    if (rawData.isActive !== undefined) updateObj.isActive = rawData.isActive;
    const [updated] = await db.update(coupons).set(updateObj).where(eq(coupons.id, Number(id))).returning();
    return NextResponse.json({ success: true, coupon: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    await db.delete(coupons).where(eq(coupons.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
