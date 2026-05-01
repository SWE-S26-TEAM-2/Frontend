"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import TrackSlider from "@/components/Track/TrackSlider";
import { trendingService } from "@/services/di";
import type { ITrack } from "@/types/track.types";

export default function TrendingPage() {
  const [langHover, setLangHover] = useState(false);
  const [curated,   setCurated]   = useState<ITrack[]>([]);
  const [emerging,  setEmerging]  = useState<ITrack[]>([]);
  const [power,     setPower]     = useState<ITrack[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      trendingService.getCurated(),
      trendingService.getEmerging(),
      trendingService.getPower(),
    ])
      .then(([c, e, p]) => { setCurated(c); setEmerging(e); setPower(p); })
      .catch((err) => console.error("Trending fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <div className="w-full py-5 pb-[60px]">
        <div className="max-w-[1240px] mx-auto flex gap-[30px] px-5">

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <h1 className="text-[32px] font-extrabold mb-[25px] pb-[15px] border-b border-[#222]">
              Discover Tracks and Playlists
            </h1>

            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="mb-[40px]">
                  <TrackSlider title="Curated by SoundCloud" subtitle="Hand-picked for you" tracks={curated} />
                </div>
                <div className="mb-[40px]">
                  <TrackSlider title="Artists to watch out for" subtitle="Trending now" tracks={emerging} />
                </div>
                <div className="mb-[40px]">
                  <TrackSlider title="SoundCloud&apos;s Power Playlists" subtitle="The best of the best" tracks={power} />
                </div>
              </>
            )}
          </main>

          {/* Right sidebar */}
          <aside className="w-[300px] flex-shrink-0">
            <div className="sticky top-[80px] flex flex-col gap-[30px]">
              <div>
                <h3 className="text-white text-[16px] font-bold mb-[15px]">Go Mobile</h3>
                <div className="flex flex-col gap-[10px]">
                  <Image src="/apple.jpg" alt="App Store" width={140} height={42} className="rounded-lg" />
                  <Image src="/playstore.png" alt="Google Play" width={140} height={42} className="rounded-lg" />
                </div>
              </div>

              <div className="border-t border-[#222] pt-5">
                <div className="flex flex-wrap gap-x-[10px] gap-y-[6px]">
                  {["Legal", "Privacy", "Cookie Policy"].map((item) => (
                    <span key={item} className="text-[#b8b6b6] text-[13px] cursor-pointer hover:text-white transition-colors">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-5 text-[13px]">
                  <span className="text-[#f1eded]">Language: </span>
                  <span
                    onMouseEnter={() => setLangHover(true)}
                    onMouseLeave={() => setLangHover(false)}
                    className={`cursor-pointer transition-colors ${langHover ? "text-[#ff5500] underline" : "text-[#868484]"}`}
                  >
                    English (US)
                  </span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
