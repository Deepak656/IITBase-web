import { Suspense } from 'react';
import SignupClient from './SignupClient';

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-10 w-10 rounded-full border-t-4 border-blue-600" />
        </div>
      }
    >
      <SignupClient />
    </Suspense>
  );
}
