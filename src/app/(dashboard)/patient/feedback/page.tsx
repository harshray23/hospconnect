import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeedbackForm } from "@/components/forms/FeedbackForm"; // To be created
import type { Feedback } from "@/lib/types";
import { MessageSquarePlus, MessageSquareText, Star } from "lucide-react";
import Link from "next/link";

// Mock existing feedback - in a real app, this would be fetched.
const mockUserFeedback: Feedback[] = [
  {
    id: "fb1",
    hospitalId: "1", // Corresponds to City General Hospital
    hospitalName: "City General Hospital",
    rating: 5,
    comments: "Excellent care and facilities. The staff were very attentive.",
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "fb2",
    hospitalId: "2", // Corresponds to St. Luke’s Medical Center
    hospitalName: "St. Luke’s Medical Center",
    rating: 4,
    comments: "Good service, but the waiting time was a bit long.",
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
];

export default function PatientFeedbackPage() {
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
          {mockUserFeedback.length > 0 ? (
            <ul className="space-y-6">
              {mockUserFeedback.map(feedback => (
                <li key={feedback.id} className="p-4 border rounded-lg bg-card shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-primary">{feedback.hospitalName || 'N/A'}</h3>
                    <div className="flex items-center text-sm text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < feedback.rating ? 'fill-current' : 'text-muted-foreground'}`} />
                      ))}
                       <span className="ml-1 text-muted-foreground">({feedback.rating}/5)</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">
                    Submitted on: {new Date(feedback.submittedAt).toLocaleDateString()}
                  </p>
                  <p className="text-foreground leading-relaxed">{feedback.comments}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-8">You haven't submitted any feedback yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
