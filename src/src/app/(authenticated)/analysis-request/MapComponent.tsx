"use client";

import { useEffect, useRef } from "react";

// Extend Window interface for Google Maps callback
declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        Animation: {
          DROP: any;
        };
        LatLng: new (lat: number, lng: number) => any;
      };
    };
    initMap?: () => void;
  }
}

interface MapComponentProps {
  mapRef: React.RefObject<HTMLDivElement | null>;
  center: { lat: number; lng: number };
  onLocationSelect: (lat: number, lng: number) => void;
  coordinates: { lat: string; lng: string } | null;
}

export default function MapComponent({ mapRef, center, onLocationSelect, coordinates }: MapComponentProps) {
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const scriptLoaded = useRef(false);

  // Load Google Maps script and initialize
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      initMap();
      return;
    }

    // Check if script is already loading
    if (scriptLoaded.current) return;

    // Use API key from environment or fallback to the one from the HTML file
    const apiKey = 'AIzaSyBIsfSpvVTK_C692hxTzkv3dj1ViozBcXU';
    
    // Store reference to component's initMap in closure
    const componentInitMap = () => {
      initMap();
    };

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      // If script exists, wait for it to load and then init
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogle);
          initMap();
        }
      }, 100);
      
      return () => clearInterval(checkGoogle);
    }

    scriptLoaded.current = true;

    // Create initMap callback on window (needed for Google Maps callback)
    // Use unique name to avoid conflicts with multiple instances
    const callbackName = `initMap_${Date.now()}`;
    (window as any)[callbackName] = componentInitMap;

    // Load Google Maps script with callback
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('Failed to load Google Maps. Please check API key restrictions in Google Cloud Console.');
      console.error('See GOOGLE_MAPS_SETUP.md for instructions on adding your domain to allowed referrers.');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup - remove callback if it exists
      if ((window as any)[callbackName]) {
        (window as any)[callbackName] = undefined;
      }
    };
  }, []);

  // Initialize map function
  const initMap = () => {
    if (!mapRef.current || mapInstance.current) return;

    // Default center: Dubai
    const defaultCenter = { lat: center.lat, lng: center.lng };

    mapInstance.current = new window.google.maps.Map(mapRef.current as HTMLElement, {
      center: defaultCenter,
      zoom: 11,
      mapTypeControl: true,
      streetViewControl: false,
    });

    // Add click listener to map
    mapInstance.current.addListener('click', (event: any) => {
      placeMarker(event.latLng);
    });

    // If coordinates are already set, place marker
    if (coordinates) {
      const lat = parseFloat(coordinates.lat);
      const lng = parseFloat(coordinates.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const location = new window.google.maps.LatLng(lat, lng);
        placeMarker(location);
      }
    }
  };

  // Place marker function
  const placeMarker = (location: any) => {
    if (!mapInstance.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Create new marker
    markerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapInstance.current,
      animation: window.google.maps.Animation.DROP,
    });

    // Get coordinates
    const lat = location.lat().toFixed(6);
    const lng = location.lng().toFixed(6);

    // Call callback to update parent component
    onLocationSelect(parseFloat(lat), parseFloat(lng));
  };

  // Update map center when city changes
  useEffect(() => {
    if (mapInstance.current && window.google) {
      mapInstance.current.setCenter({ lat: center.lat, lng: center.lng });
      mapInstance.current.setZoom(11);
    }
  }, [center]);

  // Update marker if coordinates are set externally
  useEffect(() => {
    if (!coordinates || !mapInstance.current || !window.google) return;

    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);

    if (isNaN(lat) || isNaN(lng)) return;

    const location = new window.google.maps.LatLng(lat, lng);
    placeMarker(location);
  }, [coordinates]);

  return null;
}
