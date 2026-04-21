'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await LandingApiService.getSliderContent();
        if (!data || data.length === 0) {
          setError("No slides available");
        } else {
          setSlides(data);
        }
      } catch {
        setError("Failed to load slides");
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    if (!slides.length || isPaused) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, SLIDESHOW_SETTINGS.INTERVAL || 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slides, isPaused]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1240px] h-[450px] mx-auto flex items-center justify-center bg-[#222] rounded-xl text-white">
        <span className="animate-pulse tracking-widest uppercase text-sm">
          Loading amazing sounds...
        </span>
      </div>
    );
  }

  if (error || slides.length === 0) {
    return (
      <div className="w-full max-w-[1240px] h-[450px] mx-auto flex items-center justify-center bg-black text-white rounded-xl">
        {error || "No content available"}
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <>
      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}

      <div
        className="relative w-full max-w-[1240px] h-[450px] mx-auto overflow-hidden rounded-xl bg-black group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >

        {/* ✅ NEW: Top Gradient */}
        <div className="absolute top-0 left-0 w-full h-[120px] bg-gradient-to-b from-black/70 via-black/40 to-transparent z-30 pointer-events-none" />

        {/* ✅ NEW: Pixel-perfect Header */}
        <div className="absolute top-0 left-0 w-full z-40 flex items-center justify-between px-6 md:px-10 py-5">

          {/* LEFT: Logo */}
          <div
            onClick={() => router.push("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Image
  src="/logo1.png"
  alt="SoundCloud"
  width={32}
  height={32}
  className="object-contain"
/>
           <span className="text-white text-[16px] md:text-[17px] font-semibold tracking-tight">
  SoundCloud
</span>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3 md:gap-4">

            <HoverButton
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-black text-[13px] md:text-[14px] font-semibold px-4 py-[6px] rounded-md hover:opacity-90 transition"
            >
              Sign in
            </HoverButton>

            <HoverButton
              onClick={() => setIsModalOpen(true)}
              className="bg-[#ff5500] hover:bg-[#ff3300] text-white text-[13px] md:text-[14px] font-semibold px-4 py-[6px] rounded-md transition"
            >
              Create account
            </HoverButton>

            <HoverButton
              onClick={() => router.push("/for-artists")}
              className="bg-transparent text-white text-[13px] md:text-[14px] font-medium px-2 hover:underline underline-offset-4 transition"
            >
              For Artists
            </HoverButton>

          </div>
        </div>

        {/* Background Image */}
        <Image
          src={currentSlide.image}
          alt={currentSlide.artistName}
          fill
          sizes="(max-width: 768px) 100vw, 1240px"
          className="object-cover transition-opacity duration-700"
          priority
        />

        {/* Content */}
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-center px-6 md:px-16">
          <div className="max-w-[600px]">
            {currentSlide.titles.map((text, idx) => (
              <h2
                key={`${text}-${idx}`}
                className="text-[32px] md:text-[56px] font-bold text-white"
              >
                {text}
              </h2>
            ))}

            <p className="mt-3 text-white/90">
              {currentSlide.description}
            </p>

            <HoverButton
              onClick={() => setIsModalOpen(true)}
              className="mt-6 bg-white text-black px-6 py-2 rounded-md font-bold"
            >
              {currentSlide.buttonText}
            </HoverButton>
          </div>

          <div className="absolute bottom-8 right-10 text-right">
            <h5
              onClick={() => router.push(currentSlide.artistRoute)}
              className="cursor-pointer font-bold text-white hover:underline"
            >
              {currentSlide.artistName}
            </h5>
            <span className="text-xs text-white/60">
              SoundCloud Artist Pro
            </span>
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 px-3 py-2 rounded-full text-white"
        >
          ‹
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 px-3 py-2 rounded-full text-white"
        >
          ›
        </button>

        {/* Indicators */}
        {SLIDESHOW_SETTINGS.INDICATORS && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${currentIndex === i
                    ? "bg-white w-6"
                    : "bg-white/40 w-2"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}