import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allCategories = await db.select().from(categories);
    return NextResponse.json({ categories: allCategories });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, "-");

    const [category] = await db
      .insert(categories)
      .values({
        name: body.name,
        nameAr: body.nameAr || null,
        slug,
        description: body.description || null,
        image: body.image || null,
        isActive: body.isActive !== false && body.isActive !== "false",
      })
      .returning();

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("Failed to create category:", error);
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
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    const updateObj: {
      name?: string;
      nameAr?: string | null;
      slug?: string;
      description?: string | null;
      image?: string | null;
      isActive?: boolean;
    } = {};

    if (rawData.name !== undefined) updateObj.name = rawData.name;
    if (rawData.nameAr !== undefined) updateObj.nameAr = rawData.nameAr || null;
    if (rawData.slug !== undefined) updateObj.slug = rawData.slug;
    if (rawData.description !== undefined) updateObj.description = rawData.description || null;
    if (rawData.image !== undefined) updateObj.image = rawData.image || null;
    if (rawData.isActive !== undefined) updateObj.isActive = rawData.isActive === true || rawData.isActive === "true";

    const [updated] = await db
      .update(categories)
      .set(updateObj)
      .where(eq(categories.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error("Failed to update category:", error);
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
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    await db.delete(categories).where(eq(categories.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
