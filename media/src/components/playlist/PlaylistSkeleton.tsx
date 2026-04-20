"use client";

const SKELETON_ROWS = 6;

export default function PlaylistSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 text-white md:px-6">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/70">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:p-8">
          <div className="h-56 w-56 animate-pulse rounded-2xl bg-white/10" />
          <div className="flex-1 space-y-4">
            <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
            <div className="h-10 w-3/4 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
            <div className="flex gap-3 pt-2">
              <div className="h-10 w-28 animate-pulse rounded-full bg-white/10" />
              <div className="h-10 w-24 animate-pulse rounded-full bg-white/10" />
              <div className="h-10 w-24 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-neutral-950/60 p-4 md:p-6">
        <div className="mb-4 grid grid-cols-[40px_56px_minmax(0,1fr)_72px] gap-3 border-b border-white/10 pb-3 text-xs uppercase tracking-[0.18em] text-white/45">
          <span>#</span>
          <span />
          <span>Title</span>
          <span className="text-right">Time</span>
        </div>
        <div className="space-y-3">
          {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[40px_56px_minmax(0,1fr)_72px] items-center gap-3 rounded-2xl p-2"
            >
              <div className="h-4 w-6 animate-pulse rounded-full bg-white/10" />
              <div className="h-14 w-14 animate-pulse rounded-xl bg-white/10" />
              <div className="space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
                <div className="h-3 w-1/3 animate-pulse rounded-full bg-white/10" />
              </div>
              <div className="ml-auto h-4 w-10 animate-pulse rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
