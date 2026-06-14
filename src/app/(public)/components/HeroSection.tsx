"use client";

import Link from "next/link";
import { HomePageContent } from "@prisma/client";
import { useState, useEffect } from "react";

export default function HeroSection({ content }: { content: HomePageContent | null }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Parse the background image field to support multiple URLs
  const rawMedia = content?.heroBackgroundImage || "";
  // Split by newline or comma, then clean up
  const mediaUrls = rawMedia
    .split(/[\n,]+/)
    .map(url => url.trim())
    .filter(url => url.length > 0);

  const isSlider = mediaUrls.length > 1;
  const isVideo = !isSlider && mediaUrls.length === 1 && mediaUrls[0].toLowerCase().endsWith(".mp4");
  const singleImage = !isSlider && !isVideo && mediaUrls.length === 1 ? mediaUrls[0] : null;

  // Auto-slide logic
  useEffect(() => {
    if (!isSlider) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mediaUrls.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [isSlider, mediaUrls.length]);

  return (
    <section className="relative bg-[#0A0F16] text-white h-[95vh] min-h-[700px] flex items-center justify-center pt-20 md:pt-0 overflow-hidden">
      {/* Background Media with Dark Luxury Overlay */}
      <div className="absolute inset-0 z-0 bg-gray-950">
        {isVideo && (
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-80"
            style={{ filter: "brightness(0.6)" }}
          >
            <source src={mediaUrls[0]} type="video/mp4" />
          </video>
        )}

        {singleImage && (
          <img 
            src={singleImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-80" 
            style={{ filter: "brightness(0.55)" }}
          />
        )}

        {isSlider && mediaUrls.map((url, index) => (
          <div 
            key={index} 
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img 
              src={url} 
              alt={`Hero Slide ${index + 1}`} 
              className="w-full h-full object-cover opacity-80" 
              style={{ filter: "brightness(0.55)" }}
            />
          </div>
        ))}

        {/* Subtle vignette and bottom gradient for that premium real estate feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/40 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-start justify-center text-right mt-12 md:mt-0 pt-20 md:pt-32">
        <div className="max-w-4xl">
          <div className="w-16 h-1 bg-primary mb-8 md:mb-12 hidden md:block"></div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8 leading-[1.1] tracking-tight drop-shadow-2xl">
            {content?.heroTitle || "نحت الأصول العقارية"}
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-3xl text-gray-200 drop-shadow-xl font-light leading-relaxed tracking-wide">
            {content?.heroSubtitle || "نبني مساحات تلهم الحياة وترتقي بجودة المعيشة نحو آفاق جديدة."}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto mt-8">
            <Link href={content?.ctaButtonUrl || "/projects"} className="w-full sm:w-auto bg-white text-gray-950 hover:bg-gray-100 px-12 py-5 font-bold text-lg text-center transition-all duration-500 shadow-2xl hover:scale-105 tracking-widest uppercase">
              {content?.ctaButtonText || "استكشف مشاريعنا"}
            </Link>
            <Link href="/about" className="w-full sm:w-auto bg-transparent border border-white/40 hover:border-white text-white px-12 py-5 font-bold text-lg text-center transition-all duration-500 hover:bg-white hover:text-gray-950 tracking-widest uppercase">
              نبذة عن نحت
            </Link>
          </div>
        </div>
      </div>

      {/* Slider Indicators (if slider) */}
      {isSlider && (
        <div className="absolute bottom-12 right-12 z-20 flex gap-3">
          {mediaUrls.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 transition-all duration-300 ${index === currentSlide ? 'w-12 bg-primary' : 'w-6 bg-white/40 hover:bg-white/70'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Scroll indicator - Elegant Line */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer hidden md:flex">
        <span className="text-xs uppercase tracking-widest font-bold rotate-90 mb-6">تمرير</span>
        <div className="w-[1px] h-16 bg-white/30 relative overflow-hidden">
          <div className="w-full h-full bg-white absolute top-0 left-0 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
