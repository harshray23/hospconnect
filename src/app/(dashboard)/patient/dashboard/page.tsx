import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BedDouble, CalendarDays, MessageSquareHeart, AlertTriangle, Search } from "lucide-react";
import Link from "next/link";

export default function PatientDashboardPage() {
  const upcomingAppointments = [
    { hospital: "City General Hospital", specialty: "Cardiology", date: "2024-08-15", time: "10:00 AM" },
    // Add more mock appointments
  ];

  const quickActions = [
    { label: "Find a Hospital", href: "/search", icon: <Search className="mr-2 h-4 w-4" /> },
    { label: "View My Bookings", href: "/patient/bookings", icon: <BedDouble className="mr-2 h-4 w-4" /> },
    { label: "Submit Feedback", href: "/patient/feedback/submit", icon: <MessageSquareHeart className="mr-2 h-4 w-4" /> },
    { label: "File a Complaint", href: "/patient/complaints/submit", icon: <AlertTriangle className="mr-2 h-4 w-4" /> },
  ];

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Patient Dashboard</CardTitle>
          <CardDescription>Welcome, John Patient. Manage your health journey with HospConnect.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Upcoming Appointments / Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <ul className="space-y-4">
                {upcomingAppointments.map((appt, index) => (
                  <li key={index} className="p-4 border rounded-md bg-secondary/50">
                    <p className="font-semibold">{appt.hospital} - {appt.specialty}</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2"/> {appt.date} at {appt.time}
                    </p>
                    <Button variant="link" size="sm" className="p-0 h-auto mt-1">View Details</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">You have no upcoming appointments or bookings.</p>
            )}
          </CardContent>
        </Card>

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
      </div>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl font-headline">Recent Activity</CardTitle>
            <CardDescription>Track your recent interactions and updates.</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center"><MessageSquareHeart className="h-4 w-4 mr-2 text-primary"/> Feedback submitted for City General Hospital.</li>
              <li className="flex items-center"><AlertTriangle className="h-4 w-4 mr-2 text-destructive"/> Complaint #C12045 status updated to 'In Progress'.</li>
              <li className="flex items-center"><BedDouble className="h-4 w-4 mr-2 text-green-500"/> Booking confirmed at St. Luke's Medical Center.</li>
            </ul>
        </CardContent>
      </Card>

    </div>
  );
}
