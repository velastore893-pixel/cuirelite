"use client";

import { StoreProvider, useStore } from "@/lib/store-context";
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
import { ArrowRight, Sparkles } from "lucide-react";

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
  const { language } = useStore();

  return (
    <div className="min-h-screen">
      <TrackingPixels />
      <Navbar />
      <CartSidebar />

      {/* Hero */}
      <HeroSection slides={slides} />

      {/* Features */}
      <FeaturesSection />

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-bold text-brand mb-4"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {language === "en" ? "Shop by Category" : "تسوقي حسب الفئة"}
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              {language === "en"
                ? "Explore our curated collections of premium leather products"
                : "استكشفي مجموعاتنا المختارة من منتجات الجلد الفاخرة"}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-accent" />
                <span className="text-accent font-medium text-sm tracking-wider uppercase">
                  {language === "en" ? "Curated for You" : "مختار لكِ"}
                </span>
              </div>
              <h2
                className="text-4xl font-bold text-brand"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                {language === "en" ? "Featured Products" : "المنتجات المميزة"}
              </h2>
            </div>
            <Link
              href="/products?isFeatured=true"
              className="flex items-center gap-2 text-brand hover:text-accent font-medium tracking-wider uppercase text-sm transition-colors mt-4 md:mt-0 group"
            >
              {language === "en" ? "View All" : "عرض الكل"}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-brand py-16 px-8 md:px-16">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
            </div>
            <div className="relative max-w-2xl">
              <h2
                className="text-4xl md:text-5xl font-bold text-white mb-4"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                {language === "en"
                  ? "The Art of Italian Leather"
                  : "فن الجلد الإيطالي"}
              </h2>
              <p className="text-white/70 text-lg mb-8">
                {language === "en"
                  ? "Each jacket is meticulously crafted from the finest Italian leather, designed to last a lifetime."
                  : "كل جاكيت مصنوع بدقة من أجود الجلد الإيطالي، مصمم ليدوم مدى الحياة."}
              </p>
              <Link
                href="/products?category=leather-jackets"
                className="inline-flex items-center gap-3 bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-full font-semibold tracking-wider uppercase text-sm transition-all btn-shine group"
              >
                {language === "en" ? "Shop Collection" : "تسوق المجموعة"}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
              <div>
                <span className="text-accent font-medium text-sm tracking-wider uppercase mb-2 block">
                  {language === "en" ? "Just In" : "وصل حديثاً"}
                </span>
                <h2
                  className="text-4xl font-bold text-brand"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  {language === "en" ? "New Arrivals" : "وصل حديثاً"}
                </h2>
              </div>
              <Link
                href="/products?isNewArrival=true"
                className="flex items-center gap-2 text-brand hover:text-accent font-medium tracking-wider uppercase text-sm transition-colors mt-4 md:mt-0 group"
              >
                {language === "en" ? "View All" : "عرض الكل"}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials - from database */}
      <TestimonialSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function ClientPage(props: Props) {
  return (
    <StoreProvider>
      <StoreHome {...props} />
    </StoreProvider>
  );
}
