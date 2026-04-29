'use client';

// src/app/(with-header)/creator/studio/page.tsx

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  StudioEmptyState,
  StudioStatsBar,
  StudioTabs,
  StudioActionButtons,
  StudioTrackList,
} from '@/components/Studio';
import type { StudioTab } from '@/types/studio.types';
import StudioSortDropdown from '@/components/Studio/StudioSortDropdown';
import type { SortOption } from '@/components/Studio/StudioSortDropdown';
import StudioDistributionTab from '@/components/Studio/StudioDistributionTab';
import StudioVinylTab from '@/components/Studio/StudioVinylTab';
import StudioCommentsTab from '@/components/Studio/StudioCommentsTab';
import StudioPromotionsTab from '@/components/Studio/StudioPromotionsTab';
import { UploadQuotaBar } from '@/components/Upload';
import { studioService, uploadService } from '@/services';
import type { IStudioTrack, IStudioStats } from '@/types/studio.types';
import type { IUploadQuota } from '@/types/upload.types';

const PAGE_SIZE = 10;

const STUB_STATS: IStudioStats = {
  scPlays: 0,
  reposts: 0,
  downloads: 0,
  likes: 0,
  comments: 0,
};

type VisibilityFilter = 'all' | 'public' | 'private';

const SORT_LABELS: Record<SortOption, string> = {
  date: 'Date',
  plays: 'Plays',
  duration: 'Duration',
  likes: 'Likes',
};

export default function StudioPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated || !!localStorage.getItem('auth_token'));
  }, [isAuthenticated]);

  // Source of truth — full unfiltered list from the service
  const [tracks, setTracks] = useState<IStudioTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<StudioTab>('tracks');
  const [quota, setQuota] = useState<IUploadQuota | null>(null);

  // Filter + sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [activeSort, setActiveSort] = useState<SortOption>('date');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSortOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn === false) {
      router.replace('/');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [tracksRes, quotaRes] = await Promise.all([
          studioService.getTracks(1, PAGE_SIZE),
          uploadService.getQuota(),
        ]);
        setTracks(tracksRes.tracks);
        setQuota(quotaRes);
      } catch (err) {
        console.error('[Studio] failed to fetch data:', err);
        setError('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [isAuthenticated]);

  // ── Delete: remove from source array so useMemo recomputes correctly ──────
  const handleDeleteTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const handleBulkApplied = async () => {
    try {
      const tracksRes = await studioService.getTracks(1, PAGE_SIZE);
      setTracks(tracksRes.tracks);
    } catch (err) {
      console.error('[Studio] re-fetch after bulk edit failed:', err);
    }
  };

  // ── Client-side filter + sort derived from source tracks ──────────────────
  const filteredAndSorted = useMemo(() => {
    let result = [...tracks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.genre?.toLowerCase().includes(q)
      );
    }

    if (visibilityFilter === 'public') {
      result = result.filter((t) => t.visibility === 'public');
    } else if (visibilityFilter === 'private') {
      result = result.filter((t) => t.visibility === 'private');
    }

    result.sort((a, b) => {
      switch (activeSort) {
        case 'plays':    return b.plays - a.plays;
        case 'duration': return b.duration - a.duration;
        case 'likes':    return b.likes - a.likes;
        case 'date':
        default:         return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [tracks, searchQuery, visibilityFilter, activeSort]);

  // ── No-auth ───────────────────────────────────────────────────────────────
  if (isLoggedIn === null || isLoggedIn === false) return null;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-[#121212] text-white min-h-[calc(100vh-48px-56px)] flex flex-col">
        <div className="w-full px-8 py-8 flex flex-col gap-4">
          <div className="h-[58px] rounded-md bg-[#1a1a1a] animate-pulse" />
          <div className="h-36 rounded-md bg-[#1a1a1a] animate-pulse" />
          <div className="h-10 rounded-md bg-[#1a1a1a] animate-pulse" />
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

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#121212] text-white flex flex-col min-h-[calc(100vh-48px-56px)]">
      <main className="flex-1 w-full px-8 py-8 flex flex-col gap-6">

        {quota && <UploadQuotaBar quota={quota} />}

        <StudioStatsBar stats={STUB_STATS} />

        <StudioTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ── Tracks tab ── */}
        {activeTab === 'tracks' && (
          <div className="flex flex-col gap-4">
            <StudioActionButtons />

            {/* Search + filter + sort */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">

                {/* Search */}
                <div className="flex items-center gap-2 bg-transparent border border-[#2a2a2a] rounded-full px-4 py-2 w-56 focus-within:border-[#555] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search tracks"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-sm text-white placeholder-[#555] outline-none w-full"
                    aria-label="Search tracks"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="text-[#666] hover:text-white transition-colors shrink-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Public */}
                <button
                  type="button"
                  onClick={() => setVisibilityFilter((prev) => prev === 'public' ? 'all' : 'public')}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-150 ${
                    visibilityFilter === 'public'
                      ? 'bg-white text-black'
                      : 'border border-[#444] text-white hover:border-[#666]'
                  }`}
                >
                  Public
                </button>

                {/* Private */}
                <button
                  type="button"
                  onClick={() => setVisibilityFilter((prev) => prev === 'private' ? 'all' : 'private')}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-150 ${
                    visibilityFilter === 'private'
                      ? 'bg-white text-black'
                      : 'border border-[#444] text-white hover:border-[#666]'
                  }`}
                >
                  Private
                </button>
              </div>

              {/* Track count + sort */}
              <div className="flex items-center gap-3 text-[#999] text-sm shrink-0">
                <span>
                  {filteredAndSorted.length}{' '}
                  {filteredAndSorted.length === 1 ? 'track' : 'tracks'}
                </span>
                <div className="relative" ref={sortDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsSortOpen((prev) => !prev)}
                    aria-expanded={isSortOpen}
                    aria-label="Sort tracks"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#333] hover:border-[#555] transition-colors text-white text-sm font-semibold"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    {SORT_LABELS[activeSort]}
                  </button>
                  {isSortOpen && (
                    <StudioSortDropdown
                      activeSort={activeSort}
                      onSortChange={setActiveSort}
                      onClose={() => setIsSortOpen(false)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Track list or empty states */}
            {tracks.length === 0 ? (
              <StudioEmptyState />
            ) : filteredAndSorted.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-[#555] text-sm">No tracks match your search.</p>
              </div>
            ) : (
              <div className="rounded-md border border-[#2a2a2a] overflow-hidden">
                <StudioTrackList
                  tracks={filteredAndSorted}
                  total={filteredAndSorted.length}
                  onDeleteTrack={handleDeleteTrack}
                  onBulkApplied={handleBulkApplied}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Distribution tab ── */}
        {activeTab === 'distribution' && <StudioDistributionTab />}

        {/* ── Vinyl tab ── */}
        {activeTab === 'vinyl' && <StudioVinylTab />}

        {/* ── Comments tab ── */}
        {activeTab === 'comments' && <StudioCommentsTab />}

        {/* ── Promotions tab ── */}
        {activeTab === 'promotions' && <StudioPromotionsTab />}

      </main>
    </div>
  );
}
