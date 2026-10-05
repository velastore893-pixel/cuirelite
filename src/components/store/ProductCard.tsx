"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Zap, Star } from "lucide-react";
import { useStore } from "@/lib/store-context";

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
}

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { language, settings, t } = useStore();

  const mainImage =
    product.images?.[0] || "/images/placeholder.jpg";

  const discount =
    product.comparePrice &&
    parseFloat(product.comparePrice) >
      parseFloat(product.price)
      ? Math.round(
          ((parseFloat(product.comparePrice) -
            parseFloat(product.price)) /
            parseFloat(product.comparePrice)) *
            100
        )
      : 0;

  const handleOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    window.location.href = `/products/${product.slug}#order`;
  };

  return (
    <div
      className="product-card group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Badges */}
      <div
        className={`absolute top-2 sm:top-4 z-10 flex flex-col gap-1 sm:gap-2 ${
          language === "ar"
            ? "right-2 sm:right-4"
            : "left-2 sm:left-4"
        }`}
      >
        {product.isNewArrival && (
          <span className="bg-accent text-white text-[8px] sm:text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
            {t("newArrival")}
          </span>
        )}

        {product.isFeatured && (
          <span className="bg-brand text-white text-[8px] sm:text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
            {t("featured")}
          </span>
        )}

        {discount > 0 && (
          <span className="bg-red-500 text-white text-[8px] sm:text-[10px] font-bold tracking-wider px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsWishlisted(!isWishlisted);
        }}
        className={`absolute top-2 sm:top-4 z-10 w-7 h-7 sm:w-9 sm:h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white hover:scale-110 ${
          language === "ar"
            ? "left-2 sm:left-4"
            : "right-2 sm:right-4"
        }`}
        aria-label={
          language === "ar"
            ? "إضافة إلى المفضلة"
            : "Add to wishlist"
        }
        title={
          language === "ar"
            ? "المفضلة"
            : "Wishlist"
        }
      >
        <Heart
          size={14}
          className={
            isWishlisted
              ? "fill-red-500 text-red-500"
              : "text-gray-600 hover:text-red-500"
          }
        />
      </button>

      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="block aspect-[3/4] overflow-hidden relative"
      >
        <div
          className="product-image w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${mainImage})`,
          }}
        />

        {/* Order Button */}
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
          <button
            onClick={handleOrder}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/20"
          >
            <Zap size={14} className="sm:hidden" />
            <Zap size={16} className="hidden sm:block" />

            {t("orderNow")}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div
        className={`p-2 sm:p-4 ${
          language === "ar"
            ? "text-right"
            : "text-left"
        }`}
      >
        {/* Colors */}
        {product.colors &&
          product.colors.length > 0 && (
            <div
              className={`flex gap-1 mb-1 sm:mb-2 ${
                language === "ar"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {product.colors.map((color) => (
                <div
                  key={color.name}
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-200 cursor-pointer hover:scale-125 transition-transform"
                  style={{
                    backgroundColor: color.hex,
                  }}
                  title={color.name}
                />
              ))}
            </div>
          )}

        {/* Rating */}
        <div
          className={`flex items-center gap-0.5 mb-0.5 sm:mb-1 ${
            language === "ar"
              ? "justify-end"
              : "justify-start"
          }`}
        >
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={10}
              className="fill-accent text-accent"
            />
          ))}
        </div>

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-xs sm:text-sm text-brand hover:text-accent transition-colors line-clamp-1 mb-0.5 sm:mb-1">
            {language === "ar"
              ? product.nameAr || product.name
              : product.name}
          </h3>
        </Link>

        {/* Material */}
        {(product.material ||
          product.materialAr) && (
          <p className="text-[10px] sm:text-xs text-gray-400 mb-1">
            {language === "ar"
              ? product.materialAr ||
                product.material
              : product.material}
          </p>
        )}

        {/* Price */}
        <div
          className={`flex items-center gap-1 sm:gap-2 ${
            language === "ar"
              ? "justify-end"
              : "justify-start"
          }`}
        >
          <span className="text-sm sm:text-lg font-bold text-brand">
            {settings.currency_symbol || "DH"}
            {product.price}
          </span>

          {product.comparePrice && (
            <span className="text-[10px] sm:text-sm text-gray-400 line-through">
              {settings.currency_symbol || "DH"}
              {product.comparePrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
