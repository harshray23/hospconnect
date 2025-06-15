
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
  SidebarInset, // Corrected: Added SidebarInset import
} from '@/components/ui/sidebar';
import { LayoutDashboard, LogOut, BedDouble, Stethoscope, UserPlus, MessageSquareText, AlertOctagon, Loader2, ShieldAlert, Hospital as HospitalIconLucide, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// Firebase imports removed: import { auth, db } from '@/lib/firebase';
// Firebase imports removed: import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
// Firebase imports removed: import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


const hospitalAdminNavItems = [
  { href: '/hospital/dashboard', label: 'Overview', icon: <LayoutDashboard /> },
  { href: '/hospital/beds', label: 'Bed Availability', icon: <BedDouble /> },
  { href: '/hospital/admissions', label: 'Manage Admissions', icon: <UserPlus /> },
  { href: '/hospital/bookings', label: 'Manage Bookings', icon: <Stethoscope /> },
  { href: '/hospital/feedback', label: 'Patient Feedback', icon: <MessageSquareText /> },
  { href: '/hospital/complaints', label: 'Manage Complaints', icon: <AlertOctagon /> },
];

const platformAdminNavItems = [
  { href: '/platform-admin/announcements', label: 'Announcements', icon: <Megaphone /> },
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
    // Simulate fetching user profile from localStorage (since Firebase is removed)
    setIsLoadingAuth(true);
    if (typeof window !== "undefined") {
      const storedProfile = localStorage.getItem("mockUserProfile");
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile) as UserProfile;
          if (profile.role === 'hospital_admin' || profile.role === 'platform_admin') {
            setUserProfile(profile);
          } else {
            toast({ title: "Access Denied", description: "You do not have permission to access this dashboard.", variant: "destructive" });
            localStorage.removeItem("mockUserProfile");
            router.push('/login');
          }
        } catch (e) {
          console.error("Error parsing mockUserProfile from localStorage", e);
          localStorage.removeItem("mockUserProfile");
          router.push('/login');
        }
      } else {
        // No mock profile found, redirect to login
        // Only redirect if not already on a public-ish page or login page itself
        if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
             router.push('/login');
        }
      }
    }
    setIsLoadingAuth(false);
  }, [pathname, router, toast]);

  const handleLogout = async () => {
    // Simulate logout
    if (typeof window !== "undefined") {
      localStorage.removeItem("mockUserProfile");
    }
    setUserProfile(null);
    toast({ title: "Logged Out (Simulated)", description: "You have been successfully logged out." });
    router.push('/login');
  };
  
  const navItems = useMemo(() => {
    if (!userProfile) return [];
    switch (userProfile.role) {
      case 'hospital_admin':
        return hospitalAdminNavItems;
      case 'platform_admin':
        return platformAdminNavItems;
      default:
        return []; 
    }
  }, [userProfile]);

  const baseDashboardPath = useMemo(() => {
     if (!userProfile) return "/login"; 
     switch (userProfile.role) {
      case 'hospital_admin':
        return '/hospital/dashboard';
      case 'platform_admin':
        return '/platform-admin/announcements';
      default:
        return "/login"; 
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

  // If not loading and no user profile, and not on login/register, show access denied.
  // This check can be more robust based on public/private routes.
  if (!userProfile && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
    return (
         <div className="flex flex-col justify-center items-center min-h-screen">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4"/>
            <p className="text-xl mb-2">Access Denied</p>
            <p className="text-muted-foreground mb-6">You need to be logged in as staff to view this page.</p>
            <Button asChild>
                <Link href="/login">Go to Login</Link>
            </Button>
        </div>
    );
  }
  
  // If userProfile exists or on login/register page, render the layout.
  // This ensures login/register pages are accessible without a profile.
  if (!userProfile && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return <>{children}</>; // Render children directly for auth pages if no profile (to show login/register form)
  }
  
  if (!userProfile) {
      // This case should ideally be caught by the isLoadingAuth or the redirect in useEffect
      // But as a fallback, if still no profile and not an auth page, show loader or redirect.
      // For now, let's assume useEffect handles redirection.
      return (
         <div className="flex justify-center items-center min-h-screen">
           <Loader2 className="h-12 w-12 animate-spin text-primary" />
           <p className="ml-4 text-lg">Redirecting...</p>
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
                <AvatarFallback>{userProfile.name ? userProfile.name.substring(0,2).toUpperCase() : 'SA'}</AvatarFallback>
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
            {userProfile.role === 'platform_admin' && pathname.startsWith('/hospital') && (
                 <Button variant="link" className="w-full justify-start group-data-[collapsible=icon]:justify-center text-xs mt-2" asChild>
                    <Link href="/platform-admin/announcements">
                        <span className="group-data-[collapsible=icon]:hidden">Switch to Platform Admin</span>
                        <HospitalIconLucide className="h-4 w-4 group-data-[collapsible=icon]:block hidden"/>
                    </Link>
                 </Button>
            )}
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
