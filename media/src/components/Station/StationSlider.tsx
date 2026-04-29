"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import StationCard from "@/components/Station/StationCard";
import type { IStation } from "@/types/station.types";
import type { IStationSliderProps } from "@/types/station.types";



// How many cards visible at once — must match the CSS width calc below
const VISIBLE = 5;
// Gap between cards in px — must match gap style below
const GAP_PX  = 16;

export default function StationSlider({ title, subtitle, stations }: IStationSliderProps) {
  const [index, setIndex]           = useState(0);
  const [peekOffset, setPeekOffset] = useState(0);
  const peekTimer                   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelBuffer                 = useRef(0);
  const containerRef                = useRef<HTMLDivElement>(null);

  const maxIndex = Math.max(0, stations.length - VISIBLE);

  const nextPage = () => { setIndex((i) => Math.min(i + VISIBLE, maxIndex)); setPeekOffset(0); };
  const prevPage = () => { setIndex((i) => Math.max(i - VISIBLE, 0)); setPeekOffset(0); };

  const handlePeek = (offset: number) => {
    setPeekOffset(offset);
    if (peekTimer.current) clearTimeout(peekTimer.current);
    peekTimer.current = setTimeout(() => setPeekOffset(0), 500);
  };

  useEffect(() => () => { if (peekTimer.current) clearTimeout(peekTimer.current); }, []);

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
    if (diff > 50) prevPage();
    if (diff < -50) nextPage();
    isDragging.current = false;
  };

  // Trackpad
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: Event) => {
      const ev = e as WheelEvent;
      if (Math.abs(ev.deltaX) < Math.abs(ev.deltaY)) return;
      wheelBuffer.current += ev.deltaX;
      if (wheelBuffer.current > 80)  { nextPage(); wheelBuffer.current = 0; }
      if (wheelBuffer.current < -80) { prevPage(); wheelBuffer.current = 0; }
    };
    container.addEventListener("wheel", handleWheel as EventListener, { passive: true });
    return () => container.removeEventListener("wheel", handleWheel as EventListener);
  }, []);

  const activePeek =
    (index === 0 && peekOffset > 0) || (index === maxIndex && peekOffset < 0)
      ? 0 : peekOffset;

  // Each card width = (100% - gaps between VISIBLE cards) / VISIBLE
  // e.g. 5 cards, 4 gaps: (100% - 4*16px) / 5
  const cardWidth   = `calc((100% - ${(VISIBLE - 1) * GAP_PX}px) / ${VISIBLE})`;
  // Step per page = one card width + one gap
  const stepPerCard = `calc((100% - ${(VISIBLE - 1) * GAP_PX}px) / ${VISIBLE} + ${GAP_PX}px)`;

  if (!stations.length) return null;

  return (
    <section style={{ width: "100%", marginBottom: 4 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <Link
            href="/stations"
            style={{
              color:          "#fff",
              fontSize:       20,
              fontWeight:     600,
              textDecoration: "none",
              transition:     "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ff5500")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
          >
            {title}
          </Link>
          <p style={{ color: "#a3a3a3", fontSize: 14, margin: "2px 0 0" }}>{subtitle}</p>
        </div>
        <Link
          href="/stations"
          style={{ color: "#ff5500", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
        >
          See all →
        </Link>
      </div>

      {/* Slider root */}
      <div
        ref={containerRef}
        style={{ position: "relative" }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Prev button */}
        {index > 0 && (
          <button
            onClick={prevPage}
            onMouseEnter={() => handlePeek(30)}
            style={{
              position:       "absolute",
              left:           -16,
              top:            "40%",
              transform:      "translateY(-50%)",
              zIndex:         40,
              width:          32,
              height:         32,
              borderRadius:   "50%",
              background:     "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              border:         "none",
              color:          "#fff",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              cursor:         "pointer",
            }}
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Next button */}
        {index < maxIndex && (
          <button
            onClick={nextPage}
            onMouseEnter={() => handlePeek(-30)}
            style={{
              position:       "absolute",
              right:          -16,
              top:            "40%",
              transform:      "translateY(-50%)",
              zIndex:         40,
              width:          32,
              height:         32,
              borderRadius:   "50%",
              background:     "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              border:         "none",
              color:          "#fff",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              cursor:         "pointer",
            }}
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Track */}
        <div style={{ overflow: "hidden", paddingBottom: 16 }}>
          <div
            style={{
              display:    "flex",
              gap:        GAP_PX,
              transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
              transform:  `translateX(calc(-${index} * (${stepPerCard}) + ${activePeek}px))`,
            }}
          >
            {stations.map((station) => (
              <div
                key={station.id}
                style={{
                  flex:      `0 0 ${cardWidth}`,
                  width:     cardWidth,
                  minWidth:  0,        // prevents flex children from overflowing
                  maxWidth:  cardWidth,
                }}
              >
                <StationCard station={station} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>  
  );
}
