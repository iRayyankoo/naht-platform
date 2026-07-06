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
    }, 6000); // Slower, more elegant 6 seconds
    return () => clearInterval(interval);
  }, [isSlider, mediaUrls.length]);

  return (
    <section className="relative bg-[#050505] text-white h-[100svh] min-h-[600px] flex items-center pt-20 md:pt-0 overflow-hidden">
      {/* Background Media with Dark Luxury Overlay & Ken Burns */}
      <div className="absolute inset-0 z-0 bg-gray-950">
        {isVideo && (
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-70"
          >
            <source src={mediaUrls[0]} type="video/mp4" />
          </video>
        )}

        {singleImage && (
          <img 
            src={singleImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-70 animate-[kenburns_20s_ease-out_infinite_alternate]" 
          />
        )}

        {isSlider && mediaUrls.map((url, index) => (
          <div 
            key={index} 
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <img 
              src={url} 
              alt={`Hero Slide ${index + 1}`} 
              className={`w-full h-full object-cover opacity-70 ${index === currentSlide ? 'animate-[kenburns_20s_ease-out_forwards]' : ''} scale-105`} 
            />
          </div>
        ))}

        {/* Elegant cinematic gradients */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-black/40 pointer-events-none"></div>
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/60 to-transparent pointer-events-none hidden md:block"></div>
      </div>
      
      <div className="relative z-30 max-w-7xl mx-auto px-6 w-full flex flex-col items-start justify-center text-right mt-10 md:mt-0 pt-16 md:pt-24">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6 md:mb-10 opacity-0 animate-[fadeInUp_1s_ease-out_0.2s_forwards]">
            <div className="w-12 h-[1px] bg-brand-cafe/80"></div>
            <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-brand-cafe uppercase">نحت للأصول العقارية</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-[5rem] font-bold mb-6 md:mb-8 leading-[1.1] tracking-tight drop-shadow-2xl opacity-0 animate-[fadeInUp_1s_ease-out_0.4s_forwards]">
            {content?.heroTitle || "نحت الأصول العقارية"}
          </h1>
          
          <p className="text-lg md:text-2xl mb-10 md:mb-14 max-w-2xl text-gray-300 font-light leading-relaxed tracking-wide opacity-0 animate-[fadeInUp_1s_ease-out_0.6s_forwards] drop-shadow-md">
            {content?.heroSubtitle || "نبني مساحات تلهم الحياة وترتقي بجودة المعيشة نحو آفاق جديدة بتصاميم استثنائية."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto opacity-0 animate-[fadeInUp_1s_ease-out_0.8s_forwards]">
            <Link href={content?.ctaButtonUrl || "/projects"} className="group relative flex items-center justify-center gap-4 w-full sm:w-auto bg-brand-cafe text-white px-10 py-4 font-bold text-sm md:text-base transition-all duration-500 hover:bg-brand-coal hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:-translate-y-1 tracking-widest uppercase overflow-hidden [clip-path:polygon(0_0,calc(100%-20px)_0,100%_20px,100%_100%,0_100%)]">
              <span className="relative z-10">{content?.ctaButtonText || "استكشف التفاصيل"}</span>
              <svg className="w-4 h-4 rtl:rotate-180 transition-transform duration-500 group-hover:-translate-x-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </div>
        </div>

        {/* Glassmorphism Quick Stats (Hidden on very small mobile to reduce clutter) */}
        <div className="hidden sm:flex mt-20 gap-6 opacity-0 animate-[fadeInUp_1s_ease-out_1s_forwards]">
          <div className="bg-white/5 backdrop-blur-xl border border-white/5 p-6 rounded-3xl flex flex-col gap-1 min-w-[160px] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <span className="text-3xl font-serif text-white">10+</span>
            <span className="text-xs text-gray-400 tracking-widest uppercase">مشاريع استثنائية</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/5 p-6 rounded-3xl flex flex-col gap-1 min-w-[160px] shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <span className="text-3xl font-serif text-white">أرقى</span>
            <span className="text-xs text-gray-400 tracking-widest uppercase">المواقع الجغرافية</span>
          </div>
        </div>
      </div>

      {/* Slider Indicators (if slider) */}
      {isSlider && (
        <div className="absolute bottom-8 md:bottom-12 right-6 md:right-12 z-40 flex gap-2 md:gap-3">
          {mediaUrls.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-700 ${index === currentSlide ? 'w-10 md:w-16 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-4 md:w-8 bg-white/20 hover:bg-white/50'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Scroll indicator - Elegant Line */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-4 opacity-50 hover:opacity-100 transition-opacity hidden md:flex">
        <div className="w-[1px] h-20 bg-white/10 relative overflow-hidden rounded-full">
          <div className="w-full h-1/2 bg-white/80 absolute top-0 left-0 animate-[scrollDown_2s_ease-in-out_infinite] rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
        </div>
      </div>
      
      {/* Tailwind Custom Animations injected via global.css or inline style block */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes kenburns {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.15); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}} />
    </section>
  );
}
