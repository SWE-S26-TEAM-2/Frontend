"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { userProfileService } from "@/services/di";
import { formatNumber } from "@/utils/formatNumber";
import type { ISearchUser } from "@/types/userProfile.types";

export default function UserSearchCard({ user }: { user: ISearchUser }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const displayName = user.displayName ?? user.username;
  const profileHref = `/${encodeURIComponent(user.username)}`;

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    const nextIsFollowing = !isFollowing;
    setIsFollowing(nextIsFollowing);
    setLoading(true);
    try {
      if (nextIsFollowing) {
        await userProfileService.followUser(user.username);
      } else {
        await userProfileService.unfollowUser(user.username);
      }
    } catch (err) {
      setIsFollowing(!nextIsFollowing);
      console.error("Follow action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px 0",
        borderBottom: "1px solid #1a1a1a",
      }}
    >
      {/* Avatar */}
      <Link href={profileHref} style={{ flexShrink: 0 }}>
        <Image
          src={user.avatarUrl ?? `https://i.pravatar.cc/48?u=${user.id}`}
          alt={displayName}
          width={48}
          height={48}
          style={{ borderRadius: "50%", objectFit: "cover" }}
        />
      </Link>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link
          href={profileHref}
          style={{ color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: "14px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f50")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
        >
          {displayName}
          {user.isVerified && (
            <span style={{ marginLeft: "6px", color: "#f50", fontSize: "12px" }}>✓</span>
          )}
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "3px" }}>
          <span
            style={{
              fontSize: "11px",
              color: "#888",
              background: "#222",
              borderRadius: "3px",
              padding: "1px 6px",
              textTransform: "capitalize",
            }}
          >
            {user.role}
          </span>
          <span style={{ fontSize: "12px", color: "#666" }}>
            {formatNumber(user.followerCount)} followers
          </span>
        </div>
      </div>

      {/* Follow button */}
      <button
        onClick={handleFollow}
        disabled={loading}
        style={{
          flexShrink: 0,
          background: isFollowing ? "transparent" : "#f50",
          border: isFollowing ? "1px solid #555" : "1px solid #f50",
          borderRadius: "3px",
          color: isFollowing ? "#aaa" : "#fff",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "13px",
          fontWeight: 600,
          padding: "6px 16px",
          opacity: loading ? 0.6 : 1,
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!loading && isFollowing) e.currentTarget.style.borderColor = "#888";
        }}
        onMouseLeave={(e) => {
          if (!loading && isFollowing) e.currentTarget.style.borderColor = "#555";
        }}
      >
        {isFollowing ? "Following" : loading ? "..." : "Follow"}
      </button>
    </div>
  );
}
