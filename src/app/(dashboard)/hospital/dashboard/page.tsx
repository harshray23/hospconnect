
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BedDouble, BookOpenCheck, MessageSquareHeart, AlertTriangle, PlusCircle, UserPlus, Bell } from "lucide-react";
import Link from "next/link";
import type { Announcement } from "@/lib/types";

// Mock announcements - in a real app, this would be fetched for the specific hospital
const mockHospitalAnnouncements: Announcement[] = [
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


export default function HospitalDashboardPage() {
  const stats = [
    { title: "Total Beds", value: "150", icon: <BedDouble className="h-6 w-6 text-primary" />, color: "text-primary" },
    { title: "Available ICU Beds", value: "8", icon: <BedDouble className="h-6 w-6 text-destructive" />, color: "text-destructive" },
    { title: "Today's Bookings", value: "25", icon: <BookOpenCheck className="h-6 w-6 text-green-500" />, color: "text-green-500" },
    { title: "Admitted Patients", value: "120", icon: <UserPlus className="h-6 w-6 text-blue-500" />, color: "text-blue-500" }, // New Stat
  ];

  const quickActions = [
    { label: "Update Bed Availability", href: "/hospital/beds", icon: <BedDouble className="mr-2 h-4 w-4" /> },
    { label: "Manage Admissions", href: "/hospital/admissions", icon: <UserPlus className="mr-2 h-4 w-4" /> }, // New Action
    { label: "View Recent Bookings", href: "/hospital/bookings", icon: <BookOpenCheck className="mr-2 h-4 w-4" /> },
    { label: "Respond to Feedback", href: "/hospital/feedback", icon: <MessageSquareHeart className="mr-2 h-4 w-4" /> },
    { label: "Manage Complaints", href: "/hospital/complaints", icon: <AlertTriangle className="mr-2 h-4 w-4" /> },
  ];

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Hospital Dashboard</CardTitle>
          <CardDescription>Welcome, Dr. Jane Doe. Manage your hospital's operations efficiently.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                +2 from yesterday {/* Placeholder comparison data */}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center">
            <Bell className="mr-2 h-6 w-6 text-primary" /> Recent Announcements
          </CardTitle>
          <CardDescription>Stay updated with important notices from the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockHospitalAnnouncements.length > 0 ? (
            <ul className="space-y-4 max-h-96 overflow-y-auto">
              {mockHospitalAnnouncements.map(ann => (
                <li key={ann.id} className="p-4 border rounded-lg bg-primary/5 shadow-sm">
                  <h3 className="font-semibold text-md text-primary">{ann.title}</h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    Issued: {new Date(ann.issuedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-line">{ann.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">No new announcements.</p>
          )}
        </CardContent>
      </Card>


      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button key={action.label} variant="outline" className="w-full justify-start" asChild>
                <Link href={action.href}>
                  {action.icon}
                  {action.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Recent Activity</CardTitle>
            <CardDescription>Overview of recent bookings and alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for activity feed */}
            <ul className="space-y-3 text-sm">
              <li className="flex items-center"><BookOpenCheck className="h-4 w-4 mr-2 text-green-500"/> New booking: John P. - General Ward</li>
              <li className="flex items-center"><UserPlus className="h-4 w-4 mr-2 text-blue-500"/> Patient 'Alice B.' admitted to ICU.</li>
              <li className="flex items-center"><AlertTriangle className="h-4 w-4 mr-2 text-destructive"/> ICU Bed 3 capacity nearing full.</li>
              <li className="flex items-center"><MessageSquareHeart className="h-4 w-4 mr-2 text-yellow-500"/> New patient feedback received.</li>
              <li className="flex items-center"><BedDouble className="h-4 w-4 mr-2 text-primary"/> Oxygen bed availability updated.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
