// src/app/[username]/components/TrackCover.tsx

export interface ITrackCoverProps {
  url?: string | null;
  size?: number;
  accentColor?: string;
  alt?: string;
}

export function TrackCover({
  url = null,
  size = 130,
  accentColor = "#1a1a2e",
  alt = "cover",
}: ITrackCoverProps) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0, borderRadius: 2,
      background: url ? "transparent" : `linear-gradient(135deg, ${accentColor}, #0a0a0a)`,
      overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {url ? (
        <img src={url} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
      ) : (
        <svg width={size * 0.28} height={size * 0.28} viewBox="0 0 24 24" fill="#ffffff15">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      )}
    </div>
  );
}