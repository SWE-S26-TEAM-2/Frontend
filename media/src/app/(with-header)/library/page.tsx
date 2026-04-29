"use client";

import { useState, useEffect } from "react";
import { ENV } from "@/config/env";
import { mockLibraryService } from "@/services/mocks/library.mock";
import { realLibraryService } from "@/services/api/library.api";
import { LikesTab }      from "@/components/Library/tabs/LikesTab";
import { PlaylistsTab }  from "@/components/Library/tabs/PlaylistTab";
import { AlbumsTab }     from "@/components/Library/tabs/AlbumsTab";
import { StationsTab }   from "@/components/Library/tabs/StationsTab";
import { FollowingTab }  from "@/components/Library/tabs/FollowingTab";
import { HistoryTab }    from "@/components/Library/tabs/HistoryTab";
import {
  RecentlyPlayedSection,
  LikesOverviewSection,
  PlaylistsOverviewSection,
  AlbumsOverviewSection,
  StationsOverviewSection,
  FollowingOverviewSection,
} from "@/components/Library/overview/LibraryOverviewSections";
import type { ILibraryOverview, LibraryTab } from "@/types/library.types";

// Module-level service selection is fine — ENV.USE_MOCK_API is a build-time
// constant, so this never changes after initial evaluation.
const libraryService = ENV.USE_MOCK_API ? mockLibraryService : realLibraryService;

const TABS: LibraryTab[] = [
  "Overview", "Likes", "Playlists", "Albums", "Stations", "Following", "History",
];

export default function LibraryPage() {
  const [activeTab, setActiveTab]   = useState<LibraryTab>("Overview");
  const [overview, setOverview]     = useState<ILibraryOverview | null>(null);
  // Fix: renamed from `loading` → `isLoading` and `error` → `errorMessage`
  // per the boolean-prefix and descriptive-naming conventions.
  const [isLoading, setIsLoading]   = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fix: renamed from `loadAsync` → `fetchOverviewAsync` per the
    // fetchXxxAsync naming convention in the code style guide.
    async function fetchOverviewAsync() {
      try {
        setIsLoading(true);
        const data = await libraryService.getOverview();
        setOverview(data);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to load library");
      } finally {
        setIsLoading(false);
      }
    }
    fetchOverviewAsync(); // eslint-disable-line react-hooks/exhaustive-deps
    // libraryService is a stable module-level reference — safe to omit.
  }, []);

  const handleClearHistory = async () => {
    await libraryService.clearHistory();
    const freshOverview = await libraryService.getOverview();
    setOverview(freshOverview);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <span className="text-[#888] text-sm">Loading...</span>
    </div>
  );

  if (errorMessage || !overview) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <span className="text-[#ff5500] text-sm">{errorMessage ?? "Something went wrong"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-6">

        {/* Tab bar */}
        <div className="flex border-b border-[#2a2a2a] mb-12">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`bg-transparent border-none px-6 py-4 cursor-pointer text-[18px] transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "text-white font-bold border-b-[3px] border-white"
                  : "text-[#777] hover:text-[#ccc] border-b-[3px] border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "Overview" && (
          <>
            <RecentlyPlayedSection    items={overview.recentlyPlayed} />
            <LikesOverviewSection     tracks={overview.likes} />
            <PlaylistsOverviewSection playlists={overview.playlists} />
            <AlbumsOverviewSection    albums={overview.albums} />
            <StationsOverviewSection  stations={overview.stations} />
            <FollowingOverviewSection following={overview.following} />
          </>
        )}
        {activeTab === "Likes"     && <LikesTab     tracks={overview.likes} />}
        {activeTab === "Playlists" && <PlaylistsTab playlists={overview.playlists} />}
        {activeTab === "Albums"    && <AlbumsTab    albums={overview.albums} />}
        {activeTab === "Stations"  && <StationsTab  stations={overview.stations} />}
        {activeTab === "Following" && <FollowingTab following={overview.following} />}
        {activeTab === "History"   && (
          <HistoryTab overview={overview} onClearHistory={handleClearHistory} />
        )}

      </div>
    </div>
  );
}