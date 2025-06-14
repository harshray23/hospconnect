
"use client";

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type { Hospital } from '@/lib/types';
import { Loader2, MapPin } from 'lucide-react';

interface MapDisplayProps {
  hospitals: Hospital[];
  center: { lat: number; lng: number };
  zoom?: number;
}

const containerStyle = {
  width: '100%',
  height: '500px', // You can adjust this
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
};

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ['places'];

export function MapDisplay({ hospitals, center, zoom = 11 }: MapDisplayProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries,
  });

  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const onMarkerClick = useCallback((hospital: Hospital) => {
    setSelectedHospital(hospital);
  }, []);

  const onInfoWindowClose = useCallback(() => {
    setSelectedHospital(null);
  }, []);

  if (loadError) {
    return (
        <div className="flex flex-col items-center justify-center text-destructive p-4 border border-destructive/50 rounded-md bg-destructive/10">
            <MapPin className="h-12 w-12 mb-2" />
            <p className="font-semibold">Error loading maps</p>
            <p className="text-sm">Could not connect to Google Maps services. Please ensure your API key is correct and enabled.</p>
        </div>
    );
  }

  if (!isLoaded) {
    return (
        <div className="flex items-center justify-center" style={{ height: containerStyle.height }}>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-3 text-lg">Loading Map...</p>
        </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {hospitals.map((hospital) => {
        if (hospital.location?.coordinates) {
          const position = {
            lat: hospital.location.coordinates.latitude,
            lng: hospital.location.coordinates.longitude,
          };
          return (
            <Marker
              key={hospital.id}
              position={position}
              title={hospital.name}
              onClick={() => onMarkerClick(hospital)}
            />
          );
        }
        return null;
      })}

      {selectedHospital && selectedHospital.location?.coordinates && (
        <InfoWindow
          position={{
            lat: selectedHospital.location.coordinates.latitude,
            lng: selectedHospital.location.coordinates.longitude,
          }}
          onCloseClick={onInfoWindowClose}
          options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
        >
          <div className="p-1">
            <h4 className="font-semibold text-md mb-1">{selectedHospital.name}</h4>
            <p className="text-xs text-muted-foreground">{selectedHospital.location.address}</p>
            {selectedHospital.beds && (
                <p className="text-xs mt-1">
                    ICU: {selectedHospital.beds.icu.available}/{selectedHospital.beds.icu.total} | 
                    General: {selectedHospital.beds.general.available}/{selectedHospital.beds.general.total}
                </p>
            )}
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.location.coordinates.latitude},${selectedHospital.location.coordinates.longitude}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-2 block"
            >
              Get Directions
            </a>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
