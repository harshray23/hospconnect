
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
// RadioGroup and RadioGroupItem are not used in the star rating, can be removed if not needed elsewhere.
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group" 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Star, ServerCrash } from "lucide-react";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Hospital } from "@/lib/types"; 

const feedbackSchema = z.object({
  hospitalId: z.string({ required_error: "Please select a hospital." }).min(1, "Please select a hospital."),
  rating: z.coerce.number().min(1, "Rating is required (1-5 stars)").max(5, "Rating cannot exceed 5"),
  comment: z.string().min(10, { message: "Comment must be at least 10 characters." }).max(1000, "Comment cannot exceed 1000 characters."), // Renamed from comments
});

export function FeedbackForm() {
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false); // Renamed for clarity
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [errorLoadingHospitals, setErrorLoadingHospitals] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHospitals = async () => {
      setIsLoadingHospitals(true);
      setErrorLoadingHospitals(null);
      try {
        const hospitalsCollectionRef = collection(db, 'hospitals');
        const q = query(hospitalsCollectionRef, orderBy("name"));
        const hospitalSnapshot = await getDocs(q);
        const fetchedHospitals: Hospital[] = hospitalSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          // Ensure location and beds are at least empty objects if undefined from Firestore
          location: doc.data().location || { address: 'N/A' },
          beds: doc.data().beds || { icu: {}, general: {}, oxygen: {}, ventilator: {} },
         } as Hospital));
        setHospitals(fetchedHospitals);
      } catch (error) {
        console.error("Error fetching hospitals for feedback form:", error);
        setErrorLoadingHospitals("Could not load hospitals. Please try again later.");
        toast({
          title: "Error",
          description: "Could not load hospital list for feedback.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingHospitals(false);
      }
    };
    fetchHospitals();
  }, [toast]);

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      hospitalId: "",
      rating: 0, // Initialize with 0, user must select a rating
      comment: "",
    },
  });

  async function onSubmit(values: z.infer<typeof feedbackSchema>) {
    setIsSubmitting(true);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit feedback.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    if (values.rating === 0) {
        toast({
            title: "Rating Required",
            description: "Please select a star rating.",
            variant: "destructive",
        });
        setIsSubmitting(false);
        return;
    }


    try {
      const selectedHospital = hospitals.find(h => h.id === values.hospitalId);
      await addDoc(collection(db, "feedback"), {
        hospitalId: values.hospitalId,
        hospitalName: selectedHospital?.name || "N/A", // Denormalize hospital name
        patientId: currentUser.uid, // Use UID of the logged-in user as patientId
        rating: values.rating,
        comment: values.comment,
        submittedAt: serverTimestamp() as Timestamp, // Firestore server timestamp
      });
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
        variant: "default",
      });
      form.reset({ hospitalId: "", rating: 0, comment: "" }); // Reset form
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Failed",
        description: "Could not submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (isLoadingHospitals) {
    return <div className="flex items-center space-x-2"><Loader2 className="h-5 w-5 animate-spin" /> <span>Loading hospital list...</span></div>;
  }

  if (errorLoadingHospitals) {
    return <div className="text-destructive flex items-center space-x-2"><ServerCrash className="h-5 w-5" /> <span>{errorLoadingHospitals}</span></div>;
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="hospitalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Hospital</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={hospitals.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={hospitals.length > 0 ? "Choose the hospital you visited" : "No hospitals available"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {hospitals.map(hospital => (
                    <SelectItem key={hospital.id} value={hospital.id}>{hospital.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Overall Rating</FormLabel>
              <FormControl>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(starValue => (
                  <Button 
                    key={starValue}
                    type="button"
                    variant={field.value >= starValue ? "default" : "outline"}
                    size="icon"
                    className={`rounded-full transition-colors ${field.value >= starValue ? 'bg-yellow-400 hover:bg-yellow-500 border-yellow-400 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:border-yellow-500' : 'hover:bg-yellow-100 dark:hover:bg-yellow-500/20'}`}
                    onClick={() => field.onChange(starValue)}
                    aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
                  >
                    <Star className={`h-5 w-5 ${field.value >= starValue ? 'text-white fill-white dark:text-slate-900 dark:fill-slate-900' : 'text-yellow-400 fill-yellow-400 dark:text-yellow-500 dark:fill-yellow-500'}`} />
                  </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your experience..."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting || isLoadingHospitals || hospitals.length === 0} className="w-full md:w-auto">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Send className="mr-2 h-4 w-4" /> Submit Feedback
        </Button>
      </form>
    </Form>
  );
}
