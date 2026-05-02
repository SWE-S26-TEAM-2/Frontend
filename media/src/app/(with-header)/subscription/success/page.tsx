'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') ?? 'Premium';

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col items-center justify-center px-8">
      
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-[#1a8a4a] flex items-center justify-center text-4xl mb-8">
        ✓
      </div>

      {/* Title */}
      <h1 className="text-4xl font-black mb-4 text-center">
        You&apos;re all set!
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 text-lg mb-2 text-center">
        Welcome to <span className="text-white font-bold capitalize">{plan.replace('-', ' ')}</span>
      </p>
      <p className="text-gray-500 text-sm mb-12 text-center">
        Your subscription is now active. Enjoy all your premium features.
      </p>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push('/subscription')}
          className="rounded-full border border-white text-white px-7 py-3 text-sm font-semibold hover:bg-white hover:text-black transition-colors"
        >
          View subscription
        </button>
        <button
          onClick={() => router.push('/')}
          className="rounded-full bg-white text-black px-7 py-3 text-sm font-bold hover:bg-gray-200 transition-colors"
        >
          Start listening
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}