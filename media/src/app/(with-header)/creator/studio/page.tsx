'use client';

// src/app/(with-header)/creator/studio/page.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudioEmptyState } from '@/components/Studio';
import { studioService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import type { IStudioTracksResponse } from '@/types/studio.types';

const PAGE_SIZE = 10;

export default function StudioPage() {
  // const { isAuthenticated } = useAuthStore(); // uncomment when auth is wired
  const isAuthenticated = true;
  const router = useRouter();

  const [data, setData] = useState<IStudioTracksResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTracks = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await studioService.getTracks(1, PAGE_SIZE);
        setData(res);
      } catch (err) {
        console.error('[Studio] failed to fetch tracks:', err);
        setError('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTracks();
  }, [isAuthenticated]);

  // ── No-auth ───────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    router.replace('/');
    return null;
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-[#121212] text-white min-h-[calc(100vh-48px-56px)] flex flex-col">
        <div className="max-w-4xl w-full mx-auto px-6 py-8 flex flex-col gap-4">
          {/* Header skeleton */}
          <div className="h-8 w-48 bg-[#1a1a1a] rounded animate-pulse" />
          {/* Row skeletons */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#1a1a1a] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-[#121212] text-white min-h-[calc(100vh-48px-56px)] flex items-center justify-center">
        <p className="text-[#999] text-sm">{error}</p>
      </div>
    );
  }

  const isEmpty = !data || data.total === 0;
  console.log({ data, isLoading, isEmpty }); //check
  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#121212] text-white flex flex-col min-h-[calc(100vh-48px-56px)]">
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white text-2xl font-bold">Your tracks</h1>
          <button
            type="button"
            onClick={() => router.push('/creator/upload')}
            className="
              px-5 py-2 rounded-full bg-white text-black font-semibold text-sm
              hover:bg-[#e0e0e0] active:scale-95 transition-all duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white
            "
          >
            Upload a track
          </button>
        </div>

        {/* Empty state */}
        {isEmpty && <StudioEmptyState />}

        {/* Track list will be added in Phase 2 */}

      </main>
    </div>
  );
}
