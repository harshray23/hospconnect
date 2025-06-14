
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HospitalIcon, Loader2 } from 'lucide-react';
import RegistrationForm from './RegistrationForm'; // Import from the same folder

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <HospitalIcon className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">Register Your Hospital</CardTitle>
          <CardDescription>Join HospConnect to list your services and manage availability.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground mt-4">Loading form...</p>
            </div>
          }>
            <RegistrationForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
