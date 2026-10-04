import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ProductDetailClient from "./product-detail-client";

// Always render dynamically — the product page must show the
// latest data saved from the admin dashboard.
export const dynamic = "force-dynamic";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug));

  if (!product) {
    notFound();
  }

  const [category] = product.categoryId
    ? await db
        .select()
        .from(categories)
        .where(eq(categories.id, product.categoryId))
    : [null];

  // Get related products
  const relatedProducts = product.categoryId
    ? await db
        .select()
        .from(products)
        .where(eq(products.categoryId, product.categoryId))
    : [];

  return (
    <ProductDetailClient
      product={product}
      category={category}
      relatedProducts={relatedProducts.filter((p) => p.id !== product.id).slice(0, 4)}
    />
  );
}
