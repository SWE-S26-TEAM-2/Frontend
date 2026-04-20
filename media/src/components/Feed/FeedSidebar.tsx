import Link from "next/link";
import Image from "next/image";
import { MOCK_USERS } from "@/services/mocks/mockData";

const SUGGESTIONS = [
  { ...MOCK_USERS.djremix,      genre: "House",       followers: "7.8K" },
  { ...MOCK_USERS.beatmaker99,  genre: "Hip-Hop",     followers: "1.9K" },
  { ...MOCK_USERS.soundwave,    genre: "Electronic",  followers: "3.4K" },
];

export default function FeedSidebar() {
  return (
    <aside className="w-56 shrink-0">
      {/* Who to follow */}
      <div className="bg-(--sc-bg-elevated) border border-(--sc-border) rounded-lg p-4 mb-4">
        <h3 className="text-xs font-bold text-(--sc-text-muted) uppercase tracking-wider mb-4">
          People to follow
        </h3>
        <div className="flex flex-col gap-4">
          {SUGGESTIONS.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-(--sc-bg-surface) overflow-hidden shrink-0">
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/${user.username}`}
                  className="text-sm font-semibold text-(--sc-text) hover:text-(--sc-orange) truncate block transition-colors"
                >
                  {user.username}
                </Link>
                <span className="text-xs text-(--sc-text-muted)">{user.followers} followers</span>
              </div>
              <button className="text-xs px-2 py-1 border border-(--sc-orange) text-(--sc-orange) rounded hover:bg-(--sc-orange) hover:text-white transition-colors shrink-0">
                Follow
              </button>
            </div>
          ))}
        </div>
        <Link
          href="/who-to-follow"
          className="block mt-4 text-xs text-(--sc-orange) hover:underline"
        >
          View all →
        </Link>
      </div>

      {/* Trending now teaser */}
      <div className="bg-(--sc-bg-elevated) border border-(--sc-border) rounded-lg p-4">
        <h3 className="text-xs font-bold text-(--sc-text-muted) uppercase tracking-wider mb-3">
          Trending now
        </h3>
        <Link
          href="/charts"
          className="block text-xs text-(--sc-orange) hover:underline"
        >
          View charts →
        </Link>
      </div>
    </aside>
  );
}
