"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Heart, MoreHorizontal, ListMusic, PlusSquare, UserPlus } from "lucide-react";
import { IRecentItem } from "../../types/home.types";

// ─── Dropdown Menu (Portal) ──────────────────────────────
const MoreMenu = ({ onClose, anchorRect }: { onClose: () => void; anchorRect: DOMRect }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: anchorRect.bottom + 8,
        left: anchorRect.left - 120,
        zIndex: 9999,
      }}
      className="w-40 bg-neutral-900 border border-neutral-800 rounded shadow-xl overflow-hidden"
    >
      {[
        { icon: <ListMusic size={14} />, label: "Add to Next up" },
        { icon: <PlusSquare size={14} />, label: "Add to playlist" },
      ].map((item, i) => (
        <button
          key={i}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white transition text-left bg-transparent border-none cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
};

// ─── Recent Card Component ───────────────────────────────
const RecentCard = ({ item }: { item: IRecentItem }) => {
  const isArtist = item.type === "artist";
  
  // State Initialization (Type Safe)
  const [isLiked, setIsLiked] = useState(item.type === 'track' ? (item.isLiked || false) : false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);

  // Derived properties based on Type Narrowing
  const displayImage = item.type === "artist" ? item.imageUrl : item.albumArt;
  const mainTitle = item.type === "artist" ? item.name : item.title;
  const subText = item.type === "artist" ? `${item.followers} followers` : item.artist;

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (moreBtnRef.current) {
      setAnchorRect(moreBtnRef.current.getBoundingClientRect());
    }
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="group w-[160px] flex-shrink-0 flex flex-col gap-2 relative">
      {/* IMAGE SECTION */}
      <div 
        style={{ borderRadius: isArtist ? "50%" : "4px" }}
        className="relative aspect-square overflow-hidden bg-neutral-800 cursor-pointer"
      >
        <img 
          src={displayImage || "/test.png"} 
          alt={mainTitle} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        
        {/* Track-Only Overlays */}
        {item.type === "track" && (
          <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
            <button
              onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
              className={`p-1.5 rounded bg-black/60 backdrop-blur-sm border-none cursor-pointer transition-transform hover:scale-110 ${isLiked ? 'text-orange-500' : 'text-white'}`}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            </button>

            <button
              ref={moreBtnRef}
              onClick={handleMoreClick}
              className={`p-1.5 rounded bg-black/60 backdrop-blur-sm border-none cursor-pointer transition-transform hover:scale-110 text-white ${menuOpen ? 'bg-orange-500' : ''}`}
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        )}
      </div>

      {/* TEXT SECTION */}
      <div className={`flex flex-col ${isArtist ? 'items-center text-center' : 'items-start text-left'}`}>
        <span className="text-sm font-semibold text-white truncate w-full cursor-pointer hover:text-orange-500 transition-colors">
          {mainTitle}
        </span>
        <span className="text-xs text-neutral-400 hover:text-white cursor-pointer transition-colors">
          {subText}
        </span>

        {/* Artist-Only Follow Button */}
        {item.type === "artist" && (
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFollowing(!isFollowing); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded border text-[11px] font-bold cursor-pointer transition-all ${
                isFollowing 
                ? 'bg-orange-500 border-orange-500 text-white' 
                : 'bg-transparent border-neutral-600 text-white hover:border-white'
              }`}
            >
              <UserPlus size={12} />
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        )}
      </div>

      {menuOpen && anchorRect && (
        <MoreMenu anchorRect={anchorRect} onClose={() => setMenuOpen(false)} />
      )}
    </div>
  );
};

export default function RecentlyPlayedGrid({ items }: { items: IRecentItem[] }) {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-white mb-5">Recently Played</h2>
      <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
        {items.map((item) => (
          <RecentCard key={item.id} item={item} />
        ))}
      </div>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}