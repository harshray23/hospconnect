
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import RegisterPageContent from './RegisterPageContent';

// This page is a Server Component by default.
// It wraps the client-side page content in Suspense.

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Loading registration page...</p>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
