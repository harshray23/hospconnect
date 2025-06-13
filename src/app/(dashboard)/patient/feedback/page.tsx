
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeedbackForm } from "@/components/forms/FeedbackForm";
import type { Feedback as FeedbackType } from "@/lib/types"; // Renamed to avoid conflict
import { MessageSquarePlus, MessageSquareText, Star, Loader2, ServerCrash } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns'; // For formatting dates

export default function PatientFeedbackPage() {
  const [userFeedback, setUserFeedback] = useState<FeedbackType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchFeedback(user.uid);
      } else {
        setIsLoading(false);
        setUserFeedback([]);
        // Optionally, prompt user to login or handle appropriately
        toast({
          title: "Not Logged In",
          description: "Please log in to see your feedback.",
          variant: "default"
        });
      }
    });
    return () => unsubscribe(); // Cleanup subscription
  }, [toast]);

  const fetchFeedback = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const feedbackCollectionRef = collection(db, 'feedback');
      const q = query(feedbackCollectionRef, where("userId", "==", userId), orderBy("submittedAt", "desc"));
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
      setError("Failed to load your feedback. Please try again later.");
      toast({
        title: "Error",
        description: "Could not load your feedback.",
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
            <MessageSquarePlus className="mr-2 h-7 w-7 text-primary" /> Submit New Feedback
          </CardTitle>
          <CardDescription>Share your experience to help us and others.</CardDescription>
        </CardHeader>
        <CardContent>
          <FeedbackForm />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
             <MessageSquareText className="mr-2 h-7 w-7 text-primary" /> Your Submitted Feedback
          </CardTitle>
          <CardDescription>A record of the feedback you've provided.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span>Loading your feedback...</span>
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
                    <div className="flex items-center text-sm text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < feedback.rating ? 'fill-current' : 'text-muted-foreground opacity-50'}`} />
                      ))}
                       <span className="ml-1 text-muted-foreground">({feedback.rating}/5)</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">
                    Submitted on: {feedback.submittedAt ? format(new Date(feedback.submittedAt as string), "PPP") : 'N/A'}
                  </p>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">{feedback.comments}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-8">You haven't submitted any feedback yet, or you might need to log in.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
