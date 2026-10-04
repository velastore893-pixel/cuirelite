import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allProducts = await db.select().from(products);
    return NextResponse.json({ products: allProducts });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const slug =
      body.slug || body.name.toLowerCase().replace(/\s+/g, "-");

    const [product] = await db
      .insert(products)
      .values({
        name: body.name,
        nameAr: body.nameAr || null,
        slug,
        description: body.description || null,
        descriptionAr: body.descriptionAr || null,
        price: String(body.price),
        comparePrice: body.comparePrice ? String(body.comparePrice) : null,
        categoryId: body.categoryId ? Number(body.categoryId) : null,
        images: body.images || [],
        sizes: body.sizes || [],
        colors: body.colors || [],
        stock: Number(body.stock) || 0,
        isActive: body.isActive !== false && body.isActive !== "false",
        isFeatured: body.isFeatured === true || body.isFeatured === "true",
        isNewArrival: body.isNewArrival === true || body.isNewArrival === "true",
        material: body.material || null,
        materialAr: body.materialAr || null,
      })
      .returning();

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Failed to create product:", error);
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
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Build update object with proper types
    const updateObj: {
      name?: string;
      nameAr?: string | null;
      slug?: string;
      description?: string | null;
      descriptionAr?: string | null;
      price?: string;
      comparePrice?: string | null;
      categoryId?: number | null;
      images?: string[];
      sizes?: string[];
      colors?: { name: string; hex: string }[];
      stock?: number;
      isActive?: boolean;
      isFeatured?: boolean;
      isNewArrival?: boolean;
      material?: string | null;
      materialAr?: string | null;
      updatedAt?: Date;
    } = {
      updatedAt: new Date(),
    };

    if (rawData.name !== undefined) updateObj.name = rawData.name;
    if (rawData.nameAr !== undefined) updateObj.nameAr = rawData.nameAr || null;
    if (rawData.slug !== undefined) updateObj.slug = rawData.slug;
    if (rawData.description !== undefined) updateObj.description = rawData.description || null;
    if (rawData.descriptionAr !== undefined) updateObj.descriptionAr = rawData.descriptionAr || null;
    if (rawData.price !== undefined) updateObj.price = String(rawData.price);
    if (rawData.comparePrice !== undefined) updateObj.comparePrice = rawData.comparePrice ? String(rawData.comparePrice) : null;
    if (rawData.categoryId !== undefined) updateObj.categoryId = rawData.categoryId ? Number(rawData.categoryId) : null;
    if (rawData.images !== undefined) updateObj.images = rawData.images;
    if (rawData.sizes !== undefined) updateObj.sizes = rawData.sizes;
    if (rawData.colors !== undefined) updateObj.colors = rawData.colors;
    if (rawData.stock !== undefined) updateObj.stock = Number(rawData.stock) || 0;
    if (rawData.isActive !== undefined) updateObj.isActive = rawData.isActive === true || rawData.isActive === "true";
    if (rawData.isFeatured !== undefined) updateObj.isFeatured = rawData.isFeatured === true || rawData.isFeatured === "true";
    if (rawData.isNewArrival !== undefined) updateObj.isNewArrival = rawData.isNewArrival === true || rawData.isNewArrival === "true";
    if (rawData.material !== undefined) updateObj.material = rawData.material || null;
    if (rawData.materialAr !== undefined) updateObj.materialAr = rawData.materialAr || null;

    const [updated] = await db
      .update(products)
      .set(updateObj)
      .where(eq(products.id, Number(id)))
      .returning();

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Failed to update product:", error);
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
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    await db.delete(products).where(eq(products.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
