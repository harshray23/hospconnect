
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { HospitalCard } from '@/components/HospitalCard';
import type { Hospital } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card'; // CardHeader, CardTitle removed as they are in page.tsx
import { Separator } from '@/components/ui/separator';
import { Filter, ListFilter, MapPinIcon, Stethoscope, Loader2, ServerCrash, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


const ALL_SPECIALTIES_VALUE = "_all_specialties_";
const ANY_BED_TYPE_VALUE = "_any_bed_type_";
const ANY_EMERGENCY_VALUE = "_any_emergency_";


const mockHospitalsData: Hospital[] = [
  {
    id: "hospital1",
    name: "City General Hospital",
    location: {
      address: "123 Main St, Anytown, USA",
      coordinates: { latitude: 28.6139, longitude: 77.2090 },
    },
    contact: "555-1234",
    specialties: ["cardiology", "general medicine", "pediatrics"],
    beds: {
      icu: { total: 20, available: 5 },
      general: { total: 100, available: 30 },
      oxygen: { total: 50, available: 15 },
      ventilator: { total: 10, available: 2 },
    },
    emergencyAvailable: true,
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://placehold.co/600x400.png?text=City+General",
    rating: 4.5,
    dataAiHint: "hospital building",
  },
  {
    id: "hospital2",
    name: "Sunshine Medical Center",
    location: {
      address: "456 Oak Ave, Anytown, USA",
      coordinates: { latitude: 28.6200, longitude: 77.2195 },
    },
    contact: "555-5678",
    specialties: ["oncology", "neurology", "orthopedics"],
    beds: {
      icu: { total: 15, available: 3 },
      general: { total: 80, available: 10 },
      oxygen: { total: 40, available: 8 },
      ventilator: { total: 5, available: 1 },
    },
    emergencyAvailable: true,
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://placehold.co/600x400.png?text=Sunshine+Medical",
    rating: 4.2,
    dataAiHint: "modern clinic",
  },
  {
    id: "hospital3",
    name: "Hope Children's Hospital",
    location: {
      address: "789 Pine Ln, Anytown, USA",
      coordinates: { latitude: 28.5900, longitude: 77.1900 },
    },
    contact: "555-9012",
    specialties: ["pediatrics", "neonatology"],
    beds: {
      icu: { total: 25, available: 12 },
      general: { total: 60, available: 25 },
      oxygen: { total: 30, available: 10 },
      ventilator: { total: 8, available: 4 },
    },
    emergencyAvailable: true,
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    imageUrl: "https://placehold.co/600x400.png?text=Childrens+Hospital",
    rating: 4.8,
    dataAiHint: "children hospital",
  },
  {
    id: "hospital4",
    name: "Community Health Clinic",
    location: {
      address: "101 Blossom Rd, Anytown, USA",
      coordinates: { latitude: 28.6350, longitude: 77.2000 },
    },
    contact: "555-3456",
    specialties: ["general medicine", "family practice"],
    beds: {
      icu: { total: 0, available: 0 },
      general: { total: 20, available: 18 },
      oxygen: { total: 5, available: 5 },
      ventilator: { total: 0, available: 0 },
    },
    emergencyAvailable: false,
    lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://placehold.co/600x400.png?text=Community+Clinic",
    rating: 3.9,
    dataAiHint: "local clinic",
  },
];


export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState(ALL_SPECIALTIES_VALUE);
  const [bedTypeFilter, setBedTypeFilter] = useState(ANY_BED_TYPE_VALUE);
  const [locationFilter, setLocationFilter] = useState('');
  const [emergencyFilter, setEmergencyFilter] = useState(ANY_EMERGENCY_VALUE);

  const [allHospitals, setAllHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);
  const [errorLoadingHospitals, setErrorLoadingHospitals] = useState<string | null>(null);

  const [allSpecialties, setAllSpecialties] = useState<string[]>([]);


  useEffect(() => {
    setIsLoadingHospitals(true);
    setErrorLoadingHospitals(null);
    setTimeout(() => {
      try {
        setAllHospitals(mockHospitalsData);
        setFilteredHospitals(mockHospitalsData);
        const specialties = Array.from(new Set(mockHospitalsData.flatMap(h => h.specialties || []))).sort();
        setAllSpecialties(specialties);
      } catch (e) {
        setErrorLoadingHospitals("Failed to load mock hospital data.");
        console.error(e);
      } finally {
        setIsLoadingHospitals(false);
      }
    }, 500);
  }, []);


  useEffect(() => {
    // Populate filters from URL search params on initial load
    const queryTerm = searchParams.get('query') || '';
    const querySpecialty = searchParams.get('specialty') || ALL_SPECIALTIES_VALUE;
    const queryBedType = searchParams.get('bed') || ANY_BED_TYPE_VALUE;
    const queryLocation = searchParams.get('location') || '';
    const queryEmergency = searchParams.get('emergency') || ANY_EMERGENCY_VALUE;

    setSearchTerm(queryTerm);
    setSpecialtyFilter(querySpecialty);
    setBedTypeFilter(queryBedType);
    setLocationFilter(queryLocation);
    setEmergencyFilter(queryEmergency);

  }, [searchParams]);


  useEffect(() => {
    let hospitals = [...allHospitals];

    if (searchTerm) {
      hospitals = hospitals.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (specialtyFilter && specialtyFilter !== ALL_SPECIALTIES_VALUE) {
      hospitals = hospitals.filter(h => h.specialties?.includes(specialtyFilter));
    }
    if (bedTypeFilter && bedTypeFilter !== ANY_BED_TYPE_VALUE) {
      const bedKey = bedTypeFilter as keyof Hospital['beds'];
      hospitals = hospitals.filter(h => {
        const bedCategory = h.beds?.[bedKey];
        return bedCategory && bedCategory.available > 0;
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


  const handleResetFilters = () => {
    setSearchTerm('');
    setSpecialtyFilter(ALL_SPECIALTIES_VALUE);
    setBedTypeFilter(ANY_BED_TYPE_VALUE);
    setLocationFilter('');
    setEmergencyFilter(ANY_EMERGENCY_VALUE);
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card p-6 md:p-8 rounded-lg shadow-lg">
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
      </Card>

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
              <MapPinIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">No hospitals match your current filters.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
