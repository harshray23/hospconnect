
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
import { useState } from "react";
import { Loader2, UserPlus, ListChecks } from "lucide-react";
import type { PatientAdmission } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const admissionSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name must be at least 2 characters." }),
  admissionDate: z.date({ required_error: "Admission date is required."}),
  reason: z.string().min(10, { message: "Reason for admission must be at least 10 characters." }),
  bedType: z.enum(["icu", "oxygen", "ventilator", "general"], { required_error: "Please select bed type." }),
  notes: z.string().optional(),
});

// Mock existing admissions - in a real app, this would be fetched.
const mockPatientAdmissions: PatientAdmission[] = [
  {
    id: "adm1",
    hospitalId: "1", // Current hospital
    patientName: "John Patient",
    admissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    reason: "Severe pneumonia, requiring oxygen support.",
    bedType: "oxygen",
    status: "admitted",
  },
  {
    id: "adm2",
    hospitalId: "1",
    patientName: "Alice Wonder",
    admissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    reason: "Post-operative care for appendectomy.",
    bedType: "general",
    status: "admitted",
    notes: "Stable condition, recovering well."
  },
];

export default function HospitalAdmissionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [admissions, setAdmissions] = useState<PatientAdmission[]>(mockPatientAdmissions);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof admissionSchema>>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      patientName: "",
      reason: "",
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof admissionSchema>) {
    setIsLoading(true);
    // In a real application, you would send this data to a backend API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newAdmission: PatientAdmission = {
      id: `adm${Date.now()}`,
      hospitalId: "current_hospital_id", // Replace with actual hospital ID from context/session
      ...values,
      admissionDate: values.admissionDate.toISOString(),
      status: "admitted", // Default status on new admission
    };
    setAdmissions(prev => [newAdmission, ...prev]);

    setIsLoading(false);
    toast({
      title: "Patient Admitted",
      description: `${values.patientName} has been successfully recorded as admitted.`,
      variant: "default",
    });
    form.reset();
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center">
            <UserPlus className="h-8 w-8 text-primary mr-3" />
            <div>
                <CardTitle className="text-3xl font-headline">Record New Patient Admission</CardTitle>
                <CardDescription>Enter details for newly admitted patients.</CardDescription>
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
              <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                    <CardDescription>List of patients currently admitted.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {admissions.length > 0 ? (
            <ul className="space-y-4">
              {admissions.map(adm => (
                <li key={adm.id} className="p-4 border rounded-lg bg-card shadow-sm">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-primary">{adm.patientName}</h3>
                    <span className="text-sm capitalize px-2 py-1 rounded-full bg-green-100 text-green-700">{adm.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Admitted: {format(new Date(adm.admissionDate), "PPP")} | Bed: <span className="capitalize font-medium">{adm.bedType}</span>
                  </p>
                  <p className="text-sm mt-1"><strong>Reason:</strong> {adm.reason}</p>
                  {adm.notes && <p className="text-sm mt-1 text-muted-foreground"><em>Notes: {adm.notes}</em></p>}
                   <Button variant="outline" size="sm" className="mt-2">View/Edit Details</Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">No patients currently recorded as admitted.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
