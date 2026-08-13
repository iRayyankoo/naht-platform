/* eslint-disable @next/next/no-img-element, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HomePageContent } from "@prisma/client";

const defaultImages = [
  "/images/hero/hero-1.jpg",
  "/images/hero/hero-2.jpg",
];

const DURATION = 7000;

interface ModernHeroProps {
  content?: HomePageContent | null;
}

export default function ModernHero({ content }: ModernHeroProps) {
  const rawImages = content?.heroBackgroundImage?.trim();
  const heroImages = rawImages
    ? rawImages.split("\n").map((u) => u.trim()).filter(Boolean)
    : defaultImages;

  const ctaText = content?.ctaButtonText || "استكشف المشاريع";
  const ctaUrl = content?.ctaButtonUrl || "/projects";
  const heroTitle = content?.heroTitle || null;
  const heroSubtitle = content?.heroSubtitle || null;

  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    let p = 0;
    progressRef.current = setInterval(() => {
      p += 100 / (DURATION / 40);
      setProgress(Math.min(p, 100));
    }, 40);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, DURATION);
  };

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 100);
    startTimers();
    return () => {
      clearTimeout(t);
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  useEffect(() => {
    startTimers();
  }, [current]);

  const goTo = (idx: number) => {
    if (idx !== current) setCurrent(idx);
  };

  return (
    <section className="relative w-full h-[100svh] min-h-[700px] overflow-hidden bg-black text-white select-none">
      {/* Background */}
      <div className="absolute inset-0">
        {heroImages.map((url, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-[2500ms] ease-in-out"
            style={{ opacity: idx === current ? 1 : 0, zIndex: idx === current ? 1 : 0 }}
          >
            <img
              src={url}
              alt=""
              loading={idx === 0 ? "eager" : "lazy"}
              fetchPriority={idx === 0 ? "high" : "auto"}
              className="w-full h-full object-cover"
              style={{
                transform: idx === current ? "scale(1.12)" : "scale(1.05)",
                transition: idx === current ? `transform ${DURATION + 2500}ms ease-out` : "none",
                filter: "brightness(0.42) saturate(0.8)",
              }}
            />
          </div>
        ))}

        {/* Gradient layers */}
        <div
          className="absolute inset-0 z-10"
          style={{ background: "linear-gradient(to top, #000 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.1) 65%, rgba(0,0,0,0.4) 100%)" }}
        />
        <div
          className="absolute inset-0 z-10 hidden md:block"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)" }}
        />

        {/* Gold accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] z-20"
          style={{ background: "linear-gradient(to right, transparent, #b5993b, #e4c76b, #b5993b, transparent)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-between pt-24 pb-12 md:pt-0 md:pb-0 md:justify-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          {/* Brand tag */}
          <div
            className="flex items-center gap-4 mb-8 md:mb-12"
            style={{ opacity: isLoaded ? 1 : 0, transform: isLoaded ? "none" : "translateY(-10px)", transition: "opacity 1s ease 0.2s, transform 1s ease 0.2s" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-[#e4c76b]" />
              <div className="w-1 h-1 rounded-full bg-[#e4c76b] opacity-60" />
              <div className="w-1 h-1 rounded-full bg-[#e4c76b] opacity-30" />
            </div>
            <span className="text-[11px] md:text-xs font-bold tracking-[0.35em] text-[#e4c76b]/90 uppercase">
              نحت للأصول العقارية
            </span>
            <div className="h-px flex-1 max-w-[60px] bg-[#e4c76b]/30" />
          </div>

          {/* Heading */}
          <div
            style={{ opacity: isLoaded ? 1 : 0, transform: isLoaded ? "none" : "translateY(30px)", transition: "opacity 1s ease 0.35s, transform 1s ease 0.35s" }}
          >
            {heroTitle ? (
              <h1
                className="font-black leading-[1.0] tracking-tight mb-6 md:mb-8"
                style={{ fontSize: "clamp(3rem, 7vw, 6.5rem)", textShadow: "0 2px 40px rgba(0,0,0,0.6)" }}
              >
                {heroTitle}
              </h1>
            ) : (
              <h1
                className="font-black leading-[1.0] tracking-tight mb-6 md:mb-8"
                style={{ fontSize: "clamp(3rem, 7vw, 6.5rem)", textShadow: "0 2px 40px rgba(0,0,0,0.6)" }}
              >
                <span className="block font-thin text-white/70 mb-1" style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.8rem)", letterSpacing: "0.12em" }}>
                  نصنع المستقبل
                </span>
                <span className="block">نبني مساحات</span>
                <span className="block relative inline-block">
                  <span>تلهم الحياة</span>
                </span>
              </h1>
            )}
          </div>

          {/* Subtitle */}
          <div
            style={{ opacity: isLoaded ? 1 : 0, transform: isLoaded ? "none" : "translateY(20px)", transition: "opacity 1s ease 0.5s, transform 1s ease 0.5s" }}
          >
            <p className="text-base md:text-lg text-white/60 max-w-lg leading-relaxed mb-10 md:mb-14 font-light">
              {heroSubtitle || "نقدم حلولاً عقارية استثنائية بتصاميم مدروسة ومواقع استراتيجية توفر قيمة حقيقية ومستدامة."}
            </p>
          </div>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-start gap-4"
            style={{ opacity: isLoaded ? 1 : 0, transform: isLoaded ? "none" : "translateY(20px)", transition: "opacity 1s ease 0.65s, transform 1s ease 0.65s" }}
          >
            <Link
              href={ctaUrl}
              className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 text-sm font-bold tracking-[0.15em] uppercase text-black transition-all duration-500 hover:-translate-y-1 bg-[#B5B693]"
            >
              <span className="relative z-10">{ctaText}</span>
            </Link>
            <Link
              href="/#about"
              className="group flex items-center gap-3 px-8 py-4 text-sm font-bold tracking-[0.15em] uppercase text-white/80 border border-white/20 backdrop-blur-sm transition-all duration-500 hover:border-white/50 hover:text-white hover:-translate-y-1 hover:bg-white/5"
            >
              عن الشركة
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Controls */}
      <div className="absolute bottom-8 md:bottom-10 left-6 md:left-12 z-30 flex items-center gap-6">
        {heroImages.map((_, idx) => (
          <button key={idx} onClick={() => goTo(idx)} className="group flex flex-col gap-2 items-start">
            <span className={`text-[10px] font-bold tracking-[0.2em] transition-colors duration-300 ${idx === current ? "text-[#e4c76b]" : "text-white/25 group-hover:text-white/50"}`}>
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="w-10 h-[1.5px] bg-white/15 rounded-full overflow-hidden">
              {idx === current ? (
                <div className="h-full bg-[#e4c76b] rounded-full" style={{ width: `${progress}%`, transition: "width 40ms linear" }} />
              ) : (
                <div className="h-full w-0 group-hover:w-full bg-white/30 rounded-full transition-all duration-700" />
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
