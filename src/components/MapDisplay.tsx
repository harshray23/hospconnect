
"use client";

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type { Hospital } from '@/lib/types';
import { Loader2, MapPin, BedDouble } from 'lucide-react';

interface MapDisplayProps {
  hospitals: Hospital[];
  center: { lat: number; lng: number };
  zoom?: number;
}

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
};

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ['places'];

// SVG for hospital emoji marker
const hospitalEmojiMarker = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="%23D9534F">🏥</text></svg>`;


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

  const calculateTotalAvailableBeds = (hospital: Hospital) => {
    if (!hospital.beds) return 0;
    return (
      (hospital.beds.icu?.available || 0) +
      (hospital.beds.general?.available || 0) +
      (hospital.beds.oxygen?.available || 0) +
      (hospital.beds.ventilator?.available || 0)
    );
  };

  if (loadError) {
    return (
        <div className="flex flex-col items-center justify-center text-destructive p-4 border border-destructive/50 rounded-md bg-destructive/10" style={{height: containerStyle.height}}>
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
        // Ensure coordinates is a simple object { latitude: number, longitude: number }
        if (hospital.location?.coordinates && 'latitude' in hospital.location.coordinates && 'longitude' in hospital.location.coordinates) {
          const position = {
            lat: hospital.location.coordinates.latitude,
            lng: hospital.location.coordinates.longitude,
          };
          return (
            <Marker
              key={hospital.id}
              position={position}
              title={hospital.name}
              icon={{
                url: hospitalEmojiMarker,
                scaledSize: new window.google.maps.Size(32, 32),
              }}
              onClick={() => onMarkerClick(hospital)}
            />
          );
        }
        return null;
      })}

      {selectedHospital && selectedHospital.location?.coordinates && 'latitude' in selectedHospital.location.coordinates && 'longitude' in selectedHospital.location.coordinates && (
        <InfoWindow
          position={{
            lat: selectedHospital.location.coordinates.latitude,
            lng: selectedHospital.location.coordinates.longitude,
          }}
          onCloseClick={onInfoWindowClose}
          options={{ pixelOffset: new window.google.maps.Size(0, -35) }} // Adjust offset for emoji
        >
          <div className="p-1 max-w-xs">
            <h4 className="font-semibold text-md mb-1 text-primary">{selectedHospital.name}</h4>
            <p className="text-xs text-muted-foreground mb-1">{selectedHospital.location.address}</p>
            {selectedHospital.beds && (
                <div className="text-sm my-2 p-2 bg-primary/10 rounded-md">
                  <div className="flex items-center font-semibold text-primary">
                     <BedDouble className="w-4 h-4 mr-1.5"/>
                     Available Beds: {calculateTotalAvailableBeds(selectedHospital)}
                  </div>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-0.5 pl-1">
                    <li>ICU: {selectedHospital.beds.icu.available || 0}/{selectedHospital.beds.icu.total || 0}</li>
                    <li>Oxygen: {selectedHospital.beds.oxygen.available || 0}/{selectedHospital.beds.oxygen.total || 0}</li>
                    <li>Ventilator: {selectedHospital.beds.ventilator.available || 0}/{selectedHospital.beds.ventilator.total || 0}</li>
                    <li>General: {selectedHospital.beds.general.available || 0}/{selectedHospital.beds.general.total || 0}</li>
                  </ul>
                </div>
            )}
             <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.location.coordinates.latitude},${selectedHospital.location.coordinates.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline mt-2 block"
            >
              Get Directions
            </a>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
