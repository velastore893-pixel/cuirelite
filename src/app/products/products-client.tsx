"use client";

import { useState, useMemo } from "react";
import { StoreProvider, useStore } from "@/lib/store-context";
import Navbar from "@/components/store/Navbar";
import ProductCard from "@/components/store/ProductCard";
import CartSidebar from "@/components/store/CartSidebar";
import Footer from "@/components/store/Footer";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Grid3X3, LayoutGrid } from "lucide-react";

interface Product {
  id: number;
  name: string;
  nameAr: string | null;
  slug: string;
  price: string;
  comparePrice: string | null;
  images: string[] | null;
  colors: { name: string; hex: string }[] | null;
  isFeatured: boolean | null;
  isNewArrival: boolean | null;
  material: string | null;
  materialAr: string | null;
  sizes: string[] | null;
  categoryId: number | null;
  stock: number | null;
  description: string | null;
  descriptionAr: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface Category {
  id: number;
  name: string;
  nameAr: string | null;
  slug: string;
  image: string | null;
  description: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
}

interface Props {
  products: Product[];
  categories: Category[];
}

function ProductsContent({ products: initialProducts, categories }: Props) {
  const { language } = useStore();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [gridSize, setGridSize] = useState<3 | 4>(4);

  const filteredProducts = useMemo(() => {
    let filtered = [...initialProducts];

    if (selectedCategory !== "all") {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) {
        filtered = filtered.filter((p) => p.categoryId === cat.id);
      }
    }

    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-desc":
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
        );
        break;
    }

    return filtered;
  }, [initialProducts, selectedCategory, sortBy, categories]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <CartSidebar />

      {/* Page Header */}
      <div className="bg-brand pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-2"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {language === "en" ? "Shop All" : "المتجر"}
          </h1>
          <p className="text-white/60">
            {language === "en"
              ? `${initialProducts.length} products available`
              : `${initialProducts.length} منتج متاح`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-accent transition-colors"
            >
              <SlidersHorizontal size={16} />
              {language === "en" ? "Filters" : "التصفية"}
              {selectedCategory !== "all" && (
                <span className="w-5 h-5 bg-accent text-white text-[10px] rounded-full flex items-center justify-center">
                  1
                </span>
              )}
            </button>

            {/* Category Pills */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-brand text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {language === "en" ? "All" : "الكل"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.slug
                      ? "bg-brand text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {language === "en" ? cat.name : cat.nameAr || cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Grid Toggle */}
            <div className="hidden md:flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setGridSize(3)}
                className={`p-2 ${gridSize === 3 ? "bg-brand text-white" : "bg-white text-gray-400"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setGridSize(4)}
                className={`p-2 ${gridSize === 4 ? "bg-brand text-white" : "bg-white text-gray-400"}`}
              >
                <Grid3X3 size={16} />
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium focus:outline-none focus:border-accent"
            >
              <option value="default">
                {language === "en" ? "Sort by" : "ترتيب حسب"}
              </option>
              <option value="price-asc">
                {language === "en" ? "Price: Low to High" : "السعر: من الأقل للأعلى"}
              </option>
              <option value="price-desc">
                {language === "en" ? "Price: High to Low" : "السعر: من الأعلى للأقل"}
              </option>
              <option value="newest">
                {language === "en" ? "Newest" : "الأحدث"}
              </option>
              <option value="name">
                {language === "en" ? "Name" : "الاسم"}
              </option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {selectedCategory !== "all" && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-400">
              {language === "en" ? "Active filters:" : "الفلاتر النشطة:"}
            </span>
            <span className="flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
              {language === "en"
                ? categories.find((c) => c.slug === selectedCategory)?.name
                : categories.find((c) => c.slug === selectedCategory)?.nameAr}
              <button onClick={() => setSelectedCategory("all")}>
                <X size={14} />
              </button>
            </span>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">
              {language === "en"
                ? "No products found"
                : "لم يتم العثور على منتجات"}
            </p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-accent hover:underline font-medium"
            >
              {language === "en" ? "Clear filters" : "مسح الفلاتر"}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function ProductsPage(props: Props) {
  return (
    <StoreProvider>
      <ProductsContent {...props} />
    </StoreProvider>
  );
}
