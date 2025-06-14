
"use client"; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintForm } from "@/components/forms/ComplaintForm";
import type { Complaint as ComplaintType } from "@/lib/types";
import { AlertTriangle, FilePlus, ListChecks, Loader2, ServerCrash } from "lucide-react";
import { Badge as ShadBadge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase"; // Firebase imports still needed if admins can view user-submitted complaints
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

// This page might now be for general public to submit complaints, or for admins to view them.
// If for public, auth may not be required to submit, but needed to view *their own* past complaints (if they can be linked).
// For simplicity, let's assume this page is for public submission for now, and past complaints list might be removed or rethought.

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
  const [isLoading, setIsLoading] = useState(true); // For fetching past complaints, if applicable
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetching complaints might now be different.
  // If users are anonymous, they can't see a list of *their* past complaints easily.
  // This section might be removed or re-purposed for admins.
  // For now, let's keep it but note that anonymous users won't have a `userId` to filter by.
  useEffect(() => {
    const currentUser = auth.currentUser; // Check if a user *is* logged in (e.g., admin reviewing)
    if (currentUser) {
        // If an admin is logged in, they might see all complaints or those for their hospital.
        // This part needs specific logic based on who is viewing this page.
        // For now, it tries to fetch complaints associated with the logged-in user's UID,
        // which won't apply to anonymous public users.
        fetchComplaints(currentUser.uid);
    } else {
        setIsLoading(false); // No user, no complaints to fetch for "them"
        // For public users, they won't see a list of their *past* complaints unless a system for that exists (e.g. ticket ID lookup)
    }
  }, []);

  const fetchComplaints = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const complaintsCollectionRef = collection(db, 'complaints');
      // This query is for a logged-in user viewing their own complaints.
      // For public submissions, this list might not be relevant to them directly on this page.
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
      setError("Failed to load complaints history.");
      toast({
        title: "Error",
        description: "Could not load complaints history.",
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
            <FilePlus className="mr-2 h-7 w-7 text-primary" /> Submit a Complaint
          </CardTitle>
          <CardDescription>Report any issues or concerns regarding healthcare services. This form can be used by the general public.</CardDescription>
        </CardHeader>
        <CardContent>
          <ComplaintForm />
        </CardContent>
      </Card>

      {/* This section for viewing past complaints might be less relevant for anonymous public users */}
      {/* It's kept here for now, but would typically require a user to be logged in to see "their" complaints. */}
      {auth.currentUser && ( // Only show this section if a user (e.g. admin) is somehow logged in
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center">
                <ListChecks className="mr-2 h-7 w-7 text-primary" /> Submitted Complaints History (for logged-in user)
              </CardTitle>
              <CardDescription>Track the status of complaints you've submitted or are managing.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                    <span>Loading complaints history...</span>
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
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-8">No complaints history found for the logged-in user.</p>
              )}
            </CardContent>
          </Card>
        )}
    </div>
  );
}
