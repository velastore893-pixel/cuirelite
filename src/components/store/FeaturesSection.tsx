"use client";

import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { useStore } from "@/lib/store-context";

export default function FeaturesSection() {
  const { language } = useStore();

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      titleAr: "شحن مجاني",
      desc: "On orders over $200",
      descAr: "للطلبات فوق 200$",
    },
    {
      icon: Shield,
      title: "Secure Payment",
      titleAr: "دفع آمن",
      desc: "100% secure checkout",
      descAr: "دفع آمن 100%",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      titleAr: "مرتجعات سهلة",
      desc: "30-day return policy",
      descAr: "سياسة مرتجعات 30 يوم",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      titleAr: "دعم على مدار الساعة",
      desc: "Always here to help",
      descAr: "دائماً هنا للمساعدة",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center group"
            >
              <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                <feature.icon size={28} />
              </div>
              <h3 className="font-semibold text-brand mb-1">
                {language === "en" ? feature.title : feature.titleAr}
              </h3>
              <p className="text-sm text-gray-400">
                {language === "en" ? feature.desc : feature.descAr}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
