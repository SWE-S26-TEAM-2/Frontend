'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SubscriptionService } from '@/services/api/subscription.api';
import type { ISubscriptionData } from '@/types/subscription.types';

export default function SubscriptionPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<ISubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await SubscriptionService.getMySubscription();
        setSubscription(data);
      } catch {
        // not logged in or error — show basic plan
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  const isPremium = subscription?.plan === "Premium";

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-8 py-10 flex gap-16">
      <div className="flex-1 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Subscriptions</h1>

        <h2 className="text-lg font-semibold mb-4">Current plans</h2>

        <div className="rounded-md bg-[#1a1a1a] border border-[#2a2a2a] px-6 py-5 flex items-center justify-between mb-2">
          <div>
            {isLoading ? (
              <p className="text-sm text-gray-400">Loading your plan...</p>
            ) : (
              <>
                <p className="text-lg font-bold mb-2">
                  {isPremium ? "Premium" : "Basic"}
                </p>
                <p className="text-sm text-gray-400">
                  {isPremium
                    ? "You have unlimited uploads and all premium features."
                    : `You have used ${subscription?.tracks_uploaded ?? 0} of ${subscription?.limit ?? 3} free uploads.`}
                </p>
              </>
            )}
          </div>
          {!isPremium && (
            <button
              onClick={() => router.push('/subscription/artist-pro')}
              className="ml-8 shrink-0 rounded-sm bg-white px-5 py-2 text-sm font-semibold text-black transition-colors"
            >
              Try Artist Pro
            </button>
          )}
        </div>

        {!isPremium && (
          <div className="rounded-md bg-[#1a1a1a] border border-[#2a2a2a] px-6 py-4 flex items-center justify-center gap-2 mb-10">
            <span className="text-sm text-gray-300">Are you a student?</span>
            <button
              onClick={() => router.push('/subscription/go-plus')}
              className="text-sm text-blue-400 hover:underline font-medium"
            >
              Get SoundCloud Go+ for 50% off
            </button>
          </div>
        )}

        <h2 className="text-lg font-semibold">Purchase history</h2>
      </div>

      {/* Right sidebar — unchanged */}
      <div className="w-64 shrink-0 pt-14 ml-0">
        <h3 className="text-sm font-semibold mb-4">Helpful links</h3>
        <ul className="flex flex-col gap-3">
          {[
            'Change your credit card or payment details',
            'Troubleshoot payment failures',
            'General payments and billing help',
            'Understand sales tax and VAT',
          ].map((link) => (
            <li key={link}>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}