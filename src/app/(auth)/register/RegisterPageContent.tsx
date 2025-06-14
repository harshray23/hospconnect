
"use client";

import React from 'react';
import { RegistrationForm } from '@/components/forms/RegistrationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HospitalIcon } from 'lucide-react'; // Loader2 removed as fallback is in page.tsx

export default function RegisterPageContent() {
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
          <RegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}
