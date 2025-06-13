
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, UserPlus, ListChecks, ServerCrash } from "lucide-react";
import type { PatientAdmission } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';

// In a real app, get this from the logged-in hospital admin's context/profile
const MOCK_HOSPITAL_ID = "CityGeneralAnytown"; // Replace with actual logic to get hospital ID

const admissionSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name must be at least 2 characters." }),
  admissionDate: z.date({ required_error: "Admission date is required."}),
  reason: z.string().min(10, { message: "Reason for admission must be at least 10 characters." }),
  bedType: z.enum(["icu", "oxygen", "ventilator", "general"], { required_error: "Please select bed type." }),
  notes: z.string().optional(),
});


export default function HospitalAdmissionsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(true);
  const [admissions, setAdmissions] = useState<PatientAdmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Placeholder for hospital ID
  const hospitalId = MOCK_HOSPITAL_ID; 

  const form = useForm<z.infer<typeof admissionSchema>>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      patientName: "",
      reason: "",
      notes: "",
    },
  });
  
  const fetchAdmissions = async (currentHospitalId: string) => {
    setIsLoadingAdmissions(true);
    setError(null);
    try {
      const admissionsCollectionRef = collection(db, 'admissions');
      // Note: You'll need to create Firestore rules for the 'admissions' collection.
      // Example rule: allow read, write: if request.auth != null && get(/databases/$(database)/documents/hospitals/$(request.resource.data.hospitalId)).data.adminUids[request.auth.uid] == true;
      // This is a complex rule and needs careful consideration for your auth model.
      const q = query(admissionsCollectionRef, where("hospitalId", "==", currentHospitalId), orderBy("admissionDate", "desc"));
      const snapshot = await getDocs(q);
      const fetchedAdmissions: PatientAdmission[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            admissionDate: data.admissionDate instanceof Timestamp ? data.admissionDate.toDate().toISOString() : data.admissionDate,
          } as PatientAdmission;
      });
      setAdmissions(fetchedAdmissions);
    } catch (err) {
      console.error("Error fetching admissions:", err);
      setError("Failed to load admissions. Please ensure Firestore rules for 'admissions' collection are set up.");
      toast({ title: "Error", description: "Could not load admissions.", variant: "destructive" });
    } finally {
      setIsLoadingAdmissions(false);
    }
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser && hospitalId) {
      // In a real app, verify this user is an admin for hospitalId
      fetchAdmissions(hospitalId);
    } else {
      setIsLoadingAdmissions(false);
      setError("User not authenticated or hospital ID not set.");
       toast({ title: "Access Denied", description: "Login as hospital admin.", variant: "destructive"});
    }
  }, [hospitalId, toast]);


  async function onSubmit(values: z.infer<typeof admissionSchema>) {
    setIsSubmitting(true);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (!hospitalId) {
      toast({ title: "Configuration Error", description: "Hospital ID is not set.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    // Further check: ensure currentUser is an admin for this hospitalId

    try {
      const newAdmissionData = {
        ...values,
        hospitalId: hospitalId, 
        admissionDate: Timestamp.fromDate(values.admissionDate),
        status: "admitted" as PatientAdmission['status'],
        recordedBy: currentUser.uid,
      };
      const docRef = await addDoc(collection(db, "admissions"), newAdmissionData);
      
      // Optimistically add to UI or refetch
      setAdmissions(prev => [{ ...newAdmissionData, id: docRef.id, admissionDate: values.admissionDate.toISOString() }, ...prev]);

      toast({
        title: "Patient Admitted",
        description: `${values.patientName} has been successfully recorded.`,
        variant: "default",
      });
      form.reset();
    } catch (error) {
      console.error("Error recording admission:", error);
      toast({
        title: "Admission Failed",
        description: "Could not record admission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center">
            <UserPlus className="h-8 w-8 text-primary mr-3" />
            <div>
                <CardTitle className="text-3xl font-headline">Record New Patient Admission</CardTitle>
                <CardDescription>Enter details for newly admitted patients for {hospitalId || "your hospital"}.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="admissionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Admission Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Admission</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the primary reason for admission..."
                        className="resize-y min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="bedType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bed Type Assigned</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bed type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General Ward</SelectItem>
                          <SelectItem value="oxygen">Oxygen Supported</SelectItem>
                          <SelectItem value="icu">ICU</SelectItem>
                          <SelectItem value="ventilator">Ventilator Supported</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any other relevant information..."
                        className="resize-y min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || !hospitalId}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Admission
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
            <div className="flex items-center">
                <ListChecks className="h-8 w-8 text-primary mr-3" />
                <div>
                    <CardTitle className="text-3xl font-headline">Current Admissions</CardTitle>
                    <CardDescription>List of patients currently admitted at {hospitalId || "your hospital"}.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {isLoadingAdmissions ? (
             <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span>Loading admissions...</span>
            </div>
          ) : error ? (
            <div className="text-destructive flex flex-col items-center justify-center py-8">
                <ServerCrash className="h-10 w-10 mb-2" />
                <p>{error}</p>
            </div>
          ) : admissions.length > 0 ? (
            <ul className="space-y-4">
              {admissions.map(adm => (
                <li key={adm.id} className="p-4 border rounded-lg bg-card shadow-sm">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-primary">{adm.patientName}</h3>
                    <span className={`text-sm capitalize px-2 py-1 rounded-full ${adm.status === 'admitted' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{adm.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Admitted: {adm.admissionDate ? format(new Date(adm.admissionDate as string), "PPP") : "N/A"} | Bed: <span className="capitalize font-medium">{adm.bedType}</span>
                  </p>
                  <p className="text-sm mt-1"><strong>Reason:</strong> {adm.reason}</p>
                  {adm.notes && <p className="text-sm mt-1 text-muted-foreground"><em>Notes: {adm.notes}</em></p>}
                   {/* <Button variant="outline" size="sm" className="mt-2">View/Edit Details</Button> */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">No patients currently recorded as admitted for this hospital.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
