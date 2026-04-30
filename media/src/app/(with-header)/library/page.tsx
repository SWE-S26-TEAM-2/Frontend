"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { libraryService } from "@/services/di";
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

// Bug 1 fix: removed mockLibraryService/realLibraryService direct imports and the
// manual ENV.USE_MOCK_API switch — libraryService from di.ts is already resolved.

// Bug 3 fix: no useAuth hook exists in this codebase. Auth state lives in
// localStorage under "auth_token" (written by RealAuthService.saveTokens).
// Reading it directly here — no invented abstraction needed.
const getIsAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem("auth_token"));
};

const TABS: LibraryTab[] = [
  "Overview", "Likes", "Playlists", "Albums", "Stations", "Following", "History",
];

export default function LibraryPage() {
  const router = useRouter();

  const [activeTab, setActiveTab]       = useState<LibraryTab>("Overview");
  const [overview, setOverview]         = useState<ILibraryOverview | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Bug 3 fix: redirect unauthenticated users before any API call fires.
    if (!getIsAuthenticated()) {
      router.replace("/login");
      return;
    }

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
    fetchOverviewAsync();
  }, [router]);

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