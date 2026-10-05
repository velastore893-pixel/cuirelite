"use client";

import {
  StoreProvider,
  useStore,
} from "@/lib/store-context";

import Navbar from "@/components/store/Navbar";
import HeroSection from "@/components/store/HeroSection";
import ProductCard from "@/components/store/ProductCard";
import CategoryCard from "@/components/store/CategoryCard";
import FeaturesSection from "@/components/store/FeaturesSection";
import TestimonialSection from "@/components/store/TestimonialSection";
import CartSidebar from "@/components/store/CartSidebar";
import Footer from "@/components/store/Footer";
import TrackingPixels from "@/components/store/TrackingPixels";

import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface HeroSlide {
  id: number;
  title: string | null;
  titleAr: string | null;
  subtitle: string | null;
  subtitleAr: string | null;
  image: string | null;
  link: string | null;
}

interface Product {
  id: number;
  name: string;
  nameAr: string | null;
  slug: string;
  price: string;
  comparePrice: string | null;
  images: string[] | null;
  colors:
    | {
        name: string;
        hex: string;
      }[]
    | null;
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
  slides: HeroSlide[];
  featuredProducts: Product[];
  newArrivals: Product[];
  categories: Category[];
}

function StoreHome({
  slides,
  featuredProducts,
  newArrivals,
  categories,
}: Props) {
  const { language, t } = useStore();

  const text = {
    en: {
      shopByCategory: "Shop by Category",

      categoryDescription:
        "Explore our curated collections of premium leather products",

      curatedForYou: "Curated for You",

      featuredProducts: "Featured Products",

      italianLeatherTitle:
        "The Art of Italian Leather",

      italianLeatherDescription:
        "Each jacket is meticulously crafted from the finest Italian leather, designed to last a lifetime.",

      shopCollection: "Shop Collection",

      justIn: "Just In",

      newArrivals: "New Arrivals",
    },

    ar: {
      shopByCategory: "تسوقي حسب الفئة",

      categoryDescription:
        "استكشفي مجموعاتنا المختارة من منتجات الجلد الفاخرة",

      curatedForYou: "مختار لكِ",

      featuredProducts: "المنتجات المميزة",

      italianLeatherTitle:
        "فن الجلد الإيطالي",

      italianLeatherDescription:
        "كل جاكيت مصنوع بدقة من أجود الجلد الإيطالي، ومصمم ليدوم معك طويلاً.",

      shopCollection: "تسوقي المجموعة",

      justIn: "وصل حديثاً",

      newArrivals: "أحدث المنتجات",
    },
  };

  const txt = text[language];

  const arrowClass =
    language === "ar"
      ? "rotate-180 group-hover:-translate-x-1"
      : "group-hover:translate-x-1";

  return (
    <div
      className="min-h-screen"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <TrackingPixels />

      <Navbar />

      <CartSidebar />

      {/* Hero */}
      <HeroSection slides={slides} />

      {/* Features */}
      <FeaturesSection />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2
                className="text-3xl sm:text-4xl font-bold text-brand mb-4"
                style={{
                  fontFamily:
                    "Playfair Display, serif",
                }}
              >
                {txt.shopByCategory}
              </h2>

              <p className="text-gray-400 max-w-lg mx-auto">
                {txt.categoryDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles
                    size={20}
                    className="text-accent"
                  />

                  <span className="text-accent font-medium text-sm tracking-wider uppercase">
                    {txt.curatedForYou}
                  </span>
                </div>

                <h2
                  className="text-3xl sm:text-4xl font-bold text-brand"
                  style={{
                    fontFamily:
                      "Playfair Display, serif",
                  }}
                >
                  {txt.featuredProducts}
                </h2>
              </div>

              <Link
                href="/products?isFeatured=true"
                className="flex items-center gap-2 text-brand hover:text-accent font-medium tracking-wider uppercase text-sm transition-colors group"
              >
                {t("viewAll")}

                <ArrowRight
                  size={16}
                  className={`transition-transform ${arrowClass}`}
                />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {featuredProducts
                .slice(0, 4)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Banner */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-brand py-16 px-8 md:px-16">
            {/* Background Decoration */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full blur-3xl" />

              <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-2xl">
              <h2
                className="text-4xl md:text-5xl font-bold text-white mb-4"
                style={{
                  fontFamily:
                    "Playfair Display, serif",
                }}
              >
                {txt.italianLeatherTitle}
              </h2>

              <p className="text-white/70 text-lg leading-relaxed mb-8">
                {txt.italianLeatherDescription}
              </p>

              <Link
                href="/products?category=leather-jackets"
                className="inline-flex items-center gap-3 bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-full font-semibold tracking-wider uppercase text-sm transition-all btn-shine group"
              >
                {txt.shopCollection}

                <ArrowRight
                  size={18}
                  className={`transition-transform ${arrowClass}`}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <span className="text-accent font-medium text-sm tracking-wider uppercase mb-2 block">
                  {txt.justIn}
                </span>

                <h2
                  className="text-3xl sm:text-4xl font-bold text-brand"
                  style={{
                    fontFamily:
                      "Playfair Display, serif",
                  }}
                >
                  {txt.newArrivals}
                </h2>
              </div>

              <Link
                href="/products?isNewArrival=true"
                className="flex items-center gap-2 text-brand hover:text-accent font-medium tracking-wider uppercase text-sm transition-colors group"
              >
                {t("viewAll")}

                <ArrowRight
                  size={16}
                  className={`transition-transform ${arrowClass}`}
                />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {newArrivals
                .slice(0, 4)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <TestimonialSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function ClientPage(
  props: Props
) {
  return (
    <StoreProvider>
      <StoreHome {...props} />
    </StoreProvider>
  );
}
