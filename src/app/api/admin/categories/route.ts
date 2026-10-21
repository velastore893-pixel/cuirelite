import { NextRequest, NextResponse } from "next/server";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getDb() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const { db } = await import("@/db");
  return db;
}

// ============================================
// GET ALL CATEGORIES
// ============================================

export async function GET() {
  try {
    const db = await getDb();

    if (!db) {
      return NextResponse.json({
        categories: [],
      });
    }

    const allCategories = await db
      .select()
      .from(categories);

    return NextResponse.json({
      categories: allCategories,
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================
// CREATE CATEGORY
// ============================================

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();

    if (!db) {
      return NextResponse.json(
        {
          success: false,
          error: "Database is not configured yet",
        },
        {
          status: 503,
        }
      );
    }

    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name is required",
        },
        {
          status: 400,
        }
      );
    }

    const slug =
      body.slug?.trim() ||
      body.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const parentId =
      body.parentId === null ||
      body.parentId === undefined ||
      body.parentId === ""
        ? null
        : Number(body.parentId);

    const sortOrder =
      body.sortOrder === null ||
      body.sortOrder === undefined ||
      body.sortOrder === ""
        ? 0
        : Number(body.sortOrder);

    // Validate parent category if provided
    if (parentId !== null) {
      if (!Number.isInteger(parentId)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid parent category",
          },
          {
            status: 400,
          }
        );
      }

      const [parentCategory] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, parentId));

      if (!parentCategory) {
        return NextResponse.json(
          {
            success: false,
            error: "Parent category not found",
          },
          {
            status: 404,
          }
        );
      }

      // Keep hierarchy simple:
      // Main Category -> Subcategory -> Products
      if (parentCategory.parentId !== null) {
        return NextResponse.json(
          {
            success: false,
            error:
              "A subcategory cannot contain another subcategory.",
          },
          {
            status: 400,
          }
        );
      }
    }

    const [category] = await db
      .insert(categories)
      .values({
        name: body.name.trim(),
        nameAr: body.nameAr?.trim() || null,
        slug,
        description:
          body.description?.trim() || null,
        image: body.image || null,

        parentId,

        sortOrder,

        isActive:
          body.isActive !== false &&
          body.isActive !== "false",
      })
      .returning();

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Failed to create category:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================
// UPDATE CATEGORY
// ============================================

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();

    if (!db) {
      return NextResponse.json(
        {
          success: false,
          error: "Database is not configured yet",
        },
        {
          status: 503,
        }
      );
    }

    const body = await request.json();
    const { id, ...rawData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const categoryId = Number(id);

    if (!Number.isInteger(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category ID",
        },
        {
          status: 400,
        }
      );
    }

    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId));

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        {
          status: 404,
        }
      );
    }

    const updateObj: {
      name?: string;
      nameAr?: string | null;
      slug?: string;
      description?: string | null;
      image?: string | null;

      parentId?: number | null;

      sortOrder?: number;

      isActive?: boolean;
    } = {};

    // Name
    if (rawData.name !== undefined) {
      const name = String(rawData.name).trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            error: "Category name cannot be empty",
          },
          {
            status: 400,
          }
        );
      }

      updateObj.name = name;
    }

    // Arabic name
    if (rawData.nameAr !== undefined) {
      updateObj.nameAr =
        rawData.nameAr?.trim() || null;
    }

    // Slug
    if (rawData.slug !== undefined) {
      const slug = String(rawData.slug).trim();

      if (!slug) {
        return NextResponse.json(
          {
            success: false,
            error: "Slug cannot be empty",
          },
          {
            status: 400,
          }
        );
      }

      updateObj.slug = slug;
    }

    // Description
    if (rawData.description !== undefined) {
      updateObj.description =
        rawData.description?.trim() || null;
    }

    // Image
    if (rawData.image !== undefined) {
      updateObj.image =
        rawData.image || null;
    }

    // Sort Order
    if (rawData.sortOrder !== undefined) {
      const sortOrder = Number(
        rawData.sortOrder || 0
      );

      if (!Number.isFinite(sortOrder)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid sort order",
          },
          {
            status: 400,
          }
        );
      }

      updateObj.sortOrder = sortOrder;
    }

    // Active
    if (rawData.isActive !== undefined) {
      updateObj.isActive =
        rawData.isActive === true ||
        rawData.isActive === "true";
    }

    // Parent Category
    if (rawData.parentId !== undefined) {
      const parentId =
        rawData.parentId === null ||
        rawData.parentId === ""
          ? null
          : Number(rawData.parentId);

      if (parentId !== null) {
        if (!Number.isInteger(parentId)) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid parent category",
            },
            {
              status: 400,
            }
          );
        }

        // A category cannot be its own parent
        if (parentId === categoryId) {
          return NextResponse.json(
            {
              success: false,
              error:
                "A category cannot be its own parent.",
            },
            {
              status: 400,
            }
          );
        }

        const [parentCategory] = await db
          .select()
          .from(categories)
          .where(eq(categories.id, parentId));

        if (!parentCategory) {
          return NextResponse.json(
            {
              success: false,
              error: "Parent category not found",
            },
            {
              status: 404,
            }
          );
        }

        // We are using:
        // Main Category -> Subcategory -> Products
        if (parentCategory.parentId !== null) {
          return NextResponse.json(
            {
              success: false,
              error:
                "A subcategory cannot contain another subcategory.",
            },
            {
              status: 400,
            }
          );
        }
      }

      updateObj.parentId = parentId;
    }

    const [updated] = await db
      .update(categories)
      .set(updateObj)
      .where(eq(categories.id, categoryId))
      .returning();

    return NextResponse.json({
      success: true,
      category: updated,
    });
  } catch (error) {
    console.error("Failed to update category:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================
// DELETE CATEGORY
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();

    if (!db) {
      return NextResponse.json(
        {
          success: false,
          error: "Database is not configured yet",
        },
        {
          status: 503,
        }
      );
    }

    const { searchParams } =
      new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Category ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const categoryId = Number(id);

    if (!Number.isInteger(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category ID",
        },
        {
          status: 400,
        }
      );
    }

    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId));

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        {
          status: 404,
        }
      );
    }

    await db
      .delete(categories)
      .where(eq(categories.id, categoryId));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to delete category:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}
