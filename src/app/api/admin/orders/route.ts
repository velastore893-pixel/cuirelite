import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allOrders = await db.select().from(orders);
    return NextResponse.json({ orders: allOrders });
  } catch (error) {
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rawData } = body;
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    const updateObj: Record<string, unknown> = { updatedAt: new Date() };
    if (rawData.status !== undefined) updateObj.status = rawData.status;
    if (rawData.internalNotes !== undefined) updateObj.internalNotes = rawData.internalNotes;
    if (rawData.customerName !== undefined) updateObj.customerName = rawData.customerName;
    if (rawData.customerPhone !== undefined) updateObj.customerPhone = rawData.customerPhone;
    if (rawData.shippingAddress !== undefined) updateObj.shippingAddress = rawData.shippingAddress;
    if (rawData.city !== undefined) updateObj.city = rawData.city;

    const [updated] = await db.update(orders).set(updateObj).where(eq(orders.id, Number(id))).returning();
    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    await db.delete(orders).where(eq(orders.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
