
"use client"; // Add "use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintForm } from "@/components/forms/ComplaintForm";
import type { Complaint as ComplaintType } from "@/lib/types"; // Renamed to avoid conflict
import { AlertTriangle, FilePlus, ListChecks, Loader2, ServerCrash } from "lucide-react"; // Added Loader2, ServerCrash
import { Badge as ShadBadge } from "@/components/ui/badge";
import { useEffect, useState } from "react"; // Added useEffect, useState
import { db, auth } from "@/lib/firebase"; // Added Firebase imports
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'; // Added Firestore imports
import { useToast } from "@/hooks/use-toast"; // Added useToast
import { format } from 'date-fns'; // Added date-fns

const getStatusVariant = (status: ComplaintType['status']): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'outline';
    case 'in_progress': return 'default'; 
    case 'resolved': return 'secondary'; 
    case 'escalated': return 'destructive';
    default: return 'outline';
  }
};

export default function PatientComplaintsPage() {
  const [userComplaints, setUserComplaints] = useState<ComplaintType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchComplaints(user.uid);
      } else {
        setIsLoading(false);
        setUserComplaints([]);
        toast({
          title: "Not Logged In",
          description: "Please log in to see your complaints.",
          variant: "default"
        });
      }
    });
    return () => unsubscribe();
  }, [toast]);

  const fetchComplaints = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const complaintsCollectionRef = collection(db, 'complaints');
      // Query by patientId, order by createdAt
      const q = query(complaintsCollectionRef, where("patientId", "==", userId), orderBy("createdAt", "desc"));
      const complaintSnapshot = await getDocs(q);
      const fetchedComplaints: ComplaintType[] = complaintSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        } as ComplaintType;
      });
      setUserComplaints(fetchedComplaints);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to load your complaints. Please try again later.");
      toast({
        title: "Error",
        description: "Could not load your complaints.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <FilePlus className="mr-2 h-7 w-7 text-primary" /> Submit a New Complaint
          </CardTitle>
          <CardDescription>Report any issues or concerns regarding healthcare services.</CardDescription>
        </CardHeader>
        <CardContent>
          <ComplaintForm />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
             <ListChecks className="mr-2 h-7 w-7 text-primary" /> Your Submitted Complaints
          </CardTitle>
          <CardDescription>Track the status of your complaints.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span>Loading your complaints...</span>
            </div>
          ) : error ? (
            <div className="text-destructive flex flex-col items-center justify-center py-8">
                <ServerCrash className="h-10 w-10 mb-2" />
                <p>{error}</p>
            </div>
          ) : userComplaints.length > 0 ? (
            <ul className="space-y-6">
              {userComplaints.map(complaint => (
                <li key={complaint.id} className="p-4 border rounded-lg bg-card shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-primary">Ticket ID: {complaint.ticketId || complaint.id}</h3>
                      {complaint.hospitalName && complaint.hospitalName !== "N/A (General Complaint)" && <p className="text-sm text-muted-foreground">Hospital: {complaint.hospitalName}</p>}
                    </div>
                    <ShadBadge variant={getStatusVariant(complaint.status)} className="capitalize">
                      {complaint.status.replace('_', ' ')}
                    </ShadBadge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">
                    Submitted on: {complaint.createdAt ? format(new Date(complaint.createdAt as string), "PPP") : 'N/A'}
                  </p>
                  <p className="text-foreground leading-relaxed mb-2"><strong>Issue:</strong> {complaint.issue}</p>
                  {complaint.escalationLevel && (
                     <p className="text-xs text-muted-foreground">Escalation: <span className="capitalize">{complaint.escalationLevel}</span></p>
                  )}
                  {/* Removed escalationNotes as it's not in the primary schema fields for display here */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-8">You haven't submitted any complaints yet, or you might need to log in.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
