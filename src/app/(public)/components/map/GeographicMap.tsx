'use client';

import React, { useSyncExternalStore, useState, useMemo, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './puiux-maps.css';
import Link from 'next/link';
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
  activeFilter?: string;
  onFilterChange?: (filterId: string) => void;
}

export const MAP_STATUS_OPTIONS = [
  { id: 'all', label: 'الكل', color: '#575252', slug: 'all' },
  { id: '%d8%aa%d8%ad%d8%aa-%d8%a7%d9%84%d8%aa%d9%86%d9%81%d9%8a%d8%b0', label: 'تحت التنفيذ', color: '#b9ba99', slug: 'under_construction_parent' },
  { id: '%d8%aa%d8%ad%d8%aa-%d8%a7%d9%84%d8%aa%d9%86%d9%81%d9%8a%d8%b0-%d8%aa%d8%ad%d8%aa-%d8%a7%d9%84%d8%aa%d9%86%d9%81%d9%8a%d8%b0', label: 'تحت التنفيذ', color: '#b9ba99', slug: 'under_construction_child' },
  { id: 'soon', label: 'قريباً', color: '#ab9983', slug: 'soon' },
  { id: 'sold', label: 'مباع', color: '#585252', slug: 'sold' },
  { id: 'available', label: 'متاح', color: '#b9ba99', slug: 'available' },
];

export const MAP_LEGEND_ITEMS = [
  { id: 'leg-1', label: 'تحت التنفيذ', color: '#b9ba99' },
  { id: 'leg-2', label: 'تحت التنفيذ', color: '#b9ba99' },
  { id: 'leg-3', label: 'قريباً', color: '#ab9983' },
  { id: 'leg-4', label: 'مباع', color: '#585252' },
  { id: 'leg-5', label: 'متاح', color: '#b9ba99' },
];

// Helper to construct DivIcon matching PUIUXMap.createIcon from map.js
function createPuiuxDivIcon(status: string | null | undefined, pinLogoUrl: string, slug?: string): L.DivIcon {
  const s = (status || '').toUpperCase().trim();
  let color = '#b9ba99'; // available default
  if (s.includes('SOLD') || s.includes('مباع')) {
    color = '#585252';
  } else if (s.includes('SOON') || s.includes('قريباً')) {
    color = '#ab9983';
  } else if (s.includes('UNDER') || s.includes('إنشاء') || s.includes('CONSTRUCTION')) {
    color = '#b9ba99';
  }

  const logoSrc = pinLogoUrl || '/images/brand/naht-pin-logo.jpg';

  const html = `
    <div class="puiux-marker-container" data-slug="${slug || ''}">
      <svg class="puiux-marker-svg" width="40" height="52" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="${color}"/>
        <circle cx="12" cy="12" r="8" fill="white"/>
      </svg>
      <img src="${logoSrc}" alt="Logo" class="puiux-marker-logo" />
    </div>
  `;

  return L.divIcon({
    html,
    className: 'puiux-custom-marker',
    iconSize: [40, 52],
    iconAnchor: [20, 52],
    popupAnchor: [0, -52],
  });
}

function MapController({ validPositions, defaultCenter, defaultZoom }: { validPositions: [number, number][]; defaultCenter: [number, number]; defaultZoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (validPositions.length > 1) {
      const bounds = L.latLngBounds(validPositions);
      map.fitBounds(bounds.pad(0.1));
    } else if (validPositions.length === 1) {
      map.setView(validPositions[0], defaultZoom);
    }
    // When validPositions.length === 0, do not reset or fitBounds. Keep current center & zoom.
  }, [map, validPositions, defaultCenter, defaultZoom]);

  return null;
}

const emptySubscribe = () => () => {};

export default function GeographicMap({ content, projects = [], activeFilter: controlledFilter, onFilterChange }: GeographicMapProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [internalFilter, setInternalFilter] = useState('all');

  const activeFilter = controlledFilter !== undefined ? controlledFilter : internalFilter;

  const handleFilterSelect = useCallback((filterId: string) => {
    setInternalFilter(filterId);
    if (onFilterChange) {
      onFilterChange(filterId);
    }
  }, [onFilterChange]);

  const defaultCenter: [number, number] = [content?.mapCenterLat || 24.7136, content?.mapCenterLng || 46.6753];
  const defaultZoom = content?.mapZoom || 12;
  const pinLogoUrl = content?.pinLogoUrl || '/images/brand/naht-pin-logo.jpg';

  // Filter projects according to official WordPress filter matching
  const validProjects = useMemo(() => {
    return (projects || []).filter((p) => {
      const isVisible = p.isVisible === true;
      const isShowOnHomeMap = p.showOnHomeMap === true;
      const lat = Number(p.mapLat);
      const lng = Number(p.mapLng);
      const hasValidCoords = Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;

      if (!isVisible || !isShowOnHomeMap || !hasValidCoords) return false;

      if (activeFilter === 'all') return true;

      // The dual 'تحت التنفيذ' filters: no records currently assigned in source (returns 0)
      if (activeFilter === '%d8%aa%d8%ad%d8%aa-%d8%a7%d9%84%d8%aa%d9%86%d9%81%d9%8a%d8%b0' ||
          activeFilter === '%d8%aa%d8%ad%d8%aa-%d8%a7%d9%84%d8%aa%d9%86%d9%81%d9%8a%d8%b0-%d8%aa%d8%ad%d8%aa-%d8%a7%d9%84%d8%aa%d9%86%d9%81%d9%8a%d8%b0' ||
          activeFilter === 'under_construction') {
        return false;
      }

      if (activeFilter === 'available' || activeFilter === 'AVAILABLE') {
        return p.status === 'AVAILABLE';
      }

      if (activeFilter === 'sold' || activeFilter === 'SOLD') {
        return p.status === 'SOLD';
      }

      if (activeFilter === 'soon' || activeFilter === 'SOON' || activeFilter === 'COMING_SOON') {
        return p.status === 'COMING_SOON' || p.status === 'SOON';
      }

      return false;
    });
  }, [projects, activeFilter]);

  const validPositions = useMemo(() => {
    return validProjects.map((p) => [Number(p.mapLat), Number(p.mapLng)] as [number, number]);
  }, [validProjects]);

  if (!mounted) {
    return (
      <div className="puiux-map-port w-full h-[600px] flex items-center justify-center animate-pulse">
        <div className="text-center text-[#a6937c] font-bold text-sm">جاري تحميل خريطة تواجدنا في المملكة...</div>
      </div>
    );
  }

  return (
    <div className="puiux-map-port" id="puiux-maps-root">
      <div className="puiux-maps-inner">
        {/* Leaflet Map */}
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          minZoom={4}
          maxZoom={19}
          className="puiux-maps-map"
          zoomControl={false}
          scrollWheelZoom={true}
          touchZoom={true}
          attributionControl={false}
        >
          <MapController validPositions={validPositions} defaultCenter={defaultCenter} defaultZoom={defaultZoom} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {validProjects.map((project) => {
            const statusSlug = project.status.toLowerCase();
            const statusLabel =
              statusSlug.includes('sold') ? 'مباع' :
              statusSlug.includes('soon') ? 'قريباً' :
              statusSlug.includes('under') ? 'تحت التنفيذ' : 'متاح';
            const statusClass =
              statusSlug.includes('sold') ? 'sold' :
              statusSlug.includes('soon') ? 'soon' :
              statusSlug.includes('under') ? 'under_sale' : 'available';

            const displayId = project.id;
            const hasImage = Boolean(project.mainImage);
            const areaDisplay = project.area ? `${project.area.toLocaleString('ar-SA')} م²` : null;

            return (
              <Marker
                key={project.id || project.slug}
                position={[Number(project.mapLat), Number(project.mapLng)]}
                icon={createPuiuxDivIcon(project.status, pinLogoUrl, project.slug)}
              >
                <Popup className="puiux-maps-popup-container" maxWidth={300}>
                  <div className="puiux-maps-popup">
                    {/* Thumbnail if available */}
                    {hasImage && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={project.mainImage!}
                        alt={project.name}
                        className="puiux-maps-popup-image"
                        loading="lazy"
                      />
                    )}
                    <div className="puiux-maps-popup-content">
                      <h3 className="puiux-maps-popup-title">{project.name}</h3>
                      <div className="puiux-maps-popup-meta">
                        <span className={`puiux-maps-popup-status ${statusClass}`}>{statusLabel}</span>
                        <span className="puiux-maps-popup-id">#{displayId}</span>
                      </div>

                      {(project.price || areaDisplay) ? (
                        <div className="puiux-maps-popup-details">
                          {project.price ? (
                            <span className="puiux-maps-popup-detail">💰 {project.price.toLocaleString('ar-SA')} ر.س</span>
                          ) : null}
                          {areaDisplay ? (
                            <span className="puiux-maps-popup-detail">📐 {areaDisplay}</span>
                          ) : null}
                        </div>
                      ) : null}

                      <Link href={`/projects/${project.slug}`} className="puiux-maps-popup-link">
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Filter Panel (Top-Left in RTL, matching official site) */}
        <div className="puiux-maps-filter-panel" data-testid="map-filter-panel">
          <h3>
            <span className="puiux-maps-filter-icon">◉</span>
            تصفية حسب الحالة
          </h3>
          <div className="puiux-maps-radio-group">
            {MAP_STATUS_OPTIONS.map((opt) => (
              <label key={opt.id} className={`puiux-maps-radio-item ${activeFilter === opt.id ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="puiux-status-map-1"
                  value={opt.id}
                  checked={activeFilter === opt.id}
                  onChange={() => handleFilterSelect(opt.id)}
                />
                {opt.id !== 'all' && (
                  <span className="puiux-maps-status-dot" style={{ backgroundColor: opt.color }} />
                )}
                <span className="puiux-maps-radio-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Floating Legend (Bottom-Left in RTL, matching official site) */}
        <div className="puiux-maps-legend" data-testid="map-legend">
          <h3>
            <span className="puiux-maps-legend-icon" style={{ color: '#ab9983' }}>●</span>
            شرح الألوان
          </h3>
          <div className="puiux-maps-legend-items">
            {MAP_LEGEND_ITEMS.map((item) => (
              <div key={item.id} className="puiux-maps-legend-item">
                <svg width="20" height="28" viewBox="0 0 24 32" fill="none">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill={item.color} />
                  <circle cx="12" cy="12" r="5" fill="white" />
                </svg>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* No Results Fallback if filter has 0 items */}
        {validProjects.length === 0 && (
          <div className="puiux-maps-no-results">
            <div className="puiux-maps-no-results-icon">📍</div>
            <div className="puiux-maps-no-results-text">لا توجد وحدات مطابقة</div>
          </div>
        )}
      </div>
    </div>
  );
}
