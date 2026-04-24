"use client";

import React from "react";
import TrackCard2 from "../Track/TrackCard2";
import { IRecentItem, IArtist } from "@/types/home.types";

/* =========================
   MAIN COMPONENT
========================= */
export default function RecentlyPlayedSlider({
  items,
}: {
  items: IRecentItem[];
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-white mb-4">
        Recently Played
      </h2>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {items.map((item) =>
          item.type === "track" ? (
            <div key={item.id} className="w-[150px] flex-shrink-0">
              <TrackCard2 track={item} showFollow={false} />
            </div>
          ) : (
            <ArtistRecentCard key={item.id} artist={item} />
          )
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
/* =========================
   ARTIST CARD (CIRCLE UI)
========================= */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";

const ArtistRecentCard = ({ artist }: { artist: IArtist }) => {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div
      onClick={() => router.push(`/artist/${artist.id}`)}
      className="w-[150px] flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
    >
      {/* Circle Image */}
      <div className="w-[150px] h-[150px] rounded-full overflow-hidden bg-neutral-800">
        <img
          src={artist.imageUrl || "/test.png"}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
      </div>

      {/* Name */}
      <span className="text-sm text-white font-medium text-center truncate w-full hover:text-orange-500 transition">
        {artist.name}
      </span>

      {/* Followers */}
      <span className="text-xs text-neutral-400">
        {artist.followers} followers
      </span>

      {/* 🔥 Follow Button (hover only) */}
      <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation(); // VERY IMPORTANT (prevents navigation)
            setIsFollowing(!isFollowing);
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded border text-[11px] font-semibold transition ${
            isFollowing
              ? "bg-orange-500 border-orange-500 text-white"
              : "bg-transparent border-neutral-600 text-white hover:border-white"
          }`}
        >
          <UserPlus size={12} />
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
};