import Image from "next/image";
import type { ReactNode } from "react";

interface ICoverBoxProps {
  url: string | null;
  alt: string;
  accentColor?: string;
  size?: number;
  rounded?: boolean;
  showPlayOverlay?: boolean;
  children?: ReactNode;
}

export function CoverBox({
  url,
  alt,
  accentColor,
  size = 160,
  rounded = false,
  showPlayOverlay = false,
  children,
}: ICoverBoxProps) {
  return (
    <div
      className={`shrink-0 overflow-hidden flex items-center justify-center relative ${rounded ? "rounded-full" : "rounded-sm"}`}
      style={{ width: size, height: size, minWidth: size, background: accentColor ?? "#1a1a1a" }}
    >
      {url
        ? <Image src={url} alt={alt} fill className="object-cover" />
        : children
      }
      {showPlayOverlay && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          <div className="w-10 h-10 rounded-full bg-[#ff5500] flex items-center justify-center">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="white">
              <polygon points="6,4 20,12 6,20" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}