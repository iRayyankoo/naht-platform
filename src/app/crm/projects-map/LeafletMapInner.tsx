"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapProjectItem } from "./MapManagerClient";

const MARKER_ICONS: Record<string, string> = {
  AVAILABLE: "/images/markers/available.svg",
  SOLD: "/images/markers/sold.svg",
  COMING_SOON: "/images/markers/soon.svg",
  UNDER_CONSTRUCTION: "/images/markers/under-sale.svg",
};

function getMarkerIcon(status: string | null | undefined): L.Icon {
  const s = (status || "").toUpperCase().trim();
  let iconUrl = MARKER_ICONS.AVAILABLE;
  if (s.includes("SOLD") || s.includes("مباع")) iconUrl = MARKER_ICONS.SOLD;
  else if (s.includes("SOON") || s.includes("قريباً")) iconUrl = MARKER_ICONS.COMING_SOON;
  else if (s.includes("UNDER") || s.includes("إنشاء")) iconUrl = MARKER_ICONS.UNDER_CONSTRUCTION;

  return L.icon({
    iconUrl,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
  });
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LeafletMapInnerProps {
  mapCenterLat: number;
  mapCenterLng: number;
  mapZoom: number;
  projects: MapProjectItem[];
  selectedProjectId: string | null;
  onLocationSelect: (lat: number, lng: number) => void;
  onMarkerDragEnd: (id: string, e: L.DragEndEvent) => void;
}

export default function LeafletMapInner({
  mapCenterLat,
  mapCenterLng,
  mapZoom,
  projects,
  selectedProjectId,
  onLocationSelect,
  onMarkerDragEnd,
}: LeafletMapInnerProps) {
  return (
    <MapContainer center={[mapCenterLat, mapCenterLng]} zoom={mapZoom} style={{ width: "100%", height: "100%" }}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <MapClickHandler onLocationSelect={onLocationSelect} />

      {projects.map((p) => {
        const lat = Number(p.mapLat);
        const lng = Number(p.mapLng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) return null;

        const isSelected = p.id === selectedProjectId;

        return (
          <Marker
            key={p.id}
            position={[lat, lng]}
            icon={getMarkerIcon(p.status)}
            draggable={isSelected}
            eventHandlers={{
              dragend: (e) => onMarkerDragEnd(p.id, e),
            }}
          >
            <Popup>
              <div className="text-right text-xs font-bold p-1">
                <div>{p.name}</div>
                <div className="text-gray-500 font-normal mt-0.5">اسحب العلامة لنقل الموقع</div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
