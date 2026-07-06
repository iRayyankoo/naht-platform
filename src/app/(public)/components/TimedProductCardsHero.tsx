"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Project, HomePageContent, SiteSettings } from "@prisma/client";
import Image from "next/image";

const MapPin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
const Maximize2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
);
const Tag = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
);
const ArrowLeft = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
);

interface TimedProductCardsHeroProps {
  content: HomePageContent | null;
  projects: Project[];
  settings: SiteSettings | null;
}

export default function TimedProductCardsHero({ content, projects, settings }: TimedProductCardsHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Limit to max 4 projects for a cleaner layout
  const displayProjects = projects.slice(0, 4);

  // Preload images
  useEffect(() => {
    displayProjects.forEach(project => {
      const imgUrl = project.mainImage || content?.heroBackgroundImage;
      if (imgUrl) {
        const img = new window.Image();
        img.src = imgUrl;
      }
    });
  }, [displayProjects, content?.heroBackgroundImage]);

  // Handle active index change and delay display index
  useEffect(() => {
    if (activeIndex !== displayIndex) {
      setIsTransitioning(true);
      const timeout = setTimeout(() => {
        setDisplayIndex(activeIndex);
        setIsTransitioning(false);
      }, 250); // Delay content change by 250ms to let background start fading
      
      return () => clearTimeout(timeout);
    }
  }, [activeIndex, displayIndex]);

  // Auto-switch timer
  useEffect(() => {
    if (displayProjects.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayProjects.length);
    }, 6000); // 6 seconds

    return () => clearInterval(timer);
  }, [displayProjects.length]);

  if (!displayProjects || displayProjects.length === 0) {
    return null; // Safe fallback will be handled by parent if projects is empty
  }

  const activeProject = displayProjects[displayIndex];
  const whatsappUrl = settings?.whatsappNumber 
    ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`
    : null;

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between bg-[#050505] overflow-hidden" dir="rtl">
      {/* Background Image Layers - Smooth Crossfade */}
      <div className="absolute inset-0 z-0 bg-[#050505]">
        {displayProjects.map((project, idx) => {
          const bgImage = project.mainImage || content?.heroBackgroundImage || "/images/placeholder.jpg";
          return (
            <div 
              key={`bg-${project.id}`}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1800ms] ease-in-out ${
                idx === activeIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url('${bgImage}')` }}
            />
          );
        })}
        {/* Subtle Zoom on the active image container */}
        <div className="absolute inset-0 pointer-events-none animate-[subtleZoom_20s_ease-out_forwards]" />
        
        {/* Top Gradient for Header Readability */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/60 to-transparent z-[1]" />
        
        {/* Very Light Overlay: Dark on the right for text readability, clear on the left for the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/40 to-transparent lg:bg-gradient-to-l lg:from-[#050505]/80 lg:via-[#050505]/20 lg:to-transparent z-[2]" />
      </div>

      {/* Top spacer to push content down below header safely */}
      <div className="h-28 md:h-36 w-full flex-shrink-0 relative z-10" />

      {/* Main Content Area - Solid unified block on the right */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex-1 flex flex-col justify-center">
        <div 
          key={`content-${activeProject.id}`} 
          className={`w-full max-w-[620px] transition-opacity duration-700 ease-in-out ${
            isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
          }`}
          style={{ animation: isTransitioning ? 'none' : 'fadeSlideSoft 0.7s ease-out forwards' }}
        >
          {/* Small Top Title */}
          <div className="mb-4 flex items-center gap-3">
            <span className="h-[2px] w-8 bg-brand-cafe"></span>
            <span className="text-brand-cafe text-sm font-bold tracking-wider">
              {content?.heroTitle || "نحت العقارية - مشاريعنا"}
            </span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-md">
            {activeProject.name}
          </h1>
          
          {/* Short Description */}
          <p className="text-base md:text-lg text-gray-200 mb-8 line-clamp-2 md:line-clamp-3 drop-shadow">
            {activeProject.shortDesc || "مشروع عقاري استثنائي يلبي كافة تطلعاتك بتصميم عصري وموقع استراتيجي."}
          </p>

          {/* Project Meta Info Grid (Glassmorphism Card) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-white/90 bg-[#050505]/40 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl">
            {/* Location */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="w-4 h-4" />
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">الموقع</span>
              </div>
              <div className="font-bold text-sm truncate">{activeProject.city || "المملكة العربية السعودية"}</div>
            </div>
            
            {/* Price */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary">
                <Tag className="w-4 h-4" />
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">يبدأ من</span>
              </div>
              <div className="font-bold text-sm truncate">{activeProject.price ? `${activeProject.price.toLocaleString()} ر.س` : "تواصل لمعرفة السعر"}</div>
            </div>

            {/* Area */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary">
                <Maximize2 className="w-4 h-4" />
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">المساحة</span>
              </div>
              <div className="font-bold text-sm truncate">{activeProject.area ? `${activeProject.area} م²` : "مساحات متنوعة"}</div>
            </div>
            
            {/* Status */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-green-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">الحالة</span>
              </div>
              <div className="font-bold text-sm truncate text-green-400">
                {activeProject.status === "AVAILABLE" ? "متاح للبيع" : activeProject.status === "SOLD" ? "مباع" : activeProject.status === "COMING_SOON" ? "قريباً" : "مميز"}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href={`/projects/${activeProject.slug}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-cafe hover:bg-brand-coal text-white px-8 py-3.5 font-bold transition-all shadow-lg group [clip-path:polygon(0_0,calc(100%-16px)_0,100%_16px,100%_100%,0_100%)]"
            >
              عرض التفاصيل
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            {whatsappUrl && (
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 font-bold transition-all backdrop-blur-sm [clip-path:polygon(0_0,calc(100%-16px)_0,100%_16px,100%_100%,0_100%)]"
              >
                تواصل معنا
              </a>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Cards Slider */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pb-8 pt-8 lg:pt-0 mt-8">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
          {displayProjects.map((project, idx) => (
            <button 
              key={project.id}
              onClick={() => setActiveIndex(idx)}
              className={`group relative flex items-center gap-4 p-3 rounded-2xl text-right transition-all duration-700 w-[260px] flex-shrink-0 snap-center
                ${idx === activeIndex ? 'bg-white/10 border border-[#D4AF37]/40 backdrop-blur-md shadow-lg' : 'bg-[#050505]/30 hover:bg-[#050505]/50 border border-transparent backdrop-blur-sm'}
              `}
            >
              {idx === activeIndex && (
                <div className="absolute top-0 right-0 w-full h-[2px] bg-white/10 rounded-t-2xl overflow-hidden origin-right">
                  <div 
                    key={`progress-${activeIndex}`}
                    className="h-full bg-brand-cafe w-full"
                    style={{ animation: "progressAnim 6s linear forwards" }}
                  />
                </div>
              )}
              
              <div className="w-14 h-14 rounded-xl overflow-hidden relative flex-shrink-0 bg-[#050505]">
                <Image 
                  src={project.mainImage || "/images/placeholder.jpg"} 
                  alt={project.name}
                  fill
                  sizes="56px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm truncate transition-colors duration-700">{project.name}</div>
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 truncate transition-colors duration-700">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{project.city || "المملكة العربية السعودية"}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Global styles for animations and scrollbar hiding */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progressAnim {
          0% { transform: scaleX(0); transform-origin: right; }
          100% { transform: scaleX(1); transform-origin: right; }
        }
        @keyframes subtleZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
        @keyframes fadeSlideSoft {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
}
