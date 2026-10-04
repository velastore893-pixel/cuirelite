import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, and, SQL } from "drizzle-orm";
import ProductsPage from "./products-client";

// Always render dynamically — the storefront must reflect
// whatever the admin dashboard saved to the database.
export const dynamic = "force-dynamic";

export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const conditions: SQL[] = [eq(products.isActive, true)];

  if (params.category) {
    const cats = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, params.category));
    if (cats.length > 0) {
      conditions.push(eq(products.categoryId, cats[0].id));
    }
  }

  if (params.isFeatured === "true") {
    conditions.push(eq(products.isFeatured, true));
  }

  if (params.isNewArrival === "true") {
    conditions.push(eq(products.isNewArrival, true));
  }

  const allProducts = conditions.length > 0
    ? await db.select().from(products).where(and(...conditions))
    : await db.select().from(products);

  const allCategories = await db.select().from(categories);

  return (
    <ProductsPage products={allProducts} categories={allCategories} />
  );
}
