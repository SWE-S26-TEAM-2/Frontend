// src/components/Profile/ProfileSidebar.tsx

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { IProfileSidebarProps } from "@/types/ui.types";
import type { IFanUser, IFollowing, ILikedTrack } from "@/types/userProfile.types";
import { formatNumber } from "@/utils/formatNumber";
import { TrackCover } from "@/components/Track/TrackCover";
import { ProfileStats } from "./ProfileStats";
import { WebIcon, InstagramIcon, TwitterIcon, FacebookIcon } from "@/components/Icons/SocialIcons";
import { PlayIcon} from "@/components/Icons/PlayerIcons";
import { VerifiedIcon, FollowersIcon, DotsIcon, StationIcon,
} from "@/components/Icons/ProfileIcons";
import {
  HeartIcon, RepostIcon, ShareIcon as ShareMenuIcon, CopyIcon as CopyLinkIcon,
  NextUpIcon, AddToPlaylistIcon, TracksIcon,
} from "@/components/Icons/TrackIcons";
import { userProfileService } from "@/services/di";

// ─────────────────────────────────────────────────────────────
// Track Dots Dropdown Menu
// ─────────────────────────────────────────────────────────────

interface ITrackDotsMenuProps {
  track: ILikedTrack;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}
 
function TrackDotsMenu({ track, anchorRef, onClose }: ITrackDotsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef]);
 
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/track/${track.id}`).catch(() => {});
    onClose();
  };
 
  const menuItems = [
    { icon: <RepostIcon />, label: "Repost", onClick: onClose },
    { icon: <ShareMenuIcon />, label: "Share", onClick: onClose },
    { icon: <CopyLinkIcon />, label: "Copy Link", onClick: handleCopyLink },
    { icon: <NextUpIcon />, label: "Add to Next up", onClick: onClose },
    { icon: <AddToPlaylistIcon />, label: "Add to Playlist", onClick: onClose },
    { icon: <StationIcon />, label: "Station", onClick: onClose },
  ];
 
  return (
    <div
      ref={menuRef}
      className="absolute z-50 right-0 top-full mt-1 bg-[#222] border border-[#333] rounded shadow-xl py-1 min-w-45"
    >
      {menuItems.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#ccc] hover:bg-[#2e2e2e] hover:text-white transition-colors text-left bg-transparent border-none cursor-pointer"
        >
          <span className="text-[#aaa]">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
 
// ─────────────────────────────────────────────────────────────
// Like Track Row (sidebar)
// ─────────────────────────────────────────────────────────────
 
interface ILikeRowProps {
  like: ILikedTrack;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
}
 
function LikeRow({ like, isLiked, onToggleLike }: ILikeRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDotsOpen, setIsDotsOpen] = useState(false);
  const dotsRef = useRef<HTMLButtonElement>(null);
 
  return (
    <div
      className="flex gap-2.5 items-center relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); }}
    >
      {/* Cover art with play overlay */}
      <div className="relative shrink-0">
        <TrackCover size={44} accentColor={like.accentColor ?? "#1a1a2e"} url={like.coverUrl} alt={like.title} />
        {isHovered && (
          <button
            onClick={() => {/* TODO: play track */}}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded cursor-pointer border-none"
          >
            <PlayIcon />
          </button>
        )}
      </div>
 
      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="text-xs text-[#888] truncate">{like.artist}</div>
        <div className="text-[13px] text-[#ddd] truncate font-medium">{like.title}</div>
        {like.plays !== undefined && (
          <div className="text-[10px] text-[#444] flex gap-1.5 mt-0.5">
            <span>▶ {formatNumber(like.plays)}</span>
            <span>♥ {formatNumber(like.likes ?? 0)}</span>
            <span>↻ {like.reposts ?? 0}</span>
            {like.comments !== undefined && <span>💬 {like.comments}</span>}
          </div>
        )}
      </div>
 
      {/* Action buttons — visible on hover */}
      {(isHovered || isDotsOpen) && (
        <div className="flex items-center gap-1 shrink-0">
          {/* Like/Heart button */}
          <button
            onClick={() => onToggleLike(like.id)}
            className="flex items-center justify-center w-7 h-7 rounded cursor-pointer border-none transition-colors bg-[#333] hover:bg-[#444]"
            title={isLiked ? "Unlike" : "Like"}
          >
            <HeartIcon isFilled={isLiked} />
          </button>
 
          {/* Dots menu button */}
          <div className="relative">
            <button
              ref={dotsRef}
              onClick={() => setIsDotsOpen(prev => !prev)}
              className="flex items-center justify-center w-7 h-7 rounded bg-[#333] hover:bg-[#444] cursor-pointer border-none transition-colors"
              title="More options"
            >
              <DotsIcon />
            </button>
            {isDotsOpen && (
              <TrackDotsMenu
                track={like}
                anchorRef={dotsRef}
                onClose={() => setIsDotsOpen(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
 
// ─────────────────────────────────────────────────────────────
// Fan Row
// ─────────────────────────────────────────────────────────────
 
interface IFanRowProps {
  fan: IFanUser;
  isFollowing: boolean;
  onToggleFollow: (id: string) => void;
}
 
function FanRow({ fan, isFollowing, onToggleFollow }: IFanRowProps) {
  return (
    <div className="flex items-center gap-2.5">
      <TrackCover size={44} url={fan.avatarUrl} alt={fan.username} accentColor="#2a2a2a" />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-[#ddd] font-medium truncate">{fan.username}</div>
        <div className="flex gap-2 text-[11px] text-[#666] mt-0.5">
          <span className="flex items-center gap-1"><FollowersIcon /> {formatNumber(fan.followers)}</span>
          <span className="flex items-center gap-1"><TracksIcon /> {fan.tracks}</span>
        </div>
      </div>
      <button
        onClick={() => onToggleFollow(fan.username)}
        className={`rounded px-3 py-1 text-xs cursor-pointer shrink-0 transition-colors border ${
          isFollowing
            ? "bg-[#2a2a2a] border-[#444] text-[#aaa] hover:border-[#ff5500] hover:text-[#ff5500]"
            : "bg-transparent border-[#2e2e2e] text-[#ccc] hover:border-white"
        }`}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}
 
// ─────────────────────────────────────────────────────────────
// Following Row (sidebar)
// ─────────────────────────────────────────────────────────────
 
interface IFollowingRowProps {
  f: IFollowing;
  isFollowing: boolean;
  onToggleFollow: (id: string) => void;
}
 
function FollowingRow({ f, isFollowing, onToggleFollow }: IFollowingRowProps) {
  return (
    <div className="flex items-center gap-2.5">
      <Link href={`/${f.username}`}>
        <TrackCover size={44} url={f.avatarUrl} alt={f.username} accentColor="#2a2a2a" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-[13px] text-[#ddd] font-medium truncate">{f.username}</span>
          {f.isVerified && <VerifiedIcon />}
        </div>
        <div className="flex gap-2 text-[11px] text-[#666] mt-0.5">
          <span className="flex items-center gap-1"><FollowersIcon /> {formatNumber(f.followers)}</span>
          <span className="flex items-center gap-1"><TracksIcon /> {f.tracks}</span>
        </div>
      </div>
      <button
        onClick={() => onToggleFollow(f.username)}
        className={`rounded px-3 py-1 text-xs cursor-pointer shrink-0 transition-colors border ${
          isFollowing
            ? "bg-[#2a2a2a] border-[#444] text-[#aaa] hover:border-[#ff5500] hover:text-[#ff5500]"
            : "bg-transparent border-[#2e2e2e] text-[#ccc] hover:border-white"
        }`}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}
 
// ─────────────────────────────────────────────────────────────
// ProfileSidebar
// ─────────────────────────────────────────────────────────────
 
export function ProfileSidebar({ user, likes, fans, followers, following, tracksCount }: IProfileSidebarProps) {
  const hasSocialLinks = user.socialLinks && (
    user.socialLinks.website || user.socialLinks.instagram ||
    user.socialLinks.twitter || user.socialLinks.facebook
  );
 
  const base = `/${user.username}`;
 
  // ── Fans also like — local shuffled state ──
  const [displayedFans, setDisplayedFans] = useState<IFanUser[]>(fans);
  const [isRefreshing, setIsRefreshing] = useState(false);
 
  const handleRefreshFans = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const freshFans = await userProfileService.getFansAlsoLike(user.id);
      // Shuffle the result for a "refresh" feel
      const shuffled = [...freshFans].sort(() => Math.random() - 0.5);
      setDisplayedFans(shuffled);
    } catch {
      // Fallback: just shuffle what we already have
      setDisplayedFans(prev => [...prev].sort(() => Math.random() - 0.5));
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, user.id]);
 
  // ── Fans follow state ──
  const [fanFollowState, setFanFollowState] = useState<Record<string, boolean>>(
    () => Object.fromEntries(fans.map(f => [f.username, false]))
  );

  const handleToggleFanFollow = useCallback(async (fanUsername: string) => {
    const isCurrentlyFollowing = fanFollowState[fanUsername];
    setFanFollowState(prev => ({ ...prev, [fanUsername]: !isCurrentlyFollowing }));
    try {
      if (isCurrentlyFollowing) {
        await userProfileService.unfollowUser(fanUsername);
      } else {
        await userProfileService.followUser(fanUsername);
      }
    } catch {
      setFanFollowState(prev => ({ ...prev, [fanUsername]: isCurrentlyFollowing }));
    }
  }, [fanFollowState]);
 
  // ── Following follow state — pre-seeded as "following" since you follow them ──
  const [followingState, setFollowingState] = useState<Record<string, boolean>>(
    () => Object.fromEntries(following.map(f => [f.username, true]))
  );

  const handleToggleFollowing = useCallback(async (targetUsername: string) => {
    const isCurrentlyFollowing = followingState[targetUsername];
    setFollowingState(prev => ({ ...prev, [targetUsername]: !isCurrentlyFollowing }));
    try {
      if (isCurrentlyFollowing) {
        await userProfileService.unfollowUser(targetUsername);
      } else {
        await userProfileService.followUser(targetUsername);
      }
    } catch {
      setFollowingState(prev => ({ ...prev, [targetUsername]: isCurrentlyFollowing }));
    }
  }, [followingState]);
 
  // ── Likes — local liked state for toggling ──
  const [likedState, setLikedState] = useState<Record<string, boolean>>(
    () => Object.fromEntries(likes.map(l => [l.id, true]))
  );

  const handleToggleLike = useCallback(async (trackId: string) => {
    const isCurrentlyLiked = likedState[trackId];
    setLikedState(prev => ({ ...prev, [trackId]: !isCurrentlyLiked }));
    try {
      // TODO: wire to trackService.likeTrack / unlikeTrack when available
    } catch {
      setLikedState(prev => ({ ...prev, [trackId]: isCurrentlyLiked }));
    }
  }, [likedState]);
 
  // ── Sync fans when prop changes ──
  useEffect(() => {
    setDisplayedFans(fans);
    setFanFollowState(Object.fromEntries(fans.map(f => [f.username, false])));
  }, [fans]);
 
  return (
    <div className="w-55 shrink-0 pt-15.5">
 
      {/* Stats */}
      <ProfileStats user={user} tracksCount={tracksCount} />
 
      {/* Bio */}
      {user.bio && (
        <p className="text-[13px] text-[#aaa] leading-relaxed mb-4 pb-4 border-b border-[#1c1c1c]">
          {user.bio}
        </p>
      )}
 
      {/* Social links */}
      {hasSocialLinks && (
        <div className="flex flex-col gap-2.5 mb-4 pb-4 border-b border-[#1c1c1c]">
          {user.socialLinks?.website && (
            <a href={user.socialLinks.website} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-[#aaa] text-[13px] no-underline hover:text-white transition-colors">
              <WebIcon /> Website
            </a>
          )}
          {user.socialLinks?.instagram && (
            <a href={user.socialLinks.instagram} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-[#aaa] text-[13px] no-underline hover:text-white transition-colors">
              <InstagramIcon /> Instagram
            </a>
          )}
          {user.socialLinks?.twitter && (
            <a href={user.socialLinks.twitter} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-[#aaa] text-[13px] no-underline hover:text-white transition-colors">
              <TwitterIcon /> Twitter
            </a>
          )}
          {user.socialLinks?.facebook && (
            <a href={user.socialLinks.facebook} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-[#aaa] text-[13px] no-underline hover:text-white transition-colors">
              <FacebookIcon /> Facebook
            </a>
          )}
        </div>
      )}
 
      {/* Fans also like — other user only */}
      {!user.isOwner && displayedFans.length > 0 && (
        <div className="mb-4 pb-4 border-b border-[#1c1c1c]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#999] tracking-widest">FANS ALSO LIKE</span>
            <button
              onClick={handleRefreshFans}
              disabled={isRefreshing}
              className={`bg-transparent border-none text-[#ff5500] text-xs cursor-pointer transition-opacity ${
                isRefreshing ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
              }`}
            >
              {isRefreshing ? "..." : "Refresh"}
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {displayedFans.map(fan => (
              <FanRow
                key={fan.id}
                fan={fan}
                isFollowing={fanFollowState[fan.username] ?? false}
                onToggleFollow={handleToggleFanFollow}
              />
            ))}
          </div>
        </div>
      )}
 
      {/* Followers */}
      {followers.length > 0 && (
        <div className="mb-4 pb-4 border-b border-[#1c1c1c]">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-bold text-[#999] tracking-widest">
              {formatNumber(user.followers)} FOLLOWERS
            </span>
            <Link href={`${base}/followers`} className="text-xs text-[#ff5500] no-underline hover:underline">
              View all
            </Link>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {followers.map(f => (
              <Link key={f.id} href={`/${f.username}`}>
                <TrackCover size={36} url={f.avatarUrl} alt={f.username} accentColor="#2a2a2a" />
              </Link>
            ))}
          </div>
        </div>
      )}
 
      {/* Following */}
      {following.length > 0 && (
        <div className="mb-4 pb-4 border-b border-[#1c1c1c]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#999] tracking-widest">
              {user.following} FOLLOWING
            </span>
            <Link href={`${base}/following`} className="text-xs text-[#ff5500] no-underline hover:underline">
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {following.map(f => (
              <FollowingRow
                key={f.id}
                f={f}
                isFollowing={followingState[f.username] ?? true}
                onToggleFollow={handleToggleFollowing}
              />
            ))}
          </div>
        </div>
      )}
 
      {/* Likes */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[13px] font-semibold text-[#999]">{user.likes} LIKES</span>
        <Link href={`${base}/likes`} className="text-xs text-[#ff5500] no-underline hover:underline">
          View all
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {likes.map(like => (
          <LikeRow
            key={like.id}
            like={like}
            isLiked={likedState[like.id] ?? true}
            onToggleLike={handleToggleLike}
          />
        ))}
      </div>
 
    </div>
  );
}
 