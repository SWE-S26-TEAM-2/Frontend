// src/components/WaveForm/Waveform.tsx

interface IWaveformProps {
  data: number[];
  playedPercent?: number;
  height?: number;
}

export function Waveform({ data, playedPercent = 0, height = 52 }: IWaveformProps) {
  const played = Math.floor(data.length * playedPercent);
  return (
    <div className="flex items-end gap-px cursor-pointer flex-1" style={{ height }}>
      {data.map((v, i) => (
        <div
          key={i}
          className="shrink-0 rounded-sm"
          style={{
            width: 2,
            height: Math.max(2, v * height),
            background: i < played ? "#ff5500" : "#3a3a3a",
          }}
        />
      ))}
    </div>
  );
}