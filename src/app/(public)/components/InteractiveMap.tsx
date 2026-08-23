'use client';

import React from 'react';
import { HomePageContent } from '@prisma/client';
import dynamic from 'next/dynamic';
import { ProjectMapItem } from './map/GeographicMap';

const GeographicMap = dynamic(() => import('./map/GeographicMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-[#f7f3eb] rounded-[24px] flex items-center justify-center animate-pulse">
      <div className="text-center text-[#a6937c] font-bold text-sm">جاري تحميل خريطة تواجدنا في المملكة...</div>
    </div>
  ),
});

interface InteractiveMapProps {
  content?: HomePageContent | null;
  projects?: ProjectMapItem[];
}

export default function InteractiveMap({ content, projects = [] }: InteractiveMapProps) {
  if (content?.showMapSection === false) return null;

  const sectionBadge = 'خريطة المشاريع';
  const sectionTitle = content?.mapSectionTitle || 'تواجدنا في المملكة';
  const sectionDesc =
    content?.mapSectionDesc ||
    'مشاريعنا منتشرة في مختلف مناطق المملكة، نساهم في التنمية والازدهار';

  return (
    <section className="py-16 md:py-20 bg-white relative overflow-hidden" dir="rtl" id="map-section">
      <div className="w-full max-w-[1280px] mx-auto px-6 relative z-10">
        {/* Section Header (Matching Elementor 305.json) */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14 relative z-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#A6937C]/10 text-[#A6937C] text-sm font-bold mb-3 tracking-wide">
            {sectionBadge}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {sectionTitle}
          </h2>
          <p className="text-gray-500 text-base md:text-lg">
            {sectionDesc}
          </p>
        </div>

        {/* Map Container (Matching PUIUX Maps Elementor Port) */}
        <div className="w-full">
          <GeographicMap content={content} projects={projects} />
        </div>
      </div>
    </section>
  );
}
