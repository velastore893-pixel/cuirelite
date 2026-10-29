import { db } from "@/db";
import {
  categories,
  products,
  heroSlides,
  storeSettings,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import ClientPage from "./client-page";

// Render at request time so Vercel does not try to reach Supabase during build.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    slides,
    featuredProducts,
    newArrivals,
    allCategories,
    settingsRows,
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

    db
      .select()
      .from(storeSettings),
  ]);

  const settings = Object.fromEntries(
    settingsRows.map((item) => [
      item.key,
      item.value ?? "",
    ])
  ) as Record<string, string>;

  return (
    <ClientPage
      slides={slides}
      featuredProducts={featuredProducts}
      newArrivals={newArrivals}
      categories={allCategories}
      settings={settings}
    />
  );
}


