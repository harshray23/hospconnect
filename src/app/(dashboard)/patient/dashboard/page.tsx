
// This page is likely to be removed or significantly re-purposed
// as patients will no longer have a dedicated dashboard login.
// For now, I'll leave a placeholder indicating this.

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PatientDashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center">
            <Info className="h-10 w-10 text-primary mr-4" />
            <div>
              <CardTitle className="text-3xl font-headline">Patient Area Deprecated</CardTitle>
              <CardDescription>
                This patient dashboard is no longer active as per the new system design.
                Public users can find hospitals and services directly without logging in.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            You can use the main site features to:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-6">
            <li>Search for hospitals and view their details.</li>
            <li>Check real-time bed availability.</li>
            <li>Get smart recommendations for hospitals based on your needs.</li>
            <li>Submit feedback or complaints regarding services.</li>
          </ul>
          <Button asChild>
            <Link href="/search">Find a Hospital Now</Link>
          </Button>
           <Button variant="link" asChild className="ml-4">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
