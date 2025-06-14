"use client";

import React, { Suspense } from 'react';
import { RegistrationForm } from '@/components/forms/RegistrationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Loader2, HospitalIcon } from 'lucide-react'; // UserPlus was there before, kept for consistency, HospitalIcon is used

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
            {/* The RegistrationForm itself doesn't need another Suspense if the whole page is under one,
                unless RegistrationForm has its own internal Suspense needs for other async operations.
                The previous Suspense around RegistrationForm is removed as the parent now handles it. */}
            <RegistrationForm />
          </CardContent>
        </Card>
      </div>
    </Suspense>
  );
}
