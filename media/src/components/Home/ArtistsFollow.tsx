"use client";

import React, { useState } from "react";
import { RotateCw, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { IArtist } from "../../types/home.types";
import { apiPost, apiDelete } from "@/services/api/apiClient";
import { ENV } from "@/config/env";

const BASE_URL = ENV.API_BASE_URL.replace(/\/$/, "");

export default function ArtistsFollow({ artists }: { artists: IArtist[] }) {
  const router = useRouter();
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleFollow = async (artist: IArtist) => {
    // The follow API uses username, not UUID.
    // IArtist.id may be a UUID — we need the username.
    // artist.name is the display_name; the username is stored separately if available.
    // We use artist.username if present, else fall back to artist.name (best effort).
    const usernameOrId = (artist as IArtist & { username?: string }).username ?? artist.name;
    const id = artist.id;

    if (loadingIds.has(id)) return;

    const isCurrentlyFollowing = followingIds.has(id);

    // Optimistic update
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setLoadingIds((prev) => new Set(prev).add(id));

    try {
      if (isCurrentlyFollowing) {
        await apiDelete(`${BASE_URL}/users/${usernameOrId}/follow`);
      } else {
        await apiPost(`${BASE_URL}/users/${usernameOrId}/follow`);
      }
    } catch (error) {
      // Revert optimistic update on failure
      console.error("Follow/unfollow failed:", error);
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyFollowing) next.add(id);
        else next.delete(id);
        return next;
      });
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleArtistClick = (artist: IArtist) => {
    const username =
      (artist as IArtist & { username?: string }).username ??
      artist.name.toLowerCase().replace(/\s+/g, "");
    router.push(`/${username}`);
  };

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <span style={styles.title}>Artists you should follow</span>
        <button
          onClick={handleRefresh}
          className="refresh-btn"
          style={styles.headerBtn}
        >
          <RotateCw
            size={12}
            className={isRefreshing ? "spin" : ""}
            style={{ marginRight: "4px" }}
          />
          Refresh list
        </button>
      </div>

      {artists.map((artist) => {
        const isFollowing = followingIds.has(artist.id);
        const isLoading = loadingIds.has(artist.id);

        return (
          <div key={artist.id} className="artist-row" style={styles.row}>
            <img
              src={artist.imageUrl || "/default-avatar.png"}
              style={{ ...styles.avatar, cursor: "pointer" }}
              alt={artist.name}
              onClick={() => handleArtistClick(artist)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default-avatar.png";
              }}
            />
            <div style={styles.info}>
              <span
                className="artist-name"
                style={{ ...styles.name, cursor: "pointer" }}
                onClick={() => handleArtistClick(artist)}
              >
                {artist.name}
              </span>
              <div style={styles.subStats}>
                <Users size={10} style={{ marginRight: "3px" }} />
                {artist.followers} • {artist.tracksCount} tracks
              </div>
            </div>
            <button
              onClick={() => toggleFollow(artist)}
              disabled={isLoading}
              className={isFollowing ? "follow-btn following" : "follow-btn"}
              style={{
                ...styles.followBtn,
                backgroundColor: isFollowing ? "transparent" : "white",
                color: isFollowing ? "#fff" : "black",
                border: isFollowing ? "1px solid #444" : "none",
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }

        .refresh-btn:hover { color: white !important; }

        .artist-name:hover { color: #f50 !important; }

        .follow-btn { transition: all 0.2s ease-in-out !important; }
        .follow-btn:not(.following):not(:disabled):hover {
          background-color: #e5e5e5 !important;
          transform: scale(1.03);
        }
        .follow-btn.following:not(:disabled):hover {
          border-color: #fff !important;
          background-color: rgba(255,255,255,0.05) !important;
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section:   { padding: "20px", borderBottom: "1px solid #222" },
  header:    { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  title:     { color: "#888", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" },
  headerBtn: { background: "none", border: "none", color: "#888", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", transition: "color 0.2s" },
  row:       { display: "flex", alignItems: "center", marginBottom: "14px" },
  avatar:    { width: "40px", height: "40px", borderRadius: "50%", marginRight: "12px", objectFit: "cover" },
  info:      { flex: 1, display: "flex", flexDirection: "column" },
  name:      { color: "white", fontSize: "13px", fontWeight: "600", transition: "color 0.2s" },
  subStats:  { color: "#666", fontSize: "10px", marginTop: "2px", display: "flex", alignItems: "center" },
  followBtn: { borderRadius: "4px", padding: "4px 12px", fontSize: "11px", fontWeight: "bold" },
};
