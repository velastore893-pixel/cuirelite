"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
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
  const { cartCount, setIsCartOpen, language, setLanguage, settings } = useStore();

  // Logo click counter for admin access
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);

    if (newCount >= 4) {
      // Redirect to admin after 4 clicks
      window.location.href = "/admin";
    } else if (newCount >= 2) {
      // Show hint after 2 clicks
      setShowAdminHint(true);
      setTimeout(() => setShowAdminHint(false), 2000);
    }

    // Reset counter after 3 seconds
    setTimeout(() => setLogoClicks(0), 3000);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home", labelAr: "الرئيسية" },
    { href: "/products", label: "Shop", labelAr: "المتجر" },
    { href: "/products?category=leather-jackets", label: "Jackets", labelAr: "جاكيتات" },
    { href: "/products?isFeatured=true", label: "Featured", labelAr: "مميزة" },
    { href: "/about", label: "About", labelAr: "من نحن" },
  ];

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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isScrolled ? "text-brand" : "text-white"
              }`}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <button onClick={handleLogoClick} className="flex flex-col items-center relative">
              <h1
                className={`text-2xl md:text-3xl font-black tracking-[0.3em] transition-colors duration-300 ${
                  isScrolled ? "text-brand" : "text-white"
                }`}
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                {language === "ar"
                  ? settings.store_name_ar || settings.store_name
                  : settings.store_name}
              </h1>
              <span
                className={`text-[10px] tracking-[0.5em] uppercase transition-colors duration-300 ${
                  isScrolled ? "text-accent" : "text-accent-light"
                }`}
              >
                {language === "en"
                  ? settings.store_description || "Premium Leather"
                  : settings.store_description_ar || "جلد فاخر"}
              </span>
              {/* Admin hint */}
              {showAdminHint && (
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-amber-500 whitespace-nowrap animate-pulse">
                  {logoClicks < 4 ? `${4 - logoClicks} clicks to admin...` : ""}
                </span>
              )}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
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
                  {language === "en" ? link.label : link.labelAr}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <button
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled ? "text-brand hover:text-accent" : "text-white/80 hover:text-white"
                }`}
                title={language === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
              >
                <Globe size={20} />
                <span className="text-[10px] font-bold">{language === "en" ? "عربي" : "EN"}</span>
              </button>

              <button
                className={`p-2 rounded-lg transition-colors hidden sm:block ${
                  isScrolled ? "text-brand hover:text-accent" : "text-white/80 hover:text-white"
                }`}
              >
                <Heart size={20} />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative p-2 rounded-lg transition-colors ${
                  isScrolled ? "text-brand hover:text-accent" : "text-white/80 hover:text-white"
                }`}
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
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white animate-slide-in">
            <div className="p-6">
              <h2
                className="text-xl font-black tracking-[0.2em] text-brand mb-8"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                CUIR ELITE
              </h2>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 text-brand hover:text-accent font-medium tracking-wider uppercase text-sm border-b border-gray-100 transition-colors"
                >
                  {language === "en" ? link.label : link.labelAr}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
