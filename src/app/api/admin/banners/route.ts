import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allBanners = await db.select().from(banners).orderBy(banners.order);
    return NextResponse.json({ banners: allBanners });
  } catch (error) {
    return NextResponse.json({ banners: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [banner] = await db.insert(banners).values({
      title: body.title || null,
      titleAr: body.titleAr || null,
      subtitle: body.subtitle || null,
      subtitleAr: body.subtitleAr || null,
      image: body.image || null,
      buttonText: body.buttonText || null,
      buttonTextAr: body.buttonTextAr || null,
      link: body.link || null,
      position: body.position || "homepage",
      isActive: body.isActive !== false,
      order: body.order || 0,
    }).returning();
    return NextResponse.json({ success: true, banner });
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
    for (const [key, val] of Object.entries(rawData)) {
      if (val !== undefined) updateObj[key] = val;
    }
    const [updated] = await db.update(banners).set(updateObj).where(eq(banners.id, Number(id))).returning();
    return NextResponse.json({ success: true, banner: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    await db.delete(banners).where(eq(banners.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
