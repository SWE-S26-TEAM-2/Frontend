"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import TrackSlider from "../../../components/Track/TrackSlider";
import Footer from "../../../components/Footer/Footer";
import LoginModal from "../../../components/LoginModal/LoginModal";
import HoverButton from "@/components/HoverButton/HoverButton";
import Image from "next/image";
import { trendingService } from "@/services/di";
import { ITrack } from "@/types/track.types";

// ── ICONS ─────────────────────────────────────────

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SoundCloudLogo = () => (
  <svg viewBox="-2 0 32 32" width="28" height="28" fill="white">
    <path d="M23.2 22.68h-10.12..." />
  </svg>
);

const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

export default function TrendingPage() {
  const [activeNav, setActiveNav] = useState("Home");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [dotsOpen, setDotsOpen] = useState(false);
  const [langHover, setLangHover] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);

  // 🔥 DATA STATES
  const [curated, setCurated] = useState<ITrack[]>([]);
  const [emerging, setEmerging] = useState<ITrack[]>([]);
  const [power, setPower] = useState<ITrack[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH DATA FROM DI
  useEffect(() => {
    const load = async () => {
      try {
        const [c, e, p] = await Promise.all([
          trendingService.getCurated(),
          trendingService.getEmerging(),
          trendingService.getPower(),
        ]);

        setCurated(c);
        setEmerging(e);
        setPower(p);
      } catch (err) {
        console.error("Trending fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // close dots menu
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dotsRef.current && !dotsRef.current.contains(e.target as Node)) {
        setDotsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}

      {/* HEADER */}
      <header className="h-[60px] bg-[#121212] flex justify-center sticky top-0 z-[1000] border-b border-[#222]">
        <div className="w-full max-w-[1240px] flex items-center px-5">

          {/* LEFT */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 mr-5">
              <SoundCloudLogo />
              <span className="text-white text-[16px] font-bold uppercase">
                soundcloud
              </span>
            </Link>

            <nav className="flex h-[60px]">
              {["Home", "Feed", "Library"].map((item) => (
                <HoverButton
                  key={item}
                  onClick={() =>
                    item === "Home"
                      ? setActiveNav("Home")
                      : setIsLoginOpen(true)
                  }
                  className={`px-[15px] text-[14px] font-medium h-full border-b-2 ${
                    activeNav === item
                      ? "text-white border-[#ff5500]"
                      : "text-[#aaa] border-transparent"
                  }`}
                >
                  {item}
                </HoverButton>
              ))}
            </nav>
          </div>

          {/* SEARCH */}
          <div className="flex-1 flex justify-center px-[25px]">
            <div className="flex items-center bg-[#252525] rounded px-3 w-full max-w-[480px] h-[34px] border border-[#333]">
              <input
                placeholder="Search for artists, bands, tracks..."
                className="bg-transparent outline-none text-white text-[13px] w-full"
              />
              <SearchIcon />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-[15px]">
            <HoverButton
              className="text-white text-[14px] font-bold"
              onClick={() => setIsLoginOpen(true)}
            >
              Sign in
            </HoverButton>

            <HoverButton
              className="bg-white text-black border border-[#ccc] px-[12px] py-[5px] rounded text-[14px] font-bold"
              onClick={() => setIsLoginOpen(true)}
            >
              Create account
            </HoverButton>

            <HoverButton className="text-[#9b9a9a] text-[14px]">
              Upload
            </HoverButton>

            <div ref={dotsRef} className="relative flex items-center">
              <HoverButton
                className="text-[#999]"
                onClick={() => setDotsOpen(!dotsOpen)}
              >
                <DotsIcon />
              </HoverButton>

              {dotsOpen && (
                <div className="absolute top-[calc(100%+15px)] right-0 bg-[#303030] border border-[#505050] rounded min-w-[200px] z-[999] shadow-lg overflow-hidden">
                  {["About us", "Legal", "Copyright"].map((item, i) => (
                    <Link key={i} href="#" className="block">
                      <HoverButton className="w-full text-left px-4 py-[10px] text-[#ddd] text-[14px] font-medium">
                        {item}
                      </HoverButton>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="w-full py-5 pb-[60px]">
        <div className="max-w-[1240px] mx-auto flex gap-[30px] px-5">

          {/* LEFT */}
          <main className="flex-1 min-w-0">
            <h1 className="text-[32px] font-extrabold mb-[25px] pb-[15px] border-b border-[#222]">
              Discover Tracks and Playlists
            </h1>

            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="mb-[40px]">
                  <TrackSlider
                    title="Curated by SoundCloud"
                    subtitle="Hand-picked for you"
                    tracks={curated}
                  />
                </div>

                <div className="mb-[40px]">
                  <TrackSlider
                    title="Artists to watch out for"
                    subtitle="Trending now"
                    tracks={emerging}
                  />
                </div>

                <div className="mb-[40px]">
                  <TrackSlider
                    title="SoundCloud's Power Playlists"
                    subtitle="The best of the best"
                    tracks={power}
                  />
                </div>
              </>
            )}
          </main>

          {/* RIGHT */}
          <aside className="w-[300px] flex-shrink-0">
            <div className="sticky top-[80px] flex flex-col gap-[30px]">

              <div>
                <h3 className="text-white text-[16px] font-bold mb-[15px]">
                  Go Mobile
                </h3>

                <div className="flex flex-col gap-[10px]">
                  <Image src="/apple.jpg" alt="" width={140} height={42} className="rounded-lg" />
                  <Image src="/playstore.png" alt="" width={140} height={42} className="rounded-lg" />
                </div>
              </div>

              <div className="border-t border-[#222] pt-5">
                <div className="flex flex-wrap gap-x-[10px] gap-y-[6px]">
                  {["Legal", "Privacy", "Cookie Policy"].map((item) => (
                    <HoverButton key={item} className="text-[#b8b6b6] text-[13px]">
                      {item}
                    </HoverButton>
                  ))}
                </div>

                <div className="mt-5 text-[13px]">
                  <span className="text-[#f1eded]">Language: </span>
                  <span
                    onMouseEnter={() => setLangHover(true)}
                    onMouseLeave={() => setLangHover(false)}
                    className={`cursor-pointer transition ${
                      langHover ? "text-[#ff5500] underline" : "text-[#868484]"
                    }`}
                  >
                    English (US)
                  </span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>

      <Footer />
    </div>
  );
}