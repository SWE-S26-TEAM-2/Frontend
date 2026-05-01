// src/components/Banner/Banner.tsx
import Image from "next/image";
import type { IBannerProps } from "@/types/ui.types";

const AVATAR_SIZE = 180;
const AVATAR_LEFT = 20;

export function Banner({ user }: IBannerProps) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: 250,
        background: user.headerUrl
          ? `url(${user.headerUrl}) center/cover`
          : "linear-gradient(160deg, #3d7080 0%, #4d909f 40%, #3d7888 100%)",
      }}
    >
      {/* Upload header — owner only */}
      {user.isOwner && (
        <button className="absolute top-3 right-3 z-10 bg-[#111] text-white text-sm font-medium px-4 py-2 rounded cursor-pointer border-none">
          Upload header image
        </button>
      )}

      {/* Avatar */}
      <div
        className="absolute rounded-full bg-[#4a4a4a] overflow-hidden z-10"
        style={{ left: AVATAR_LEFT, top: "50%", transform: "translateY(-50%)", width: AVATAR_SIZE, height: AVATAR_SIZE }}
      >
        {user.avatarUrl && (
          <Image src={user.avatarUrl} alt={user.username} width={AVATAR_SIZE} height={AVATAR_SIZE} style={{ objectFit: "cover" }}/>
        )}
      </div>

      {/* Upload avatar — owner only */}
      {user.isOwner && (
        <button
          className="absolute z-20 bg-black/70 text-white text-xs px-2 py-1 rounded cursor-pointer border-none"
          style={{ left: AVATAR_LEFT + 40, top: `calc(50% + ${AVATAR_SIZE * 0.18}px)` }}
        >
          Upload image
        </button>
      )}

      {/* Info */}
      <div
        className="absolute z-10 flex flex-col gap-2"
        style={{ left: AVATAR_LEFT + AVATAR_SIZE + 24, top: "50%", transform: "translateY(-50%)" }}
      >
        <span className="bg-black/80 rounded px-3 py-1 text-2xl font-bold text-white inline-block">
          {user.username}
        </span>

        <span className="bg-black/80 rounded px-3 py-1 text-sm text-gray-300 inline-block self-start">
          {user.location}
        </span>

        {/* Role badge */}
        <span className={`inline-flex items-center gap-1 self-start rounded px-2 py-0.5 text-xs uppercase tracking-wider border ${
          user.role === "artist"
            ? "bg-orange-500/20 border-orange-500 text-orange-400"
            : "bg-white/10 border-white/30 text-gray-300"
        }`}>
          {user.role === "artist" ? "⭐ Artist" : "🎧 Listener"}
        </span>

        {/* Favorite genres */}
        {user.favoriteGenres && user.favoriteGenres.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {user.favoriteGenres.map(genre => (
              <span key={genre} className="bg-black/70 border border-white/10 rounded px-2 py-0.5 text-xs text-gray-400">
                # {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}