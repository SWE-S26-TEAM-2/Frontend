"use client";

// Audio playback is fully managed by Footer.tsx (audio element + all store hooks).
// This component is mounted in Providers to satisfy the import but intentionally
// renders nothing — removing it from Providers would leave orphan pages without
// a player, while keeping the audio logic here would create a second <audio>
// element that fights with Footer's and causes a currentTime feedback loop.
export default function GlobalPlayer() {
  return null;
}
