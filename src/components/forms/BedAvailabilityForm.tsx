
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import type { BedAvailabilityData } from "@/lib/types";


const bedInputSchema = z.object({
  available: z.coerce.number().min(0, "Cannot be negative").int("Must be an integer"),
  total: z.coerce.number().min(0, "Cannot be negative").int("Must be an integer"),
}).refine(data => data.available <= data.total, {
  message: "Available beds cannot exceed total beds",
  path: ["available"],
});

const availabilitySchema = z.object({
  icu: bedInputSchema,
  oxygen: bedInputSchema,
  ventilator: bedInputSchema,
  general: bedInputSchema,
});

interface BedAvailabilityFormProps {
  currentAvailability: BedAvailabilityData;
  hospitalId: string; 
  onUpdateSuccess: (updatedData: BedAvailabilityData) => void;
}

export function BedAvailabilityForm({ currentAvailability, hospitalId, onUpdateSuccess }: BedAvailabilityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: currentAvailability,
  });
  
  useEffect(() => {
    form.reset(currentAvailability);
  }, [currentAvailability, form]);


  async function onSubmit(values: z.infer<typeof availabilitySchema>) {
    setIsSubmitting(true);

    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to update bed availability.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    // Future: Verify currentUser is an admin for this hospitalId via UserProfile

    try {
      const hospitalDocRef = doc(db, "hospitals", hospitalId);
      
      // Firestore update payload
      const updatePayload = { 
        beds: values,
        lastUpdated: serverTimestamp() // Firestore server-side timestamp
      };
      
      await updateDoc(hospitalDocRef, updatePayload);
      
      toast({
        title: "Update Successful",
        description: "Bed availability has been updated.",
        variant: "default",
      });
      onUpdateSuccess(values); 
      // form.reset(values); // Keep form as is or reset to new values, current is fine.
    } catch (error) {
      console.error("Error updating bed availability:", error);
      toast({
        title: "Update Failed",
        description: "Could not update bed availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const bedTypes: Array<{ name: keyof z.infer<typeof availabilitySchema>; label: string }> = [
    { name: "icu", label: "ICU Beds" },
    { name: "oxygen", label: "Oxygen Supported Beds" },
    { name: "ventilator", label: "Ventilator Supported Beds" },
    { name: "general", label: "General Ward Beds" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bedTypes.map(bedType => (
            <Card key={bedType.name} className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center">
                  <BedDouble className="mr-2 h-5 w-5 text-primary" /> {bedType.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name={`${bedType.name}.available`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Beds</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`${bedType.name}.total`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Beds</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}
        </div>
        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || !hospitalId}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <RefreshCw className="mr-2 h-4 w-4" /> Update Availability
        </Button>
      </form>
    </Form>
  );
}
