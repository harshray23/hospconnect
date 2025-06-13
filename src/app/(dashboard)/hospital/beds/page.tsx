
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BedAvailabilityForm } from "@/components/forms/BedAvailabilityForm";
import { useEffect, useState } from "react";
import type { Hospital, BedAvailabilityData } from "@/lib/types";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { Loader2, ServerCrash, AlertTriangle, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// In a real app, get this from the logged-in hospital admin's context/profile
// For now, this should come from a UserProfile document in Firestore for the logged-in hospital admin
const MOCK_HOSPITAL_ID = "CityGeneralAnytown"; // Replace with actual logic to get hospital ID

export default function HospitalBedsPage() {
  const [currentAvailability, setCurrentAvailability] = useState<BedAvailabilityData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [hospitalName, setHospitalName] = useState<string>("your hospital");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // This should come from auth/user context -> UserProfile.hospitalId
  const hospitalId = MOCK_HOSPITAL_ID; 

  useEffect(() => {
    const fetchBedAvailability = async () => {
      if (!hospitalId) {
        setError("Hospital ID not found. Unable to load bed availability.");
        setIsLoading(false);
        toast({ title: "Error", description: "Could not determine hospital ID.", variant: "destructive" });
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const hospitalDocRef = doc(db, "hospitals", hospitalId);
        const hospitalSnap = await getDoc(hospitalDocRef);

        if (hospitalSnap.exists()) {
          const hospitalData = hospitalSnap.data() as Hospital;
          setCurrentAvailability(hospitalData.beds); // beds object directly
          setHospitalName(hospitalData.name);
          if (hospitalData.lastUpdated) {
             const updateTimestamp = hospitalData.lastUpdated instanceof Timestamp 
                ? hospitalData.lastUpdated.toDate() 
                : new Date(hospitalData.lastUpdated as string); // Assuming it might be an ISO string
            if (!isNaN(updateTimestamp.valueOf())) { // Check if date is valid
                 setLastUpdated(format(updateTimestamp, "PPPp"));
            } else {
                setLastUpdated("Invalid date");
            }
          } else {
            setLastUpdated("Not available");
          }
        } else {
          setError(`Hospital with ID ${hospitalId} not found.`);
          toast({ title: "Not Found", description: `Hospital data for '${hospitalId}' could not be found.`, variant: "destructive" });
        }
      } catch (err) {
        console.error("Error fetching bed availability:", err);
        setError("Failed to load bed availability. Please try again.");
        toast({ title: "Error", description: "Failed to load current bed data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    const currentUser = auth.currentUser;
    if (currentUser) {
        // Future: Fetch UserProfile for currentUser.uid to get their role and hospitalId.
        // For now, we proceed with MOCK_HOSPITAL_ID.
        fetchBedAvailability();
    } else {
        setError("You must be logged in as a hospital administrator to manage bed availability.");
        setIsLoading(false);
        toast({ title: "Access Denied", description: "Login as hospital admin.", variant: "destructive"});
    }

  }, [hospitalId, toast]); // Added toast to dependency array

  const handleUpdateSuccess = (updatedData: BedAvailabilityData) => {
    setCurrentAvailability(updatedData);
    setLastUpdated(format(new Date(), "PPPp")); 
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading bed availability...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg bg-destructive/10 border-destructive">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-destructive flex items-center">
            <ServerCrash className="mr-2 h-7 w-7" /> Error Loading Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!currentAvailability) {
     return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <AlertTriangle className="mr-2 h-7 w-7 text-yellow-500" /> No Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Bed availability data for {hospitalName} could not be loaded or is not yet set up.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Manage Bed Availability for {hospitalName}</CardTitle>
          <CardDescription className="flex items-center">
            <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
            Update real-time bed counts for your hospital. 
            {lastUpdated && ` Last updated: ${lastUpdated}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BedAvailabilityForm
            currentAvailability={currentAvailability}
            hospitalId={hospitalId}
            onUpdateSuccess={handleUpdateSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
}
