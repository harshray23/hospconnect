
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Star, ServerCrash } from "lucide-react";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import type { Hospital } from "@/lib/types"; // Import Hospital type

const feedbackSchema = z.object({
  hospitalId: z.string({ required_error: "Please select a hospital." }).min(1, "Please select a hospital."),
  rating: z.coerce.number().min(1, "Rating is required").max(5, "Rating cannot exceed 5"),
  comments: z.string().min(10, { message: "Comments must be at least 10 characters." }).max(1000, "Comments cannot exceed 1000 characters."),
});

export function FeedbackForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [errorLoadingHospitals, setErrorLoadingHospitals] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHospitals = async () => {
      setIsLoading(true);
      setErrorLoadingHospitals(null);
      try {
        const hospitalsCollectionRef = collection(db, 'hospitals');
        const q = query(hospitalsCollectionRef, orderBy("name"));
        const hospitalSnapshot = await getDocs(q);
        const fetchedHospitals: Hospital[] = hospitalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hospital));
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
        setIsLoading(false);
      }
    };
    fetchHospitals();
  }, [toast]);

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      hospitalId: "",
      rating: 0,
      comments: "",
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

    try {
      const selectedHospital = hospitals.find(h => h.id === values.hospitalId);
      await addDoc(collection(db, "feedback"), {
        ...values,
        userId: currentUser.uid,
        hospitalName: selectedHospital?.name || "N/A", // Denormalize hospital name
        submittedAt: serverTimestamp(),
      });
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
        variant: "default",
      });
      form.reset();
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
  
  if (isLoading) {
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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={hospitals.length === 0}>
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
                <RadioGroup
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  // defaultValue={field.value?.toString()} // defaultValue on RadioGroup might not update visually with react-hook-form state
                  value={field.value?.toString()} // Use value to control RadioGroup based on form state
                  className="flex space-x-2"
                >
                  {[1, 2, 3, 4, 5].map(starValue => (
                  <FormItem key={starValue} className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                       <Button 
                        type="button"
                        variant={field.value >= starValue ? "default" : "outline"}
                        size="icon"
                        className={`rounded-full transition-colors ${field.value >= starValue ? 'bg-yellow-400 hover:bg-yellow-500 border-yellow-400' : 'hover:bg-yellow-100'}`}
                        onClick={() => field.onChange(starValue)}
                        aria-label={`Rate ${starValue} star`}
                      >
                        <Star className={`h-5 w-5 ${field.value >= starValue ? 'text-white fill-white' : 'text-yellow-400 fill-yellow-400'}`} />
                       </Button>
                    </FormControl>
                  </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments</FormLabel>
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
        <Button type="submit" disabled={isSubmitting || isLoading || hospitals.length === 0} className="w-full md:w-auto">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Send className="mr-2 h-4 w-4" /> Submit Feedback
        </Button>
      </form>
    </Form>
  );
}
