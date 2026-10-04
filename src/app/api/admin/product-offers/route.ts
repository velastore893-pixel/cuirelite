import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productOffers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    let query = db.select().from(productOffers).orderBy(productOffers.sortOrder);
    if (productId) {
      query = db.select().from(productOffers).where(eq(productOffers.productId, Number(productId))).orderBy(productOffers.sortOrder) as any;
    }

    const offers = await query;
    return NextResponse.json({ offers });
  } catch (error) {
    return NextResponse.json({ offers: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [offer] = await db.insert(productOffers).values({
      productId: body.productId,
      name: body.name,
      nameAr: body.nameAr || null,
      quantity: Number(body.quantity),
      price: String(body.price),
      originalPrice: body.originalPrice ? String(body.originalPrice) : null,
      promoText: body.promoText || null,
      promoTextAr: body.promoTextAr || null,
      isActive: body.isActive !== false,
      isDefault: body.isDefault || false,
      sortOrder: body.sortOrder || 0,
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

    const updateObj: Record<string, unknown> = {};
    if (rawData.name !== undefined) updateObj.name = rawData.name;
    if (rawData.nameAr !== undefined) updateObj.nameAr = rawData.nameAr;
    if (rawData.quantity !== undefined) updateObj.quantity = Number(rawData.quantity);
    if (rawData.price !== undefined) updateObj.price = String(rawData.price);
    if (rawData.originalPrice !== undefined) updateObj.originalPrice = rawData.originalPrice ? String(rawData.originalPrice) : null;
    if (rawData.promoText !== undefined) updateObj.promoText = rawData.promoText;
    if (rawData.promoTextAr !== undefined) updateObj.promoTextAr = rawData.promoTextAr;
    if (rawData.isActive !== undefined) updateObj.isActive = rawData.isActive;
    if (rawData.isDefault !== undefined) updateObj.isDefault = rawData.isDefault;
    if (rawData.sortOrder !== undefined) updateObj.sortOrder = Number(rawData.sortOrder);

    // If this offer is set as default, unset others for same product
    if (rawData.isDefault === true && rawData.productId) {
      await db.update(productOffers).set({ isDefault: false }).where(eq(productOffers.productId, rawData.productId));
    }

    const [updated] = await db.update(productOffers).set(updateObj).where(eq(productOffers.id, Number(id))).returning();
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
    await db.delete(productOffers).where(eq(productOffers.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
