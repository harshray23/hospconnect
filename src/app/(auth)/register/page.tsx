
'use client';

import React, { Suspense } from 'react';
import { RegistrationForm } from '@/components/forms/RegistrationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Added Loader2 for fallback
import { UserPlus, Loader2 } from 'lucide-react'; // Added Loader2 for fallback

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
           <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <UserPlus className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">Create an Account</CardTitle>
          <CardDescription>Join HospConnect to access healthcare services or manage your hospital.</CardDescription>
        </CardHeader>
        <CardContent>
 <Suspense fallback={
            <div className="flex flex-col items-center justify-center space-y-2 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading registration form...</p>
            </div>
          }>
            <RegistrationForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

