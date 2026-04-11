"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import TrackCard2 from "./TrackCard2";

import {  IExtendedSliderProps } from "@/types/trending.types"; 

export default function TrackSlider({ title, subtitle, tracks, showFollow = true }: IExtendedSliderProps) {
  const [index, setIndex] = useState(0);
  const [peekOffset, setPeekOffset] = useState(0); 
  const peekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const visible = 5; 
  const maxIndex = Math.max(0, tracks.length - visible);

  const nextPage = () => {
    setIndex((i) => Math.min(i + visible, maxIndex));
    setPeekOffset(0);
  };
  const prevPage = () => {
    setIndex((i) => Math.max(i - visible, 0));
    setPeekOffset(0);
  };

  const handlePeek = (offset: number) => {
    setPeekOffset(offset);
    if (peekTimer.current) clearTimeout(peekTimer.current);
    peekTimer.current = setTimeout(() => {
      setPeekOffset(0);
    }, 500); 
  };

  useEffect(() => {
    return () => {
      if (peekTimer.current) clearTimeout(peekTimer.current);
    };
  }, []);

  const activePeek = 
    (index === 0 && peekOffset > 0) || (index === maxIndex && peekOffset < 0) 
      ? 0 
      : peekOffset;

  const startX = useRef(0);
  const isDragging = useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
    return;
  }
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const diff = e.clientX - startX.current;

    if (diff > 50) prevPage();
    if (diff < -50) nextPage();

    isDragging.current = false;
  };

  return (
    <section className="w-full mb-1">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-white text-xl font-semibold">{title}</h2>
          <p className="text-neutral-400 text-sm">{subtitle}</p>
        </div>
      </div>

      <div
        className="relative"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {index > 0 && (
          <button
            onClick={prevPage}
            onMouseEnter={() => handlePeek(30)}
            className="absolute -left-4 top-[40%] -translate-y-1/2 z-40 w-8 h-8 rounded-full bg-black/60 backdrop-blur-xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {index < maxIndex && (
          <button
            onClick={nextPage}
            onMouseEnter={() => handlePeek(-30)} 
            className="absolute -right-4 top-[40%] -translate-y-1/2 z-40 w-8 h-8 rounded-full bg-black/60 backdrop-blur-xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        )}

        <div className="overflow-x-clip overflow-y-visible pb-4">
          <div
            className="flex gap-8 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ 
              transform: `translateX(calc(-${index} * (20% + 6.4px) + ${activePeek}px))` 
            }}
          >
            {tracks.map((track) => (
              <div key={track.id} className="flex-[0_0_calc(20%-25.6px)]">
                {/* Passed showFollow down to the card */}
                <TrackCard2 track={track} showFollow={showFollow} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}