import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allPages = await db.select().from(pages);
    return NextResponse.json({ pages: allPages });
  } catch (error) {
    return NextResponse.json({ pages: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [page] = await db.insert(pages).values({
      title: body.title,
      titleAr: body.titleAr || null,
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, "-"),
      content: body.content || null,
      contentAr: body.contentAr || null,
      metaDescription: body.metaDescription || null,
      isActive: body.isActive !== false,
    }).returning();
    return NextResponse.json({ success: true, page });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rawData } = body;
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    const updateObj: Record<string, unknown> = { updatedAt: new Date() };
    for (const [key, val] of Object.entries(rawData)) {
      if (val !== undefined) updateObj[key] = val;
    }
    const [updated] = await db.update(pages).set(updateObj).where(eq(pages.id, Number(id))).returning();
    return NextResponse.json({ success: true, page: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    await db.delete(pages).where(eq(pages.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
