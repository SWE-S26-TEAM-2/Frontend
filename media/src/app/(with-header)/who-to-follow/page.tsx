"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { userProfileService } from "@/services/di";
import { useAuthStore } from "@/store/authStore";
import { formatNumber } from "@/utils/formatNumber";
import type { IFanUser } from "@/types/userProfile.types";

function UserCard({ user, onFollow }: { user: IFanUser & { isFollowing: boolean }; onFollow: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-(--sc-bg-elevated) border border-(--sc-border) hover:border-orange-500/30 transition-colors">
      {/* Avatar */}
      <Link href={`/${user.id}`} className="flex-shrink-0">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg">
            {user.username[0]?.toUpperCase()}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/${user.id}`} className="text-sm font-semibold text-(--sc-text) hover:text-orange-400 transition-colors truncate block">
          {user.username}
        </Link>
        <p className="text-xs text-(--sc-text-muted)">
          {formatNumber(user.followers)} followers · {user.tracks} tracks
        </p>
      </div>

      {/* Follow button */}
      <button
        onClick={() => onFollow(user.id)}
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
          user.isFollowing
            ? "border border-(--sc-border) text-(--sc-text-muted) hover:border-red-400 hover:text-red-400"
            : "bg-orange-500 text-white hover:bg-orange-600"
        }`}
      >
        {user.isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-(--sc-bg-elevated) animate-pulse">
          <div className="w-12 h-12 rounded-full bg-(--sc-bg)" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-(--sc-bg) rounded w-24" />
            <div className="h-2 bg-(--sc-bg) rounded w-32" />
          </div>
          <div className="w-16 h-7 bg-(--sc-bg) rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function WhoToFollowPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const [users, setUsers] = useState<(IFanUser & { isFollowing: boolean })[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/login");
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const userId = String(
      user?.id ?? (typeof window !== "undefined" ? localStorage.getItem("auth_user_id") : null) ?? "1"
    );
    startTransition(async () => {
      const data = await userProfileService.getFansAlsoLike(userId);
      setUsers(data.map((u) => ({ ...u, isFollowing: false })));
    });
  }, [isLoggedIn, user?.id]);

  const handleFollow = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    try {
      if (target.isFollowing) {
        await userProfileService.unfollowUser(userId);
      } else {
        await userProfileService.followUser(userId);
      }
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u)
      );
    } catch {
      // silent — mock mode returns void
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="bg-(--sc-bg) min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 pb-28">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-(--sc-text)">Who to follow</h1>
          <p className="text-sm text-(--sc-text-muted) mt-1">Discover artists and people you might like</p>
        </div>

        {isPending ? (
          <GridSkeleton />
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-(--sc-text-muted)">No suggestions available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => (
              <UserCard key={u.id} user={u} onFollow={handleFollow} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
