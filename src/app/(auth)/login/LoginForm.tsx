
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Firebase imports removed: import { auth, db } from "@/lib/firebase";
// Firebase imports removed: import { signInWithEmailAndPassword } from "firebase/auth";
// Firebase imports removed: import { doc, getDoc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

// Mock users for simulation since Firebase is removed
const mockUsers: { [email: string]: UserProfile & { passwordPlain: string } } = {
  "hospital.admin@example.com": {
    uid: "mock_hospital_admin_1",
    name: "Dr. Hospital Admin",
    email: "hospital.admin@example.com",
    role: "hospital_admin",
    hospitalId: "CityGeneralAnytown",
    profilePictureUrl: "https://placehold.co/100x100.png?text=HA",
    createdAt: new Date().toISOString(),
    passwordPlain: "password123",
  },
  "platform.admin@example.com": {
    uid: "mock_platform_admin_1",
    name: "Platform Super Admin",
    email: "platform.admin@example.com",
    role: "platform_admin",
    profilePictureUrl: "https://placehold.co/100x100.png?text=PA",
    createdAt: new Date().toISOString(),
    passwordPlain: "password456",
  },
};


export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      // Simulate Firebase login
      console.log("Simulating login for:", values.email);
      // const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password); // Firebase removed
      // const firebaseUser = userCredential.user; // Firebase removed

      // Fetch user profile to determine role (simulated)
      const mockUserEntry = mockUsers[values.email];

      if (!mockUserEntry || mockUserEntry.passwordPlain !== values.password) {
        // Simulate auth/user-not-found or auth/wrong-password
         await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        throw new Error("Invalid email or password (simulated).");
      }
      
      const userProfile = mockUserEntry;
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));


      toast({
        title: "Login Successful (Simulated)",
        description: `Welcome back, ${userProfile.name}! Redirecting...`,
        variant: "default",
      });
      
      // Store mock user profile in localStorage for dashboard layout to pick up (simplistic session management)
      if (typeof window !== "undefined") {
        localStorage.setItem("mockUserProfile", JSON.stringify(userProfile));
      }


      if (userProfile.role === "hospital_admin") {
        router.push("/hospital/dashboard");
      } else if (userProfile.role === "platform_admin") {
        router.push("/platform-admin/announcements"); 
      } else {
        toast({ title: "Access Denied", description: "Your role does not have dashboard access.", variant: "destructive" });
        // await auth.signOut(); // Firebase removed
        if (typeof window !== "undefined") {
            localStorage.removeItem("mockUserProfile");
        }
        router.push("/"); 
      }

    } catch (error: any) {
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.message.includes("Invalid email or password")) {
        errorMessage = error.message;
      }
      console.error("Simulated login error:", error);
      toast({
        title: "Login Failed (Simulated)",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="hospital.admin@email.com" {...field} />
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login as Staff
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Don't have a hospital account?{" "}
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/register">Register Your Hospital</Link>
          </Button>
        </div>
         <div className="text-xs text-center text-muted-foreground pt-4">
          <p>Mock Users (for simulation):</p>
          <p>hospital.admin@example.com / password123</p>
          <p>platform.admin@example.com / password456</p>
        </div>
      </form>
    </Form>
  );
}
