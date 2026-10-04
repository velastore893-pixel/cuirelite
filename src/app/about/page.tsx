"use client";

import { StoreProvider, useStore } from "@/lib/store-context";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import { Award, Leaf, Heart, Users } from "lucide-react";

function AboutContent() {
  const { language } = useStore();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] flex items-center bg-brand overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-1.jpg')] bg-cover bg-center opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {language === "en" ? "Our Story" : "قصتنا"}
          </h1>
          <p className="text-xl text-white/70 max-w-2xl">
            {language === "en"
              ? "Crafting premium leather jackets since 2015, blending Italian craftsmanship with modern design."
              : "نصنع جاكيتات جلد فاخرة منذ 2015، نمزج بين الحرفية الإيطالية والتصميم العصري."}
          </p>
        </div>
      </div>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold text-brand mb-4"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              {language === "en" ? "Our Values" : "قيمنا"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: "Quality",
                titleAr: "الجودة",
                desc: "Only the finest Italian leather",
                descAr: "أجود أنواع الجلد الإيطالي فقط",
              },
              {
                icon: Leaf,
                title: "Sustainability",
                titleAr: "الاستدامة",
                desc: "Eco-friendly tanning processes",
                descAr: "عمليات دباغة صديقة للبيئة",
              },
              {
                icon: Heart,
                title: "Passion",
                titleAr: "الشغف",
                desc: "Made with love and dedication",
                descAr: "مصنوع بالحب والتفاني",
              },
              {
                icon: Users,
                title: "Community",
                titleAr: "المجتمع",
                desc: "Supporting local artisans",
                descAr: "دعم الحرفيين المحليين",
              },
            ].map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon size={28} className="text-accent" />
                </div>
                <h3 className="font-bold text-brand mb-2">
                  {language === "en" ? value.title : value.titleAr}
                </h3>
                <p className="text-sm text-gray-400">
                  {language === "en" ? value.desc : value.descAr}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function AboutPage() {
  return (
    <StoreProvider>
      <AboutContent />
    </StoreProvider>
  );
}
