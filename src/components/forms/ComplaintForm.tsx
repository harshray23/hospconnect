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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";
// import { submitComplaint } from "@/lib/actions/complaints"; // Placeholder

// Mock hospitals for selection - in a real app, this would be fetched or based on user's visit history
const mockHospitalsForComplaint = [
  { id: "1", name: "City General Hospital" },
  { id: "2", name: "St. Luke’s Medical Center" },
  { id: "3", name: "Community Health Clinic" },
  { id: "general", name: "General Complaint (Not specific to one hospital)" },
];

const complaintSchema = z.object({
  hospitalId: z.string().optional(), // Optional: user might have a general complaint
  description: z.string().min(20, { message: "Please provide a detailed description (min 20 characters)." }).max(2000, "Description cannot exceed 2000 characters."),
  contactPermission: z.boolean().default(false).refine(val => val === true, {
    message: "You must agree to be contacted for follow-up."
  })
});

export function ComplaintForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof complaintSchema>>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      hospitalId: "",
      description: "",
      contactPermission: false,
    },
  });

  async function onSubmit(values: z.infer<typeof complaintSchema>) {
    setIsLoading(true);
    // const result = await submitComplaint(values); // Placeholder
    await new Promise(resolve => setTimeout(resolve, 1500));
    const complaintId = `C${Date.now().toString().slice(-5)}`; // Mock ID
    const result = { success: true, message: `Complaint submitted successfully. Your complaint ID is ${complaintId}.` };
    
    setIsLoading(false);
    if (result.success) {
      toast({
        title: "Complaint Submitted",
        description: result.message,
        variant: "default",
      });
      form.reset();
    } else {
      toast({
        title: "Submission Failed",
        description: result.message || "Could not submit complaint. Please try again.",
        variant: "destructive",
      });
    }
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a hospital if applicable" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockHospitalsForComplaint.map(hospital => (
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description of Complaint</FormLabel>
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
                 <input 
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
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

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <ShieldAlert className="mr-2 h-4 w-4" /> Submit Complaint
        </Button>
      </form>
    </Form>
  );
}
