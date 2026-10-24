// ==============================================================================
// ArogyaMitra AI — Interactive Leaflet OpenStreetMap Component
// ==============================================================================

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// SVG divIcon markers for sharp rendering without asset path breakage
const createUserIcon = () =>
  L.divIcon({
    className: "leaflet-user-marker",
    html: `<div style="
      width: 22px;
      height: 22px;
      background: #0866f5;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 6px rgba(8, 102, 245, 0.3), 0 3px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

const createHospitalIcon = (isSelected = false) =>
  L.divIcon({
    className: "leaflet-facility-marker",
    html: `<div style="
      width: ${isSelected ? "34px" : "28px"};
      height: ${isSelected ? "34px" : "28px"};
      background: ${isSelected ? "#0866f5" : "#e63d58"};
      color: white;
      border: 2px solid white;
      border-radius: 8px;
      display: grid;
      place-items: center;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      transition: all 0.2s ease;
    ">
      <span>+</span>
    </div>`,
    iconSize: [isSelected ? 34 : 28, isSelected ? 34 : 28],
    iconAnchor: [isSelected ? 17 : 14, isSelected ? 17 : 14],
  });

export default function LeafletMap({
  center = [18.5204, 73.8567], // Default Pune / India coords
  zoom = 13,
  userLocation = null,
  hospitals = [],
  selectedHospital = null,
  onSelectHospital,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up map when unmounting
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. User Location Marker
    if (userLocation && userLocation.lat && userLocation.lon) {
      const userMarker = L.marker([userLocation.lat, userLocation.lon], {
        icon: createUserIcon(),
      }).bindPopup("<b>Your Location</b>");
      markersLayerRef.current.addLayer(userMarker);
    }

    // 2. Hospital Markers
    hospitals.forEach((h) => {
      if (!h.lat || !h.lon) return;

      const isSelected = selectedHospital && selectedHospital.id === h.id;
      const marker = L.marker([h.lat, h.lon], {
        icon: createHospitalIcon(isSelected),
      });

      const popupContent = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 2px;">
          <strong style="color: #142f59; font-size: 14px;">${h.name}</strong>
          <div style="color: #6680a1; font-size: 11px; margin: 4px 0;">${h.address}</div>
          <div style="color: #0866f5; font-weight: bold; font-size: 11px;">
            ${h.distance ? h.distance.toFixed(1) + " km away" : ""} ${h.emergency ? "• Emergency Ready" : ""}
          </div>
          ${h.phone ? `<div style="margin-top: 4px;">📞 <a href="tel:${h.phone}" style="color: #e63d58; font-weight: bold;">${h.phone}</a></div>` : ""}
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("click", () => {
        if (onSelectHospital) onSelectHospital(h);
      });

      markersLayerRef.current.addLayer(marker);

      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [hospitals, userLocation, selectedHospital, onSelectHospital]);

  // If a hospital is selected, center on it smoothly
  useEffect(() => {
    if (mapInstanceRef.current && selectedHospital?.lat && selectedHospital?.lon) {
      mapInstanceRef.current.flyTo(
        [selectedHospital.lat, selectedHospital.lon],
        15,
        { duration: 0.8 }
      );
    }
  }, [selectedHospital]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "440px",
        borderRadius: "16px",
        overflow: "hidden",
        zIndex: 1,
      }}
    />
  );
}
