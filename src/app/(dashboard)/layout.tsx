
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Hospital, LayoutDashboard, UserCircle, MessageSquareText, AlertOctagon, LogOut, BedDouble, Stethoscope, UserPlus } from 'lucide-react'; // Added UserPlus
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock user data - replace with actual auth context
const user = {
  name: 'Dr. Jane Doe',
  email: 'jane.doe@hospital.com',
  role: 'hospital_admin', // or 'patient' or 'platform_admin'
  avatarUrl: 'https://placehold.co/100x100.png'
};
// const user = { name: 'John Patient', email: 'john.patient@email.com', role: 'patient', avatarUrl: 'https://placehold.co/100x100.png' };


const patientNavItems = [
  { href: '/patient/dashboard', label: 'Overview', icon: <LayoutDashboard /> },
  { href: '/patient/bookings', label: 'My Bookings', icon: <BedDouble /> },
  { href: '/patient/feedback', label: 'My Feedback', icon: <MessageSquareText /> },
  { href: '/patient/complaints', label: 'My Complaints', icon: <AlertOctagon /> },
];

const hospitalAdminNavItems = [
  { href: '/hospital/dashboard', label: 'Overview', icon: <LayoutDashboard /> },
  { href: '/hospital/beds', label: 'Bed Availability', icon: <BedDouble /> },
  { href: '/hospital/admissions', label: 'Manage Admissions', icon: <UserPlus /> }, // New Item
  { href: '/hospital/bookings', label: 'Manage Bookings', icon: <Stethoscope /> },
  { href: '/hospital/feedback', label: 'Patient Feedback', icon: <MessageSquareText /> },
  { href: '/hospital/complaints', label: 'Manage Complaints', icon: <AlertOctagon /> },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Basic role switching for nav items, assuming platform_admin might see hospital items or have their own.
  // For now, platform_admin isn't handled by this specific sidebar directly as they have their own layout.
  const navItems = user.role === 'hospital_admin' ? hospitalAdminNavItems : patientNavItems;
  const baseDashboardPath = user.role === 'hospital_admin' ? '/hospital/dashboard' : '/patient/dashboard';


  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-[calc(100vh-5rem-1px)]"> {/* Adjust based on header/footer height */}
        <Sidebar collapsible="icon" variant="sidebar" className="border-r">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile avatar" />
                <AvatarFallback>{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="group-data-[collapsible=icon]:hidden">
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href === baseDashboardPath && pathname.startsWith(baseDashboardPath))}
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
            <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center">
              <LogOut className="h-5 w-5 mr-2 group-data-[collapsible=icon]:mr-0" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
            {user.role === 'hospital_admin' && ( // Example: Link to platform admin if user has rights.
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
