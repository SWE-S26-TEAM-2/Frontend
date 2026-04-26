import Link from "next/link";
import { CoverBox } from "@/components/Library/CoverBox";
import { AllDropdown } from "@/components/Library/LibraryControls";
import { TrackGridCard } from "@/components/Library/LibraryTrackCard";
//import { VerifiedIcon } from "@/components/Icons/ProfileIcons";
import { HeartIcon } from "@/components/Icons/TrackIcons";
import { formatNumber } from "@/utils/formatNumber";
import type {
  ILibraryRecentItem,
  ILibraryTrack,
  ILibraryPlaylist,
  ILibraryAlbum,
  ILibraryStation,
  ILibraryFollowing,
} from "@/types/library.types";

// JUST TILL MERGING LAST PR
export const VerifiedIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="#1da1f2" />
    <path
      d="M6.5 12.5l3.5 3.5 7-7"
      stroke="white"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// ─── Recently played ──────────────────────────────────────────────────────────

interface IRecentlyPlayedSectionProps {
  items: ILibraryRecentItem[];
}

export function RecentlyPlayedSection({ items }: IRecentlyPlayedSectionProps) {
  return (
    <section className="mb-16">
      <h2 className="text-[20px] font-bold text-white mb-6">Recently played</h2>
      <div className="grid grid-cols-6 gap-6">
        {items.map(item => (
          <Link key={item.id} href={item.href} className="flex flex-col items-center gap-2 group no-underline">
            <CoverBox
              url={item.coverUrl}
              alt={item.label}
              accentColor={item.accentColor}
              size={160}
              rounded={item.type === "user"}
            >
              <span className="text-4xl font-bold text-white/60">{item.label.charAt(0).toUpperCase()}</span>
            </CoverBox>
            <span className="text-[14px] text-[#ccc] text-center truncate w-full group-hover:text-white transition-colors">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Likes overview ───────────────────────────────────────────────────────────

interface ILikesOverviewSectionProps {
  tracks: ILibraryTrack[];
}

export function LikesOverviewSection({ tracks }: ILikesOverviewSectionProps) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold text-white">Likes</h2>
        <span className="text-[14px] text-[#aaa] cursor-pointer hover:text-white transition-colors">Browse trending playlists</span>
      </div>
      <div className="grid grid-cols-6 gap-6">
        {tracks.map(track => <TrackGridCard key={track.id} track={track} />)}
      </div>
    </section>
  );
}

// ─── Playlists overview ───────────────────────────────────────────────────────

interface IPlaylistsOverviewSectionProps {
  playlists: ILibraryPlaylist[];
}

export function PlaylistsOverviewSection({ playlists }: IPlaylistsOverviewSectionProps) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold text-white">Playlists</h2>
        <AllDropdown />
      </div>
      <div className="grid grid-cols-6 gap-6">
        {playlists.map(pl => (
          <div key={pl.id} className="flex flex-col gap-2 group cursor-pointer">
            <CoverBox
              url={pl.coverUrl}
              alt={pl.title}
              accentColor={pl.accentColor}
              size={160}
              showPlayOverlay
            >
              <span className="text-4xl font-bold text-white/40">≡</span>
            </CoverBox>
            <div className="text-[13px] text-[#ccc] group-hover:text-white transition-colors truncate">{pl.title}</div>
            <div className="text-[12px] text-[#666]">{pl.trackCount} tracks</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Albums overview ──────────────────────────────────────────────────────────

interface IAlbumsOverviewSectionProps {
  albums: ILibraryAlbum[];
}

export function AlbumsOverviewSection({ albums }: IAlbumsOverviewSectionProps) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold text-white">Albums</h2>
        <AllDropdown />
      </div>
      <div className="grid grid-cols-6 gap-6">
        {albums.map(album => (
          <div key={album.id} className="flex flex-col gap-2 group cursor-pointer">
            <CoverBox
              url={album.coverUrl}
              alt={album.title}
              accentColor={album.accentColor}
              size={160}
              showPlayOverlay
            >
              <span className="text-4xl font-bold text-white/40">◉</span>
            </CoverBox>
            <div className="text-[13px] text-[#ccc] group-hover:text-white transition-colors truncate">{album.title}</div>
            <div className="text-[12px] text-[#666] truncate">{album.artist}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Stations overview ────────────────────────────────────────────────────────

interface IStationsOverviewSectionProps {
  stations: ILibraryStation[];
}

export function StationsOverviewSection({ stations }: IStationsOverviewSectionProps) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold text-white">Liked Stations</h2>
        <span className="text-[14px] text-[#aaa] cursor-pointer hover:text-white transition-colors">Browse all</span>
      </div>
      <div className="grid grid-cols-6 gap-6">
        {stations.map(st => (
          <div key={st.id} className="flex flex-col gap-2 group cursor-pointer">
            <CoverBox
              url={st.coverUrl}
              alt={st.title}
              accentColor={st.accentColor}
              size={160}
              showPlayOverlay
            >
              <div
                className="absolute inset-0 flex flex-col items-start justify-end p-2 z-0"
                style={{ background: `linear-gradient(to top, ${st.accentColor ?? "#1a1a1a"}cc, transparent)` }}
              >
                <span className="text-[9px] font-bold text-white/70 tracking-widest">STATION</span>
                <span className="text-[13px] font-bold text-white truncate w-full">{st.title}</span>
              </div>
            </CoverBox>
            <div className="flex items-center gap-1 text-[13px] text-[#ccc] group-hover:text-white transition-colors truncate">
              <HeartIcon isFilled={true} />
              <span className="truncate">{st.title}</span>
            </div>
            <div className="text-[12px] text-[#666]">{st.subtitle}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Following overview ───────────────────────────────────────────────────────

interface IFollowingOverviewSectionProps {
  following: ILibraryFollowing[];
}

export function FollowingOverviewSection({ following }: IFollowingOverviewSectionProps) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold text-white">Following</h2>
        <span className="text-[14px] text-[#aaa] cursor-pointer hover:text-white transition-colors">Browse trending playlists</span>
      </div>
      <div className="grid grid-cols-6 gap-6">
        {following.map(f => (
          <div key={f.id} className="flex flex-col items-center gap-2 group cursor-pointer">
            <CoverBox
              url={f.avatarUrl}
              alt={f.username}
              accentColor="#2a2a2a"
              size={160}
              rounded
            >
              <span className="text-4xl font-bold text-white/40">{f.username.charAt(0).toUpperCase()}</span>
            </CoverBox>
            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-1 text-[13px] text-[#ccc] group-hover:text-white transition-colors">
                <span className="truncate max-w-[90%]">{f.username}</span>
                {f.isVerified && <VerifiedIcon />}
              </div>
              <div className="flex items-center justify-center gap-1 text-[12px] text-[#666]">
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                {formatNumber(f.followers)} followers
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}