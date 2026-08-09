/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-unused-vars */
import React from "react";

import { HomePageContent } from "@prisma/client";


interface ModernAboutProps {
  content: HomePageContent | null;
}

export default function ModernAbout({ content: _content }: ModernAboutProps) {

  const stats: { label: string; value: string; icon: string }[] = [];

  const sectionTitle    = "من نحن";
  const sectionHeadline = "نقدم حلولاً عقارية احترافية وفرصاً استثمارية مدروسة تساعدك على اتخاذ القرار المناسب بثقة.";
  const aboutImage      = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
  const missionTitle    = "رسالتنا";
  const missionText     = "تقديم حلول عقارية مخصصة تلبي تطلعاتك الاستثمارية، مبنية على الثقة والوضوح والمعرفة العميقة بحركة السوق.";
  const visionTitle     = "رؤيتنا";
  const visionText      = "إعادة تعريف القطاع العقاري من خلال جعل عمليات بيع وشراء العقارات أكثر سلاسة، أماناً، وشفافية مطلقة.";


  return (
    <section id="about" className="py-16 bg-[#0b0f19] relative">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-10 md:mb-12">
          <div className="flex items-center gap-2 mb-6 justify-end">
            <span className="px-4 py-1.5 rounded-full border border-gray-800 bg-[#151a25] text-sm text-gray-300 font-medium">
              {sectionTitle}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight md:leading-snug max-w-4xl text-right ml-auto text-white">
            {sectionHeadline}
          </h2>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Stats Grid (Only if configured in CMS) */}
          {stats.length > 0 && (
            <div className="lg:col-span-5 grid grid-cols-2 grid-rows-2 gap-3 lg:gap-4 h-[320px]">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-[#151a25] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between hover:border-gray-600 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-800/50 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                    <span className="text-xs">{stat.icon}</span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl lg:text-3xl font-bold mb-1 text-white" dir="ltr">{stat.value}</h3>
                    <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Image */}
          <div className={stats.length > 0 ? "lg:col-span-7" : "lg:col-span-12"}>
            <div className="relative w-full h-[220px] md:h-[280px] lg:h-[320px] rounded-2xl overflow-hidden group">
              <img
                src={aboutImage}
                alt="Naht Real Estate"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19]/80 to-transparent"></div>
            </div>
          </div>


          {/* Mission & Vision — Full 12-col row */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">

            {/* Mission */}
            <div className="bg-[#151a25] border border-gray-800 rounded-3xl p-5 lg:p-6 flex flex-col items-start hover:border-gray-600 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center text-white mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </div>
              <h4 className="text-base font-bold mb-2 text-white">{missionTitle}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{missionText}</p>
            </div>

            {/* Vision */}
            <div className="bg-[#151a25] border border-gray-800 rounded-3xl p-5 lg:p-6 flex flex-col items-start hover:border-gray-600 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center text-white mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h4 className="text-base font-bold mb-2 text-white">{visionTitle}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{visionText}</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
