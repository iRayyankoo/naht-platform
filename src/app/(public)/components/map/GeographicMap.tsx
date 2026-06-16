'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { HomePageContent, Project } from '@prisma/client';

interface GeographicMapProps {
  content?: HomePageContent | null;
  projects: any[];
  activeFilter: string;
}

// Fix for default marker icon issues in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
  iconUrl: '/images/leaflet/marker-icon.png',
  shadowUrl: '/images/leaflet/marker-shadow.png',
});

// Custom Icons for different statuses
const createIcon = (color: string, logoUrl?: string | null, logoSize?: number | null) => {
  const size = logoSize || 32;
  const containerSize = size + 8; // extra padding for the pin circle
  
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="
        width: ${containerSize}px; 
        height: ${containerSize}px; 
        background: ${color}; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        border: 2px solid white;
        overflow: hidden;
      ">
        ${logoUrl ? `<img src="${logoUrl}" style="width: ${size}px; height: ${size}px; object-fit: contain;" />` : `<div style="width: 14px; height: 14px; background: white; border-radius: 50%;"></div>`}
      </div>
      <div class="absolute -z-10 w-full h-full rounded-full animate-ping opacity-30" style="background-color: ${color}"></div>
    `,
    iconSize: [containerSize, containerSize],
    iconAnchor: [containerSize / 2, containerSize / 2],
    popupAnchor: [0, -(containerSize / 2)],
  });
};

const getStatusColor = (status: string | null, content: any) => {
  switch (status) {
    case 'SOLD': return content?.pinColorSold || '#4E4949'; 
    case 'AVAILABLE': return content?.pinColorAvailable || '#B5B693'; 
    case 'COMING_SOON': return content?.pinColorComingSoon || '#C5B59C'; 
    case 'UNDER_CONSTRUCTION': return content?.pinColorUnderConstruction || '#A6937C'; 
    default: return content?.pinColorDefault || '#A6937C';
  }
};

const GeographicMap: React.FC<GeographicMapProps> = ({ content, projects, activeFilter }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full bg-[#EBE7DF] rounded-[2rem]" />; // Skeleton

  const filteredProjects = activeFilter === 'ALL' 
    ? projects 
    : projects.filter(p => p.status === activeFilter);

  const centerLat = content?.mapCenterLat || 24.7136;
  const centerLng = content?.mapCenterLng || 46.6753;
  const zoom = content?.mapZoom || 5;

  const tileFilters = `brightness(${content?.mapTileBrightness ?? 100}%) contrast(${content?.mapTileContrast ?? 100}%) saturate(${content?.mapTileSaturation ?? 100}%) hue-rotate(${content?.mapTileHue ?? 0}deg) grayscale(${content?.mapTileGrayscale ?? 0}%)`;

  return (
    <>
      <style>{`
        .custom-tile-layer {
          filter: ${tileFilters} !important;
        }
      `}</style>
      <MapContainer 
      center={[centerLat, centerLng]} 
      zoom={zoom} 
      style={{ width: '100%', height: '100%', background: '#EBE7DF' }}
      zoomControl={false}
      scrollWheelZoom={false}
      attributionControl={false} // Disable default, add custom
    >
      <ZoomControl position="bottomright" />
      {/* Light Luxury Theme - CartoDB Positron */}
      <TileLayer
        className="custom-tile-layer"
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {filteredProjects.map((project) => {
        if (!project.mapLat || !project.mapLng) return null;
        
        const color = getStatusColor(project.status, content);
        
        return (
          <Marker 
            key={project.slug} 
            position={[project.mapLat, project.mapLng]}
            icon={createIcon(color, content?.pinLogoUrl, content?.pinLogoSize)}
          >
            <Popup className="custom-leaflet-popup" closeButton={false}>
              <div className="w-64 bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 flex flex-col p-0">
                {/* Image Section */}
                <div className="relative h-32 w-full overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${project.mainImage})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold rounded-full shadow-sm">
                      {project.status === 'SOLD' ? 'مباع' : project.status === 'COMING_SOON' ? 'قريباً' : project.status === 'UNDER_CONSTRUCTION' ? 'تحت الإنشاء' : 'متاح'}
                    </span>
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-sm border border-white/20">
                      {project.type || 'فيلا'}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{project.city || project.locationText}</p>
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm border border-gray-100">
                    {project.area && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">المساحة</span>
                        <span className="font-bold text-gray-700">{project.area} م²</span>
                      </div>
                    )}
                    {(project.area && project.price) && <div className="w-px h-6 bg-gray-200" />}
                    {project.price && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">يبدأ من</span>
                        <span className="font-bold text-[#A6937C]">{project.price.toLocaleString()} ر.س</span>
                      </div>
                    )}
                  </div>

                  <Link 
                    href={`/projects/${project.slug}`}
                    className="w-full mt-1 py-2.5 bg-[#A6937C] text-white text-center rounded-xl font-bold text-sm hover:bg-[#8e7d69] transition-colors shadow-md"
                  >
                    عرض التفاصيل
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
      
      {/* Attribution repositioned */}
      <div className="absolute bottom-1 left-1 z-[1000] bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-gray-500 shadow-sm pointer-events-auto">
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="hover:text-primary">OSM</a>
        <span className="mx-1">•</span>
        <a href="https://carto.com/attributions" target="_blank" rel="noreferrer" className="hover:text-primary">CARTO</a>
      </div>
    </MapContainer>
    </>
  );
};

export default GeographicMap;
