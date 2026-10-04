"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store-context";

interface Category {
  id: number;
  name: string;
  nameAr: string | null;
  slug: string;
  image: string | null;
  description: string | null;
}

interface Props {
  category: Category;
}

export default function CategoryCard({ category }: Props) {
  const { language } = useStore();

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group relative h-40 sm:h-80 rounded-xl sm:rounded-2xl overflow-hidden block"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{
          backgroundImage: `url(${category.image || "/images/placeholder.jpg"})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-6">
        <h3
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          {language === "ar" ? category.nameAr || category.name : category.name}
        </h3>
        <div className="flex items-center gap-2 text-accent text-sm font-medium group-hover:gap-3 transition-all">
          {language === "en" ? "Explore" : "استكشاف"}
          <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}
