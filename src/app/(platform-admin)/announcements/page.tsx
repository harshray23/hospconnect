
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Megaphone, Send } from "lucide-react";
import type { Announcement } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const announcementSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  content: z.string().min(20, { message: "Content must be at least 20 characters." }),
  targetAudience: z.enum(["all_hospitals", "specific_hospitals"], { required_error: "Please select target audience."}),
  // hospitalIds: z.string().optional(), // For future implementation if target is specific hospitals
});

// Mock existing announcements - in a real app, this would be fetched.
const mockAnnouncements: Announcement[] = [
  {
    id: "anno1",
    title: "COVID-19 Booster Dose Drive",
    content: "All hospitals are requested to prepare for the upcoming COVID-19 booster dose drive starting next month. Detailed guidelines will be shared soon.",
    issuedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    targetAudience: "all_hospitals",
  },
  {
    id: "anno2",
    title: "System Maintenance Alert",
    content: "The HospConnect platform will undergo scheduled maintenance on Sunday from 2 AM to 4 AM. Services might be temporarily unavailable.",
    issuedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    targetAudience: "all_hospitals",
  },
];


export default function PlatformAdminAnnouncementsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      targetAudience: "all_hospitals",
    },
  });

  async function onSubmit(values: z.infer<typeof announcementSchema>) {
    setIsLoading(true);
    // In a real application, you would send this data to a backend API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newAnnouncement: Announcement = {
      id: `anno${Date.now()}`,
      ...values,
      issuedAt: new Date().toISOString(),
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);

    setIsLoading(false);
    toast({
      title: "Announcement Sent!",
      description: "The announcement has been successfully published to the targeted hospitals.",
      variant: "default",
    });
    form.reset();
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Megaphone className="h-8 w-8 text-primary mr-3" />
              <div>
                <CardTitle className="text-3xl font-headline">Manage Announcements</CardTitle>
                <CardDescription>Create and view announcements for registered hospitals.</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Announcement Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter announcement title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Announcement Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write the detailed announcement here..."
                        className="resize-y min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target audience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all_hospitals">All Hospitals</SelectItem>
                          <SelectItem value="specific_hospitals" disabled>Specific Hospitals (Coming Soon)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Publish Announcement
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Published Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length > 0 ? (
            <ul className="space-y-4">
              {announcements.map(ann => (
                <li key={ann.id} className="p-4 border rounded-lg bg-card shadow-sm">
                  <h3 className="font-semibold text-lg text-primary">{ann.title}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Issued on: {new Date(ann.issuedAt).toLocaleDateString()}
                  </p>
                  <p className="text-foreground whitespace-pre-line">{ann.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">Audience: {ann.targetAudience.replace('_', ' ')}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">No announcements published yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-xl">
         <CardHeader>
            <CardTitle className="text-2xl font-headline">Contact Government Medical Services</CardTitle>
            <CardDescription>Use this section to send official communications or reports. (Feature Coming Soon)</CardDescription>
         </CardHeader>
         <CardContent>
            <p className="text-muted-foreground">This feature is under development. Please check back later.</p>
             <Button disabled className="mt-4">Compose Message (Coming Soon)</Button>
         </CardContent>
      </Card>
    </div>
  );
}
