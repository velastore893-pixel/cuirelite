import { db } from "@/db";
import { categories, products, heroSlides } from "@/db/schema";
import { eq } from "drizzle-orm";
import ClientPage from "./client-page";

// Cache the homepage for 30 seconds.
// This prevents every visitor from triggering fresh database queries.
export const revalidate = 30;

export default async function Home() {
  const [
    slides,
    featuredProducts,
    newArrivals,
    allCategories,
  ] = await Promise.all([
    db
      .select()
      .from(heroSlides)
      .where(eq(heroSlides.isActive, true))
      .orderBy(heroSlides.order),

    db
      .select()
      .from(products)
      .where(eq(products.isFeatured, true)),

    db
      .select()
      .from(products)
      .where(eq(products.isNewArrival, true)),

    db
      .select()
      .from(categories),
  ]);

  return (
    <ClientPage
      slides={slides}
      featuredProducts={featuredProducts}
      newArrivals={newArrivals}
      categories={allCategories}
    />
  );
}

