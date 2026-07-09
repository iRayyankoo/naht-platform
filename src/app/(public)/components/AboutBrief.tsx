import Link from "next/link";
import { HomePageContent } from "@prisma/client";

export default function AboutBrief({ content }: { content: HomePageContent | null }) {
  if (!content?.aboutBriefTitle && !content?.aboutBriefText) {
    return null;
  }

  return (
    // Terracotta/clay section — مستوحى من المرجع البصري
    <section className="relative overflow-hidden bg-[#C4602A] text-white" dir="rtl">

      {/* Layered grid for the two-column layout (text + decorative) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">

        {/* Text Column */}
        <div className="relative z-10 flex flex-col justify-center px-8 md:px-14 lg:px-16 py-16 md:py-24 order-2 lg:order-1">

          {/* Overline */}
          <p className="text-xs font-bold tracking-[0.3em] text-white/60 uppercase mb-6">
            من نحن
          </p>

          {/* Big Title */}
          <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] tracking-tight mb-8">
            {content.aboutBriefTitle || "نبني المستقبل\nبرؤية أصيلة"}
          </h2>

          {/* Divider */}
          <div className="w-20 h-[3px] bg-white/40 mb-8" />

          {/* Text */}
          {content.aboutBriefText && (
            <p className="text-base md:text-lg text-white/80 leading-relaxed font-light mb-10 max-w-lg whitespace-pre-line">
              {content.aboutBriefText}
            </p>
          )}

          {/* CTA */}
          <Link
            href="/about"
            className="inline-flex items-center gap-4 text-white font-bold uppercase tracking-widest text-sm group w-fit border-b-2 border-white/40 hover:border-white pb-2 transition-colors duration-300"
          >
            <span>اكتشف رؤيتنا</span>
            <svg className="w-5 h-5 rtl:rotate-180 transition-transform group-hover:-translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Decorative / Image Column */}
        <div className="relative order-1 lg:order-2 min-h-[300px] lg:min-h-[500px] overflow-hidden bg-[#B85525]">

          {/* Image if available */}
          {content.aboutBriefImage ? (
            <img
              src={content.aboutBriefImage}
              alt={content.aboutBriefTitle || "نحت العقارية"}
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity absolute inset-0"
            />
          ) : (
            // Decorative architectural pattern (no external images)
            <div className="absolute inset-0 flex items-end justify-end opacity-25">
              <svg viewBox="0 0 500 600" className="w-full h-full" fill="none" stroke="white" strokeWidth="0.8">
                {/* Traditional Saudi architecture silhouette */}
                <rect x="80" y="420" width="340" height="180" />
                <rect x="140" y="360" width="60" height="60" />
                <rect x="220" y="320" width="60" height="100" />
                <rect x="300" y="360" width="60" height="60" />
                {/* Arches */}
                <path d="M80 420 L80 380 Q110 340 140 380 L140 420" />
                <path d="M160 420 L160 380 Q200 330 240 380 L240 420" />
                <path d="M260 420 L260 380 Q300 330 340 380 L340 420" />
                <path d="M360 420 L360 380 Q390 340 420 380 L420 420" />
                {/* Towers */}
                <rect x="100" y="260" width="40" height="120" />
                <path d="M100 260 L120 220 L140 260" />
                <rect x="360" y="260" width="40" height="120" />
                <path d="M360 260 L380 220 L400 260" />
                {/* Windows */}
                <rect x="108" y="280" width="12" height="18" rx="6" />
                <rect x="108" y="310" width="12" height="18" rx="6" />
                <rect x="368" y="280" width="12" height="18" rx="6" />
                <rect x="368" y="310" width="12" height="18" rx="6" />
                {/* Gate */}
                <path d="M210 540 L210 460 Q250 420 290 460 L290 540" />
                {/* Stars/crescent decorative */}
                <circle cx="250" cy="150" r="30" />
                <circle cx="250" cy="150" r="20" />
                <path d="M235 145 Q250 130 265 145" />
                {/* Horizontal lines */}
                <line x1="60" y1="540" x2="440" y2="540" />
                <line x1="40" y1="560" x2="460" y2="560" />
              </svg>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#B85525]/40 to-transparent" />

          {/* Floating decorative text */}
          <div className="absolute bottom-8 right-8 text-right">
            <p className="text-7xl md:text-8xl font-black text-white/10 leading-none select-none" dir="rtl">
              نحت
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}
