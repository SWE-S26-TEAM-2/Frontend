// src/components/Track/TrackCover.tsx
import Image from "next/image";

export interface ITrackCoverProps {
  url?: string | null;
  size?: number;
  accentColor?: string;
  alt?: string;
}

export function TrackCover({ url = null, size = 130, accentColor = "#1a1a2e", alt = "cover" }: ITrackCoverProps) {
  return (
    <div
      className="shrink-0 rounded-sm overflow-hidden flex items-center justify-center relative"
      style={{
        width: size,
        height: size,
        background: url ? "transparent" : `linear-gradient(135deg, ${accentColor}, #0a0a0a)`,
      }}
    >
      {url ? (
        <Image src={url} alt={alt} width={size} height={size} style={{ objectFit: "cover" }}/>
      ) : (
        <svg width={size * 0.28} height={size * 0.28} viewBox="0 0 24 24" fill="#ffffff15">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      )}
    </div>
  );
}