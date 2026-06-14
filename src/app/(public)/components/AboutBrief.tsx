import Link from "next/link";
import { HomePageContent } from "@prisma/client";

export default function AboutBrief({ content }: { content: HomePageContent | null }) {
  if (!content?.aboutBriefTitle && !content?.aboutBriefText) {
    return null;
  }

  return (
    <section className="py-32 bg-[#0A0A0A] text-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
        <div className="lg:col-span-5 order-2 lg:order-1 relative z-10">
          <div className="w-24 h-[2px] bg-primary mb-12"></div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-10 leading-[1.1] tracking-tight">{content.aboutBriefTitle}</h2>
          <p className="text-xl md:text-2xl text-gray-400 leading-relaxed mb-16 whitespace-pre-line font-light">{content.aboutBriefText}</p>
          <Link href="/about" className="inline-flex items-center gap-4 text-white hover:text-primary font-bold uppercase tracking-widest transition-colors group">
            <span className="border-b border-white group-hover:border-primary pb-2 transition-colors">اكتشف رؤيتنا</span>
            <svg className="w-6 h-6 rtl:rotate-180 transition-transform group-hover:-translate-x-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </Link>
        </div>
        
        {content.aboutBriefImage && (
          <div className="lg:col-span-7 order-1 lg:order-2 relative">
            <div className="absolute -inset-4 border border-white/10 z-0 hidden lg:block"></div>
            <div className="absolute -inset-8 border border-white/5 z-0 hidden lg:block"></div>
            <div className="relative aspect-[4/3] w-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-[2s] ease-out z-10">
              <img src={content.aboutBriefImage} alt="About Us" className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[2s] ease-out" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
