"use client";

import Link from "next/link";
import Image from "next/image";
import { IFeedItem } from "@/types/feed.types";
import { ITrack } from "@/types/track.types";
import { timeAgo } from "@/utils/timeAgo";
import { formatNumber } from "@/utils/formatNumber";
import { usePlayerStore } from "@/store/playerStore";

interface IFeedCardProps {
  item: IFeedItem;
}

function actionLabel(type: IFeedItem["type"]): string {
  switch (type) {
    case "track":  return "posted a track";
    case "repost": return "reposted";
    case "like":   return "liked";
    case "follow": return "started following";
  }
}

function TrackRow({ track }: { track: ITrack }) {
  const { setTrack } = usePlayerStore();

  return (
    <div className="flex items-center gap-3 p-3 bg-(--sc-bg-surface) rounded-lg hover:bg-(--sc-bg-hover) transition-colors group">
      {/* Artwork + play overlay */}
      <div className="relative w-12 h-12 rounded shrink-0 overflow-hidden bg-(--sc-border) cursor-pointer" onClick={() => setTrack(track)}>
        <Image
          src={track.albumArt}
          alt={track.title}
          fill
          className="object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-(--sc-text) truncate">{track.title}</p>
        <p className="text-xs text-(--sc-text-muted) truncate">{track.artist}</p>
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-xs text-(--sc-text-muted) shrink-0">
        <span>▶ {formatNumber(track.plays)}</span>
        <span>♥ {formatNumber(track.likes)}</span>
      </div>
    </div>
  );
}

export default function FeedCard({ item }: IFeedCardProps) {
  return (
    <div className="py-5 border-b border-(--sc-border)">
      {/* Activity header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-(--sc-bg-surface) overflow-hidden shrink-0">
          <Image
            src={item.actor.avatarUrl}
            alt={item.actor.username}
            width={32}
            height={32}
            className="object-cover w-full h-full"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
        <p className="text-sm text-(--sc-text-muted) leading-snug">
          <Link href={`/${item.actor.username}`} className="font-semibold text-(--sc-text) hover:text-(--sc-orange) transition-colors">
            {item.actor.username}
          </Link>
          {" "}{actionLabel(item.type)}
          {item.type === "follow" && item.followedUser && (
            <>
              {" "}
              <Link href={`/${item.followedUser.username}`} className="font-semibold text-(--sc-text) hover:text-(--sc-orange) transition-colors">
                {item.followedUser.username}
              </Link>
            </>
          )}
        </p>
        <span className="ml-auto text-xs text-(--sc-text-muted) shrink-0">{timeAgo(item.createdAt)}</span>
      </div>

      {/* Content */}
      {item.track && (
        <TrackRow track={item.track} />
      )}

      {item.type === "follow" && item.followedUser && !item.track && (
        <div className="flex items-center gap-3 p-3 bg-(--sc-bg-surface) rounded-lg">
          <div className="w-10 h-10 rounded-full bg-(--sc-border) overflow-hidden shrink-0">
            <Image
              src={item.followedUser.avatarUrl}
              alt={item.followedUser.username}
              width={40}
              height={40}
              className="object-cover w-full h-full"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <Link href={`/${item.followedUser.username}`} className="text-sm font-semibold text-(--sc-text) hover:text-(--sc-orange) transition-colors">
            {item.followedUser.username}
          </Link>
          <button className="ml-auto text-xs px-3 py-1 border border-(--sc-orange) text-(--sc-orange) rounded hover:bg-(--sc-orange) hover:text-white transition-colors">
            Follow
          </button>
        </div>
      )}
    </div>
  );
}
