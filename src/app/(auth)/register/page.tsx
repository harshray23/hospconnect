
"use client";

import React, { Suspense } from 'react';
import { RegistrationForm } from '@/components/forms/RegistrationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, HospitalIcon } from 'lucide-react'; // Removed unused UserPlus

export const dynamic = 'force-dynamic'; // Ensures the page is rendered dynamically

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Loading registration page...</p>
      </div>
    }>
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
    </Suspense>
  );
}
