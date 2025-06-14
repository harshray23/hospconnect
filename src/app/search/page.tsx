
"use client";

import { useState, useEffect, useMemo } from 'react';
import { HospitalCard } from '@/components/HospitalCard';
import { SmartHospitalRecForm } from '@/components/forms/SmartHospitalRecForm';
import type { Hospital } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Filter, ListFilter, MapPin, Stethoscope, AlertTriangle, Loader2, ServerCrash, Zap, Eye, EyeOff } from 'lucide-react';
import type { RecommendHospitalsOutput } from '@/ai/flows/smart-hospital-recommendations';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, DocumentData, Timestamp, GeoPoint } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { MapDisplay } from '@/components/MapDisplay'; 
import { useToast } from '@/hooks/use-toast';

const ALL_SPECIALTIES_VALUE = "_all_specialties_";
const ANY_BED_TYPE_VALUE = "_any_bed_type_";
const ANY_EMERGENCY_VALUE = "_any_emergency_";
const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.2090 }; // Default to Delhi, India if geolocation fails

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState(ALL_SPECIALTIES_VALUE);
  const [bedTypeFilter, setBedTypeFilter] = useState(ANY_BED_TYPE_VALUE);
  const [locationFilter, setLocationFilter] = useState(''); 
  const [emergencyFilter, setEmergencyFilter] = useState(ANY_EMERGENCY_VALUE); 
  
  const [allHospitals, setAllHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);
  const [errorLoadingHospitals, setErrorLoadingHospitals] = useState<string | null>(null);

  const [recommendedHospitals, setRecommendedHospitals] = useState<string[] | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [allSpecialties, setAllSpecialties] = useState<string[]>([]);

  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHospitals = async () => {
      setIsLoadingHospitals(true);
      setErrorLoadingHospitals(null);
      try {
        const hospitalsCollectionRef = collection(db, 'hospitals');
        const hospitalSnapshot = await getDocs(hospitalsCollectionRef);
        const fetchedHospitals: Hospital[] = hospitalSnapshot.docs.map(doc => {
          const data = doc.data() as DocumentData; 
          const locationData = data.location || { address: 'N/A' };
          return { 
            id: doc.id, 
            name: data.name || "Unknown Hospital",
            location: {
              address: locationData.address,
              coordinates: locationData.coordinates instanceof GeoPoint ? locationData.coordinates : undefined,
            },
            contact: data.contact,
            specialties: data.specialties || [],
            beds: data.beds || { icu: {}, general: {}, oxygen: {}, ventilator: {} },
            emergencyAvailable: data.emergencyAvailable,
            lastUpdated: data.lastUpdated instanceof Timestamp ? data.lastUpdated.toDate().toISOString() : data.lastUpdated,
            imageUrl: data.imageUrl,
            rating: data.rating,
            dataAiHint: data.dataAiHint
          } as Hospital;
        });
        setAllHospitals(fetchedHospitals);
        setFilteredHospitals(fetchedHospitals);

        const specialties = Array.from(new Set(fetchedHospitals.flatMap(h => h.specialties || []))).sort();
        setAllSpecialties(specialties);

      } catch (error) {
        console.error("Error fetching hospitals:", error);
        setErrorLoadingHospitals("Failed to load hospitals. Please try again later.");
      } finally {
        setIsLoadingHospitals(false);
      }
    };
    fetchHospitals();
  }, []);

  useEffect(() => {
    let hospitals = [...allHospitals]; 

    if (searchTerm) {
      hospitals = hospitals.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (specialtyFilter && specialtyFilter !== ALL_SPECIALTIES_VALUE) {
      hospitals = hospitals.filter(h => h.specialties?.includes(specialtyFilter));
    }
    if (bedTypeFilter && bedTypeFilter !== ANY_BED_TYPE_VALUE) {
      hospitals = hospitals.filter(h => {
        const bedKey = bedTypeFilter as keyof Hospital['beds'];
        return h.beds?.[bedKey]?.available > 0;
      });
    }
    if (locationFilter) {
      hospitals = hospitals.filter(h => 
        h.location?.address?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    if (emergencyFilter !== ANY_EMERGENCY_VALUE) {
      const emergencyRequired = emergencyFilter === "true";
      hospitals = hospitals.filter(h => h.emergencyAvailable === emergencyRequired);
    }
    setFilteredHospitals(hospitals);
  }, [searchTerm, specialtyFilter, bedTypeFilter, locationFilter, emergencyFilter, allHospitals]);

  const handleRecommendationsFetched = (data: RecommendHospitalsOutput | null) => {
    if (data) {
      setRecommendedHospitals(data.hospitals);
    } else {
      setRecommendedHospitals([]); 
    }
    setIsLoadingRecommendations(false);
  };
  
  const handleResetFilters = () => {
    setSearchTerm('');
    setSpecialtyFilter(ALL_SPECIALTIES_VALUE);
    setBedTypeFilter(ANY_BED_TYPE_VALUE);
    setLocationFilter('');
    setEmergencyFilter(ANY_EMERGENCY_VALUE);
  };

  const toggleMapVisibility = () => {
    if (!showMap && !userLocation) { 
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setShowMap(true);
          setIsGettingLocation(false);
        },
        (error) => {
          console.warn("Error getting user location:", error.message);
          toast({
            title: "Location Access Denied",
            description: "Could not access your location. Map will center on a default area.",
            variant: "default"
          });
          setUserLocation(DEFAULT_LOCATION); 
          setShowMap(true);
          setIsGettingLocation(false);
        },
        { timeout: 10000 } 
      );
    } else {
      setShowMap(!showMap);
    }
  };

  const mapCenter = useMemo(() => {
    if (userLocation) return userLocation;
    if (filteredHospitals.length > 0 && filteredHospitals[0].location?.coordinates) {
      return { 
        lat: filteredHospitals[0].location.coordinates.latitude, 
        lng: filteredHospitals[0].location.coordinates.longitude 
      };
    }
    return DEFAULT_LOCATION;
  }, [userLocation, filteredHospitals]);

  
  const hospitalsForMap = useMemo(() => 
    filteredHospitals.filter(h => h.location?.coordinates), 
  [filteredHospitals]);


  return (
    <div className="space-y-8">
      <section className="bg-card p-6 md:p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold font-headline mb-6 text-primary">Find a Hospital</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Search by hospital name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="md:col-span-2 lg:col-span-1"
          />
          <Input
            placeholder="Filter by city/area in address..."
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
          />
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter} disabled={isLoadingHospitals || !!errorLoadingHospitals}>
            <SelectTrigger>
              <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SPECIALTIES_VALUE}>All Specialties</SelectItem>
              {allSpecialties.map(spec => (
                <SelectItem key={spec} value={spec} className="capitalize">{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={bedTypeFilter} onValueChange={setBedTypeFilter} disabled={isLoadingHospitals || !!errorLoadingHospitals}>
            <SelectTrigger>
              <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by bed type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_BED_TYPE_VALUE}>Any Available Bed</SelectItem>
              <SelectItem value="icu">ICU Bed</SelectItem>
              <SelectItem value="oxygen">Oxygen Bed</SelectItem>
              <SelectItem value="ventilator">Ventilator Bed</SelectItem>
              <SelectItem value="general">General Bed</SelectItem>
            </SelectContent>
          </Select>
           <Select value={emergencyFilter} onValueChange={setEmergencyFilter} disabled={isLoadingHospitals || !!errorLoadingHospitals}>
            <SelectTrigger>
              <Zap className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Emergency Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_EMERGENCY_VALUE}>Any (Emergency)</SelectItem>
              <SelectItem value="true">Emergency Available</SelectItem>
              <SelectItem value="false">Emergency Not Available</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleResetFilters} variant="outline" className="lg:col-span-1 flex items-center justify-center">
            <Filter className="mr-2 h-4 w-4" /> Reset Filters
         </Button>
        </div>
         <Button onClick={toggleMapVisibility} variant="default" className="w-full md:w-auto" disabled={isGettingLocation}>
            {isGettingLocation ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : showMap ? (
                <EyeOff className="mr-2 h-4 w-4" />
            ) : (
                <Eye className="mr-2 h-4 w-4" />
            )}
            {isGettingLocation ? "Getting Location..." : showMap ? "Hide Map" : "Show on Map"}
        </Button>
      </section>

      {showMap && (
        <section className="my-6">
           {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <MapDisplay hospitals={hospitalsForMap} center={mapCenter} />
          ) : (
            <Card className="text-center py-12 shadow-md bg-amber-50 border-amber-400">
                <CardContent>
                <AlertTriangle className="h-16 w-16 text-amber-600 mx-auto mb-4" />
                <p className="text-xl text-amber-700 font-semibold">Map Feature Not Configured</p>
                <p className="text-sm text-amber-600 mt-2">The Google Maps API key is missing. Please configure it to use this feature.</p>
                </CardContent>
            </Card>
          )}
        </section>
      )}


      <Separator />

      <section>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <AlertTriangle className="mr-2 h-6 w-6 text-accent" /> Smart Hospital Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Need help? Describe your medical requirements and current location, and our AI will suggest suitable nearby hospitals.
            </p>
            <SmartHospitalRecForm 
              onRecommendationsFetched={handleRecommendationsFetched} 
              setIsLoading={setIsLoadingRecommendations} 
            />
            {isLoadingRecommendations && (
              <div className="mt-4 flex items-center text-primary">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Finding best hospitals for you...</span>
              </div>
            )}
            {recommendedHospitals && recommendedHospitals.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">AI Recommended Hospitals:</h3>
                <ul className="list-disc list-inside bg-green-50 border border-green-200 p-4 rounded-md text-green-700 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                  {recommendedHospitals.map((hospitalName, index) => (
                    <li key={index}>{hospitalName}</li>
                  ))}
                </ul>
              </div>
            )}
            {recommendedHospitals && recommendedHospitals.length === 0 && !isLoadingRecommendations && (
               <p className="mt-4 text-destructive">No specific AI recommendations found. Please check general listings or broaden your criteria.</p>
            )}
          </CardContent>
        </Card>
      </section>
      
      <Separator />

      <section>
        <h2 className="text-2xl font-bold font-headline mb-6 flex items-center">
          <ListFilter className="mr-2 h-6 w-6 text-primary" /> 
          Search Results ({isLoadingHospitals || errorLoadingHospitals ? "Loading..." : filteredHospitals.length})
        </h2>
        {isLoadingHospitals ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <Card key={i} className="shadow-lg">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="space-y-1 border-t border-b py-3 my-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : errorLoadingHospitals ? (
           <Card className="text-center py-12 shadow-md bg-destructive/10 border-destructive">
            <CardContent>
              <ServerCrash className="h-16 w-16 text-destructive mx-auto mb-4" />
              <p className="text-xl text-destructive font-semibold">{errorLoadingHospitals}</p>
              <p className="text-sm text-destructive/80 mt-2">We're having trouble fetching hospital data right now.</p>
            </CardContent>
          </Card>
        ) : filteredHospitals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map(hospital => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 shadow-md">
            <CardContent>
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">No hospitals match your current filters.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search criteria or using the Smart Recommendation tool.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
