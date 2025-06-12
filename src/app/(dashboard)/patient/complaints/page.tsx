import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintForm } from "@/components/forms/ComplaintForm"; // To be created
import type { Complaint } from "@/lib/types";
import { AlertTriangle, FilePlus, ListChecks, Badge } from "lucide-react";
import { Badge as ShadBadge } from "@/components/ui/badge"; // Renamed to avoid conflict

// Mock existing complaints - in a real app, this would be fetched.
const mockUserComplaints: Complaint[] = [
  {
    id: "C12045",
    hospitalId: "1",
    hospitalName: "City General Hospital",
    description: "Excessive waiting time in the ER despite urgent condition.",
    status: "in_progress",
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: "C12040",
    description: "Billing error, charged for services not received.",
    status: "resolved",
    submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    escalationNotes: "Resolved after discussion with billing department. Refund processed."
  },
];

const getStatusVariant = (status: Complaint['status']): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'submitted': return 'outline';
    case 'in_progress': return 'default'; // Primary color for in progress
    case 'resolved': return 'secondary'; // Green (accent) for resolved (adjust if needed)
    case 'escalated': return 'destructive';
    default: return 'outline';
  }
};

export default function PatientComplaintsPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
            <FilePlus className="mr-2 h-7 w-7 text-primary" /> Submit a New Complaint
          </CardTitle>
          <CardDescription>Report any issues or concerns regarding healthcare services.</CardDescription>
        </CardHeader>
        <CardContent>
          <ComplaintForm />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center">
             <ListChecks className="mr-2 h-7 w-7 text-primary" /> Your Submitted Complaints
          </CardTitle>
          <CardDescription>Track the status of your complaints.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockUserComplaints.length > 0 ? (
            <ul className="space-y-6">
              {mockUserComplaints.map(complaint => (
                <li key={complaint.id} className="p-4 border rounded-lg bg-card shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-primary">Complaint ID: {complaint.id}</h3>
                      {complaint.hospitalName && <p className="text-sm text-muted-foreground">Hospital: {complaint.hospitalName}</p>}
                    </div>
                    <ShadBadge variant={getStatusVariant(complaint.status)} className="capitalize">
                      {complaint.status.replace('_', ' ')}
                    </ShadBadge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">
                    Submitted on: {new Date(complaint.submittedAt).toLocaleDateString()}
                  </p>
                  <p className="text-foreground leading-relaxed mb-2"><strong>Description:</strong> {complaint.description}</p>
                  {complaint.escalationNotes && (
                    <p className="text-sm bg-yellow-50 border border-yellow-200 p-2 rounded-md text-yellow-700">
                      <strong>Resolution/Notes:</strong> {complaint.escalationNotes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-8">You haven't submitted any complaints yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
