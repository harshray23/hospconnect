
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ImageUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase"; // Import Firebase auth and db
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // For creating user profile
import type { UserProfile } from "@/lib/types";

// TODO: Integrate Firebase Storage for profile picture upload

const registrationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  role: z.enum(["patient", "hospital_admin"], { required_error: "Please select a role." }),
  hospitalName: z.string().optional(),
  profilePicture: z.custom<FileList>((val) => val === undefined || val === null || val instanceof FileList, "Please upload a file.")
    .refine(
      (files) => !files || files.length === 0 || (files.length === 1 && files[0].type.startsWith("image/")),
      "Please select a single valid image file (e.g., PNG, JPG, WEBP)."
    ).nullable().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(data => data.role !== 'hospital_admin' || (data.role === 'hospital_admin' && data.hospitalName && data.hospitalName.length > 0), {
  message: "Hospital name is required for hospital admin registration.",
  path: ["hospitalName"],
});

export function RegistrationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRole = searchParams.get("role") === "hospital" ? "hospital_admin" : "patient";
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: initialRole as "patient" | "hospital_admin",
      hospitalName: "",
      profilePicture: null,
    },
  });

  const selectedRole = form.watch("role");

  async function onSubmit(values: z.infer<typeof registrationSchema>) {
    setIsLoading(true);
    let profilePictureUrl: string | undefined = undefined; // Placeholder for actual upload URL

    // Placeholder: Profile picture upload logic would go here
    if (values.profilePicture && values.profilePicture.length > 0) {
      const file = values.profilePicture[0];
      // TODO: Implement Firebase Storage upload here.
      // For now, simulate success and get a placeholder URL.
      // profilePictureUrl = await uploadFileToFirebaseStorage(file); // This function needs to be created
      toast({
        title: "Profile Picture Selected (Placeholder)",
        description: `File: ${file.name}. Actual upload to Firebase Storage is needed.`,
      });
      // profilePictureUrl = "https://placehold.co/100x100.png"; // Example placeholder
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Create user profile document in Firestore
      const userProfileData: Omit<UserProfile, 'uid' | 'createdAt'> & { hospitalNameIfAdmin?: string } = { // Omit uid as it's the doc ID
        name: values.name,
        email: user.email,
        role: values.role,
        profilePictureUrl: profilePictureUrl, // Store the URL from storage
        ...(values.role === 'hospital_admin' && { hospitalId: values.hospitalName }), // Conditionally add hospitalId (placeholder for now, should be a proper ID)
      };
      
      // Note: For hospital_admin, values.hospitalName is used as hospitalId.
      // In a real system, you might need to look up or create a hospital document and get its ID.
      // For now, we're using the name as a placeholder for the ID.
      // A Firebase Function (e.g., onCreate) would typically handle setting custom claims based on this 'role'.

      await setDoc(doc(db, "users", user.uid), {
        ...userProfileData,
        createdAt: serverTimestamp(), // Use server timestamp
      });

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please login.",
        variant: "default",
      });
      router.push('/login'); // Redirect to login page
      form.reset();
    } catch (error: any) {
      let errorMessage = "Could not create account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use.";
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{selectedRole === "hospital_admin" ? "Contact Person Name" : "Full Name"}</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} />
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
              <FormLabel>Password</FormLabel>
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
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Register as</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="hospital_admin">Hospital Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedRole === "hospital_admin" && (
          <>
            <FormField
              control={form.control}
              name="hospitalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospital Name (This will be used as a temporary Hospital ID)</FormLabel>
                  <FormControl>
                    <Input placeholder="City General Hospital" {...field} />
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
                  <FormLabel>Hospital Profile Picture (Optional)</FormLabel>
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
          </>
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
           {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Register
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/login">Login here</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
