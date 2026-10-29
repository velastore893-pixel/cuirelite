"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const image =
    category.image || "/images/placeholder.jpg";

  const categoryUrl = `/products?category=${category.slug}`;

  const prepareCategory = () => {
    router.prefetch(categoryUrl);
  };

  return (
    <Link
      href={categoryUrl}
      prefetch={false}
      onMouseEnter={prepareCategory}
      onFocus={prepareCategory}
      className="group relative rounded-xl sm:rounded-2xl overflow-hidden block bg-gray-50"
    >
      <img
        src={image}
        alt={
          language === "ar"
            ? category.nameAr || category.name
            : category.name
        }
        className="block w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]"
        loading="lazy"
        fetchPriority="auto"
        decoding="async"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
        <h3
          className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          {language === "ar"
            ? category.nameAr || category.name
            : category.name}
        </h3>

        <div className="flex items-center gap-2 text-accent text-xs sm:text-sm font-medium group-hover:gap-3 transition-all">
          {language === "en" ? "Explore" : "استكشاف"}
          <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}



