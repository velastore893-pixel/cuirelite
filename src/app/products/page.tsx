import Link from "next/link";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, and, asc, SQL } from "drizzle-orm";

import { StoreProvider } from "@/lib/store-context";

import Navbar from "@/components/store/Navbar";
import CartSidebar from "@/components/store/CartSidebar";
import Footer from "@/components/store/Footer";
import ProductCard from "@/components/store/ProductCard";
import CategoryCard from "@/components/store/CategoryCard";

export const dynamic = "force-dynamic";

export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{
    [key: string]: string | undefined;
  }>;
}) {
  const params = await searchParams;

  // ==========================================
  // GET ALL ACTIVE CATEGORIES
  // ==========================================

  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(
      asc(categories.sortOrder),
      asc(categories.name)
    );

  // ==========================================
  // CURRENT CATEGORY
  // ==========================================

  const currentCategory = params.category
    ? allCategories.find(
        (category) =>
          category.slug === params.category
      )
    : undefined;

  // ==========================================
  // CHILD CATEGORIES
  // ==========================================

  const childCategories = currentCategory
    ? allCategories.filter(
        (category) =>
          category.parentId === currentCategory.id
      )
    : [];

  // ==========================================
  // MAIN CATEGORIES
  // ==========================================

  const mainCategories = allCategories.filter(
    (category) => category.parentId == null
  );

  // ==========================================
  // PARENT CATEGORY
  // ==========================================

  const parentCategory =
    currentCategory?.parentId != null
      ? allCategories.find(
          (category) =>
            category.id ===
            currentCategory.parentId
        )
      : undefined;

  // ==========================================
  // PRODUCTS CONDITIONS
  // ==========================================

  const conditions: SQL[] = [
    eq(products.isActive, true),
  ];

  // IMPORTANT:
  // Only filter products when we are inside
  // a LEAF category such as Wydad or Naruto.
  //
  // Clubs -> show clubs
  // Wydad -> show products

  if (
    currentCategory &&
    childCategories.length === 0
  ) {
    conditions.push(
      eq(
        products.categoryId,
        currentCategory.id
      )
    );
  }

  if (params.isFeatured === "true") {
    conditions.push(
      eq(products.isFeatured, true)
    );
  }

  if (params.isNewArrival === "true") {
    conditions.push(
      eq(products.isNewArrival, true)
    );
  }

  // ==========================================
  // GET PRODUCTS
  // ==========================================

  let allProducts: typeof products.$inferSelect[] =
    [];

  // If current category has children,
  // DO NOT show products yet.
  // Show the subcategories first.

  if (
    !currentCategory ||
    childCategories.length === 0
  ) {
    allProducts = await db
      .select()
      .from(products)
      .where(and(...conditions));
  }

  // ==========================================
  // PAGE TITLE
  // ==========================================

  let pageTitle = "Shop All";

  if (currentCategory) {
    pageTitle = currentCategory.name;
  }

  if (params.isFeatured === "true") {
    pageTitle = "Featured Products";
  }

  if (params.isNewArrival === "true") {
    pageTitle = "New Arrivals";
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <StoreProvider>
      <div className="min-h-screen bg-[#faf9f7]">
        <Navbar />

        <CartSidebar />

        {/* =====================================
            HEADER
        ===================================== */}

        <section className="bg-[#181818] pt-32 pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/50 mb-5">
              <Link
                href="/"
                className="hover:text-white transition-colors"
              >
                Home
              </Link>

              <span>/</span>

              <Link
                href="/products"
                className="hover:text-white transition-colors"
              >
                Shop
              </Link>

              {parentCategory && (
                <>
                  <span>/</span>

                  <Link
                    href={`/products?category=${parentCategory.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {parentCategory.name}
                  </Link>
                </>
              )}

              {currentCategory && (
                <>
                  <span>/</span>

                  <span className="text-white">
                    {currentCategory.name}
                  </span>
                </>
              )}
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold text-white"
              style={{
                fontFamily:
                  "Playfair Display, serif",
              }}
            >
              {pageTitle}
            </h1>

            {/* SUBCATEGORY COUNT */}
            {currentCategory &&
            childCategories.length > 0 ? (
              <p className="text-white/60 mt-2">
                {childCategories.length} collections
                available
              </p>
            ) : (
              <p className="text-white/60 mt-2">
                {allProducts.length} products
                available
              </p>
            )}
          </div>
        </section>

        {/* =====================================
            CONTENT
        ===================================== */}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* ===================================
              CASE 1:
              CURRENT CATEGORY HAS CHILDREN
              
              Clubs
              -> Wydad
              -> Raja
              -> Barcelona
              -> Real Madrid
          =================================== */}

          {currentCategory &&
          childCategories.length > 0 ? (
            <>
              <div className="mb-10">
                <p className="text-sm uppercase tracking-[0.2em] text-amber-500 font-medium mb-2">
                  Collections
                </p>

                <h2
                  className="text-3xl font-bold text-gray-900"
                  style={{
                    fontFamily:
                      "Playfair Display, serif",
                  }}
                >
                  Explore {currentCategory.name}
                </h2>

                {currentCategory.description && (
                  <p className="text-gray-500 mt-3 max-w-2xl">
                    {
                      currentCategory.description
                    }
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {childCategories.map(
                  (category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                    />
                  )
                )}
              </div>
            </>
          ) : currentCategory ? (
            /* ===================================
                CASE 2:
                LEAF CATEGORY
                
                Wydad
                -> PRODUCTS
            =================================== */

            <>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  {parentCategory && (
                    <Link
                      href={`/products?category=${parentCategory.slug}`}
                      className="inline-flex items-center gap-2 text-sm text-amber-500 hover:text-amber-600 mb-3"
                    >
                      ← Back to{" "}
                      {parentCategory.name}
                    </Link>
                  )}

                  <h2
                    className="text-3xl font-bold text-gray-900"
                    style={{
                      fontFamily:
                        "Playfair Display, serif",
                    }}
                  >
                    {currentCategory.name}
                  </h2>

                  {currentCategory.description && (
                    <p className="text-gray-500 mt-2">
                      {
                        currentCategory.description
                      }
                    </p>
                  )}
                </div>

                <span className="text-sm text-gray-400">
                  {allProducts.length} products
                </span>
              </div>

              {allProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {allProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center bg-white rounded-3xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products yet
                  </h3>

                  <p className="text-gray-400">
                    Products added to{" "}
                    {currentCategory.name} will
                    appear here automatically.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* ===================================
                CASE 3:
                SHOP ALL
                
                MAIN CATEGORIES + PRODUCTS
            =================================== */

            <>
              {/* MAIN CATEGORIES */}

              {mainCategories.length > 0 &&
                !params.isFeatured &&
                !params.isNewArrival && (
                  <section className="mb-16">
                    <div className="mb-8">
                      <p className="text-sm uppercase tracking-[0.2em] text-amber-500 font-medium mb-2">
                        Collections
                      </p>

                      <h2
                        className="text-3xl font-bold text-gray-900"
                        style={{
                          fontFamily:
                            "Playfair Display, serif",
                        }}
                      >
                        Shop by Category
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {mainCategories.map(
                        (category) => (
                          <CategoryCard
                            key={category.id}
                            category={category}
                          />
                        )
                      )}
                    </div>
                  </section>
                )}

              {/* ALL PRODUCTS */}

              <section>
                <div className="flex items-end justify-between mb-8">
                  <h2
                    className="text-3xl font-bold text-gray-900"
                    style={{
                      fontFamily:
                        "Playfair Display, serif",
                    }}
                  >
                    {params.isFeatured === "true"
                      ? "Featured Products"
                      : params.isNewArrival ===
                        "true"
                      ? "New Arrivals"
                      : "All Products"}
                  </h2>

                  <span className="text-sm text-gray-400">
                    {allProducts.length} products
                  </span>
                </div>

                {allProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    {allProducts.map(
                      (product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <p className="text-gray-400">
                      No products found
                    </p>
                  </div>
                )}
              </section>
            </>
          )}
        </main>

        <Footer />
      </div>
    </StoreProvider>
  );
}
