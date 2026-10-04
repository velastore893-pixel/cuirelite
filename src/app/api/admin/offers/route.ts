import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { offers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allOffers = await db.select().from(offers).orderBy(offers.sortOrder);
    return NextResponse.json({ offers: allOffers });
  } catch (error) {
    return NextResponse.json({ offers: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If this is set as default, unset all other defaults
    if (body.isDefault) {
      await db.update(offers).set({ isDefault: false });
    }

    const [offer] = await db.insert(offers).values({
      name: body.name,
      nameAr: body.nameAr || null,
      quantity: Number(body.quantity) || 1,
      price: String(body.price),
      originalPrice: body.originalPrice ? String(body.originalPrice) : null,
      badge: body.badge || null,
      badgeAr: body.badgeAr || null,
      isActive: body.isActive !== false,
      isDefault: body.isDefault || false,
      sortOrder: Number(body.sortOrder) || 0,
    }).returning();
    return NextResponse.json({ success: true, offer });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rawData } = body;
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    // If this is set as default, unset all other defaults
    if (rawData.isDefault === true) {
      await db.update(offers).set({ isDefault: false }).where(eq(offers.isDefault, true));
    }

    const updateObj: Record<string, unknown> = { updatedAt: new Date() };
    if (rawData.name !== undefined) updateObj.name = rawData.name;
    if (rawData.nameAr !== undefined) updateObj.nameAr = rawData.nameAr;
    if (rawData.quantity !== undefined) updateObj.quantity = Number(rawData.quantity);
    if (rawData.price !== undefined) updateObj.price = String(rawData.price);
    if (rawData.originalPrice !== undefined) updateObj.originalPrice = rawData.originalPrice ? String(rawData.originalPrice) : null;
    if (rawData.badge !== undefined) updateObj.badge = rawData.badge;
    if (rawData.badgeAr !== undefined) updateObj.badgeAr = rawData.badgeAr;
    if (rawData.isActive !== undefined) updateObj.isActive = rawData.isActive;
    if (rawData.isDefault !== undefined) updateObj.isDefault = rawData.isDefault;
    if (rawData.sortOrder !== undefined) updateObj.sortOrder = Number(rawData.sortOrder);

    const [updated] = await db.update(offers).set(updateObj).where(eq(offers.id, Number(id))).returning();
    return NextResponse.json({ success: true, offer: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    await db.delete(offers).where(eq(offers.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
