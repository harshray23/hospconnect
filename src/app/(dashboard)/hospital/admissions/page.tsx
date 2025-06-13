
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
import { Loader2, UserPlus, ListChecks, ServerCrash, HospitalIcon, Phone, NotebookText } from "lucide-react";
import type { PatientRecord, TreatmentLog } from "@/lib/types"; // Using new PatientRecord type
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, Timestamp, doc, setDoc } from 'firebase/firestore';

// In a real app, get this from the logged-in hospital admin's context/profile (UserProfile.hospitalId)
const MOCK_HOSPITAL_ID = "CityGeneralAnytown"; 

// Schema for the new patient record form, aligning with PatientRecord type
const patientRecordSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name must be at least 2 characters." }),
  patientPhone: z.string().optional(), // Optional phone number
  admissionDate: z.date({ required_error: "Admission date is required."}),
  initialReason: z.string().min(10, { message: "Reason for admission must be at least 10 characters." }), // Will be part of treatmentLogs
  bedType: z.enum(["icu", "oxygen", "ventilator", "general"], { required_error: "Please select bed type." }),
  status: z.enum(["admitted", "discharged", "transferred"]).default("admitted"),
  additionalNotes: z.string().optional(), // Can also be part of treatmentLogs
});


export default function HospitalAdmissionsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // This should come from the logged-in hospital admin's profile (UserProfile.hospitalId)
  const hospitalId = MOCK_HOSPITAL_ID; 

  const form = useForm<z.infer<typeof patientRecordSchema>>({
    resolver: zodResolver(patientRecordSchema),
    defaultValues: {
      patientName: "",
      patientPhone: "",
      initialReason: "",
      additionalNotes: "",
      status: "admitted",
    },
  });
  
  const fetchPatientRecords = async (currentHospitalId: string) => {
    setIsLoadingRecords(true);
    setError(null);
    try {
      // Query 'patients' collection instead of 'admissions'
      const patientsCollectionRef = collection(db, 'patients');
      // Filter by assignedHospital
      // Firestore rules for 'patients' should allow hospital admins to read records for their hospital
      const q = query(patientsCollectionRef, where("assignedHospital", "==", currentHospitalId), orderBy("name", "asc")); // Assuming admission date isn't directly on patient doc for ordering
      const snapshot = await getDocs(q);
      const fetchedRecords: PatientRecord[] = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          // Convert treatmentLog timestamps if they exist
          const treatmentLogs = (data.treatmentLogs || []).map((log: any) => ({
              ...log,
              timestamp: log.timestamp instanceof Timestamp ? log.timestamp.toDate().toISOString() : log.timestamp
          }));
          return {
            id: docSnapshot.id, // This is the patientId (Firebase Auth UID or auto-generated)
            ...data,
            treatmentLogs,
          } as PatientRecord;
      });
      setPatientRecords(fetchedRecords);
    } catch (err) {
      console.error("Error fetching patient records:", err);
      setError("Failed to load patient records. Please ensure Firestore rules for 'patients' collection are set up correctly for hospital access.");
      toast({ title: "Error", description: "Could not load patient records.", variant: "destructive" });
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser && hospitalId) {
      // In a real app, verify this user is an admin for hospitalId
      // This check would typically involve looking up UserProfile for currentUser.uid
      fetchPatientRecords(hospitalId);
    } else {
      setIsLoadingRecords(false);
      setError("User not authenticated or hospital ID not set.");
       toast({ title: "Access Denied", description: "Login as hospital admin.", variant: "destructive"});
    }
  }, [hospitalId, toast]);


  async function onSubmit(values: z.infer<typeof patientRecordSchema>) {
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
    // Further check: ensure currentUser is an admin for this hospitalId (via UserProfile)

    try {
      // Create the initial treatment log
      const initialTreatmentLog: TreatmentLog = {
        note: `Admission Reason: ${values.initialReason}${values.additionalNotes ? ". Additional Notes: " + values.additionalNotes : ""}`,
        timestamp: serverTimestamp() as Timestamp // Server timestamp for the log
      };

      // Using patient's UID as document ID in 'patients' collection is good practice if patients log in.
      // If patients don't log in, an auto-generated ID is fine.
      // For this form, let's assume auto-generated ID if no patient UID is provided.
      // Or, we can require a patient ID to be entered/selected if managing existing patients.
      // For simplicity, let's auto-generate for new patient record.
      const newPatientDocRef = doc(collection(db, "patients"));


      const newPatientData: Omit<PatientRecord, 'id'> = {
        name: values.patientName,
        phone: values.patientPhone,
        assignedHospital: hospitalId,
        bedType: values.bedType,
        status: values.status,
        treatmentLogs: [initialTreatmentLog],
        medications: [], // Initialize as empty array
      };
      
      await setDoc(newPatientDocRef, newPatientData); // Using setDoc with an auto-gen ref
      
      // Optimistically add to UI or refetch
      setPatientRecords(prev => [{ ...newPatientData, id: newPatientDocRef.id, treatmentLogs: [{...initialTreatmentLog, timestamp: new Date().toISOString()}] }, ...prev]);

      toast({
        title: "Patient Record Created",
        description: `${values.patientName}'s record has been successfully created.`,
        variant: "default",
      });
      form.reset();
    } catch (error) {
      console.error("Error recording patient:", error);
      toast({
        title: "Record Creation Failed",
        description: "Could not create patient record. Please try again.",
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
                <CardTitle className="text-3xl font-headline">Record New Patient</CardTitle>
                <CardDescription>Enter details for new patients at {hospitalId || "your hospital"}.</CardDescription>
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
                name="patientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., +91-9876543210" {...field} />
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
                    <FormLabel>Admission Date (for initial log)</FormLabel>
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
                name="initialReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Admission / Initial Note</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the primary reason for admission or initial observation..."
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admitted">Admitted</SelectItem>
                          <SelectItem value="discharged">Discharged</SelectItem>
                          <SelectItem value="transferred">Transferred</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional for initial log)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any other relevant information for the initial log..."
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
                Create Patient Record
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
                    <CardTitle className="text-3xl font-headline">Current Patient Records</CardTitle>
                    <CardDescription>List of patients recorded at {hospitalId || "your hospital"}.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {isLoadingRecords ? (
             <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <span>Loading patient records...</span>
            </div>
          ) : error ? (
            <div className="text-destructive flex flex-col items-center justify-center py-8">
                <ServerCrash className="h-10 w-10 mb-2" />
                <p>{error}</p>
            </div>
          ) : patientRecords.length > 0 ? (
            <ul className="space-y-4">
              {patientRecords.map(record => (
                <li key={record.id} className="p-4 border rounded-lg bg-card shadow-sm">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-primary">{record.name}</h3>
                    <span className={`text-sm capitalize px-2 py-1 rounded-full ${record.status === 'admitted' ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300'}`}>{record.status}</span>
                  </div>
                  {record.phone && <p className="text-sm text-muted-foreground flex items-center"><Phone className="w-3 h-3 mr-1.5"/>{record.phone}</p>}
                  <p className="text-sm text-muted-foreground">
                    Bed: <span className="capitalize font-medium">{record.bedType || "N/A"}</span>
                  </p>
                  {record.treatmentLogs && record.treatmentLogs.length > 0 && (
                    <div className="mt-2">
                        <p className="text-xs font-semibold text-muted-foreground">Latest Log:</p>
                        <p className="text-sm mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                           "{record.treatmentLogs[record.treatmentLogs.length -1].note}" 
                           <span className="text-xs text-muted-foreground ml-1">({record.treatmentLogs[record.treatmentLogs.length -1].timestamp ? format(new Date(record.treatmentLogs[record.treatmentLogs.length -1].timestamp as string), "Pp") : 'N/A'})</span>
                        </p>
                    </div>
                  )}
                   {/* TODO: Add button to view full patient details / edit record */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">No patient records found for this hospital.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
