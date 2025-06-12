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
import { Input } from "@/components/ui/input"; // Might not be needed if selecting hospital
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Star } from "lucide-react";
import { useState } from "react";
// import { submitFeedback } from "@/lib/actions/feedback"; // Placeholder

// Mock hospitals for selection - in a real app, this would be fetched or based on user's visit history
const mockHospitalsForFeedback = [
  { id: "1", name: "City General Hospital" },
  { id: "2", name: "St. Luke’s Medical Center" },
  { id: "3", name: "Community Health Clinic" },
];

const feedbackSchema = z.object({
  hospitalId: z.string({ required_error: "Please select a hospital." }),
  rating: z.coerce.number().min(1, "Rating is required").max(5, "Rating cannot exceed 5"),
  comments: z.string().min(10, { message: "Comments must be at least 10 characters." }).max(1000, "Comments cannot exceed 1000 characters."),
});

export function FeedbackForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      hospitalId: "",
      rating: 0,
      comments: "",
    },
  });

  async function onSubmit(values: z.infer<typeof feedbackSchema>) {
    setIsLoading(true);
    // const result = await submitFeedback(values); // Placeholder
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = { success: true, message: "Feedback submitted successfully. Thank you!" };
    
    setIsLoading(false);
    if (result.success) {
      toast({
        title: "Feedback Submitted",
        description: result.message,
        variant: "default",
      });
      form.reset();
    } else {
      toast({
        title: "Submission Failed",
        description: result.message || "Could not submit feedback. Please try again.",
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
              <FormLabel>Select Hospital</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose the hospital you visited" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockHospitalsForFeedback.map(hospital => (
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
                  defaultValue={field.value?.toString()}
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
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Send className="mr-2 h-4 w-4" /> Submit Feedback
        </Button>
      </form>
    </Form>
  );
}
