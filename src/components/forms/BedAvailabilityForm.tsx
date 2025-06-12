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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
// import { updateBedAvailability } from "@/lib/actions/hospital"; // Placeholder

interface BedData {
  available: number;
  total: number;
}

interface CurrentAvailabilityProps {
  icu: BedData;
  oxygen: BedData;
  ventilator: BedData;
  general: BedData;
  lastUpdated: string;
}

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
  currentAvailability: CurrentAvailabilityProps;
}

export function BedAvailabilityForm({ currentAvailability }: BedAvailabilityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      icu: currentAvailability.icu,
      oxygen: currentAvailability.oxygen,
      ventilator: currentAvailability.ventilator,
      general: currentAvailability.general,
    },
  });

  async function onSubmit(values: z.infer<typeof availabilitySchema>) {
    setIsLoading(true);
    // const result = await updateBedAvailability(values); // Placeholder
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = { success: true, message: "Bed availability updated successfully." };

    setIsLoading(false);
    if (result.success) {
      toast({
        title: "Update Successful",
        description: result.message,
        variant: "default",
      });
      // Potentially refetch data or update UI state
    } else {
      toast({
        title: "Update Failed",
        description: result.message || "Could not update bed availability.",
        variant: "destructive",
      });
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
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date(currentAvailability.lastUpdated).toLocaleString()}
        </p>
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
                        <Input type="number" {...field} />
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
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}
        </div>
        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <RefreshCw className="mr-2 h-4 w-4" /> Update Availability
        </Button>
      </form>
    </Form>
  );
}
