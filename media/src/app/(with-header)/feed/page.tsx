"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TrackCard } from "@/components/Track/TrackCard";
import RightSidebar from "@/components/Home/SideBar";
import { feedService } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { usePlayerStore } from "@/store/playerStore";
import type { ITrack } from "@/types/track.types";
import type { IFeedPageData } from "@/types/feed.types";

export default function FeedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setTrack, setQueue } = usePlayerStore();

  const [data, setData]         = useState<IFeedPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" && window.localStorage.getItem("auth_token");
    if (!isAuthenticated && !token) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    feedService
      .getFeedPageData()
      .then((d) => {
        setData(d);
        setLoadError(null);
      })
      .catch((e) => {
        console.error("Failed to load feed:", e);
        setLoadError(e instanceof Error ? e.message : "Failed to load feed");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handlePlay = useCallback((track: ITrack) => {
    if (!data) return;
    setQueue(data.feedTracks);
    setTrack(track);
  }, [data, setTrack, setQueue]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="px-5 py-4 border border-[#333] rounded-lg bg-[#1a1a1a] text-[#ccc] text-sm">
          Loading Feed...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-[#121212] px-5">
        <p className="text-[#ff5500] text-sm text-center max-w-md">{loadError}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-[#121212] min-h-screen w-full overflow-x-hidden">
      <div className="flex flex-col lg:flex-row gap-[30px] max-w-[1240px] mx-auto px-5 py-10">

        {/* Main feed */}
        <main className="flex-1 min-w-0 overflow-hidden">
          <div className="mb-8 pb-5 border-b border-[#1a1a1a]">
            <h1 className="text-[26px] font-extrabold text-white mb-1.5">Your Feed</h1>
            <p className="text-[13px] text-[#555]">
              Hear the latest posts from the people you&apos;re following
            </p>
          </div>

          {data.feedTracks.length === 0 ? (
            <div className="flex flex-col items-center gap-3.5 py-20 px-5 text-center">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
                stroke="#2a2a2a" strokeWidth="1.5">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              <p className="text-[18px] font-bold text-[#444]">Your feed is empty</p>
              <p className="text-[13px] text-[#333] max-w-[280px] leading-relaxed">
                Follow some artists to see their latest tracks here
              </p>
              <button
                onClick={() => router.push("/search")}
                className="mt-2 px-[22px] py-[9px] rounded-[20px] border border-[#ff5500] bg-transparent text-[#ff5500] text-[13px] font-semibold cursor-pointer hover:bg-[#ff5500]/10 transition-colors"
              >
                Find artists to follow
              </button>
            </div>
          ) : (
            <div>
              {data.feedTracks.map((track) => (
                <TrackCard key={track.id} track={track} onPlay={handlePlay} />
              ))}
            </div>
          )}
        </main>

        {/* Right sidebar */}
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
