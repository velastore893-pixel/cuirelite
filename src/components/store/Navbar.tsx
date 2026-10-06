"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Menu,
  X,
  Heart,
  Globe,
} from "lucide-react";
import { useStore } from "@/lib/store-context";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminHint, setShowAdminHint] = useState(false);

  const {
    cartCount,
    setIsCartOpen,
    language,
    setLanguage,
    settings,
    t,
  } = useStore();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const newCount = logoClicks + 1;
    setLogoClicks(newCount);

    if (newCount >= 4) {
      window.location.href = "/admin";
    } else if (newCount >= 2) {
      setShowAdminHint(true);

      setTimeout(() => {
        setShowAdminHint(false);
      }, 2000);
    }

    setTimeout(() => {
      setLogoClicks(0);
    }, 3000);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    {
      href: "/",
      label: t("home"),
    },
    {
      href: "/products",
      label: t("shop"),
    },
    {
      href: "/products?category=leather-jackets",
      label: language === "ar" ? "جاكيتات" : "Jackets",
    },
    {
      href: "/products?isFeatured=true",
      label: t("featured"),
    },
    {
      href: "/about",
      label: t("about"),
    },
  ];

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const storeName =
    language === "ar"
      ? settings.store_name_ar || settings.store_name
      : settings.store_name;

  const storeDescription =
    language === "ar"
      ? settings.store_description_ar ||
        settings.store_description
      : settings.store_description;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() =>
                setIsMobileMenuOpen(!isMobileMenuOpen)
              }
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isScrolled
                  ? "text-brand"
                  : "text-white"
              }`}
              aria-label={t("menu")}
            >
              {isMobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>

            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="flex flex-col items-center relative"
            >
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={storeName}
                  className={`object-contain transition-all duration-300 ${
                    isScrolled
                      ? "h-10 md:h-12"
                      : "h-12 md:h-14"
                  } max-w-[180px] md:max-w-[220px]`}
                />
              ) : (
                <>
                  <h1
                    className={`text-2xl md:text-3xl font-black tracking-[0.3em] transition-colors duration-300 ${
                      isScrolled
                        ? "text-brand"
                        : "text-white"
                    }`}
                    style={{
                      fontFamily:
                        "Playfair Display, serif",
                    }}
                  >
                    {storeName}
                  </h1>

                  <span
                    className={`text-[10px] tracking-[0.5em] uppercase transition-colors duration-300 ${
                      isScrolled
                        ? "text-accent"
                        : "text-accent-light"
                    }`}
                  >
                    {storeDescription}
                  </span>
                </>
              )}

              {/* Admin Hint */}
              {showAdminHint && (
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-amber-500 whitespace-nowrap animate-pulse">
                  {logoClicks < 4
                    ? language === "ar"
                      ? `${
                          4 - logoClicks
                        } ضغطات للدخول للإدارة...`
                      : `${
                          4 - logoClicks
                        } clicks to admin...`
                    : ""}
                </span>
              )}
            </button>

            {/* Desktop Navigation */}
            <div
              className={`hidden lg:flex items-center gap-8 ${
                language === "ar"
                  ? "flex-row-reverse"
                  : ""
              }`}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative font-medium text-sm tracking-wider uppercase transition-colors duration-300 group ${
                    isScrolled
                      ? "text-brand hover:text-accent"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {link.label}

                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div
              className={`flex items-center gap-3 md:gap-4 ${
                language === "ar"
                  ? "flex-row-reverse"
                  : ""
              }`}
            >
              {/* Language */}
              <button
                onClick={toggleLanguage}
                className={`p-2 rounded-lg transition-colors flex flex-col items-center ${
                  isScrolled
                    ? "text-brand hover:text-accent"
                    : "text-white/80 hover:text-white"
                }`}
                title={
                  language === "en"
                    ? "Switch to Arabic"
                    : "التبديل إلى الإنجليزية"
                }
              >
                <Globe size={20} />

                <span className="text-[10px] font-bold">
                  {language === "en"
                    ? "عربي"
                    : "EN"}
                </span>
              </button>

              {/* Wishlist */}
              <button
                className={`p-2 rounded-lg transition-colors hidden sm:block ${
                  isScrolled
                    ? "text-brand hover:text-accent"
                    : "text-white/80 hover:text-white"
                }`}
                aria-label={
                  language === "ar"
                    ? "المفضلة"
                    : "Wishlist"
                }
              >
                <Heart size={20} />
              </button>

              {/* Cart */}
              <button
                onClick={() =>
                  setIsCartOpen(true)
                }
                className={`relative p-2 rounded-lg transition-colors ${
                  isScrolled
                    ? "text-brand hover:text-accent"
                    : "text-white/80 hover:text-white"
                }`}
                aria-label={t("cart")}
              >
                <ShoppingBag size={20} />

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() =>
              setIsMobileMenuOpen(false)
            }
          />

          <div
            className={`absolute top-0 bottom-0 w-72 bg-white shadow-2xl ${
              language === "ar"
                ? "right-0"
                : "left-0"
            }`}
          >
            <div className="p-6">
              {/* Mobile Logo */}
              <div className="mb-8">
                {settings.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt={storeName}
                    className="h-12 max-w-[180px] object-contain"
                  />
                ) : (
                  <>
                    <h2
                      className="text-xl font-black tracking-[0.2em] text-brand mb-2"
                      style={{
                        fontFamily:
                          "Playfair Display, serif",
                      }}
                    >
                      {storeName}
                    </h2>

                    <p className="text-xs text-gray-400">
                      {storeDescription}
                    </p>
                  </>
                )}
              </div>

              {/* Links */}
              <div>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() =>
                      setIsMobileMenuOpen(false)
                    }
                    className={`block py-3 text-brand hover:text-accent font-medium tracking-wider uppercase text-sm border-b border-gray-100 transition-colors ${
                      language === "ar"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Language Switch */}
              <button
                onClick={toggleLanguage}
                className="mt-6 w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-brand hover:border-accent hover:text-accent transition-colors"
              >
                <Globe size={18} />

                {language === "en"
                  ? "العربية"
                  : "English"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
