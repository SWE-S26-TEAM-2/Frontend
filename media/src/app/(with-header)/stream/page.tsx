"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { feedService } from "@/services/di";
import { useAuthStore } from "@/store/authStore";
import { IFeedItem } from "@/types/feed.types";
import FeedCard from "@/components/Feed/FeedCard";
import FeedFilter from "@/components/Feed/FeedFilter";
import FeedSidebar from "@/components/Feed/FeedSidebar";

type IFilter = "all" | "tracks" | "reposts";

function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="py-5 border-b border-(--sc-border) animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-(--sc-bg-elevated)" />
            <div className="h-3 bg-(--sc-bg-elevated) rounded w-48" />
          </div>
          <div className="h-16 bg-(--sc-bg-elevated) rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function StreamPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [items, setItems] = useState<IFeedItem[]>([]);
  const [filter, setFilter] = useState<IFilter>("all");
  const [isPending, startTransition] = useTransition();

  // Auth guard
  useEffect(() => {
    if (!isLoggedIn) router.replace("/login");
  }, [isLoggedIn, router]);

  // Load feed — useTransition keeps setState out of the effect body (React 19)
  useEffect(() => {
    startTransition(async () => {
      const data = await feedService.getFeed(filter);
      setItems(data);
    });
  }, [filter]);

  const isLoading = isPending && items.length === 0;

  if (!isLoggedIn) return null;

  return (
    <div className="bg-(--sc-bg) min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-28">
        <div className="flex gap-8">

          {/* Main feed */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-(--sc-text) mb-5">Stream</h1>
            <FeedFilter active={filter} onChange={setFilter} />

            {isLoading ? (
              <FeedSkeleton />
            ) : items.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-(--sc-text-muted) mb-4">Nothing here yet.</p>
                <p className="text-sm text-(--sc-text-muted)">
                  Follow more artists to see their activity in your stream.
                </p>
              </div>
            ) : (
              <div>
                {items.map((item) => (
                  <FeedCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <FeedSidebar />
        </div>
      </div>
    </div>
  );
}
