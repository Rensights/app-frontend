"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapComponentProps {
  mapRef: React.RefObject<HTMLDivElement | null>;
  center: { lat: number; lng: number };
  onLocationSelect: (lat: number, lng: number) => void;
  coordinates: { lat: string; lng: string } | null;
}

export default function MapComponent({ mapRef, center, onLocationSelect, coordinates }: MapComponentProps) {
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map
    mapInstance.current = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 11,
      zoomControl: true,
    });

    // Add OpenStreetMap tile layer (no API key required)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // Add click handler
    mapInstance.current.on("click", (e: L.LeafletMouseEvent) => {
      if (!mapInstance.current) return;
      
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);

      // Remove existing marker
      if (markerRef.current && mapInstance.current) {
        mapInstance.current.removeLayer(markerRef.current);
      }

      // Add new marker
      if (mapInstance.current) {
        markerRef.current = L.marker([lat, lng], {
          icon: L.icon({
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        }).addTo(mapInstance.current);

        // Add popup with coordinates
        markerRef.current.bindPopup(`📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`).openPopup();
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update map center when city changes
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setView([center.lat, center.lng], 11);
    }
  }, [center]);

  // Update marker if coordinates are set externally
  useEffect(() => {
    if (coordinates && mapInstance.current) {
      const lat = parseFloat(coordinates.lat);
      const lng = parseFloat(coordinates.lng);
      
      if (!isNaN(lat) && !isNaN(lng) && mapInstance.current) {
        // Remove existing marker
        if (markerRef.current && mapInstance.current) {
          mapInstance.current.removeLayer(markerRef.current);
        }

        // Add new marker
        if (mapInstance.current) {
          markerRef.current = L.marker([lat, lng], {
            icon: L.icon({
              iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
              iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            }),
          }).addTo(mapInstance.current);

          // Add popup with coordinates
          markerRef.current.bindPopup(`📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`).openPopup();
          
          // Center map on marker
          mapInstance.current.setView([lat, lng], 11);
        }
      }
    }
  }, [coordinates]);

  return null;
}
