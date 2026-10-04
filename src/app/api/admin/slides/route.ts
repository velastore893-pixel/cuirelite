import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { heroSlides } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slides = await db.select().from(heroSlides).orderBy(heroSlides.order);
    return NextResponse.json({ slides });
  } catch (error) {
    console.error("Failed to fetch slides:", error);
    return NextResponse.json({ slides: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const [slide] = await db
      .insert(heroSlides)
      .values({
        title: body.title || null,
        titleAr: body.titleAr || null,
        subtitle: body.subtitle || null,
        subtitleAr: body.subtitleAr || null,
        image: body.image || null,
        link: body.link || null,
        isActive: body.isActive !== false,
        order: body.order || 0,
      })
      .returning();

    return NextResponse.json({ success: true, slide });
  } catch (error) {
    console.error("Failed to create slide:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...rawData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Slide ID is required" },
        { status: 400 }
      );
    }

    const updateObj: {
      title?: string | null;
      titleAr?: string | null;
      subtitle?: string | null;
      subtitleAr?: string | null;
      image?: string | null;
      link?: string | null;
      isActive?: boolean;
      order?: number;
    } = {};

    if (rawData.title !== undefined) updateObj.title = rawData.title || null;
    if (rawData.titleAr !== undefined) updateObj.titleAr = rawData.titleAr || null;
    if (rawData.subtitle !== undefined) updateObj.subtitle = rawData.subtitle || null;
    if (rawData.subtitleAr !== undefined) updateObj.subtitleAr = rawData.subtitleAr || null;
    if (rawData.image !== undefined) updateObj.image = rawData.image || null;
    if (rawData.link !== undefined) updateObj.link = rawData.link || null;
    if (rawData.isActive !== undefined) updateObj.isActive = rawData.isActive === true || rawData.isActive === "true";
    if (rawData.order !== undefined) updateObj.order = Number(rawData.order) || 0;

    const [updated] = await db
      .update(heroSlides)
      .set(updateObj)
      .where(eq(heroSlides.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, slide: updated });
  } catch (error) {
    console.error("Failed to update slide:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Slide ID is required" },
        { status: 400 }
      );
    }

    await db.delete(heroSlides).where(eq(heroSlides.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete slide:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
