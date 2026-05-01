// src/app/[username]/components/ProfileSidebar.tsx

import type { IProfileSidebarProps } from "@/types/ui.types";
import { formatNumber } from "@/utils/formatNumber";
import { TrackCover } from "@/components/Track/TrackCover";
import { ProfileStats } from "./ProfileStats";

const WebIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const FollowersIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const TracksIcon = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
);
const VerifiedIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="#1da1f2">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
  </svg>
);

export function ProfileSidebar({ user, likes, fans, followers, following }: IProfileSidebarProps) {
  const hasSocialLinks = user.socialLinks && (
    user.socialLinks.website || user.socialLinks.instagram ||
    user.socialLinks.twitter || user.socialLinks.facebook
  );

  return (
    <div className="w-55 shrink-0 pt-15.5">

      {/* Stats */}
      <ProfileStats user={user}/>

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
              <WebIcon/> Website
            </a>
          )}
          {user.socialLinks?.instagram && (
            <a href={user.socialLinks.instagram} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-[#aaa] text-[13px] no-underline hover:text-white transition-colors">
              <InstagramIcon/> Instagram
            </a>
          )}
          {user.socialLinks?.twitter && (
            <a href={user.socialLinks.twitter} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-[#aaa] text-[13px] no-underline hover:text-white transition-colors">
              <TwitterIcon/> Twitter
            </a>
          )}
          {user.socialLinks?.facebook && (
            <a href={user.socialLinks.facebook} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-[#aaa] text-[13px] no-underline hover:text-white transition-colors">
              <FacebookIcon/> Facebook
            </a>
          )}
        </div>
      )}

      {/* Fans also like — other user only */}
      {!user.isOwner && fans.length > 0 && (
        <div className="mb-4 pb-4 border-b border-[#1c1c1c]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#999] tracking-widest">FANS ALSO LIKE</span>
            <button className="bg-transparent border-none text-[#ff5500] text-xs cursor-pointer">Refresh</button>
          </div>
          <div className="flex flex-col gap-3">
            {fans.map(fan => (
              <div key={fan.id} className="flex items-center gap-2.5">
                <TrackCover size={44} url={fan.avatarUrl} alt={fan.username} accentColor="#2a2a2a"/>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[#ddd] font-medium truncate">{fan.username}</div>
                  <div className="flex gap-2 text-[11px] text-[#666] mt-0.5">
                    <span className="flex items-center gap-1"><FollowersIcon/> {formatNumber(fan.followers)}</span>
                    <span className="flex items-center gap-1"><TracksIcon/> {fan.tracks}</span>
                  </div>
                </div>
                <button className="bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-3 py-1 text-xs cursor-pointer shrink-0 hover:border-white transition-colors">
                  Follow
                </button>
              </div>
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
            <a href="#" className="text-xs text-[#ff5500] no-underline">View all</a>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {followers.map(f => (
              <TrackCover key={f.id} size={36} url={f.avatarUrl} alt={f.username} accentColor="#2a2a2a"/>
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
            <a href="#" className="text-xs text-[#ff5500] no-underline">View all</a>
          </div>
          <div className="flex flex-col gap-3">
            {following.map(f => (
              <div key={f.id} className="flex items-center gap-2.5">
                <TrackCover size={44} url={f.avatarUrl} alt={f.username} accentColor="#2a2a2a"/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] text-[#ddd] font-medium truncate">{f.username}</span>
                    {f.isVerified && <VerifiedIcon/>}
                  </div>
                  <div className="flex gap-2 text-[11px] text-[#666] mt-0.5">
                    <span className="flex items-center gap-1"><FollowersIcon/> {formatNumber(f.followers)}</span>
                    <span className="flex items-center gap-1"><TracksIcon/> {f.tracks}</span>
                  </div>
                </div>
                <button className="bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-3 py-1 text-xs cursor-pointer shrink-0 hover:border-white transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Likes */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[13px] font-semibold text-[#999]">{user.likes} LIKES</span>
        <a href="#" className="text-xs text-[#ff5500] no-underline">View all</a>
      </div>
      <div className="flex flex-col gap-3">
        {likes.map(like => (
          <div key={like.id} className="flex gap-2.5 items-center">
            <TrackCover size={44} accentColor={like.accentColor ?? "#1a1a2e"} url={like.coverUrl} alt={like.title}/>
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
          </div>
        ))}
      </div>
    </div>
  );
}