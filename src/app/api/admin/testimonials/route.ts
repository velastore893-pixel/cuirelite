import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allTestimonials = await db.select().from(testimonials).orderBy(testimonials.sortOrder);
    return NextResponse.json({ testimonials: allTestimonials });
  } catch (error) {
    return NextResponse.json({ testimonials: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [testimonial] = await db.insert(testimonials).values({
      customerName: body.customerName,
      customerCity: body.customerCity || null,
      rating: body.rating || 5,
      text: body.text,
      isActive: body.isActive !== false,
      sortOrder: body.sortOrder || 0,
    }).returning();
    return NextResponse.json({ success: true, testimonial });
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
    if (rawData.customerName !== undefined) updateObj.customerName = rawData.customerName;
    if (rawData.customerCity !== undefined) updateObj.customerCity = rawData.customerCity;
    if (rawData.rating !== undefined) updateObj.rating = Number(rawData.rating);
    if (rawData.text !== undefined) updateObj.text = rawData.text;
    if (rawData.isActive !== undefined) updateObj.isActive = rawData.isActive;
    if (rawData.sortOrder !== undefined) updateObj.sortOrder = Number(rawData.sortOrder);

    const [updated] = await db.update(testimonials).set(updateObj).where(eq(testimonials.id, Number(id))).returning();
    return NextResponse.json({ success: true, testimonial: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    await db.delete(testimonials).where(eq(testimonials.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
