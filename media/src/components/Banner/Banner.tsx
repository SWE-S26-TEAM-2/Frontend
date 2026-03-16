// src/app/[username]/components/Banner.tsx

import { type User } from "@/services/userProfile.service";

const AVATAR_SIZE = 180;
const AVATAR_LEFT = 20;

interface IBannerProps {
  user: User;
}

export function Banner({ user }: IBannerProps) {
  return (
    <div style={{
      position: "relative", height: 250, overflow: "hidden",
      background: user.headerUrl
        ? `url(${user.headerUrl}) center/cover`
        : "linear-gradient(160deg, #3d7080 0%, #4d909f 40%, #3d7888 100%)",
    }}>
      {/* Upload header — only for profile owner */}
      {user.isOwner && (
        <button style={{
          position: "absolute", top: 14, right: 14, zIndex: 3,
          background: "#111", border: "none", color: "#fff",
          borderRadius: 3, padding: "8px 18px", fontSize: 13,
          cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
        }}>
          Upload header image
        </button>
      )}

      {/* Avatar */}
      <div style={{
        position: "absolute", left: AVATAR_LEFT, top: "50%",
        transform: "translateY(-50%)",
        width: AVATAR_SIZE, height: AVATAR_SIZE,
        borderRadius: "50%", background: "#4a4a4a",
        overflow: "hidden", zIndex: 2,
      }}>
        {user.avatarUrl && (
          <img src={user.avatarUrl} alt={user.username} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
        )}
      </div>

      {/* Upload avatar — only for profile owner */}
      {user.isOwner && (
        <button style={{
          position: "absolute",
          left: AVATAR_LEFT + 40,
          top: `calc(50% + ${AVATAR_SIZE * 0.18}px)`,
          zIndex: 4, background: "#000000bb", border: "none",
          color: "#fff", borderRadius: 3, padding: "5px 10px",
          fontSize: 12, cursor: "pointer", fontFamily: "inherit",
        }}>
          Upload image
        </button>
      )}

      {/* Username + location */}
      <div style={{
        position: "absolute",
        left: AVATAR_LEFT + AVATAR_SIZE + 24,
        top: "50%", transform: "translateY(-50%)",
        zIndex: 2, display: "flex", flexDirection: "column", gap: 8,
      }}>
        <span style={{
          background: "#000000cc", borderRadius: 2,
          padding: "5px 14px", fontSize: 25, fontWeight: 700,
          color: "#fff", display: "inline-block",
        }}>
          {user.username}
        </span>
        <span style={{
          background: "#000000cc", borderRadius: 2,
          padding: "4px 12px", fontSize: 14, color: "#ddd",
          display: "inline-block", alignSelf: "flex-start",
        }}>
          {user.location}
        </span>
      </div>
    </div>
  );
}