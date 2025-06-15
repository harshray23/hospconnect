
'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function MapPage() {
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);
  const [loadingKey, setLoadingKey] = useState(true);

  useEffect(() => {
    // Access environment variable on the client side
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (key) {
      setApiKey(key);
    } else {
      console.error("Google Maps API Key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) is not configured in .env file or Vercel environment variables.");
    }
    setLoadingKey(false);
  }, []);

  if (loadingKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive text-xl font-semibold">Map cannot be loaded.</p>
        <p className="text-muted-foreground mt-2">
          The Google Maps API Key is missing or invalid.
          <br />
          Please ensure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set correctly.
        </p>
      </div>
    );
  }

  // Default search query for hospitals
  const defaultQuery = "Hospitals in India";
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(defaultQuery)}&zoom=5`;

  return (
    <div className="space-y-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">
          Find Hospitals on Map
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Explore hospitals using the interactive map below. You can pan, zoom, and click on map markers for more details.
        </p>
      </div>
      <div className="aspect-video w-full max-w-6xl mx-auto rounded-lg overflow-hidden shadow-2xl border border-border">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapSrc}
          title="Hospitals Map"
        ></iframe>
      </div>
    </div>
  );
}
