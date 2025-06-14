
'use client';

import { useSearchParams } from 'next/navigation';

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  return (
    <form>
      <p>Referral Code: {ref || 'none'}</p>
      {/* Your form fields go here */}
    </form>
  );
}
