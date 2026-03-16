"use client";

import React, { useState, useEffect } from "react";
import { userProfileService, type User, type Track, type LikedTrack } from "@/services/userProfile.service";
import { formatNumber } from "@/utils/formatNumber";
import { Banner } from "@/components/Banner/Banner";
import { TrackCard } from "@/components/Track/TrackCard";
import { TrackCover } from "@/components/Track/TrackCover";
import { ShareIcon } from "@/components/Icons/TrackIcons";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

const TABS = ["All", "Popular tracks", "Tracks", "Albums", "Playlists", "Reposts"] as const;
type TActiveTab = typeof TABS[number];

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = React.use(params);
  const [activeTab, setActiveTab]       = useState<TActiveTab>(TABS[0]);
  const [user, setUser]                 = useState<User | null>(null);
  const [tracks, setTracks]             = useState<Track[]>([]);
  const [likes, setLikes]               = useState<LikedTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const fetchedUser = await userProfileService.getUserProfile(username);
        const [fetchedTracks, fetchedLikes] = await Promise.all([
          userProfileService.getUserTracks(fetchedUser.id),
          userProfileService.getUserLikes(fetchedUser.id),
        ]);
        setUser(fetchedUser);
        setTracks(fetchedTracks);
        setLikes(fetchedLikes);
        setCurrentTrack(fetchedTracks[0] ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [username]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#888", fontSize: 14 }}>Loading...</span>
    </div>
  );

  if (error || !user) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#ff5500", fontSize: 14 }}>{error ?? "User not found"}</span>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", color: "#fff",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: 60,
    }}>
      {/* Navbar —  */}
      <Header avatarUrl={user.avatarUrl ?? undefined} isLoggedIn={true}/>

      <div style={{ maxWidth: 1280, margin: "0 auto", background: "#111" }}>
        <Banner user={user}/>
      </div>

      <div style={{ height: 8 }}/>

      <div style={{ display: "flex", maxWidth: 1280, margin: "0 auto", padding: "0 16px", gap: 24 }}>

        {/* Left column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid #1c1c1c", marginBottom: 20,
          }}>
            <div style={{ display: "flex" }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  background: "transparent", border: "none",
                  borderBottom: activeTab === tab ? "2px solid #ff5500" : "2px solid transparent",
                  color: activeTab === tab ? "#fff" : "#777",
                  padding: "12px 14px", cursor: "pointer",
                  fontSize: 14, fontFamily: "inherit",
                  fontWeight: activeTab === tab ? 600 : 400,
                }}>
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "transparent", border: "1px solid #2e2e2e",
                color: "#ccc", borderRadius: 3, padding: "7px 16px",
                cursor: "pointer", fontSize: 13, fontFamily: "inherit",
              }}>
                <ShareIcon/> Share
              </button>
              {user.isOwner && (
                <button style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "transparent", border: "1px solid #2e2e2e",
                  color: "#ccc", borderRadius: 3, padding: "7px 16px",
                  cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                }}>
                  ✏ Edit
                </button>
              )}
            </div>
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: "0 0 10px 0" }}>Recent</h2>
          {tracks.map(track => (
            <TrackCard key={track.id} track={track} onPlay={setCurrentTrack}/>
          ))}
        </div>

        {/* Right sidebar */}
        <div style={{ width: 220, flexShrink: 0, paddingTop: 62 }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            paddingBottom: 16, marginBottom: 18, borderBottom: "1px solid #1c1c1c",
          }}>
            {([
              { label: "Followers", value: user.followers },
              { label: "Following", value: user.following },
              { label: "Tracks",    value: user.tracks    },
            ] as { label: string; value: number }[]).map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{value}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#999" }}>{user.likes} LIKES</span>
            <a href="#" style={{ fontSize: 12, color: "#ff5500", textDecoration: "none" }}>View all</a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {likes.map(like => (
              <div key={like.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <TrackCover size={44} accentColor={like.accentColor ?? "#1a1a2e"} url={like.coverUrl} alt={like.title}/>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {like.artist}
                  </div>
                  <div style={{ fontSize: 13, color: "#ddd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
                    {like.title}
                  </div>
                  {like.plays !== undefined && (
                    <div style={{ fontSize: 10, color: "#444", display: "flex", gap: 6, marginTop: 2 }}>
                      <span>▶ {formatNumber(like.plays)}</span>
                      <span>♥ {formatNumber(like.likes ?? 0)}</span>
                      <span>↻ {like.reposts ?? 0}</span>
                      {like.comments !== undefined && <span>💬 {like.comments}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player */}
      <Footer/>
    </div>
  );
}