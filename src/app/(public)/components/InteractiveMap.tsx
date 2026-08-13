'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HomePageContent } from '@prisma/client';
import dynamic from 'next/dynamic';
import { ProjectMapItem } from './map/GeographicMap';

const GeographicMap = dynamic(() => import('./map/GeographicMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#EBE7DF] rounded-[2rem] md:rounded-[3rem] animate-pulse" />
});

interface InteractiveMapProps {
  content?: HomePageContent | null;
  projects?: ProjectMapItem[];
}

export default function InteractiveMap({ content, projects = [] }: InteractiveMapProps) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const STATUS_FILTERS = [
    { id: 'ALL', label: 'الكل', color: content?.pinColorDefault || '#4E4949' },
    { id: 'AVAILABLE', label: 'متاح', color: content?.pinColorAvailable || '#B5B693' }, 
    { id: 'SOLD', label: 'مباع', color: content?.pinColorSold || '#4E4949' }, 
    { id: 'COMING_SOON', label: 'قريباً', color: content?.pinColorComingSoon || '#C5B59C' }, 
    { id: 'UNDER_CONSTRUCTION', label: 'تحت الإنشاء', color: content?.pinColorUnderConstruction || '#A6937C' },
  ];

  if (content?.showMapSection === false) return null;

  const filteredProjects = activeFilter === 'ALL' 
    ? projects 
    : projects.filter(p => p.status === activeFilter);

  const mapMode = content?.mapMode || 'geographic';

  return (
    <section className="py-20 bg-white relative overflow-hidden" dir="rtl" id="map-section">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative z-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#A6937C]/10 text-[#A6937C] text-sm font-bold mb-4 tracking-wide">
            {content?.mapSectionTitle || "تواجدنا في المملكة"}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            مشاريعنا الاستثنائية
          </h2>
          <p className="text-gray-500 text-lg">
            {content?.mapSectionDesc || "تصفح مشاريعنا العقارية المنتشرة في أفضل أحياء المملكة والمختارة بعناية."}
          </p>
        </div>

        {/* Map Wrapper */}
        <div className="relative w-full aspect-[4/5] md:aspect-[16/9] lg:aspect-[2/1] rounded-[2rem] md:rounded-[3rem] bg-[#EBE7DF] border border-white/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center z-10">
          
          {mapMode === 'geographic' ? (
            <GeographicMap content={content} projects={projects} activeFilter={activeFilter} />
          ) : (
            <>
              {/* Background Layer: Pattern (Behind the map) */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" 
                   style={{ 
                     backgroundImage: 'radial-gradient(#A49783 2px, transparent 2px)', 
                     backgroundSize: '40px 40px' 
                   }} />

              {/* Map Layer (Image-based fallback) */}
              <div 
                className="absolute inset-0 bg-cover bg-center pointer-events-none"
                style={{ 
                  backgroundImage: `url(${content?.mapBackgroundImage || '/images/naht-map-background.png'})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  opacity: 1 
                }}
              />



              {/* Image Map Markers */}
              {filteredProjects.map((project) => {
                if (!project.mapX || !project.mapY) return null;
                const filterMatch = STATUS_FILTERS.find(f => f.id === project.status);
                const color = filterMatch?.color || '#A6937C';

                return (
                  <div
                    key={project.slug}
                    className="absolute z-40 group"
                    style={{ 
                      left: `${project.mapX}%`, 
                      top: `${project.mapY}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onMouseEnter={() => setHoveredProject(project.slug)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    <div 
                      className="relative rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer overflow-hidden"
                      style={{ 
                        backgroundColor: color, 
                        width: '40px', 
                        height: '40px'
                      }}
                    >
                      {content?.pinLogoUrl ? (
                        <Image
                          src={content.pinLogoUrl}
                          alt="Pin Logo"
                          width={content.pinLogoSize || 32}
                          height={content.pinLogoSize || 32}
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-4 h-4 bg-white rounded-full shadow-inner" />
                      )}
                      
                      {/* Pulse Ring */}
                      <div className="absolute -z-10 w-full h-full rounded-full animate-ping opacity-30" style={{ backgroundColor: color }}></div>
                    </div>

                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100 transition-all duration-300 origin-bottom ${hoveredProject === project.slug ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                      <div className="relative h-32 w-full overflow-hidden">
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${project.mainImage})` }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-3 right-3 flex gap-2">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold rounded-full shadow-sm">
                            {project.status === 'SOLD' ? 'مباع' : project.status === 'COMING_SOON' ? 'قريباً' : project.status === 'UNDER_CONSTRUCTION' ? 'تحت الإنشاء' : 'متاح'}
                          </span>
                          <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-sm border border-white/20">{project.type || 'فيلا'}</span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{project.name}</h3>
                          <p className="text-sm text-gray-500 font-medium">{project.city || project.locationText}</p>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm border border-gray-100">
                          {project.area && (
                            <div className="flex flex-col"><span className="text-xs text-gray-400">المساحة</span><span className="font-bold text-gray-700">{project.area} م²</span></div>
                          )}
                          {(project.area && project.price) && <div className="w-px h-6 bg-gray-200" />}
                          {project.price && (
                            <div className="flex flex-col"><span className="text-xs text-gray-400">يبدأ من</span><span className="font-bold text-[#A6937C]">{project.price.toLocaleString()} ر.س</span></div>
                          )}
                        </div>
                        <Link href={`/projects/${project.slug}`} className="w-full mt-1 py-2.5 bg-[#A6937C] text-white text-center rounded-xl font-bold text-sm hover:bg-[#8e7d69] transition-colors shadow-md">عرض التفاصيل</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Left Side Floating Panels (Desktop & Tablet) */}
          <div className="absolute top-6 left-6 md:top-8 md:left-8 z-[1000] flex flex-col gap-4 hidden sm:flex pointer-events-auto">
            {/* Filter Box */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/40 w-48">
              <h3 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">تصفية حسب الحالة</h3>
              <div className="flex flex-col gap-2">
                {STATUS_FILTERS.map(filter => (
                  <button 
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                      activeFilter === filter.id 
                        ? "bg-gray-100 text-gray-900 shadow-sm" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: filter.color }}></span>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend Box */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/40 w-48">
              <h3 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">شرح الألوان</h3>
              <div className="flex flex-col gap-2">
                {STATUS_FILTERS.filter(f => f.id !== 'ALL').map((filter) => (
                  <div key={`legend-${filter.id}`} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: filter.color }} />
                    <span className="text-xs font-medium text-[#4E4949]">{filter.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:hidden relative z-20">
          {STATUS_FILTERS.map(filter => (
            <button 
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                activeFilter === filter.id 
                  ? "bg-white text-gray-900 shadow-md border-transparent" 
                  : "bg-transparent text-gray-500 border-gray-300 hover:bg-white"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: filter.color }}></span>
              {filter.label}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
