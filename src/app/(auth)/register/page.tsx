
import { Suspense } from 'react';
import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Register</h1>
      <Suspense fallback={<div>Loading form...</div>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
