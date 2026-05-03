"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TrackCard2 from "@/components/Track/TrackCard2";
import type { ITrack } from "@/types/track.types";

interface ITrackSliderProps {
  title:       string;
  subtitle?:   string;
  tracks:      ITrack[];
  showFollow?: boolean;
  onPlay?:     (track: ITrack) => void;
}

const VISIBLE  = 5;
const GAP_PX   = 16;
// Extra horizontal space so the nav arrows are never clipped by the page edge
const ARROW_BLEED = 20; // px each side

export default function TrackSlider({
  title,
  subtitle,
  tracks,
  showFollow = true,
  onPlay,
}: ITrackSliderProps) {
  const [index,       setIndex]       = useState(0);
  const [peekOffset,  setPeekOffset]  = useState(0);
  const peekTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelBuffer  = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxIndex = Math.max(0, tracks.length - VISIBLE);

  const nextPage = useCallback(() => {
    setIndex((i) => Math.min(i + VISIBLE, maxIndex));
    setPeekOffset(0);
  }, [maxIndex]);

  const prevPage = useCallback(() => {
    setIndex((i) => Math.max(i - VISIBLE, 0));
    setPeekOffset(0);
  }, []);

  const handlePeek = (offset: number) => {
    setPeekOffset(offset);
    if (peekTimer.current) clearTimeout(peekTimer.current);
    peekTimer.current = setTimeout(() => setPeekOffset(0), 500);
  };

  useEffect(() => () => {
    if (peekTimer.current) clearTimeout(peekTimer.current);
  }, []);

  // Mouse drag
  const startX     = useRef(0);
  const isDragging = useRef(false);
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    isDragging.current = true;
    startX.current = e.clientX;
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const diff = e.clientX - startX.current;
    if (diff >  50) prevPage();
    if (diff < -50) nextPage();
    isDragging.current = false;
  };

  // Trackpad / horizontal scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      wheelBuffer.current += e.deltaX;
      if (wheelBuffer.current >  80) { nextPage(); wheelBuffer.current = 0; }
      if (wheelBuffer.current < -80) { prevPage(); wheelBuffer.current = 0; }
    };
    container.addEventListener("wheel", handleWheel, { passive: true });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [nextPage, prevPage]);

  const activePeek =
    (index === 0 && peekOffset > 0) || (index === maxIndex && peekOffset < 0)
      ? 0
      : peekOffset;

  const cardWidth   = `calc((100% - ${(VISIBLE - 1) * GAP_PX}px) / ${VISIBLE})`;
  const stepPerCard = `calc((100% - ${(VISIBLE - 1) * GAP_PX}px) / ${VISIBLE} + ${GAP_PX}px)`;

  if (!tracks.length) return null;

  return (
    <section style={{ width: "100%", marginBottom: 40 }}>

      {/* Header */}
      {(title || subtitle) && (
        <div style={{ marginBottom: 20 }}>
          {title && (
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 600, margin: 0 }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p style={{ color: "#a3a3a3", fontSize: 14, margin: "4px 0 0" }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/*
        Outer wrapper: adds horizontal padding equal to ARROW_BLEED so arrows
        sit inside the layout flow and are never half-hidden behind the page edge.
        The negative margin on the inner div compensates so cards still reach
        the full intended width.
      */}
      <div style={{ paddingLeft: ARROW_BLEED, paddingRight: ARROW_BLEED }}>
        <div
          ref={containerRef}
          style={{ position: "relative" }}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Prev arrow */}
          {index > 0 && (
            <button
              onClick={prevPage}
              onMouseEnter={() => handlePeek(30)}
              aria-label="Previous"
              style={{
                position:        "absolute",
                left:            -ARROW_BLEED,
                top:             "40%",
                transform:       "translateY(-50%)",
                zIndex:          40,
                width:           32,
                height:          32,
                borderRadius:    "50%",
                background:      "rgba(0,0,0,0.7)",
                backdropFilter:  "blur(8px)",
                border:          "none",
                color:           "#fff",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                cursor:          "pointer",
                boxShadow:       "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Next arrow */}
          {index < maxIndex && (
            <button
              onClick={nextPage}
              onMouseEnter={() => handlePeek(-30)}
              aria-label="Next"
              style={{
                position:        "absolute",
                right:           -ARROW_BLEED,
                top:             "40%",
                transform:       "translateY(-50%)",
                zIndex:          40,
                width:           32,
                height:          32,
                borderRadius:    "50%",
                background:      "rgba(0,0,0,0.7)",
                backdropFilter:  "blur(8px)",
                border:          "none",
                color:           "#fff",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                cursor:          "pointer",
                boxShadow:       "0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Scrolling track */}
          <div style={{ overflow: "hidden", paddingBottom: 16 }}>
            <div
              style={{
                display:    "flex",
                gap:        GAP_PX,
                transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
                transform:  `translateX(calc(-${index} * (${stepPerCard}) + ${activePeek}px))`,
              }}
            >
              {tracks.map((track, i) => (
                <div
                  key={`${track.id}-${i}`}
                  style={{
                    flex:     `0 0 ${cardWidth}`,
                    width:    cardWidth,
                    minWidth: 0,
                    maxWidth: cardWidth,
                  }}
                >
                  <TrackCard2
                    track={track}
                    showFollow={showFollow}
                    onPlay={onPlay}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
