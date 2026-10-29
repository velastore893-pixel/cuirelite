import { db } from "@/db";
import {
  categories,
  products,
  heroSlides,
  storeSettings,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import ClientPage from "./client-page";

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

  const allCategories = await db
    .select()
    .from(categories);

  const settingsRows = await db
    .select()
    .from(storeSettings);

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
