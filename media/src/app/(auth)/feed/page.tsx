"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TrackCard } from "@/components/Track/TrackCard";
import RightSidebar from "@/components/Home/SideBar";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { feedService } from "@/services";
import { usePlayerStore } from "@/store/playerStore";
import type { ITrack } from "@/types/track.types";
import type { IFeedPageData } from "@/types/feed.types";

export default function FeedPage() {
  const router = useRouter();
  const { setTrack, setQueue } = usePlayerStore();

  const [data, setData]       = useState<IFeedPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    feedService.getFeedPageData()
      .then(setData)
      .catch((e) => console.error("Failed to load feed:", e))
      .finally(() => setIsLoading(false));
  }, []);

  const handlePlay = useCallback((track: ITrack) => {
    if (!data) return;
    setQueue(data.feedTracks);
    setTrack(track);
  }, [data, setTrack, setQueue]);

  if (isLoading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner}>Loading Feed...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <Header />

      <style>{`
        .feed-container {
          display: flex;
          flex-direction: row;
          gap: 30px;
          max-width: 1240px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .feed-main {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }
        .feed-sidebar {
          width: 320px;
          flex-shrink: 0;
        }
        @media (max-width: 1024px) {
          .feed-container {
            flex-direction: column;
            padding: 20px 15px;
          }
          .feed-sidebar {
            width: 100%;
          }
        }
      `}</style>

      <div style={styles.pageWrapper}>
        <div className="feed-container">

          {/* ── Main feed ── */}
          <div className="feed-main">
            <div style={styles.heading}>
              <h1 style={styles.headingTitle}>Your Feed</h1>
              <p style={styles.headingSubtitle}>
                Hear the latest posts from the people you&apos;re following
              </p>
            </div>

            {data.feedTracks.length === 0 ? (
              <div style={styles.emptyState}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
                  stroke="#2a2a2a" strokeWidth="1.5">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                <p style={styles.emptyTitle}>Your feed is empty</p>
                <p style={styles.emptySubtitle}>
                  Follow some artists to see their latest tracks here
                </p>
                <button
                  style={styles.exploreBtn}
                  onClick={() => router.push("/search")}
                >
                  Find artists to follow
                </button>
              </div>
            ) : (
              <div>
                {data.feedTracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    onPlay={handlePlay}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Right sidebar — exact same as home ── */}
          <div className="feed-sidebar">
            <RightSidebar
              followSuggestions={data.followSuggestions}
              listeningHistory={data.listeningHistory}
            />
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    backgroundColor: "#121212",
    minHeight: "100vh",
    width: "100%",
    overflowX: "hidden",
  },
  loadingWrapper: {
    backgroundColor: "#121212",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ccc",
    fontSize: "14px",
  },
  spinner: {
    padding: "20px",
    border: "1px solid #333",
    borderRadius: "8px",
    backgroundColor: "#1a1a1a",
  },
  heading: {
    marginBottom: 32,
    paddingBottom: 20,
    borderBottom: "1px solid #1a1a1a",
  },
  headingTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: "#fff",
    margin: 0,
    marginBottom: 6,
  },
  headingSubtitle: {
    fontSize: 13,
    color: "#555",
    margin: 0,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    padding: "80px 20px",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#444",
    margin: 0,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#333",
    margin: 0,
    maxWidth: 280,
    lineHeight: 1.6,
  },
  exploreBtn: {
    marginTop: 8,
    padding: "9px 22px",
    borderRadius: 20,
    border: "1px solid #ff5500",
    background: "transparent",
    color: "#ff5500",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};
