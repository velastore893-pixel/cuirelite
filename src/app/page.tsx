import { db } from "@/db";
import { categories, products, heroSlides } from "@/db/schema";
import { eq } from "drizzle-orm";
import ClientPage from "./client-page";

// Always render dynamically so the homepage reflects the latest
// data from the admin dashboard (no build-time caching).
export const dynamic = "force-dynamic";

export default async function Home() {
  const slides = await db
    .select()
    .from(heroSlides)
    .where(eq(heroSlides.isActive, true))
    .orderBy(heroSlides.order);

  const featuredProducts = await db
    .select()
    .from(products)
    .where(eq(products.isFeatured, true));

  const newArrivals = await db
    .select()
    .from(products)
    .where(eq(products.isNewArrival, true));

  const allCategories = await db.select().from(categories);

  return (
    <ClientPage
      slides={slides}
      featuredProducts={featuredProducts}
      newArrivals={newArrivals}
      categories={allCategories}
    />
  );
}
