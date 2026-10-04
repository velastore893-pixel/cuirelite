"use client";

import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { useStore } from "@/lib/store-context";

interface Testimonial {
  id: number;
  customerName: string;
  customerCity: string | null;
  rating: number | null;
  text: string;
}

export default function TestimonialSection() {
  const { language } = useStore();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => setTestimonials(data.testimonials || []))
      .catch(() => {});
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2
            className="text-4xl font-bold text-brand mb-4"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {language === "en" ? "What Our Clients Say" : "ماذا تقول عملاؤنا"}
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            {language === "en"
              ? "Real reviews from our satisfied customers"
              : "تقييمات حقيقية من عملائنا الراضين"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow relative"
            >
              <Quote
                size={40}
                className="text-accent/20 absolute top-6 right-6"
              />
              <div className="flex gap-0.5 mb-4">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-brand">{testimonial.customerName}</p>
                {testimonial.customerCity && (
                  <p className="text-sm text-gray-400">📍 {testimonial.customerCity}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
