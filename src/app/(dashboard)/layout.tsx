
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react'; // Added React, useEffect, useState, useMemo
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Hospital, LayoutDashboard, UserCircle, MessageSquareText, AlertOctagon, LogOut, BedDouble, Stethoscope, UserPlus, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth, db } from '@/lib/firebase'; // Import auth and db
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth'; // Import onAuthStateChanged and signOut
import { doc, getDoc } from 'firebase/firestore'; // Import doc and getDoc
import type { UserProfile, UserRole } from '@/lib/types'; // Import UserProfile and UserRole types
import { useToast } from '@/hooks/use-toast';

const patientNavItems = [
  { href: '/patient/dashboard', label: 'Overview', icon: <LayoutDashboard /> },
  { href: '/patient/bookings', label: 'My Bookings', icon: <BedDouble /> }, // Assuming bookings page exists or will be created
  { href: '/patient/feedback', label: 'My Feedback', icon: <MessageSquareText /> },
  { href: '/patient/complaints', label: 'My Complaints', icon: <AlertOctagon /> },
];

const hospitalAdminNavItems = [
  { href: '/hospital/dashboard', label: 'Overview', icon: <LayoutDashboard /> },
  { href: '/hospital/beds', label: 'Bed Availability', icon: <BedDouble /> },
  { href: '/hospital/admissions', label: 'Manage Admissions', icon: <UserPlus /> },
  { href: '/hospital/bookings', label: 'Manage Bookings', icon: <Stethoscope /> }, // Assuming bookings page exists
  { href: '/hospital/feedback', label: 'Patient Feedback', icon: <MessageSquareText /> }, // Assuming feedback review page exists
  { href: '/hospital/complaints', label: 'Manage Complaints', icon: <AlertOctagon /> }, // Assuming complaint review page exists
];

const platformAdminNavItems = [
  { href: '/platform-admin/announcements', label: 'Announcements', icon: <LayoutDashboard /> },
  // Add more platform admin specific links here
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, fetch their profile from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile({ uid: firebaseUser.uid, ...userDocSnap.data() } as UserProfile);
          } else {
            console.error("No user profile found in Firestore for UID:", firebaseUser.uid);
            toast({ title: "Profile Error", description: "User profile not found.", variant: "destructive" });
            // Potentially redirect to a profile setup page or logout
            await signOut(auth); // Sign out if profile is missing
            router.push('/login');
          }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            toast({ title: "Error", description: "Could not load user profile.", variant: "destructive" });
            await signOut(auth);
            router.push('/login');
        }
      } else {
        // User is signed out
        setUserProfile(null);
        router.push('/login'); // Redirect to login if not authenticated
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router, toast]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logout Error", description: "Failed to log out. Please try again.", variant: "destructive" });
    }
  };
  
  const navItems = useMemo(() => {
    if (!userProfile) return [];
    switch (userProfile.role) {
      case 'patient':
        return patientNavItems;
      case 'hospital_admin':
        return hospitalAdminNavItems;
      case 'platform_admin':
        return platformAdminNavItems;
      default:
        return [];
    }
  }, [userProfile]);

  const baseDashboardPath = useMemo(() => {
     if (!userProfile) return "/";
     switch (userProfile.role) {
      case 'patient':
        return '/patient/dashboard';
      case 'hospital_admin':
        return '/hospital/dashboard';
      case 'platform_admin':
        return '/platform-admin/announcements'; // Example
      default:
        return "/";
    }
  }, [userProfile]);


  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading user session...</p>
      </div>
    );
  }

  if (!userProfile) {
    // This should ideally not be reached if redirection in useEffect works, but as a fallback:
    return (
         <div className="flex flex-col justify-center items-center min-h-screen">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4"/>
            <p className="text-xl mb-2">Access Denied</p>
            <p className="text-muted-foreground mb-6">You need to be logged in to view this page.</p>
            <Button asChild>
                <Link href="/login">Go to Login</Link>
            </Button>
        </div>
    );
  }


  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-[calc(100vh-5rem-1px)]"> {/* Adjust based on header/footer height */}
        <Sidebar collapsible="icon" variant="sidebar" className="border-r">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userProfile.profilePictureUrl || `https://placehold.co/100x100.png?text=${userProfile.name?.[0]}`} alt={userProfile.name || 'User'} data-ai-hint="profile avatar" />
                <AvatarFallback>{userProfile.name ? userProfile.name.substring(0,2).toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="font-semibold text-sm">{userProfile.name}</p>
                <p className="text-xs text-muted-foreground">{userProfile.email}</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (pathname.startsWith(item.href) && item.href !== baseDashboardPath && item.href !== '/') || (item.href === baseDashboardPath && pathname === baseDashboardPath)}
                    tooltip={item.label}
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      {React.cloneElement(item.icon, { className: "h-5 w-5" })}
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center" onClick={handleLogout}>
              <LogOut className="h-5 w-5 mr-2 group-data-[collapsible=icon]:mr-0" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
            {userProfile.role === 'hospital_admin' && (
                 <Button variant="link" className="w-full justify-start group-data-[collapsible=icon]:justify-center text-xs mt-2" asChild>
                    <Link href="/platform-admin/announcements">
                        <span className="group-data-[collapsible=icon]:hidden">Platform Admin Area</span>
                        <Hospital className="h-4 w-4 group-data-[collapsible=icon]:block hidden"/>
                    </Link>
                 </Button>
            )}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="p-4 md:p-8 flex-1 bg-background overflow-y-auto">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
