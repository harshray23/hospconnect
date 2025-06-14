
import { LoginForm } from '@/components/forms/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic'; // Ensures the page is rendered dynamically

// IMPORTANT: For Vercel deployment, ensure all NEXT_PUBLIC_FIREBASE_... environment variables
// are correctly set in your Vercel project settings. This is the most common cause of
// "auth/invalid-api-key" errors during build or runtime.

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <LogIn className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">Hospital Portal Login</CardTitle>
          <CardDescription>Access your hospital's dashboard to manage services.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground mt-2">Loading login form...</p>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
