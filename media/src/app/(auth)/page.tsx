"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SlideShow from "../../components/SlideShow/SlideShow";
import LoginModal from "@/components/LoginModal/LoginModal";
import HoverButton from "@/components/HoverButton/HoverButton";
import { LandingApiService } from "@/services/api/landing.api";
import { ILandingData } from "@/types/landing.types";
import type { ITrack } from "@/types/track.types";
import TrackSlider from "@/components/Track/TrackSlider";
import SearchBar from "@/components/Search/SearchBar";
import { usePlayerStore } from "@/store/playerStore";
import { realTrackService } from "@/services/api/trackService";
import Footer from "@/components/Footer/Footer";



export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [content, setContent] = useState<ILandingData | null>(null);
  const [tracks, setTracks] = useState<ITrack[]>([]);
  const pendingTrack = useRef<ITrack | null>(null);          // ← add
  const { setTrack, togglePlay } = usePlayerStore();


  // Called when user clicks play on a track card
  const handleTrackPlay = (track: ITrack) => {
    // If this track is already loaded in the player, just toggle play/pause
    // without opening the modal — the user already "paid" with the modal once
    const currentTrack = usePlayerStore.getState().currentTrack;
    const isPlaying = usePlayerStore.getState().isPlaying;

    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }
    // Fresh play attempt — show modal first
    pendingTrack.current = track;
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
  setIsModalOpen(false);
  if (pendingTrack.current) {
    const track = pendingTrack.current;
    pendingTrack.current = null;
    console.log("Setting track:", track.title); // ← add this temporarily
    setTrack(track);
    void realTrackService.postTrack(track.id).catch(() => {});
  }
};





  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem("auth_token")) {
      router.push("/stream");
    }
    LandingApiService.getLandingData().then(setContent);
    LandingApiService.getTrendingTracks().then(setTracks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!content) return <div className="bg-[#141212] min-h-screen" />;

  return (
    <>
      {isModalOpen && <LoginModal onClose={handleModalClose} />}
 <Footer />   {/* ← add this */}
    
    <div className="bg-[#141212] ...">
      ...
    </div>
      <div className="bg-[#141212] min-h-screen flex justify-center text-white pb-20 selection:bg-orange-500 selection:text-white">
        <main className="px-6 md:px-12 py-10 w-full max-w-[1400px]">


          <div className="flex flex-col items-center">
            <div className="relative w-full flex justify-center">
              <SlideShow />
            </div>

            {/* Search Input Area */}
            <div className="mt-10 w-full flex justify-center">
              <div className="flex items-center w-full max-w-[700px] gap-4">

                {/* SearchBar */}
                <div className="flex-1 flex items-center">
                  <SearchBar />
                </div>

                {/* OR */}
                <div className="flex items-center justify-center h-[46px] min-w-[40px]">
                  <span className="text-gray-400 text-sm font-medium tracking-wide ">
                    or
                  </span>
                </div>

                {/* Button */}
                <HoverButton
                  onClick={() => router.push('/Upload')}
                  className="h-[46px] px-5 bg-white text-black rounded-md font-semibold flex items-center justify-center text-[14px] whitespace-nowrap"
                >
                  Upload your own
                </HoverButton>

              </div>
            </div>
            <section className="mt-16 text-center">
              <h2 className="text-3xl font-medium mb-8">{content.trendingTagline}</h2>


              <TrackSlider
                title=""
                subtitle=""
                tracks={tracks.slice(0, 5)} 
                showFollow={true}
                onPlay={handleTrackPlay}
              />
              <HoverButton
                onClick={() => router.push('/trending')}
                className="px-5 py-[14px] bg-white text-black rounded font-bold text-base border-none"
              >
                Explore trending playlists
              </HoverButton>
            </section>

            {/* --- ZERO GAP IMAGE SECTION --- */}
            <div className="mt-20 w-full max-w-[1200px] mx-auto flex flex-col px-4 md:px-0">               {/* Top Image (Ad) */}
              <Image
                src="/ad.png"
                alt="Ad"
                width={1200}
                height={200}
                className="w-full h-auto rounded-t-lg shadow-lg hover:brightness-110 transition-all cursor-pointer block"
              />

              {/* Bottom Image (Creator Section) - Margin set to 0 to remove gap */}
              <div className="relative w-full rounded-b-xl overflow-hidden shadow-2xl">
                <Image
                  src="/beffooter.png"
                  alt="Creator Background"
                  width={1200}
                  height={450}
                  className="w-full h-auto object-cover block"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center px-6 md:px-16">
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight max-w-[90%] md:max-w-none">
                    {content.creatorSection.title}
                  </h2>
                  <p className="text-sm md:text-base lg:text-xl w-full max-w-[280px] md:max-w-[500px] mb-8 text-gray-200 leading-relaxed font-semibold">
                    {content.creatorSection.text}
                  </p>
                  <HoverButton className="px-8 py-3 bg-white text-black rounded font-bold w-fit border-none">
                    {content.creatorSection.button}
                  </HoverButton>
                </div>
              </div>
            </div>

            {/* CTA SECTION */}
            <section className="flex flex-col items-center py-28 text-center">
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