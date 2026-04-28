"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TrackSlider from "@/components/Track/TrackSlider";
import RecentlyPlayedGrid from "@/components/Home/RecentlyPlayed";
import RightSidebar from "@/components/Home/SideBar";
import StationSlider from "@/components/Station/StationSlider";
import { homeService, stationService } from "@/services";
import { useAuthStore } from "@/store/authStore";
import type { IHomePageData } from "@/types/home.types";
import type { IStation } from "@/types/station.types";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [data, setData]                         = useState<IHomePageData | null>(null);
  const [discoverStations, setDiscoverStations] = useState<IStation[]>([]);
  const [isLoading, setIsLoading]               = useState(true);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    Promise.all([
      homeService.getHomePageData(),
      stationService.getDiscoverStations(),
    ])
      .then(([homeData, stations]) => {
        setData(homeData);
        setDiscoverStations(stations);
      })
      .catch((error) => console.error("Failed to fetch home data:", error))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="px-5 py-4 border border-[#333] rounded-lg bg-[#1a1a1a] text-[#ccc] text-sm font-[Inter,sans-serif]">
          Loading SoundCloud...
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-[#121212] min-h-screen w-full overflow-x-hidden">
      <div className="flex flex-col lg:flex-row gap-[30px] max-w-[1240px] mx-auto px-5 py-10 lg:py-10">

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-hidden">
          <TrackSlider
            title="More of what you like"
            subtitle="Suggestions based on your recent plays"
            tracks={data.moreOfWhatYouLike}
          />

          <RecentlyPlayedGrid items={data.recentlyPlayed} />

          <TrackSlider
            title="Mixed for you"
            subtitle="Your personal daily music update"
            tracks={data.mixedForUser}
            showFollow={false}
          />

          <StationSlider
            title="Discover with stations"
            subtitle="Pick a track and we'll play similar music"
            stations={discoverStations}
          />
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] lg:flex-shrink-0">
          <RightSidebar
            followSuggestions={data.followSuggestions}
            listeningHistory={data.listeningHistory}
          />
        </aside>

      </div>
    </div>
  );
}
