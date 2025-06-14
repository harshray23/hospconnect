
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackForm } from "@/components/forms/FeedbackForm";
import type { Feedback as FeedbackType } from "@/lib/types";
import { MessageSquarePlus, MessageSquareText, Star, Loader2, ServerCrash } from "lucide-react";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase"; // auth might only be relevant if admins view feedback
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

// This page is now for public feedback submission.
// Listing past feedback might be removed or re-purposed for admins.

export default function PatientFeedbackPage() {
  const [userFeedback, setUserFeedback] = useState<FeedbackType[]>([]); // This list might be irrelevant for public users
  const [isLoading, setIsLoading] = useState(true); // For fetching past feedback, if applicable
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetching feedback might now be different.
  // Anonymous users can't see a list of *their* past feedback easily.
  // This section might be removed or re-purposed for admins.
  useEffect(() => {
    const currentUser = auth.currentUser; // Check if an admin is logged in
    if (currentUser) {
        // If an admin is logged in, they might see all feedback or feedback for their hospital.
        // This part needs specific logic based on who is viewing this page.
        // For now, it tries to fetch feedback associated with the logged-in user's UID.
      fetchFeedback(currentUser.uid);
    } else {
      setIsLoading(false); // No user, no feedback to fetch for "them"
    }
  }, []);

  const fetchFeedback = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const feedbackCollectionRef = collection(db, 'feedback');
      // This query is for a logged-in user viewing their own feedback.
      // Not directly applicable if this page is purely for public submission.
      const q = query(feedbackCollectionRef, where("patientId", "==", userId), orderBy("submittedAt", "desc"));
      const feedbackSnapshot = await getDocs(q);
      const fetchedFeedback: FeedbackType[] = feedbackSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate().toISOString() : data.submittedAt,
        } as FeedbackType;
      });
      setUserFeedback(fetchedFeedback);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError("Failed to load feedback history.");
      toast({
        title: "Error",
        description: "Could not load feedback history.",
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
            <MessageSquarePlus className="mr-2 h-7 w-7 text-primary" /> Submit Feedback
          </CardTitle>
          <CardDescription>Share your experience to help us and others. This form can be used by the general public.</CardDescription>
        </CardHeader>
        <CardContent>
          <FeedbackForm />
        </CardContent>
      </Card>

      {/* This section for viewing past feedback might be less relevant for anonymous public users */}
      {/* It's kept here for now, but would typically require a user to be logged in. */}
      {auth.currentUser && ( // Only show if a user (e.g. admin) is somehow logged in
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center">
                <MessageSquareText className="mr-2 h-7 w-7 text-primary" /> Submitted Feedback History (for logged-in user)
              </CardTitle>
              <CardDescription>A record of the feedback you've provided or are managing.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                    <span>Loading feedback history...</span>
                </div>
              ) : error ? (
                <div className="text-destructive flex flex-col items-center justify-center py-8">
                    <ServerCrash className="h-10 w-10 mb-2" />
                    <p>{error}</p>
                </div>
              ) : userFeedback.length > 0 ? (
                <ul className="space-y-6">
                  {userFeedback.map(feedback => (
                    <li key={feedback.id} className="p-4 border rounded-lg bg-card shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-primary">{feedback.hospitalName || 'N/A'}</h3>
                        <div className="flex items-center text-sm text-yellow-500 dark:text-yellow-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-5 w-5 ${i < feedback.rating ? 'fill-current' : 'text-muted-foreground opacity-50'}`} />
                          ))}
                          <span className="ml-1 text-muted-foreground">({feedback.rating}/5)</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">
                        Submitted on: {feedback.submittedAt ? format(new Date(feedback.submittedAt as string), "PPP") : 'N/A'}
                        {feedback.name && <span className="ml-2">by {feedback.name}</span>}
                      </p>
                      <p className="text-foreground leading-relaxed whitespace-pre-line">{feedback.comment}</p> 
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-8">No feedback history found for the logged-in user.</p>
              )}
            </CardContent>
          </Card>
      )}
    </div>
  );
}
