
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
import { useSearchParams } from "next/navigation";
import { Loader2, ImageUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { registerUser } from "@/lib/actions/auth"; // Placeholder

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
    // Placeholder for actual registration logic
    console.log("Form values submitted:", values);

    let profileImageUrl: string | undefined = undefined;

    if (values.profilePicture && values.profilePicture.length > 0) {
      const file = values.profilePicture[0];
      console.log("Profile picture selected:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      // TODO: Implement Firebase Storage upload here
      // 1. Upload `file` to Firebase Storage (e.g., to a path like `hospital-profiles/{hospitalId}/profileImage.jpg`)
      // 2. Get the downloadURL of the uploaded image. This URL (profileImageUrl) would then be saved
      //    with the hospital's data in Firestore.
      // For now, we'll just show a toast.
      toast({
        title: "Profile Picture Selected",
        description: `File: ${file.name}. In a real app, this would now be uploaded.`,
      });
      // profileImageUrl = "url_from_firebase_storage_after_upload"; // Placeholder
    }

    // const result = await registerUser({...values, profileImageUrl }); // Placeholder
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = { success: true, message: "Registration successful!" };

    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please login.",
        variant: "default",
      });
      // Add redirection to login page: router.push('/login');
      form.reset(); // Reset form fields including file input
    } else {
      toast({
        title: "Registration Failed",
        description: result.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
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
                  <FormLabel>Hospital Name</FormLabel>
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
              render={({ field: { onChange, value, ...restField }}) => ( // Correctly destructure field
                <FormItem>
                  <FormLabel>Hospital Profile Picture (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                       <ImageUp className="h-5 w-5 text-muted-foreground" />
                       <Input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                           onChange(event.target.files); // Pass FileList to RHF
                        }}
                        className="border-dashed border-input hover:border-primary transition-colors"
                        {...restField} // Pass other RHF props
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

