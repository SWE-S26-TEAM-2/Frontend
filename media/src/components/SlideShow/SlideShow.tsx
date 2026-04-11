'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoginModal from "@/components/LoginModal/LoginModal";
import HoverButton from "@/components/HoverButton/HoverButton";
import { LandingApiService } from "@/services/api/landing.api";
import { ISlideData } from "@/types/landing.types";
import { SLIDESHOW_SETTINGS } from "@/constants/slideshow.constants";

export default function SlideShow() {
  const router = useRouter();
  const [slides, setSlides] = useState<ISlideData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredArtistId, setHoveredArtistId] = useState<number | null>(null);

  useEffect(() => {
    LandingApiService.getSliderContent().then((data) => {
      setSlides(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (slides.length === 0 || !SLIDESHOW_SETTINGS.INTERVAL) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, SLIDESHOW_SETTINGS.INTERVAL);

    return () => clearInterval(timer);
  }, [slides]);

  if (loading) {
    return (
      <div className="w-[1200px] h-[450px] mx-auto flex items-center justify-center bg-[#222] rounded-xl text-white">
        <span className="animate-pulse tracking-widest uppercase text-sm">Loading amazing sounds...</span>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <>
      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}
      
      <div className="relative w-[1200px] h-[450px] mx-auto overflow-hidden rounded-xl bg-black group shadow-2xl">
        {/* Next.js Optimized Image */}
        <Image 
          src={currentSlide.image} 
          alt={currentSlide.artistName} 
          fill
          className="object-cover object-top transition-opacity duration-700 ease-in-out"
          priority
        />

        {/* Text & Content Overlay - Shifted Left */}
        <div className="absolute inset-0 flex flex-col justify-center pb-10 bg-black/20">
          <div className="text-left w-full pl-16 pt-20"> {/* Changed pl-16 to move text left */}
            <div className="mb-4">
              {currentSlide.titles.map((text) => (
                <h2 key={text} className="text-[56px] font-bold leading-[1.05] text-white drop-shadow-2xl">
                  {text}
                </h2>
              ))}
            </div>
            <p className="text-[19px] max-w-[600px] leading-snug font-medium text-white/90 drop-shadow-md">
              {currentSlide.description}
            </p>
            
            <HoverButton 
              onClick={() => setIsModalOpen(true)} 
              className="bg-white text-black w-[170px] rounded-md mt-8 py-2.5 font-bold border-none transition-transform hover:scale-105"
            >
              {currentSlide.buttonText}
            </HoverButton>
          </div>

          {/* Artist Info Tag */}
          <div className="absolute bottom-8 right-12 flex flex-col items-end text-right z-20">
            <h5 
              onMouseEnter={() => setHoveredArtistId(currentSlide.id)} 
              onMouseLeave={() => setHoveredArtistId(null)}
              onClick={() => router.push(currentSlide.artistRoute)}
              className={`cursor-pointer text-base font-bold text-white transition-all ${hoveredArtistId === currentSlide.id ? 'underline underline-offset-4' : ''}`}
            >
              {currentSlide.artistName}
            </h5>
            <span className="text-[10px] uppercase tracking-wider text-white/60">SoundCloud Artist Pro</span>
          </div>
        </div>

        {/* Custom Navigation Dots (Indicators) */}
        {SLIDESHOW_SETTINGS.INDICATORS && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {slides.map((_, i) => (
              <button 
                key={`slide-dot-${i}`}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === i ? 'bg-white w-8' : 'bg-white/30 w-2 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}