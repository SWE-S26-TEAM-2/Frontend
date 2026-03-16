// src/app/[username]/components/Waveform.tsx

interface IWaveformProps {
  data: number[];
  playedPercent?: number;
  height?: number;
}

export function Waveform({ data, playedPercent = 0, height = 52 }: IWaveformProps) {
  const played = Math.floor(data.length * playedPercent);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height, cursor: "pointer", flex: 1 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          width: 2,
          height: Math.max(2, v * height),
          borderRadius: 1,
          flexShrink: 0,
          background: i < played ? "#ff5500" : "#3a3a3a",
        }}/>
      ))}
    </div>
  );
}