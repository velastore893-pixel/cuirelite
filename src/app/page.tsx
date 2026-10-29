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
  let slides: any[] = [];
  let featuredProducts: any[] = [];
  let newArrivals: any[] = [];
  let allCategories: any[] = [];
  let settings: Record<string, string> = {};

  try {
    const [
      slidesResult,
      featuredResult,
      newArrivalsResult,
      categoriesResult,
      settingsRows,
    ] = await Promise.all([
      db.select().from(heroSlides).where(eq(heroSlides.isActive, true)).orderBy(heroSlides.order),
      db.select().from(products).where(eq(products.isFeatured, true)),
      db.select().from(products).where(eq(products.isNewArrival, true)),
      db.select().from(categories),
      db.select().from(storeSettings),
    ]);

    slides = slidesResult;
    featuredProducts = featuredResult;
    newArrivals = newArrivalsResult;
    allCategories = categoriesResult;
    settings = Object.fromEntries(
      settingsRows.map((item) => [item.key, item.value ?? ""])
    ) as Record<string, string>;
  } catch (error) {
    console.error("Homepage database load failed:", error);
  }

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



