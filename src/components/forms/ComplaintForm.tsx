
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
import { Input } from "@/components/ui/input"; // Added for ticketId (optional)
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; // Using ShadCN Checkbox
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, ServerCrash } from "lucide-react";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Hospital } from "@/lib/types"; // For fetching hospital list

// Aligning with the new schema
const complaintSchema = z.object({
  hospitalId: z.string().optional(), 
  issue: z.string().min(20, { message: "Please provide a detailed description (min 20 characters)." }).max(2000, "Issue description cannot exceed 2000 characters."),
  contactPermission: z.boolean().default(false).refine(val => val === true, { // This field is not in schema, but good UX
    message: "You must agree to be contacted for follow-up."
  }),
  // Optional fields from schema
  // escalationLevel: z.enum(["local", "state"]).optional(),
  // ticketId: z.string().optional(),
});

export function ComplaintForm() {
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed from isLoading
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
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
          id: doc.id, ...doc.data(),
           location: doc.data().location || { address: 'N/A' },
           beds: doc.data().beds || { icu: {}, general: {}, oxygen: {}, ventilator: {} },
        } as Hospital));
        setHospitals(fetchedHospitals);
      } catch (error) {
        console.error("Error fetching hospitals for complaint form:", error);
        setErrorLoadingHospitals("Could not load hospitals. Please try again later.");
      } finally {
        setIsLoadingHospitals(false);
      }
    };
    fetchHospitals();
  }, []);


  const form = useForm<z.infer<typeof complaintSchema>>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      hospitalId: "",
      issue: "",
      contactPermission: false,
    },
  });

  async function onSubmit(values: z.infer<typeof complaintSchema>) {
    setIsSubmitting(true);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit a complaint.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    const ticketId = `CMP-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Date.now().toString().slice(-5)}`;

    try {
      const selectedHospital = hospitals.find(h => h.id === values.hospitalId);
      await addDoc(collection(db, "complaints"), {
        hospitalId: values.hospitalId || null, // Store null if no hospital selected
        hospitalName: selectedHospital?.name || "N/A (General Complaint)",
        patientId: currentUser.uid, // User's UID
        issue: values.issue,
        status: "pending", // Default status
        createdAt: serverTimestamp() as Timestamp,
        ticketId: ticketId, // Generated ticket ID
        // escalationLevel: values.escalationLevel || "local", // Default escalation
      });
      
      toast({
        title: "Complaint Submitted",
        description: `Your complaint has been submitted. Ticket ID: ${ticketId}.`,
        variant: "default",
      });
      form.reset();
    } catch (error) {
      console.error("Error submitting complaint:", error);
       toast({
        title: "Submission Failed",
        description: "Could not submit complaint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingHospitals) {
    return <div className="flex items-center space-x-2"><Loader2 className="h-5 w-5 animate-spin" /> <span>Loading hospital list...</span></div>;
  }

  if (errorLoadingHospitals && hospitals.length === 0) { // Only show error if list is empty
    return <div className="text-destructive flex items-center space-x-2"><ServerCrash className="h-5 w-5" /> <span>{errorLoadingHospitals} You can still submit a general complaint.</span></div>;
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="hospitalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Hospital (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoadingHospitals}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a hospital if applicable, or leave for general complaint" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">General Complaint (No specific hospital)</SelectItem>
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
          name="issue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description of Issue</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please describe the issue in detail, including dates, times, and names if relevant..."
                  className="resize-y min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contactPermission"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                 <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to be contacted by HospConnect or relevant authorities regarding this complaint.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <ShieldAlert className="mr-2 h-4 w-4" /> Submit Complaint
        </Button>
      </form>
    </Form>
  );
}
