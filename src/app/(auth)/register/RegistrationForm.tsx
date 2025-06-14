
'use client';

import { useSearchParams } from 'next/navigation';
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
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ImageUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";


// Schema for hospital admin registration
const registrationSchema = z.object({
  hospitalName: z.string().min(3, { message: "Hospital name must be at least 3 characters." }),
  contactPersonName: z.string().min(2, { message: "Contact person name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address for contact person." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  profilePicture: z.custom<FileList>((val) => val === undefined || val === null || val instanceof FileList, "Please upload a file.")
    .refine(
      (files) => !files || files.length === 0 || (files.length === 1 && files[0].type.startsWith("image/")),
      "Please select a single valid image file (e.g., PNG, JPG, WEBP)."
    ).nullable().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegistrationForm() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      hospitalName: "",
      contactPersonName: "",
      email: "",
      password: "",
      confirmPassword: "",
      profilePicture: null,
    },
  });

  async function onSubmit(values: z.infer<typeof registrationSchema>) {
    setIsLoading(true);
    let profilePictureUrl: string | undefined = undefined;

    // Placeholder: Profile picture upload logic would go here
    if (values.profilePicture && values.profilePicture.length > 0) {
      const file = values.profilePicture[0];
      // TODO: Implement Firebase Storage upload here.
      // For now, just log it or use a placeholder
      console.log("Profile picture selected (actual upload needed):", file.name);
      // profilePictureUrl = "https://placehold.co/100x100.png"; // Example placeholder
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const userProfileData: Omit<UserProfile, 'uid' | 'createdAt'> = {
        name: values.contactPersonName,
        email: user.email,
        role: "hospital_admin",
        hospitalId: values.hospitalName, 
        profilePictureUrl: profilePictureUrl,
      };
      
      await setDoc(doc(db, "users", user.uid), {
        ...userProfileData,
        createdAt: serverTimestamp(),
      });

      // TODO: Potentially create/update a document in a 'hospitals' collection here too

      toast({
        title: "Hospital Registration Successful",
        description: `${values.hospitalName} is registered. Please login.`,
        variant: "default",
      });
      router.push('/login');
      form.reset();
    } catch (error: any) {
      let errorMessage = "Could not create account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use for a contact person.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak.";
      }
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {ref && <p className="text-sm text-muted-foreground p-2 bg-secondary/50 rounded-md">Referral Code Applied: {ref}</p>}
        
        <FormField
          control={form.control}
          name="hospitalName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hospital Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., City General Hospital" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactPersonName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Dr. Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person Email (for login)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contact.person@hospital.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password for Contact Person</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="profilePicture"
            render={({ field: { onChange, value, ...restField }}) => (
            <FormItem>
                <FormLabel>Hospital Logo/Profile Picture (Optional)</FormLabel>
                <FormControl>
                <div className="flex items-center space-x-2">
                    <ImageUp className="h-5 w-5 text-muted-foreground" />
                    <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                        onChange(event.target.files);
                    }}
                    className="border-dashed border-input hover:border-primary transition-colors"
                    {...restField}
                    />
                </div>
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
           {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Register Hospital
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Already registered your hospital?{" "}
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/login">Login here</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
