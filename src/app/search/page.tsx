
"use client";

import { useState, useEffect } from 'react';
import { HospitalCard } from '@/components/HospitalCard';
import { SmartHospitalRecForm } from '@/components/forms/SmartHospitalRecForm';
import type { Hospital } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Filter, ListFilter, MapPin, Stethoscope, AlertTriangle, Loader2 } from 'lucide-react';
import type { RecommendHospitalsOutput } from '@/ai/flows/smart-hospital-recommendations';

const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'City General Hospital',
    address: '123 Main St, Anytown',
    city: 'Anytown',
    specialties: ['Cardiology', 'Neurology', 'Oncology'],
    beds: {
      icu: { available: 5, total: 20 },
      oxygen: { available: 10, total: 30 },
      ventilator: { available: 3, total: 10 },
      general: { available: 25, total: 100 },
    },
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "hospital building",
    rating: 4.5,
    services: ["24/7 Emergency", "Pharmacy", "Radiology"],
    contact: "555-1234",
    distance: "2.1 km"
  },
  {
    id: '2',
    name: 'St. Luke’s Medical Center',
    address: '456 Oak Ave, Anytown',
    city: 'Anytown',
    specialties: ['Pediatrics', 'Orthopedics'],
    beds: {
      icu: { available: 8, total: 15 },
      oxygen: { available: 12, total: 25 },
      ventilator: { available: 5, total: 8 },
      general: { available: 40, total: 80 },
    },
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "modern hospital",
    rating: 4.2,
    services: ["Maternity Care", "Physical Therapy"],
    contact: "555-5678",
    distance: "5.5 km"
  },
  {
    id: '3',
    name: 'Community Health Clinic',
    address: '789 Pine Rd, Otherville',
    city: 'Otherville',
    specialties: ['General Medicine', 'Family Practice'],
    beds: {
      icu: { available: 0, total: 0 }, // No ICU
      oxygen: { available: 5, total: 10 },
      ventilator: { available: 1, total: 2 },
      general: { available: 15, total: 30 },
    },
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: "clinic building",
    rating: 3.9,
    services: ["Vaccinations", "Urgent Care"],
    contact: "555-9012",
    distance: "12.8 km"
  },
];

const ALL_SPECIALTIES_VALUE = "_all_specialties_";
const ANY_BED_TYPE_VALUE = "_any_bed_type_";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState(ALL_SPECIALTIES_VALUE);
  const [bedTypeFilter, setBedTypeFilter] = useState(ANY_BED_TYPE_VALUE);
  const [locationFilter, setLocationFilter] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>(mockHospitals);
  const [recommendedHospitals, setRecommendedHospitals] = useState<string[] | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  useEffect(() => {
    let hospitals = mockHospitals;
    if (searchTerm) {
      hospitals = hospitals.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (specialtyFilter && specialtyFilter !== ALL_SPECIALTIES_VALUE) {
      hospitals = hospitals.filter(h => h.specialties.includes(specialtyFilter));
    }
    if (bedTypeFilter && bedTypeFilter !== ANY_BED_TYPE_VALUE) {
      hospitals = hospitals.filter(h => {
        const bed = bedTypeFilter as keyof Hospital['beds'];
        return h.beds[bed] && h.beds[bed].available > 0;
      });
    }
    if (locationFilter) {
      hospitals = hospitals.filter(h => h.city.toLowerCase().includes(locationFilter.toLowerCase()));
    }
    setFilteredHospitals(hospitals);
  }, [searchTerm, specialtyFilter, bedTypeFilter, locationFilter]);

  const handleRecommendationsFetched = (data: RecommendHospitalsOutput | null) => {
    if (data) {
      setRecommendedHospitals(data.hospitals);
    } else {
      setRecommendedHospitals([]); // No recommendations or error
    }
    setIsLoadingRecommendations(false);
  };
  
  const allSpecialties = Array.from(new Set(mockHospitals.flatMap(h => h.specialties))).sort();

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 md:p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold font-headline mb-6 text-primary">Find a Hospital</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Input
            placeholder="Search by hospital name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="lg:col-span-2"
          />
          <Input
            placeholder="Enter city or area..."
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
          />
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger>
              <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SPECIALTIES_VALUE}>All Specialties</SelectItem>
              {allSpecialties.map(spec => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={bedTypeFilter} onValueChange={setBedTypeFilter}>
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
        </div>
         <Button onClick={() => {
            setSearchTerm('');
            setSpecialtyFilter(ALL_SPECIALTIES_VALUE);
            setBedTypeFilter(ANY_BED_TYPE_VALUE);
            setLocationFilter('');
         }}>
            <Filter className="mr-2 h-4 w-4" /> Reset Filters
         </Button>
      </section>

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
                <ul className="list-disc list-inside bg-green-50 border border-green-200 p-4 rounded-md text-green-700">
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
          <ListFilter className="mr-2 h-6 w-6 text-primary" /> Search Results ({filteredHospitals.length})
        </h2>
        {filteredHospitals.length > 0 ? (
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

    