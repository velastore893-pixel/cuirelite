"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store-context";

export default function Footer() {
  const { language, settings } = useStore();

  return (
    <footer className="bg-brand text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3
              className="text-3xl font-bold mb-4"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {language === "en"
                ? "Join Our Community"
                : "انضمي إلى مجتمعنا"}
            </h3>
            <p className="text-white/60 mb-8">
              {language === "en"
                ? "Subscribe to get exclusive offers, new arrivals, and style tips."
                : "اشتركي للحصول على عروض حصرية ومنتجات جديدة ونصائح أزياء."}
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder={
                  language === "en" ? "Enter your email" : "أدخلي بريدك الإلكتروني"
                }
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-3 text-sm placeholder-white/40 focus:outline-none focus:border-accent transition-colors"
              />
              <button className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-full font-medium text-sm tracking-wider uppercase flex items-center gap-2 transition-colors btn-shine">
                {language === "en" ? "Subscribe" : "اشتركي"}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h2
              className="text-2xl font-black tracking-[0.2em] mb-4"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {language === "ar"
                ? settings.store_name_ar || settings.store_name
                : settings.store_name}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {language === "ar"
                ? settings.store_description_ar || settings.store_description
                : settings.store_description}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold tracking-wider uppercase text-sm mb-6">
              {language === "en" ? "Quick Links" : "روابط سريعة"}
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/products", label: "Shop All", labelAr: "المتجر" },
                { href: "/products?category=leather-jackets", label: "Jackets", labelAr: "جاكيتات" },
                { href: "/products?category=blazers", label: "Blazers", labelAr: "بلايزر" },
                { href: "/products?isFeatured=true", label: "Featured", labelAr: "مميزة" },
                { href: "/about", label: "About Us", labelAr: "من نحن" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-accent text-sm transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    {language === "en" ? link.label : link.labelAr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-semibold tracking-wider uppercase text-sm mb-6">
              {language === "en" ? "Customer Care" : "خدمة العملاء"}
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Shipping Policy", labelAr: "سياسة الشحن" },
                { label: "Returns & Exchanges", labelAr: "المرتجعات والاستبدال" },
                { label: "Size Guide", labelAr: "دليل المقاسات" },
                { label: "FAQs", labelAr: "الأسئلة الشائعة" },
                { label: "Contact Us", labelAr: "اتصلي بنا" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href="#"
                    className="text-white/60 hover:text-accent text-sm transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    {language === "en" ? item.label : item.labelAr}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact - Dynamic from settings */}
          <div>
            <h4 className="font-semibold tracking-wider uppercase text-sm mb-6">
              {language === "en" ? "Contact Us" : "تواصلي معنا"}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm">
                  {settings.store_address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-accent flex-shrink-0" />
                <span className="text-white/60 text-sm">{settings.store_phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-accent flex-shrink-0" />
                <span className="text-white/60 text-sm">
                  {settings.store_email}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} {settings.store_name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Visa", "Mastercard", "PayPal", "Apple Pay"].map((item) => (
                <span
                  key={item}
                  className="text-white/30 text-xs font-medium tracking-wider"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
