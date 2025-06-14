
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
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
import { LayoutDashboard, LogOut, BedDouble, Stethoscope, UserPlus, MessageSquareText, AlertOctagon, Loader2, ShieldAlert, Hospital as HospitalIconLucide, Megaphone } from 'lucide-react'; // Renamed Hospital to HospitalIconLucide, added Megaphone
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Removed patientNavItems

const hospitalAdminNavItems = [
  { href: '/hospital/dashboard', label: 'Overview', icon: <LayoutDashboard /> },
  { href: '/hospital/beds', label: 'Bed Availability', icon: <BedDouble /> },
  { href: '/hospital/admissions', label: 'Manage Admissions', icon: <UserPlus /> },
  { href: '/hospital/bookings', label: 'Manage Bookings', icon: <Stethoscope /> },
  { href: '/hospital/feedback', label: 'Patient Feedback', icon: <MessageSquareText /> },
  { href: '/hospital/complaints', label: 'Manage Complaints', icon: <AlertOctagon /> },
];

const platformAdminNavItems = [
  { href: '/platform-admin/announcements', label: 'Announcements', icon: <Megaphone /> }, // Changed icon
  // Add more platform admin specific links here like user management, hospital management etc.
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
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const profile = { uid: firebaseUser.uid, ...userDocSnap.data() } as UserProfile;
            // Ensure only hospital_admin or platform_admin can access dashboard areas
            if (profile.role === 'hospital_admin' || profile.role === 'platform_admin') {
              setUserProfile(profile);
            } else {
              toast({ title: "Access Denied", description: "You do not have permission to access this dashboard.", variant: "destructive" });
              await signOut(auth);
              router.push('/login'); // Or homepage '/'
            }
          } else {
            console.error("No user profile found for UID:", firebaseUser.uid);
            toast({ title: "Profile Error", description: "User profile not found.", variant: "destructive" });
            await signOut(auth);
            router.push('/login');
          }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            toast({ title: "Error", description: "Could not load user profile.", variant: "destructive" });
            await signOut(auth);
            router.push('/login');
        }
      } else {
        setUserProfile(null);
        router.push('/login');
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [router, toast]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logout Error", description: "Failed to log out. Please try again.", variant: "destructive" });
    }
  };
  
  const navItems = useMemo(() => {
    if (!userProfile) return [];
    // Removed 'patient' case
    switch (userProfile.role) {
      case 'hospital_admin':
        return hospitalAdminNavItems;
      case 'platform_admin':
        return platformAdminNavItems;
      default:
        return []; // Should not happen if access control in useEffect is correct
    }
  }, [userProfile]);

  const baseDashboardPath = useMemo(() => {
     if (!userProfile) return "/login"; // Default to login if no profile
     // Removed 'patient' case
     switch (userProfile.role) {
      case 'hospital_admin':
        return '/hospital/dashboard';
      case 'platform_admin':
        return '/platform-admin/announcements';
      default:
        return "/login"; // Fallback to login
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
    return (
         <div className="flex flex-col justify-center items-center min-h-screen">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4"/>
            <p className="text-xl mb-2">Access Denied</p>
            <p className="text-muted-foreground mb-6">You need to be logged in as hospital staff to view this page.</p>
            <Button asChild>
                <Link href="/login">Go to Login</Link>
            </Button>
        </div>
    );
  }


  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-[calc(100vh-5rem-1px)]">
        <Sidebar collapsible="icon" variant="sidebar" className="border-r">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userProfile.profilePictureUrl || `https://placehold.co/100x100.png?text=${userProfile.name?.[0]}`} alt={userProfile.name || 'User'} data-ai-hint="profile avatar hospital logo" />
                <AvatarFallback>{userProfile.name ? userProfile.name.substring(0,2).toUpperCase() : 'HA'}</AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="font-semibold text-sm">{userProfile.name}</p>
                <p className="text-xs text-muted-foreground">{userProfile.email}</p>
                 {userProfile.role === 'hospital_admin' && userProfile.hospitalId && (
                    <p className="text-xs text-muted-foreground">Hospital: {userProfile.hospitalId}</p>
                 )}
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
            {/* Link to Platform Admin area for users with platform_admin role */}
            {userProfile.role === 'platform_admin' && pathname.startsWith('/hospital') && (
                 <Button variant="link" className="w-full justify-start group-data-[collapsible=icon]:justify-center text-xs mt-2" asChild>
                    <Link href="/platform-admin/announcements">
                        <span className="group-data-[collapsible=icon]:hidden">Switch to Platform Admin</span>
                        <HospitalIconLucide className="h-4 w-4 group-data-[collapsible=icon]:block hidden"/>
                    </Link>
                 </Button>
            )}
             {/* Link for hospital_admin to switch to platform admin, if they also have platform_admin capabilities (this is unusual, typically distinct roles) */}
             {/* Or, if a hospital admin wants to see what platform admins see (e.g. announcements) */}
            {userProfile.role === 'hospital_admin' && (
                 <Button variant="link" className="w-full justify-start group-data-[collapsible=icon]:justify-center text-xs mt-2" asChild>
                    <Link href="/platform-admin/announcements"> 
                        <span className="group-data-[collapsible=icon]:hidden">View Platform Announcements</span>
                        <Megaphone className="h-4 w-4 group-data-[collapsible=icon]:block hidden"/>
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
