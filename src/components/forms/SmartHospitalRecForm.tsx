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
import { useToast } from "@/hooks/use-toast";
import { getSmartRecommendations } from "@/lib/actions/recommendations"; // To be created
import type { RecommendHospitalsInput, RecommendHospitalsOutput } from "@/ai/flows/smart-hospital-recommendations";
import { Loader2, SearchCheck } from "lucide-react";

const recommendationSchema = z.object({
  medicalRequirements: z.string().min(10, { message: "Please describe your medical needs (min 10 characters)." }),
  location: z.string().min(3, { message: "Please enter your current location (min 3 characters)." }),
});

interface SmartHospitalRecFormProps {
  onRecommendationsFetched: (data: RecommendHospitalsOutput | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export function SmartHospitalRecForm({ onRecommendationsFetched, setIsLoading }: SmartHospitalRecFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof recommendationSchema>>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      medicalRequirements: "",
      location: "",
    },
  });

  async function onSubmit(values: z.infer<typeof recommendationSchema>) {
    setIsLoading(true);
    onRecommendationsFetched(null); // Clear previous recommendations

    const result = await getSmartRecommendations(values as RecommendHospitalsInput);
    
    if (result.success && result.data) {
      toast({
        title: "Recommendations Found",
        description: "AI has suggested some hospitals for you.",
        variant: "default",
      });
      onRecommendationsFetched(result.data);
    } else {
      toast({
        title: "Error Fetching Recommendations",
        description: result.error || "Could not get recommendations at this time. Please try again.",
        variant: "destructive",
      });
      onRecommendationsFetched(null);
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="medicalRequirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical Requirements</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Chest pain, difficulty breathing, need cardiac specialist..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 123 Main St, Anytown or Anytown City Center" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <SearchCheck className="mr-2 h-4 w-4" /> Get AI Recommendations
        </Button>
      </form>
    </Form>
  );
}
