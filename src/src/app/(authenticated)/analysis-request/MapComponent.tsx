"use client";

import { useEffect, useRef, useState } from "react";

// Google Maps types
interface GoogleMaps {
  maps: {
    Map: new (element: HTMLElement, options: any) => any;
    Marker: new (options: any) => any;
    Animation: {
      DROP: any;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleMaps;
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load Google Maps script
  useEffect(() => {
    if (isLoaded) return;

    // Check if Google Maps is already loaded
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    
    if (!apiKey) {
      setLoadError('Google Maps API key not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.');
      console.warn('Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.');
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`) as HTMLScriptElement;
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      existingScript.addEventListener('error', () => setLoadError('Failed to load Google Maps'));
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
      } else {
        setLoadError('Google Maps API loaded but not available');
      }
    };
    script.onerror = () => {
      setLoadError('Failed to load Google Maps script. Please check your API key and network connection.');
      console.error('Failed to load Google Maps script');
    };
    document.head.appendChild(script);
  }, [isLoaded]);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstance.current || !window.google) return;

    // Initialize Google Map
    mapInstance.current = new window.google.maps.Map(mapRef.current as HTMLElement, {
      center: { lat: center.lat, lng: center.lng },
      zoom: 11,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    // Add click handler
    mapInstance.current.addListener('click', (e: any) => {
      if (!e.latLng) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onLocationSelect(lat, lng);

      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Add new marker
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
        animation: window.google.maps.Animation.DROP,
        draggable: true,
      });

      // Add drag end listener to update coordinates
      if (markerRef.current) {
        markerRef.current.addListener('dragend', (e: any) => {
          if (e.latLng) {
            onLocationSelect(e.latLng.lat(), e.latLng.lng());
          }
        });
      }
    });
  }, [isLoaded, center, onLocationSelect]);

  // Update map center when city changes
  useEffect(() => {
    if (mapInstance.current && isLoaded && window.google) {
      mapInstance.current.setCenter({ lat: center.lat, lng: center.lng });
      mapInstance.current.setZoom(11);
    }
  }, [center, isLoaded]);

  // Update marker if coordinates are set externally
  useEffect(() => {
    if (!coordinates || !mapInstance.current || !isLoaded || !window.google) return;

    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);

    if (isNaN(lat) || isNaN(lng)) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Add new marker
    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstance.current,
      animation: window.google.maps.Animation.DROP,
      draggable: true,
    });

    // Center map on marker
    mapInstance.current.setCenter({ lat, lng });

    // Add drag end listener
    if (markerRef.current) {
      markerRef.current.addListener('dragend', (e: any) => {
        if (e.latLng) {
          onLocationSelect(e.latLng.lat(), e.latLng.lng());
        }
      });
    }
  }, [coordinates, isLoaded, onLocationSelect]);

  // Show error message if Google Maps failed to load
  if (loadError) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        color: '#e74c3c',
        border: '2px solid #e74c3c',
        borderRadius: '10px',
        backgroundColor: '#fee',
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>⚠️ Map Unavailable</p>
        <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem' }}>{loadError}</p>
        <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
          Location selection is optional. You can still submit the form without selecting a location.
        </p>
      </div>
    );
  }

  // Show loading message
  if (!isLoaded) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        color: '#666',
        border: '2px solid #e1e5e9',
        borderRadius: '10px',
        backgroundColor: '#f8f9fa',
      }}>
        Loading map...
      </div>
    );
  }

  return null;
}
