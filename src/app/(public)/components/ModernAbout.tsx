import React from "react";
import Image from "next/image";
import { HomePageContent } from "@prisma/client";

interface ModernAboutProps {
  content: HomePageContent | null;
}

export default function ModernAbout({ content }: ModernAboutProps) {
  const sectionTitle = content?.aboutBriefTitle || "عن نحت العقارية";
  const sectionHeadline =
    content?.aboutBriefText ||
    "نقدم حلولاً عقارية احترافية وفرصاً استثمارية مدروسة ترتقي بمستقبل المجتمعات العمرانية.";
  const missionTitle = "رسالتنا";
  const missionText =
    "تقديم حلول عقارية مخصصة تلبي تطلعاتك الاستثمارية ومبنية على الشفافية والمعرفة العميقة بحركة السوق.";
  const visionTitle = "رؤيتنا";
  const visionText =
    "الريادة في تطوير المجتمعات السكنية والاستثمارية عبر حلول ابتكارية ومستدامة.";

  return (
    <section id="about" className="py-20 md:py-28 bg-[#F7F3EB] relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#A6937C]/15 text-[#A6937C] text-xs font-bold mb-4 uppercase tracking-wider">
            {sectionTitle}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#4F4949] leading-snug">
            {sectionHeadline}
          </h2>
          {content?.aboutBriefImage && (
            <div className="mt-8 relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-md">
              <Image
                src={content.aboutBriefImage}
                alt={sectionTitle}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-[#A6937C]/15 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#F7F3EB] border border-[#A6937C]/20 flex items-center justify-center text-[#A6937C]">
              <svg className="w-6 h-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#4F4949]">{missionTitle}</h3>
            <p className="text-[#4F4949]/80 text-sm leading-relaxed font-light">{missionText}</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#A6937C]/15 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#F7F3EB] border border-[#A6937C]/20 flex items-center justify-center text-[#A6937C]">
              <svg className="w-6 h-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#4F4949]">{visionTitle}</h3>
            <p className="text-[#4F4949]/80 text-sm leading-relaxed font-light">{visionText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
