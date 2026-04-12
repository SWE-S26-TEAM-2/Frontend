"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SlideShow from "../../components/SlideShow/SlideShow";
import LoginModal from "@/components/LoginModal/LoginModal";
import HoverButton from "@/components/HoverButton/HoverButton";
import { useAuthStore } from "@/store/authStore";

import { LandingApiService } from "@/services/api/landing.api";
import { ILandingData } from "@/types/landing.types";
import type { ITrack } from "@/types/track.types";

export default function Home() {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [content, setContent] = useState<ILandingData | null>(null);
  const [tracks, setTracks] = useState<ITrack[]>([]);

  const redirectToProfile = () => {
    const userId = authUser?.id ?? window.localStorage.getItem("auth_user_id");
    router.push(userId ? `/${userId}` : "/settings/account");
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem("auth_token")) {
      redirectToProfile();
    }
    LandingApiService.getLandingData().then(setContent);
    LandingApiService.getTrendingTracks().then(setTracks);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!content) return <div className="bg-[#141212] min-h-screen" />;

  return (
    <>
      {isModalOpen && (
        <LoginModal
          onClose={() => {
            setIsModalOpen(false);
            const userId = authUser?.id ?? window.localStorage.getItem("auth_user_id");
            if (userId) redirectToProfile();
          }}
        />
      )}
      
      <div className="bg-[#141212] min-h-screen flex justify-center text-white pb-20 selection:bg-orange-500 selection:text-white">
        <main className="p-12 w-full max-w-[1400px]">
          <div className="flex flex-col items-center relative"> {/* Added relative here */}
            
            {/* --- HEADER (Now Absolute to sit ON the slider) --- */}
            <header className="absolute top-6 w-[1100px] flex justify-between items-center z-50 px-4">
              <div className="flex items-center gap-2">
                <Image src="/logo1.png" alt="Logo" width={45} height={45} className="brightness-110" />
                <h1 className="text-2xl font-black tracking-tighter uppercase text-white">SoundCloud</h1>
              </div>
              <div className="flex gap-3">
                <HoverButton 
                  className="px-5 py-1.5 bg-white text-black rounded font-bold border-none text-sm"
                  onClick={() => setIsModalOpen(true)}
                >
                  Sign in
                </HoverButton>
                <HoverButton 
                  className="px-5 py-1.5 bg-black text-white border-none border-gray-600 rounded font-bold text-sm"
                  onClick={() => setIsModalOpen(true)}
                >
                  Create account
                </HoverButton>
              </div>
            </header>

            <SlideShow />

            {/* Search Input Area */}
            <div className="mt-10 flex items-center gap-5">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search for artists, bands, tracks..."
                  className="w-[650px] h-[55px] rounded-md bg-[#222] border border-transparent focus:border-gray-500 focus:bg-[#333] transition-all px-6 text-lg outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
                {searchQuery && (
                  <div className="absolute top-[65px] w-full bg-[#1a1a1a] rounded-lg border border-gray-800 z-50 p-2 shadow-2xl">
                    {tracks
                      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(t => (
                        <div key={`${t.id}-${t.title}`} className="p-4 hover:bg-[#333] rounded-md cursor-pointer flex justify-between items-center transition-colors">
                          <span className="font-semibold">{t.title}</span>
                          <span className="text-xs text-gray-500 uppercase tracking-widest">{t.artist}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <span className="text-xl font-light italic text-gray-500">or</span>
              <HoverButton 
                onClick={() => router.push('/Upload')} 
                className="h-[55px] px-[35px] bg-white text-black rounded-md font-bold text-[1.1rem] border-none"
              >
                Upload your own
              </HoverButton>
            </div>

            <section className="mt-16 text-center">
              <h2 className="text-3xl font-medium mb-8">{content.trendingTagline}</h2>
              <HoverButton 
                onClick={() => router.push('/discover')} 
                className="px-10 py-[14px] bg-white text-black rounded font-bold text-base border-none"
              >
                Explore trending playlists
              </HoverButton>
            </section>

            {/* --- ZERO GAP IMAGE SECTION --- */}
            <div className="mt-20 w-[1200px] flex flex-col">
               {/* Top Image (Ad) */}
               <Image 
                  src="/ad.png" 
                  alt="Ad" 
                  width={1200} 
                  height={200} 
                  className="w-full rounded-t-lg shadow-lg hover:brightness-110 transition-all cursor-pointer block" 
               />
               
               {/* Bottom Image (Creator Section) - Margin set to 0 to remove gap */}
               <div className="relative w-full rounded-b-xl overflow-hidden shadow-2xl">
                  <Image src="/beffooter.png" alt="Creator Background" width={1200} height={450} className="w-full object-cover block" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center px-16">
                    <h2 className="text-5xl font-bold mb-4">{content.creatorSection.title}</h2>
                    <p className="text-xl max-w-[500px] mb-8 text-gray-200 leading-relaxed font-semibold">
                      {content.creatorSection.text}
                    </p>
                    <HoverButton className="px-8 py-3 bg-white text-black rounded font-bold w-fit border-none">
                      {content.creatorSection.button}
                    </HoverButton>
                  </div>
               </div>
            </div>

            {/* CTA SECTION */}
            <section className="flex flex-col items-center py-24 text-center">
              <h1 className="text-4xl font-semibold mb-4 tracking-tight">
                Thanks for listening. Now join in.
              </h1>
              <p className="text-base font-semibold text-gray-300 mb-8">
                Save tracks, follow artists and build playlists. All for free.
              </p>
              <HoverButton
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-black px-12 py-4 text-xl font-bold rounded border-none transition-transform hover:scale-105"
              >
                Create account
              </HoverButton>

              <div className="flex items-center gap-2 mt-6 text-gray-400 text-sm">
                <span>Already have an account?</span>
                <HoverButton
                  onClick={() => setIsModalOpen(true)}
                  className="bg-transparent text-white font-bold border-none p-0 hover:text-gray-200"
                >
                  Sign in
                </HoverButton>
              </div>
            </section>

          </div>

          <footer className="mt-12 pt-12 border-t border-gray-800 text-center">
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-6">
              {content.footerLinks.map((link) => (
                <span key={link} className="text-gray-500 text-[13px] hover:text-white transition-colors cursor-pointer">
                  {link}
                </span>
              ))}
            </nav>
            <p className="text-[11px] text-gray-600 tracking-wide uppercase">© 2026 SoundCloud Clone Project</p>
          </footer>
        </main>
      </div>
    </>
  );
}