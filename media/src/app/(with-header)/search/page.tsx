"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trackService, userProfileService } from "@/services/di";
import { usePlayerStore } from "@/store/playerStore";
import { TrackCard } from "@/components/Track/TrackCard";
import SearchTabs from "@/components/Search/SearchTabs";
import UserSearchCard from "@/components/Search/UserSearchCard";
import type { ITrack } from "@/types/track.types";
import type { ISearchUser } from "@/types/userProfile.types";

type Tab = "tracks" | "people";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") ?? "";
  const tabParam = searchParams.get("tab") as Tab | null;
  const activeTab: Tab = tabParam === "people" ? "people" : "tracks";

  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [users, setUsers] = useState<ISearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState("");

  const setTrack = usePlayerStore((s) => s.setTrack);
  const setQueue = usePlayerStore((s) => s.setQueue);

  const handleTabChange = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/search?${params.toString()}`);
  };

  const runSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const [trackResults, userResults] = await Promise.all([
        trackService.search(query),
        userProfileService.searchUsers(query),
      ]);
      setTracks(trackResults);
      setUsers(userResults);
      setSearched(query);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (q) runSearch(q);
  }, [q, runSearch]);

  const handlePlay = (track: ITrack) => {
    setQueue(tracks);
    setTrack(track);
  };

  // ── Empty / no-query state ────────────────────────────────────────────────────
  if (!q) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "#555" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
        <p style={{ fontSize: "16px" }}>Search for tracks, artists, and more</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, margin: 0 }}>
          {loading ? "Searching…" : searched ? `Results for "${searched}"` : ""}
        </h1>
      </div>

      {/* Tabs */}
      <SearchTabs
        active={activeTab}
        trackCount={tracks.length}
        peopleCount={users.length}
        onTabChange={handleTabChange}
      />

      {/* Loading skeleton */}
      {loading && (
        <div style={{ color: "#555", textAlign: "center", padding: "40px 0" }}>
          Loading…
        </div>
      )}

      {/* Tracks tab */}
      {!loading && activeTab === "tracks" && (
        <>
          {tracks.length === 0 ? (
            <div style={{ color: "#555", textAlign: "center", padding: "40px 0" }}>
              No tracks found for &quot;{q}&quot;
            </div>
          ) : (
            tracks.map((track) => (
              <TrackCard key={track.id} track={track} onPlay={handlePlay} />
            ))
          )}
        </>
      )}

      {/* People tab */}
      {!loading && activeTab === "people" && (
        <>
          {users.length === 0 ? (
            <div style={{ color: "#555", textAlign: "center", padding: "40px 0" }}>
              No users found for &quot;{q}&quot;
            </div>
          ) : (
            users.map((user) => (
              <UserSearchCard key={user.id} user={user} />
            ))
          )}
        </>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div
      style={{
        maxWidth: "780px",
        margin: "0 auto",
        padding: "32px 16px 120px",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <Suspense fallback={<div style={{ color: "#555", padding: "40px 0", textAlign: "center" }}>Loading…</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
