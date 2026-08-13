'use client';

import React, { useSyncExternalStore, useState, useMemo, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import Image from 'next/image';
import { HomePageContent } from '@prisma/client';

export interface ProjectMapItem {
  id: string;
  slug: string;
  name: string;
  status: string;
  type?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  mapLat: number | null;
  mapLng: number | null;
  mainImage?: string | null;
  isVisible?: boolean;
  showOnHomeMap?: boolean;
  mapX?: number | null;
  mapY?: number | null;
  locationText?: string | null;
  area?: number | null;
  price?: number | null;
}

interface GeographicMapProps {
  content?: HomePageContent | null;
  projects: ProjectMapItem[];
  activeFilter: string;
}

const MARKER_ICONS: Record<string, string> = {
  AVAILABLE: '/images/markers/available.svg',
  SOLD: '/images/markers/sold.svg',
  COMING_SOON: '/images/markers/soon.svg',
  UNDER_CONSTRUCTION: '/images/markers/under-sale.svg',
};

function getMarkerIcon(status: string | null | undefined): L.Icon {
  const s = (status || '').toUpperCase().trim();
  let iconUrl = MARKER_ICONS.AVAILABLE;
  if (s.includes('SOLD') || s.includes('مباع')) {
    iconUrl = MARKER_ICONS.SOLD;
  } else if (s.includes('SOON') || s.includes('قريباً')) {
    iconUrl = MARKER_ICONS.COMING_SOON;
  } else if (s.includes('UNDER') || s.includes('إنشاء') || s.includes('CONSTRUCTION')) {
    iconUrl = MARKER_ICONS.UNDER_CONSTRUCTION;
  }

  return L.icon({
    iconUrl,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
    className: 'leaflet-marker-bounce transition-transform hover:scale-110',
  });
}

const emptySubscribe = () => () => {};

function MapController({ validPositions, defaultCenter, defaultZoom }: { validPositions: [number, number][]; defaultCenter: [number, number]; defaultZoom: number }) {
  const map = useMap();

  const handleRecenter = useCallback(() => {
    if (validPositions.length > 0) {
      const bounds = L.latLngBounds(validPositions);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else {
      map.setView(defaultCenter, defaultZoom);
    }
  }, [map, validPositions, defaultCenter, defaultZoom]);

  useEffect(() => {
    if (validPositions.length > 0) {
      const bounds = L.latLngBounds(validPositions);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [map, validPositions]);

  return (
    <div className="absolute top-4 left-4 z-[1000]">
      <button
        onClick={handleRecenter}
        type="button"
        className="px-3.5 py-2 bg-white/95 backdrop-blur-md text-[#4f4949] font-bold text-xs rounded-xl shadow-md border border-gray-200 hover:bg-[#a6937c] hover:text-white transition-all flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>إعادة التمركز</span>
      </button>
    </div>
  );
}

function SafeZoomControl() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const control = L.control.zoom({ position: 'bottomright' });
    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map]);

  return null;
}

export default function GeographicMap({ content, projects = [], activeFilter }: GeographicMapProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [tileError, setTileError] = useState(false);

  const validProjects = useMemo(() => {
    return (projects || []).filter((p) => {
      const isVisible = p.isVisible === true;
      const isShowOnHomeMap = p.showOnHomeMap === true;
      const filterMatch = activeFilter === 'ALL' || p.status === activeFilter;
      const lat = Number(p.mapLat);
      const lng = Number(p.mapLng);
      const hasValidCoords = Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && lat !== 0 && lng !== 0;
      return isVisible && isShowOnHomeMap && filterMatch && hasValidCoords;
    });
  }, [projects, activeFilter]);

  const validPositions = useMemo(() => {
    return validProjects.map((p) => [Number(p.mapLat), Number(p.mapLng)] as [number, number]);
  }, [validProjects]);

  const defaultCenter: [number, number] = [content?.mapCenterLat || 24.7136, content?.mapCenterLng || 46.6753];
  const defaultZoom = content?.mapZoom || 11;

  if (!mounted) {
    return (
      <div className="w-full h-full bg-[#F7F3EB] rounded-[2rem] flex items-center justify-center animate-pulse">
        <div className="text-center text-[#a6937c] font-bold text-sm">جاري تحميل الخريطة التفاعلية...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-[#F7F3EB]">
      {/* Empty State Fallback */}
      {validProjects.length === 0 && (
        <div className="absolute inset-0 z-[1001] bg-[#F7F3EB]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#a6937c]/10 text-[#a6937c] flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-[#4f4949]">لا تتوفر مشاريع خريطة مطابقة للتصفية الحالية</h4>
          <p className="text-xs text-gray-500 mt-1">تأكد من اختيار تصفية مختلفة أو استكمال الإحداثيات من لوحة CRM.</p>
        </div>
      )}

      {/* Tile Loading Error Fallback */}
      {tileError && (
        <div className="absolute bottom-4 right-4 z-[1002] bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
          تنبيه: يتعذر تحميل بعض بلاطات الخريطة من الخادم، يتم استخدام النمط البديل.
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        minZoom={4}
        maxZoom={18}
        style={{ width: '100%', height: '100%', background: '#F7F3EB' }}
        zoomControl={false}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <SafeZoomControl />
        <MapController validPositions={validPositions} defaultCenter={defaultCenter} defaultZoom={defaultZoom} />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
          eventHandlers={{
            tileerror: () => setTileError(true),
          }}
        />

        {validProjects.map((project) => (
          <Marker
            key={project.id || project.slug}
            position={[Number(project.mapLat), Number(project.mapLng)]}
            icon={getMarkerIcon(project.status)}
          >
            <Popup className="custom-map-popup">
              <div className="p-1 min-w-[200px] text-right font-sans" dir="rtl">
                {project.mainImage && (
                  <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2">
                    <Image
                      src={project.mainImage}
                      alt={project.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <h4 className="font-bold text-sm text-[#4f4949] mb-1">{project.name}</h4>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                  <svg className="w-3.5 h-3.5 text-[#a6937c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>{project.city || 'الرياض'} - {project.neighborhood || project.locationText || 'حي متألق'}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  {project.area && (
                    <span className="text-gray-600 font-medium">المساحة: {project.area} م²</span>
                  )}
                  {project.price && (
                    <span className="font-bold text-[#a6937c]">{project.price.toLocaleString()} ر.س</span>
                  )}
                </div>
                <Link
                  href={`/projects/${project.slug}`}
                  className="mt-2.5 block w-full py-1.5 text-center text-xs font-bold text-white bg-[#a6937c] rounded-lg hover:bg-[#8e7d69] transition-colors"
                >
                  التفاصيل الكاملة
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
