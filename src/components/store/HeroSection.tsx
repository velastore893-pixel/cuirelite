"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store-context";

interface HeroSlide {
  id: number;
  title: string | null;
  titleAr: string | null;
  subtitle: string | null;
  subtitleAr: string | null;
  image: string | null;
  link: string | null;
}

interface Props {
  slides: HeroSlide[];

  // Optional server-provided values.
  // When these are passed from the homepage, the browser can start
  // loading the hero video immediately without waiting for /api/settings.
  initialHeroVideoUrl?: string;
  initialHeroVideoEnabled?: boolean;
}

export default function HeroSection({
  slides,
  initialHeroVideoUrl,
  initialHeroVideoEnabled,
}: Props) {
  const hasInitialVideoConfig =
    typeof initialHeroVideoEnabled === "boolean";

  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroVideoUrl, setHeroVideoUrl] = useState(
    initialHeroVideoUrl || ""
  );
  const [heroVideoEnabled, setHeroVideoEnabled] = useState(
    Boolean(initialHeroVideoEnabled && initialHeroVideoUrl)
  );
  const [settingsLoaded, setSettingsLoaded] = useState(
    hasInitialVideoConfig
  );

  const { language } = useStore();

  // Fallback only when the parent page did not provide the hero video
  // settings. Once the homepage passes them, this request is skipped.
  useEffect(() => {
    if (hasInitialVideoConfig) return;

    let cancelled = false;

    const loadHeroVideo = async () => {
      try {
        const res = await fetch("/api/settings", {
          cache: "no-store",
        });

        const data = await res.json();
        const settings = data.settings || {};

        const url = String(
          settings.hero_slider_video_url || ""
        ).trim();

        const enabled =
          String(
            settings.hero_slider_video_enabled || "false"
          ) === "true";

        if (!cancelled) {
          setHeroVideoUrl(url);
          setHeroVideoEnabled(Boolean(enabled && url));
        }
      } catch (err) {
        console.error(
          "Failed to load hero video settings:",
          err
        );
      } finally {
        if (!cancelled) {
          setSettingsLoaded(true);
        }
      }
    };

    loadHeroVideo();

    return () => {
      cancelled = true;
    };
  }, [hasInitialVideoConfig]);

  // Warm up all slider images in the browser cache.
  useEffect(() => {
    for (const item of slides) {
      if (!item.image) continue;

      const img = new Image();
      img.decoding = "async";
      img.src = item.image;
    }
  }, [slides]);

  // Warm up the hero video as soon as its URL is known.
  useEffect(() => {
    if (!heroVideoEnabled || !heroVideoUrl) return;

    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = heroVideoUrl;
    video.load();

    return () => {
      video.removeAttribute("src");
      video.load();
    };
  }, [heroVideoEnabled, heroVideoUrl]);

  useEffect(() => {
    if (heroVideoEnabled || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide(
        (prev) => (prev + 1) % slides.length
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [heroVideoEnabled, slides.length]);

  const goToSlide = (index: number) =>
    setCurrentSlide(index);

  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + slides.length) % slides.length
    );

  const nextSlide = () =>
    setCurrentSlide(
      (prev) => (prev + 1) % slides.length
    );

  // Keep the current safe fallback only when no server config is supplied.
  if (!settingsLoaded) {
    return (
      <section className="relative w-full overflow-hidden bg-black min-h-[120px]" />
    );
  }

  if (heroVideoEnabled && heroVideoUrl) {
    return (
      <section className="relative w-full overflow-hidden bg-black">
        <video
          key={heroVideoUrl}
          src={heroVideoUrl}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          className="block w-full h-auto object-contain bg-black"
        >
          Your browser does not support video playback.
        </video>
      </section>
    );
  }

  if (!slides.length) return null;

  const slide = slides[currentSlide];
  const slideImage =
    slide.image || "/images/hero-default.jpg";

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <img
        key={slide.id}
        src={slideImage}
        alt={
          language === "ar"
            ? slide.titleAr || slide.title || "Hero"
            : slide.title || "Hero"
        }
        className="block w-full h-auto object-contain"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none" />

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl animate-[fadeIn_.5s_ease-out]">
            {(slide.title || slide.titleAr) && (
              <h2
                className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-2 sm:mb-4 leading-tight"
                style={{
                  fontFamily: "Playfair Display, serif",
                }}
              >
                {language === "ar"
                  ? slide.titleAr || slide.title
                  : slide.title}
              </h2>
            )}

            {(slide.subtitle || slide.subtitleAr) && (
              <p className="text-sm sm:text-lg md:text-xl text-white/80 mb-4 sm:mb-8 font-light max-w-lg">
                {language === "ar"
                  ? slide.subtitleAr || slide.subtitle
                  : slide.subtitle}
              </p>
            )}

            <Link
              href={slide.link || "/products"}
              prefetch
              className="inline-flex items-center gap-2 sm:gap-3 bg-accent hover:bg-accent-dark text-white px-4 py-2 sm:px-8 sm:py-4 rounded-full font-semibold tracking-wider uppercase text-xs sm:text-sm transition-all duration-300 btn-shine group"
            >
              {language === "en"
                ? "Shop Now"
                : "تسوقي الآن"}

              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all z-20"
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 sm:w-10 bg-accent"
                  : "w-3 sm:w-4 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-8 right-8 hidden lg:flex flex-col items-center gap-2 animate-bounce z-20">
        <span className="text-white/60 text-xs tracking-widest rotate-90 origin-center mb-8">
          {language === "en"
            ? "SCROLL"
            : "تمرير"}
        </span>

        <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent" />
      </div>
    </section>
  );
}


